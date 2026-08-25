const fs = require('fs');
const path = require('path');

const adminJsPath = path.join(__dirname, '..', 'admin.js');
const adminHtmlPath = path.join(__dirname, '..', 'admin.html');

let adminJs = fs.readFileSync(adminJsPath, 'utf8');
let adminHtml = fs.readFileSync(adminHtmlPath, 'utf8');

// 1. Update admin.js PIN to 'jessica'
adminJs = adminJs.replace(
  /var ADMIN_PIN = '[^']+';/,
  "var ADMIN_PIN = 'jessica';"
);

adminJs = adminJs.replace(
  /if \(val === ADMIN_PIN \|\| val === 'admin2026'\) \{/,
  "if (val.toLowerCase() === 'jessica') {"
);

adminJs = adminJs.replace(
  /showToast\('Incorrect PIN! Access Denied ❌'\);/,
  "showToast('Incorrect Password! Access Denied ❌');"
);

fs.writeFileSync(adminJsPath, adminJs, 'utf8');
console.log('✅ Updated admin.js password to jessica');

// 2. Update admin.html placeholder & description
adminHtml = adminHtml.replace(
  /placeholder="Enter Admin PIN \(Default: [^"]+\)"/,
  'placeholder="Enter Admin Password"'
);

adminHtml = adminHtml.replace(
  /master PIN to manage radio stations/,
  'master password to manage radio stations'
);

fs.writeFileSync(adminHtmlPath, adminHtml, 'utf8');
console.log('✅ Updated admin.html text & placeholder');

// 3. Synchronize version to v133.0
const newVersion = '133.0';
['sw.js', 'index.html', 'script.js'].forEach(f => {
  let content = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  content = content.replace(/v132\.[0-9]+/g, 'v' + newVersion);
  content = content.replace(/v132\.0/g, 'v' + newVersion);
  content = content.replace(/aura-music-v[0-9.]+/g, 'aura-music-v' + newVersion);
  content = content.replace(/script\.js\?v=[0-9.]+/g, 'script.js?v=' + newVersion);
  content = content.replace(/style\.css\?v=[0-9.]+/g, 'style.css?v=' + newVersion);
  fs.writeFileSync(path.join(__dirname, '..', f), content, 'utf8');
});

console.log('🚀 Synchronized version to v' + newVersion);
