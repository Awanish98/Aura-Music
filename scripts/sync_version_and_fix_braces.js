const fs = require('fs');

// 1. Fix style.css dangling lines
let css = fs.readFileSync('style.css', 'utf8');
const target = `@keyframes glyphHeartPulse {
  0%, 100% { transform: translate3d(-50%, -50%, 0) scale(1); opacity: 0.020; }
  50%      { transform: translate3d(-50%, -50%, 0) scale(1.04); opacity: 0.035; }
}
  50%      { transform: translate3d(-50%, -50%, 0) scale(1.06); opacity: 0.042; }
}`;

const replacement = `@keyframes glyphHeartPulse {
  0%, 100% { transform: translate3d(-50%, -50%, 0) scale(1); opacity: 0.020; }
  50%      { transform: translate3d(-50%, -50%, 0) scale(1.04); opacity: 0.035; }
}`;

css = css.replace(target, replacement);
fs.writeFileSync('style.css', css, 'utf8');
console.log('Fixed style.css balanced braces');

// 2. Synchronize versions to v126.0
const newVersion = '126.0';
['sw.js', 'index.html', 'script.js'].forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/v125\.[0-9]+/g, 'v' + newVersion);
  content = content.replace(/v124\.[0-9]+/g, 'v' + newVersion);
  content = content.replace(/v125\.0/g, 'v' + newVersion);
  content = content.replace(/v124\.0/g, 'v' + newVersion);
  content = content.replace(/aura-music-v[0-9.]+/g, 'aura-music-v' + newVersion);
  content = content.replace(/script\.js\?v=[0-9.]+/g, 'script.js?v=' + newVersion);
  content = content.replace(/style\.css\?v=[0-9.]+/g, 'style.css?v=' + newVersion);
  fs.writeFileSync(f, content, 'utf8');
});
console.log('Synchronized all files to v' + newVersion);
