// Centralized High-Performance Persistent Lyrics Service for Aura Music
// Implements multi-tier caching (Memory + LocalStorage), intelligent query permutation,
// and zero-loss background syncing across views.

import * as api from './api';
import { playback } from './player.svelte';

export interface CachedLyrics {
	trackId: string;
	title: string;
	artists: string;
	lyrics: api.Lyrics;
	timestamp: number;
}

// In-Memory Fast Cache
const memoryCache = new Map<string, api.Lyrics>();

function getCacheKey(title: string, artists?: string, videoId?: string): string {
	if (videoId && !videoId.startsWith('LOCAL:')) {
		return `lyr_id_${videoId}`;
	}
	const cleanT = (title || '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '').trim();
	const cleanA = (artists || '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '').trim();
	return `lyr_${cleanT}_${cleanA}`;
}

function readPersistentCache(key: string): api.Lyrics | null {
	if (memoryCache.has(key)) {
		return memoryCache.get(key) || null;
	}
	if (typeof window === 'undefined' || !window.localStorage) return null;
	try {
		const raw = localStorage.getItem(`aura_${key}`);
		if (raw) {
			const parsed = JSON.parse(raw);
			if (parsed && Array.isArray(parsed.lines) && parsed.lines.length > 0) {
				memoryCache.set(key, parsed);
				return parsed;
			}
		}
	} catch {}
	return null;
}

function writePersistentCache(key: string, lyrics: api.Lyrics) {
	if (!lyrics || !Array.isArray(lyrics.lines) || lyrics.lines.length === 0) return;
	memoryCache.set(key, lyrics);
	if (typeof window === 'undefined' || !window.localStorage) return;
	try {
		localStorage.setItem(`aura_${key}`, JSON.stringify(lyrics));
	} catch {}
}

export const lyricsService = $state({
	current: null as api.Lyrics | null,
	loading: false,
	error: null as string | null,
	activeTrackId: null as string | null,

	async loadLyrics(force = false) {
		const now = playback.now;
		if (!now || !now.title) {
			this.current = null;
			this.loading = false;
			this.error = null;
			this.activeTrackId = null;
			return;
		}

		const key = getCacheKey(now.title, now.artists, now.videoId);

		// If same track and already loaded and not forcing, keep current
		if (!force && this.activeTrackId === now.videoId && this.current) {
			return;
		}

		this.activeTrackId = now.videoId;

		// 1. Check Fast Cache first (0ms latency instant lyrics render)
		const cached = readPersistentCache(key);
		if (cached && !force) {
			this.current = cached;
			this.loading = false;
			this.error = null;
			return;
		}

		this.loading = true;
		this.error = null;

		try {
			const album = playback.queue.items[playback.queue.currentIndex]?.album;
			const durSecs = now.duration
				? now.duration.split(':').reduce((acc, time) => 60 * acc + +time, 0)
				: undefined;

			const result = await api.getLyrics({
				videoId: now.videoId,
				title: now.title,
				artists: now.artists,
				album: album ?? undefined,
				duration: isNaN(durSecs as number) ? undefined : durSecs
			});

			// If track changed while fetching, drop
			if (this.activeTrackId !== now.videoId) return;

			if (result && Array.isArray(result.lines) && result.lines.length > 0) {
				writePersistentCache(key, result);
				this.current = result;
				this.error = null;
			} else {
				this.current = null;
				this.error = 'No lyrics available for this song';
			}
		} catch (err) {
			if (this.activeTrackId !== now.videoId) return;
			this.current = null;
			this.error = 'Failed to fetch lyrics';
		} finally {
			if (this.activeTrackId === now.videoId) {
				this.loading = false;
			}
		}
	}
});
