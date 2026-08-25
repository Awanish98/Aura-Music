const fs = require('fs');
const path = require('path');

const stylePath = path.join(__dirname, '..', 'style.css');
let style = fs.readFileSync(stylePath, 'utf8');

const fullscreenAndAutoplayCss = `
/* ==================== Autoplay Modal Overlay ==================== */
.autoplay-overlay {
  position: fixed;
  inset: 0;
  background: rgba(5, 4, 14, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 9999;
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.autoplay-overlay.visible {
  display: flex !important;
  opacity: 1 !important;
  pointer-events: auto !important;
}

.autoplay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  text-align: center;
  animation: autoplayPop 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes autoplayPop {
  0%   { opacity: 0; transform: scale(0.9) translateY(12px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

.pulse-play-ring {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent, #a855f7) 0%, #ec4899 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 45px var(--accent-glow, rgba(168, 85, 247, 0.6)), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  animation: autoplayPulse 1.8s infinite ease-in-out;
}

.pulse-play-ring svg {
  width: 34px;
  height: 34px;
  fill: #ffffff;
  margin-left: 4px;
}

.autoplay-text {
  font-family: 'Space Grotesk', 'Plus Jakarta Sans', sans-serif;
  font-size: 13px;
  letter-spacing: 0.16em;
  font-weight: 800;
  text-transform: uppercase;
  color: #ffffff;
  text-shadow: 0 0 18px rgba(255, 255, 255, 0.4);
}

@keyframes autoplayPulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 35px var(--accent-glow, rgba(168, 85, 247, 0.5)); }
  50%      { transform: scale(1.08); box-shadow: 0 0 65px var(--accent-glow, rgba(168, 85, 247, 0.8)); }
}

/* ==================== Fullscreen Luxury Mode (body.fs-on) ==================== */
body.fs-on .shell {
  padding: 24px 36px 20px;
  max-width: 1400px;
  height: 100vh;
  justify-content: space-between;
}

body.fs-on header {
  min-height: 60px;
}

body.fs-on .turntable-wrap {
  width: 156px;
  height: 156px;
  margin: 4px auto;
}

body.fs-on .art-card {
  width: 148px !important;
  height: 148px !important;
  border-radius: 22px !important;
  box-shadow: 0 20px 55px rgba(0, 0, 0, 0.85), 0 0 40px var(--accent-glow, rgba(168, 85, 247, 0.5)) !important;
}

body.fs-on .track-info {
  gap: 4px;
  margin: 2px 0;
}

body.fs-on .now-title {
  font-size: 23px;
  line-height: 34px;
}

body.fs-on .now-artist {
  font-size: 13.5px;
}

body.fs-on .live-lyric-bar {
  max-width: 520px;
  height: 26px;
}

body.fs-on .progress-container {
  max-width: 480px;
  margin: 8px auto 4px;
}

body.fs-on .controls-glass {
  padding: 10px 18px;
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.85), 0 0 40px var(--accent-glow, rgba(168, 85, 247, 0.4));
}
`;

if (!style.includes('.autoplay-overlay {')) {
  style += '\n' + fullscreenAndAutoplayCss;
  console.log('✅ Added .autoplay-overlay and body.fs-on styles to style.css');
}

// Synchronize version to v131.0
const newVersion = '131.0';
['sw.js', 'index.html', 'script.js'].forEach(f => {
  let content = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  content = content.replace(/v130\.[0-9]+/g, 'v' + newVersion);
  content = content.replace(/v130\.0/g, 'v' + newVersion);
  content = content.replace(/aura-music-v[0-9.]+/g, 'aura-music-v' + newVersion);
  content = content.replace(/script\.js\?v=[0-9.]+/g, 'script.js?v=' + newVersion);
  content = content.replace(/style\.css\?v=[0-9.]+/g, 'style.css?v=' + newVersion);
  fs.writeFileSync(path.join(__dirname, '..', f), content, 'utf8');
});

fs.writeFileSync(stylePath, style, 'utf8');
console.log('🚀 Synchronized version to v' + newVersion);
