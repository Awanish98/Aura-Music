const fs = require('fs');
const jsContent = fs.readFileSync('p:/Agents/ishq-radio-2.0/script.js', 'utf8');
const jsLines = jsContent.split('\n');

console.log('=== fetchLyrics Extraction (lines 3550-3640) ===');
for (let i = 3549; i < 3640; i++) {
  console.log(`${i + 1}: ${jsLines[i]}`);
}
