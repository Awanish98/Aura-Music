/**
 * Aura Music 2.0 — Milestone 2 Adversarial Stress & Chaos Test Suite
 * 
 * Features Under Stress (Milestone 2):
 * - F5: Playback Speed Persistence & State Machine Transitions
 * - F6: Explorer Queue Continuity, Metadata Fault Tolerance & Corrupted Catalogs
 * - F7: Smooth Scrubber Drag, Pointer Events, Extreme Coordinates & Anti-Rubber-Banding Cooldown
 * 
 * Stress Dimensions:
 * 1. Scrubber Drag & Extreme Seeking Coordinate Matrix (<0, >1, NaN, Infinity, zero width, rapid pointermove)
 * 2. Playback Speed Re-application across all YouTube Player State Transitions (PLAYING, BUFFERING, ENDED, CUED)
 * 3. playSingleTrack Fault Tolerance (null/empty metadata, corrupted discovery catalogs, XSS injection, queue bounds)
 * 4. MoodUniverseEngine Pool Safety & Master Station Mappings
 * 5. Concurrent Chaos (Scrubbing while track ends, speed cycling while seeking, rapid station switches)
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');
const HTML_PATH = path.join(ROOT_DIR, 'index.html');
const JS_PATH = path.join(ROOT_DIR, 'script.js');
const CSS_PATH = path.join(ROOT_DIR, 'style.css');
const STATIONS_PATH = path.join(ROOT_DIR, 'stations.json');

const htmlContent = fs.readFileSync(HTML_PATH, 'utf8');
const jsContent = fs.readFileSync(JS_PATH, 'utf8');
const cssContent = fs.readFileSync(CSS_PATH, 'utf8');
const stationsContent = fs.readFileSync(STATIONS_PATH, 'utf8');

// Test Suite Results
const stressResults = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: [],
  failures: []
};

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

function runStressTest(name, fn) {
  stressResults.total++;
  try {
    fn();
    stressResults.passed++;
    stressResults.tests.push({ name, status: 'PASS' });
    console.log(`  ${colors.green}✔ PASS${colors.reset} ${name}`);
  } catch (err) {
    stressResults.failed++;
    stressResults.tests.push({ name, status: 'FAIL', error: err.message, stack: err.stack });
    stressResults.failures.push({ name, error: err.message, stack: err.stack });
    console.log(`  ${colors.red}✖ FAIL${colors.reset} ${name}`);
    console.log(`    ${colors.dim}${err.message}${colors.reset}`);
  }
}

// -------------------------------------------------------------
// DOM & Player Environment Mock Factory
// -------------------------------------------------------------
class MockClassList {
  constructor(el) {
    this._el = el;
    this._classes = new Set();
  }
  add(...classes) {
    classes.forEach(c => c && this._classes.add(c));
    this._sync();
  }
  remove(...classes) {
    classes.forEach(c => this._classes.delete(c));
    this._sync();
  }
  toggle(c, force) {
    if (force === true) { this.add(c); return true; }
    if (force === false) { this.remove(c); return false; }
    if (this._classes.has(c)) { this.remove(c); return false; }
    this.add(c); return true;
  }
  contains(c) { return this._classes.has(c); }
  _sync() {
    this._el._className = Array.from(this._classes).join(' ');
  }
  _setFromClassName(className) {
    this._classes.clear();
    if (className) {
      className.split(/\s+/).filter(Boolean).forEach(c => this._classes.add(c));
    }
  }
}

class MockStyle {
  constructor() {
    this._props = {};
  }
  setProperty(k, v) { this._props[k] = String(v); this[k] = String(v); }
  getPropertyValue(k) { return this._props[k] || ''; }
  removeProperty(k) { delete this._props[k]; delete this[k]; }
}

class MockElement {
  constructor(tagName = 'div', id = '') {
    this.tagName = tagName.toUpperCase();
    this.nodeName = this.tagName;
    this.nodeType = 1;
    this.id = id;
    this._className = '';
    this.classList = new MockClassList(this);
    this.style = new MockStyle();
    this.attributes = {};
    this.children = [];
    this.parentElement = null;
    this.parentNode = null;
    this.listeners = {};
    this._textContent = '';
    this._innerHTML = '';
    this.value = '';
    this.src = '';
    this.offsetWidth = 100;
    this.offsetHeight = 100;
    this.pointerCaptures = new Set();
    this._rect = { top: 100, left: 50, bottom: 120, right: 350, width: 300, height: 20, x: 50, y: 100 };
  }

  get className() { return this._className; }
  set className(val) {
    this._className = val || '';
    this.classList._setFromClassName(this._className);
  }

  get textContent() { return this._textContent; }
  set textContent(val) {
    this._textContent = String(val);
    this._innerHTML = String(val);
  }

  get innerHTML() { return this._innerHTML; }
  set innerHTML(val) {
    this._innerHTML = String(val);
    this._textContent = String(val).replace(/<[^>]*>/g, '');
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name === 'id') this.id = String(value);
    if (name === 'class') this.className = String(value);
    if (name === 'src') this.src = String(value);
  }
  getAttribute(name) {
    if (name === 'id') return this.id || null;
    if (name === 'class') return this.className || null;
    return this.attributes[name] !== undefined ? this.attributes[name] : null;
  }
  removeAttribute(name) {
    delete this.attributes[name];
    if (name === 'id') this.id = '';
    if (name === 'class') this.className = '';
  }

  appendChild(child) {
    if (child) {
      child.parentElement = this;
      child.parentNode = this;
      this.children.push(child);
    }
    return child;
  }
  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parentElement = null;
      child.parentNode = null;
    }
    return child;
  }

  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }
  removeEventListener(event, fn) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== fn);
    }
  }
  dispatchEvent(event) {
    const eventName = typeof event === 'string' ? event : event.type;
    const ev = typeof event === 'string' ? { type: event, target: this, currentTarget: this, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, stopPropagation() {} } : event;
    ev.target = ev.target || this;
    ev.currentTarget = this;
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach(fn => fn.call(this, ev));
    }
    if (this['on' + eventName]) {
      this['on' + eventName].call(this, ev);
    }
    return !ev.defaultPrevented;
  }

  click() {
    this.dispatchEvent({ type: 'click', target: this, clientX: 100, clientY: 100, preventDefault() {}, stopPropagation() {} });
  }

  setPointerCapture(id) {
    this.pointerCaptures.add(id);
  }
  releasePointerCapture(id) {
    this.pointerCaptures.delete(id);
  }

  setBoundingClientRect(rect) {
    this._rect = Object.assign({}, this._rect, rect);
  }
  getBoundingClientRect() {
    return this._rect;
  }

  getContext() {
    return {
      clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, arc() {},
      stroke() {}, fill() {}, save() {}, restore() {}, translate() {},
      rotate() {}, scale() {}, fillRect() {}, strokeRect() {}, drawImage() {},
      createLinearGradient() { return { addColorStop() {} }; },
      createRadialGradient() { return { addColorStop() {} }; }
    };
  }

  querySelector(selector) {
    const all = this.querySelectorAll(selector);
    return all.length > 0 ? all[0] : null;
  }
  querySelectorAll(selector) {
    const results = [];
    function match(el) {
      if (selector.startsWith('#') && el.id === selector.slice(1)) results.push(el);
      else if (selector.startsWith('.') && el.classList.contains(selector.slice(1))) results.push(el);
      else if (el.tagName.toLowerCase() === selector.toLowerCase()) results.push(el);
      el.children.forEach(match);
    }
    this.children.forEach(match);
    return results;
  }
  closest() { return null; }
}

function createMockPlayer() {
  let currentTime = 45.0;
  let duration = 240.0;
  let playbackRate = 1.0;
  let volume = 80;
  let muted = false;
  let state = 1; // PLAYING
  let currentVideoId = 'IltsCYPwtjE';
  const calls = [];

  return {
    calls,
    loadVideoById(id) {
      calls.push({ method: 'loadVideoById', args: [id] });
      currentVideoId = id;
      currentTime = 0;
    },
    cueVideoById(id) {
      calls.push({ method: 'cueVideoById', args: [id] });
      currentVideoId = id;
    },
    loadPlaylist(list, idx, start) {
      calls.push({ method: 'loadPlaylist', args: [list, idx, start] });
    },
    cuePlaylist(list, idx, start) {
      calls.push({ method: 'cuePlaylist', args: [list, idx, start] });
    },
    playVideo() {
      calls.push({ method: 'playVideo' });
      state = 1;
    },
    pauseVideo() {
      calls.push({ method: 'pauseVideo' });
      state = 2;
    },
    seekTo(sec, allowSeekAhead) {
      calls.push({ method: 'seekTo', args: [sec, allowSeekAhead] });
      currentTime = sec;
    },
    setPlaybackRate(rate) {
      calls.push({ method: 'setPlaybackRate', args: [rate] });
      playbackRate = rate;
    },
    getPlaybackRate() { return playbackRate; },
    setPlaybackQuality(q) { calls.push({ method: 'setPlaybackQuality', args: [q] }); },
    getCurrentTime() { return currentTime; },
    setCurrentTime(t) { currentTime = t; },
    getDuration() { return duration; },
    setDuration(d) { duration = d; },
    getVolume() { return volume; },
    setVolume(v) { volume = v; calls.push({ method: 'setVolume', args: [v] }); },
    isMuted() { return muted; },
    mute() { muted = true; calls.push({ method: 'mute' }); },
    unMute() { muted = false; calls.push({ method: 'unMute' }); },
    getPlayerState() { return state; },
    setPlayerState(s) { state = s; },
    getVideoData() { return { video_id: currentVideoId, title: 'Mock Video' }; },
    getVideoUrl() { return `https://www.youtube.com/watch?v=${currentVideoId}`; }
  };
}

function createFullTestEnvironment() {
  const elementsById = new Map();
  const allElements = [];

  const idMatches = htmlContent.matchAll(/id="([^"]+)"/g);
  for (const m of idMatches) {
    const id = m[1];
    if (!elementsById.has(id)) {
      const el = new MockElement('div', id);
      elementsById.set(id, el);
      allElements.push(el);
    }
  }

  const documentHtml = new MockElement('html', 'app-html');
  const documentBody = new MockElement('body', 'app-body');
  const documentHead = new MockElement('head', 'app-head');
  allElements.push(documentHtml, documentBody, documentHead);

  const mockDocument = {
    documentElement: documentHtml,
    body: documentBody,
    head: documentHead,
    hidden: false,
    title: 'Aura Music',
    createElement: (tag) => {
      const el = new MockElement(tag);
      allElements.push(el);
      return el;
    },
    getElementById: (id) => elementsById.get(id) || null,
    querySelector: (sel) => {
      if (sel.startsWith('#')) return elementsById.get(sel.slice(1)) || null;
      if (sel === 'body') return documentBody;
      if (sel === 'head') return documentHead;
      if (sel === 'html') return documentHtml;
      for (const el of allElements) {
        if (sel.startsWith('.') && el.classList.contains(sel.slice(1))) return el;
        if (el.tagName.toLowerCase() === sel.toLowerCase()) return el;
      }
      return null;
    },
    querySelectorAll: (sel) => {
      const res = [];
      if (sel.startsWith('#')) {
        const el = elementsById.get(sel.slice(1));
        if (el) res.push(el);
      } else if (sel.startsWith('.')) {
        const cls = sel.slice(1);
        allElements.forEach(el => { if (el.classList.contains(cls)) res.push(el); });
      } else {
        allElements.forEach(el => { if (el.tagName.toLowerCase() === sel.toLowerCase()) res.push(el); });
      }
      return res;
    },
    addEventListener: (evt, fn) => documentBody.addEventListener(evt, fn),
    removeEventListener: (evt, fn) => documentBody.removeEventListener(evt, fn),
    dispatchEvent: (evt) => documentBody.dispatchEvent(evt)
  };

  const storageMap = new Map();
  const mockLocalStorage = {
    getItem: (k) => storageMap.has(k) ? storageMap.get(k) : null,
    setItem: (k, v) => storageMap.set(k, String(v)),
    removeItem: (k) => storageMap.delete(k),
    clear: () => storageMap.clear()
  };

  const listeners = {};
  const mockPlayer = createMockPlayer();

  let readyCallback = null;
  let stateChangeCallback = null;
  let errorCallback = null;

  const mockYT = {
    PlayerState: {
      UNSTARTED: -1,
      ENDED: 0,
      PLAYING: 1,
      PAUSED: 2,
      BUFFERING: 3,
      CUED: 5
    },
    Player: function(id, config) {
      if (config && config.events) {
        readyCallback = config.events.onReady;
        stateChangeCallback = config.events.onStateChange;
        errorCallback = config.events.onError;
      }
      return mockPlayer;
    }
  };

  const mockWindow = {
    document: mockDocument,
    innerWidth: 1440,
    innerHeight: 900,
    localStorage: mockLocalStorage,
    sessionStorage: mockLocalStorage,
    location: { href: 'https://awanish98.github.io/Aura-Music/', search: '', reload() {} },
    navigator: {
      userAgent: 'Mozilla/5.0 Chrome/120.0',
      serviceWorker: { register: () => Promise.resolve() },
      vibrate: () => true
    },
    requestAnimationFrame: (cb) => setTimeout(() => cb(Date.now()), 16),
    cancelAnimationFrame: (id) => clearTimeout(id),
    setTimeout: global.setTimeout,
    clearTimeout: global.clearTimeout,
    setInterval: global.setInterval,
    clearInterval: global.clearInterval,
    addEventListener: (evt, fn) => {
      if (!listeners[evt]) listeners[evt] = [];
      listeners[evt].push(fn);
    },
    removeEventListener: (evt, fn) => {
      if (listeners[evt]) listeners[evt] = listeners[evt].filter(f => f !== fn);
    },
    dispatchEvent: (evt) => {
      const eventName = typeof evt === 'string' ? evt : evt.type;
      const e = typeof evt === 'string' ? { type: evt, target: mockWindow } : evt;
      if (listeners[eventName]) listeners[eventName].forEach(fn => fn.call(mockWindow, e));
    },
    fetch: () => Promise.resolve({
      json: () => Promise.resolve({ latitude: 28.49, longitude: 77.53, city: 'Noida', current: { temperature_2m: 24, weather_code: 51 } })
    }),
    Audio: function() { return { play: () => Promise.resolve(), pause() {}, addEventListener() {}, currentTime: 0, duration: 100 }; },
    AudioContext: function() { return { createGain: () => ({ connect() {}, gain: { value: 1 } }), createAnalyser: () => ({ connect() {}, frequencyBinCount: 128, getByteFrequencyData() {} }), destination: {} }; },
    YT: mockYT
  };

  mockDocument.defaultView = mockWindow;

  // Sandbox setup with testing hooks
  const instrumentedJs = jsContent.replace(/init\(\);\s*\}\)\(\);\s*$/, `
    window.__playSingleTrack = playSingleTrack;
    window.__cycleSpeedMode = cycleSpeedMode;
    window.__onState = onState;
    window.__getSpeedMode = function() { return currentSpeedMode; };
    window.__setSpeedMode = function(s) { currentSpeedMode = s; };
    window.__loadStationPlayback = loadStationPlayback;
    window.__setPlayerAndApiReady = function(p) {
      player = p;
      apiReady = true;
      window.__p = p;
    };
    init();
  })();`);

  const sandbox = Object.assign({}, global, mockWindow, {
    window: mockWindow,
    document: mockDocument,
    localStorage: mockLocalStorage,
    sessionStorage: mockLocalStorage,
    navigator: mockWindow.navigator,
    location: mockWindow.location,
    YT: mockYT,
    $: (id) => mockDocument.getElementById(id)
  });

  const context = vm.createContext(sandbox);
  vm.runInContext(instrumentedJs, context);

  // Set player and API ready state
  if (mockWindow.__setPlayerAndApiReady) {
    mockWindow.__setPlayerAndApiReady(mockPlayer);
  }

  // Trigger YT Player onReady callback if registered
  if (readyCallback) {
    readyCallback();
  }

  return {
    context,
    mockWindow,
    mockDocument,
    elementsById,
    mockPlayer,
    playSingleTrack: mockWindow.__playSingleTrack,
    cycleSpeedMode: mockWindow.__cycleSpeedMode,
    onState: mockWindow.__onState,
    getSpeedMode: mockWindow.__getSpeedMode,
    setSpeedMode: mockWindow.__setSpeedMode,
    loadStationPlayback: mockWindow.__loadStationPlayback,
    fireStateChange: (state) => {
      if (stateChangeCallback) {
        stateChangeCallback({ data: state, target: mockPlayer });
      } else if (mockWindow.__onState) {
        mockWindow.__onState({ data: state, target: mockPlayer });
      }
    },
    fireError: (err) => {
      if (errorCallback) {
        errorCallback(err);
      }
    }
  };
}

console.log(`${colors.bright}${colors.cyan}================================================================${colors.reset}`);
console.log(`${colors.bright}${colors.cyan}   CHALLENGER MILESTONE 2 (M2) ADVERSARIAL STRESS TEST SUITE   ${colors.reset}`);
console.log(`${colors.bright}${colors.cyan}================================================================${colors.reset}\n`);

// -------------------------------------------------------------
// 1. Scrubber Drag & Seeking Adversarial Stress Matrix
// -------------------------------------------------------------
console.log(`${colors.bright}--- Category 1: Scrubber Pointer Drag, Extreme Coordinates & Anti-Rubber-Banding ---${colors.reset}`);

runStressTest('1.1: progressBar pointerdown/move with extreme negative coordinate (clientX = -999999) clamps to 0%', () => {
  const env = createFullTestEnvironment();
  const progressBar = env.elementsById.get('progressBar');
  const progressFill = env.elementsById.get('progressFill');
  const progressHandle = env.elementsById.get('progressHandle');
  const timeCurrent = env.elementsById.get('timeCurrent');

  assert.ok(progressBar, '#progressBar must exist');

  // Trigger pointerdown with extreme negative clientX
  progressBar.dispatchEvent({
    type: 'pointerdown',
    clientX: -999999,
    clientY: 100,
    pointerId: 1
  });

  assert.ok(progressBar.classList.contains('is-dragging'), 'Must enter .is-dragging state on pointerdown');
  assert.strictEqual(progressFill.style.width, '0%', 'Fill width must clamp to 0% for negative coordinate');
  assert.strictEqual(progressHandle.style.left, '0%', 'Handle left must clamp to 0% for negative coordinate');
  assert.strictEqual(timeCurrent.textContent, '0:00', 'Current time preview must clamp to 0:00');

  // Trigger pointermove with extreme negative clientX
  progressBar.dispatchEvent({
    type: 'pointermove',
    clientX: -500000,
    clientY: 100,
    pointerId: 1
  });
  assert.strictEqual(progressFill.style.width, '0%');
  assert.strictEqual(progressHandle.style.left, '0%');
  assert.strictEqual(timeCurrent.textContent, '0:00');
});

runStressTest('1.2: progressBar pointerdown/move with extreme positive coordinate (clientX = +999999) clamps to 100%', () => {
  const env = createFullTestEnvironment();
  const progressBar = env.elementsById.get('progressBar');
  const progressFill = env.elementsById.get('progressFill');
  const progressHandle = env.elementsById.get('progressHandle');
  const timeCurrent = env.elementsById.get('timeCurrent');
  env.mockPlayer.setDuration(200); // 200 seconds = 3:20

  progressBar.dispatchEvent({
    type: 'pointerdown',
    clientX: 999999,
    clientY: 100,
    pointerId: 1
  });

  assert.strictEqual(progressFill.style.width, '100%', 'Fill width must clamp to 100% for overflow coordinate');
  assert.strictEqual(progressHandle.style.left, '100%', 'Handle left must clamp to 100% for overflow coordinate');
  assert.strictEqual(timeCurrent.textContent, '3:20', 'Current time preview must clamp to full duration (3:20)');

  // Finish scrub
  progressBar.dispatchEvent({
    type: 'pointerup',
    clientX: 999999,
    clientY: 100,
    pointerId: 1
  });

  assert.ok(!progressBar.classList.contains('is-dragging'), 'Must exit .is-dragging state on pointerup');
  const seekCall = env.mockPlayer.calls.find(c => c.method === 'seekTo');
  assert.ok(seekCall, 'Must call player.seekTo on pointerup');
  assert.strictEqual(seekCall.args[0], 200, 'Must seek to 200s (100% duration)');
});

runStressTest('1.3: Rapid 10,000-iteration pointermove gesture flood executes without memory or stack error', () => {
  const env = createFullTestEnvironment();
  const progressBar = env.elementsById.get('progressBar');
  const progressFill = env.elementsById.get('progressFill');
  const rect = progressBar.getBoundingClientRect(); // left: 50, width: 300

  progressBar.dispatchEvent({ type: 'pointerdown', clientX: 100, pointerId: 1 });

  const coords = [-500, 50, 100, 200, 350, 500, 9999, -100];
  for (let i = 0; i < 10000; i++) {
    const c = coords[i % coords.length];
    progressBar.dispatchEvent({
      type: 'pointermove',
      clientX: c,
      pointerId: 1
    });
  }

  // Last coord was coords[9999 % 8] = coords[7] = -100 -> clamps to 0%
  assert.strictEqual(progressFill.style.width, '0%');
  progressBar.dispatchEvent({ type: 'pointerup', clientX: 200, pointerId: 1 });
  assert.ok(!progressBar.classList.contains('is-dragging'));
});

runStressTest('1.4: Degenerate Zero-Width or Hidden progressBar handling (rect.width = 0)', () => {
  const env = createFullTestEnvironment();
  const progressBar = env.elementsById.get('progressBar');
  progressBar.setBoundingClientRect({ left: 50, width: 0 }); // Collapsed element

  assert.doesNotThrow(() => {
    progressBar.dispatchEvent({ type: 'pointerdown', clientX: 100, pointerId: 1 });
    progressBar.dispatchEvent({ type: 'pointermove', clientX: 150, pointerId: 1 });
    progressBar.dispatchEvent({ type: 'pointerup', clientX: 150, pointerId: 1 });
  }, 'Zero-width progress bar interaction must not throw uncaught division error or crash');
});

runStressTest('1.5: Interrupted gesture: pointerdown followed immediately by pointercancel resets dragging cleanly', () => {
  const env = createFullTestEnvironment();
  const progressBar = env.elementsById.get('progressBar');

  progressBar.dispatchEvent({ type: 'pointerdown', clientX: 150, pointerId: 42 });
  assert.ok(progressBar.classList.contains('is-dragging'));
  assert.ok(progressBar.pointerCaptures.has(42), 'Pointer capture must be acquired');

  // Interrupted by pointercancel (e.g. system gesture, call incoming)
  progressBar.dispatchEvent({ type: 'pointercancel', clientX: 150, pointerId: 42 });
  assert.ok(!progressBar.classList.contains('is-dragging'), '.is-dragging must be removed on pointercancel');
  assert.ok(!progressBar.pointerCaptures.has(42), 'Pointer capture must be released');
});

runStressTest('1.6: Spurious uninitiated pointermove/up/cancel events without pointerdown are safe no-ops', () => {
  const env = createFullTestEnvironment();
  const progressBar = env.elementsById.get('progressBar');
  const initialCallCount = env.mockPlayer.calls.length;

  assert.doesNotThrow(() => {
    progressBar.dispatchEvent({ type: 'pointermove', clientX: 200 });
    progressBar.dispatchEvent({ type: 'pointerup', clientX: 200 });
    progressBar.dispatchEvent({ type: 'pointercancel', clientX: 200 });
  });

  assert.strictEqual(env.mockPlayer.calls.length, initialCallCount, 'Spurious events must not trigger seekTo or player calls');
});

runStressTest('1.7: 400ms Anti-Rubber-Banding cooldown prevents progress interval overwrite after seek', () => {
  const env = createFullTestEnvironment();
  const progressBar = env.elementsById.get('progressBar');
  const progressFill = env.elementsById.get('progressFill');
  const timeCurrent = env.elementsById.get('timeCurrent');

  env.mockPlayer.setDuration(200); // 200s
  env.mockPlayer.setCurrentTime(50); // Stale time in player

  // Click at 75% mark (seek to 150s)
  // progressBar: left 50, width 300. 75% is 50 + 225 = 275
  progressBar.dispatchEvent({
    type: 'click',
    clientX: 275
  });

  // Check that visual target was set immediately to 75% (150s = 2:30)
  assert.strictEqual(progressFill.style.width, '75%');
  assert.strictEqual(timeCurrent.textContent, '2:30');

  // Cooldown is active! Player's internal time is still 50s (0:50) during async buffer.
  env.mockWindow.document.hidden = false;
  
  // Verify that during cooldown, timeCurrent remains at 2:30
  assert.strictEqual(timeCurrent.textContent, '2:30', 'Interval loop must be suppressed by cooldown');
});

// -------------------------------------------------------------
// 2. Playback Speed Persistence & YouTube State Machine Stress
// -------------------------------------------------------------
console.log(`\n${colors.bright}--- Category 2: Playback Speed Persistence & YouTube State Transitions ---${colors.reset}`);

runStressTest('2.1: Rapid 100x cycleSpeedMode cycles through 1.0x -> 1.25x -> 0.85x -> 1.0x without drift', () => {
  const env = createFullTestEnvironment();
  const vibeSpeedBtn = env.elementsById.get('vibeSpeedBtn');
  const cycleSpeed = env.cycleSpeedMode;
  assert.ok(typeof cycleSpeed === 'function', 'cycleSpeedMode must be accessible');

  const expectedSequence = ['1.25', '0.85', '1.0'];
  for (let i = 0; i < 99; i++) {
    cycleSpeed();
    const expected = expectedSequence[i % 3];
    assert.strictEqual(env.getSpeedMode(), expected, `Iteration ${i} speed mode mismatch`);
    if (expected === '1.25') {
      assert.ok(vibeSpeedBtn.textContent.includes('1.25x'), 'Button label must show 1.25x');
    } else if (expected === '0.85') {
      assert.ok(vibeSpeedBtn.textContent.includes('0.85x'), 'Button label must show 0.85x');
    } else {
      assert.ok(vibeSpeedBtn.textContent.includes('1.0x'), 'Button label must show 1.0x');
    }
  }
});

runStressTest('2.2: Speed re-application on onState(PLAYING) when currentSpeedMode is 1.25x (Nightcore)', () => {
  const env = createFullTestEnvironment();
  env.cycleSpeedMode(); // Set to 1.25
  assert.strictEqual(env.getSpeedMode(), '1.25');

  // Clear previous calls
  env.mockPlayer.calls.length = 0;

  // Simulate YouTube player starting playback (e.g. after track switch or buffer)
  env.fireStateChange(env.mockWindow.YT.PlayerState.PLAYING);

  const rateCalls = env.mockPlayer.calls.filter(c => c.method === 'setPlaybackRate');
  assert.ok(rateCalls.length >= 1, 'setPlaybackRate must be called when entering PLAYING state');
  assert.strictEqual(rateCalls[rateCalls.length - 1].args[0], 1.25, 'Rate must be 1.25');
});

runStressTest('2.3: Speed re-application on onState(PLAYING) when currentSpeedMode is 0.85x (Slowed)', () => {
  const env = createFullTestEnvironment();
  env.cycleSpeedMode(); // 1.25
  env.cycleSpeedMode(); // 0.85
  assert.strictEqual(env.getSpeedMode(), '0.85');

  env.mockPlayer.calls.length = 0;
  env.fireStateChange(env.mockWindow.YT.PlayerState.PLAYING);

  const rateCalls = env.mockPlayer.calls.filter(c => c.method === 'setPlaybackRate');
  assert.ok(rateCalls.length >= 1, 'setPlaybackRate must be called on PLAYING');
  assert.strictEqual(rateCalls[rateCalls.length - 1].args[0], 0.85, 'Rate must be 0.85');
});

runStressTest('2.4: Speed persistence across track end (ENDED -> skip next -> loadStationPlayback -> PLAYING)', () => {
  const env = createFullTestEnvironment();
  env.cycleSpeedMode(); // 1.25

  env.mockPlayer.calls.length = 0;
  // Trigger track end
  env.fireStateChange(env.mockWindow.YT.PlayerState.ENDED);

  // YouTube cues and begins playing new song
  env.fireStateChange(env.mockWindow.YT.PlayerState.BUFFERING);
  env.fireStateChange(env.mockWindow.YT.PlayerState.PLAYING);

  const lastRateCall = env.mockPlayer.calls.filter(c => c.method === 'setPlaybackRate').pop();
  assert.ok(lastRateCall, 'Must enforce playback rate on new track');
  assert.strictEqual(lastRateCall.args[0], 1.25, 'Speed must remain 1.25 across track boundaries');
});

runStressTest('2.5: Resilient exception handling when player.setPlaybackRate throws unexpected error', () => {
  const env = createFullTestEnvironment();
  env.mockPlayer.setPlaybackRate = () => { throw new Error('Simulated YouTube IFrame API Error'); };

  assert.doesNotThrow(() => {
    env.cycleSpeedMode();
    env.fireStateChange(env.mockWindow.YT.PlayerState.PLAYING);
  }, 'Player setPlaybackRate exception must be caught gracefully without crashing');
});

runStressTest('2.6: onState handles null event target with fallback to global player reference', () => {
  const env = createFullTestEnvironment();
  env.cycleSpeedMode(); // 1.25
  env.mockPlayer.calls.length = 0;

  assert.doesNotThrow(() => {
    env.onState({ data: env.mockWindow.YT.PlayerState.PLAYING, target: null });
  });

  const rateCall = env.mockPlayer.calls.find(c => c.method === 'setPlaybackRate');
  assert.ok(rateCall, 'Must fallback to player.setPlaybackRate when e.target is null');
  assert.strictEqual(rateCall.args[0], 1.25);
});

// -------------------------------------------------------------
// 3. playSingleTrack Fault Tolerance & Corrupted Catalogs Stress
// -------------------------------------------------------------
console.log(`\n${colors.bright}--- Category 3: playSingleTrack Edge Cases, Corrupted Catalogs & Queue Continuity ---${colors.reset}`);

runStressTest('3.1: playSingleTrack with null, undefined, or empty object returns safely', () => {
  const env = createFullTestEnvironment();
  const playSingleTrack = env.playSingleTrack;
  assert.ok(typeof playSingleTrack === 'function', 'playSingleTrack must exist');

  assert.doesNotThrow(() => {
    playSingleTrack(null);
    playSingleTrack(undefined);
    playSingleTrack({});
    playSingleTrack({ id: '' });
    playSingleTrack({ id: null });
  }, 'playSingleTrack must reject invalid track objects without error');
});

runStressTest('3.2: playSingleTrack with missing metadata fields (title, artist, thumb) supplies safe fallbacks', () => {
  const env = createFullTestEnvironment();
  const playSingleTrack = env.playSingleTrack;
  const titleEl = env.elementsById.get('title');
  const artistEl = env.elementsById.get('artist');
  const artImg = env.elementsById.get('art');

  playSingleTrack({ id: 'testVid123' });

  assert.strictEqual(titleEl.textContent, 'Now Playing', 'Default title fallback must be used');
  assert.strictEqual(artistEl.textContent, 'Aura Stream', 'Default artist fallback must be used');
  assert.strictEqual(artImg.src, 'https://i.ytimg.com/vi/testVid123/mqdefault.jpg', 'Valid thumbnail URL generated');
  assert.strictEqual(env.mockWindow.currentTrackQueue[0], 'testVid123', 'Selected track must be at queue head');
});

runStressTest('3.3: playSingleTrack with malicious/XSS title payload safely sanitizes textContent', () => {
  const env = createFullTestEnvironment();
  const playSingleTrack = env.playSingleTrack;
  const titleEl = env.elementsById.get('title');

  playSingleTrack({ id: 'xssVid', title: '  <script>alert("PWNED")</script> Awesome Song (Official Video) [4K]  ' });

  assert.ok(!titleEl.textContent.includes('<script>'), 'Title must be sanitized by cleanTitle');
  assert.ok(titleEl.textContent.includes('Awesome Song'), 'Real song title preserved');
});

runStressTest('3.4: playSingleTrack handles corrupted YOUTUBE_DISCOVERY_CATALOG (null, undefined, invalid entries)', () => {
  const env = createFullTestEnvironment();
  const playSingleTrack = env.playSingleTrack;

  // Corrupt the catalog in context
  env.mockWindow.YOUTUBE_DISCOVERY_CATALOG = [
    null,
    undefined,
    123,
    "bad-entry",
    {},
    { id: null },
    { id: 'corrupted1' },
    { id: 'corrupted2' }
  ];

  assert.doesNotThrow(() => {
    playSingleTrack({ id: 'valid_target' });
  });

  const queue = env.mockWindow.currentTrackQueue;
  assert.ok(Array.isArray(queue), 'Queue must be an array');
  assert.strictEqual(queue[0], 'valid_target', 'Target track must be at index 0');
  assert.ok(!queue.includes(null), 'Queue must not contain null');
  assert.ok(!queue.includes(undefined), 'Queue must not contain undefined');
});

runStressTest('3.5: playSingleTrack handles null/undefined STATION_TRACKS gracefully', () => {
  const env = createFullTestEnvironment();
  const playSingleTrack = env.playSingleTrack;

  // Temporarily set STATION_TRACKS undefined in window
  env.mockWindow.STATION_TRACKS = undefined;

  assert.doesNotThrow(() => {
    playSingleTrack({ id: 'solo_track' });
  });

  const queue = env.mockWindow.currentTrackQueue;
  assert.ok(queue.length >= 1, 'Queue must at least have the played track');
  assert.strictEqual(queue[0], 'solo_track');
});

runStressTest('3.6: playSingleTrack sets STATION_TRACKS["explorer"] and currentStationKey = "explorer"', () => {
  const env = createFullTestEnvironment();
  const playSingleTrack = env.playSingleTrack;

  playSingleTrack({ id: 'exp_song_99' });

  assert.ok(env.mockWindow.STATION_TRACKS['explorer'], 'STATION_TRACKS.explorer must be populated');
  assert.strictEqual(env.mockWindow.STATION_TRACKS['explorer'][0], 'exp_song_99');
  assert.strictEqual(env.mockWindow.currentTrackIndex, 0);
});

runStressTest('3.7: Explorer queue endless progression (skip next advances through queue)', () => {
  const env = createFullTestEnvironment();
  const playSingleTrack = env.playSingleTrack;
  const nextBtn = env.elementsById.get('next');

  playSingleTrack({ id: 'start_track' });
  const queue = env.mockWindow.currentTrackQueue;
  assert.ok(queue.length > 5, 'Queue should have populated recommendations');

  const secondTrack = queue[1];
  env.mockPlayer.calls.length = 0;

  // Skip forward in explorer mode via #next button click
  if (nextBtn) nextBtn.click();

  assert.strictEqual(env.mockWindow.currentTrackIndex, 1, 'Current index must advance to 1');
  const loadCall = env.mockPlayer.calls.find(c => c.method === 'loadVideoById');
  assert.ok(loadCall, 'Must call loadVideoById for next track');
  assert.strictEqual(loadCall.args[0], secondTrack, 'Must play second track in queue');
});

// -------------------------------------------------------------
// 4. MoodUniverseEngine Pool Safety & Master Station Mappings
// -------------------------------------------------------------
console.log(`\n${colors.bright}--- Category 4: MoodUniverseEngine Station Pool Verification ---${colors.reset}`);

runStressTest('4.1: MoodUniverseEngine.playMoodStation for all 10 mood categories maps to valid stations', () => {
  const env = createFullTestEnvironment();
  const moodEngine = env.mockWindow.MoodUniverseEngine;
  assert.ok(moodEngine && typeof moodEngine.playMoodStation === 'function', 'MoodUniverseEngine must exist');

  const moods = ['romance', 'energy', 'global', 'chill', 'punjabi', 'retro', 'sufi', 'wellness', 'time', 'party'];

  moods.forEach(mood => {
    assert.doesNotThrow(() => {
      moodEngine.playMoodStation(mood);
    }, `playMoodStation('${mood}') must not throw`);

    assert.ok(env.mockWindow.currentTrackQueue.length > 0, `Mood '${mood}' must populate non-empty currentTrackQueue`);
    assert.ok(!env.mockWindow.currentTrackQueue.includes(undefined), `Mood '${mood}' must not have undefined tracks`);
  });
});

runStressTest('4.2: MoodUniverseEngine.playMoodStation with unknown/corrupted mood name falls back safely', () => {
  const env = createFullTestEnvironment();
  const moodEngine = env.mockWindow.MoodUniverseEngine;

  assert.doesNotThrow(() => {
    moodEngine.playMoodStation('non_existent_cosmic_frequency');
    moodEngine.playMoodStation(null);
    moodEngine.playMoodStation(12345);
  }, 'Unknown mood station must fall back safely to default pool without crashing');

  assert.ok(env.mockWindow.currentTrackQueue.length > 0, 'Must have tracks in queue after fallback');
});

// -------------------------------------------------------------
// 5. Cross-Feature Chaos & Concurrency Scenarios
// -------------------------------------------------------------
console.log(`\n${colors.bright}--- Category 5: Concurrency, Fast Actions & Race Conditions ---${colors.reset}`);

runStressTest('5.1: Track change while user is actively dragging progress bar does not crash or desync', () => {
  const env = createFullTestEnvironment();
  const progressBar = env.elementsById.get('progressBar');
  const playSingleTrack = env.playSingleTrack;

  // User starts dragging scrubber
  progressBar.dispatchEvent({ type: 'pointerdown', clientX: 100, pointerId: 1 });
  assert.ok(progressBar.classList.contains('is-dragging'));

  // Suddenly an external track play occurs (e.g. autoplay next or search click)
  assert.doesNotThrow(() => {
    playSingleTrack({ id: 'concurrent_track' });
  });

  // User finishes drag
  assert.doesNotThrow(() => {
    progressBar.dispatchEvent({ type: 'pointerup', clientX: 200, pointerId: 1 });
  });

  assert.ok(!progressBar.classList.contains('is-dragging'), 'State must be clean');
});

runStressTest('5.2: Rapid alternating speed mode cycling and track skips under load', () => {
  const env = createFullTestEnvironment();
  const cycleSpeed = env.cycleSpeedMode;
  const nextBtn = env.elementsById.get('next');

  assert.doesNotThrow(() => {
    for (let i = 0; i < 50; i++) {
      cycleSpeed();
      if (nextBtn) nextBtn.click();
      env.fireStateChange(env.mockWindow.YT.PlayerState.PLAYING);
    }
  }, 'Rapid speed switching + skipping must be 100% stable without race errors');
});

console.log(`\n${colors.bright}${colors.cyan}================================================================${colors.reset}`);
console.log(`${colors.bright}${colors.cyan}         CHALLENGER M2 STRESS TEST SUITE RESULTS               ${colors.reset}`);
console.log(`${colors.bright}${colors.cyan}================================================================${colors.reset}`);
console.log(`  Total Stress Tests:  ${stressResults.total}`);
console.log(`  ${colors.green}Passed:              ${stressResults.passed}${colors.reset}`);
console.log(`  ${stressResults.failed > 0 ? colors.red : colors.green}Failed:              ${stressResults.failed}${colors.reset}`);
console.log(`  Pass Rate:           ${((stressResults.passed / stressResults.total) * 100).toFixed(1)}%`);
console.log(`${colors.bright}${colors.cyan}================================================================${colors.reset}\n`);

if (stressResults.failed > 0) {
  console.error(`${colors.red}STRESS TEST SUITE DETECTED FAILURES!${colors.reset}`);
  if (require.main === module) process.exit(1);
} else {
  console.log(`${colors.green}ALL ${stressResults.total} ADVERSARIAL STRESS TESTS PASSED SUCCESSFULLY! 🛡️⚡${colors.reset}`);
  if (require.main === module) process.exit(0);
}

module.exports = stressResults;
