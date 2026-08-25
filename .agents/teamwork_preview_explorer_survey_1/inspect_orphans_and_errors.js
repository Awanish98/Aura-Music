const fs = require('fs');
const path = require('path');

const rootDir = 'p:/Agents/ishq-radio-2.0';
const audit = JSON.parse(fs.readFileSync('p:/Agents/ishq-radio-2.0/.agents/teamwork_preview_explorer_survey_1/audit_output.json', 'utf8'));
const jsContent = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf8');
const jsLines = jsContent.split('\n');
const htmlContent = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const htmlLines = htmlContent.split('\n');

console.log('====================================================');
console.log('1. ORPHANED JS LOOKUPS (JS refers to non-existent ID)');
console.log('====================================================');
audit.orphanedLookups.forEach((item, idx) => {
  console.log(`\n[${idx + 1}] ID: "${item.id}" (Total references: ${item.lookups.length})`);
  item.lookups.forEach(l => {
    // Check context around line
    const start = Math.max(0, l.line - 2);
    const end = Math.min(jsLines.length - 1, l.line + 2);
    console.log(`  Line ${l.line}: ${l.code}`);
    // Check if guarded with if (...)
    let isGuarded = false;
    for (let i = Math.max(0, l.line - 3); i <= Math.min(jsLines.length - 1, l.line + 1); i++) {
      if (new RegExp(`if\\s*\\(.*${item.id}.*\\)`).test(jsLines[i]) || new RegExp(`\\b${item.id}\\s*&&`).test(jsLines[i])) {
        isGuarded = true;
      }
    }
    console.log(`  Guarded: ${isGuarded ? 'YES' : 'POTENTIAL RISK / UNGUARDED'}`);
  });
});

console.log('\n====================================================');
console.log('2. DANGEROUS LOOKUPS (Direct property / listener on null)');
console.log('====================================================');
audit.dangerousLookups.forEach((d, idx) => {
  console.log(`[${idx + 1}] Line ${d.line}: ID "${d.id}" (Exists in HTML: ${d.existsInHtml})`);
  console.log(`    Code: ${d.code}`);
});

console.log('\n====================================================');
console.log('3. SURPRISE BUTTON WIRING TRACE');
console.log('====================================================');
console.log('dockSurpriseBtn in HTML:');
htmlLines.forEach((line, idx) => {
  if (line.includes('dockSurpriseBtn')) {
    console.log(`  HTML Line ${idx + 1}: ${line.trim()}`);
  }
});
console.log('dockSurpriseBtn in JS:');
jsLines.forEach((line, idx) => {
  if (line.includes('dockSurpriseBtn') || line.includes('triggerSurpriseMe') || line.includes('surpriseMe') || line.includes('SurpriseMe')) {
    console.log(`  JS Line ${idx + 1}: ${line.trim()}`);
  }
});

console.log('heroSurpriseBtn in HTML:');
htmlLines.forEach((line, idx) => {
  if (line.includes('heroSurpriseBtn')) {
    console.log(`  HTML Line ${idx + 1}: ${line.trim()}`);
  }
});
console.log('heroSurpriseBtn in JS:');
jsLines.forEach((line, idx) => {
  if (line.includes('heroSurpriseBtn')) {
    console.log(`  JS Line ${idx + 1}: ${line.trim()}`);
  }
});

console.log('btnSurpriseMood in HTML:');
htmlLines.forEach((line, idx) => {
  if (line.includes('btnSurpriseMood')) {
    console.log(`  HTML Line ${idx + 1}: ${line.trim()}`);
  }
});
console.log('btnSurpriseMood in JS:');
jsLines.forEach((line, idx) => {
  if (line.includes('btnSurpriseMood')) {
    console.log(`  JS Line ${idx + 1}: ${line.trim()}`);
  }
});

console.log('\n====================================================');
console.log('4. JSON.parse WITHOUT TRY-CATCH');
console.log('====================================================');
audit.jsonParseWithoutTryCatch.forEach((item, idx) => {
  console.log(`[${idx + 1}] Line ${item.line}: ${item.code}`);
});

console.log('\n====================================================');
console.log('5. FETCH CALLS WITHOUT CATCH');
console.log('====================================================');
audit.fetchWithoutCatch.forEach((item, idx) => {
  console.log(`[${idx + 1}] Line ${item.line}: ${item.code}`);
});
