/**
 * apply_artist_catalog.js
 * ========================
 * Reads artist_tracks_catalog.js and patches script.js:
 *  1. Injects ARTIST_TRACKS_CATALOG at the top of script.js (after first line)
 *  2. Updates each artist station's seedTracks with real fetched IDs
 *  3. Patches playMoodStation to use ARTIST_TRACKS_CATALOG exclusively for artist stations
 *
 * Usage: node scripts/apply_artist_catalog.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CATALOG_FILE = path.join(ROOT, 'artist_tracks_catalog.js');
const SCRIPT_FILE  = path.join(ROOT, 'script.js');

// ─── Load catalog ──────────────────────────────────────────────────────────────
if (!fs.existsSync(CATALOG_FILE)) {
  console.error('❌ artist_tracks_catalog.js not found! Run fetch_artist_tracks.js first.');
  process.exit(1);
}

const catalogSrc = fs.readFileSync(CATALOG_FILE, 'utf8');

// Evaluate catalog to get the JS object
let ARTIST_TRACKS_CATALOG = {};
try {
  // Safe eval using Function (sandboxed)
  const evalFn = new Function(catalogSrc + '; return ARTIST_TRACKS_CATALOG;');
  ARTIST_TRACKS_CATALOG = evalFn();
} catch (e) {
  console.error('❌ Failed to parse catalog:', e.message);
  process.exit(1);
}

const artistCount = Object.keys(ARTIST_TRACKS_CATALOG).length;
const totalTracks = Object.values(ARTIST_TRACKS_CATALOG).reduce((s, a) => s + a.length, 0);
console.log(`\n📦 Catalog loaded: ${artistCount} artists, ${totalTracks} total tracks`);

// ─── Load script.js ───────────────────────────────────────────────────────────
let script = fs.readFileSync(SCRIPT_FILE, 'utf8');

// ─── Step 1: Remove old ARTIST_TRACKS_CATALOG injection if present ────────────
script = script.replace(/\/\/ ARTIST_TRACKS_CATALOG — injected[\s\S]*?ARTIST_TRACKS_CATALOG END\r?\n/m, '');

// ─── Step 2: Inject ARTIST_TRACKS_CATALOG right after the strict-mode or first line ──
const catalogBlock = `
// ARTIST_TRACKS_CATALOG — injected by apply_artist_catalog.js (${new Date().toISOString()})
var ARTIST_TRACKS_CATALOG = ${JSON.stringify(ARTIST_TRACKS_CATALOG)};
// ARTIST_TRACKS_CATALOG END
`;

// Inject after first opening IIFE or at the top
const iifePosMatch = script.match(/\(function\s*\(\)\s*\{/);
if (iifePosMatch) {
  const pos = script.indexOf(iifePosMatch[0]) + iifePosMatch[0].length;
  script = script.slice(0, pos) + catalogBlock + script.slice(pos);
  console.log('✅ Injected ARTIST_TRACKS_CATALOG after IIFE open');
} else {
  script = catalogBlock + script;
  console.log('✅ Injected ARTIST_TRACKS_CATALOG at top of file');
}

// ─── Step 3: Update each artist station's seedTracks ─────────────────────────
let patchedCount = 0;
for (const [artistId, tracks] of Object.entries(ARTIST_TRACKS_CATALOG)) {
  if (!tracks || tracks.length === 0) continue;
  const top15 = tracks.slice(0, 15);
  const newSeedStr = JSON.stringify(top15);

  // Pattern: find the station object with this id and replace its seedTracks
  // Matches: id: 'artist-arijit-singh', ... seedTracks: [...]
  const idPattern = new RegExp(
    `(id:\\s*'${artistId}'[\\s\\S]*?seedTracks:\\s*)\\[[^\\]]*?\\]`,
    'm'
  );

  if (idPattern.test(script)) {
    script = script.replace(idPattern, `$1${newSeedStr}`);
    patchedCount++;
    console.log(`  ✅ Patched seedTracks for ${artistId} (${top15.length} tracks)`);
  } else {
    console.log(`  ⚠️  Could not find station: ${artistId}`);
  }
}

// ─── Step 4: Patch playMoodStation — artist category uses ONLY catalog tracks ──
const artistExclusivePatch = `
      // ARTIST STATION EXCLUSIVE MODE — use only real artist tracks from catalog
      if (mood.category === 'artist' && typeof ARTIST_TRACKS_CATALOG !== 'undefined') {
        var artistCatalogTracks = ARTIST_TRACKS_CATALOG[mood.id] || [];
        if (artistCatalogTracks.length > 0) {
          // Start with seed tracks, then fill from catalog (no general pool mixing)
          tracks = mood.seedTracks ? mood.seedTracks.slice() : [];
          artistCatalogTracks.forEach(function(vid) {
            if (vid && tracks.indexOf(vid) === -1) tracks.push(vid);
          });
          tracks.sort(function() { return 0.5 - Math.random(); });
          console.log('🎤 Artist Station (exclusive):', mood.name, '—', tracks.length, 'tracks');
          currentTrackQueue = tracks.slice();
          currentTrackIndex = 0;
          if (currentTrackQueue.length > 0) {
            playSingleTrack(currentTrackQueue[currentTrackIndex]);
            syncPlayerUI();
          }
          return; // Skip general pool logic below
        }
      }
`;

// Inject before "// Synthesize dynamic station object" comment
const injectBefore = '// Synthesize dynamic station object';
if (script.includes(injectBefore)) {
  script = script.replace(injectBefore, artistExclusivePatch + '\n      ' + injectBefore);
  console.log('✅ Injected artist exclusive mode into playMoodStation');
} else {
  console.log('⚠️  Could not find injection point for artist exclusive mode');
}

// ─── Write patched script.js ──────────────────────────────────────────────────
fs.writeFileSync(SCRIPT_FILE, script, 'utf8');

console.log(`\n🎉 Done! Patched ${patchedCount}/${artistCount} artist stations`);
console.log(`📁 Updated: script.js`);
console.log('\nRefresh localhost:8080 to see real artist tracks!\n');
