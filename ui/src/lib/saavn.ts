// Pure Client-Side & High-Availability JioSaavn 320kbps Lossless Audio Resolver
import CryptoJS from 'crypto-js';
import type { BrowseItem, SongItem } from './api';
import { getApiUrl } from './apiBase';

export interface DecryptedStreamUrls {
	low: string;
	medium: string;
	high: string;
	raw: string;
}

export function decryptSaavnUrl(encryptedUrl: string): DecryptedStreamUrls | null {
	if (!encryptedUrl || typeof encryptedUrl !== 'string') return null;
	try {
		const key = CryptoJS.enc.Utf8.parse('38346591');
		const cipherParams = CryptoJS.lib.CipherParams.create({
			ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl.trim())
		});
		const decrypted = CryptoJS.DES.decrypt(
			cipherParams,
			key,
			{ mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
		);
		const rawUrl = decrypted.toString(CryptoJS.enc.Utf8);
		if (!rawUrl || !rawUrl.startsWith('http')) return null;

		return {
			low: rawUrl.replace(/_[0-9]+\.mp4/, '_96.mp4').replace(/_[0-9]+\.mp3/, '_96.mp3'),
			medium: rawUrl.replace(/_[0-9]+\.mp4/, '_160.mp4').replace(/_[0-9]+\.mp3/, '_160.mp3'),
			high: rawUrl.replace(/_[0-9]+\.mp4/, '_320.mp4').replace(/_[0-9]+\.mp3/, '_320.mp3'),
			raw: rawUrl
		};
	} catch (e) {
		console.warn('[Saavn Decrypt Error]', e);
		return null;
	}
}

export function formatSaavnSong(item: any): SongItem | null {
	if (!item) return null;
	const stream = decryptSaavnUrl(item.encrypted_media_url);
	const streamUrl = stream?.high || stream?.medium || stream?.raw || item.media_preview_url || null;

	const durationSec = parseInt(item.duration, 10) || 0;
	const mins = Math.floor(durationSec / 60);
	const secs = durationSec % 60;
	const durationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

	const clean = (s?: string) =>
		(s || '')
			.replace(/&quot;/g, '"')
			.replace(/&#039;/g, "'")
			.replace(/&amp;/g, '&')
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>');

	const title = clean(item.song || item.title);
	const artists = clean(item.primary_artists || item.singers || item.artist || item.more_info?.primary_artists || 'Unknown Artist');
	const album = clean(item.album || item.more_info?.album || 'Single');

	return {
		video_id: `saavn_${item.id}`,
		title: title || 'Unknown Title',
		artists: artists,
		artist_runs: [{ text: artists }],
		artist_id: item.primary_artists_id || '',
		album: album,
		album_id: item.album_id || '',
		thumbnail: (item.image || '')
			.replace('150x150', '500x500')
			.replace('50x50', '500x500'),
		duration: durationStr,
		duration_seconds: durationSec,
		streamUrl: streamUrl,
		is_video: false,
		is_upload: false,
		explicit: item.explicit_content === '1' || item.explicit_content === true,
		source: 'saavn',
		quality: '320kbps'
	} as SongItem;
}

// Multi-endpoint search proxy & direct fallback
export async function searchSaavnDirect(query: string, page = 1, limit = 20): Promise<SongItem[]> {
	if (!query || !query.trim()) return [];
	const cleanQuery = query.trim();

	// 1. Try local dev / backend proxy first
	try {
		const apiUrl = getApiUrl(`/api/saavn/search?q=${encodeURIComponent(cleanQuery)}&p=${page}&n=${limit}`);
		const res = await fetch(apiUrl, { signal: AbortSignal.timeout(6000) });
		if (res.ok) {
			const data = await res.json();
			if (Array.isArray(data.results) && data.results.length > 0) {
				return data.results.map((r: any) => ({
					...r,
					video_id: r.video_id || `saavn_${r.id}`,
					artist_runs: r.artist_runs || [{ text: r.artists }]
				}));
			}
		}
	} catch {}

	// 2. Direct CORS-friendly endpoints with client-side DES decryption
	const directEndpoints = [
		`https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&p=${page}&n=${limit}&q=${encodeURIComponent(cleanQuery)}`,
		`https://corsproxy.io/?url=${encodeURIComponent(`https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&p=${page}&n=${limit}&q=${encodeURIComponent(cleanQuery)}`)}`,
		`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&p=${page}&n=${limit}&q=${encodeURIComponent(cleanQuery)}`)}`
	];

	for (const ep of directEndpoints) {
		try {
			const res = await fetch(ep, {
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
				},
				signal: AbortSignal.timeout(4000)
			});
			if (res.ok) {
				const text = await res.text();
				if (!text.includes('{') && !text.includes('[')) continue;
				const data = JSON.parse(text);
				const results = (data.results || data.data?.results || [])
					.map(formatSaavnSong)
					.filter((s: SongItem | null): s is SongItem => !!s && !!s.streamUrl);
				if (results.length > 0) return results;
			}
		} catch {}
	}

	return [];
}

export async function fetchSaavnTrendingDirect(): Promise<{ charts: BrowseItem[]; featured: BrowseItem[] }> {
	// 1. Try local dev/backend proxy first
	try {
		const apiUrl = getApiUrl('/api/saavn/trending');
		const res = await fetch(apiUrl, { signal: AbortSignal.timeout(6000) });
		if (res.ok) {
			const data = await res.json();
			const charts: BrowseItem[] = (data.charts || []).map((c: any) => ({
				kind: 'playlist',
				id: `saavn_${c.id}`,
				title: c.title,
				subtitle: `${c.subtitle} • 320kbps Lossless`,
				thumbnail: c.thumbnail,
				artistRuns: [{ text: 'JioSaavn' }],
				isUpload: false,
				explicit: false
			}));
			const featured: BrowseItem[] = (data.featured || []).map((f: any) => ({
				kind: 'playlist',
				id: `saavn_${f.id}`,
				title: f.title,
				subtitle: `${f.subtitle} • 320kbps Lossless`,
				thumbnail: f.thumbnail,
				artistRuns: [{ text: 'Featured' }],
				isUpload: false,
				explicit: false
			}));
			return { charts, featured };
		}
	} catch {}

	return { charts: [], featured: [] };
}

export async function fetchSaavnPlaylistDirect(playlistId: string): Promise<SongItem[]> {
	const cleanId = playlistId.replace('saavn_', '');

	// 1. Try local proxy
	try {
		const apiUrl = getApiUrl(`/api/saavn/playlist?id=${encodeURIComponent(cleanId)}`);
		const res = await fetch(apiUrl, { signal: AbortSignal.timeout(8000) });
		if (res.ok) {
			const data = await res.json();
			return (data.songs || []).map((s: any) => ({
				...s,
				video_id: s.video_id || `saavn_${s.id}`,
				artist_runs: s.artist_runs || [{ text: s.artists }]
			}));
		}
	} catch {}

	// 2. Direct CORS fallback
	try {
		const directUrl = `https://www.jiosaavn.com/api.php?__call=playlist.getDetails&_format=json&_marker=0&cc=in&listid=${encodeURIComponent(cleanId)}`;
		const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(directUrl)}`;
		const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(6000) });
		if (res.ok) {
			const data = await res.json();
			const songs = (data.songs || data.list || [])
				.map(formatSaavnSong)
				.filter((s: SongItem | null): s is SongItem => !!s && !!s.streamUrl);
			if (songs.length > 0) return songs;
		}
	} catch {}

	return [];
}
