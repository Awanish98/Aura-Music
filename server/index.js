import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import CryptoJS from 'crypto-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
	res.setHeader('Referrer-Policy', 'no-referrer');
	next();
});

// Health check
app.get('/api/health', (req, res) => {
	res.json({
		status: 'ok',
		app: 'Aura Music Backend & FMHY Audio Engine',
		version: '1.2.0',
		sources: [
			'JioSaavn 320kbps Lossless',
			'Spotify Metadata',
			'YouTube Music',
			'FMHY 24/7 Live Radio',
			'LRCLIB Synced Lyrics'
		],
		uptime: process.uptime()
	});
});

// Decrypt JioSaavn Media URL for direct 320kbps / 160kbps stream
function decryptSaavnUrl(encryptedUrl) {
	if (!encryptedUrl) return null;
	try {
		const key = CryptoJS.enc.Utf8.parse('38346591');
		const decrypted = CryptoJS.DES.decrypt(
			{ ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl) },
			key,
			{ mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
		);
		const rawUrl = decrypted.toString(CryptoJS.enc.Utf8);
		if (!rawUrl) return null;
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

// Format JioSaavn Song Object to standard SongItem
function formatSaavnSong(item) {
	const stream = decryptSaavnUrl(item.encrypted_media_url);
	const durationSec = parseInt(item.duration, 10) || 0;
	const mins = Math.floor(durationSec / 60);
	const secs = durationSec % 60;
	const durationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

	return {
		id: `saavn_${item.id}`,
		video_id: `saavn_${item.id}`,
		title: (item.song || item.title || '')
			.replace(/&quot;/g, '"')
			.replace(/&#039;/g, "'")
			.replace(/&amp;/g, '&'),
		artists: (item.primary_artists || item.singers || item.artist || item.more_info?.primary_artists || '')
			.replace(/&quot;/g, '"')
			.replace(/&#039;/g, "'")
			.replace(/&amp;/g, '&'),
		artist_id: item.primary_artists_id || '',
		album: (item.album || item.more_info?.album || '')
			.replace(/&quot;/g, '"')
			.replace(/&#039;/g, "'")
			.replace(/&amp;/g, '&'),
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

// 1. JioSaavn High-Fidelity 320kbps Song Search
app.get('/api/saavn/search', async (req, res) => {
	const query = req.query.q || req.query.query;
	if (!query) return res.status(400).json({ error: 'Missing query parameter' });

	const page = parseInt(req.query.p || req.query.page || '1', 10);
	const limit = parseInt(req.query.n || req.query.limit || '20', 10);

	try {
		const searchUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&p=${page}&n=${limit}&q=${encodeURIComponent(query)}`;
		const saavnRes = await fetch(searchUrl, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
				Referer: 'https://www.jiosaavn.com/'
			}
		});
		const data = await saavnRes.json();
		const results = (data.results || []).map(formatSaavnSong).filter((s) => s.streamUrl);
		res.json({
			success: true,
			total: data.total || results.length,
			results
		});
	} catch (e) {
		console.error('[Saavn Search Error]', e);
		res.status(500).json({ error: String(e) });
	}
});

// 2. JioSaavn Trending Charts, Top Shows & Featured Playlists
app.get('/api/saavn/trending', async (req, res) => {
	try {
		const chartsUrl = `https://www.jiosaavn.com/api.php?__call=content.getCharts&_format=json&_marker=0&cc=in`;
		const featuredUrl = `https://www.jiosaavn.com/api.php?__call=content.getFeaturedPlaylists&_format=json&_marker=0&cc=in&p=1&n=15`;

		const [chartsRes, featRes] = await Promise.all([
			fetch(chartsUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }),
			fetch(featuredUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
		]);

		const charts = await chartsRes.json();
		const featured = await featRes.json();

		const formattedCharts = (charts || []).slice(0, 10).map((c) => ({
			id: c.id || c.listid,
			title: (c.title || c.listname || '').replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
			subtitle: c.count ? `${c.count} Songs` : 'Top Chart',
			thumbnail: (c.image || '').replace('150x150', '500x500'),
			type: 'chart'
		}));

		const formattedPlaylists = (featured.data || featured || []).slice(0, 15).map((p) => ({
			id: p.id || p.listid,
			title: (p.title || p.listname || '').replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
			subtitle: (p.subtitle || p.more_info?.firstname || 'Featured Playlist').replace(/&quot;/g, '"'),
			thumbnail: (p.image || '').replace('150x150', '500x500'),
			type: 'playlist'
		}));

		res.json({
			charts: formattedCharts,
			featured: formattedPlaylists
		});
	} catch (e) {
		console.error('[Saavn Trending Error]', e);
		res.status(500).json({ error: String(e) });
	}
});

// 3. JioSaavn Playlist & Chart Tracklist Resolver
app.get('/api/saavn/playlist', async (req, res) => {
	const playlistId = req.query.id || req.query.listid;
	if (!playlistId) return res.status(400).json({ error: 'Missing id parameter' });

	try {
		const url = `https://www.jiosaavn.com/api.php?__call=playlist.getDetails&_format=json&_marker=0&cc=in&listid=${encodeURIComponent(playlistId)}`;
		const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
		const data = await resp.json();

		const songs = (data.songs || data.list || []).map(formatSaavnSong).filter((s) => s.streamUrl);
		res.json({
			id: data.id || playlistId,
			title: (data.title || data.listname || '').replace(/&quot;/g, '"'),
			thumbnail: (data.image || '').replace('150x150', '500x500'),
			songs
		});
	} catch (e) {
		console.error('[Saavn Playlist Error]', e);
		res.status(500).json({ error: String(e) });
	}
});

// 4. Unified Search (JioSaavn 320kbps + YouTube Music)
app.get('/api/search/unified', async (req, res) => {
	const query = req.query.q || req.query.query;
	if (!query) return res.status(400).json({ error: 'Missing query parameter' });

	try {
		const searchUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&p=1&n=20&q=${encodeURIComponent(query)}`;
		const saavnRes = await fetch(searchUrl, {
			headers: { 'User-Agent': 'Mozilla/5.0' }
		});
		const data = await saavnRes.json();
		const saavnSongs = (data.results || []).map(formatSaavnSong).filter((s) => s.streamUrl);

		res.json({
			success: true,
			songs: saavnSongs,
			total: saavnSongs.length
		});
	} catch (e) {
		res.status(500).json({ error: String(e) });
	}
});

// 5. YouTube Music InnerTube API Proxy
app.post('/api/yt-music/:endpoint', async (req, res) => {
	const endpoint = req.params.endpoint;
	const body = req.body || {};

	try {
		const payload = {
			context: {
				client: {
					clientName: 'WEB_REMIX',
					clientVersion: '1.20240101.01.00',
					hl: 'en',
					gl: 'IN'
				}
			},
			...body
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
		res.status(ytRes.status).send(data);
	} catch (e) {
		console.error('[YTM Proxy Error]', e);
		res.status(500).json({ error: String(e) });
	}
});

// 6. Direct Audio Stream Extractor & Streaming Pipe
app.get('/api/stream', async (req, res) => {
	const videoId = req.query.videoId;
	if (!videoId || typeof videoId !== 'string') {
		return res.status(400).json({ error: 'Missing or invalid videoId parameter' });
	}

	try {
		// Use ANDROID_VR client to extract non-throttled raw stream URLs
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
			formats.find((f) => (f.itag === 140 || f.itag === 251) && f.url) ||
			formats.find((f) => f.mimeType?.startsWith('audio/') && f.url);

		if (!audioFormat || !audioFormat.url) {
			return res.status(404).json({ error: 'No direct audio format found for video' });
		}

		const headers = {};
		if (req.headers.range) {
			headers['Range'] = req.headers.range;
		}

		const streamRes = await fetch(audioFormat.url, { headers });
		res.status(streamRes.status);

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
			res.end(Buffer.from(buf));
		}
	} catch (e) {
		console.error('[Audio Stream Pipe Error]', e);
		res.status(500).json({ error: String(e) });
	}
});

// 7. LRCLIB Synced Lyrics Proxy
app.get('/api/lyrics', async (req, res) => {
	const { title, artist, album, duration } = req.query;
	const qs = new URLSearchParams();
	if (title) qs.set('track_name', String(title));
	if (artist) qs.set('artist_name', String(artist));
	if (album) qs.set('album_name', String(album));
	if (duration) qs.set('duration', String(duration));

	try {
		const lyrRes = await fetch(`https://lrclib.net/api/get?${qs.toString()}`, {
			headers: { 'User-Agent': 'Aura Music v1.0.0' }
		});
		const data = await lyrRes.text();
		res.setHeader('Content-Type', 'application/json');
		res.status(lyrRes.status).send(data);
	} catch (e) {
		res.status(500).json({ error: String(e) });
	}
});

// 8. Spotify Entity & Metadata Resolver
app.get('/api/spotify/resolve', async (req, res) => {
	const targetUrl = req.query.url;
	if (!targetUrl || typeof targetUrl !== 'string') {
		return res.status(400).json({ error: 'Missing url parameter' });
	}

	try {
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
			return res.json({ success: true, entity });
		}

		res.status(404).json({ error: 'Could not extract Spotify entity data' });
	} catch (e) {
		res.status(500).json({ error: String(e) });
	}
});

// 9. FMHY 24/7 Live Radio Stations
app.get('/api/radio/stations', (req, res) => {
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
	res.json(stations);
});

// 10. Serve Built Static Frontend (if present)
const clientBuildPath = path.resolve(__dirname, '../ui/build');
app.use(express.static(clientBuildPath));

app.get('*', (req, res, next) => {
	if (req.path.startsWith('/api/')) return next();
	res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
		if (err) {
			res.status(404).send('Aura Music UI build not found. Run npm run build in ui folder.');
		}
	});
});

app.listen(PORT, '0.0.0.0', () => {
	console.log(`🎵 Aura Music Backend & FMHY Audio Server running on http://0.0.0.0:${PORT}`);
	console.log(`🚀 Unified Search: http://localhost:${PORT}/api/search/unified?q=Arijit+Singh`);
});
