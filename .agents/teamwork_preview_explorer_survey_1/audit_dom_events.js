const fs = require('fs');
const path = require('path');

const rootDir = 'p:/Agents/ishq-radio-2.0';
const htmlContent = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const jsContent = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf8');
const cssContent = fs.readFileSync(path.join(rootDir, 'style.css'), 'utf8');
const swContent = fs.readFileSync(path.join(rootDir, 'sw.js'), 'utf8');

console.log('--- AUDIT REPORT INITIALIZATION ---');
console.log('HTML size:', htmlContent.length, 'lines:', htmlContent.split('\n').length);
console.log('JS size:', jsContent.length, 'lines:', jsContent.split('\n').length);
console.log('CSS size:', cssContent.length, 'lines:', cssContent.split('\n').length);
console.log('SW size:', swContent.length, 'lines:', swContent.split('\n').length);

// 1. Extract all IDs from HTML with line numbers
const htmlLines = htmlContent.split('\n');
const htmlIds = new Map(); // id -> array of line numbers
const htmlElements = []; // { tag, id, classes, type, role, line, outerHtml }

htmlLines.forEach((line, idx) => {
  const lineNum = idx + 1;
  const idMatches = [...line.matchAll(/\bid=["']([^"']+)["']/g)];
  idMatches.forEach(m => {
    const id = m[1];
    if (!htmlIds.has(id)) htmlIds.set(id, []);
    htmlIds.get(id).push(lineNum);
  });
});

console.log('Total unique IDs in index.html:', htmlIds.size);

// 2. Extract interactive elements in HTML
const buttonRegex = /<(button|input|select|textarea|a)\b([^>]*)>/gi;
let match;
const interactiveElements = [];
while ((match = buttonRegex.exec(htmlContent)) !== null) {
  const tag = match[1].toLowerCase();
  const attrs = match[2];
  const index = match.index;
  const lineNum = htmlContent.substring(0, index).split('\n').length;
  const idMatch = attrs.match(/\bid=["']([^"']+)["']/i);
  const classMatch = attrs.match(/\bclass=["']([^"']+)["']/i);
  const typeMatch = attrs.match(/\btype=["']([^"']+)["']/i);
  const onclickMatch = attrs.match(/\bonclick=["']([^"']+)["']/i);
  interactiveElements.push({
    tag,
    id: idMatch ? idMatch[1] : null,
    classes: classMatch ? classMatch[1].split(/\s+/).filter(Boolean) : [],
    type: typeMatch ? typeMatch[1] : null,
    onclick: onclickMatch ? onclickMatch[1] : null,
    line: lineNum,
    raw: match[0]
  });
}

console.log('Total interactive elements in index.html:', interactiveElements.length);

// 3. Extract all getElementById / querySelector / querySelectorAll in JS
const jsLines = jsContent.split('\n');
const jsIdLookups = []; // { id, line, type, isNullChecked, attachesListener, code }

jsLines.forEach((line, idx) => {
  const lineNum = idx + 1;
  // getElementById('xxx') or getElementById("xxx")
  const gebiMatches = [...line.matchAll(/getElementById\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g)];
  gebiMatches.forEach(m => {
    jsIdLookups.push({
      id: m[1],
      line: lineNum,
      type: 'getElementById',
      code: line.trim()
    });
  });

  // querySelector('#xxx')
  const qsMatches = [...line.matchAll(/querySelector(?:All)?\s*\(\s*['"`]#([a-zA-Z0-9_-]+)['"`]\s*\)/g)];
  qsMatches.forEach(m => {
    jsIdLookups.push({
      id: m[1],
      line: lineNum,
      type: 'querySelector',
      code: line.trim()
    });
  });
});

console.log('Total ID lookups in script.js:', jsIdLookups.length);

// 4. Find Orphaned Lookups (JS looks for an ID that does NOT exist in index.html)
const orphanedLookups = [];
jsIdLookups.forEach(lookup => {
  if (!htmlIds.has(lookup.id)) {
    orphanedLookups.push(lookup);
  }
});

console.log('Orphaned JS ID lookups count:', orphanedLookups.length);
console.log('Orphaned Lookups Details:');
orphanedLookups.forEach(o => {
  console.log(`- Line ${o.line} [${o.type}]: ID "${o.id}" -> Code: ${o.code}`);
});

// 5. Check interactive elements without explicit ID or event listener
console.log('\n--- Checking Interactive Elements with IDs in HTML ---');
const handledIdsInJs = new Set(jsIdLookups.map(l => l.id));
const unhandledInteractive = [];
interactiveElements.forEach(el => {
  if (el.id) {
    const isLookedUp = handledIdsInJs.has(el.id);
    if (!isLookedUp && !el.onclick) {
      unhandledInteractive.push(el);
    }
  } else {
    if (!el.onclick) {
      unhandledInteractive.push(el);
    }
  }
});

console.log('Interactive elements without direct JS ID lookup or onclick:', unhandledInteractive.length);
unhandledInteractive.slice(0, 30).forEach(el => {
  console.log(`- Line ${el.line}: <${el.tag}> ID: ${el.id || '(none)'} Class: ${el.classes.join('.')} Type: ${el.type || ''} Raw: ${el.raw.substring(0, 60)}`);
});

// 6. Check dockSurpriseBtn, heroSurpriseBtn, btnSurpriseMood specifically
console.log('\n--- Surprise Button Investigation ---');
console.log('dockSurpriseBtn in HTML:', htmlIds.get('dockSurpriseBtn'));
console.log('heroSurpriseBtn in HTML:', htmlIds.get('heroSurpriseBtn'));
console.log('btnSurpriseMood in HTML:', htmlIds.get('btnSurpriseMood'));

console.log('JS references to dockSurpriseBtn:');
jsLines.forEach((line, idx) => {
  if (line.includes('dockSurpriseBtn')) {
    console.log(`  Line ${idx + 1}: ${line.trim()}`);
  }
});
console.log('JS references to heroSurpriseBtn:');
jsLines.forEach((line, idx) => {
  if (line.includes('heroSurpriseBtn')) {
    console.log(`  Line ${idx + 1}: ${line.trim()}`);
  }
});
console.log('JS references to btnSurpriseMood:');
jsLines.forEach((line, idx) => {
  if (line.includes('btnSurpriseMood')) {
    console.log(`  Line ${idx + 1}: ${line.trim()}`);
  }
});
