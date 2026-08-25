const fs = require('fs');
const path = require('path');

const rootDir = 'p:/Agents/ishq-radio-2.0';
const htmlContent = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const jsContent = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf8');
const cssContent = fs.readFileSync(path.join(rootDir, 'style.css'), 'utf8');
const swContent = fs.readFileSync(path.join(rootDir, 'sw.js'), 'utf8');

const htmlLines = htmlContent.split('\n');
const jsLines = jsContent.split('\n');
const cssLines = cssContent.split('\n');

const findings = {
  domAudit: {},
  eventListenerAudit: {},
  surpriseBtnAudit: {},
  deadJsCode: {},
  deadCssRules: [],
  staticErrors: [],
  cacheVersioning: {}
};

// ==========================================
// 1. DOM ID EXTRACTION
// ==========================================
const htmlIds = new Map(); // id -> [lineNumbers]
htmlLines.forEach((line, idx) => {
  const lineNum = idx + 1;
  const matches = [...line.matchAll(/\bid=["']([^"']+)["']/g)];
  matches.forEach(m => {
    const id = m[1];
    if (!htmlIds.has(id)) htmlIds.set(id, []);
    htmlIds.get(id).push(lineNum);
  });
});

// Dynamic IDs created in JS (e.g. innerHTML or id = '...')
const dynamicIdsInJs = new Set();
jsLines.forEach((line, idx) => {
  const matches1 = [...line.matchAll(/\bid=["']([^"']+)["']/g)];
  matches1.forEach(m => dynamicIdsInJs.add(m[1]));
  const matches2 = [...line.matchAll(/\.id\s*=\s*['"`]([^'"`]+)['"`]/g)];
  matches2.forEach(m => dynamicIdsInJs.add(m[1]));
});

// ==========================================
// 2. JS DOM LOOKUPS ($('id'), getElementById('id'), querySelector('#id'))
// ==========================================
const jsIdLookups = []; // { id, line, method, code }
jsLines.forEach((line, idx) => {
  const lineNum = idx + 1;

  // $('id')
  const dollarMatches = [...line.matchAll(/\$\(\s*['"`]([^'"`]+)['"`]\s*\)/g)];
  dollarMatches.forEach(m => {
    jsIdLookups.push({ id: m[1], line: lineNum, method: '$', code: line.trim() });
  });

  // getElementById('id')
  const gebiMatches = [...line.matchAll(/getElementById\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g)];
  gebiMatches.forEach(m => {
    jsIdLookups.push({ id: m[1], line: lineNum, method: 'getElementById', code: line.trim() });
  });

  // querySelector('#id')
  const qsMatches = [...line.matchAll(/querySelector(?:All)?\s*\(\s*['"`]#([a-zA-Z0-9_-]+)['"`]\s*\)/g)];
  qsMatches.forEach(m => {
    jsIdLookups.push({ id: m[1], line: lineNum, method: 'querySelector', code: line.trim() });
  });
});

// Group lookups by ID
const jsLookupsById = new Map();
jsIdLookups.forEach(l => {
  if (!jsLookupsById.has(l.id)) jsLookupsById.set(l.id, []);
  jsLookupsById.get(l.id).push(l);
});

// Check orphaned lookups (ID not in HTML and not in dynamic JS)
const orphanedLookups = [];
for (const [id, lookups] of jsLookupsById.entries()) {
  if (!htmlIds.has(id) && !dynamicIdsInJs.has(id)) {
    orphanedLookups.push({
      id,
      lookups
    });
  }
}

// ==========================================
// 3. INTERACTIVE ELEMENTS IN HTML VS LISTENERS
// ==========================================
// Extract all interactive elements: <button>, <input>, <select>, <textarea>, <a href=...>, or tags with role="button"
const interactiveElements = [];
const elRegex = /<([a-zA-Z0-9]+)\b([^>]*)>/g;
let match;
while ((match = elRegex.exec(htmlContent)) !== null) {
  const tag = match[1].toLowerCase();
  const attrs = match[2];
  const isInteractive = (
    ['button', 'input', 'select', 'textarea'].includes(tag) ||
    (tag === 'a' && /\bhref\b/i.test(attrs)) ||
    /\brole=["']button["']/i.test(attrs) ||
    /\b(onclick|onchange|oninput)\b/i.test(attrs) ||
    /\bclass=["'][^"']*\b(btn|toggle|switch|slider|chip|pill)\b[^"']*["']/i.test(attrs)
  );

  if (isInteractive) {
    const index = match.index;
    const lineNum = htmlContent.substring(0, index).split('\n').length;
    const idMatch = attrs.match(/\bid=["']([^"']+)["']/i);
    const classMatch = attrs.match(/\bclass=["']([^"']+)["']/i);
    const typeMatch = attrs.match(/\btype=["']([^"']+)["']/i);
    const onclickMatch = attrs.match(/\bonclick=["']([^"']+)["']/i);
    const dataActionMatch = attrs.match(/\bdata-action=["']([^"']+)["']/i);
    const dataMoodMatch = attrs.match(/\bdata-mood=["']([^"']+)["']/i);
    const dataTabMatch = attrs.match(/\bdata-tab=["']([^"']+)["']/i);

    interactiveElements.push({
      tag,
      id: idMatch ? idMatch[1] : null,
      classes: classMatch ? classMatch[1].split(/\s+/).filter(Boolean) : [],
      type: typeMatch ? typeMatch[1] : null,
      onclick: onclickMatch ? onclickMatch[1] : null,
      dataAction: dataActionMatch ? dataActionMatch[1] : null,
      dataMood: dataMoodMatch ? dataMoodMatch[1] : null,
      dataTab: dataTabMatch ? dataTabMatch[1] : null,
      line: lineNum,
      raw: match[0].substring(0, 100)
    });
  }
}

// Check which interactive elements are handled:
// Handled if:
// - has inline onclick/onchange/oninput
// - has an ID that is looked up in script.js
// - has a class that is queried with querySelectorAll in script.js (e.g. .mood-chip, .station-card, .tab-btn, .lrc-view-tab, .home-emoji-btn, etc.)
// - has a data attribute handled by delegation (e.g. data-mood, data-action, data-tab, data-rate, data-genre)

const delegatedClassesInJs = [
  'mood-chip', 'station-card', 'tab-btn', 'lrc-view-tab', 'home-emoji-btn', 'ambient-card',
  'eq-preset-chip', 'speed-chip', 'vibe-filter-pill', 'jam-track-item', 'jam-chat-quick-emoji',
  'vibe-explore-card', 'vibe-action-btn', 'queue-track-item', 'history-track-item', 'history-item',
  'track-card', 'mood-card', 'search-result-item', 'yt-result-card', 'sidebar-menu-btn',
  'modal-close-btn', 'modal-backdrop', 'preset-pill', 'tag-pill', 'station-item', 'genre-tag',
  'art-like-btn', 'art-similar-btn', 'un-skip-btn', 'ctrl-btn', 'sub-btn', 'play-btn', 'side-btn'
];

const delegatedDataAttrs = ['data-mood', 'data-action', 'data-tab', 'data-rate', 'data-genre', 'data-preset', 'data-speed', 'data-emoji', 'data-id', 'data-station'];

const unhandledInteractive = [];
interactiveElements.forEach(el => {
  let handled = false;
  let reason = '';

  if (el.onclick) {
    handled = true;
    reason = 'inline onclick';
  } else if (el.id && jsLookupsById.has(el.id)) {
    handled = true;
    reason = `ID lookup in JS (${jsLookupsById.get(el.id).length} occurrences)`;
  } else if (el.dataMood || el.dataAction || el.dataTab) {
    handled = true;
    reason = 'data-* delegation';
  } else {
    for (const cls of el.classes) {
      if (delegatedClassesInJs.includes(cls)) {
        handled = true;
        reason = `class delegation (.${cls})`;
        break;
      }
    }
  }

  if (!handled) {
    unhandledInteractive.push(el);
  }
});

// ==========================================
// 4. SURPRISE BUTTON DETAILED TRACING
// ==========================================
const surpriseBtnDetails = {
  dockSurpriseBtn: {
    html: htmlIds.get('dockSurpriseBtn') || null,
    jsLookups: jsLookupsById.get('dockSurpriseBtn') || []
  },
  heroSurpriseBtn: {
    html: htmlIds.get('heroSurpriseBtn') || null,
    jsLookups: jsLookupsById.get('heroSurpriseBtn') || []
  },
  btnSurpriseMood: {
    html: htmlIds.get('btnSurpriseMood') || null,
    jsLookups: jsLookupsById.get('btnSurpriseMood') || []
  }
};

// ==========================================
// 5. STATIC CODE QUALITY: POTENTIAL RUNTIME ERRORS
// ==========================================
// Check for null checks when accessing properties or adding listeners
const dangerousLookups = [];
jsLines.forEach((line, idx) => {
  const lineNum = idx + 1;
  // Match $('...').addEventListener or getElementById('...').addEventListener or querySelector('...').addEventListener
  const directAddListener = line.match(/(?:\$\(['"`]([^'"`]+)['"`]\)|getElementById\(['"`]([^'"`]+)['"`]\)|querySelector\(['"`]#([a-zA-Z0-9_-]+)['"`]\))\s*\.addEventListener/);
  if (directAddListener) {
    const id = directAddListener[1] || directAddListener[2] || directAddListener[3];
    const existsInHtml = htmlIds.has(id) || dynamicIdsInJs.has(id);
    dangerousLookups.push({
      id,
      line: lineNum,
      existsInHtml,
      code: line.trim()
    });
  }

  // Match $('...').onclick / .style / .classList / .innerHTML directly on the same line
  const directPropertyAccess = line.match(/(?:\$\(['"`]([^'"`]+)['"`]\)|getElementById\(['"`]([^'"`]+)['"`]\))\s*\.(onclick|style|classList|innerHTML|textContent|value|checked|disabled|focus)/);
  if (directPropertyAccess) {
    const id = directPropertyAccess[1] || directPropertyAccess[2];
    const existsInHtml = htmlIds.has(id) || dynamicIdsInJs.has(id);
    if (!existsInHtml) {
      dangerousLookups.push({
        id,
        line: lineNum,
        existsInHtml,
        code: line.trim()
      });
    }
  }
});

// Check for unhandled promises or JSON.parse / localStorage without try-catch
const jsonParseWithoutTryCatch = [];
jsLines.forEach((line, idx) => {
  const lineNum = idx + 1;
  if (/JSON\.parse\s*\(/.test(line)) {
    // Check if within 5 lines above there is a try {
    let hasTry = false;
    for (let i = Math.max(0, idx - 8); i <= idx; i++) {
      if (/\btry\s*\{/.test(jsLines[i])) {
        hasTry = true;
        break;
      }
    }
    if (!hasTry) {
      jsonParseWithoutTryCatch.push({
        line: lineNum,
        code: line.trim()
      });
    }
  }
});

// Check fetch calls without .catch or try/catch
const fetchWithoutCatch = [];
jsLines.forEach((line, idx) => {
  const lineNum = idx + 1;
  if (/\bfetch\s*\(/.test(line)) {
    // Check next 5 lines for .catch or if surrounded by try
    let hasCatch = false;
    for (let i = Math.max(0, idx - 3); i <= Math.min(jsLines.length - 1, idx + 8); i++) {
      if (/\.catch\b|\btry\s*\{|\bcatch\s*\(/.test(jsLines[i])) {
        hasCatch = true;
        break;
      }
    }
    if (!hasCatch) {
      fetchWithoutCatch.push({ line: lineNum, code: line.trim() });
    }
  }
});

// ==========================================
// 6. DEAD CSS RULES AUDIT
// ==========================================
// Extract CSS selectors
const cssSelectors = [];
let currentSelector = '';
let inBrackets = false;

for (let idx = 0; idx < cssLines.length; idx++) {
  const line = cssLines[idx];
  const lineNum = idx + 1;
  const trimmed = line.trim();

  if (trimmed.startsWith('/*') && trimmed.endsWith('*/')) continue;
  if (trimmed.startsWith('@')) continue; // skip @keyframes, @media for simple check

  if (!inBrackets) {
    if (trimmed.includes('{')) {
      const parts = trimmed.split('{');
      currentSelector += ' ' + parts[0];
      cssSelectors.push({ selector: currentSelector.trim(), line: lineNum });
      currentSelector = '';
      inBrackets = true;
      if (parts[1] && parts[1].includes('}')) {
        inBrackets = false;
      }
    } else {
      currentSelector += ' ' + trimmed;
    }
  } else {
    if (trimmed.includes('}')) {
      inBrackets = false;
    }
  }
}

// For each selector, check IDs (#xxx) and Classes (.xxx)
const deadCssSelectors = [];
cssSelectors.forEach(s => {
  const sel = s.selector;
  if (!sel || sel.startsWith('@') || sel.startsWith(':root')) return;

  // Extract IDs in selector
  const ids = [...sel.matchAll(/#([a-zA-Z0-9_-]+)/g)].map(m => m[1]);
  // Extract classes in selector
  const classes = [...sel.matchAll(/\.([a-zA-Z0-9_-]+)/g)].map(m => m[1]);

  let isDead = false;
  let reason = '';

  for (const id of ids) {
    if (!htmlIds.has(id) && !dynamicIdsInJs.has(id) && !jsContent.includes(id)) {
      isDead = true;
      reason = `ID #${id} not found in HTML or JS`;
      break;
    }
  }

  if (!isDead && classes.length > 0) {
    // Check if at least one specific class exists nowhere in HTML or JS
    // Note: Some utility/modifier classes might only be toggled in JS
    for (const cls of classes) {
      if (['active', 'playing', 'paused', 'show', 'hide', 'open', 'visible', 'hidden', 'loading', 'disabled', 'current', 'selected', 'dark', 'light', 'focus', 'hover', 'dragging', 'animating', 'on', 'off', 'pulse', 'glow', 'blur', 'neon'].includes(cls)) {
        continue;
      }
      if (!htmlContent.includes(cls) && !jsContent.includes(cls)) {
        isDead = true;
        reason = `Class .${cls} not found in HTML or JS`;
        break;
      }
    }
  }

  if (isDead) {
    deadCssSelectors.push({
      selector: sel,
      line: s.line,
      reason
    });
  }
});

// ==========================================
// 7. WRITE AUDIT RESULTS TO CONSOLE
// ==========================================
console.log('=== RESULTS SUMMARY ===');
console.log('Total HTML IDs:', htmlIds.size);
console.log('Total JS Lookups:', jsIdLookups.length);
console.log('Orphaned JS Lookups (ID nowhere in HTML/Dynamic JS):', orphanedLookups.length);
console.log('Unhandled Interactive Elements:', unhandledInteractive.length);
console.log('Dangerous Lookups (no null check on non-existent elements):', dangerousLookups.length);
console.log('JSON.parse without explicit try-catch:', jsonParseWithoutTryCatch.length);
console.log('Fetch without catch:', fetchWithoutCatch.length);
console.log('Dead CSS Selectors:', deadCssSelectors.length);

const out = {
  orphanedLookups,
  unhandledInteractive,
  surpriseBtnDetails,
  dangerousLookups,
  jsonParseWithoutTryCatch,
  fetchWithoutCatch,
  deadCssSelectors
};

fs.writeFileSync(path.join('p:/Agents/ishq-radio-2.0/.agents/teamwork_preview_explorer_survey_1/audit_output.json'), JSON.stringify(out, null, 2));
console.log('Audit output saved to audit_output.json');
