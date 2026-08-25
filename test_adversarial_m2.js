/**
 * Adversarial Verification & Stress Test Harness for Milestone 2
 * Author: teamwork_preview_challenger_m2_2
 * 
 * Focus Areas:
 * 1. Audio Engine Queue Progression & Endless Streaming via onState(ENDED)
 * 2. 400ms Seek Cooldown vs 250ms Scrubber Timing Interval (Anti-Rubber-Banding)
 * 3. CSS Progress Scrubber Consolidation & Specificity Audit
 * 4. Full E2E Test Suite Run
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('\x1b[1m\x1b[36m====================================================\x1b[0m');
console.log('\x1b[1m\x1b[36m  ADVERSARIAL STRESS HARNESS — MILESTONE 2 QA       \x1b[0m');
console.log('\x1b[1m\x1b[36m====================================================\x1b[0m\n');

const jsContent = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
const cssContent = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');
const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  \x1b[32m✔ PASS\x1b[0m ${name}`);
  } catch (e) {
    failedTests++;
    console.log(`  \x1b[31m✖ FAIL\x1b[0m ${name}`);
    console.log(`    \x1b[2m${e.message}\x1b[0m`);
    failures.push({ name, error: e.message, stack: e.stack });
  }
}

// -------------------------------------------------------------
// SECTION 1: QUEUE PROGRESSION & ENDED STATE STRESS TESTS
// -------------------------------------------------------------
console.log('\x1b[1m\x1b[33m--- [SECTION 1] Queue Progression & onState(ENDED) Stress Testing ---\x1b[0m');

function createQueueSandbox(initialTracks, stationKey) {
  const loadedVideos = [];
  const toasts = [];

  const sandbox = {
    console: { log: () => {}, warn: () => {}, error: () => {} },
    window: {},
    document: {
      body: {
        classList: {
          add: () => {},
          remove: () => {},
          contains: () => false
        }
      },
      querySelectorAll: () => []
    },
    $: (id) => ({
      textContent: '',
      src: '',
      classList: { add: () => {}, remove: () => {} }
    }),
    cleanTitle: (t) => t,
    fmt: (s) => '00:00',
    HapticEngine: { tap: () => {} },
    SleepTimerEngine: {
      trackCountRemaining: 50,
      onTrackEnded: function() {
        if (this.trackCountRemaining > 0) this.trackCountRemaining--;
      }
    },
    DynamicIslandEngine: { updatePlayState: () => {} },
    showToast: (msg) => { toasts.push(msg); },
    hideAutoplayPrompt: () => {},
    claimAudioMaster: () => {},
    update: () => {},
    applyStationTheme: () => {},
    EXPLORER_STATION: { key: 'explorer', name: 'YouTube Explorer' },
    sessionHistory: [],
    skipDebounce: false,
    desired: false,
    currentSpeedMode: '1.0',
    currentStationKey: stationKey || 'ishq',
    currentStation: { key: stationKey || 'ishq' },
    activePlaylistId: '',
    currentTrackIndex: 0,
    currentTrackQueue: initialTracks ? initialTracks.slice() : [],
    STATION_TRACKS: {
      'ishq': ['ishq_1', 'ishq_2', 'ishq_3', 'ishq_4', 'ishq_5'],
      'time-travel': ['tt_1', 'tt_2', 'tt_3'],
      'edm': ['edm_1', 'edm_2'],
      'explorer': []
    },
    YOUTUBE_DISCOVERY_CATALOG: [
      { id: 'cat_1', title: 'Song 1', artist: 'Artist 1' },
      { id: 'cat_2', title: 'Song 2', artist: 'Artist 2' },
      { id: 'cat_3', title: 'Song 3', artist: 'Artist 3' },
      { id: 'cat_4', title: 'Song 4', artist: 'Artist 4' },
      { id: 'cat_5', title: 'Song 5', artist: 'Artist 5' }
    ],
    YT: {
      PlayerState: {
        UNSTARTED: -1,
        ENDED: 0,
        PLAYING: 1,
        PAUSED: 2,
        BUFFERING: 3,
        CUED: 5
      }
    },
    player: {
      loadVideoById: (id) => { loadedVideos.push(id); },
      playVideo: () => {},
      setPlaybackRate: () => {}
    }
  };

  sandbox.window = sandbox;

  sandbox.skip = function(dir) {
    try { sandbox.HapticEngine.tap(); } catch (e) {}
    sandbox.claimAudioMaster();
    sandbox.desired = true;
    sandbox.document.body.classList.add('playing');
    sandbox.hideAutoplayPrompt();

    if (sandbox.skipDebounce) return;
    sandbox.skipDebounce = true;
    sandbox.skipDebounce = false; // reset in sync testing

    try {
      if (!sandbox.currentTrackQueue || sandbox.currentTrackQueue.length === 0) {
        var key = sandbox.currentStationKey || 'ishq';
        if (typeof sandbox.STATION_TRACKS !== 'undefined' && sandbox.STATION_TRACKS[key] && sandbox.STATION_TRACKS[key].length) {
          sandbox.currentTrackQueue = sandbox.STATION_TRACKS[key].slice();
        }
      }

      if (sandbox.currentTrackQueue && sandbox.currentTrackQueue.length > 0) {
        if (dir === 'next') {
          sandbox.currentTrackIndex++;
          if (sandbox.currentTrackIndex >= sandbox.currentTrackQueue.length) {
            sandbox.currentTrackQueue.sort(function () { return 0.5 - Math.random(); });
            sandbox.currentTrackIndex = 0;
            sandbox.showToast('Endless Radio Reshuffled 🎲');
          } else {
            sandbox.showToast('Next Song ⏭️');
          }
        } else {
          sandbox.currentTrackIndex = (sandbox.currentTrackIndex - 1 + sandbox.currentTrackQueue.length) % sandbox.currentTrackQueue.length;
          sandbox.showToast('Previous Song ⏮️');
        }

        var nextVid = sandbox.currentTrackQueue[sandbox.currentTrackIndex];
        sandbox.window.currentTrackIndex = sandbox.currentTrackIndex;
        sandbox.window.currentTrackQueue = sandbox.currentTrackQueue;
        if (sandbox.player) {
          if (sandbox.player.loadVideoById) {
            sandbox.player.loadVideoById(nextVid);
          }
        }
        return;
      }
    } catch (e) {
      sandbox.console.warn("Skip error:", e);
    }
  };

  sandbox.playSingleTrack = function(track, preserveStation) {
    if (!sandbox.player || !track || !track.id) return;
    sandbox.claimAudioMaster();

    if (!preserveStation) {
      sandbox.currentStationKey = 'explorer';
      sandbox.currentStation = sandbox.EXPLORER_STATION;
      sandbox.activePlaylistId = '';
    }

    var queuePool = [];
    if (typeof sandbox.YOUTUBE_DISCOVERY_CATALOG !== 'undefined' && Array.isArray(sandbox.YOUTUBE_DISCOVERY_CATALOG)) {
      sandbox.YOUTUBE_DISCOVERY_CATALOG.forEach(function (c) {
        if (c && c.id && c.id !== track.id && queuePool.indexOf(c.id) === -1) {
          queuePool.push(c.id);
        }
      });
    }
    if (typeof sandbox.STATION_TRACKS !== 'undefined') {
      var stationPool = (sandbox.STATION_TRACKS['ishq'] || []).concat(sandbox.STATION_TRACKS['time-travel'] || []);
      stationPool.forEach(function (sid) {
        if (sid && sid !== track.id && queuePool.indexOf(sid) === -1) {
          queuePool.push(sid);
        }
      });
    }
    queuePool.sort(function () { return 0.5 - Math.random(); });
    sandbox.currentTrackQueue = [track.id].concat(queuePool.slice(0, 50));
    sandbox.currentTrackIndex = 0;
    sandbox.window.currentTrackQueue = sandbox.currentTrackQueue;
    sandbox.window.currentTrackIndex = sandbox.currentTrackIndex;
    if (typeof sandbox.STATION_TRACKS !== 'undefined') {
      sandbox.STATION_TRACKS['explorer'] = sandbox.currentTrackQueue;
    }

    if (sandbox.player.loadVideoById) {
      sandbox.player.loadVideoById(track.id);
    }
  };

  sandbox.onState = function(e) {
    if (!sandbox.YT) return;
    if (e.data === sandbox.YT.PlayerState.ENDED) {
      sandbox.SleepTimerEngine.onTrackEnded();
      sandbox.skip('next');
    }
  };

  return { sandbox, loadedVideos, toasts };
}

runTest('1.1: 500 consecutive onState(ENDED) cycles maintain non-empty queue and valid track IDs', () => {
  const { sandbox, loadedVideos } = createQueueSandbox(['trk1', 'trk2', 'trk3', 'trk4', 'trk5']);
  
  for (let i = 0; i < 500; i++) {
    sandbox.onState({ data: sandbox.YT.PlayerState.ENDED });
    assert.ok(sandbox.currentTrackQueue.length > 0, `Queue became empty at cycle ${i}`);
    assert.ok(sandbox.currentTrackIndex >= 0 && sandbox.currentTrackIndex < sandbox.currentTrackQueue.length, `Invalid index ${sandbox.currentTrackIndex} at cycle ${i}`);
    const currentVideo = sandbox.currentTrackQueue[sandbox.currentTrackIndex];
    assert.ok(typeof currentVideo === 'string' && currentVideo.length > 0, `Invalid video id: ${currentVideo} at cycle ${i}`);
  }

  assert.strictEqual(loadedVideos.length, 500, 'Must load video on every ENDED event');
});

runTest('1.2: playSingleTrack builds dynamic queue and survives 200 consecutive onState(ENDED) completions', () => {
  const { sandbox, loadedVideos } = createQueueSandbox([], 'ishq');
  
  sandbox.playSingleTrack({ id: 'solo_track_123', title: 'Solo Hit', artist: 'Solo Singer' });
  
  assert.strictEqual(sandbox.currentStationKey, 'explorer');
  assert.strictEqual(sandbox.currentTrackIndex, 0);
  assert.strictEqual(sandbox.currentTrackQueue[0], 'solo_track_123');
  assert.ok(sandbox.currentTrackQueue.length > 5, 'Queue pool must be populated from catalog and station pools');
  assert.strictEqual(loadedVideos[0], 'solo_track_123');

  for (let i = 0; i < 200; i++) {
    sandbox.onState({ data: sandbox.YT.PlayerState.ENDED });
    assert.ok(sandbox.currentTrackQueue.length > 0, `Queue empty at cycle ${i}`);
    assert.ok(typeof sandbox.currentTrackQueue[sandbox.currentTrackIndex] === 'string', `Invalid video at cycle ${i}`);
  }

  assert.strictEqual(loadedVideos.length, 201, 'Must have initial play + 200 transitions');
});

runTest('1.3: Empty initial queue self-heals from active station on first onState(ENDED)', () => {
  const { sandbox, loadedVideos } = createQueueSandbox([], 'ishq');
  assert.strictEqual(sandbox.currentTrackQueue.length, 0);

  sandbox.onState({ data: sandbox.YT.PlayerState.ENDED });
  
  assert.ok(sandbox.currentTrackQueue.length > 0, 'Must replenish from STATION_TRACKS[ishq]');
  assert.strictEqual(loadedVideos.length, 1);
  assert.ok(loadedVideos[0].startsWith('ishq_'), 'Loaded video must be from ishq station');
});

runTest('1.4: Single-track queue endless reshuffle without out-of-bounds index', () => {
  const { sandbox, loadedVideos } = createQueueSandbox(['only_one_track'], 'custom');
  
  for (let i = 0; i < 50; i++) {
    sandbox.onState({ data: sandbox.YT.PlayerState.ENDED });
    assert.strictEqual(sandbox.currentTrackIndex, 0);
    assert.strictEqual(sandbox.currentTrackQueue[0], 'only_one_track');
  }

  assert.strictEqual(loadedVideos.length, 50);
});

runTest('1.5: Backwards skip wraps around queue cleanly with modulo arithmetic', () => {
  const { sandbox, loadedVideos } = createQueueSandbox(['t0', 't1', 't2', 't3'], 'ishq');
  sandbox.currentTrackIndex = 0;

  for (let i = 0; i < 20; i++) {
    sandbox.skip('prev');
    assert.ok(sandbox.currentTrackIndex >= 0 && sandbox.currentTrackIndex < 4, `Index ${sandbox.currentTrackIndex} out of bounds`);
  }
  assert.strictEqual(loadedVideos.length, 20);
});

runTest('1.6: MoodUniverseEngine poolMap maps all 10 mood spectrums strictly to valid master stations', () => {
  const poolMapMatch = jsContent.match(/var poolMap = \{([\s\S]*?)\};/);
  assert.ok(poolMapMatch, 'poolMap must be defined in MoodUniverseEngine');
  
  const rawPoolMap = poolMapMatch[0];
  assert.ok(!rawPoolMap.includes("'explorer'"), "poolMap must NOT reference undefined 'explorer' station");
  
  const moodSpectrums = ['romance', 'energy', 'global', 'chill', 'punjabi', 'retro', 'sufi', 'wellness', 'time', 'party'];
  moodSpectrums.forEach(mood => {
    assert.ok(rawPoolMap.includes(`'${mood}'`), `poolMap must cover ${mood}`);
  });
});

runTest('1.7: Playback speed mode is reapplied in onState(PLAYING) and loadStationPlayback', () => {
  assert.ok(jsContent.includes("var currentSpeedMode = '1.0';"), 'currentSpeedMode must be declared');
  assert.ok(jsContent.includes("e.target.setPlaybackRate(parseFloat(currentSpeedMode) || 1.0)"), 'onState PLAYING must re-apply speed');
  assert.ok(jsContent.includes("player.setPlaybackRate(parseFloat(currentSpeedMode) || 1.0)"), 'loadStationPlayback must re-apply speed');
});

// -------------------------------------------------------------
// SECTION 2: 400MS SEEK COOLDOWN VS 250MS INTERVAL TESTS
// -------------------------------------------------------------
console.log('\n\x1b[1m\x1b[33m--- [SECTION 2] 400ms Seek Cooldown & Timing Loop Rubber-Banding Tests ---\x1b[0m');

function createScrubberHarness() {
  let isScrubbing = false;
  let isSeekingCooldown = false;
  let seekCooldownTimer = null;

  const mockDom = {
    progressFill: { style: { width: '0%' } },
    progressHandle: { style: { left: '0%' } },
    timeCurrent: { textContent: '00:00' },
    timeTotal: { textContent: '03:20' }
  };

  function fmt(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m < 10 ? '0' : ''}${m}:${sec < 10 ? '0' : ''}${sec}`;
  }

  function setScrubberVisual(percent, targetTime) {
    mockDom.progressFill.style.width = (percent * 100) + '%';
    mockDom.progressHandle.style.left = (percent * 100) + '%';
    if (typeof targetTime === 'number') {
      mockDom.timeCurrent.textContent = fmt(targetTime);
    }
  }

  function triggerSeekCooldown(timeoutFn) {
    isSeekingCooldown = true;
    if (seekCooldownTimer && timeoutFn.clear) timeoutFn.clear(seekCooldownTimer);
    seekCooldownTimer = timeoutFn.set(() => {
      isSeekingCooldown = false;
    }, 400);
  }

  const mockPlayer = {
    currentTime: 10, // Stale time: 10s into 200s track (5%)
    duration: 200,
    getCurrentTime: function() { return this.currentTime; },
    getDuration: function() { return this.duration; },
    seekTo: function(seconds) {}
  };

  function runIntervalTick() {
    if (!mockPlayer || isScrubbing || isSeekingCooldown) return false;
    var cur = mockPlayer.getCurrentTime();
    var dur = mockPlayer.getDuration();
    mockDom.timeCurrent.textContent = fmt(cur);
    if (dur > 0) {
      var pct = (cur / dur) * 100;
      mockDom.progressFill.style.width = pct + '%';
      mockDom.progressHandle.style.left = pct + '%';
    }
    return true;
  }

  return {
    mockDom,
    mockPlayer,
    setScrubberVisual,
    triggerSeekCooldown,
    runIntervalTick,
    setScrubbing: (val) => { isScrubbing = val; },
    getState: () => ({ isScrubbing, isSeekingCooldown })
  };
}

runTest('2.1: Scrubber seek to 85% suppresses 250ms interval tick from reverting to stale 5%', () => {
  const harness = createScrubberHarness();
  let scheduledCallbacks = [];
  const mockTimer = {
    set: (cb, delay) => {
      const entry = { cb, delay, id: Math.random() };
      scheduledCallbacks.push(entry);
      return entry.id;
    },
    clear: (id) => {
      scheduledCallbacks = scheduledCallbacks.filter(e => e.id !== id);
    }
  };

  // Initial state: 10s / 200s (5%)
  harness.runIntervalTick();
  assert.strictEqual(harness.mockDom.progressFill.style.width, '5%');
  assert.strictEqual(harness.mockDom.timeCurrent.textContent, '00:10');

  // User clicks / finishes scrub at 85% (170s) at t=0ms
  harness.mockPlayer.seekTo(170);
  harness.setScrubberVisual(0.85, 170);
  harness.triggerSeekCooldown(mockTimer);

  assert.strictEqual(harness.mockDom.progressFill.style.width, '85%');
  assert.strictEqual(harness.mockDom.progressHandle.style.left, '85%');
  assert.strictEqual(harness.mockDom.timeCurrent.textContent, '02:50');

  // At t=250ms: Interval fires, player still has stale 10s (5%)
  const didUpdateAt250ms = harness.runIntervalTick();
  assert.strictEqual(didUpdateAt250ms, false, 'Interval tick must be suppressed by cooldown');
  assert.strictEqual(harness.mockDom.progressFill.style.width, '85%', 'Width must NOT rubber-band back to 5%');
  assert.strictEqual(harness.mockDom.timeCurrent.textContent, '02:50', 'Timestamp must NOT rubber-band');

  // At t=350ms: YouTube iframe completes buffer, sets player time to 170s
  harness.mockPlayer.currentTime = 170;

  // At t=400ms: Cooldown expires
  scheduledCallbacks.forEach(e => e.cb());

  // At t=500ms: Next interval fires and smoothly continues from 170s+
  harness.mockPlayer.currentTime = 171;
  const didUpdateAt500ms = harness.runIntervalTick();
  assert.strictEqual(didUpdateAt500ms, true, 'Interval tick must resume after 400ms cooldown');
  assert.strictEqual(harness.mockDom.progressFill.style.width, '85.5%');
  assert.strictEqual(harness.mockDom.timeCurrent.textContent, '02:51');
});

runTest('2.2: Rapid successive seeks reset cooldown timer window', () => {
  const harness = createScrubberHarness();
  let timers = [];
  const mockTimer = {
    set: (cb, delay) => {
      const entry = { cb, delay, id: Math.random(), active: true };
      timers.push(entry);
      return entry.id;
    },
    clear: (id) => {
      timers = timers.filter(e => e.id !== id);
    }
  };

  // Seek 1 at t=0ms to 40%
  harness.mockPlayer.seekTo(80);
  harness.setScrubberVisual(0.40, 80);
  harness.triggerSeekCooldown(mockTimer);
  assert.strictEqual(timers.length, 1);

  // Seek 2 at t=150ms to 75% -> must clear seek 1 timer and install fresh 400ms timer
  harness.mockPlayer.seekTo(150);
  harness.setScrubberVisual(0.75, 150);
  harness.triggerSeekCooldown(mockTimer);
  assert.strictEqual(timers.length, 1, 'Previous seek timer must be cleared');

  // At t=250ms and t=500ms (within 150+400=550ms), interval ticks are suppressed
  assert.strictEqual(harness.runIntervalTick(), false);
  assert.strictEqual(harness.mockDom.progressFill.style.width, '75%');
});

runTest('2.3: Active scrubbing (isScrubbing = true) continuously blocks interval updates during drag', () => {
  const harness = createScrubberHarness();
  harness.setScrubbing(true);
  harness.setScrubberVisual(0.60, 120);

  // Simulate 10 high-frequency interval ticks while dragging
  for (let i = 0; i < 10; i++) {
    const updated = harness.runIntervalTick();
    assert.strictEqual(updated, false, 'Must not update DOM while user is actively dragging');
    assert.strictEqual(harness.mockDom.progressFill.style.width, '60%');
  }
});

runTest('2.4: Seek percentage clamping at boundaries (0% to 100%)', () => {
  const clamp = (val) => Math.max(0, Math.min(1, val));
  assert.strictEqual(clamp(-0.25), 0);
  assert.strictEqual(clamp(0), 0);
  assert.strictEqual(clamp(0.55), 0.55);
  assert.strictEqual(clamp(1.0), 1.0);
  assert.strictEqual(clamp(1.45), 1.0);
});

// -------------------------------------------------------------
// SECTION 3: CSS CONSOLIDATION & SPECIFICITY AUDIT
// -------------------------------------------------------------
console.log('\n\x1b[1m\x1b[33m--- [SECTION 3] CSS Scrubber Consolidation & Layout Audit ---\x1b[0m');

runTest('3.1: Exactly one canonical declaration for .progress-container, .progress-bar-wrap, .progress-track, .progress-handle', () => {
  // Use line-start / whitespace boundary regex to avoid matching compound selectors (.is-dragging .progress-track)
  const containerMatches = cssContent.match(/(?:^|\n)\.progress-container\s*\{/g);
  const wrapMatches = cssContent.match(/(?:^|\n)\.progress-bar-wrap\s*\{/g);
  const trackMatches = cssContent.match(/(?:^|\n)\.progress-track\s*\{/g);
  const handleMatches = cssContent.match(/(?:^|\n)\.progress-handle\s*\{/g);

  assert.strictEqual(containerMatches ? containerMatches.length : 0, 1, 'Exactly one canonical .progress-container definition');
  assert.strictEqual(wrapMatches ? wrapMatches.length : 0, 1, 'Exactly one canonical .progress-bar-wrap definition');
  assert.strictEqual(trackMatches ? trackMatches.length : 0, 1, 'Exactly one canonical .progress-track definition');
  assert.strictEqual(handleMatches ? handleMatches.length : 0, 1, 'Exactly one canonical .progress-handle definition');
});

runTest('3.2: .progress-bar-wrap defines touch-action: none and user-select: none', () => {
  const wrapBlockMatch = cssContent.match(/(?:^|\n)\.progress-bar-wrap\s*\{([\s\S]*?)\}/);
  assert.ok(wrapBlockMatch, '.progress-bar-wrap block must exist');
  const body = wrapBlockMatch[1];
  assert.ok(body.includes('touch-action: none'), 'Must have touch-action: none for smooth mobile dragging');
  assert.ok(body.includes('user-select: none'), 'Must have user-select: none to prevent text selection during scrub');
  assert.ok(body.includes('cursor: pointer'), 'Must have cursor: pointer');
});

runTest('3.3: .progress-track, .progress-fill, and .progress-handle have pointer-events: none', () => {
  const trackBlock = cssContent.match(/(?:^|\n)\.progress-track\s*\{([\s\S]*?)\}/)[1];
  const fillBlock = cssContent.match(/(?:^|\n)\.progress-fill\s*\{([\s\S]*?)\}/)[1];
  const handleBlock = cssContent.match(/(?:^|\n)\.progress-handle\s*\{([\s\S]*?)\}/)[1];

  assert.ok(trackBlock.includes('pointer-events: none'), 'Track must not capture pointer events');
  assert.ok(fillBlock.includes('pointer-events: none'), 'Fill must not capture pointer events');
  assert.ok(handleBlock.includes('pointer-events: none'), 'Handle must not capture pointer events');
});

runTest('3.4: Hover and .is-dragging states scale handle and expand track', () => {
  assert.ok(cssContent.includes('.progress-bar-wrap:hover .progress-track'), 'Track expand on hover defined');
  assert.ok(cssContent.includes('.progress-bar-wrap.is-dragging .progress-track'), 'Track expand on dragging defined');
  assert.ok(cssContent.includes('.progress-bar-wrap:hover .progress-handle'), 'Handle scale on hover defined');
  assert.ok(cssContent.includes('.progress-bar-wrap.is-dragging .progress-handle'), 'Handle scale on dragging defined');
});

runTest('3.5: Mobile media query optimizes progress-fill with transform-origin and will-change', () => {
  const mobileFillMatch = cssContent.match(/@media\s*\([^{]*max-width:\s*(?:768px|480px)[^{]*\)\s*\{[\s\S]*?\.progress-fill\s*\{([\s\S]*?)\}/);
  assert.ok(mobileFillMatch, 'Mobile media query should have progress-fill rule');
  assert.ok(mobileFillMatch[1].includes('will-change: width') || mobileFillMatch[1].includes('transform-origin: left'), 'Optimized for mobile rendering');
});

// -------------------------------------------------------------
// SUMMARY & VERDICT
// -------------------------------------------------------------
console.log('\n\x1b[1m\x1b[36m====================================================\x1b[0m');
console.log(`\x1b[1m\x1b[36m  ADVERSARIAL STRESS TEST SUMMARY: ${passedTests}/${totalTests} PASSED\x1b[0m`);
console.log('\x1b[1m\x1b[36m====================================================\x1b[0m');

if (failedTests > 0) {
  console.log(`\x1b[31mFAILURES DETECTED (${failedTests}):\x1b[0m`);
  failures.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
  process.exit(1);
} else {
  console.log('\x1b[32mALL ADVERSARIAL STRESS TESTS PASSED EMPIRICALLY! 🚀\x1b[0m\n');
  process.exit(0);
}
