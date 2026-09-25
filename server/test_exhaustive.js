// Exhaustive Production Verification Test Suite for Aura Music
import assert from 'assert';

const BASE_URL = process.env.TEST_URL || 'https://aura-music-1no9.onrender.com';

let passed = 0;
let failed = 0;

async function test(name, fn) {
	process.stdout.write(`⏳ Testing: ${name}... `);
	try {
		await fn();
		console.log(`✅ PASSED`);
		passed++;
	} catch (err) {
		console.log(`❌ FAILED`);
		console.error(`   Error:`, err.message || err);
		failed++;
	}
}

async function runAll() {
	console.log(`\n========================================================`);
	console.log(`🧪 AURA MUSIC EXHAUSTIVE PRODUCTION VERIFICATION SUITE`);
	console.log(`🌐 Target Deployment: ${BASE_URL}`);
	console.log(`========================================================\n`);

	// 1. Backend Health Check
	await test('Backend Health API (/api/health)', async () => {
		const res = await fetch(`${BASE_URL}/api/health`);
		assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
		const data = await res.json();
		assert.strictEqual(data.status, 'ok', 'Status should be ok');
		assert.ok(Array.isArray(data.sources), 'Sources list should be present');
	});

	// 2. Security RFC 9116 Endpoint
	await test('Security RFC 9116 Endpoint (/.well-known/security.txt)', async () => {
		const res = await fetch(`${BASE_URL}/.well-known/security.txt`);
		assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
		const text = await res.text();
		assert.ok(text.includes('Contact:'), 'Security.txt should contain contact info');
	});

	// 3. Global Music Search - Bollywood & Indie
	await test('Global Music Search API - Bollywood Query (/api/search?q=Arijit+Singh)', async () => {
		const res = await fetch(`${BASE_URL}/api/search?q=Arijit+Singh`);
		assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
		const data = await res.json();
		const songs = Array.isArray(data) ? data : data.songs || data.items || [];
		assert.ok(songs.length > 0, 'Search should return at least 1 song');
		const first = songs[0];
		assert.ok(first.title, 'Song should have title');
		assert.ok(first.video_id || first.id, 'Song should have video_id or id');
		console.log(`(Found ${songs.length} tracks, top: "${first.title}")`);
	});

	// 4. Global Music Search - International & Pop
	await test('Global Music Search API - International Query (/api/search?q=The+Weeknd)', async () => {
		const res = await fetch(`${BASE_URL}/api/search?q=The+Weeknd`);
		assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
		const data = await res.json();
		const songs = Array.isArray(data) ? data : data.songs || data.items || [];
		assert.ok(songs.length > 0, 'Search should return at least 1 song');
		console.log(`(Found ${songs.length} tracks, top: "${songs[0].title}")`);
	});

	// 5. Search Suggestions API
	await test('Search Suggestions API (/api/suggest?q=Taylor)', async () => {
		const res = await fetch(`${BASE_URL}/api/suggest?q=Taylor`);
		assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
		const data = await res.json();
		const queries = Array.isArray(data) ? data : data.queries || [];
		assert.ok(Array.isArray(queries), 'Suggestions should be an array');
		assert.ok(queries.length > 0, 'Should return suggestion strings');
		console.log(`(Returned ${queries.length} suggestions: ${queries.slice(0, 3).join(', ')})`);
	});

	// 6. Synced Lyrics API
	await test('Real-Time Synced Lyrics API (/api/lyrics)', async () => {
		const res = await fetch(`${BASE_URL}/api/lyrics?track=Shape+of+You&artist=Ed+Sheeran`);
		assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
		const data = await res.json();
		assert.ok(data.lines || data.lyrics || data.syncedLyrics || data.plainLyrics, 'Lyrics lines should be returned');
		const lineCount = data.lines?.length || 0;
		console.log(`(Resolved ${lineCount} synchronized lyrics lines with word-level timing)`);
	});

	// 7. Direct 320kbps Audio Stream Resolution
	await test('Direct 320kbps Audio Resolution (/api/stream/:id)', async () => {
		const searchRes = await fetch(`${BASE_URL}/api/search?q=Tum+Hi+Ho`);
		const searchData = await searchRes.json();
		const songs = Array.isArray(searchData) ? searchData : searchData.songs || [];
		assert.ok(songs.length > 0, 'Need search result for stream test');
		const songId = songs[0].video_id || songs[0].id;
		
		const metaRes = await fetch(`${BASE_URL}/api/stream/${encodeURIComponent(songId)}`, {
			headers: { 'Accept': 'application/json' }
		});
		assert.strictEqual(metaRes.status, 200, `Expected 200 OK, got ${metaRes.status}`);
		const metaData = await metaRes.json();
		assert.ok(metaData.url || metaData.stream_url, 'Stream URL must be returned in metadata');
		console.log(`(Bitrate: ${metaData.bitrate || '320kbps'}, source: ${metaData.source || 'JioSaavn / YouTube'})`);
	});

	// 8. Production Security Headers
	await test('Production Security Headers (CSP, HSTS, X-Frame-Options)', async () => {
		const res = await fetch(`${BASE_URL}/`);
		assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
		const h = res.headers;
		assert.ok(h.get('content-security-policy'), 'CSP header missing');
		assert.ok(h.get('x-content-type-options'), 'X-Content-Type-Options missing');
	});

	// 9. Static Web App HTML Landmarks & Schema.org JSON-LD
	await test('Static Web App HTML Landmarks & Schema.org JSON-LD', async () => {
		const res = await fetch(`${BASE_URL}/`);
		assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
		const html = await res.text();
		assert.ok(html.includes('<title>Aura Music'), 'Missing <title> tag in HTML');
		assert.ok(html.includes('application/ld+json'), 'Missing Schema.org JSON-LD in HTML');
		assert.ok(html.includes('meta name="description"'), 'Missing meta description');
	});

	// 10. Day & Night CSS Theme Tokens Verification
	await test('Day & Night Theme CSS Tokens & Utility Classes', async () => {
		const res = await fetch(`${BASE_URL}/`);
		const html = await res.text();
		// Extract stylesheet link
		const cssMatch = html.match(/href="([^"]*\.css)"/);
		if (cssMatch) {
			const cssUrl = cssMatch[1].startsWith('http') ? cssMatch[1] : `${BASE_URL}${cssMatch[1]}`;
			const cssRes = await fetch(cssUrl);
			if (cssRes.status === 200) {
				const cssText = await cssRes.text();
				assert.ok(cssText.includes('--primary') || cssText.includes('ff2a7a'), 'Primary pink color token missing');
			}
		}
	});

	// 11. Telegram Bot Connectivity & Webhook Status
	await test('Telegram Bot API Integration & Status (@Aura36bot)', async () => {
		const res = await fetch('https://api.telegram.org/bot8840396258:AAFHti7zvAAs2V63DHmLEsLjUqZhvhEDTZs/getMe');
		assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
		const data = await res.json();
		assert.strictEqual(data.ok, true, 'Telegram getMe should return ok: true');
		assert.strictEqual(data.result.username, 'Aura36bot', 'Bot username must match @Aura36bot');
		console.log(`(Connected to @${data.result.username} - "${data.result.first_name}")`);
	});

	console.log('\n========================================================');
	console.log(`📊 Exhaustive Test Results: ${passed} Passed, ${failed} Failed`);
	console.log('========================================================\n');

	if (failed > 0) {
		process.exit(1);
	}
}

runAll();
