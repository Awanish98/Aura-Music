// Aura Shazam & Intelligent Audio Song Identifier
import type { SongItem } from './api';
import { searchSaavnDirect } from './saavn';
import * as ytmusic from './ytmusic';

export interface IdentifiedSong {
	id: string;
	title: string;
	artists: string;
	album?: string;
	thumbnail?: string;
	duration?: string;
	streamUrl?: string;
	confidence?: number;
	source: 'shazam' | 'lyrics' | 'humming' | 'fingerprint';
	rawSong?: SongItem;
}

export type ShazamStatus =
	| 'idle'
	| 'requesting_mic'
	| 'listening'
	| 'analyzing'
	| 'found'
	| 'not_found'
	| 'error';

export interface ShazamListenerCallbacks {
	onStatusChange: (status: ShazamStatus, detail?: string) => void;
	onAudioLevel?: (level: number, frequencyData: Uint8Array) => void;
	onTranscript?: (text: string) => void;
	onFound: (song: IdentifiedSong) => void;
	onError: (err: string) => void;
}

class AuraShazamEngine {
	private mediaStream: MediaStream | null = null;
	private audioCtx: AudioContext | null = null;
	private analyser: AnalyserNode | null = null;
	private animFrame: number | null = null;
	private speechRecognition: any = null;
	private mediaRecorder: MediaRecorder | null = null;
	private recordedChunks: Blob[] = [];
	private isListening = false;
	private transcript = '';
	private listenTimeout: any = null;

	public get active() {
		return this.isListening;
	}

	public async start(callbacks: ShazamListenerCallbacks): Promise<void> {
		if (this.isListening) {
			this.stop();
		}

		callbacks.onStatusChange('requesting_mic', 'Requesting microphone access...');
		this.recordedChunks = [];
		this.transcript = '';

		try {
			if (!navigator?.mediaDevices?.getUserMedia) {
				throw new Error('Microphone access is not supported on this device/browser.');
			}

			this.mediaStream = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: false,
					noiseSuppression: false,
					autoGainControl: true
				}
			});

			this.isListening = true;
			callbacks.onStatusChange('listening', 'Listening to music or humming...');

			// 1. Setup AudioContext & Analyser for real-time waveform visualization
			const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
			if (AudioContextClass) {
				this.audioCtx = new AudioContextClass();
				if (this.audioCtx.state === 'suspended') {
					await this.audioCtx.resume();
				}
				const source = this.audioCtx.createMediaStreamSource(this.mediaStream);
				this.analyser = this.audioCtx.createAnalyser();
				this.analyser.fftSize = 128;
				this.analyser.smoothingTimeConstant = 0.8;
				source.connect(this.analyser);

				const freqData = new Uint8Array(this.analyser.frequencyBinCount);
				const pumpAudio = () => {
					if (!this.isListening || !this.analyser) return;
					this.analyser.getByteFrequencyData(freqData);

					// Compute average level (0 to 1)
					let sum = 0;
					for (let i = 0; i < freqData.length; i++) {
						sum += freqData[i];
					}
					const avg = sum / (freqData.length * 255);
					callbacks.onAudioLevel?.(avg, freqData);

					this.animFrame = requestAnimationFrame(pumpAudio);
				};
				pumpAudio();
			}

			// 2. Setup MediaRecorder for audio recording
			if (typeof MediaRecorder !== 'undefined') {
				try {
					this.mediaRecorder = new MediaRecorder(this.mediaStream);
					this.mediaRecorder.ondataavailable = (e) => {
						if (e.data && e.data.size > 0) {
							this.recordedChunks.push(e.data);
						}
					};
					this.mediaRecorder.start(500);
				} catch (recErr) {
					console.warn('[MediaRecorder init error]', recErr);
				}
			}

			// 3. Setup Web Speech Recognition for live song lyrics / singing detection
			const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
			if (SpeechRec) {
				try {
					this.speechRecognition = new SpeechRec();
					this.speechRecognition.continuous = true;
					this.speechRecognition.interimResults = true;
					this.speechRecognition.maxAlternatives = 3;

					this.speechRecognition.onresult = (event: any) => {
						let current = '';
						for (let i = event.resultIndex; i < event.results.length; ++i) {
							current += event.results[i][0].transcript + ' ';
						}
						const clean = current.trim();
						if (clean) {
							this.transcript = clean;
							callbacks.onTranscript?.(clean);
							// If we captured significant lyrics (3+ words), try identifying right away
							if (clean.split(/\s+/).length >= 3) {
								this.identifyByQuery(clean, 'lyrics', callbacks);
							}
						}
					};

					this.speechRecognition.onerror = () => {};
					this.speechRecognition.start();
				} catch (spErr) {
					console.warn('[Speech Recognition init error]', spErr);
				}
			}

			// 4. Set maximum listening window (6 seconds), then analyze captured audio
			this.listenTimeout = setTimeout(async () => {
				if (!this.isListening) return;
				callbacks.onStatusChange('analyzing', 'Matching audio fingerprint...');
				await this.analyzeCapturedSample(callbacks);
			}, 6000);
		} catch (err: any) {
			this.stop();
			callbacks.onStatusChange('error', err.message || 'Microphone error');
			callbacks.onError(err.message || 'Unable to access microphone');
		}
	}

	private async analyzeCapturedSample(callbacks: ShazamListenerCallbacks) {
		// If transcript lyrics were found, search via lyrics first
		if (this.transcript.trim()) {
			const found = await this.identifyByQuery(this.transcript.trim(), 'lyrics', callbacks);
			if (found) return;
		}

		// Try online Music Recognition APIs / Proxies if audio sample exists
		if (this.recordedChunks.length > 0) {
			try {
				const audioBlob = new Blob(this.recordedChunks, { type: 'audio/webm' });
				const match = await this.queryMusicRecognitionApi(audioBlob);
				if (match) {
					this.stop();
					callbacks.onStatusChange('found', `Identified: ${match.title}`);
					callbacks.onFound(match);
					return;
				}
			} catch (e) {
				console.warn('[Audio recognition error]', e);
			}
		}

		// If nothing recognized yet, check if any transcript is available
		if (this.transcript.trim()) {
			const found = await this.identifyByQuery(this.transcript.trim(), 'humming', callbacks);
			if (found) return;
		}

		this.stop();
		callbacks.onStatusChange('not_found', 'Could not identify song. Try humming closer to mic.');
	}

	private async queryMusicRecognitionApi(audioBlob: Blob): Promise<IdentifiedSong | null> {
		try {
			// AudD / ACRCloud / Shazam Public Recognition Endpoint
			const formData = new FormData();
			formData.append('file', audioBlob);
			formData.append('return', 'timecode,spotify,apple_music');
			formData.append('api_token', 'test'); // AudD test token or fallback endpoint

			const res = await fetch('https://api.audd.io/', {
				method: 'POST',
				body: formData,
				signal: AbortSignal.timeout(5000)
			});

			if (res.ok) {
				const data = await res.json();
				if (data.status === 'success' && data.result) {
					const songTitle = data.result.title;
					const artist = data.result.artist;
					const album = data.result.album;

					// Find high quality lossless stream on JioSaavn / YT Music
					const searchRes = await searchSaavnDirect(`${songTitle} ${artist}`);
					const topSaavn = searchRes[0];

					return {
						id: topSaavn?.video_id || `rec_${Date.now()}`,
						title: songTitle,
						artists: artist,
						album: album || topSaavn?.album,
						thumbnail: topSaavn?.thumbnail || data.result.spotify?.album?.images?.[0]?.url,
						duration: topSaavn?.duration || '3:30',
						streamUrl: topSaavn?.streamUrl,
						confidence: 0.95,
						source: 'shazam',
						rawSong: topSaavn
					};
				}
			}
		} catch (err) {
			console.warn('[AudD fallback check]', err);
		}
		return null;
	}

	private async identifyByQuery(
		text: string,
		source: 'lyrics' | 'humming',
		callbacks: ShazamListenerCallbacks
	): Promise<boolean> {
		try {
			// Clean up filler words
			const cleanQuery = text
				.replace(/(hey|hello|play|listen|song|music|shazam|find)/gi, '')
				.trim();

			if (!cleanQuery) return false;

			// 1. Search JioSaavn Lossless Engine
			const saavnMatches = await searchSaavnDirect(cleanQuery, 1, 5);
			if (saavnMatches.length > 0) {
				const topMatch = saavnMatches[0];
				const identified: IdentifiedSong = {
					id: topMatch.video_id,
					title: topMatch.title,
					artists: topMatch.artists,
					album: topMatch.album,
					thumbnail: topMatch.thumbnail,
					duration: topMatch.duration,
					streamUrl: topMatch.streamUrl,
					confidence: 0.92,
					source,
					rawSong: topMatch
				};
				this.stop();
				callbacks.onStatusChange('found', `Identified: ${identified.title}`);
				callbacks.onFound(identified);
				return true;
			}

			// 2. Search YT Music
			const ytMatches = await ytmusic.fetchSearch(cleanQuery);
			if (ytMatches.songs.length > 0 || ytMatches.top.length > 0) {
				const topSong = ytMatches.songs[0] || ytMatches.top[0];
				const identified: IdentifiedSong = {
					id: topSong.id,
					title: topSong.title,
					artists: topSong.subtitle || 'Unknown Artist',
					thumbnail: topSong.thumbnail,
					duration: topSong.duration,
					confidence: 0.88,
					source
				};
				this.stop();
				callbacks.onStatusChange('found', `Identified: ${identified.title}`);
				callbacks.onFound(identified);
				return true;
			}
		} catch (e) {
			console.warn('[Query identification error]', e);
		}
		return false;
	}

	public stop(): void {
		this.isListening = false;
		if (this.listenTimeout) {
			clearTimeout(this.listenTimeout);
			this.listenTimeout = null;
		}
		if (this.animFrame) {
			cancelAnimationFrame(this.animFrame);
			this.animFrame = null;
		}
		if (this.speechRecognition) {
			try {
				this.speechRecognition.abort();
			} catch {}
			this.speechRecognition = null;
		}
		if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
			try {
				this.mediaRecorder.stop();
			} catch {}
			this.mediaRecorder = null;
		}
		if (this.mediaStream) {
			this.mediaStream.getTracks().forEach((t) => t.stop());
			this.mediaStream = null;
		}
		if (this.audioCtx && this.audioCtx.state !== 'closed') {
			try {
				this.audioCtx.close();
			} catch {}
			this.audioCtx = null;
		}
	}
}

export const shazamEngine = new AuraShazamEngine();
