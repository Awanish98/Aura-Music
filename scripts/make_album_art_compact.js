const fs = require('fs');
const path = require('path');

const stylePath = path.join(__dirname, '..', 'style.css');
let style = fs.readFileSync(stylePath, 'utf8');

// 1. Update primary .turntable-wrap and .art-card (lines ~1110-1150)
style = style.replace(
  /\.turntable-wrap\s*\{[\s\S]*?\n\}/,
  `.turntable-wrap {
  position: relative;
  width: 148px;
  height: 148px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin: 0 auto;
}`
);

style = style.replace(
  /\.art-card\s*\{[\s\S]*?\n\}/,
  `.art-card {
  position: relative;
  z-index: 2;
  width: 140px;
  height: 140px;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.7), 0 0 25px var(--accent-glow);
  background: #0f0f14;
  transition: transform 0.3s var(--ease-smooth), box-shadow 0.3s ease;
}`
);

// 2. Update the override .art-card at line ~6809
style = style.replace(
  /\.art-card\s*\{\s*position:\s*relative\s*!important;\s*z-index:\s*2\s*!important;\s*width:\s*220px\s*!important;\s*height:\s*220px\s*!important;[\s\S]*?\}/,
  `.art-card {
  position: relative !important;
  z-index: 2 !important;
  width: 140px !important;
  height: 140px !important;
  border-radius: 20px !important;
  overflow: hidden !important;
  border: 1px solid rgba(255, 255, 255, 0.16) !important;
  box-shadow: 0 16px 45px rgba(0, 0, 0, 0.85), 0 0 35px var(--accent-glow, rgba(168, 85, 247, 0.4)) !important;
  background: #0d0c14 !important;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease !important;
  margin: 0 auto !important;
}`
);

// 3. Update mobile media queries for .art-card if any
style = style.replace(
  /@media\s*\(max-width:\s*768px\)[\s\S]*?\.turntable-wrap\s*\{[\s\S]*?\}/,
  (match) => match.replace(/width:\s*\d+px/g, 'width: 124px').replace(/height:\s*\d+px/g, 'height: 124px')
);

// Synchronize version to v129.0
const newVersion = '129.0';
['sw.js', 'index.html', 'script.js'].forEach(f => {
  let content = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  content = content.replace(/v128\.[0-9]+/g, 'v' + newVersion);
  content = content.replace(/v128\.0/g, 'v' + newVersion);
  content = content.replace(/aura-music-v[0-9.]+/g, 'aura-music-v' + newVersion);
  content = content.replace(/script\.js\?v=[0-9.]+/g, 'script.js?v=' + newVersion);
  content = content.replace(/style\.css\?v=[0-9.]+/g, 'style.css?v=' + newVersion);
  fs.writeFileSync(path.join(__dirname, '..', f), content, 'utf8');
});

fs.writeFileSync(stylePath, style, 'utf8');
console.log('🚀 Applied compact album art size (140px) and synchronized to v' + newVersion);
