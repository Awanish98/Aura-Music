const fs = require('fs');
const path = require('path');

const rootDir = 'p:/Agents/ishq-radio-2.0';
const htmlContent = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const jsContent = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf8');
const jsLines = jsContent.split('\n');

const orphanIds = [
  'purgeCacheBtn', 'globalFloatingBackBtn', 'sleepTimerBtn',
  'spatialAudioToggle', 'spatialToggleLabel', 'spatialWidthSlider', 'spatialWidthVal',
  'eq60', 'eqVal60', 'eq250', 'eqVal250', 'eq1k', 'eqVal1k', 'eq4k', 'eqVal4k', 'eq12k', 'eqVal12k',
  'sleepTimerModal', 'closeTimerModalBtn', 'timerLabel',
  'miniPlayerToggleBtn', 'extrasBtn',
  'userAvatarBadge', 'userProfileName', 'userProfileBtn', 'heroSurpriseBtn'
];

console.log('=== DEEP DIVE ON ORPHANED ID LOOKUPS IN SCRIPT.JS ===\n');

orphanIds.forEach(id => {
  console.log(`--------------------------------------------------`);
  console.log(`ORPHAN ID: "${id}"`);
  console.log(`In HTML? ${htmlContent.includes(id) ? 'YES' : 'NO'}`);
  
  // Find all occurrences in JS
  jsLines.forEach((line, idx) => {
    if (line.includes(id)) {
      const lineNum = idx + 1;
      console.log(`  JS Line ${lineNum}: ${line.trim()}`);
      // Show surrounding 5 lines
      const start = Math.max(0, idx - 2);
      const end = Math.min(jsLines.length - 1, idx + 4);
      console.log('  Context:');
      for (let i = start; i <= end; i++) {
        console.log(`    ${i + 1}: ${jsLines[i]}`);
      }
    }
  });
});
