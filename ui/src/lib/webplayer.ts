// Pure Native HTML5 & YouTube Web Audio Engine for Echo Music (100% Ad-Free & Background Playback)
import { playback, np, audioFx } from './player.svelte';
import type { NowPlaying, QueueState, SongItem } from './api';
import { fetchSearch } from './ytmusic';

declare global {
	interface Window {
		onYouTubeIframeAPIReady?: () => void;
		YT?: any;
		webkitAudioContext?: typeof AudioContext;
	}
}

class WebPlayer {
	private audio: HTMLAudioElement | null = null;
	private ytPlayer: any = null;
	private ytReady = false;
	private currentItem: SongItem | null = null;
	private progressInterval: ReturnType<typeof setInterval> | null = null;
	private isRadioStream = false;
	private usingDirectAudio = false;
	private pendingVideoId: string | null = null;

	// Web Audio Equalizer & Visualizer Nodes
	private audioCtx: AudioContext | null = null;
	private audioSource: MediaElementAudioSourceNode | null = null;
	private lowFilter: BiquadFilterNode | null = null;
	private midFilter: BiquadFilterNode | null = null;
	private highFilter: BiquadFilterNode | null = null;
	private analyser: AnalyserNode | null = null;
	private wakeLock: any = null;

	init() {
		if (typeof window === 'undefined') return;

		// 1. Initialize HTML5 Audio for direct streams
		if (!this.audio) {
			this.audio = new Audio();
			this.audio.preload = 'auto';
			this.audio.crossOrigin = 'anonymous';
			this.audio.volume = (playback.volume ?? 100) / 100;

			this.audio.addEventListener('play', () => {
				playback.paused = false;
				this.startProgress();
				this.updateMediaSessionState('playing');
				this.initAudioFx();
			});

			this.audio.addEventListener('pause', () => {
				if (this.usingDirectAudio || this.isRadioStream) {
					playback.paused = true;
					this.stopProgress();
					this.updateMediaSessionState('paused');
				}
			});

			this.audio.addEventListener('timeupdate', () => {
				if (this.audio && (this.usingDirectAudio || this.isRadioStream)) {
					playback.position = this.audio.currentTime || 0;
					playback.positionAt = performance.now();
					if (this.audio.duration && !isNaN(this.audio.duration)) {
						playback.duration = this.audio.duration;
					}
				}
			});

			this.audio.addEventListener('ended', () => {
				this.next();
			});

			this.setupMediaSession();
		}

		// 2. Initialize YouTube IFrame Player API for direct YouTube Music streaming
		this.initYouTubePlayer();
	}

	private initAudioFx() {
		if (typeof window === 'undefined' || !this.audio || this.audioCtx) return;
		try {
			const AudioContextClass = window.AudioContext || window.webkitAudioContext;
			if (!AudioContextClass) return;
			this.audioCtx = new AudioContextClass();

			this.lowFilter = this.audioCtx.createBiquadFilter();
			this.lowFilter.type = 'lowshelf';
			this.lowFilter.frequency.value = 80;
			this.lowFilter.gain.value = audioFx.bass ?? 0;

			this.midFilter = this.audioCtx.createBiquadFilter();
			this.midFilter.type = 'peaking';
			this.midFilter.frequency.value = 1000;
			this.midFilter.Q.value = 1.0;
			this.midFilter.gain.value = audioFx.mid ?? 0;

			this.highFilter = this.audioCtx.createBiquadFilter();
			this.highFilter.type = 'highshelf';
			this.highFilter.frequency.value = 4000;
			this.highFilter.gain.value = audioFx.treble ?? 0;

			this.analyser = this.audioCtx.createAnalyser();
			this.analyser.fftSize = 64;
			this.analyser.smoothingTimeConstant = 0.8;

			this.audioSource = this.audioCtx.createMediaElementSource(this.audio);
			this.audioSource.connect(this.lowFilter);
			this.lowFilter.connect(this.midFilter);
			this.midFilter.connect(this.highFilter);
			this.highFilter.connect(this.analyser);
			this.analyser.connect(this.audioCtx.destination);
		} catch (e) {
			console.warn('[Aura WebPlayer AudioFX Warning]', e);
		}
	}

	updateEq(bass: number, mid: number, treble: number) {
		if (this.audioCtx && this.audioCtx.state === 'suspended') {
			this.audioCtx.resume().catch(() => {});
		}
		if (this.lowFilter) this.lowFilter.gain.value = bass;
		if (this.midFilter) this.midFilter.gain.value = mid;
		if (this.highFilter) this.highFilter.gain.value = treble;
	}

	getVisualizerData(): Uint8Array {
		if (!this.analyser) {
			// Return fallback visualizer data based on playback state
			const arr = new Uint8Array(16);
			if (!playback.paused && playback.now) {
				const now = Date.now() / 150;
				for (let i = 0; i < 16; i++) {
					arr[i] = Math.floor(Math.abs(Math.sin(now + i * 0.4)) * 180 + 40);
				}
			}
			return arr;
		}
		const buffer = new Uint8Array(this.analyser.frequencyBinCount);
		this.analyser.getByteFrequencyData(buffer);
		return buffer;
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

		let mount = document.getElementById('echo-video-mount');
		let container = document.getElementById('echo-yt-iframe-player');
		if (!container) {
			container = document.createElement('div');
			container.id = 'echo-yt-iframe-player';
			if (mount) {
				mount.appendChild(container);
			} else {
				container.style.width = '100%';
				container.style.height = '100%';
				document.body.appendChild(container);
			}
		} else if (mount && container.parentElement !== mount) {
			mount.appendChild(container);
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
								// BUFFERING, UNSTARTED, CUED - ensure playback starts
								playback.paused = false;
								try {
									this.ytPlayer.playVideo();
								} catch {}
							}
						},
						onError: (err: any) => {
							console.warn('[Echo YT Player Error]', err);
							if (this.currentItem) {
								this.retryWithAlternativeStream(this.currentItem);
							}
						}
					}
				});
			} catch (e) {
				console.warn('[Echo YT Player Init Error]', e);
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
				navigator.mediaSession.setPositionState({
					duration: Math.max(0, playback.duration),
					playbackRate: this.audio?.playbackRate || 1.0,
					position: Math.min(playback.duration, Math.max(0, playback.position))
				});
			}
		} catch {}
	}

	private startProgress() {
		this.stopProgress();
		this.progressInterval = setInterval(() => {
			if (this.usingDirectAudio || this.isRadioStream) {
				if (this.audio) {
					playback.position = this.audio.currentTime || 0;
					playback.positionAt = performance.now();
					if (this.audio.duration && !isNaN(this.audio.duration) && this.audio.duration > 0) {
						playback.duration = this.audio.duration;
					}
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
		}, 250);
	}


	private stopProgress() {
		if (this.progressInterval) {
			clearInterval(this.progressInterval);
			this.progressInterval = null;
		}
	}

	private async resolveBestVideoId(item: SongItem): Promise<string | null> {
		// 1. Direct standard YouTube 11-char video ID
		if (
			item.video_id &&
			!item.video_id.startsWith('sp:') &&
			!item.video_id.startsWith('radio_') &&
			!item.video_id.startsWith('fmhy_') &&
			!item.video_id.startsWith('LOCAL:') &&
			!item.video_id.startsWith('demo') &&
			item.video_id.length === 11
		) {
			return item.video_id;
		}

		// 2. FMHY Item Lookup
		if (item.video_id && (item.video_id.startsWith('fmhy_') || item.video_id.startsWith('radio_'))) {
			const { findFmhyItem } = await import('./fmhy');
			const fmItem = findFmhyItem(item.video_id);
			if (fmItem) {
				if (fmItem.streamUrl) {
					(item as any).streamUrl = fmItem.streamUrl;
					return null;
				}
				if (fmItem.videoId) {
					return fmItem.videoId;
				}
				if (fmItem.searchQuery) {
					try {
						const searchRes = await fetchSearch(fmItem.searchQuery);
						if (searchRes.songs?.[0]?.id) return searchRes.songs[0].id;
						if (searchRes.top?.[0]?.id) return searchRes.top[0].id;
					} catch {}
				}
			}
		}

		try {
			const query = (item as any).searchQuery || `${item.title} ${item.artists || ''}`.trim();
			const searchRes = await fetchSearch(query);
			if (searchRes.songs?.[0]?.id) return searchRes.songs[0].id;
			if (searchRes.top?.[0]?.id) return searchRes.top[0].id;
		} catch (e) {
			console.warn('[Echo WebPlayer] Search fallback error:', e);
		}

		return item.video_id || null;
	}

	private async retryWithAlternativeStream(item: SongItem) {
		try {
			const fallbackQuery = `${item.title} ${item.artists || ''} official audio`;
			const searchRes = await fetchSearch(fallbackQuery);
			if (searchRes.songs?.length) {
				const match = searchRes.songs.find((s) => s.id && s.id !== item.video_id) || searchRes.songs[0];
				if (match?.id) {
					item.video_id = match.id;
					if (playback.now) playback.now.videoId = match.id;
					this.loadAndPlayYt(match.id);
					return;
				}
			}
		} catch {}
	}

	private async getDirectAudioUrl(videoId: string): Promise<string | null> {
		const endpoints = [
			`https://inv.nadeko.net/api/v1/videos/${videoId}`,
			`https://invidious.jing.rocks/api/v1/videos/${videoId}`,
			`https://pipedapi.kavin.rocks/streams/${videoId}`
		];

		for (const ep of endpoints) {
			try {
				const res = await fetch(ep, { signal: AbortSignal.timeout(1800) });
				if (res.ok) {
					const data = await res.json();
					if (Array.isArray(data.adaptiveFormats)) {
						const audios = data.adaptiveFormats.filter((f: any) => f.type?.includes('audio'));
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
		return null;
	}

	private playAudioDirect(url: string) {
		if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.pauseVideo === 'function') {
			try {
				this.ytPlayer.pauseVideo();
			} catch {}
		}
		this.usingDirectAudio = true;
		if (this.audio) {
			this.audio.src = url;
			this.audio.volume = (playback.volume ?? 100) / 100;
			this.audio.play().catch((e) => {
				console.warn('[Direct Audio Play Error]', e);
				if (this.currentItem?.video_id) {
					this.loadAndPlayYt(this.currentItem.video_id);
				}
			});
		}
	}

	private loadAndPlayYt(videoId: string) {
		if (this.audio) this.audio.pause();
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
				console.warn('[Echo YT Play Exception]', e);
			}
		} else {
			this.pendingVideoId = videoId;
			this.initYouTubePlayer();
		}
	}

	async play(item: SongItem) {
		this.init();
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

		// 1. Direct audio stream (e.g. JioSaavn 320kbps lossless, SomaFM, Nightwave Plaza)
		if ((item as any).streamUrl) {
			if (item.duration === 'LIVE') {
				this.isRadioStream = true;
				this.usingDirectAudio = false;
			} else {
				this.isRadioStream = false;
				this.usingDirectAudio = true;
			}
			this.playAudioDirect((item as any).streamUrl);
			return;
		}

		// 2. Google Drive Audio file playback
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
						const blobUrl = URL.createObjectURL(blob);
						this.isRadioStream = false;
						this.usingDirectAudio = true;
						this.playAudioDirect(blobUrl);
						return;
					}
				}
			} catch (e) {
				console.warn('[GDrive audio playback error]', e);
			}
		}

		// 3. Resolve target YouTube Video ID
		const targetVideoId = (await this.resolveBestVideoId(item)) || item.video_id;
		if (targetVideoId) {
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
		let queueItems = [...items];
		let startIndex = start ?? 0;

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
			playback.queue.currentIndex = index;
			this.play(item);
		}
	}

	togglePause() {
		if (this.usingDirectAudio || this.isRadioStream) {
			if (!this.audio) return;
			if (this.audio.paused) {
				this.audio.play().catch(console.warn);
			} else {
				this.audio.pause();
			}
		} else if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.getPlayerState === 'function') {
			try {
				const state = this.ytPlayer.getPlayerState();
				if (state === 1) {
					this.ytPlayer.pauseVideo();
				} else {
					this.ytPlayer.playVideo();
				}
			} catch {}
		}
	}

	seek(position: number) {
		playback.position = position;
		playback.positionAt = performance.now();
		if ((this.usingDirectAudio || this.isRadioStream) && this.audio) {
			this.audio.currentTime = position;
		} else if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.seekTo === 'function') {
			try {
				this.ytPlayer.seekTo(position, true);
			} catch {}
		}
	}

	setVolume(volume: number) {
		playback.volume = volume;
		if (this.audio) {
			this.audio.volume = Math.max(0, Math.min(1, volume / 100));
		}
		if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.setVolume === 'function') {
			try {
				this.ytPlayer.setVolume(volume);
			} catch {}
		}
	}

	next() {
		const q = playback.queue;
		if (q.currentIndex < q.items.length - 1) {
			this.playIndex(q.currentIndex + 1);
		} else if (q.repeat === 'all' && q.items.length > 0) {
			this.playIndex(0);
		}
	}

	prev() {
		const q = playback.queue;
		if (playback.position > 3) {
			this.seek(0);
		} else if (q.currentIndex > 0) {
			this.playIndex(q.currentIndex - 1);
		}
	}
}

export const webPlayer = new WebPlayer();
