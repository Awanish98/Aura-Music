const fs = require('fs');
const path = require('path');

const stylePath = path.join(__dirname, '..', 'style.css');
let style = fs.readFileSync(stylePath, 'utf8');

// 1. Precise change: line 1113 turntable-wrap
style = style.replace(
  /\.turntable-wrap\s*\{[\s\S]*?margin:\s*2px\s*0;\s*\}/,
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

// 2. Precise change: line 1143 art-card base
style = style.replace(
  /\.art-card\s*\{[\s\S]*?width:\s*168px;[\s\S]*?height:\s*168px;[\s\S]*?\}/,
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

// 3. Precise change: line 6809 art-card override
style = style.replace(
  /width:\s*220px\s*!important;\s*height:\s*220px\s*!important;\s*border-radius:\s*28px\s*!important;/,
  'width: 140px !important;\n  height: 140px !important;\n  border-radius: 20px !important;'
);

// 4. Ensure .lrcgod-indicator-dot is clean 5px
style = style.replace(
  /\.lrcgod-indicator-dot\s*\{[\s\S]*?display:\s*none;\s*\}/,
  `.lrcgod-indicator-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #ffd700;
  box-shadow: 0 0 6px #ffd700;
  display: none;
}`
);

// 5. Synchronize to v130.0
const newVersion = '130.0';
['sw.js', 'index.html', 'script.js'].forEach(f => {
  let content = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  content = content.replace(/v129\.[0-9]+/g, 'v' + newVersion);
  content = content.replace(/v129\.0/g, 'v' + newVersion);
  content = content.replace(/v128\.[0-9]+/g, 'v' + newVersion);
  content = content.replace(/v128\.0/g, 'v' + newVersion);
  content = content.replace(/aura-music-v[0-9.]+/g, 'aura-music-v' + newVersion);
  content = content.replace(/script\.js\?v=[0-9.]+/g, 'script.js?v=' + newVersion);
  content = content.replace(/style\.css\?v=[0-9.]+/g, 'style.css?v=' + newVersion);
  fs.writeFileSync(path.join(__dirname, '..', f), content, 'utf8');
});

fs.writeFileSync(stylePath, style, 'utf8');
console.log('✅ Safely applied compact album art (140px) and 5px lrcgod dot! Bumped to v' + newVersion);
