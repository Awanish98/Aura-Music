const fs = require('fs');
const path = require('path');

const stylePath = path.join(__dirname, '..', 'style.css');
const indexPath = path.join(__dirname, '..', 'index.html');

let style = fs.readFileSync(stylePath, 'utf8');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Update index.html author name from JORDAN to AWANISH
html = html.replace(
  /<span class="author-name">JORDAN<\/span>/,
  '<span class="author-name">AWANISH</span>'
);
fs.writeFileSync(indexPath, html, 'utf8');
console.log('✅ Updated index.html author name to AWANISH');

// 2. Add complete luxury footer styling to style.css
const footerCss = `
/* ==================== Main Shell Footer Status Bar ==================== */
footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 6px 12px;
  margin-top: 6px;
  font-family: 'Space Grotesk', 'Plus Jakarta Sans', sans-serif;
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--fg-dim, rgba(255, 255, 255, 0.45));
  z-index: 10;
  pointer-events: auto;
  user-select: none;
  box-sizing: border-box;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.live-radio-badge {
  color: #34d399;
  font-weight: 700;
  font-size: 9px;
  background: rgba(52, 211, 153, 0.08);
  border: 1px solid rgba(52, 211, 153, 0.22);
  padding: 2px 8px;
  border-radius: 999px;
  letter-spacing: 0.10em;
  white-space: nowrap;
}

.lossless-badge {
  color: var(--accent, #a855f7);
  font-weight: 700;
  font-size: 9px;
  background: rgba(168, 85, 247, 0.08);
  border: 1px solid rgba(168, 85, 247, 0.22);
  padding: 2px 8px;
  border-radius: 999px;
  letter-spacing: 0.10em;
  white-space: nowrap;
}

.footer-center {
  flex: 1;
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 9px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 600;
  white-space: nowrap;
}

.footer-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex: 1;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
}

.footer-help-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.75);
  padding: 2px 8px;
  border-radius: 6px;
  font-family: inherit;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.08em;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
}

.footer-help-btn:hover {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.3);
  color: #ffffff;
  transform: translateY(-1px);
}

.author-name {
  color: #ffffff;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-shadow: 0 0 12px var(--accent-glow, rgba(168, 85, 247, 0.5));
}

@media (max-width: 680px) {
  .footer-center {
    display: none;
  }
  footer {
    padding: 4px 6px;
  }
}
`;

if (!style.includes('/* ==================== Main Shell Footer Status Bar ==================== */')) {
  style += '\n' + footerCss;
  console.log('✅ Added luxury footer styles to style.css');
}

// Synchronize version to v132.0
const newVersion = '132.0';
['sw.js', 'index.html', 'script.js'].forEach(f => {
  let content = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  content = content.replace(/v131\.[0-9]+/g, 'v' + newVersion);
  content = content.replace(/v131\.0/g, 'v' + newVersion);
  content = content.replace(/aura-music-v[0-9.]+/g, 'aura-music-v' + newVersion);
  content = content.replace(/script\.js\?v=[0-9.]+/g, 'script.js?v=' + newVersion);
  content = content.replace(/style\.css\?v=[0-9.]+/g, 'style.css?v=' + newVersion);
  fs.writeFileSync(path.join(__dirname, '..', f), content, 'utf8');
});

fs.writeFileSync(stylePath, style, 'utf8');
console.log('🚀 Synchronized version to v' + newVersion);
