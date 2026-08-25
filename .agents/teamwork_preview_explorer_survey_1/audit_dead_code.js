const fs = require('fs');
const path = require('path');

const rootDir = 'p:/Agents/ishq-radio-2.0';
const htmlContent = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const jsContent = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf8');
const cssContent = fs.readFileSync(path.join(rootDir, 'style.css'), 'utf8');
const jsLines = jsContent.split('\n');
const cssLines = cssContent.split('\n');

console.log('=== 1. JS DEAD FUNCTION AUDIT ===');
// Extract all function definitions in script.js: function foo( or var foo = function(
const funcDefinitions = [];
jsLines.forEach((line, idx) => {
  const lineNum = idx + 1;
  const match1 = line.match(/\bfunction\s+([a-zA-Z0-9_$]+)\s*\(/);
  if (match1) {
    funcDefinitions.push({ name: match1[1], line: lineNum, type: 'declaration', code: line.trim() });
  }
  const match2 = line.match(/\bvar\s+([a-zA-Z0-9_$]+)\s*=\s*(?:function|\(function|\(\s*\)\s*=>)/);
  if (match2) {
    funcDefinitions.push({ name: match2[1], line: lineNum, type: 'expression', code: line.trim() });
  }
});

const deadFunctions = [];
funcDefinitions.forEach(fn => {
  // Count occurrences of fn.name in jsContent and htmlContent
  const name = fn.name;
  if (['$', 'show', 'init', 'update', 'render', 'close', 'open', 'reset', 'skip', 'play', 'pause', 'stop', 'onPlayerReady', 'onPlayerStateChange', 'onYouTubeIframeAPIReady', 'escapeHtml'].includes(name)) {
    return;
  }
  const regex = new RegExp(`\\b${name}\\b`, 'g');
  const jsOccurrences = (jsContent.match(regex) || []).length;
  const htmlOccurrences = (htmlContent.match(regex) || []).length;

  if (jsOccurrences <= 1 && htmlOccurrences === 0) {
    deadFunctions.push({ name, line: fn.line, code: fn.code, jsOccurrences, htmlOccurrences });
  }
});

console.log(`Total functions audited: ${funcDefinitions.length}`);
console.log(`Potential dead functions (occurrences <= 1 in JS and 0 in HTML): ${deadFunctions.length}`);
deadFunctions.forEach(df => {
  console.log(`- Line ${df.line}: function "${df.name}" -> ${df.code}`);
});

console.log('\n=== 2. DEAD CSS SELECTOR AUDIT ===');
// Extract CSS rules from style.css
const cssRuleList = [];
let currentSel = '';
let inBrace = false;

cssLines.forEach((line, idx) => {
  const lineNum = idx + 1;
  const trimmed = line.trim();
  if (trimmed.startsWith('/*') && trimmed.endsWith('*/')) return;
  if (trimmed.startsWith('@')) return;

  if (!inBrace) {
    if (trimmed.includes('{')) {
      const parts = trimmed.split('{');
      currentSel += ' ' + parts[0];
      const sel = currentSel.trim();
      cssRuleList.push({ selector: sel, line: lineNum });
      currentSel = '';
      inBrace = true;
      if (parts[1] && parts[1].includes('}')) inBrace = false;
    } else {
      currentSel += ' ' + trimmed;
    }
  } else {
    if (trimmed.includes('}')) inBrace = false;
  }
});

const deadCss = [];
const standardClasses = new Set([
  'active', 'playing', 'paused', 'show', 'hide', 'open', 'visible', 'hidden',
  'loading', 'disabled', 'current', 'selected', 'dark', 'light', 'focus', 'hover',
  'dragging', 'animating', 'on', 'off', 'pulse', 'glow', 'blur', 'neon', 'flash',
  'fade-out', 'fade-in', 'active-btn', 'surprise-active', 'expanded', 'minimized'
]);

cssRuleList.forEach(rule => {
  const sel = rule.selector;
  if (!sel || sel.startsWith('@') || sel.startsWith(':root') || sel === '*') return;

  // Split compound selectors by comma
  const subSelectors = sel.split(',').map(s => s.trim());
  let allSubSelectorsDead = true;

  for (const sub of subSelectors) {
    // Find IDs
    const ids = [...sub.matchAll(/#([a-zA-Z0-9_-]+)/g)].map(m => m[1]);
    // Find classes
    const classes = [...sub.matchAll(/\.([a-zA-Z0-9_-]+)/g)].map(m => m[1]);

    let subIsAlive = false;

    // If sub has ID
    if (ids.length > 0) {
      const anyIdExists = ids.some(id => htmlContent.includes(`id="${id}"`) || htmlContent.includes(`id='${id}'`) || jsContent.includes(id));
      if (anyIdExists) subIsAlive = true;
    } else if (classes.length > 0) {
      // Check if classes exist in HTML or JS
      const meaningfulClasses = classes.filter(c => !standardClasses.has(c));
      if (meaningfulClasses.length === 0) {
        subIsAlive = true;
      } else {
        const anyClassExists = meaningfulClasses.some(c => htmlContent.includes(c) || jsContent.includes(c));
        if (anyClassExists) subIsAlive = true;
      }
    } else {
      // Tag selector like body, html, button, input
      subIsAlive = true;
    }

    if (subIsAlive) {
      allSubSelectorsDead = false;
      break;
    }
  }

  if (allSubSelectorsDead && subSelectors.length > 0) {
    deadCss.push({ selector: sel, line: rule.line });
  }
});

console.log(`Total CSS rules parsed: ${cssRuleList.length}`);
console.log(`Dead CSS rules identified: ${deadCss.length}`);
deadCss.slice(0, 50).forEach(dc => {
  console.log(`- Line ${dc.line}: "${dc.selector}"`);
});

fs.writeFileSync('p:/Agents/ishq-radio-2.0/.agents/teamwork_preview_explorer_survey_1/dead_analysis.json', JSON.stringify({ deadFunctions, deadCss }, null, 2));
