const fs = require('fs');
const path = require('path');

const stylePath = path.join(__dirname, '..', 'style.css');
let style = fs.readFileSync(stylePath, 'utf8');

const oldBgGlyphsCssPattern = /\/\* =+ Animated Genre-Adaptive Background Glyphs =+ \*\/[\s\S]*?@keyframes glyphHeartPulse\s*\{[\s\S]*?\}/;

const newBgGlyphsCss = `/* ==================== Animated Genre-Adaptive Background Glyphs ==================== */
.bg-glyphs {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
  background: radial-gradient(circle at 50% 40%, var(--theme-ambient) 0%, rgba(7, 7, 9, 0) 70%);
  transition: background 0.6s ease, opacity 0.8s ease;
  contain: strict;
}

.bg-glyphs .glyph {
  position: absolute;
  font-family: var(--theme-font, 'Cinzel', sans-serif);
  font-weight: 900;
  color: #ffffff;
  line-height: 1;
  user-select: none;
  opacity: var(--o, .085);
  transition: opacity 0.6s ease, color 0.6s ease;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  will-change: transform;
  white-space: nowrap;
  max-width: 44vw;
  overflow: hidden;
  text-overflow: clip;
  text-shadow: 0 0 25px rgba(255, 255, 255, 0.18), 0 0 45px var(--accent-glow, rgba(168, 85, 247, 0.35));
}

/* Top-Left Quadrant */
.bg-glyphs .g1 {
  top: 9%;
  left: 4%;
  font-size: clamp(2rem, 5.2vw, 4.5rem);
  --o: .095;
  filter: blur(0px);
  animation: glyphDrift1 42s ease-in-out infinite alternate;
}

/* Top-Right Quadrant */
.bg-glyphs .g2 {
  top: 10%;
  right: 4%;
  font-size: clamp(2.2rem, 5.6vw, 4.8rem);
  --o: .090;
  filter: blur(0px);
  text-align: right;
  animation: glyphDrift2 48s ease-in-out infinite alternate;
}

/* Bottom-Left Quadrant */
.bg-glyphs .g3 {
  bottom: 10%;
  left: 4%;
  font-size: clamp(2rem, 5.2vw, 4.5rem);
  --o: .095;
  filter: blur(0px);
  animation: glyphDrift3 54s ease-in-out infinite alternate;
}

/* Bottom-Right Quadrant */
.bg-glyphs .g4 {
  bottom: 10%;
  right: 4%;
  font-size: clamp(2.2rem, 5.6vw, 4.8rem);
  --o: .085;
  filter: blur(0px);
  text-align: right;
  animation: glyphDrift4 38s ease-in-out infinite alternate;
}

/* Mid-Left Floating Accent */
.bg-glyphs .g5 {
  top: 38%;
  left: 3%;
  font-size: clamp(1.2rem, 2.8vw, 2.2rem);
  --o: .075;
  filter: blur(0.5px);
  letter-spacing: 0.28em;
  animation: glyphDrift5 46s ease-in-out infinite alternate;
}

/* Mid-Right Floating Accent */
.bg-glyphs .g6 {
  top: 42%;
  right: 3%;
  font-size: clamp(1.2rem, 2.8vw, 2.2rem);
  --o: .075;
  filter: blur(0.5px);
  letter-spacing: 0.28em;
  text-align: right;
  animation: glyphDrift6 52s ease-in-out infinite alternate;
}

/* Subtle Centered Watermark with Majestic Glow */
.bg-glyphs .heart-glyph {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  font-family: var(--theme-font, 'Cinzel', sans-serif);
  font-weight: 900;
  font-size: clamp(3.8rem, 11vw, 9.5rem);
  color: #ffffff;
  line-height: 1;
  opacity: .068;
  letter-spacing: 0.20em;
  text-transform: uppercase;
  text-align: center;
  max-width: 82vw;
  overflow: hidden;
  white-space: nowrap;
  transition: opacity 0.6s ease;
  filter: blur(1.5px);
  text-shadow: 0 0 35px var(--accent-glow, rgba(168,85,247,0.4));
  will-change: transform, opacity;
  animation: glyphHeartPulse 16s ease-in-out infinite;
  pointer-events: none;
}

@keyframes glyphDrift1 {
  0%   { transform: translate3d(0, 0, 0) rotate(0deg); }
  50%  { transform: translate3d(14px, -16px, 0) rotate(1.2deg); }
  100% { transform: translate3d(-12px, 14px, 0) rotate(-1deg); }
}

@keyframes glyphDrift2 {
  0%   { transform: translate3d(0, 0, 0) rotate(0deg); }
  50%  { transform: translate3d(-16px, 14px, 0) rotate(-1.5deg); }
  100% { transform: translate3d(12px, -14px, 0) rotate(1deg); }
}

@keyframes glyphDrift3 {
  0%   { transform: translate3d(0, 0, 0) rotate(0deg); }
  50%  { transform: translate3d(16px, 14px, 0) rotate(1.8deg); }
  100% { transform: translate3d(-14px, -16px, 0) rotate(-1.2deg); }
}

@keyframes glyphDrift4 {
  0%   { transform: translate3d(0, 0, 0) rotate(0deg); }
  50%  { transform: translate3d(-14px, -12px, 0) rotate(-1.2deg); }
  100% { transform: translate3d(16px, 18px, 0) rotate(1.5deg); }
}

@keyframes glyphDrift5 {
  0%   { transform: translate3d(0, 0, 0); }
  50%  { transform: translate3d(12px, -10px, 0); }
  100% { transform: translate3d(-10px, 10px, 0); }
}

@keyframes glyphDrift6 {
  0%   { transform: translate3d(0, 0, 0); }
  50%  { transform: translate3d(-10px, 12px, 0); }
  100% { transform: translate3d(10px, -10px, 0); }
}

@keyframes glyphHeartPulse {
  0%, 100% { transform: translate3d(-50%, -50%, 0) scale(1); opacity: 0.065; }
  50%      { transform: translate3d(-50%, -50%, 0) scale(1.04); opacity: 0.095; }
}`;

if (oldBgGlyphsCssPattern.test(style)) {
  style = style.replace(oldBgGlyphsCssPattern, newBgGlyphsCss);
  console.log('✅ Replaced background glyphs CSS with vibrant, crisp, luxury typography');
} else {
  console.log('⚠️ Could not match oldBgGlyphsCssPattern');
}

// Lighten vignette so it doesn't darken the background typography
style = style.replace(
  /background:\s*radial-gradient\(ellipse 95% 85% at 50% 48%,\s*transparent 55%,\s*rgba\(4,\s*4,\s*6,\s*0\.8\)\s*100%\);/,
  'background: radial-gradient(ellipse 95% 85% at 50% 48%, transparent 65%, rgba(4, 4, 6, 0.45) 100%);'
);

// Synchronize version to v128.0
const newVersion = '128.0';
['sw.js', 'index.html', 'script.js'].forEach(f => {
  let content = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  content = content.replace(/v127\.[0-9]+/g, 'v' + newVersion);
  content = content.replace(/v127\.0/g, 'v' + newVersion);
  content = content.replace(/aura-music-v[0-9.]+/g, 'aura-music-v' + newVersion);
  content = content.replace(/script\.js\?v=[0-9.]+/g, 'script.js?v=' + newVersion);
  content = content.replace(/style\.css\?v=[0-9.]+/g, 'style.css?v=' + newVersion);
  fs.writeFileSync(path.join(__dirname, '..', f), content, 'utf8');
});

fs.writeFileSync(stylePath, style, 'utf8');
console.log('🚀 Applied vibrant background typography and bumped to v' + newVersion);
