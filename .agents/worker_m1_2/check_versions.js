const fs = require('fs');
const sw = fs.readFileSync('p:/Agents/ishq-radio-2.0/sw.js', 'utf8');
const html = fs.readFileSync('p:/Agents/ishq-radio-2.0/index.html', 'utf8');
const js = fs.readFileSync('p:/Agents/ishq-radio-2.0/script.js', 'utf8');

const swVersion = sw.match(/CACHE_NAME\s*=\s*['"]([^'"]+)['"]/)[1];
const htmlStyleVersion = html.match(/style\.css\?v=([a-zA-Z0-9.]+)/)[1];
const htmlScriptVersion = html.match(/script\.js\?v=([a-zA-Z0-9.]+)/)[1];
const jsCacheVersion = js.match(/name\s*!==\s*['"]([^'"]+)['"]/)[1];

console.log('=== CACHE VERSION AUDIT ===');
console.log('sw.js CACHE_NAME:       ', swVersion);
console.log('index.html style.css?v= : ', htmlStyleVersion);
console.log('index.html script.js?v= : ', htmlScriptVersion);
console.log('script.js eviction check: ', jsCacheVersion);

const allMatch = (swVersion === 'aura-music-v123.0') &&
                 (htmlStyleVersion === '123.0') &&
                 (htmlScriptVersion === '123.0') &&
                 (jsCacheVersion === 'aura-music-v123.0');

console.log('All 4 locations synchronized to v123.0:', allMatch);
