// Pure Native HTML5 & YouTube Dual-Deck Web Audio Engine for Aura Music (100% Ad-Free, Gapless & DJ Crossfade)
import { playback, np, audioFx } from './player.svelte';
import type { NowPlaying, QueueState, SongItem } from './api';
import { fetchSearch } from './ytmusic';
import { searchSaavnDirect, deduplicateSongs } from './saavn';
import { getApiUrl } from './apiBase';

declare global {
	interface Window {
		onYouTubeIframeAPIReady?: () => void;
		YT?: any;
	}
}

export function cleanSearchQuery(title: string, artists?: string): string {
	let cleanTitle = (title || '')
		.replace(/\(official\s*(music\s*)?(video|audio|lyric|visualizer|hd|4k|remastered)?\)/gi, '')
		.replace(/\[official\s*(music\s*)?(video|audio|lyric|visualizer|hd|4k|remastered)?\]/gi, '')
		.replace(/\|\s*[^|]+$/g, '')
		.replace(/(\(|\[)(feat\.|ft\.|with|prod\.)[^)\]]*(\)|\])/gi, '')
		.replace(/\s+/g, ' ')
		.trim();

	let cleanArtists = (artists || '')
		.replace(/^(video|song|album|artist|single|ep)\s*[•·|-]\s*/gi, '')
		.replace(/\s*[•·|-]\s*(\d+(\.\d+)?[KMB]?\s*(views|plays|subscribers)?|[\d:]+).*$/gi, '')
		.replace(/•.*$/g, '')
		.replace(/·.*$/g, '')
		.trim();

	const firstArtist = cleanArtists.split(/[,&/]/)[0]?.trim() || '';
	return `${cleanTitle} ${firstArtist}`.trim();
}

class WebPlayer {
	// Dual-Deck Hardware Audio System (Deck 0 and Deck 1)
	private decks: [HTMLAudioElement | null, HTMLAudioElement | null] = [null, null];
	private deckGains: [GainNode | null, GainNode | null] = [null, null];
	private lowFilter: BiquadFilterNode | null = null;
	private midFilter: BiquadFilterNode | null = null;
	private highFilter: BiquadFilterNode | null = null;
	private masterGain: GainNode | null = null;
	private audioCtx: AudioContext | null = null;
	private analyser: AnalyserNode | null = null;
	private sourceNodes: Map<HTMLAudioElement, MediaElementAudioSourceNode> = new Map();
	private freqArray: Uint8Array | null = null;
	private timeArray: Uint8Array | null = null;
	private smoothedFreq: Float32Array = new Float32Array(64);
	private smoothedTime: Float32Array = new Float32Array(64);
	private prevBass = 0;
	private beatDecay = 0;

	private activeDeckIndex: 0 | 1 = 0;
	private ytPlayer: any = null;
	private ytReady = false;
	private currentItem: SongItem | null = null;
	private preloadedItem: SongItem | null = null;
	private preloadedIndex: number | null = null;
	private isPreloading = false;
	private isCrossfading = false;
	private crossfadeInterval: any = null;
	private progressInterval: ReturnType<typeof setInterval> | null = null;
	private isRadioStream = false;
	private usingDirectAudio = false;
	private pendingVideoId: string | null = null;
	private wakeLock: any = null;
	private unlocked = false;

	private get activeAudio(): HTMLAudioElement | null {
		return this.decks[this.activeDeckIndex];
	}

	private get standbyAudio(): HTMLAudioElement | null {
		return this.decks[(1 - this.activeDeckIndex) as 0 | 1];
	}

	init() {
		if (typeof window === 'undefined') return;

		// Document-wide one-time gesture unlock for unblocked web audio autoplay on mobile & desktop
		if (!this.unlocked) {
			const unlockEngine = () => {
				this.unlocked = true;
				if (this.audioCtx && this.audioCtx.state === 'suspended') {
					this.audioCtx.resume().catch(() => {});
				}
				window.removeEventListener('pointerdown', unlockEngine);
				window.removeEventListener('click', unlockEngine);
				window.removeEventListener('keydown', unlockEngine);
				window.removeEventListener('touchstart', unlockEngine);
			};
			window.addEventListener('pointerdown', unlockEngine, { once: true, passive: true });
			window.addEventListener('click', unlockEngine, { once: true });
			window.addEventListener('keydown', unlockEngine, { once: true });
			window.addEventListener('touchstart', unlockEngine, { once: true, passive: true });
		}

		// 1. Initialize Dual-Deck HTML5 Audio with native hardware audio pipeline
		if (!this.decks[0] || !this.decks[1]) {
			this.decks[0] = new Audio();
			this.decks[1] = new Audio();

			this.decks.forEach((deck, deckIdx) => {
				if (!deck) return;
				deck.preload = 'auto';
				deck.crossOrigin = 'anonymous';
				deck.muted = false;
				const userVol = Math.max(0.001, Math.min(1, (playback.volume ?? 100) / 100));
				deck.volume = deckIdx === 0 ? userVol : 0;

				deck.addEventListener('play', () => {
					if (deckIdx === this.activeDeckIndex) {
						playback.paused = false;
						this.startProgress();
						this.updateMediaSessionState('playing');
					}
				});

				deck.addEventListener('pause', () => {
					if (deckIdx === this.activeDeckIndex && (this.usingDirectAudio || this.isRadioStream) && !this.isCrossfading) {
						playback.paused = true;
						this.stopProgress();
						this.updateMediaSessionState('paused');
					}
				});

				deck.addEventListener('timeupdate', () => {
					if (deckIdx === this.activeDeckIndex && (this.usingDirectAudio || this.isRadioStream)) {
						playback.position = deck.currentTime || 0;
						playback.positionAt = performance.now();
						if (deck.duration && !isNaN(deck.duration) && deck.duration > 0) {
							playback.duration = deck.duration;
						}
						this.handleTransitionTick();
					}
				});

				deck.addEventListener('ended', () => {
					if (deckIdx === this.activeDeckIndex && !this.isCrossfading) {
						if (audioFx.playbackMode === 'gapless' && this.preloadedItem) {
							this.finalizeGapless();
						} else {
							this.next();
						}
					}
				});

				deck.addEventListener('error', (e) => {
					if (deckIdx === this.activeDeckIndex) {
						console.warn('[Aura Audio Playback Error]', deck.error, e);
						if (this.currentItem) {
							this.retryWithAlternativeStream(this.currentItem);
						}
					}
				});
			});

			// Mobile & tab background playback keeper: keep audio alive when phone is locked or app minimized
			if (typeof document !== 'undefined') {
				document.addEventListener('visibilitychange', () => {
					if (document.hidden) {
						const active = this.activeAudio;
						if (active && !playback.paused && active.paused && this.usingDirectAudio) {
							active.play().catch(() => {});
						}
						this.acquireWakeLock();
					} else {
						if (!playback.paused) {
							this.acquireWakeLock();
						}
					}
				});
			}

			this.setupMediaSession();
		}
	}

	private setDeckGain(deckIdx: 0 | 1, normalizedGain: number) {
		const clamped = Math.max(0, Math.min(1, normalizedGain));
		const userVol = Math.max(0.001, Math.min(1, (playback.volume ?? 100) / 100));
		const deck = this.decks[deckIdx];
		if (deck) {
			try {
				deck.muted = false;
				deck.volume = clamped * userVol;
			} catch {}
		}
		const gainNode = this.deckGains[deckIdx];
		if (gainNode && this.audioCtx) {
			try {
				gainNode.gain.setValueAtTime(clamped * userVol, this.audioCtx.currentTime);
			} catch {}
		}
	}

	private handleTransitionTick() {
		const active = this.activeAudio;
		if (!active || this.isRadioStream || !active.duration || isNaN(active.duration)) return;
		const curTime = active.currentTime || 0;
		const dur = active.duration;
		const rem = dur - curTime;
		const mode = audioFx.playbackMode;

		// 1. In Gapless or Crossfade mode, eager preload next track ahead of time (>3s in or <=35s remaining)
		if ((mode === 'gapless' || mode === 'crossfade') && (curTime >= 3 || rem <= 35) && rem > 0 && !this.isPreloading && !this.preloadedItem) {
			this.preloadNextTrack();
		}

		// 2. Crossfade overlap execution (smooth Equal-Power curve fade out current, fade in next across 3-12 seconds)
		if (mode === 'crossfade' && this.preloadedItem) {
			const standbyIdx = (1 - this.activeDeckIndex) as 0 | 1;
			const standby = this.decks[standbyIdx];
			if (standby) {
				const xfSecs = Math.max(3, Math.min(12, audioFx.crossfadeDuration || 5));

				if (rem <= xfSecs && !this.isCrossfading && rem > 0.3) {
					standby.currentTime = 0;
					this.setDeckGain(standbyIdx, 0);
					const playProm = standby.play();
					if (playProm !== undefined) {
						playProm
							.then(() => {
								this.startCrossfadeTimer(xfSecs);
							})
							.catch((e) => console.warn('[Crossfade standby play failed]', e));
					} else {
						this.startCrossfadeTimer(xfSecs);
					}
				}
			}
		}

		// 3. Gapless instantaneous handoff (trigger next exactly as current completes without network stall)
		if (mode === 'gapless' && this.preloadedItem && rem <= 0.08) {
			this.finalizeGapless();
		}
	}

	private startCrossfadeTimer(xfSecs: number) {
		if (this.crossfadeInterval) clearInterval(this.crossfadeInterval);
		this.isCrossfading = true;
		playback.crossfading = true;

		const startTime = performance.now();
		const totalMs = xfSecs * 1000;
		const activeIdx = this.activeDeckIndex;
		const standbyIdx = (1 - this.activeDeckIndex) as 0 | 1;

		this.crossfadeInterval = setInterval(() => {
			const elapsed = performance.now() - startTime;
			const p = Math.max(0, Math.min(1, elapsed / totalMs)); // 0.0 to 1.0

			// Equal-Power DJ Curve (Cos / Sin) for constant acoustic energy without perceived volume drop
			const activeGain = Math.cos(p * 0.5 * Math.PI);
			const standbyGain = Math.sin(p * 0.5 * Math.PI);

			this.setDeckGain(activeIdx, activeGain);
			this.setDeckGain(standbyIdx, standbyGain);

			if (p >= 1.0 || (this.activeAudio && (this.activeAudio.ended || this.activeAudio.paused))) {
				clearInterval(this.crossfadeInterval);
				this.crossfadeInterval = null;
				this.finalizeCrossfade();
			}
		}, 30);
	}

	private async preloadNextTrack() {
		const q = playback.queue;
		const nextIdx = q.currentIndex + 1;
		const next = q.items[nextIdx] || (q.repeat === 'all' && q.items.length > 0 ? q.items[0] : null);
		if (!next || this.isPreloading || this.preloadedItem) return;

		this.isPreloading = true;
		playback.preloading = true;
		try {
			const streamUrl = await this.resolveStreamUrl(next);
			const standbyIdx = (1 - this.activeDeckIndex) as 0 | 1;
			const standby = this.decks[standbyIdx];
			if (streamUrl && standby) {
				this.setDeckGain(standbyIdx, 0);
				standby.src = streamUrl;
				standby.load();
				this.preloadedItem = next;
				this.preloadedIndex = nextIdx < q.items.length ? nextIdx : 0;
			}
		} catch (e) {
			console.warn('[Preload Next Track Error]', e);
		} finally {
			this.isPreloading = false;
			playback.preloading = false;
		}
	}

	private finalizeCrossfade() {
		if (this.crossfadeInterval) {
			clearInterval(this.crossfadeInterval);
			this.crossfadeInterval = null;
		}

		const outgoingIdx = this.activeDeckIndex;
		const incomingIdx = (1 - this.activeDeckIndex) as 0 | 1;
		const outgoing = this.decks[outgoingIdx];
		const incoming = this.decks[incomingIdx];
		if (!outgoing || !incoming || !this.preloadedItem) return;

		this.isCrossfading = false;
		playback.crossfading = false;

		try {
			outgoing.pause();
			outgoing.currentTime = 0;
			this.setDeckGain(outgoingIdx, 0);
		} catch {}

		// Flip active deck pointer
		this.activeDeckIndex = incomingIdx;

		const nextItem = this.preloadedItem;
		const nextIdx = this.preloadedIndex ?? playback.queue.currentIndex + 1;
		this.preloadedItem = null;
		this.preloadedIndex = null;

		this.setDeckGain(incomingIdx, 1.0);

		playback.queue.currentIndex = nextIdx;
		this.currentItem = nextItem;

		const now: NowPlaying = {
			videoId: nextItem.video_id,
			title: nextItem.title,
			artists: nextItem.artists,
			artistId: nextItem.artist_id,
			artistRuns: nextItem.artist_runs,
			thumbnail: nextItem.thumbnail,
			duration: nextItem.duration || '0:00',
			streamClient: 'NATIVE_AUDIO',
			rating: nextItem.rating ?? 'indifferent',
			isVideo: nextItem.is_video ?? false
		};
		playback.now = now;
		playback.paused = false;
		playback.position = incoming.currentTime || 0;
		playback.duration = incoming.duration || 0;
		this.updateMediaSession(now);

		setTimeout(() => {
			if (!this.isCrossfading && !this.preloadedItem && (audioFx.playbackMode === 'crossfade' || audioFx.playbackMode === 'gapless')) {
				this.preloadNextTrack();
			}
		}, 3000);
	}

	private finalizeGapless() {
		const outgoingIdx = this.activeDeckIndex;
		const incomingIdx = (1 - this.activeDeckIndex) as 0 | 1;
		const outgoing = this.decks[outgoingIdx];
		const incoming = this.decks[incomingIdx];
		if (!outgoing || !incoming || !this.preloadedItem) return;

		try {
			outgoing.pause();
			outgoing.currentTime = 0;
			this.setDeckGain(outgoingIdx, 0);
		} catch {}

		// Flip active deck pointer
		this.activeDeckIndex = incomingIdx;

		const nextItem = this.preloadedItem;
		const nextIdx = this.preloadedIndex ?? playback.queue.currentIndex + 1;
		this.preloadedItem = null;
		this.preloadedIndex = null;

		this.setDeckGain(incomingIdx, 1.0);
		incoming.play().catch((e) => console.warn('[Gapless handoff play failed]', e));

		playback.queue.currentIndex = nextIdx;
		this.currentItem = nextItem;

		const now: NowPlaying = {
			videoId: nextItem.video_id,
			title: nextItem.title,
			artists: nextItem.artists,
			artistId: nextItem.artist_id,
			artistRuns: nextItem.artist_runs,
			thumbnail: nextItem.thumbnail,
			duration: nextItem.duration || '0:00',
			streamClient: 'NATIVE_AUDIO',
			rating: nextItem.rating ?? 'indifferent',
			isVideo: nextItem.is_video ?? false
		};
		playback.now = now;
		playback.paused = false;
		playback.position = 0;
		playback.duration = incoming.duration || 0;
		this.updateMediaSession(now);

		setTimeout(() => {
			if (!this.isCrossfading && !this.preloadedItem && (audioFx.playbackMode === 'crossfade' || audioFx.playbackMode === 'gapless')) {
				this.preloadNextTrack();
			}
		}, 3000);
	}

	private cancelCrossfade() {
		if (this.crossfadeInterval) {
			clearInterval(this.crossfadeInterval);
			this.crossfadeInterval = null;
		}
		this.isCrossfading = false;
		playback.crossfading = false;
		this.isPreloading = false;
		playback.preloading = false;
		this.preloadedItem = null;
		this.preloadedIndex = null;

		const standbyIdx = (1 - this.activeDeckIndex) as 0 | 1;
		const standby = this.decks[standbyIdx];
		if (standby) {
			try {
				standby.pause();
				standby.src = '';
			} catch {}
			this.setDeckGain(standbyIdx, 0);
		}
		this.setDeckGain(this.activeDeckIndex, 1.0);
	}

	updateEq(bass: number, mid: number, treble: number) {
		if (!this.audioCtx) return;
		try {
			const now = this.audioCtx.currentTime;
			if (this.lowFilter) this.lowFilter.gain.setTargetAtTime(bass, now, 0.05);
			if (this.midFilter) this.midFilter.gain.setTargetAtTime(mid, now, 0.05);
			if (this.highFilter) this.highFilter.gain.setTargetAtTime(treble, now, 0.05);
		} catch {}
	}

	private setupWebAudioGraph() {
		if (typeof window === 'undefined' || this.audioCtx) return;
		try {
			const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
			if (!AudioContextClass) return;
			this.audioCtx = new AudioContextClass();

			// Equalizer Filter Chain
			this.lowFilter = this.audioCtx.createBiquadFilter();
			this.lowFilter.type = 'lowshelf';
			this.lowFilter.frequency.setValueAtTime(150, this.audioCtx.currentTime);
			this.lowFilter.gain.setValueAtTime(audioFx.bass || 0, this.audioCtx.currentTime);

			this.midFilter = this.audioCtx.createBiquadFilter();
			this.midFilter.type = 'peaking';
			this.midFilter.frequency.setValueAtTime(1200, this.audioCtx.currentTime);
			this.midFilter.Q.setValueAtTime(1.0, this.audioCtx.currentTime);
			this.midFilter.gain.setValueAtTime(audioFx.mid || 0, this.audioCtx.currentTime);

			this.highFilter = this.audioCtx.createBiquadFilter();
			this.highFilter.type = 'highshelf';
			this.highFilter.frequency.setValueAtTime(6000, this.audioCtx.currentTime);
			this.highFilter.gain.setValueAtTime(audioFx.treble || 0, this.audioCtx.currentTime);

			// Master Gain Node
			this.masterGain = this.audioCtx.createGain();
			const masterVol = Math.max(0.001, Math.min(1, (playback.volume ?? 100) / 100));
			this.masterGain.gain.setValueAtTime(masterVol, this.audioCtx.currentTime);

			// Visualizer Analyser Node
			this.analyser = this.audioCtx.createAnalyser();
			this.analyser.fftSize = 256;
			this.analyser.smoothingTimeConstant = 0.8;
			this.freqArray = new Uint8Array(this.analyser.frequencyBinCount);
			this.timeArray = new Uint8Array(this.analyser.fftSize);

			// Connect EQ -> MasterGain -> Analyser -> Destination
			this.lowFilter.connect(this.midFilter);
			this.midFilter.connect(this.highFilter);
			this.highFilter.connect(this.masterGain);
			this.masterGain.connect(this.analyser);
			this.analyser.connect(this.audioCtx.destination);

			// Connect Decks to their individual DeckGains -> lowFilter
			this.decks.forEach((deck, idx) => {
				if (deck && !this.sourceNodes.has(deck)) {
					try {
						const src = this.audioCtx!.createMediaElementSource(deck);
						const deckGain = this.audioCtx!.createGain();
						deckGain.gain.setValueAtTime(idx === this.activeDeckIndex ? 1.0 : 0.0, this.audioCtx!.currentTime);

						src.connect(deckGain);
						deckGain.connect(this.lowFilter!);

						this.deckGains[idx] = deckGain;
						this.sourceNodes.set(deck, src);
					} catch (e) {
						console.warn('[Web Audio Deck Source connect error]', e);
					}
				}
			});
		} catch (e) {
			console.warn('[Web Audio Graph Setup Exception]', e);
		}
	}

	getAudioMetrics(): {
		freqData: Uint8Array;
		timeData: Uint8Array;
		bass: number;
		mid: number;
		treble: number;
		energy: number;
		beat: boolean;
	} {
		const metrics = {
			freqData: new Uint8Array(64),
			timeData: new Uint8Array(64),
			bass: 0,
			mid: 0,
			treble: 0,
			energy: 0,
			beat: false
		};

		if (playback.paused || !playback.now) {
			// Smooth decay to zero when paused
			for (let i = 0; i < 64; i++) {
				this.smoothedFreq[i] *= 0.88;
				this.smoothedTime[i] = this.smoothedTime[i] * 0.9 + 128 * 0.1;
				metrics.freqData[i] = Math.round(this.smoothedFreq[i]);
				metrics.timeData[i] = Math.round(this.smoothedTime[i]);
			}
			return metrics;
		}

		if (this.audioCtx && this.audioCtx.state === 'suspended') {
			this.audioCtx.resume().catch(() => {});
		}

		let hasRealData = false;
		if (this.analyser && this.freqArray && this.timeArray) {
			try {
				(this.analyser as any).getByteFrequencyData(this.freqArray);
				(this.analyser as any).getByteTimeDomainData(this.timeArray);

				let sum = 0;
				for (let i = 0; i < 32; i++) {
					sum += this.freqArray[i];
				}
				if (sum > 35) {
					hasRealData = true;
					const binCount = this.freqArray.length;
					for (let i = 0; i < 64; i++) {
						// Logarithmic frequency bin distribution across human hearing curve
						const logIdx = Math.min(binCount - 1, Math.floor(Math.pow(i / 63, 1.6) * (binCount * 0.75)));
						const rawVal = this.freqArray[logIdx] || 0;
						const rawTime = this.timeArray[i] || 128;

						// Ballistics: fast attack (0.35), smooth decay (0.15)
						const cur = this.smoothedFreq[i];
						if (rawVal > cur) {
							this.smoothedFreq[i] += (rawVal - cur) * 0.38;
						} else {
							this.smoothedFreq[i] += (rawVal - cur) * 0.14;
						}

						this.smoothedTime[i] += (rawTime - this.smoothedTime[i]) * 0.45;
						metrics.freqData[i] = Math.min(255, Math.max(0, Math.round(this.smoothedFreq[i])));
						metrics.timeData[i] = Math.min(255, Math.max(0, Math.round(this.smoothedTime[i])));
					}
				}
			} catch {}
		}

		if (!hasRealData) {
			// High-fidelity synthesized audio reactivity (tempo-aware, harmonic multi-wave)
			const time = performance.now() / 1000;
			const pos = playback.position || time;
			
			// 124 BPM harmonic pulse clock
			const beatPhase = (pos * 2.06) % 1;
			const beatHit = Math.pow(Math.max(0, 1 - beatPhase * 2.0), 2.5);
			const subHit = Math.pow(Math.max(0, 1 - ((pos * 4.12) % 1) * 2.4), 2);
			const hiHatHit = Math.pow(Math.max(0, 1 - ((pos * 8.24) % 1) * 3.0), 3) * 0.6;

			for (let i = 0; i < 64; i++) {
				const f = i / 63;
				const wave1 = Math.sin(time * 3.2 + i * 0.28) * 0.5 + 0.5;
				const wave2 = Math.cos(time * 5.6 - i * 0.22) * 0.5 + 0.5;
				const wave3 = Math.sin(time * 9.2 + i * 0.42) * 0.5 + 0.5;

				let targetV = 0;
				if (i < 10) {
					// Sub-bass & Bass punch
					targetV = (beatHit * 210 + subHit * 70 + wave1 * 50 + 20) * (1 - f * 0.4);
				} else if (i < 28) {
					// Vocal & Melodic Mids
					targetV = (wave1 * 115 + wave2 * 90 + beatHit * 55 + 25) * (1 - f * 0.35);
				} else {
					// Air & Treble Shimmer
					targetV = (wave2 * 75 + wave3 * 105 + hiHatHit * 120 + 15) * (1 - f * 0.25);
				}

				const cur = this.smoothedFreq[i];
				if (targetV > cur) {
					this.smoothedFreq[i] += (targetV - cur) * 0.35;
				} else {
					this.smoothedFreq[i] += (targetV - cur) * 0.12;
				}

				const synthTime = 128 + Math.sin(time * 14 + i * 0.38) * (this.smoothedFreq[i] * 0.42);
				this.smoothedTime[i] += (synthTime - this.smoothedTime[i]) * 0.4;

				metrics.freqData[i] = Math.min(255, Math.max(0, Math.round(this.smoothedFreq[i])));
				metrics.timeData[i] = Math.min(255, Math.max(0, Math.round(this.smoothedTime[i])));
			}
		}

		// Calculate frequency bands
		let bassSum = 0;
		for (let i = 0; i < 8; i++) bassSum += metrics.freqData[i];
		metrics.bass = Math.min(1, (bassSum / (8 * 255)) * 1.35);

		let midSum = 0;
		for (let i = 8; i < 24; i++) midSum += metrics.freqData[i];
		metrics.mid = Math.min(1, (midSum / (16 * 255)) * 1.25);

		let trebleSum = 0;
		for (let i = 24; i < 64; i++) trebleSum += metrics.freqData[i];
		metrics.treble = Math.min(1, (trebleSum / (40 * 255)) * 1.25);

		metrics.energy = Math.min(1, metrics.bass * 0.5 + metrics.mid * 0.3 + metrics.treble * 0.2);

		// Beat detection
		if (metrics.bass > 0.60 && metrics.bass - this.prevBass > 0.10) {
			metrics.beat = true;
			this.beatDecay = 1.0;
		} else {
			this.beatDecay = Math.max(0, this.beatDecay - 0.08);
			metrics.beat = this.beatDecay > 0.35;
		}
		this.prevBass = metrics.bass;

		return metrics;
	}

	getVisualizerData(): Uint8Array {
		const metrics = this.getAudioMetrics();
		return metrics.freqData.slice(0, 16);
	}

	private async acquireWakeLock() {
		if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
			try {
				this.wakeLock = await (navigator as any).wakeLock.request('screen');
			} catch {}
		}
	}

	private releaseWakeLock() {
		if (this.wakeLock) {
			try {
				this.wakeLock.release();
			} catch {}
			this.wakeLock = null;
		}
	}

	private initYouTubePlayer() {
		if (typeof window === 'undefined') return;
		if (this.ytPlayer) return;

		let container = document.getElementById('echo-yt-iframe-player');
		if (!container) {
			const host = document.createElement('div');
			host.id = 'echo-yt-player-host';
			host.style.cssText =
				'position:fixed;bottom:10px;right:10px;width:200px;height:120px;opacity:0.001;pointer-events:none;z-index:1;overflow:hidden;';
			container = document.createElement('div');
			container.id = 'echo-yt-iframe-player';
			host.appendChild(container);
			document.body.appendChild(host);
		}

		const createPlayer = () => {
			if (!window.YT || !window.YT.Player || this.ytPlayer) return;
			try {
				this.ytPlayer = new window.YT.Player('echo-yt-iframe-player', {
					height: '100%',
					width: '100%',
					playerVars: {
						autoplay: 1,
						controls: 0,
						disablekb: 1,
						fs: 0,
						rel: 0,
						modestbranding: 1,
						playsinline: 1,
						enablejsapi: 1,
						origin: typeof window !== 'undefined' ? window.location.origin : undefined
					},
					events: {
						onReady: () => {
							this.ytReady = true;
							try {
								this.ytPlayer.unMute();
								this.ytPlayer.setVolume(playback.volume ?? 100);
							} catch {}
							if (this.pendingVideoId) {
								const vid = this.pendingVideoId;
								this.pendingVideoId = null;
								this.loadAndPlayYt(vid);
							}
						},
						onStateChange: (event: any) => {
							if (this.isRadioStream) return;
							if (event.data === 1) {
								playback.paused = false;
								this.startProgress();
								this.updateMediaSessionState('playing');
								try {
									const dur = this.ytPlayer.getDuration();
									if (dur && !isNaN(dur) && dur > 0) {
										playback.duration = dur;
									}
								} catch {}
							} else if (event.data === 2) {
								playback.paused = true;
								this.stopProgress();
								this.updateMediaSessionState('paused');
							} else if (event.data === 0) {
								this.next();
							} else if (event.data === 3 || event.data === -1 || event.data === 5) {
								playback.paused = false;
								try {
									this.ytPlayer.playVideo();
								} catch {}
							}
						},
						onError: (err: any) => {
							console.warn('[Aura YT Player Error]', err);
							if (this.currentItem) {
								this.retryWithAlternativeStream(this.currentItem);
							}
						}
					}
				});
			} catch (e) {
				console.warn('[Aura YT Player Init Error]', e);
			}
		};

		if (window.YT && window.YT.Player) {
			createPlayer();
		} else {
			const prevCallback = window.onYouTubeIframeAPIReady;
			window.onYouTubeIframeAPIReady = () => {
				if (prevCallback) prevCallback();
				createPlayer();
			};

			const checkYT = setInterval(() => {
				if (window.YT && window.YT.Player) {
					clearInterval(checkYT);
					createPlayer();
				}
			}, 100);
			setTimeout(() => clearInterval(checkYT), 6000);

			if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
				const tag = document.createElement('script');
				tag.src = 'https://www.youtube.com/iframe_api';
				document.head.appendChild(tag);
			}
		}
	}

	private setupMediaSession() {
		if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

		navigator.mediaSession.setActionHandler('play', () => this.togglePause());
		navigator.mediaSession.setActionHandler('pause', () => this.togglePause());
		navigator.mediaSession.setActionHandler('stop', () => {
			this.togglePause();
			playback.position = 0;
		});
		navigator.mediaSession.setActionHandler('previoustrack', () => this.prev());
		navigator.mediaSession.setActionHandler('nexttrack', () => this.next());
		navigator.mediaSession.setActionHandler('seekto', (details) => {
			if (details.seekTime !== undefined) this.seek(details.seekTime);
		});
		navigator.mediaSession.setActionHandler('seekbackward', (details) => {
			const offset = details.seekOffset || 10;
			this.seek(Math.max(0, playback.position - offset));
		});
		navigator.mediaSession.setActionHandler('seekforward', (details) => {
			const offset = details.seekOffset || 10;
			this.seek(Math.min(playback.duration, playback.position + offset));
		});
	}

	private updateMediaSession(now: NowPlaying) {
		if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

		const artwork = now.thumbnail
			? [
					{ src: now.thumbnail, sizes: '96x96', type: 'image/jpeg' },
					{ src: now.thumbnail, sizes: '128x128', type: 'image/jpeg' },
					{ src: now.thumbnail, sizes: '192x192', type: 'image/jpeg' },
					{ src: now.thumbnail, sizes: '256x256', type: 'image/jpeg' },
					{ src: now.thumbnail, sizes: '384x384', type: 'image/jpeg' },
					{ src: now.thumbnail, sizes: '512x512', type: 'image/jpeg' }
				]
			: [];

		try {
			navigator.mediaSession.metadata = new MediaMetadata({
				title: now.title,
				artist: now.artists,
				album: 'Aura Music Premium',
				artwork
			});
			this.syncMediaSessionPosition();
		} catch (e) {
			console.warn('[MediaSession Metadata Warning]', e);
		}
	}

	private updateMediaSessionState(state: 'playing' | 'paused' | 'none') {
		if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
		try {
			navigator.mediaSession.playbackState = state;
			if (state === 'playing') {
				this.acquireWakeLock();
			} else {
				this.releaseWakeLock();
			}
			this.syncMediaSessionPosition();
		} catch {}
	}

	private syncMediaSessionPosition() {
		if (typeof navigator === 'undefined' || !('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;
		try {
			if (playback.duration && playback.duration > 0 && !isNaN(playback.duration)) {
				const active = this.activeAudio;
				navigator.mediaSession.setPositionState({
					duration: Math.max(0, playback.duration),
					playbackRate: active?.playbackRate || 1.0,
					position: Math.min(playback.duration, Math.max(0, playback.position))
				});
			}
		} catch {}
	}

	private startProgress() {
		this.stopProgress();
		this.progressInterval = setInterval(() => {
			if (this.usingDirectAudio || this.isRadioStream) {
				const active = this.activeAudio;
				if (active) {
					playback.position = active.currentTime || 0;
					playback.positionAt = performance.now();
					if (active.duration && !isNaN(active.duration) && active.duration > 0) {
						playback.duration = active.duration;
					}
					this.handleTransitionTick();
				}
			} else if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.getCurrentTime === 'function') {
				try {
					const pos = this.ytPlayer.getCurrentTime() || 0;
					const dur = this.ytPlayer.getDuration() || 0;
					playback.position = pos;
					playback.positionAt = performance.now();
					if (dur && !isNaN(dur) && dur > 0) {
						playback.duration = dur;
					}
				} catch {}
			}
		}, 150);
	}

	private stopProgress() {
		if (this.progressInterval) {
			clearInterval(this.progressInterval);
			this.progressInterval = null;
		}
	}

	private async resolveBestVideoId(item: SongItem): Promise<string | null> {
		if (
			item.video_id &&
			!item.video_id.startsWith('sp:') &&
			!item.video_id.startsWith('radio_') &&
			!item.video_id.startsWith('fmhy_') &&
			!item.video_id.startsWith('LOCAL:') &&
			!item.video_id.startsWith('demo') &&
			!item.video_id.startsWith('saavn_') &&
			item.video_id.length === 11
		) {
			return item.video_id;
		}

		if (item.video_id && (item.video_id.startsWith('fmhy_') || item.video_id.startsWith('radio_'))) {
			const { findFmhyItem } = await import('./fmhy');
			const fmItem = findFmhyItem(item.video_id);
			if (fmItem?.videoId) return fmItem.videoId;
		}

		try {
			const query = (item as any).searchQuery || `${item.title} ${item.artists || ''}`.trim();
			const searchRes = await fetchSearch(query);
			if (searchRes.songs?.[0]?.id) return searchRes.songs[0].id;
			if (searchRes.top?.[0]?.id) return searchRes.top[0].id;
		} catch (e) {
			console.warn('[Aura WebPlayer] Search fallback error:', e);
		}

		return item.video_id || null;
	}

	private async retryWithAlternativeStream(item: SongItem) {
		try {
			// 1. Try finding official 320kbps audio from JioSaavn
			const query = cleanSearchQuery(item.title, item.artists);
			if (query) {
				const results = await searchSaavnDirect(query, 1, 10);
				const VERSION_KWS = ['cover', 'karaoke', 'remix', 'acoustic', 'lofi', 'slowed', 'reverb', 'tribute'];
				const officialMatch = results.find(
					(r) => r.streamUrl && !VERSION_KWS.some((kw) => `${r.title} ${r.artists}`.toLowerCase().includes(kw))
				) || results[0];

				if (officialMatch?.streamUrl) {
					item.streamUrl = officialMatch.streamUrl;
					this.playAudioDirect(officialMatch.streamUrl);
					return;
				}
			}

			// 2. Direct fallback to YouTube player with exact video ID
			const targetVideoId = (await this.resolveBestVideoId(item)) || item.video_id;
			if (targetVideoId && targetVideoId.length === 11) {
				item.video_id = targetVideoId;
				if (playback.now) playback.now.videoId = targetVideoId;
				this.loadAndPlayYt(targetVideoId);
			}
		} catch (e) {
			console.warn('[Alternative stream retry error]', e);
		}
	}

	private async getDirectAudioUrl(videoId: string): Promise<string | null> {
		if (!videoId || videoId.length !== 11) return null;

		// 1. First try app's own streaming pipe endpoint
		const streamEndpoint = getApiUrl(`/api/stream?videoId=${encodeURIComponent(videoId)}`);
		try {
			const res = await fetch(streamEndpoint, { method: 'HEAD', signal: AbortSignal.timeout(2000) });
			if (res.ok) {
				return streamEndpoint;
			}
		} catch {}

		// 2. Try fast public streaming proxies
		const endpoints = [
			`https://pipedapi.tokhmi.xyz/streams/${videoId}`,
			`https://inv.nadeko.net/api/v1/videos/${videoId}`,
			`https://invidious.jing.rocks/api/v1/videos/${videoId}`
		];

		for (const ep of endpoints) {
			try {
				const res = await fetch(ep, { signal: AbortSignal.timeout(2200) });
				if (res.ok) {
					const data = await res.json();
					if (Array.isArray(data.adaptiveFormats)) {
						const audios = data.adaptiveFormats.filter((f: any) => f.type?.includes('audio') || f.mimeType?.includes('audio'));
						if (audios.length > 0) {
							const sorted = audios.sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));
							if (sorted[0]?.url) return sorted[0].url;
						}
					}
					if (Array.isArray(data.audioStreams) && data.audioStreams.length > 0) {
						const sorted = [...data.audioStreams].sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
						if (sorted[0]?.url) return sorted[0].url;
					}
				}
			} catch {}
		}

		// Fallback to streaming pipe for native HTML5 audio streaming
		return streamEndpoint;
	}

	async resolveStreamUrl(item: SongItem): Promise<string | null> {
		if (item.streamUrl) return item.streamUrl;

		// 1. If JioSaavn ID (e.g. saavn_Wa2ECpqQ): fetch direct 320kbps stream URL
		if (item.video_id?.startsWith('saavn_')) {
			try {
				const { fetchSaavnSongDetailsDirect } = await import('./saavn');
				const saavnDetails = await fetchSaavnSongDetailsDirect(item.video_id);
				if (saavnDetails?.streamUrl) {
					item.streamUrl = saavnDetails.streamUrl;
					if (saavnDetails.thumbnail && !item.thumbnail) item.thumbnail = saavnDetails.thumbnail;
					return saavnDetails.streamUrl;
				}
			} catch (e) {
				console.warn('[Saavn ID stream resolution error]', e);
			}
		}

		// 2. Google Drive Audio file
		if (item.video_id?.startsWith('gdrive:')) {
			const fileId = item.video_id.replace('gdrive:', '');
			try {
				const { gdrive } = await import('./gdrive');
				const token = gdrive.getAccessToken();
				if (token) {
					const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
						headers: { Authorization: `Bearer ${token}` }
					});
					if (res.ok) {
						const blob = await res.blob();
						return URL.createObjectURL(blob);
					}
				}
			} catch (e) {
				console.warn('[GDrive audio resolution error]', e);
			}
		}

		// 3. FMHY Item Lookup
		if (item.video_id && (item.video_id.startsWith('fmhy_') || item.video_id.startsWith('radio_'))) {
			const { findFmhyItem } = await import('./fmhy');
			const fmItem = findFmhyItem(item.video_id);
			if (fmItem?.streamUrl) return fmItem.streamUrl;
		}

		// 4. JioSaavn 320kbps Lossless Direct Stream (Check for any track with title/artists)
		if (item.title && item.duration !== 'LIVE' && !item.video_id?.startsWith('fmhy_') && !item.video_id?.startsWith('radio_')) {
			const query = cleanSearchQuery(item.title, item.artists);
			if (query) {
				try {
					let results = await searchSaavnDirect(query, 1, 10);
					if (!results.length) {
						const titleOnly = cleanSearchQuery(item.title);
						if (titleOnly && titleOnly !== query) {
							results = await searchSaavnDirect(titleOnly, 1, 10);
						}
					}

					// Discard covers and remixes when resolving original studio tracks
					if (results.length > 0) {
						const VERSION_KWS = ['cover', 'karaoke', 'remix', 'acoustic', 'lofi', 'slowed', 'reverb', 'mashup', 'tribute'];
						const isRequestingVersion = VERSION_KWS.some((kw) => `${item.title} ${item.artists || ''}`.toLowerCase().includes(kw));

						let bestMatch = results[0];
						if (!isRequestingVersion) {
							const official = results.find(
								(r) => r.streamUrl && !VERSION_KWS.some((kw) => `${r.title} ${r.artists}`.toLowerCase().includes(kw))
							);
							if (official) bestMatch = official;
						}

						if (bestMatch?.streamUrl) {
							item.streamUrl = bestMatch.streamUrl;
							if (bestMatch.thumbnail && !item.thumbnail) item.thumbnail = bestMatch.thumbnail;
							return bestMatch.streamUrl;
						}
					}
				} catch (e) {
					console.warn('[JioSaavn stream resolution error]', e);
				}
			}
		}

		// 5. YouTube Music direct stream via audio extractor
		const targetVideoId = (await this.resolveBestVideoId(item)) || item.video_id;
		if (targetVideoId && targetVideoId.length === 11) {
			try {
				const directStream = await this.getDirectAudioUrl(targetVideoId);
				if (directStream) {
					item.streamUrl = directStream;
					return directStream;
				}
			} catch {}
		}

		return null;
	}

	private playAudioDirect(url: string) {
		if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.pauseVideo === 'function') {
			try {
				this.ytPlayer.pauseVideo();
			} catch {}
		}
		this.usingDirectAudio = true;

		if (this.audioCtx && this.audioCtx.state === 'suspended') {
			this.audioCtx.resume().catch(() => {});
		}

		const activeIdx = this.activeDeckIndex;
		const standbyIdx = (1 - this.activeDeckIndex) as 0 | 1;
		const active = this.decks[activeIdx];
		const userVol = Math.max(0.001, Math.min(1, (playback.volume ?? 100) / 100));

		this.setDeckGain(standbyIdx, 0);
		this.setDeckGain(activeIdx, 1.0);

		if (active) {
			try {
				active.pause();
				active.currentTime = 0;
			} catch {}
			active.crossOrigin = 'anonymous';
			active.muted = false;
			active.volume = userVol;
			active.src = url;
			active.load();
			const playPromise = active.play();
			if (playPromise !== undefined) {
				playPromise
					.then(() => {
						playback.paused = false;
						this.startProgress();
						this.updateMediaSessionState('playing');
						setTimeout(() => {
							if (!this.isCrossfading && !this.preloadedItem && (audioFx.playbackMode === 'crossfade' || audioFx.playbackMode === 'gapless')) {
								this.preloadNextTrack();
							}
						}, 3000);
					})
					.catch((e) => {
						console.warn('[Direct Audio Play Error]', e);
						if (e.name === 'NotAllowedError') {
							const resumeOnClick = () => {
								if (active && active.paused && active.src) {
									active.muted = false;
									active.volume = userVol;
									active.play().catch(() => {});
								}
								window.removeEventListener('pointerdown', resumeOnClick);
								window.removeEventListener('click', resumeOnClick);
								window.removeEventListener('keydown', resumeOnClick);
								window.removeEventListener('touchstart', resumeOnClick);
							};
							window.addEventListener('pointerdown', resumeOnClick, { once: true });
							window.addEventListener('click', resumeOnClick, { once: true });
							window.addEventListener('keydown', resumeOnClick, { once: true });
							window.addEventListener('touchstart', resumeOnClick, { once: true });
						} else if (this.currentItem) {
							this.retryWithAlternativeStream(this.currentItem);
						}
					});
			}
		}
	}

	private loadAndPlayYt(videoId: string) {
		const active = this.activeAudio;
		if (active) {
			try {
				active.pause();
			} catch {}
		}
		this.usingDirectAudio = false;
		this.isRadioStream = false;

		if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.loadVideoById === 'function') {
			try {
				this.ytPlayer.unMute();
				this.ytPlayer.setVolume(playback.volume ?? 100);
				this.ytPlayer.loadVideoById({
					videoId,
					startSeconds: 0
				});
				this.ytPlayer.playVideo();
				playback.paused = false;
				this.startProgress();
			} catch (e) {
				console.warn('[Aura YT Play Exception]', e);
			}
		} else {
			this.pendingVideoId = videoId;
			this.initYouTubePlayer();
		}
	}

	async play(item: SongItem) {
		this.init();
		this.cancelCrossfade();
		this.currentItem = item;

		const parseDurationToSeconds = (dur?: string | number): number => {
			if (typeof dur === 'number') return dur;
			if (!dur) return 0;
			const parts = String(dur).split(':').map((p) => parseInt(p, 10));
			if (parts.some(isNaN)) return 0;
			if (parts.length === 2) return parts[0] * 60 + parts[1];
			if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
			return 0;
		};

		const now: NowPlaying = {
			videoId: item.video_id,
			title: item.title,
			artists: item.artists,
			artistId: item.artist_id,
			artistRuns: item.artist_runs,
			thumbnail: item.thumbnail,
			duration: item.duration || '0:00',
			streamClient: 'NATIVE_AUDIO',
			rating: item.rating ?? 'indifferent',
			isVideo: item.is_video ?? false
		};

		playback.now = now;
		playback.paused = false;
		playback.position = 0;
		playback.positionAt = performance.now();
		playback.duration = parseDurationToSeconds(item.duration) || 0;

		this.updateMediaSession(now);

		if (!playback.queue.items.some((it) => it.video_id === item.video_id)) {
			playback.queue.items = [item, ...playback.queue.items];
			playback.queue.currentIndex = 0;
		} else {
			const idx = playback.queue.items.findIndex((it) => it.video_id === item.video_id);
			if (idx !== -1) playback.queue.currentIndex = idx;
		}

		// 1. Direct stream URL already attached (e.g. JioSaavn 320kbps lossless, SomaFM, Nightwave Plaza)
		if (item.streamUrl) {
			if (item.duration === 'LIVE') {
				this.isRadioStream = true;
				this.usingDirectAudio = false;
			} else {
				this.isRadioStream = false;
				this.usingDirectAudio = true;
			}
			this.playAudioDirect(item.streamUrl);
			return;
		}

		// 2. Resolve Stream URL dynamically
		const resolvedStream = await this.resolveStreamUrl(item);
		if (resolvedStream) {
			this.isRadioStream = item.duration === 'LIVE';
			this.usingDirectAudio = !this.isRadioStream;
			this.playAudioDirect(resolvedStream);
			return;
		}

		// 3. Fallback to YouTube IFrame player if no direct stream is available
		const targetVideoId = (await this.resolveBestVideoId(item)) || item.video_id;
		if (targetVideoId && targetVideoId.length === 11) {
			item.video_id = targetVideoId;
			if (playback.now) playback.now.videoId = targetVideoId;
			this.loadAndPlayYt(targetVideoId);
		}
	}

	playPlaylist(
		items: SongItem[],
		start: number | null = 0,
		sourceName?: string,
		shuffle = false
	) {
		if (!items.length) return;
		this.cancelCrossfade();
		const currentSelected = start !== null && items[start] ? items[start] : items[0];
		let queueItems = deduplicateSongs([...items]);
		let startIndex = queueItems.findIndex((x) => x.video_id === currentSelected.video_id);
		if (startIndex === -1) startIndex = 0;

		if (shuffle) {
			const [first] = queueItems.splice(startIndex, 1);
			for (let i = queueItems.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[queueItems[i], queueItems[j]] = [queueItems[j], queueItems[i]];
			}
			queueItems = [first, ...queueItems];
			startIndex = 0;
		}

		playback.queue = {
			items: queueItems,
			currentIndex: startIndex,
			sourceName,
			shuffle
		};

		const item = queueItems[startIndex];
		if (item) this.play(item);
	}

	playIndex(index: number) {
		const item = playback.queue.items[index];
		if (item) {
			this.cancelCrossfade();
			playback.queue.currentIndex = index;
			this.play(item);
		}
	}

	togglePause() {
		if (this.audioCtx && this.audioCtx.state === 'suspended') {
			this.audioCtx.resume().catch(() => {});
		}
		const userVol = Math.max(0.001, Math.min(1, (playback.volume ?? 100) / 100));
		if (this.usingDirectAudio || this.isRadioStream) {
			const active = this.activeAudio;
			if (!active) return;
			if (active.paused) {
				active.muted = false;
				active.volume = userVol;
				active.play().catch(console.warn);
			} else {
				active.pause();
			}
		} else if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.getPlayerState === 'function') {
			try {
				const state = this.ytPlayer.getPlayerState();
				if (state === 1) {
					this.ytPlayer.pauseVideo();
				} else {
					this.ytPlayer.unMute();
					this.ytPlayer.setVolume(playback.volume ?? 100);
					this.ytPlayer.playVideo();
				}
			} catch {}
		}
	}

	seek(position: number) {
		this.cancelCrossfade();
		playback.position = position;
		playback.positionAt = performance.now();
		const active = this.activeAudio;
		if ((this.usingDirectAudio || this.isRadioStream) && active) {
			active.currentTime = position;
		} else if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.seekTo === 'function') {
			try {
				this.ytPlayer.seekTo(position, true);
			} catch {}
		}
	}

	setVolume(volume: number) {
		playback.volume = volume;
		const normVol = Math.max(0.001, Math.min(1, volume / 100));
		if (this.masterGain && this.audioCtx) {
			try {
				this.masterGain.gain.setValueAtTime(normVol, this.audioCtx.currentTime);
			} catch {}
		}
		if (this.decks[0]) {
			this.decks[0].muted = false;
			if (this.activeDeckIndex === 0 && !this.isCrossfading) {
				this.decks[0].volume = normVol;
			}
		}
		if (this.decks[1]) {
			this.decks[1].muted = false;
			if (this.activeDeckIndex === 1 && !this.isCrossfading) {
				this.decks[1].volume = normVol;
			}
		}
		if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.setVolume === 'function') {
			try {
				this.ytPlayer.unMute();
				this.ytPlayer.setVolume(volume);
			} catch {}
		}
	}

	setSpeed(speed: number) {
		playback.speed = speed;
		if (this.decks[0]) this.decks[0].playbackRate = speed;
		if (this.decks[1]) this.decks[1].playbackRate = speed;
		if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.setPlaybackRate === 'function') {
			try {
				this.ytPlayer.setPlaybackRate(speed);
			} catch {}
		}
	}

	next() {
		this.cancelCrossfade();
		const q = playback.queue;
		if (q.currentIndex < q.items.length - 1) {
			this.playIndex(q.currentIndex + 1);
		} else if (q.repeat === 'all' && q.items.length > 0) {
			this.playIndex(0);
		}
	}

	prev() {
		this.cancelCrossfade();
		const q = playback.queue;
		if (playback.position > 3) {
			this.seek(0);
		} else if (q.currentIndex > 0) {
			this.playIndex(q.currentIndex - 1);
		}
	}
}

export const webPlayer = new WebPlayer();
