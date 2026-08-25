const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, '..', 'script.js');
const stylePath = path.join(__dirname, '..', 'style.css');

let script = fs.readFileSync(scriptPath, 'utf8');
let style = fs.readFileSync(stylePath, 'utf8');

// =========================================================================
// 1. FIX SCRIPT.JS: playMoodStation for Artist Stations
// =========================================================================

// Replace the broken artist check with clean catalog loading + skip general pool
const brokenArtistBlockPattern = /\/\/ ARTIST STATION EXCLUSIVE - only play real fetched tracks[\s\S]*?return;\s*\}/m;

const cleanArtistBlock = `// ARTIST STATION EXCLUSIVE — Assemble queue from real artist catalog
      if (mood.category === 'artist' && typeof ARTIST_TRACKS_CATALOG !== 'undefined') {
        var _artistList = ARTIST_TRACKS_CATALOG[mood.id] || [];
        if (_artistList && _artistList.length) {
          tracks = _artistList.slice();
        } else if (mood.seedTracks && mood.seedTracks.length) {
          tracks = mood.seedTracks.slice();
        }
        // Shuffle artist tracks
        tracks.sort(function() { return 0.5 - Math.random(); });
        console.log('🎤 Artist Station (real catalog):', mood.name, '—', tracks.length, 'tracks');
      }`;

if (brokenArtistBlockPattern.test(script)) {
  script = script.replace(brokenArtistBlockPattern, cleanArtistBlock);
  console.log('✅ Replaced broken artist block in playMoodStation');
} else {
  console.log('⚠️ Could not find exact broken artist block, checking fallback...');
}

// Also wrap the general pool assembling steps (1, 2, 3, 4) so they only run if mood.category !== 'artist'
// Look for "// 1. Gather all matching tracks from VibeAgent catalog" up to "// Shuffle tracks for unique endless journey every time"
const generalPoolPattern = /(\/\/ 1\. Gather all matching tracks from VibeAgent catalog[\s\S]*?)(\/\/ Shuffle tracks for unique endless journey every time)/;
if (generalPoolPattern.test(script)) {
  const match = script.match(generalPoolPattern);
  const insideCode = match[1];
  // Only wrap if not already wrapped
  if (!insideCode.includes("if (mood.category !== 'artist')")) {
    const wrappedCode = `if (mood.category !== 'artist') {\n        ${insideCode.trim()}\n      }\n\n      `;
    script = script.replace(match[0], wrappedCode + match[2]);
    console.log('✅ Wrapped general pool additions in mood.category !== "artist" check');
  }
}

// =========================================================================
// 2. FIX SCRIPT.JS: _doUpdateBackgroundWords to prevent overlapping duplicates
// =========================================================================
const oldDoUpdatePattern = /function _doUpdateBackgroundWords\(title, artist\) \{[\s\S]*?glyphsContainer\.style\.opacity = '1';\s*\}, 400\);\s*\}/;

const newDoUpdateFunc = `function _doUpdateBackgroundWords(title, artist) {
    var glyphsContainer = $('bgGlyphs');
    if (!glyphsContainer) return;

    var cleanT = cleanTitle(title || '');
    var cleanA = (artist || '').replace(/[\\[\\]\\(\\)]/g, ' ');
    
    // Split into clean, single uppercase words (length 3 to 10 chars)
    var rawTokens = (cleanT + ' ' + cleanA)
      .replace(/[♪(),.!?:;\"'—–\\-\\[\\]\\d\\/\\\\+&]/g, ' ')
      .split(/\\s+/)
      .map(function (w) { return w.trim().toUpperCase(); })
      .filter(function (w) { return w.length >= 3 && w.length <= 12 && /^[A-Z\u0900-\u097F]+$/.test(w); });

    // Deduplicate tokens
    var uniqueTokens = [];
    rawTokens.forEach(function(t) {
      if (uniqueTokens.indexOf(t) === -1) uniqueTokens.push(t);
    });

    var defaults = ['AURA', 'IMMERSION', 'SYMPHONY', 'CELESTIAL', 'INFINITY', 'FREQUENCY', 'VELVET'];
    if (currentStationKey === 'ishq') {
      defaults = ['इश्क़', 'रूहानी', 'सुकून', 'मोहब्बत', 'धड़कन', 'आफ़रीन', 'चाहत'];
    } else if (currentStationKey === 'demand') {
      defaults = ['PASSION', 'FIRE', 'ENERGY', 'HYPER', 'DESIRE', 'SURGE', 'PULSE'];
    } else if (currentStationKey === '90s') {
      defaults = ['NOSTALGIA', 'CLASSIC', 'MELODY', 'EVERGREEN', 'RETRO', 'GOLDEN', 'VINTAGE'];
    } else if (currentStationKey === 'edm') {
      defaults = ['EUPHORIA', 'MATRIX', 'BASS', 'SYNTH', 'DROP', 'ELECTRIC', 'PULSE'];
    }

    var words = uniqueTokens.slice(0, 6);
    for (var i = 0; i < defaults.length && words.length < 6; i++) {
      if (words.indexOf(defaults[i]) === -1) words.push(defaults[i]);
    }

    var centerWord = words[0] || 'TIMELESS';
    if (uniqueTokens.length > 1) {
      centerWord = uniqueTokens[0];
    } else if (currentStation && currentStation.name) {
      centerWord = currentStation.name.split(' ')[0].toUpperCase();
    }

    glyphsContainer.style.opacity = '0';
    setTimeout(function () {
      glyphsContainer.innerHTML =
        '<span class="glyph g1">' + (words[0] || 'AURA') + '</span>' +
        '<span class="glyph g2">' + (words[1] || 'SOUND') + '</span>' +
        '<span class="glyph g3">' + (words[2] || 'ECHO') + '</span>' +
        '<span class="glyph g4">' + (words[3] || 'VIBE') + '</span>' +
        '<span class="glyph g5">' + (words[4] || 'WAVE') + '</span>' +
        '<span class="glyph g6">' + (words[5] || 'PULSE') + '</span>' +
        '<span class="heart-glyph" id="centerHeartGlyph">' + centerWord + '</span>';
      glyphsContainer.style.opacity = '1';
    }, 300);
  }`;

if (oldDoUpdatePattern.test(script)) {
  script = script.replace(oldDoUpdatePattern, newDoUpdateFunc);
  console.log('✅ Replaced _doUpdateBackgroundWords with non-overlapping clean single-word engine');
} else {
  console.log('⚠️ Could not match oldDoUpdatePattern');
}

// =========================================================================
// 3. FIX STYLE.CSS: Refined Non-Overlapping Kinetic Background Typography
// =========================================================================
const oldBgGlyphsCssPattern = /\/\* =+ Animated Genre-Adaptive Background Glyphs =+ \*\/[\s\S]*?@keyframes glyphHeartPulse[\s\S]*?\}/;

const newBgGlyphsCss = `/* ==================== Animated Genre-Adaptive Background Glyphs ==================== */
.bg-glyphs {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  background: radial-gradient(circle at 50% 40%, var(--theme-ambient) 0%, rgba(7, 7, 9, 0) 70%);
  transition: background 0.6s ease, opacity 0.8s ease;
  contain: strict;
}

.bg-glyphs .glyph {
  position: absolute;
  font-family: var(--theme-font, 'Cinzel', sans-serif);
  font-weight: 800;
  color: #f7efe2;
  line-height: 1;
  user-select: none;
  opacity: var(--o, .026);
  transition: opacity 0.6s ease;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  will-change: transform;
  white-space: nowrap;
  max-width: 42vw;
  overflow: hidden;
  text-overflow: clip;
}

/* Top-Left Quadrant */
.bg-glyphs .g1 {
  top: 7%;
  left: 5%;
  font-size: clamp(1.4rem, 3.8vw, 3.2rem);
  --o: .028;
  filter: blur(0.8px);
  animation: glyphDrift1 42s ease-in-out infinite alternate;
}

/* Top-Right Quadrant */
.bg-glyphs .g2 {
  top: 8%;
  right: 5%;
  font-size: clamp(1.5rem, 4.2vw, 3.5rem);
  --o: .024;
  filter: blur(1.2px);
  text-align: right;
  animation: glyphDrift2 48s ease-in-out infinite alternate;
}

/* Bottom-Left Quadrant */
.bg-glyphs .g3 {
  bottom: 8%;
  left: 5%;
  font-size: clamp(1.4rem, 3.8vw, 3.2rem);
  --o: .028;
  filter: blur(1.8px);
  animation: glyphDrift3 54s ease-in-out infinite alternate;
}

/* Bottom-Right Quadrant */
.bg-glyphs .g4 {
  bottom: 8%;
  right: 5%;
  font-size: clamp(1.5rem, 4.2vw, 3.5rem);
  --o: .022;
  filter: blur(0.8px);
  text-align: right;
  animation: glyphDrift4 38s ease-in-out infinite alternate;
}

/* Far Top Header Ambient Stream */
.bg-glyphs .g5 {
  top: 2.5%;
  left: 50%;
  transform: translateX(-50%);
  font-size: clamp(0.9rem, 2.2vw, 1.8rem);
  --o: .018;
  filter: blur(1.5px);
  letter-spacing: 0.32em;
  text-align: center;
  animation: glyphDrift5 46s ease-in-out infinite alternate;
}

/* Far Bottom Floating Accent */
.bg-glyphs .g6 {
  bottom: 2.5%;
  left: 50%;
  transform: translateX(-50%);
  font-size: clamp(0.9rem, 2.2vw, 1.8rem);
  --o: .018;
  filter: blur(2.2px);
  letter-spacing: 0.32em;
  text-align: center;
  animation: glyphDrift6 52s ease-in-out infinite alternate;
}

/* Subtle Centered Watermark with Deep Ambient Gaussian Blur */
.bg-glyphs .heart-glyph {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  font-family: var(--theme-font, 'Cinzel', sans-serif);
  font-weight: 900;
  font-size: clamp(2.8rem, 8.5vw, 6.8rem);
  color: #f7efe2;
  line-height: 1;
  opacity: .022;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  text-align: center;
  max-width: 80vw;
  overflow: hidden;
  white-space: nowrap;
  transition: opacity 0.6s ease;
  filter: blur(3.5px);
  will-change: transform, opacity;
  animation: glyphHeartPulse 16s ease-in-out infinite;
  pointer-events: none;
}

@keyframes glyphDrift1 {
  0%   { transform: translate3d(0, 0, 0) rotate(0deg); }
  50%  { transform: translate3d(12px, -14px, 0) rotate(1.2deg); }
  100% { transform: translate3d(-10px, 12px, 0) rotate(-1deg); }
}

@keyframes glyphDrift2 {
  0%   { transform: translate3d(0, 0, 0) rotate(0deg); }
  50%  { transform: translate3d(-14px, 12px, 0) rotate(-1.5deg); }
  100% { transform: translate3d(10px, -12px, 0) rotate(1deg); }
}

@keyframes glyphDrift3 {
  0%   { transform: translate3d(0, 0, 0) rotate(0deg); }
  50%  { transform: translate3d(14px, 12px, 0) rotate(1.8deg); }
  100% { transform: translate3d(-12px, -14px, 0) rotate(-1.2deg); }
}

@keyframes glyphDrift4 {
  0%   { transform: translate3d(0, 0, 0) rotate(0deg); }
  50%  { transform: translate3d(-12px, -10px, 0) rotate(-1.2deg); }
  100% { transform: translate3d(14px, 15px, 0) rotate(1.5deg); }
}

@keyframes glyphDrift5 {
  0%   { transform: translate3d(-50%, 0, 0); }
  50%  { transform: translate3d(calc(-50% + 10px), -8px, 0); }
  100% { transform: translate3d(calc(-50% - 10px), 8px, 0); }
}

@keyframes glyphDrift6 {
  0%   { transform: translate3d(-50%, 0, 0); }
  50%  { transform: translate3d(calc(-50% - 8px), 10px, 0); }
  100% { transform: translate3d(calc(-50% + 8px), -8px, 0); }
}

@keyframes glyphHeartPulse {
  0%, 100% { transform: translate3d(-50%, -50%, 0) scale(1); opacity: 0.020; }
  50%      { transform: translate3d(-50%, -50%, 0) scale(1.04); opacity: 0.035; }
}`;

if (oldBgGlyphsCssPattern.test(style)) {
  style = style.replace(oldBgGlyphsCssPattern, newBgGlyphsCss);
  console.log('✅ Replaced background glyphs CSS with non-overlapping spatial luxury layout');
} else {
  console.log('⚠️ Could not match oldBgGlyphsCssPattern');
}

// Write back updated files
fs.writeFileSync(scriptPath, script, 'utf8');
fs.writeFileSync(stylePath, style, 'utf8');

console.log('🚀 Files written successfully!');
