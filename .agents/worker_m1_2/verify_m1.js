const fs = require('fs');
const path = require('path');

const rootDir = 'p:/Agents/ishq-radio-2.0';
const htmlContent = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const jsContent = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf8');
const cssContent = fs.readFileSync(path.join(rootDir, 'style.css'), 'utf8');
const swContent = fs.readFileSync(path.join(rootDir, 'sw.js'), 'utf8');

console.log('=== MILESTONE 1 (M1) COMPREHENSIVE VERIFICATION ===\n');

let allPassed = true;

// 1. F1: Event Listener Hardening & Surprise Me Wiring
console.log('--- 1. F1: Surprise Me & Event Listeners ---');
const dockSurpriseInHtml = htmlContent.includes('id="dockSurpriseBtn"');
const dockSurpriseInJs = jsContent.includes("$('dockSurpriseBtn')");
const triggerSurpriseMeDefined = jsContent.includes('function triggerSurpriseMe()');
const surpriseActiveInJs = jsContent.includes("classList.add('surprise-active')");
const surpriseActiveInCss = cssContent.includes('.dock-surprise-btn.surprise-active');
const heroSurpriseInJs = jsContent.includes('heroSurpriseBtn');

console.log('1.1 #dockSurpriseBtn in index.html:', dockSurpriseInHtml ? 'PASS' : 'FAIL');
console.log('1.2 triggerSurpriseMe in script.js:', triggerSurpriseMeDefined ? 'PASS' : 'FAIL');
console.log('1.3 .surprise-active feedback in JS & CSS:', (surpriseActiveInJs && surpriseActiveInCss) ? 'PASS' : 'FAIL');
console.log('1.4 Dead #heroSurpriseBtn removed from script.js:', (!heroSurpriseInJs) ? 'PASS' : 'FAIL');

if (!dockSurpriseInHtml || !triggerSurpriseMeDefined || !surpriseActiveInJs || !surpriseActiveInCss || heroSurpriseInJs) {
  allPassed = false;
}

// Check 9 listeners null-guards
const guardedIds = [
  { id: 'homeJamStatusPill', varName: 'homeJamPill' },
  { id: 'homeChatToggleBtn', varName: 'homeChatToggle' },
  { id: 'homeQuickChatCloseBtn', varName: 'homeQuickChatClose' },
  { id: 'homeQuickChatSendBtn', varName: 'homeQuickChatSend' },
  { id: 'homeQuickChatInput', varName: 'homeQuickChatInp' },
  { id: 'premiumMenuToggle', varName: 'premiumToggle' },
  { id: 'closeSidebarBtn', varName: 'closeSidebarButton' },
  { id: 'sidebarBackdrop', varName: 'sidebarBdrop' },
  { id: 'sidebarLoginBtn', varName: 'sidebarLogin' }
];

let listenersGuarded = true;
guardedIds.forEach(item => {
  const queryStr = `$('${item.id}')`;
  if (!jsContent.includes(queryStr)) {
    console.log(`  FAIL: ${item.id} query not found in script.js`);
    listenersGuarded = false;
    return;
  }
  const assignmentPattern = `var ${item.varName} = $('${item.id}')`;
  const guardPattern = `if (${item.varName})`;
  const listenerPattern = `${item.varName}.addEventListener`;

  const hasAssignment = jsContent.includes(assignmentPattern);
  const hasGuard = jsContent.includes(guardPattern);
  const hasListener = jsContent.includes(listenerPattern);

  if (hasAssignment && hasGuard && hasListener) {
    console.log(`  PASS: ${item.id} -> var ${item.varName} properly guarded with if (${item.varName})`);
  } else {
    console.log(`  FAIL: ${item.id} (assign: ${hasAssignment}, guard: ${hasGuard}, listener: ${hasListener})`);
    listenersGuarded = false;
  }
});
console.log('1.5 All 9 targeted event listeners null-guarded:', listenersGuarded ? 'PASS' : 'FAIL');
if (!listenersGuarded) allPassed = false;

// Check localStorage try/catch
const likedSongsWrapped = jsContent.includes("try {") &&
  jsContent.includes("likedSongs = JSON.parse(localStorage.getItem('ishq_liked_songs') || '[]');") &&
  jsContent.includes("catch (e)");
console.log('1.6 localStorage likedSongs in try/catch:', likedSongsWrapped ? 'PASS' : 'FAIL');
if (!likedSongsWrapped) allPassed = false;

// Check dead functions
const deadFuncs = ['handleUniverseSearch', 'triggerAiDj'];
let deadFuncsPruned = true;
deadFuncs.forEach(fn => {
  if (jsContent.includes(`function ${fn}`)) {
    console.log(`  FAIL: Dead function ${fn} still present`);
    deadFuncsPruned = false;
  }
});
console.log('1.7 Dead functions (handleUniverseSearch, triggerAiDj) pruned:', deadFuncsPruned ? 'PASS' : 'FAIL');
if (!deadFuncsPruned) allPassed = false;

// 2. F2: HTML DOM Structure Repair
console.log('\n--- 2. F2: HTML DOM Structure ---');
const voidTags = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
  'param', 'source', 'track', 'wbr', '!doctype'
]);
const svgSelfClosingTags = new Set([
  'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse', 'use', 'stop',
  'feDropShadow', 'feGaussianBlur', 'feMerge', 'feMergeNode', 'feColorMatrix'
]);

const cleanedHtml = htmlContent.replace(/<!--[\s\S]*?-->/g, '').replace(/="[^"]*"/g, '=""').replace(/='[^']*'/g, "=''");
const tagRegex = /<\/?([a-zA-Z0-9:-]+)([^>]*?)>/g;
let stack = [];
let match;
let htmlErrors = 0;

while ((match = tagRegex.exec(cleanedHtml)) !== null) {
  const full = match[0];
  const tagName = match[1].toLowerCase();
  const isClosing = full.startsWith('</');
  const isSelfClosing = full.endsWith('/>') || voidTags.has(tagName) || (svgSelfClosingTags.has(tagName) && (full.endsWith('/>') || !isClosing));
  const lineNum = cleanedHtml.substring(0, match.index).split('\n').length;

  if (tagName === '!doctype') continue;

  if (isClosing) {
    if (stack.length === 0) {
      htmlErrors++;
      continue;
    }
    const top = stack[stack.length - 1];
    if (top.tagName === tagName) {
      stack.pop();
    } else {
      htmlErrors++;
      const idx = stack.findLastIndex(item => item.tagName === tagName);
      if (idx !== -1) {
        stack.splice(idx, stack.length - idx);
      }
    }
  } else if (!isSelfClosing) {
    stack.push({ tagName, lineNum });
  }
}
htmlErrors += stack.length;
console.log('2.1 HTML tag balance & hierarchy errors:', htmlErrors, (htmlErrors === 0 ? 'PASS' : 'FAIL'));
if (htmlErrors > 0) allPassed = false;

// 3. F3: Dead Code & CSS Selector Pruning
console.log('\n--- 3. F3: Dead Code & CSS Pruning ---');
const prunedSelectors = [
  'tonearm-assembly',
  'tonearm-base',
  'tonearm-rod',
  'tonearm-head',
  'tonearm-container',
  'vinyl-aura-ring',
  'vinyl-disc',
  'vinyl-grooves',
  'vinyl-center',
  'global-floating-back-btn',
  'custom-playlist-box',
  'manage-stations-link',
  'spatial-soundstage-panel',
  'spatial-toggle-btn',
  'eq-presets-grid',
  'eq-sliders-container',
  'eq-band',
  'user-profile-btn',
  'user-avatar-badge',
  'sidebar-toggle-pip',
  'glyph-matrix-modal',
  'nothing-phone-body',
  'visualizer-studio-modal',
  'hero-surprise-btn'
];

let allPruned = true;
prunedSelectors.forEach(sel => {
  if (cssContent.includes(`.${sel}`) || cssContent.includes(`#${sel}`)) {
    console.log(`  FAIL: Dead selector "${sel}" still found in style.css`);
    allPruned = false;
  }
});
console.log('3.1 All dead CSS selectors successfully pruned:', allPruned ? 'PASS' : 'FAIL');
if (!allPruned) allPassed = false;

// 4. F4: Cache Version Synchronization
console.log('\n--- 4. F4: Cache Version Synchronization ---');
const swVersion = (swContent.match(/CACHE_NAME\s*=\s*['"]([^'"]+)['"]/) || [])[1];
const htmlStyleVersion = (htmlContent.match(/style\.css\?v=([a-zA-Z0-9.]+)/) || [])[1];
const htmlScriptVersion = (htmlContent.match(/script\.js\?v=([a-zA-Z0-9.]+)/) || [])[1];
const jsCacheVersion = (jsContent.match(/name\s*!==\s*['"]([^'"]+)['"]/) || [])[1];

console.log('4.1 sw.js CACHE_NAME:       ', swVersion);
console.log('4.2 index.html style.css?v= : ', htmlStyleVersion);
console.log('4.3 index.html script.js?v= : ', htmlScriptVersion);
console.log('4.4 script.js eviction check: ', jsCacheVersion);

const cacheSynced = (swVersion === 'aura-music-v123.0') &&
                    (htmlStyleVersion === '123.0') &&
                    (htmlScriptVersion === '123.0') &&
                    (jsCacheVersion === 'aura-music-v123.0');

console.log('4.5 All 4 locations synchronized to v123.0:', cacheSynced ? 'PASS' : 'FAIL');
if (!cacheSynced) allPassed = false;

console.log('\n=============================================');
console.log('FINAL VERIFICATION RESULT:', allPassed ? 'ALL PASS (100% COMPLETE)' : 'FAILED');
console.log('=============================================');
