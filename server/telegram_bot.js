// ============================================================================
// AURA MUSIC TELEGRAM BOT ENGINE (@Aura36bot)
// High-Fidelity 320kbps Music Search, Instant Streaming, Telegram Mini App & Lyrics
// ============================================================================

import CryptoJS from 'crypto-js';

const TELEGRAM_BOT_TOKEN =
	process.env.TELEGRAM_BOT_TOKEN || '8840396258:AAFHti7zvAAs2V63DHmLEsLjUqZhvhEDTZs';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://aura-music-1no9.onrender.com';
const API_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Decrypt JioSaavn Encrypted Media URL (320kbps DES decryption)
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
		console.warn('[Telegram Bot Decrypt Error]', e.message);
		return null;
	}
}

// Clean HTML Entities and Special Chars
function cleanString(str) {
	if (!str) return '';
	return String(str)
		.replace(/&quot;/g, '"')
		.replace(/&#039;/g, "'")
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.trim();
}

// Format Song Details from JioSaavn Response
function formatSong(item) {
	const stream = decryptSaavnUrl(item.encrypted_media_url);
	const durationSec = parseInt(item.duration, 10) || 0;
	const mins = Math.floor(durationSec / 60);
	const secs = durationSec % 60;
	const durationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

	const rawId = item.id || item.video_id || '';
	const cleanId = String(rawId).replace(/^saavn_/, '');

	return {
		id: cleanId,
		raw_id: `saavn_${cleanId}`,
		title: cleanString(item.song || item.title || 'Unknown Title'),
		artists: cleanString(item.primary_artists || item.singers || item.artist || item.more_info?.primary_artists || 'Unknown Artist'),
		album: cleanString(item.album || item.more_info?.album || 'Single'),
		thumbnail: (item.image || '').replace('150x150', '500x500').replace('50x50', '500x500'),
		duration: durationStr,
		duration_seconds: durationSec,
		streamUrl: stream?.high || stream?.medium || stream?.raw || item.media_preview_url || null,
		year: item.year || item.more_info?.year || ''
	};
}

// Generic Telegram Bot API Request Handler
async function callTelegram(method, payload = {}) {
	try {
		const res = await fetch(`${API_BASE}/${method}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		const data = await res.json();
		if (!data.ok) {
			console.warn(`[Telegram API ${method} Error]`, data.description);
		}
		return data;
	} catch (e) {
		console.error(`[Telegram API ${method} Exception]`, e.message);
		return { ok: false, error: e.message };
	}
}

// ----------------------------------------------------------------------------
// MUSIC CATALOGUE INTEGRATION
// ----------------------------------------------------------------------------

// Search Songs via JioSaavn
async function searchSongs(query, limit = 5) {
	try {
		const searchUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&p=1&n=${limit}&q=${encodeURIComponent(query)}`;
		const res = await fetch(searchUrl, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
				Referer: 'https://www.jiosaavn.com/'
			}
		});
		const data = await res.json();
		const results = (data.results || []).map(formatSong).filter((s) => s.streamUrl);
		return results;
	} catch (e) {
		console.error('[Search Error]', e.message);
		return [];
	}
}

// Get Song Details by ID
async function getSongDetails(songId) {
	try {
		const cleanId = String(songId).replace(/^saavn_/, '');
		const detailsUrl = `https://www.jiosaavn.com/api.php?__call=song.getDetails&cc=in&_marker=0%3F_marker%3D0&_format=json&pids=${encodeURIComponent(cleanId)}`;
		const res = await fetch(detailsUrl, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
				Referer: 'https://www.jiosaavn.com/'
			}
		});
		const data = await res.json();
		const songObj = data[cleanId] || (Object.values(data)[0]);
		if (songObj) {
			return formatSong(songObj);
		}
		return null;
	} catch (e) {
		console.error('[Song Details Error]', e.message);
		return null;
	}
}

// Get Trending Charts
async function getTrendingHits() {
	try {
		const searchUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&p=1&n=8&q=${encodeURIComponent('Top Hits 2026')}`;
		const res = await fetch(searchUrl, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
			}
		});
		const data = await res.json();
		return (data.results || []).map(formatSong).filter((s) => s.streamUrl);
	} catch (e) {
		console.error('[Trending Hits Error]', e.message);
		return [];
	}
}

// Get Song Lyrics
async function fetchLyrics(query) {
	try {
		const clean = query.replace(/[^\w\s]/gi, ' ').trim();
		const lrcUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(clean)}`;
		const lrcRes = await fetch(lrcUrl, {
			headers: { 'User-Agent': 'AuraMusic/1.0 (https://aura-music-1no9.onrender.com)' }
		});
		if (lrcRes.ok) {
			const results = await lrcRes.json();
			if (Array.isArray(results) && results.length > 0) {
				const best = results[0];
				if (best.plainLyrics) return { lyrics: best.plainLyrics, track: best.trackName, artist: best.artistName };
				if (best.syncedLyrics) {
					const plain = best.syncedLyrics.replace(/\[\d{2}:\d{2}\.\d{2,3}\]\s?/g, '').trim();
					return { lyrics: plain, track: best.trackName, artist: best.artistName };
				}
			}
		}
	} catch (e) {
		console.warn('[Lyrics Fetch Error]', e.message);
	}
	return null;
}

// ----------------------------------------------------------------------------
// TELEGRAM MESSAGE HANDLERS
// ----------------------------------------------------------------------------

// Handle /start and /app commands
async function handleStartCommand(chatId, firstName = 'Music Lover') {
	const welcomeText =
		`🎵 *Welcome to Aura Music Bot, ${firstName}!* ✨\n\n` +
		`Your all-in-one lossless streaming engine & companion.\n\n` +
		`🌟 *What you can do:*\n` +
		`• 📱 Tap *Open Aura Music* below to launch the Full Mini App\n` +
		`• 🔍 Send any song/artist name to search & download 320kbps audio\n` +
		`• 🔥 Explore daily trending chartbusters\n` +
		`• 📝 Get instant lyrics for any track\n` +
		`• 🎧 Play uninterrupted with Zero Ads`;

	const replyMarkup = {
		inline_keyboard: [
			[
				{
					text: '🎵 Open Aura Music (Mini App)',
					web_app: { url: WEBAPP_URL }
				}
			],
			[
				{
					text: '🔍 Search Songs',
					switch_inline_query_current_chat: ''
				},
				{
					text: '🔥 Trending Hits',
					callback_data: 'cmd_trending'
				}
			],
			[
				{
					text: '✨ Vibe Station',
					callback_data: 'cmd_vibe'
				},
				{
					text: '🌐 Web Player',
					url: WEBAPP_URL
				}
			]
		]
	};

	await callTelegram('sendMessage', {
		chat_id: chatId,
		text: welcomeText,
		parse_mode: 'Markdown',
		reply_markup: replyMarkup
	});
}

// Handle /help command
async function handleHelpCommand(chatId) {
	const helpText =
		`📖 *Aura Music Bot - Commands & Guide*\n\n` +
		`• \`/start\` - Open Main Hub & Launch WebApp\n` +
		`• \`/app\` - Launch the Aura Music Telegram Mini App\n` +
		`• \`/search <song>\` - Search & receive 320kbps audio files\n` +
		`• \`/trending\` - View top trending music\n` +
		`• \`/lyrics <song>\` - Read synchronized/plain song lyrics\n` +
		`• \`/vibe <mood>\` - Discover curated tracks for your mood\n` +
		`• \`/help\` - Show this help menu\n\n` +
		`💡 *Pro Tip:* You can simply type any song name directly into the chat to search!`;

	await callTelegram('sendMessage', {
		chat_id: chatId,
		text: helpText,
		parse_mode: 'Markdown',
		reply_markup: {
			inline_keyboard: [
				[
					{
						text: '🎵 Open Aura Music',
						web_app: { url: WEBAPP_URL }
					}
				]
			]
		}
	});
}

// Handle Music Search Query
async function handleSearchQuery(chatId, query) {
	await callTelegram('sendChatAction', {
		chat_id: chatId,
		action: 'typing'
	});

	const results = await searchSongs(query, 5);

	if (!results || results.length === 0) {
		await callTelegram('sendMessage', {
			chat_id: chatId,
			text: `❌ No songs found for *"${query}"*. Try searching with artist name or correct spelling.`,
			parse_mode: 'Markdown'
		});
		return;
	}

	let message = `🔍 *Search Results for "${query}":*\n\n`;
	const inlineKeyboard = [];

	results.forEach((song, idx) => {
		const num = idx + 1;
		message += `${num}. *${song.title}*\n   👤 ${song.artists}\n   ⏱ ${song.duration} | 💽 ${song.album}\n\n`;

		inlineKeyboard.push([
			{
				text: `📥 Download #${num}`,
				callback_data: `send_audio:${song.id}`
			},
			{
				text: `🎧 Play in App`,
				url: `${WEBAPP_URL}/search?q=${encodeURIComponent(song.title)}`
			},
			{
				text: `📝 Lyrics`,
				callback_data: `lyrics:${song.id}`
			}
		]);
	});

	inlineKeyboard.push([
		{
			text: '🎵 Open Full Library in Aura Music',
			web_app: { url: `${WEBAPP_URL}/search?q=${encodeURIComponent(query)}` }
		}
	]);

	await callTelegram('sendMessage', {
		chat_id: chatId,
		text: message,
		parse_mode: 'Markdown',
		reply_markup: { inline_keyboard: inlineKeyboard }
	});
}

// Handle /trending command
async function handleTrendingCommand(chatId) {
	await callTelegram('sendChatAction', {
		chat_id: chatId,
		action: 'typing'
	});

	const trending = await getTrendingHits();
	if (!trending || trending.length === 0) {
		await callTelegram('sendMessage', {
			chat_id: chatId,
			text: '🔥 Trending charts currently updating. Please check back in a minute.'
		});
		return;
	}

	let message = `🔥 *Top Trending Hits on Aura Music:*\n\n`;
	const inlineKeyboard = [];

	trending.slice(0, 5).forEach((song, idx) => {
		const num = idx + 1;
		message += `${num}. *${song.title}* - ${song.artists} (${song.duration})\n`;

		inlineKeyboard.push([
			{
				text: `📥 Download #${num}`,
				callback_data: `send_audio:${song.id}`
			},
			{
				text: `🎧 Play`,
				url: `${WEBAPP_URL}/search?q=${encodeURIComponent(song.title)}`
			}
		]);
	});

	inlineKeyboard.push([
		{
			text: '🚀 Explore All Trending in WebApp',
			web_app: { url: `${WEBAPP_URL}/discover` }
		}
	]);

	await callTelegram('sendMessage', {
		chat_id: chatId,
		text: message,
		parse_mode: 'Markdown',
		reply_markup: { inline_keyboard: inlineKeyboard }
	});
}

// Handle /vibe command
async function handleVibeCommand(chatId, mood = 'Late Night Drive') {
	await callTelegram('sendChatAction', {
		chat_id: chatId,
		action: 'typing'
	});

	const vibes = [
		'🌙 Late Night Chill',
		'⚡ High Energy Workout',
		'☕ Lo-Fi Study Beats',
		'🌧️ Monsoon Rain Romance',
		'🎉 Weekend Party Anthems',
		'🧘 Relax & Meditation'
	];

	const inlineKeyboard = [
		[
			{ text: '🌙 Late Night', callback_data: 'vibe_query:Late Night Chill' },
			{ text: '⚡ Workout', callback_data: 'vibe_query:Gym Workout Energy' }
		],
		[
			{ text: '☕ Lo-Fi Study', callback_data: 'vibe_query:Lofi Study Beats' },
			{ text: '🌧️ Monsoon Romance', callback_data: 'vibe_query:Romantic Monsoon' }
		],
		[
			{ text: '🎉 Party', callback_data: 'vibe_query:Party Bollywood EDM' },
			{ text: '🧘 Meditation', callback_data: 'vibe_query:Ambient Meditation Calm' }
		],
		[
			{
				text: '✨ Open Aura AI DJ in App',
				web_app: { url: `${WEBAPP_URL}/` }
			}
		]
	];

	await callTelegram('sendMessage', {
		chat_id: chatId,
		text: `✨ *Aura AI Vibe Station*\n\nSelect a mood or reply with \`/vibe <your mood>\` to instantly get curated 320kbps tracks!`,
		parse_mode: 'Markdown',
		reply_markup: { inline_keyboard: inlineKeyboard }
	});
}

// Send Real 320kbps Audio File to Chat
async function sendSongAudio(chatId, songId, messageId = null) {
	await callTelegram('sendChatAction', {
		chat_id: chatId,
		action: 'upload_document'
	});

	const song = await getSongDetails(songId);
	if (!song || !song.streamUrl) {
		await callTelegram('sendMessage', {
			chat_id: chatId,
			text: '❌ Could not resolve high-speed audio stream for this track. Try another song.'
		});
		return;
	}

	const caption =
		`🎵 *${song.title}*\n` +
		`👤 *Artist:* ${song.artists}\n` +
		`💽 *Album:* ${song.album} ${song.year ? `(${song.year})` : ''}\n` +
		`⚡ *Quality:* 320kbps Lossless MP3\n\n` +
		`🎧 Stream free on [Aura Music WebApp](${WEBAPP_URL})`;

	const audioPayload = {
		chat_id: chatId,
		audio: song.streamUrl,
		caption: caption,
		parse_mode: 'Markdown',
		title: song.title,
		performer: song.artists,
		duration: song.duration_seconds || 0,
		thumbnail: song.thumbnail || undefined,
		reply_markup: {
			inline_keyboard: [
				[
					{
						text: '🎵 Listen in Aura Mini App',
						web_app: { url: `${WEBAPP_URL}/search?q=${encodeURIComponent(song.title)}` }
					}
				],
				[
					{
						text: '📝 View Lyrics',
						callback_data: `lyrics:${song.id}`
					},
					{
						text: '🔍 Search More',
						switch_inline_query_current_chat: song.artists
					}
				]
			]
		}
	};

	const sendRes = await callTelegram('sendAudio', audioPayload);
	if (!sendRes.ok) {
		// Fallback: If sendAudio URL fails due to Telegram download size, send direct link with preview
		await callTelegram('sendMessage', {
			chat_id: chatId,
			text:
				`🎵 *${song.title}* - ${song.artists}\n\n` +
				`📥 [Direct 320kbps Audio Stream Download](${song.streamUrl})\n\n` +
				`🎧 Stream on [Aura Music App](${WEBAPP_URL})`,
			parse_mode: 'Markdown',
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: '🎵 Play in Mini App',
							web_app: { url: `${WEBAPP_URL}/search?q=${encodeURIComponent(song.title)}` }
						}
					]
				]
			}
		});
	}
}

// Send Lyrics for a Song
async function sendSongLyrics(chatId, songIdOrQuery) {
	await callTelegram('sendChatAction', {
		chat_id: chatId,
		action: 'typing'
	});

	let query = songIdOrQuery;
	const song = await getSongDetails(songIdOrQuery);
	if (song) {
		query = `${song.title} ${song.artists}`;
	}

	const lyricsData = await fetchLyrics(query);
	if (!lyricsData || !lyricsData.lyrics) {
		await callTelegram('sendMessage', {
			chat_id: chatId,
			text: `📝 Lyrics not found for *"${song?.title || query}"*.`,
			parse_mode: 'Markdown'
		});
		return;
	}

	const maxLen = 3800;
	const cleanLyrics = lyricsData.lyrics.length > maxLen
		? lyricsData.lyrics.substring(0, maxLen) + '\n\n...(truncated)'
		: lyricsData.lyrics;

	const message =
		`📝 *Lyrics: ${lyricsData.track || song?.title || query}*\n` +
		`👤 *Artist:* ${lyricsData.artist || song?.artists || ''}\n\n` +
		`${cleanLyrics}\n\n` +
		`✨ Provided by Aura Music Lyrics Engine`;

	await callTelegram('sendMessage', {
		chat_id: chatId,
		text: message,
		parse_mode: 'Markdown',
		reply_markup: {
			inline_keyboard: [
				[
					{
						text: '🎵 Play Song in Aura Music',
						web_app: { url: `${WEBAPP_URL}/search?q=${encodeURIComponent(lyricsData.track || query)}` }
					}
				]
			]
		}
	});
}

// ----------------------------------------------------------------------------
// INLINE QUERY HANDLER (Search songs inside any Telegram chat!)
// ----------------------------------------------------------------------------
async function handleInlineQuery(inlineQuery) {
	const query = inlineQuery.query?.trim();
	if (!query) {
		// Default trending suggestions when query is empty
		const trending = await getTrendingHits();
		const results = trending.slice(0, 8).map((song) => ({
			type: 'audio',
			id: `inline_${song.id}`,
			audio_url: song.streamUrl,
			title: song.title,
			performer: song.artists,
			audio_duration: song.duration_seconds,
			caption: `🎵 *${song.title}* - ${song.artists}\n🎧 Streamed via [Aura Music](${WEBAPP_URL})`,
			parse_mode: 'Markdown',
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: '🎵 Open in Aura Music',
							web_app: { url: `${WEBAPP_URL}/search?q=${encodeURIComponent(song.title)}` }
						}
					]
				]
			}
		}));

		await callTelegram('answerInlineQuery', {
			inline_query_id: inlineQuery.id,
			results: results,
			cache_time: 300,
			is_personal: true
		});
		return;
	}

	const songs = await searchSongs(query, 10);
	const results = songs.map((song) => ({
		type: 'audio',
		id: `inline_${song.id}`,
		audio_url: song.streamUrl,
		title: song.title,
		performer: song.artists,
		audio_duration: song.duration_seconds,
		caption: `🎵 *${song.title}* - ${song.artists}\n🎧 Streamed in 320kbps via [Aura Music](${WEBAPP_URL})`,
		parse_mode: 'Markdown',
		reply_markup: {
			inline_keyboard: [
				[
					{
						text: '🎵 Play in Aura Music Mini App',
						web_app: { url: `${WEBAPP_URL}/search?q=${encodeURIComponent(song.title)}` }
					}
				]
			]
		}
	}));

	await callTelegram('answerInlineQuery', {
		inline_query_id: inlineQuery.id,
		results: results,
		cache_time: 60,
		is_personal: true
	});
}

// ----------------------------------------------------------------------------
// DISPATCHER FOR INCOMING UPDATES
// ----------------------------------------------------------------------------
export async function processTelegramUpdate(update) {
	if (!update) return;

	try {
		// 1. Regular Chat Messages
		if (update.message) {
			const msg = update.message;
			const chatId = msg.chat.id;
			const text = msg.text?.trim();
			const firstName = msg.from?.first_name || 'Music Lover';

			if (!text) return;

			if (text === '/start' || text.startsWith('/start ') || text === '/app') {
				await handleStartCommand(chatId, firstName);
			} else if (text === '/help' || text.startsWith('/help ')) {
				await handleHelpCommand(chatId);
			} else if (text === '/trending' || text === '/top') {
				await handleTrendingCommand(chatId);
			} else if (text.startsWith('/vibe')) {
				const mood = text.replace('/vibe', '').trim() || 'Late Night Chill';
				if (text === '/vibe') {
					await handleVibeCommand(chatId);
				} else {
					await handleSearchQuery(chatId, `${mood} songs`);
				}
			} else if (text.startsWith('/lyrics')) {
				const query = text.replace('/lyrics', '').trim();
				if (!query) {
					await callTelegram('sendMessage', {
						chat_id: chatId,
						text: '📝 Usage: `/lyrics <song name>`',
						parse_mode: 'Markdown'
					});
				} else {
					await sendSongLyrics(chatId, query);
				}
			} else if (text.startsWith('/search')) {
				const query = text.replace('/search', '').trim();
				if (!query) {
					await callTelegram('sendMessage', {
						chat_id: chatId,
						text: '🔍 Usage: `/search <song or artist name>`',
						parse_mode: 'Markdown'
					});
				} else {
					await handleSearchQuery(chatId, query);
				}
			} else {
				// Default plain text query treated as instant music search!
				await handleSearchQuery(chatId, text);
			}
		}

		// 2. Inline Button Callbacks
		if (update.callback_query) {
			const cb = update.callback_query;
			const chatId = cb.message?.chat?.id;
			const data = cb.data;

			await callTelegram('answerCallbackQuery', {
				callback_query_id: cb.id,
				text: 'Processing your request...'
			});

			if (!chatId || !data) return;

			if (data.startsWith('send_audio:')) {
				const songId = data.replace('send_audio:', '');
				await sendSongAudio(chatId, songId, cb.message?.message_id);
			} else if (data.startsWith('lyrics:')) {
				const songId = data.replace('lyrics:', '');
				await sendSongLyrics(chatId, songId);
			} else if (data === 'cmd_trending') {
				await handleTrendingCommand(chatId);
			} else if (data === 'cmd_vibe') {
				await handleVibeCommand(chatId);
			} else if (data.startsWith('vibe_query:')) {
				const query = data.replace('vibe_query:', '');
				await handleSearchQuery(chatId, query);
			}
		}

		// 3. Inline Queries (@Aura36bot <query>)
		if (update.inline_query) {
			await handleInlineQuery(update.inline_query);
		}
	} catch (e) {
		console.error('[Telegram Process Update Error]', e);
	}
}

// ----------------------------------------------------------------------------
// BOT INITIALIZATION, COMMANDS REGISTRATION & LONG POLLING / WEBHOOK
// ----------------------------------------------------------------------------
let isPollingActive = false;
let lastUpdateId = 0;

export async function initTelegramBot(app = null) {
	if (!TELEGRAM_BOT_TOKEN) {
		console.warn('[Telegram Bot] No bot token provided. Skipping initialization.');
		return;
	}

	console.log(`🤖 Initializing Aura Music Telegram Bot (@Aura36bot)...`);

	// 1. Verify Bot Info
	const me = await callTelegram('getMe');
	if (!me.ok) {
		console.error('[Telegram Bot] Failed to authenticate with token:', me.error || me.description);
		return;
	}
	console.log(`✅ Telegram Bot Authenticated: @${me.result.username} (${me.result.first_name})`);

	// 2. Register Bot Commands
	const commands = [
		{ command: 'start', description: '🎵 Launch Aura Music & Main Menu' },
		{ command: 'app', description: '📱 Open Aura Music Web Mini App' },
		{ command: 'search', description: '🔍 Search songs & 320kbps audio files' },
		{ command: 'trending', description: '🔥 Top Trending Songs & Chartbusters' },
		{ command: 'lyrics', description: '📝 Get synchronized song lyrics' },
		{ command: 'vibe', description: '✨ AI Mood & Vibe Playlist Curator' },
		{ command: 'help', description: '💡 How to use Aura Music Bot' }
	];
	await callTelegram('setMyCommands', { commands });

	// 3. Set Chat Menu Button to WebApp
	await callTelegram('setChatMenuButton', {
		menu_button: {
			type: 'web_app',
			text: '🎵 Open Aura Music',
			web_app: {
				url: WEBAPP_URL
			}
		}
	});

	// 4. Register Webhook endpoint on Express App
	if (app) {
		app.post('/api/telegram/webhook', async (req, res) => {
			res.status(200).json({ ok: true });
			const update = req.body;
			if (update) {
				processTelegramUpdate(update).catch((e) => console.error('[Webhook Error]', e));
			}
		});

		// Telegram Bot Health & Status Endpoint
		app.get('/api/telegram/status', async (req, res) => {
			const info = await callTelegram('getMe');
			const webhookInfo = await callTelegram('getWebhookInfo');
			res.json({
				ok: true,
				bot: info.result,
				webhook: webhookInfo.result,
				webAppUrl: WEBAPP_URL
			});
		});
	}

	// 5. Setup Webhook or Fallback Long Polling
	const isRender = !!process.env.RENDER || !!process.env.PORT;
	if (isRender && WEBAPP_URL && !WEBAPP_URL.includes('localhost')) {
		const webhookUrl = `${WEBAPP_URL}/api/telegram/webhook`;
		console.log(`🌐 Setting Telegram Webhook to: ${webhookUrl}`);
		const setWh = await callTelegram('setWebhook', {
			url: webhookUrl,
			allowed_updates: ['message', 'callback_query', 'inline_query']
		});
		if (setWh.ok) {
			console.log(`✅ Telegram Webhook registered successfully.`);
			return;
		}
	}

	// Fallback to Long Polling if running locally or webhook not set
	console.log(`🔄 Starting Telegram Long Polling mode...`);
	// Clear any lingering webhook first to enable polling
	await callTelegram('deleteWebhook', { drop_pending_updates: false });
	startLongPolling();
}

async function startLongPolling() {
	if (isPollingActive) return;
	isPollingActive = true;

	while (isPollingActive) {
		try {
			const updatesRes = await callTelegram('getUpdates', {
				offset: lastUpdateId + 1,
				timeout: 25,
				allowed_updates: ['message', 'callback_query', 'inline_query']
			});

			if (updatesRes.ok && Array.isArray(updatesRes.result)) {
				for (const update of updatesRes.result) {
					lastUpdateId = Math.max(lastUpdateId, update.update_id);
					await processTelegramUpdate(update);
				}
			} else if (updatesRes.description?.includes('Conflict')) {
				console.warn('[Telegram Polling] Webhook or another instance active. Retrying in 10s...');
				await new Promise((r) => setTimeout(r, 10000));
			}
		} catch (e) {
			console.warn('[Telegram Polling Loop Warning]', e.message);
			await new Promise((r) => setTimeout(r, 3000));
		}
	}
}
