/**
 * fix_artist_playback.js
 * Removes the broken early-return artist block (before 'var tracks' declaration)
 * and injects correct artist-exclusive logic after 'var tracks' (after customStation setup).
 */
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'script.js');
let src = fs.readFileSync(file, 'utf8');

// ── Step 1: Remove the bad block that appears BEFORE "Synthesize dynamic station object" ──
// It sits between "document.body.classList.add('playing');" and "// Synthesize dynamic station object"
// Pattern: anything between a blank line after classList.add and the synthesize comment
const badBlockPattern = /(\n[ \t]*\n[ \t]*\/\/ ARTIST STATION EXCLUSIVE MODE[\s\S]*?return; \/\/ Skip general pool logic below\r?\n[ \t]*\}\r?\n[ \t]*\}\r?\n\r?\n)([ \t]*\/\/ Synthesize dynamic station object)/;

if (badBlockPattern.test(src)) {
  src = src.replace(badBlockPattern, '\n\n$2');
  console.log('✅ Removed bad artist block (before var tracks)');
} else {
  console.log('⚠️  Bad block pattern not found — checking for alternate pattern...');
  // Try alternate: just look for the comment and the whole block
  const altPattern = /\n\n\s*\/\/ ARTIST STATION EXCLUSIVE MODE - use only real artist tracks from catalog\r?\n[\s\S]*?\/\/ Skip general pool logic below\r?\n\s*\}\r?\n\s*\}\r?\n/;
  if (altPattern.test(src)) {
    src = src.replace(altPattern, '\n\n');
    console.log('✅ Removed bad artist block (alt pattern)');
  } else {
    console.log('❌ Could not find bad block at all');
  }
}

// ── Step 2: Verify good block is present after "var tracks = ..." ──
const goodBlockMarker = 'ARTIST STATION EXCLUSIVE - only play real fetched tracks';
if (src.includes(goodBlockMarker)) {
  console.log('✅ Good artist block already present after var tracks');
} else {
  // Inject it
  const tracksDecl = "var tracks = (mood.seedTracks && mood.seedTracks.length) ? mood.seedTracks.slice() : [];";
  if (src.includes(tracksDecl)) {
    const artistBlock = `\n\n      // ARTIST STATION EXCLUSIVE - only play real fetched tracks for this artist\n      if (mood.category === 'artist') {\n        var _artistTracks = (typeof ARTIST_TRACKS_CATALOG !== 'undefined' && ARTIST_TRACKS_CATALOG[mood.id]) ? ARTIST_TRACKS_CATALOG[mood.id] : [];\n        _artistTracks.forEach(function(vid) { if (vid && tracks.indexOf(vid) === -1) tracks.push(vid); });\n        tracks.sort(function() { return 0.5 - Math.random(); });\n        console.log('\\uD83C\\uDFA4 Artist Station:', mood.name, tracks.length, 'real tracks');\n        currentTrackQueue = tracks.slice();\n        currentTrackIndex = 0;\n        playSingleTrack(currentTrackQueue[0]);\n        syncPlayerUI();\n        return;\n      }\n`;
    src = src.replace(tracksDecl, tracksDecl + artistBlock);
    console.log('✅ Injected good artist block after var tracks');
  } else {
    console.log('❌ Could not find var tracks declaration');
  }
}

// ── Verify final state ──
const artistStationCount = (src.match(/ARTIST STATION/g) || []).length;
const hasCardHtml = src.includes('mood-card-top');
const hasGoodBlock = src.includes(goodBlockMarker);
console.log(`\nVerification:`);
console.log(`  ARTIST STATION mentions: ${artistStationCount}`);
console.log(`  mood-card-top HTML: ${hasCardHtml}`);
console.log(`  Good exclusive block: ${hasGoodBlock}`);

fs.writeFileSync(file, src, 'utf8');
console.log('\n✅ script.js patched successfully');
