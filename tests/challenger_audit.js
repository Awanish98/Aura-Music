const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');
const HTML_PATH = path.join(ROOT_DIR, 'index.html');
const JS_PATH = path.join(ROOT_DIR, 'script.js');
const CSS_PATH = path.join(ROOT_DIR, 'style.css');
const SW_PATH = path.join(ROOT_DIR, 'sw.js');

const htmlContent = fs.readFileSync(HTML_PATH, 'utf8');
const jsContent = fs.readFileSync(JS_PATH, 'utf8');
const cssContent = fs.readFileSync(CSS_PATH, 'utf8');
const swContent = fs.readFileSync(SW_PATH, 'utf8');

console.log('=======================================================================');
console.log('       AURA MUSIC 2.0 — EMPIRICAL CHALLENGER ADVERSARIAL AUDIT\n       M1 Static Integrity, DOM, CSS, and Event Resilience     ');
console.log('=======================================================================\n');

let totalTests = 0;
let passedTests = 0;
const failures = [];

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log('  ✔ PASS: ' + name);
  } catch (err) {
    failures.push({ name: name, error: err.message });
    console.error('  ♝ FAIL: ' + name + '\n    Error: ' + err.message);
  }
}

// SECTION 1: STRICT DOM & HTML INTEGRITY
console.log('--- SECTION 1: STRICT DOM &\n HTML INTEGRITY ---');

runTest('1.1: 0 Duplicate IDs in index.html', () => {
  const idRegex = /\id\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
  const idMap = new Map();
  let m;
  while ((m = idRegex.exec(htmlContent)) !== null) {
    const id = (m[1] || m[2] || '').trim();
    if (id) {
      idMap.set(id, (idMap.get(id) || 0) + 1);
    }
  }
  const duplicates = [];
  idMap.forEach((count, id) => {
    if (count > 1) duplicates.push({ id: id, count: count });
  });
  assert.strictEqual(duplicates.length, 0, 'Duplicate IDs found: ' + JSON.stringify(duplicates));
});

runTest('1.2: Strict DOM tag balance (zero unclosed, zero orphan tags)', () => {
  const voidElements = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr','!doctype']);
  const svgSelf = new Set(['path','circle','rect','line','polyline','polygon','ellipse','use','stop','fedropshadow','fegaussianblur','femerge','femergenode','fecolormatrix','radialgradient','lineargradient','filter','symbol']);
  let cursor = 0;
  const len = htmlContent.length;
  const stack = [];
  const errors = [];
  let inScript = false;
  let inStyle = false;
  while (cursor < len) {
    if (htmlContent.startsWith('<!--', cursor)) {
      const end = htmlContent.indexOf('-->', cursor + 4);
      if (end === -1) { errors.push('Unclosed comment'); break; }
      cursor = end + 3;
      continue;
    }
    if (inScript) {
      const end = htmlContent.indexOf('</script>', cursor);
      if (end === -1) { errors.push('Unclosed script'); break; }
      cursor = end;
      inScript = false;
      continue;
    }
    if (inStyle) {
      const end = htmlContent.indexOf('</style>', cursor);
      if (end === -1) { errors.push('Unclosed style'); break; }
      cursor = end;
      inStyle = false;
      continue;
    }
    if (htmlContent[cursor] === '<') {
      let j = cursor + 1;
      let inQuote = null;
      while (j < len) {
        const c = htmlContent[j];
        if (inQuote) {
          if (c === inQuote) inQuote = null;
        } else {
          if (c === '"' || c === "'") inQuote = c;
          else if (c === '>') break;
        }
        j++;
      }
      if (j >= len) { errors.push('Malformed tag'); break; }
      const raw = htmlContent.substring(cursor, j + 1);
      const isClosing = raw.startsWith('</');
      const isSelf = raw.endsWith('/>');
      const tagName = raw.replace(/^<\/?\s*/, '').split(/[\s>/]/)[0].toLowerCase();
      if (tagName && tagName !== '!doctype') {
        if (tagName === 'script' && !isClosing && !isSelf) inScript = true;
        if (tagName === 'style' && !isClosing && !isSelf) inStyle = true;
        if (isClosing) {
          if (stack.length === 0) {
            errors.push('Orphan closing tag: </' + tagName + '>');
          } else {
            const top = stack[stack.length - 1];
            if (top === tagName) {
              stack.pop();
            } else {
              const matchIdx = stack.lastIndexOf(tagName);
              if (matchIdx !== -1) {
                const skipped = stack.splice(matchIdx);
                errors.push('Unclosed children when closing </' + tagName + '>: ' + skipped.slice(1).join(', '));
              } else {
                errors.push('Mismatched closing tag </' + tagName + '> (top is <' + top + '>)');
              }
            }
          }
        } else {
          const isVoid = voidElements.has(tagName);
          const isSvgAuto = svgSelf.has(tagName) && isSelf;
          if (!isVoid && !isSelf && !isSvgAuto) {
            stack.push(tagName);
          }
        }
      }
      cursor = j + 1;
    } else {
      cursor++;
    }
  }
  if (stack.length > 0) {
    errors.push('Unclosed tags at EOF: ' + stack.join(', '));
  }
  assert.strictEqual(errors.length, 0, 'DOM hierarchy errors: ' + JSON.stringify(errors));
});

// SECTION 2: CSS PRUNING & ACTIVE SELECTOR INTEGRITY
console.log('\n--- SECTION 2: CSS PRUNING & ACTIVE SLECTOR INTEGRITY ---');

const prunedSelectors = [
  'tonearm-assembly', 'tonearm-base', 'tonearm-rod', 'tonearm-head', 'tonearm-container',
  'vinyl-aura-ring', 'vinyl-disc', 'vinyl-grooves', 'vinyl-center', 'spinVinyl',
  'global-floating-back-btn', 'custom-playlist-box', 'manage-stations-link', 'studio-nav-btn', 'explorer-nav-btn',
  'spatial-soundstage-panel', 'spatial-header', 'spatial-title-wrap', 'spatial-icon',
  'spatial-name', 'spatial-desc', 'spatial-toggle-btn', 'spatial-slider-row',
  'eq-presets-grid', 'eq-preset-btn', 'eq-sliders-container', 'eq-band', 'eq-gain-val',
  'eq-v-slider-wrap', 'eq-slider', 'eq-freq-label', 'user-profile-btn', 'user-avatar-badge',
  'sidebar-toggle-pip', 'glyph-matrix-modal', 'nothing-phone-body', 'phone-circuit-grid',
  'glyph-strip', 'glyph-camera-housing', 'glyph-camera-ring', 'glyph-top-diag',
  'glyph-center-coil', 'glyph-dot-canvas-wrap', 'glyphDotCanvas', 'glyph-bottom-group',
  'phone-back-wordmark', 'glyph-lyrics-readout', 'glyph-footer-bar', 'glyph-mode-chips',
  'glyph-chip', 'glyph-device-tag', 'visualizer-studio-modal', 'visualizer-container',
  'visualizer-stage', 'visualizer-canvas-card', 'visualizer-track-overlay', 'viz-track-badge',
  'hero-surprise-btn', 'hero-dice-icon'
];

runTest('2.1: Pruned selectors completely purged from style.css', () => {
  const found = [];
  prunedSelectors.forEach(sel => {
    if (cssContent.includes('.' + sel) || cssContent.includes('#' + sel) || cssContent.includes('@keyframes ' + sel)) {
      found.push(sel);
    }
  });
  assert.strictEqual(found.length, 0, 'Dead selectors still in CSS: ' + found.join(', '));
});

runTest('2.2: Pruned selectors not referenced anywhere in active HTML or JS', () => {
  const activeUses = [];
  prunedSelectors.forEach(sel => {
    if (htmlContent.includes('"' + sel + '"') || htmlContent.includes(' ' + sel + ' ') ||
        jsContent.includes('"' + sel + '"') || jsContent.includes("'" + sel + "'")) {
      activeUses.push(sel);
    }
  });
  assert.strictEqual(activeUses.length, 0, 'Dead selectors still used in DOM/JS: ' + activeUses.join(', '));
});

runTest('2.3: Active UI classes, modals, and keyframes are intact in style.css', () => {
  const activeClasses = [
    '.dock-surprise-btn',
    '.dock-surprise-btn.surprise-active',
    '@keyframes diceRollSpin',
    '.time-toggleable',
    '.glass-modal-card',
    '.auth-modal-card',
    '.extras-modal-card',
    '.command-palette-card',
    '.bg-glyphs',
    '#weatherCanvas'
  ];
  activeClasses.forEach(req => {
    assert.ok(cssContent.includes(req), 'Missing active style: ' + req);
  });
});

// SECTION 3: ADVERSARIAL	STNUSS TESTING OF #dockSurpriseBtn
console.log('\n--- SECTION 3: ADVERSARIAL STRESS TESTING OF #dockSurpriseBtn ---');

function createHeadlessSandbox() {
  const elements = new Map();
  let vibrateCalled = false;
  let vibrateDuration = 0;

  class MockContext2D {
    constructor() { this.fillStyle = ''; this.strokeStyle = ''; this.lineWidth = 1; this.globalAlpha = 1; }
    clearRect() {}
    fillRect() {}
    beginPath() {}
    moveTo() {}
    lineTo() {}
    arc() {}
    fill() {}
    stroke() {}
    createLinearGradient() { return { addColorStop() {} }; }
    createRadialGradient() { return { addColorStop() {} }; }
  }

  class MockClassList {
    constructor() { this.classes = new Set(); }
    add(...cls) { cls.forEach(c => c && this.classes.add(c)); }
    remove(...cls) { cls.forEach(c => this.classes.delete(c)); }
    toggle(c) { if (this.classes.has(c)) { this.classes.delete(c); return false; } this.classes.add(c); return true; }
    contains(c) { return this.classes.has(c); }
  }

  class MockElement {
    constructor(id = '', tagName = 'div') {
      this.id = id;
      this.tagName = tagName.toUpperCase();
      this.classList = new MockClassList();
      this.style = {
        setProperty: function(k, v) { this[k] = v; },
        removeProperty: function(k) { delete this[k]; }
      };
      this.listeners = {};
      this.textContent = '';
      this.innerHTML = '';
      this.value = '';
      this.width = 300;
      this.height = 300;
      this.offsetWidth = 100;
      this.offsetHeight = 100;
      this.children = [];
    }
    addEventListener(evt, fn) {
      if (!this.listeners[evt]) this.listeners[evt] = [];
      this.listeners[evt].push(fn);
    }
    removeEventListener(evt, fn) {
      if (this.listeners[evt]) this.listeners[evt] = this.listeners[evt].filter(f => f !== fn);
    }
    dispatchEvent(evt) {
      const type = typeof evt === 'string' ? evt : evt.type;
      if (this.listeners[type]) { this.listeners[type].forEach(fn => fn(evt)); }
    }
    click() {
      this.dispatchEvent({ type: 'click', target: this, preventDefault() {}, stopPropagation() {} });
    }
    getContext() { return new MockContext2D(); }
    getBoundingClientRect() {
      return { left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100 };
    }
    appendChild(child) {
      if (child) {
        child.parentNode = this;
        this.children.push(child);
      }
      return child;
    }
    removeChild(child) {
      if (child) {
        child.parentNode = null;
        this.children = this.children.filter(c => c !== child);
      }
      return child;
    }
    setAttribute(name, val) { this[name] = String(val); }
    getAttribute(name) { return this[name] || null; }
    querySelector() { return null; }
    querySelectorAll() { return []; }
  }

  const idRegex = /\bid\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
  let match;
  while ((match = idRegex.exec(htmlContent)) !== null) {
    const id = match[1] || match[2];
    if (id && !elements.has(id)) {
      elements.set(id, new MockElement(id));
    }
  }

  const rootHtml = new MockElement('html', 'html');
  rootHtml.style.setProperty = function(k, v) { this[k] = v; };
  rootHtml.style.removeProperty = function(k) { delete this[k]; };

  const bodyEl = new MockElement('body', 'body');
  bodyEl.style.setProperty = function(k, v) { this[k] = v; };
  bodyEl.style.removeProperty = function(k) { delete this[k]; };

  const mockDocument = {
    getElementById: (id) => elements.get(id) || null,
    querySelector: (sel) => sel.startsWith('#') ? elements.get(sel.slice(1)) || null : new MockElement('', sel),
    querySelectorAll: (sel) => [],
    createElement: (tag) => {
      const el = new MockElement('', tag);
      el.style.setProperty = function(k, v) { this[k] = v; };
      el.style.removeProperty = function(k) { delete this[k]; };
      return el;
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    documentElement: rootHtml,
    body: bodyEl
  };

  const mockStorage = {
    _data: {},
    getItem(k) { return this._data[k] !== undefined ? this._data[k] : null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; }
  };

  const mockWindow = {
    document: mockDocument,
    addEventListener: () => {},
    removeEventListener: () => {},
    localStorage: mockStorage,
    sessionStorage: Object.assign({}, mockStorage, { _data: {} }),
    navigator: {},
    location: { href: 'http://localhost/', search: '' },
    caches: {
      keys: async () => ['aura-music-v122.0', 'aura-music-v123.0'],
      delete: async () => true
    },
    requestAnimationFrame: (cb) => setTimeout(cb, 16),
    cancelAnimationFrame: (id) => clearTimeout(id),
    setTimeout: global.setTimeout,
    clearTimeout: global.clearTimeout,
    setInterval: global.setInterval,
    clearInterval: global.clearInterval,
    AudioContext: class { createGain() { return { connect() {} }; } },
    YT: {
      Player: class {
        constructor() {}
        loadVideoById() {}
        playVideo() {}
        pauseVideo() {}
        setVolume() {}
        setPlaybackRate() {}
        getCurrentTime() { return 10; }
        getDuration() { return 180; }
        getPlayerState() { return 1; }
      },
      PlayerState: { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PMUSED: 2, BUFFERING: 3, CUED: 5 }
    },
    $: (id) => mockDocument.getElementById(id),
    getVibrateStatus: () => ({ called: vibrateCalled, duration: vibrateDuration })
  };

  mockWindow.navigator.vibrate = (dur) => { vibrateCalled = true; vibrateDuration = dur; return true; };
  mockWindow.navigator.userAgent = 'Mozilla/5.0 NodeHeadlessTest';
  mockWindow.navigator.onLine = true;

  return { mockWindow: mockWindow, elements: elements };
}

runTest('3.1: Full Station Pool triggers mood station playback and .surprise-active', () => {
  const s = createHeadlessSandbox();
  const sandbox = Object.assign({}, global, s.mockWindow, {
    window: s.mockWindow,
    document: s.mockWindow.document,
    localStorage: s.mockWindow.localStorage,
    sessionStorage: s.mockWindow.sessionStorage,
    navigator: s.mockWindow.navigator,
    location: s.mockWindow.location,
    caches: s.mockWindow.caches,
    YT: s.mockWindow.YT,
    $: (id) => s.mockWindow.document.getElementById(id)
  });
  vm.runInNewContext(jsContent, sandbox, { timeout: 3000 });
  const btn = s.elements.get('dockSurpriseBtn');
  assert.ok(btn, '#dockSurpriseBtn must exist');
  let played = null;
  if (sandbox.MoodUniverseEngine) {
    sandbox.MoodUniverseEngine.playMoodStation = (mood) => { played = mood; };
  }
  btn.click();
  assert.ok(btn.classList.contains('surprise-active'), 'Must add .surprise-active class on click');
  assert.ok(played !== null || (sandbox.currentTrackQueue && sandbox.currentTrackQueue.length > 0), 'Must trigger mood or queue playback');
});

runTest('3.2: Single Station Pool selects solo station without boundary errors', () => {
  const s = createHeadlessSandbox();
  const sandbox = Object.assign({}, global, s.mockWindow, {
    window: s.mockWindow,
    document: s.mockWindow.document,
    localStorage: s.mockWindow.localStorage,
    sessionStorage: s.mockWindow.sessionStorage,
    navigator: s.mockWindow.navigator,
    location: s.mockWindow.location,
    caches: s.mockWindow.caches,
    YT: s.mockWindow.YT,
    $: (id) => s.mockWindow.document.getElementById(id)
  });
  vm.runInNewContext(jsContent, sandbox, { timeout: 3000 });
  let selected = null;
  if (sandbox.MoodUniverseEngine) {
    sandbox.MoodUniverseEngine.stations = [{ id: 'solo-station', name: 'Solo Vibe' }];
    sandbox.MoodUniverseEngine.playMoodStation = (m) => { selected = m; };
  }
  sandbox.MOOD_STATIONS = [{ id: 'solo-station', name: 'Solo Vibe' }];
  const btn = s.elements.get('dockSurpriseBtn');
  btn.click();
  assert.ok(btn.classList.contains('surprise-active'));
  assert.ok(selected && (selected.id === 'solo-station' || selected === 'solo-station'));
});

runTest('3.3: Empty Station Pool handles empty state gracefully without crash', () => {
  const s = createHeadlessSandbox();
  const sandbox = Object.assign({}, global, s.mockWindow, {
    window: s.mockWindow,
    document: s.mockWindow.document,
    localStorage: s.mockWindow.localStorage,
    sessionStorage: s.mockWindow.sessionStorage,
    navigator: s.mockWindow.navigator,
    location: s.mockWindow.location,
    caches: s.mockWindow.caches,
    YT: s.mockWindow.YT,
    $: (id) => s.mockWindow.document.getElementById(id)
  });
  vm.runInNewContext(jsContent, sandbox, { timeout: 3000 });
  if (sandbox.MoodUniverseEngine) {
    sandbox.MoodUniverseEngine.stations = [];
    sandbox.MoodUniverseEngine.playMoodStation = () => {};
  }
  sandbox.MOOD_STATIONS = [];
  sandbox.currentTrackQueue = [];
  const btn = s.elements.get('dockSurpriseBtn');
  assert.doesNotThrow(() => { btn.click(); }, 'Empty pool click must not throw');
  assert.ok(btn.classList.contains('surprise-active'));
});

runTest('3.4: Null / Undefined Station Pool handles defensively without crash', () => {
  const s = createHeadlessSandbox();
  const sandbox = Object.assign({}, global, s.mockWindow, {
    window: s.mockWindow,
    document: s.mockWindow.document,
    localStorage: s.mockWindow.localStorage,
    sessionStorage: s.mockWindow.sessionStorage,
    navigator: s.mockWindow.navigator,
    location: s.mockWindow.location,
    caches: s.mockWindow.caches,
    YT: s.mockWindow.YT,
    $: (id) => s.mockWindow.document.getElementById(id)
  });
  vm.runInNewContext(jsContent, sandbox, { timeout: 3000 });
  sandbox.MoodUniverseEngine = null;
  sandbox.MOOD_STATIONS = null;
  sandbox.currentTrackQueue = null;
  const btn = s.elements.get('dockSurpriseBtn');
  assert.doesNotThrow(() => { btn.click(); }, 'Null station structures must not throw');
});

runTest('3.5: 100 Rapid Consecutive Clicks on #dockSurpriseBtn execute without errors', () => {
  const s = createHeadlessSandbox();
  const sandbox = Object.assign({}, global, s.mockWindow, {
    window: s.mockWindow,
    document: s.mockWindow.document,
    localStorage: s.mockWindow.localStorage,
    sessionStorage: s.mockWindow.sessionStorage,
    navigator: s.mockWindow.navigator,
    location: s.mockWindow.location,
    caches: s.mockWindow.caches,
    YT: s.mockWindow.YT,
    $: (id) => s.mockWindow.document.getElementById(id)
  });
  vm.runInNewContext(jsContent, sandbox, { timeout: 3000 });
  if (sandbox.MoodUniverseEngine) {
    sandbox.MoodUniverseEngine.playMoodStation = () => {};
  }
  const btn = s.elements.get('dockSurpriseBtn');
  assert.doesNotThrow(() => {
    for (let i = 0; i < 100; i++) { btn.click(); }
  }, '100 clicks must execute without error');
  assert.ok(btn.classList.contains('surprise-active'));
});

// SECTION 4: CACHE VERSION SYNCHRONIZATION
console.log('\n--- SECTION 4: CACHE VERSION SYNCHRONIZATION ---');

runTest('4.1: All 4 cache version locations synchronized to v123.0', () => {
  const swVer = (swContent.match(/CACHE_NAME\s*=\s*['"]aura-music-v([^'"]+)['"]/) || [])[1];
  const styleVer = (htmlContent.match(/href="style\.css\?v=([^"]+)"/) || [])[1];
  const scriptVer = (htmlContent.match(/src="script\.js\?v=([^"]+)"/) || [])[1];
  const jsVer = (jsContent.match(/name\s*!==\s*['"]aura-music-v([^'"]+)['"]/) || [])[1];
  assert.strictEqual(swVer, '123.0', 'sw.js version');
  assert.strictEqual(styleVer, '123.0', 'index.html style.css?v=');
  assert.strictEqual(scriptVer, '123.0', 'index.html script.js?v=');
  assert.strictEqual(jsVer, '123.0', 'script.js cache eviction');
  assert.strictEqual(swVer, jsVer, 'Service worker and script.js cache version match');
});

console.log('\n=======================================================================');
console.log(' AUDIT SUMMARY: ' + passedTests + ' PASSED / ' + failures.length + ' FAILED (' + totalTests + ' Total Tests)');
console.log('=======================================================================\n');

if (failures.length > 0) {
  console.error('CHALLENGER VERDICT: REQUEST_CHANGES');
  console.error('  Details: ' + JSON.stringify(failures, null, 2));
  process.exit(1);
} else {
  console.log('CHALLENGER VERDICT: APPROVE (Matches all M1 Static Integrity Requirements)');
  process.exit(0);
}
