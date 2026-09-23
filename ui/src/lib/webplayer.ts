// Pure Native HTML5 & YouTube Web Audio Engine for Aura Music (100% Ad-Free & Background Playback)
import { playback, np, audioFx } from './player.svelte';
import type { NowPlaying, QueueState, SongItem } from './api';
import { fetchSearch } from './ytmusic';
import { searchSaavnDirect } from './saavn';
import { getApiUrl } from './apiBase';

declare global {
	interface Window {
		onYouTubeIframeAPIReady?: () => void;
		YT?: any;
	}
}

export function cleanSearchQuery(title: string, artists?: string): string {
	let clean = (title || '')
		.replace(/\(official\s*(music\s*)?(video|audio|lyric|visualizer|hd|4k|remastered)?\)/gi, '')
		.replace(/\[official\s*(music\s*)?(video|audio|lyric|visualizer|hd|4k|remastered)?\]/gi, '')
		.replace(/\|\s*[^|]+$/g, '')
		.replace(/(\(|\[)(feat\.|ft\.|with|prod\.)[^)\]]*(\)|\])/gi, '')
		.replace(/\s+/g, ' ')
		.trim();

	const firstArtist = (artists || '').split(',')[0]?.split('&')[0]?.trim() || '';
	return `${clean} ${firstArtist}`.trim();
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
	private wakeLock: any = null;
	private unlocked = false;

	init() {
		if (typeof window === 'undefined') return;

		// Document-wide one-time gesture unlock for unblocked web audio autoplay
		if (!this.unlocked) {
			const unlockEngine = () => {
				this.unlocked = true;
				if (this.audio && this.audio.paused && this.audio.src) {
					this.audio.play().catch(() => {});
				}
				window.removeEventListener('pointerdown', unlockEngine);
				window.removeEventListener('click', unlockEngine);
				window.removeEventListener('keydown', unlockEngine);
				window.removeEventListener('touchstart', unlockEngine);
			};
			window.addEventListener('pointerdown', unlockEngine, { once: true });
			window.addEventListener('click', unlockEngine, { once: true });
			window.addEventListener('keydown', unlockEngine, { once: true });
			window.addEventListener('touchstart', unlockEngine, { once: true });
		}

		// 1. Initialize HTML5 Audio for direct streams with native hardware audio pipeline
		if (!this.audio) {
			this.audio = new Audio();
			this.audio.preload = 'auto';
			this.audio.muted = false;
			this.audio.volume = Math.max(0.01, Math.min(1, (playback.volume ?? 100) / 100));

			this.audio.addEventListener('play', () => {
				playback.paused = false;
				this.startProgress();
				this.updateMediaSessionState('playing');
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
					if (this.audio.duration && !isNaN(this.audio.duration) && this.audio.duration > 0) {
						playback.duration = this.audio.duration;
					}
				}
			});

			this.audio.addEventListener('ended', () => {
				this.next();
			});

			this.audio.addEventListener('error', (e) => {
				console.warn('[Aura Audio Playback Error]', this.audio?.error, e);
				if (this.currentItem) {
					this.retryWithAlternativeStream(this.currentItem);
				}
			});

			// Mobile & tab background playback keeper: keep audio alive when phone is locked or app minimized
			if (typeof document !== 'undefined') {
				document.addEventListener('visibilitychange', () => {
					if (document.hidden) {
						if (this.audio && !playback.paused && this.audio.paused && this.usingDirectAudio) {
							this.audio.play().catch(() => {});
						}
						this.acquireWakeLock();
					}
				});
			}

			this.setupMediaSession();
		}

		// 2. Initialize YouTube IFrame Player API in active media container
		this.initYouTubePlayer();
	}

	updateEq(bass: number, mid: number, treble: number) {
		// Native high-fidelity hardware playback
	}

	getVisualizerData(): Uint8Array {
		const arr = new Uint8Array(16);
		if (!playback.paused && playback.now) {
			const now = Date.now() / 150;
			for (let i = 0; i < 16; i++) {
				arr[i] = Math.floor(Math.abs(Math.sin(now + i * 0.4)) * 180 + 40);
			}
		}
		return arr;
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
			// Non-zero dimensions positioned at viewport edge to prevent browser background throttling
			host.style.cssText =
				'position:fixed;bottom:0;right:0;width:200px;height:200px;opacity:0.01;pointer-events:none;z-index:-9999;';
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
			if (fmItem) {
				if (fmItem.streamUrl) {
					item.streamUrl = fmItem.streamUrl;
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
			console.warn('[Aura WebPlayer] Search fallback error:', e);
		}

		return item.video_id || null;
	}

	private async retryWithAlternativeStream(item: SongItem) {
		try {
			const fallbackQuery = `${item.title} ${item.artists || ''}`.trim();
			// 1. Try JioSaavn direct 320kbps search
			const saavnResults = await searchSaavnDirect(fallbackQuery);
			if (saavnResults.length > 0 && saavnResults[0]?.streamUrl && saavnResults[0].streamUrl !== item.streamUrl) {
				item.streamUrl = saavnResults[0].streamUrl;
				this.playAudioDirect(saavnResults[0].streamUrl);
				return;
			}

			// 2. Try alternative YouTube Audio
			const searchRes = await fetchSearch(`${fallbackQuery} official audio`);
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
		// 1. First try app's own streaming pipe
		try {
			const streamEndpoint = getApiUrl(`/api/stream?videoId=${encodeURIComponent(videoId)}`);
			const res = await fetch(streamEndpoint, { method: 'HEAD', signal: AbortSignal.timeout(2500) });
			if (res.ok && res.headers.get('content-type')?.includes('audio')) {
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
			try {
				this.audio.pause();
				this.audio.currentTime = 0;
			} catch {}
			this.audio.muted = false;
			this.audio.volume = Math.max(0.01, Math.min(1, (playback.volume ?? 100) / 100));
			this.audio.src = url;
			this.audio.load();
			const playPromise = this.audio.play();
			if (playPromise !== undefined) {
				playPromise
					.then(() => {
						playback.paused = false;
						this.startProgress();
						this.updateMediaSessionState('playing');
					})
					.catch((e) => {
						console.warn('[Direct Audio Play Error]', e);
						if (e.name === 'NotAllowedError') {
							const resumeOnClick = () => {
								if (this.audio && this.audio.paused && this.audio.src) {
									this.audio.play().catch(() => {});
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
		if (this.audio) {
			try {
				this.audio.pause();
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

		// 3. FMHY Item Lookup
		if (item.video_id && (item.video_id.startsWith('fmhy_') || item.video_id.startsWith('radio_'))) {
			const { findFmhyItem } = await import('./fmhy');
			const fmItem = findFmhyItem(item.video_id);
			if (fmItem) {
				if (fmItem.streamUrl) {
					item.streamUrl = fmItem.streamUrl;
					this.isRadioStream = fmItem.duration === 'LIVE';
					this.usingDirectAudio = !this.isRadioStream;
					this.playAudioDirect(fmItem.streamUrl);
					return;
				}
				if (fmItem.videoId) {
					this.loadAndPlayYt(fmItem.videoId);
					return;
				}
			}
		}

		// 4. JioSaavn 320kbps Lossless Audio Resolver (Zero Ad, CD Quality, 100% Reliable)
		if (!item.video_id?.startsWith('LOCAL:')) {
			const query = cleanSearchQuery(item.title, item.artists);
			if (query) {
				try {
					let results = await searchSaavnDirect(query);
					if (!results.length) {
						const titleOnly = cleanSearchQuery(item.title);
						results = await searchSaavnDirect(titleOnly);
					}
					if (results.length > 0 && results[0]?.streamUrl) {
						const match = results[0];
						if (match.streamUrl) {
							item.streamUrl = match.streamUrl;
							if (match.thumbnail && !item.thumbnail) item.thumbnail = match.thumbnail;
							this.isRadioStream = false;
							this.usingDirectAudio = true;
							this.playAudioDirect(match.streamUrl);
							return;
						}
					}
				} catch (e) {
					console.warn('[JioSaavn search resolver error]', e);
				}
			}
		}

		// 5. Backend Direct Audio Stream Extractor Proxy
		const targetVideoId = (await this.resolveBestVideoId(item)) || item.video_id;
		if (targetVideoId && targetVideoId.length === 11) {
			try {
				const directStream = await this.getDirectAudioUrl(targetVideoId);
				if (directStream) {
					item.streamUrl = directStream;
					this.isRadioStream = false;
					this.usingDirectAudio = true;
					this.playAudioDirect(directStream);
					return;
				}
			} catch {}

			// 6. YouTube IFrame Fallback
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
				this.audio.muted = false;
				this.audio.volume = Math.max(0.01, Math.min(1, (playback.volume ?? 100) / 100));
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
					this.ytPlayer.unMute();
					this.ytPlayer.setVolume(playback.volume ?? 100);
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
			this.audio.muted = false;
			this.audio.volume = Math.max(0, Math.min(1, volume / 100));
		}
		if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.setVolume === 'function') {
			try {
				this.ytPlayer.unMute();
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
