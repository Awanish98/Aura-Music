const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, '..', 'script.js');
const stylePath = path.join(__dirname, '..', 'style.css');

let script = fs.readFileSync(scriptPath, 'utf8');
let style = fs.readFileSync(stylePath, 'utf8');

// =========================================================================
// 1. SCRIPT.JS: Update fitBrandTitle with balanced font sizes
// =========================================================================
const oldFitPattern = /function fitBrandTitle\(str\) \{[\s\S]*?bTitle\.style\.setProperty\('--dynamic-brand-spacing-mobile', mobileSpacing\);\s*\}/;

const newFitFunc = `function fitBrandTitle(str) {
    var bTitle = $('brandTitle');
    if (!bTitle) return;

    var len = (str || '').trim().length;
    var desktopSize = 'clamp(20px, 2.2vw, 30px)';
    var desktopSpacing = '0.12em';
    var mobileSize = 'clamp(15px, 4.5vw, 20px)';
    var mobileSpacing = '0.08em';

    if (len <= 8) {
      // Short names (e.g. ISHQ, 90S, EDM)
      desktopSize = 'clamp(24px, 2.6vw, 36px)';
      desktopSpacing = '0.14em';
      mobileSize = 'clamp(18px, 5.5vw, 24px)';
      mobileSpacing = '0.10em';
    } else if (len <= 15) {
      // Medium short names (e.g. ARIJIT SINGH, TIME TRAVEL, MY VIBES)
      desktopSize = 'clamp(20px, 2.2vw, 30px)';
      desktopSpacing = '0.11em';
      mobileSize = 'clamp(15px, 4.5vw, 20px)';
      mobileSpacing = '0.08em';
    } else if (len <= 24) {
      // Medium names (e.g. SHREYA GHOSHAL, BOLLYWOOD ROMANCE)
      desktopSize = 'clamp(17px, 1.8vw, 24px)';
      desktopSpacing = '0.09em';
      mobileSize = 'clamp(13px, 3.8vw, 17px)';
      mobileSpacing = '0.06em';
    } else if (len <= 34) {
      // Long names
      desktopSize = 'clamp(15px, 1.5vw, 20px)';
      desktopSpacing = '0.07em';
      mobileSize = 'clamp(12px, 3.2vw, 15px)';
      mobileSpacing = '0.05em';
    } else {
      // Extra long names
      desktopSize = 'clamp(13px, 1.3vw, 17px)';
      desktopSpacing = '0.06em';
      mobileSize = 'clamp(11px, 2.8vw, 13px)';
      mobileSpacing = '0.04em';
    }

    bTitle.style.setProperty('--dynamic-brand-size', desktopSize);
    bTitle.style.setProperty('--dynamic-brand-spacing', desktopSpacing);
    bTitle.style.setProperty('--dynamic-brand-size-mobile', mobileSize);
    bTitle.style.setProperty('--dynamic-brand-spacing-mobile', mobileSpacing);
  }`;

if (oldFitPattern.test(script)) {
  script = script.replace(oldFitPattern, newFitFunc);
  console.log('✅ Updated fitBrandTitle with balanced non-colliding font sizing');
} else {
  console.log('⚠️ Could not match oldFitPattern');
}

// =========================================================================
// 2. STYLE.CSS: Add missing .shortcuts-modal overlay rules
// =========================================================================
const shortcutsModalCss = `
/* ==================== Keyboard Shortcuts Modal ==================== */
.shortcuts-modal {
  position: fixed;
  inset: 0;
  background: rgba(5, 4, 12, 0.82);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 1000;
  display: none;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.28s ease;
}

.shortcuts-modal.open {
  display: flex !important;
  opacity: 1 !important;
  pointer-events: auto !important;
}

.shortcuts-card {
  background: rgba(16, 13, 30, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 24px;
  padding: 24px 28px;
  width: 90%;
  max-width: 520px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.85), 0 0 35px var(--accent-glow, rgba(168, 85, 247, 0.4));
  animation: shortcutsPop 0.32s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes shortcutsPop {
  0%   { opacity: 0; transform: scale(0.92) translateY(12px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px 16px;
  margin-top: 18px;
}

.sc-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11.5px;
  color: var(--fg-dim, #d4c8e8);
  font-weight: 500;
}

.sc-row kbd {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 6px;
  padding: 3px 8px;
  font-family: 'Space Grotesk', monospace;
  font-size: 10.5px;
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(0,0,0,0.4);
  flex-shrink: 0;
}

.sc-row span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
`;

// Append shortcuts modal CSS to style.css if not present
if (!style.includes('.shortcuts-modal {')) {
  style += '\n' + shortcutsModalCss;
  console.log('✅ Added missing .shortcuts-modal CSS overlay rules');
}

// =========================================================================
// 3. STYLE.CSS: Refine Header, Wordmark, and Stage Layout
// =========================================================================

// Update .wordmark-container
style = style.replace(/\.wordmark-container\s*\{[\s\S]*?\n\}/, `.wordmark-container {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  pointer-events: none;
  cursor: default;
  z-index: 1;
  max-width: calc(100% - 480px);
  width: max-content;
  overflow: hidden;
  white-space: nowrap;
  gap: 2px;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}`);

// Update .wordmark-sub
style = style.replace(/\.wordmark-sub\s*\{[\s\S]*?\n\}/, `.wordmark-sub {
  font-family: 'Space Grotesk', 'Plus Jakarta Sans', sans-serif;
  font-size: clamp(8.5px, 0.8vw, 10px);
  letter-spacing: 0.14em;
  font-weight: 800;
  color: var(--fg-dim, #d8b4fe);
  margin-top: 1px;
  text-transform: uppercase;
  opacity: 0.95;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: min(480px, 42vw);
  box-sizing: border-box;
  text-shadow: 0 0 12px var(--accent-glow, rgba(168,85,247,0.45));
  padding: 2px 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  animation: subPulse 5s ease-in-out infinite;
  transition: all 0.3s ease;
  display: block;
}`);

// Update .turntable-wrap
style = style.replace(/\.turntable-wrap\s*\{[\s\S]*?\n\}/, `.turntable-wrap {
  position: relative;
  width: 180px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin: 2px 0;
}`);

// Update .art-card
style = style.replace(/\.art-card\s*\{[\s\S]*?\n\}/, `.art-card {
  position: relative;
  z-index: 2;
  width: 168px;
  height: 168px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 16px 45px rgba(0, 0, 0, 0.65), 0 0 25px var(--accent-glow);
  background: #0f0f14;
  transition: transform 0.3s var(--ease-smooth), box-shadow 0.3s ease;
}`);

// Update header
style = style.replace(/header\s*\{[\s\S]*?\n\}/, `header {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 56px;
  margin-bottom: 4px;
}`);

// Update main
style = style.replace(/main\s*\{[\s\S]*?\n\}/, `main {
  flex: 1;
  width: 100%;
  max-width: 580px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  gap: 8px;
}`);

// Update .stage
style = style.replace(/\.stage\s*\{[\s\S]*?\n\}/, `.stage {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}`);

// Synchronize version to v127.0
const newVersion = '127.0';
['sw.js', 'index.html', 'script.js'].forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/v126\.[0-9]+/g, 'v' + newVersion);
  content = content.replace(/v126\.0/g, 'v' + newVersion);
  content = content.replace(/aura-music-v[0-9.]+/g, 'aura-music-v' + newVersion);
  content = content.replace(/script\.js\?v=[0-9.]+/g, 'script.js?v=' + newVersion);
  content = content.replace(/style\.css\?v=[0-9.]+/g, 'style.css?v=' + newVersion);
  fs.writeFileSync(f, content, 'utf8');
});

fs.writeFileSync(scriptPath, script, 'utf8');
fs.writeFileSync(stylePath, style, 'utf8');

console.log('🚀 Applied all alignment, layout, and modal fixes! Synchronized to v' + newVersion);
