const fs = require('fs');
const content = fs.readFileSync('p:/Agents/ishq-radio-2.0/script.js', 'utf8');
const lines = content.split('\n');

console.log('=== ALL addEventListener IN SCRIPT.JS ===');
const allListeners = [];
lines.forEach((line, idx) => {
  if (line.includes('addEventListener')) {
    allListeners.push({ line: idx + 1, code: line.trim() });
  }
});

console.log(`Total addEventListener calls: ${allListeners.length}`);
allListeners.forEach(l => {
  console.log(`${l.line}: ${l.code}`);
});
