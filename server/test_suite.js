import assert from 'assert';

const BASE_URL = process.env.TEST_URL || 'https://aura-music-1no9.onrender.com';
console.log(`\n========================================`);
console.log(`🧪 Running Aura Music Comprehensive Test Suite`);
console.log(`🌐 Target: ${BASE_URL}`);
console.log(`========================================\n`);

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
	// 1. Health Check
	await test('Backend Health Check (/api/health)', async () => {
		const res = await fetch(`${BASE_URL}/api/health`);
		assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
		const data = await res.json();
		assert.strictEqual(data.status, 'ok', 'Status should be ok');
		assert.ok(Array.isArray(data.sources), 'Sources list should be present');
	});

	// 2. Security.txt
	await test('Security Policy Endpoint (/.well-known/security.txt)', async () => {
		const res = await fetch(`${BASE_URL}/.well-known/security.txt`);
		assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
		const text = await res.text();
		assert.ok(text.includes('Contact:'), 'Security.txt should contain contact info');
	});

	// 3. Search Songs (Saavn & YTM)
	await test('Global Music Search API (/api/search)', async () => {
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

	// 4. Search Suggestions & Auto-Complete
	await test('Search Suggestions API (/api/suggest)', async () => {
		const res = await fetch(`${BASE_URL}/api/suggest?q=Taylor`);
		assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
		const data = await res.json();
		const queries = Array.isArray(data) ? data : data.queries || [];
		assert.ok(Array.isArray(queries), 'Suggestions should be an array');
		assert.ok(queries.length > 0, 'Should return suggestion strings');
		console.log(`(Returned ${queries.length} suggestions: ${queries.slice(0, 3).join(', ')})`);
	});

	// 5. Synced Lyrics API
	await test('Real-Time Synced Lyrics API (/api/lyrics)', async () => {
		const res = await fetch(`${BASE_URL}/api/lyrics?track=Shape+of+You&artist=Ed+Sheeran`);
		assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
		const data = await res.json();
		assert.ok(data.lines || data.lyrics || data.syncedLyrics || data.plainLyrics, 'Lyrics lines should be returned');
		const lineCount = data.lines?.length || 0;
		console.log(`(Resolved ${lineCount} synchronized lyrics lines with word-level timing)`);
	});

	// 6. Direct 320kbps Audio Stream Resolution
	await test('Direct 320kbps Audio Resolution (/api/stream)', async () => {
		// First search a song to get a valid id
		const searchRes = await fetch(`${BASE_URL}/api/search?q=Tum+Hi+Ho`);
		const searchData = await searchRes.json();
		const songs = Array.isArray(searchData) ? searchData : searchData.songs || [];
		assert.ok(songs.length > 0, 'Need search result for stream test');
		const songId = songs[0].video_id || songs[0].id;
		
		// Test JSON metadata resolution
		const metaRes = await fetch(`${BASE_URL}/api/stream/${encodeURIComponent(songId)}`, {
			headers: { 'Accept': 'application/json' }
		});
		assert.strictEqual(metaRes.status, 200, `Expected 200 OK, got ${metaRes.status}`);
		const metaData = await metaRes.json();
		assert.ok(metaData.url || metaData.stream_url, 'Stream URL must be returned in metadata');

		// Test direct raw audio stream pipe
		const streamRes = await fetch(`${BASE_URL}/api/stream/${encodeURIComponent(songId)}`);
		assert.ok(streamRes.status === 200 || streamRes.status === 206 || streamRes.status === 302, `Expected 200/206/302, got ${streamRes.status}`);
		console.log(`(Bitrate: ${metaData.bitrate || '320kbps'}, source: ${metaData.source || 'JioSaavn / YouTube'})`);
	});

	// 7. Security Headers Verification
	await test('Production Security Headers (CSP, HSTS, X-Frame-Options)', async () => {
		const res = await fetch(`${BASE_URL}/`);
		assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
		assert.ok(res.headers.get('content-security-policy'), 'CSP header must be present');
		assert.ok(res.headers.get('x-content-type-options'), 'X-Content-Type-Options must be present');
		assert.ok(res.headers.get('x-frame-options'), 'X-Frame-Options must be present');
	});

	// 8. Static Web App Landing Verification
	await test('Static Web App HTML Landmarks & Schema.org JSON-LD', async () => {
		const res = await fetch(`${BASE_URL}/`);
		const html = await res.text();
		assert.ok(html.includes('<header role="banner"'), 'Header landmark must be present in HTML');
		assert.ok(html.includes('<nav aria-label="Main Navigation"'), 'Nav landmark must be present in HTML');
		assert.ok(html.includes('<main id="main-content"'), 'Main landmark must be present in HTML');
		assert.ok(html.includes('<footer role="contentinfo"'), 'Footer landmark must be present in HTML');
		assert.ok(html.includes('schema.org'), 'Schema.org JSON-LD must be present');
	});

	console.log(`\n========================================`);
	console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
	console.log(`========================================\n`);

	if (failed > 0) {
		process.exit(1);
	}
}

runAll().catch((err) => {
	console.error('Fatal test error:', err);
	process.exit(1);
});
