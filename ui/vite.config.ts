import fs from 'node:fs';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import CryptoJS from 'crypto-js';

function decryptSaavnUrl(encryptedUrl: string) {
	if (!encryptedUrl) return null;
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
	} catch {
		return null;
	}
}

function formatSaavnSong(item: any) {
	const stream = decryptSaavnUrl(item.encrypted_media_url);
	const durationSec = parseInt(item.duration, 10) || 0;
	const mins = Math.floor(durationSec / 60);
	const secs = durationSec % 60;
	const durationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

	const clean = (s?: string) =>
		(s || '')
			.replace(/&quot;/g, '"')
			.replace(/&#039;/g, "'")
			.replace(/&amp;/g, '&');

	return {
		id: `saavn_${item.id}`,
		video_id: `saavn_${item.id}`,
		title: clean(item.song || item.title),
		artists: clean(item.primary_artists || item.singers || item.artist || item.more_info?.primary_artists),
		artist_id: item.primary_artists_id || '',
		album: clean(item.album || item.more_info?.album),
		album_id: item.album_id || '',
		thumbnail: (item.image || '').replace('150x150', '500x500').replace('50x50', '500x500'),
		duration: durationStr,
		duration_seconds: durationSec,
		streamUrl: stream?.high || stream?.medium || stream?.raw || item.media_preview_url || null,
		has_lyrics: item.has_lyrics === 'true' || item.has_lyrics === true,
		source: 'saavn',
		quality: '320kbps'
	};
}

function deduplicateSongs(items: any[]) {
	if (!Array.isArray(items)) return [];
	const seen = new Set<string>();
	const out: any[] = [];
	for (const item of items) {
		if (!item || !item.title) continue;
		const cleanTitle = String(item.title)
			.toLowerCase()
			.replace(/\(.*?\)/g, '')
			.replace(/\[.*?\]/g, '')
			.replace(/[^\p{L}\p{N}\s]/gu, '')
			.replace(/\s+/g, ' ')
			.trim();
		const rawArtist = String(item.artists || item.artist || item.subtitle || '').split(',')[0].split('&')[0];
		const cleanArtist = rawArtist
			.toLowerCase()
			.replace(/320kbps.*$/gi, '')
			.replace(/[^\p{L}\p{N}\s]/gu, '')
			.replace(/\s+/g, ' ')
			.trim();
		const key = cleanArtist ? `${cleanTitle}::${cleanArtist}` : cleanTitle;
		const idKey = item.video_id || item.id;
		if (seen.has(key) || (idKey && seen.has(idKey))) continue;
		seen.add(key);
		if (idKey) seen.add(idKey);
		out.push(item);
	}
	return out;
}

const fixHugeIconsPlugin = {
	name: 'fix-hugeicons-case-sensitivity',
	resolveId(source: string, importer: string | undefined) {
		if (importer && importer.includes('@hugeicons/core-free-icons') && source.startsWith('./')) {
			const dir = path.dirname(importer);
			const requestedFile = source.slice(2);
			const targetPath = path.resolve(dir, requestedFile);
			if (!fs.existsSync(targetPath)) {
				try {
					const files = fs.readdirSync(dir);
					const lower = requestedFile.toLowerCase();
					const match = files.find((f) => f.toLowerCase() === lower);
					if (match) {
						return path.resolve(dir, match);
					}
				} catch {}
			}
		}
		return null;
	}
};

export default defineConfig({
	server: {
		port: 5183,
		strictPort: true,
		proxy: {
			'/api': {
				target: 'http://localhost:3000',
				changeOrigin: true
			}
		}
	},
	plugins: [
		fixHugeIconsPlugin,
		{
			name: 'echo-music-dev-proxy',
			configureServer(server) {
				server.middlewares.use((_req, res, next) => {
					res.setHeader('Referrer-Policy', 'no-referrer');
					next();
				});

				server.middlewares.use(async (req: any, res: any, next: any) => {
					// 1. Saavn Search API
					if (req.url && req.url.startsWith('/api/saavn/search?')) {
						const params = new URLSearchParams(req.url.split('?')[1] || '');
						const query = params.get('q') || params.get('query');
						if (!query) {
							res.statusCode = 400;
							res.setHeader('Content-Type', 'application/json');
							res.end(JSON.stringify({ error: 'Missing query' }));
							return;
						}
						const page = parseInt(params.get('p') || params.get('page') || '1', 10);
						const limit = parseInt(params.get('n') || params.get('limit') || '20', 10);

						try {
							const searchUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&p=${page}&n=${limit}&q=${encodeURIComponent(query)}`;
							const sRes = await fetch(searchUrl, {
								headers: {
									'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
									Referer: 'https://www.jiosaavn.com/'
								}
							});
							const data = await sRes.json();
							const rawResults = (data.results || []).map(formatSaavnSong).filter((s: any) => s.streamUrl);
							const results = deduplicateSongs(rawResults);
							res.setHeader('Content-Type', 'application/json');
							res.end(JSON.stringify({ success: true, total: results.length, results }));
						} catch (e) {
							res.statusCode = 500;
							res.setHeader('Content-Type', 'application/json');
							res.end(JSON.stringify({ error: String(e) }));
						}
						return;
					}

					// 2. Saavn Trending API
					if (req.url && req.url.startsWith('/api/saavn/trending')) {
						try {
							const chartsUrl = `https://www.jiosaavn.com/api.php?__call=content.getCharts&_format=json&_marker=0&cc=in`;
							const featuredUrl = `https://www.jiosaavn.com/api.php?__call=content.getFeaturedPlaylists&_format=json&_marker=0&cc=in&p=1&n=15`;
							const [chartsRes, featRes] = await Promise.all([
								fetch(chartsUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }),
								fetch(featuredUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
							]);
							const charts = await chartsRes.json();
							const featured = await featRes.json();
							const formattedCharts = (charts || []).slice(0, 10).map((c: any) => ({
								id: c.id || c.listid,
								title: (c.title || c.listname || '').replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
								subtitle: c.count ? `${c.count} Songs` : 'Top Chart',
								thumbnail: (c.image || '').replace('150x150', '500x500'),
								type: 'chart'
							}));
							const formattedPlaylists = (featured.data || featured || []).slice(0, 15).map((p: any) => ({
								id: p.id || p.listid,
								title: (p.title || p.listname || '').replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
								subtitle: (p.subtitle || p.more_info?.firstname || 'Featured Playlist').replace(/&quot;/g, '"'),
								thumbnail: (p.image || '').replace('150x150', '500x500'),
								type: 'playlist'
							}));
							res.setHeader('Content-Type', 'application/json');
							res.end(JSON.stringify({ charts: formattedCharts, featured: formattedPlaylists }));
						} catch (e) {
							res.statusCode = 500;
							res.setHeader('Content-Type', 'application/json');
							res.end(JSON.stringify({ error: String(e) }));
						}
						return;
					}

					// 3. Saavn Playlist Details
					if (req.url && req.url.startsWith('/api/saavn/playlist?')) {
						const params = new URLSearchParams(req.url.split('?')[1] || '');
						const playlistId = params.get('id') || params.get('listid');
						if (!playlistId) {
							res.statusCode = 400;
							res.setHeader('Content-Type', 'application/json');
							res.end(JSON.stringify({ error: 'Missing id' }));
							return;
						}
						try {
							const url = `https://www.jiosaavn.com/api.php?__call=playlist.getDetails&_format=json&_marker=0&cc=in&listid=${encodeURIComponent(playlistId)}`;
							const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
							const data = await resp.json();
							const rawSongs = (data.songs || data.list || []).map(formatSaavnSong).filter((s: any) => s.streamUrl);
							const songs = deduplicateSongs(rawSongs);
							res.setHeader('Content-Type', 'application/json');
							res.end(JSON.stringify({
								id: data.id || playlistId,
								title: (data.title || data.listname || '').replace(/&quot;/g, '"'),
								thumbnail: (data.image || '').replace('150x150', '500x500'),
								songs
							}));
						} catch (e) {
							res.statusCode = 500;
							res.setHeader('Content-Type', 'application/json');
							res.end(JSON.stringify({ error: String(e) }));
						}
						return;
					}

					// 4. Unified Search
					if (req.url && req.url.startsWith('/api/search/unified?')) {
						const params = new URLSearchParams(req.url.split('?')[1] || '');
						const query = params.get('q') || params.get('query');
						if (!query) {
							res.statusCode = 400;
							res.setHeader('Content-Type', 'application/json');
							res.end(JSON.stringify({ error: 'Missing query' }));
							return;
						}
						try {
							const searchUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&p=1&n=20&q=${encodeURIComponent(query)}`;
							const saavnRes = await fetch(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
							const data = await saavnRes.json();
							const rawSaavnSongs = (data.results || []).map(formatSaavnSong).filter((s: any) => s.streamUrl);
							const saavnSongs = deduplicateSongs(rawSaavnSongs);
							res.setHeader('Content-Type', 'application/json');
							res.end(JSON.stringify({ success: true, songs: saavnSongs, total: saavnSongs.length }));
						} catch (e) {
							res.statusCode = 500;
							res.setHeader('Content-Type', 'application/json');
							res.end(JSON.stringify({ error: String(e) }));
						}
						return;
					}
					if (req.url && req.url.startsWith('/api/yt-music/')) {
						const endpoint = req.url.replace('/api/yt-music/', '').split('?')[0];
						let body = '';
						req.on('data', (chunk: any) => {
							body += chunk;
						});
						req.on('end', async () => {
							try {
								const parsedBody = body ? JSON.parse(body) : {};
								const payload = {
									context: {
										client: {
											clientName: 'WEB_REMIX',
											clientVersion: '1.20240101.01.00',
											hl: 'en',
											gl: 'IN'
										}
									},
									...parsedBody
								};
								const ytRes = await fetch(`https://music.youtube.com/youtubei/v1/${endpoint}?prettyPrint=false`, {
									method: 'POST',
									headers: {
										'Content-Type': 'application/json',
										'User-Agent':
											'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
										'X-YouTube-Client-Name': '67',
										'X-YouTube-Client-Version': '1.20240101.01.00',
										Origin: 'https://music.youtube.com',
										Referer: 'https://music.youtube.com/'
									},
									body: JSON.stringify(payload)
								});
								const data = await ytRes.text();
								res.setHeader('Content-Type', 'application/json');
								res.end(data);
							} catch (e) {
								res.statusCode = 500;
								res.setHeader('Content-Type', 'application/json');
								res.end(JSON.stringify({ error: String(e) }));
							}
						});
						return;
					}

					if (req.url && req.url.startsWith('/api/lyrics?')) {
						const qs = req.url.split('?')[1] || '';
						try {
							const lyrRes = await fetch(`https://lrclib.net/api/get?${qs}`, {
								headers: {
									'User-Agent': 'Echo Music v0.7.4'
								}
							});
							const data = await lyrRes.text();
							res.setHeader('Content-Type', 'application/json');
							res.end(data);
						} catch (e) {
							res.statusCode = 500;
							res.setHeader('Content-Type', 'application/json');
							res.end(JSON.stringify({ error: String(e) }));
						}
						return;
					}

					if (req.url && req.url.startsWith('/api/spotify/resolve?')) {
						const params = new URLSearchParams(req.url.split('?')[1] || '');
						const targetUrl = params.get('url');
						if (!targetUrl) {
							res.statusCode = 400;
							res.setHeader('Content-Type', 'application/json');
							res.end(JSON.stringify({ error: 'Missing url parameter' }));
							return;
						}

						try {
							// Parse Spotify URL to construct embed URL
							let embedUrl = targetUrl;
							const match = targetUrl.match(/open\.spotify\.com\/(track|playlist|album|artist)\/([a-zA-Z0-9]+)/);
							if (match) {
								const [, type, id] = match;
								embedUrl = `https://open.spotify.com/embed/${type}/${id}`;
							}

							const spRes = await fetch(embedUrl, {
								headers: {
									'User-Agent':
										'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
								}
							});

							const html = await spRes.text();
							const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
							if (nextDataMatch) {
								const parsed = JSON.parse(nextDataMatch[1]);
								const entity = parsed.props?.pageProps?.state?.data?.entity;
								res.setHeader('Content-Type', 'application/json');
								res.end(JSON.stringify({ success: true, entity }));
								return;
							}

							res.statusCode = 404;
							res.setHeader('Content-Type', 'application/json');
							res.end(JSON.stringify({ error: 'Could not extract Spotify entity data' }));
						} catch (e) {
							res.statusCode = 500;
							res.setHeader('Content-Type', 'application/json');
							res.end(JSON.stringify({ error: String(e) }));
						}
						return;
					}

					if (req.url && req.url.startsWith('/api/stream?')) {
						const params = new URLSearchParams(req.url.split('?')[1] || '');
						const videoId = params.get('videoId');
						if (!videoId) {
							res.statusCode = 400;
							res.setHeader('Content-Type', 'application/json');
							res.end(JSON.stringify({ error: 'Missing videoId' }));
							return;
						}

						try {
							// Fetch direct ad-free GoogleVideo audio stream using ANDROID_VR client
							const playerRes = await fetch('https://www.youtube.com/youtubei/v1/player', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
									'User-Agent':
										'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
								},
								body: JSON.stringify({
									context: {
										client: {
											clientName: 'ANDROID_VR',
											clientVersion: '1.61.48',
											hl: 'en',
											gl: 'US'
										}
									},
									videoId
								})
							});

							const playerData = await playerRes.json();
							const formats = playerData.streamingData?.adaptiveFormats || [];
							const audioFormat =
								formats.find((f: any) => (f.itag === 140 || f.itag === 251) && f.url) ||
								formats.find((f: any) => f.mimeType?.startsWith('audio/') && f.url);

							if (!audioFormat || !audioFormat.url) {
								res.statusCode = 404;
								res.setHeader('Content-Type', 'application/json');
								res.end(JSON.stringify({ error: 'No direct audio format found' }));
								return;
							}

							const headers: Record<string, string> = {};
							if (req.headers.range) {
								headers['Range'] = req.headers.range;
							}

							const streamRes = await fetch(audioFormat.url, { headers });
							res.statusCode = streamRes.status;

							const copyHeaders = ['content-type', 'content-length', 'content-range', 'accept-ranges'];
							for (const h of copyHeaders) {
								const val = streamRes.headers.get(h);
								if (val) res.setHeader(h, val);
							}
							res.setHeader('Cache-Control', 'public, max-age=3600');

							if (streamRes.body) {
								const reader = streamRes.body.getReader();
								const pump = async () => {
									try {
										while (true) {
											const { done, value } = await reader.read();
											if (done) break;
											res.write(value);
										}
										res.end();
									} catch {
										res.end();
									}
								};
								pump();
							} else {
								const buf = await streamRes.arrayBuffer();
								res.end(new Uint8Array(buf));
							}
						} catch (e) {
							res.statusCode = 500;
							res.setHeader('Content-Type', 'application/json');
							res.end(JSON.stringify({ error: String(e) }));
						}
						return;
					}

					if (req.url && req.url.startsWith('/api/radio/stations')) {
						const stations = [
							{
								id: 'radio_lofi_girl',
								title: 'Lofi Girl - Relax & Study Radio',
								subtitle: 'Chillhop / Lofi Beats',
								thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/maxresdefault.jpg',
								videoId: 'jfKfPfyJRdk',
								duration: 'LIVE',
								artists: 'Lofi Girl'
							},
							{
								id: 'radio_synthwave',
								title: 'Synthwave Radio - Chill / Retro Beats',
								subtitle: 'Lofi Girl / Synthwave',
								thumbnail: 'https://i.ytimg.com/vi/4xDzrJKXOOY/maxresdefault.jpg',
								videoId: '4xDzrJKXOOY',
								duration: 'LIVE',
								artists: 'Lofi Girl'
							},
							{
								id: 'radio_somafm_drone',
								title: 'SomaFM Drone Zone',
								subtitle: 'Served with Best Ambient Textures',
								thumbnail: 'https://somafm.com/img3/dronezone400.jpg',
								streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3',
								videoId: 'ambient_drone_soma',
								duration: 'LIVE',
								artists: 'SomaFM'
							},
							{
								id: 'radio_nightwave_plaza',
								title: 'Nightwave Plaza',
								subtitle: 'Vaporwave Radio',
								thumbnail: 'https://plaza.one/img/logo.png',
								streamUrl: 'https://radio.plaza.one/mp3',
								videoId: 'nightwave_plaza_stream',
								duration: 'LIVE',
								artists: 'Nightwave Plaza'
							},
							{
								id: 'radio_chillhop',
								title: 'Chillhop Radio - Jazzy & Lofi Beats',
								subtitle: 'Chillhop Music',
								thumbnail: 'https://i.ytimg.com/vi/5yx6BWlEVcY/maxresdefault.jpg',
								videoId: '5yx6BWlEVcY',
								duration: 'LIVE',
								artists: 'Chillhop Music'
							}
						];
						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify(stations));
						return;
					}

					next();
				});
			}
		},
		tailwindcss(),
		sveltekit()
	]
});
