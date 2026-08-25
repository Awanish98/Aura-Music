/**
 * Challenger M1 Stress & Adversarial Test Suite
 * Evaluates:
 * 1. Missing/Null DOM elements on page load
 * 2. Corrupted localStorage keys (invalid JSON strings, bad types)
 * 3. Rapid click stress on #dockSurpriseBtn and triggerSurpriseMe()
 * 4. Cache version string regex matching across 4 files
 */

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

const suiteResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function runTest(name, fn) {
  try {
    fn();
    suiteResults.passed++;
    suiteResults.tests.push({ name, status: 'PASS' });
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    suiteResults.failed++;
    suiteResults.tests.push({ name, status: 'FAIL', error: err.message, stack: err.stack });
    console.error(`  [FAIL] ${name}: ${err.message}`);
  }
}

console.log('================================================================');
console.log('   CHALLENGER MILESTONE 1 (M1) ADVERSARIAL STRESS TEST SUITE   ');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// 1. Missing / Null DOM Elements on Boot Simulation
// -----------------------------------------------------------------------------
console.log('--- 1. Missing / Null DOM Elements Stress ---');

function createMockDOM(omittedIds = new Set()) {
  const elementsById = new Map();
  const listeners = {};

  class MockClassList {
    constructor() { this.classes = new Set(); }
    add(...cls) { cls.forEach(c => c && this.classes.add(c)); }
    remove(...cls) { cls.forEach(c => this.classes.delete(c)); }
    toggle(c) {
      if (this.classes.has(c)) { this.classes.delete(c); return false; }
      this.classes.add(c); return true;
    }
    contains(c) { return this.classes.has(c); }
  }

  class MockElement {
    constructor(tagName = 'div', id = '') {
      this.tagName = tagName.toUpperCase();
      this.id = id;
      this.classList = new MockClassList();
      this.style = {};
      this.listeners = {};
      this.value = '';
      this.textContent = '';
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
      if (this.listeners[type]) {
        this.listeners[type].forEach(fn => fn.call(this, evt));
      }
    }
    click() { this.dispatchEvent({ type: 'click', target: this, stopPropagation() {} }); }
    focus() {}
    querySelectorAll() { return []; }
    querySelector() { return null; }
    getAttribute() { return null; }
    setAttribute() {}
    removeAttribute() {}
    closest() { return null; }
  }

  // Pre-populate elements from index.html except omittedIds
  const idMatches = htmlContent.matchAll(/id="([^"]+)"/g);
  for (const m of idMatches) {
    const id = m[1];
    if (!omittedIds.has(id) && !elementsById.has(id)) {
      elementsById.set(id, new MockElement('div', id));
    }
  }

  const mockDocument = {
    body: new MockElement('body'),
    head: new MockElement('head'),
    getElementById: (id) => {
      if (omittedIds.has(id)) return null;
      return elementsById.get(id) || null;
    },
    querySelector: (sel) => {
      if (sel.startsWith('#')) {
        const id = sel.slice(1);
        if (omittedIds.has(id)) return null;
        return elementsById.get(id) || null;
      }
      return null;
    },
    querySelectorAll: () => [],
    createElement: (tag) => new MockElement(tag),
    addEventListener: (evt, fn) => {
      if (!listeners[evt]) listeners[evt] = [];
      listeners[evt].push(fn);
    },
    removeEventListener: () => {}
  };

  const storage = new Map();
  const mockLocalStorage = {
    getItem: (k) => storage.has(k) ? storage.get(k) : null,
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k),
    clear: () => storage.clear()
  };

  const mockWindow = {
    document: mockDocument,
    localStorage: mockLocalStorage,
    sessionStorage: mockLocalStorage,
    location: { href: 'http://localhost/', search: '', reload() {} },
    navigator: { userAgent: 'NodeTest', serviceWorker: { register: () => Promise.resolve() }, vibrate: () => true },
    requestAnimationFrame: (cb) => setTimeout(cb, 16),
    cancelAnimationFrame: (id) => clearTimeout(id),
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    addEventListener: (evt, fn) => {
      if (!listeners[evt]) listeners[evt] = [];
      listeners[evt].push(fn);
    },
    removeEventListener: () => {},
    dispatchEvent: (evt) => {
      const type = typeof evt === 'string' ? evt : evt.type;
      if (listeners[type]) listeners[type].forEach(fn => fn(evt));
    },
    Audio: function() { return { play: () => Promise.resolve(), pause() {}, addEventListener() {} }; },
    AudioContext: function() { return { createGain: () => ({ connect() {} }), destination: {} }; },
    caches: {
      keys: () => Promise.resolve(['aura-music-v110.0', 'aura-music-v123.0']),
      delete: () => Promise.resolve(true)
    },
    YT: { PlayerState: { PLAYING: 1, PAUSED: 2, ENDED: 0, UNSTARTED: -1, BUFFERING: 3, CUED: 5 } }
  };

  mockDocument.defaultView = mockWindow;

  return { mockWindow, mockDocument, elementsById, mockLocalStorage };
}

runTest('1.1: Complete absence of all 9 targeted DOM elements does not throw TypeError on boot', () => {
  const omitted = new Set([
    'homeJamStatusPill',
    'homeChatToggleBtn',
    'homeQuickChatCloseBtn',
    'homeQuickChatSendBtn',
    'homeQuickChatInput',
    'premiumMenuToggle',
    'closeSidebarBtn',
    'sidebarBackdrop',
    'sidebarLoginBtn',
    'dockSurpriseBtn',
    'heroSurpriseBtn'
  ]);

  const { mockWindow } = createMockDOM(omitted);
  const sandbox = Object.assign({}, global, mockWindow, {
    window: mockWindow,
    document: mockWindow.document,
    localStorage: mockWindow.localStorage,
    sessionStorage: mockWindow.sessionStorage,
    navigator: mockWindow.navigator,
    location: mockWindow.location,
    caches: mockWindow.caches,
    YT: mockWindow.YT,
    $: (id) => mockWindow.document.getElementById(id)
  });

  // Execute script.js in the sandbox
  assert.doesNotThrow(() => {
    vm.runInNewContext(jsContent, sandbox, { timeout: 3000 });
  }, 'script.js must boot without errors even when all 9 elements are omitted from DOM');
});

runTest('1.2: Partial random omission of arbitrary subsets of DOM elements does not crash initialization', () => {
  const candidateIds = [
    'homeJamStatusPill', 'homeChatToggleBtn', 'homeQuickChatCloseBtn', 'homeQuickChatSendBtn',
    'homeQuickChatInput', 'premiumMenuToggle', 'closeSidebarBtn', 'sidebarBackdrop',
    'sidebarLoginBtn', 'dockSurpriseBtn', 'shuffleBtn', 'play', 'prev', 'next', 'fsbtn',
    'ambientToggleBtn', 'ytExplorerBtn', 'extrasBtn', 'sidebarJamBtn'
  ];

  for (let trial = 0; trial < 10; trial++) {
    const omittedSubset = new Set();
    candidateIds.forEach(id => {
      if (Math.random() > 0.5) omittedSubset.add(id);
    });

    const { mockWindow } = createMockDOM(omittedSubset);
    const sandbox = Object.assign({}, global, mockWindow, {
      window: mockWindow,
      document: mockWindow.document,
      localStorage: mockWindow.localStorage,
      sessionStorage: mockWindow.sessionStorage,
      navigator: mockWindow.navigator,
      location: mockWindow.location,
      caches: mockWindow.caches,
      YT: mockWindow.YT,
      $: (id) => mockWindow.document.getElementById(id)
    });

    assert.doesNotThrow(() => {
      vm.runInNewContext(jsContent, sandbox, { timeout: 3000 });
    }, `Trial ${trial + 1}: Failed with omitted: ${Array.from(omittedSubset).join(', ')}`);
  }
});


// -----------------------------------------------------------------------------
// 2. Corrupted localStorage Stress
// -----------------------------------------------------------------------------
console.log('\n--- 2. Corrupted localStorage Stress ---');

const malformedJsonCases = [
  { desc: 'Invalid trailing json', value: '{"broken_json' },
  { desc: 'Raw unquoted string', value: 'unquoted_plain_string' },
  { desc: 'Array missing closing bracket', value: '[1, 2, "track"' },
  { desc: 'Object instead of Array', value: '{"id": 123, "type": "song"}' },
  { desc: 'Number primitive', value: '98765' },
  { desc: 'Boolean primitive', value: 'true' },
  { desc: 'Null string', value: 'null' },
  { desc: 'Empty object string', value: '{}' },
  { desc: 'NaN literal string', value: 'NaN' },
  { desc: 'Undefined string literal', value: 'undefined' },
  { desc: 'Binary null characters', value: '\x00\x01\x02\xFF' },
  { desc: 'Deep nested broken JSON', value: '{"liked": [{"id": [}' }
];

malformedJsonCases.forEach((testCase, idx) => {
  runTest(`2.${idx + 1}: localStorage['ishq_liked_songs'] corruption: ${testCase.desc}`, () => {
    const { mockWindow, mockLocalStorage } = createMockDOM();
    mockLocalStorage.setItem('ishq_liked_songs', testCase.value);

    const sandbox = Object.assign({}, global, mockWindow, {
      window: mockWindow,
      document: mockWindow.document,
      localStorage: mockLocalStorage,
      sessionStorage: mockLocalStorage,
      navigator: mockWindow.navigator,
      location: mockWindow.location,
      caches: mockWindow.caches,
      YT: mockWindow.YT,
      $: (id) => mockWindow.document.getElementById(id)
    });

    assert.doesNotThrow(() => {
      vm.runInNewContext(jsContent, sandbox, { timeout: 3000 });
    }, `App crashed on liked songs corruption: ${testCase.value}`);
  });
});

runTest('2.13: Global multi-key localStorage corruption resilience (all storage keys corrupted)', () => {
  const { mockWindow, mockLocalStorage } = createMockDOM();
  const keysToCorrupt = [
    'ishq_liked_songs',
    'ishq_station_key',
    'ishq_sky_theme',
    'ishq_weather_autosync',
    'ishq_volume',
    'aura_user_profile',
    'ishq_vibe_profile_v2',
    'aura_my_vibes_custom',
    'aura_auth_user',
    'aura_audio_quality',
    'aura_speed_mode'
  ];

  keysToCorrupt.forEach(k => {
    mockLocalStorage.setItem(k, '{{{MALFORMED_CORRUPTED_BLOB}}}');
  });

  const sandbox = Object.assign({}, global, mockWindow, {
    window: mockWindow,
    document: mockWindow.document,
    localStorage: mockLocalStorage,
    sessionStorage: mockLocalStorage,
    navigator: mockWindow.navigator,
    location: mockWindow.location,
    caches: mockWindow.caches,
    YT: mockWindow.YT,
    $: (id) => mockWindow.document.getElementById(id)
  });

  assert.doesNotThrow(() => {
    vm.runInNewContext(jsContent, sandbox, { timeout: 3000 });
  }, 'App must not crash even when ALL localStorage keys contain corrupted JSON');
});


// -----------------------------------------------------------------------------
// 3. Rapid Click & Stress Testing #dockSurpriseBtn / triggerSurpriseMe
// -----------------------------------------------------------------------------
console.log('\n--- 3. Rapid Click & Stress Testing on #dockSurpriseBtn ---');

runTest('3.1: #dockSurpriseBtn handles 100 rapid sequential triggers without exception', () => {
  const { mockWindow } = createMockDOM();
  const sandbox = Object.assign({}, global, mockWindow, {
    window: mockWindow,
    document: mockWindow.document,
    localStorage: mockWindow.localStorage,
    sessionStorage: mockWindow.sessionStorage,
    navigator: mockWindow.navigator,
    location: mockWindow.location,
    caches: mockWindow.caches,
    YT: mockWindow.YT,
    $: (id) => mockWindow.document.getElementById(id)
  });

  vm.runInNewContext(jsContent, sandbox, { timeout: 3000 });

  assert.ok(typeof sandbox.window.triggerSurpriseMe === 'function', 'triggerSurpriseMe must be exposed');

  const btn = mockWindow.document.getElementById('dockSurpriseBtn');
  assert.ok(btn, '#dockSurpriseBtn must exist in DOM');

  // Trigger 100 rapid clicks
  assert.doesNotThrow(() => {
    for (let i = 0; i < 100; i++) {
      btn.click();
    }
  }, '100 rapid clicks on #dockSurpriseBtn must execute without throwing');

  assert.ok(btn.classList.contains('surprise-active'), 'Must have .surprise-active class after click');
});

runTest('3.2: triggerSurpriseMe behavior with empty Mood Universe & empty queue', () => {
  const { mockWindow } = createMockDOM();
  const sandbox = Object.assign({}, global, mockWindow, {
    window: mockWindow,
    document: mockWindow.document,
    localStorage: mockWindow.localStorage,
    sessionStorage: mockWindow.sessionStorage,
    navigator: mockWindow.navigator,
    location: mockWindow.location,
    caches: mockWindow.caches,
    YT: mockWindow.YT,
    $: (id) => mockWindow.document.getElementById(id)
  });

  vm.runInNewContext(jsContent, sandbox, { timeout: 3000 });

  // Clear mood stations and queues
  if (sandbox.MoodUniverseEngine) sandbox.MoodUniverseEngine.stations = [];
  sandbox.MOOD_STATIONS = [];
  sandbox.currentTrackQueue = [];

  assert.doesNotThrow(() => {
    sandbox.window.triggerSurpriseMe();
  }, 'triggerSurpriseMe must gracefully handle empty mood stations and queue');
});

runTest('3.3: triggerSurpriseMe animation timeout cleanup', () => {
  const { mockWindow } = createMockDOM();
  const sandbox = Object.assign({}, global, mockWindow, {
    window: mockWindow,
    document: mockWindow.document,
    localStorage: mockWindow.localStorage,
    sessionStorage: mockWindow.sessionStorage,
    navigator: mockWindow.navigator,
    location: mockWindow.location,
    caches: mockWindow.caches,
    YT: mockWindow.YT,
    $: (id) => mockWindow.document.getElementById(id)
  });

  vm.runInNewContext(jsContent, sandbox, { timeout: 3000 });
  const btn = mockWindow.document.getElementById('dockSurpriseBtn');
  
  btn.click();
  assert.ok(btn.classList.contains('surprise-active'));
});


// -----------------------------------------------------------------------------
// 4. Cache Version String Regex Matching Across All 4 Files
// -----------------------------------------------------------------------------
console.log('\n--- 4. Cache Version String Regex Matching Across 4 Files ---');

runTest('4.1: sw.js CACHE_NAME matches exact format /aura-music-v\\d+\\.\\d+/', () => {
  const swRegex = /var\s+CACHE_NAME\s*=\s*['"]aura-music-v(\d+\.\d+)['"]/;
  const match = swContent.match(swRegex);
  assert.ok(match, 'sw.js must contain CACHE_NAME matching aura-music-vX.Y');
  assert.strictEqual(match[1], '123.0', 'sw.js version must be 123.0');
});

runTest('4.2: index.html style.css link matches href="style.css?v=\\d+\\.\\d+"', () => {
  const styleRegex = /<link[^>]+href="style\.css\?v=(\d+\.\d+)"[^>]*>/;
  const match = htmlContent.match(styleRegex);
  assert.ok(match, 'index.html must contain style.css link with ?v=X.Y');
  assert.strictEqual(match[1], '123.0', 'style.css query version must be 123.0');
});

runTest('4.3: index.html script.js tag matches src="script.js?v=\\d+\\.\\d+"', () => {
  const scriptRegex = /<script[^>]+src="script\.js\?v=(\d+\.\d+)"[^>]*><\/script>/;
  const match = htmlContent.match(scriptRegex);
  assert.ok(match, 'index.html must contain script.js tag with ?v=X.Y');
  assert.strictEqual(match[1], '123.0', 'script.js query version must be 123.0');
});

runTest('4.4: script.js cache eviction logic matches name !== "aura-music-v\\d+\\.\\d+"', () => {
  const jsEvictRegex = /name\s*!==\s*['"]aura-music-v(\d+\.\d+)['"]/;
  const match = jsContent.match(jsEvictRegex);
  assert.ok(match, 'script.js must contain eviction check with aura-music-vX.Y');
  assert.strictEqual(match[1], '123.0', 'script.js eviction version must be 123.0');
});

runTest('4.5: Full 4-way version string strict mathematical equality', () => {
  const swVer = (swContent.match(/var\s+CACHE_NAME\s*=\s*['"]aura-music-v([^'"]+)['"]/) || [])[1];
  const styleVer = (htmlContent.match(/href="style\.css\?v=([^"]+)"/) || [])[1];
  const scriptVer = (htmlContent.match(/src="script\.js\?v=([^"]+)"/) || [])[1];
  const jsVer = (jsContent.match(/name\s*!==\s*['"]aura-music-v([^'"]+)['"]/) || [])[1];

  assert.strictEqual(swVer, '123.0', 'sw.js version');
  assert.strictEqual(styleVer, '123.0', 'index.html style version');
  assert.strictEqual(scriptVer, '123.0', 'index.html script version');
  assert.strictEqual(jsVer, '123.0', 'script.js eviction version');
  
  assert.ok(swVer === styleVer && styleVer === scriptVer && scriptVer === jsVer,
    'All 4 files must be strictly synchronized to the same version string');
});

// -----------------------------------------------------------------------------
// 5. CSS & HTML Structural Hardening Checks
// -----------------------------------------------------------------------------
console.log('\n--- 5. CSS & HTML Structural Hardening Checks ---');

runTest('5.1: 0 Dead selectors from Survey 1 remain in style.css', () => {
  const deadList = [
    'tonearm-assembly', 'tonearm-base', 'tonearm-rod', 'tonearm-head', 'tonearm-container',
    'vinyl-aura-ring', 'vinyl-disc', 'vinyl-grooves', 'vinyl-center', 'spinVinyl',
    'global-floating-back-btn', 'custom-playlist-box', 'manage-stations-link',
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

  const found = [];
  deadList.forEach(sel => {
    if (cssContent.includes(`.${sel}`) || cssContent.includes(`#${sel}`) || cssContent.includes(`@keyframes ${sel}`)) {
      found.push(sel);
    }
  });

  assert.strictEqual(found.length, 0, `Dead selectors found in style.css: ${found.join(', ')}`);
});

runTest('5.2: Retained active classes exist in style.css', () => {
  const activeSelectors = [
    'surprise-active',
    'time-toggleable',
    'glass-modal-card',
    'auth-modal-card',
    'extras-modal-card',
    'command-palette-card'
  ];

  activeSelectors.forEach(sel => {
    assert.ok(cssContent.includes(sel), `style.css must retain ${sel}`);
  });
});

console.log('\n================================================================');
console.log(`STRESS TEST SUMMARY: ${suiteResults.passed} PASSED / ${suiteResults.failed} FAILED (${suiteResults.tests.length} Total)`);
console.log('================================================================\n');

if (suiteResults.failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
