import fs from 'node:fs';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

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
		strictPort: true
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
