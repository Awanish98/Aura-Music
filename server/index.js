import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

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
		app: 'Aura Music Backend',
		version: '1.0.0',
		uptime: process.uptime()
	});
});

// 1. YouTube Music InnerTube API Proxy
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

// 2. Direct Ad-Free Audio Stream Extractor & Streaming Pipe
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
		
		// Prioritize high-quality audio streams (itag 140 = 128kbps AAC, itag 251 = 160kbps Opus)
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

// 3. LRCLIB Synced Lyrics Proxy
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

// 4. Spotify Entity & Metadata Resolver
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

// 5. Serve Built Static Frontend (if present)
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
	console.log(`🎵 Aura Music Backend Server running on http://0.0.0.0:${PORT}`);
	console.log(`🚀 Streaming Endpoint: http://localhost:${PORT}/api/stream?videoId=4NRXx6U8ABQ`);
});
