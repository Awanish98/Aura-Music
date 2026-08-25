const fs = require('fs');
const jsContent = fs.readFileSync('p:/Agents/ishq-radio-2.0/script.js', 'utf8');
const jsLines = jsContent.split('\n');

console.log('=== fetchLiveWeather Extraction (lines 2814-2850) ===');
for (let i = 2813; i < 2850; i++) {
  console.log(`${i + 1}: ${jsLines[i]}`);
}
