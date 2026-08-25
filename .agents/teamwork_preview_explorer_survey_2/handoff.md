# Handoff Report — Audio Engine, YouTube Player, Stations & Scrubber Survey

**Agent**: `teamwork_preview_explorer_survey_2`  
**Working Directory**: `p:\Agents\ishq-radio-2.0\.agents\teamwork_preview_explorer_survey_2`  
**Handoff Type**: Hard (Investigation complete)  
**Deliverable Document**: `p:\Agents\ishq-radio-2.0\.agents\teamwork_preview_explorer_survey_2\analysis.md`  

---

## 1. Observation

### Observation 1.1: YouTube API Initialisation & Player Creation
- In `script.js:5754-5784`, `loadApi()` intercepts `window.onYouTubeIframeAPIReady`, backing up `prev` and adding an interval polling mechanism `setInterval(..., 200)` with a 3000ms safety timeout:
  ```javascript
  var prev = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = function () {
    if (prev) try { prev(); } catch (e) {}
    onReady();
  };
  ```
- In `script.js:7572-7603`, the YouTube player is instantiated targeting `div#playerA` inside offscreen container `#playerHarness`:
  ```javascript
  var pA = new YT.Player('playerA', {
    width: '200', height: '200',
    playerVars: { playsinline: 1, controls: 0, disablekb: 1, rel: 0, iv_load_policy: 3 },
    events: {
      onReady: function () {
        player = pA; window.__p = player; apiReady = true; show('s-ready');
        DualAudioEngine.init(pA, null);
        setTimeout(function () {
          var s = currentStation || (stations && stations[0]);
          if (s) loadStationPlayback(s);
        }, 200);
      },
      onStateChange: onState,
      onError: onErr
    }
  });
  ```

### Observation 1.2: Playback Rate Speed Switcher & Reset
- In `script.js:8048-8069`, `#vibeSpeedBtn` cycles through `'1.0'`, `'1.25'`, and `'0.85'`:
  ```javascript
  if (currentSpeedMode === '1.0') {
    currentSpeedMode = '1.25';
    if (btn) btn.textContent = '1.25x ⚡';
    if (player.setPlaybackRate) player.setPlaybackRate(1.25);
    showToast('⚡ Nightcore / Speed Up (1.25x) Active!');
  }
  ```
- No call to `player.setPlaybackRate` exists in `onState` (PLAYING) (`script.js:6044-6053`) or `loadStationPlayback` (`script.js:1722-1785`).

### Observation 1.3: Stations and Queue Pipeline
- Master stations are defined in `stations.json` and `DEFAULT_STATIONS` (`script.js:8-190`).
- Station track IDs are stored in `STATION_TRACKS` (`script.js:1206-1720`) containing 70–100+ tracks per station.
- `MoodUniverseEngine` (`script.js:6104-7470`) defines 44 curated mood stations in `MOOD_STATIONS`.
- In `playMoodStation` (`script.js:7101-7245`), dynamic queues of 100–150 tracks are assembled and stored in `STATION_TRACKS[customStation.id]`.
- In `script.js:7189-7200`, `poolMap['chill']` references `'explorer'`, but `STATION_TRACKS['explorer']` is undefined.
- In `playSingleTrack` (`script.js:2019-2055`), `currentStationKey` is set to `'explorer'`, but `currentTrackQueue` is not populated with upcoming tracks.

### Observation 1.4: Surprise Me Discovery Engine
- In `script.js:7703-7740`, `triggerSurpriseMe()` is wired to `#dockSurpriseBtn`:
  ```javascript
  var moodPool = (typeof MoodUniverseEngine !== 'undefined' && MoodUniverseEngine.stations && MoodUniverseEngine.stations.length)
    ? MoodUniverseEngine.stations
    : (typeof MOOD_STATIONS !== 'undefined' && MOOD_STATIONS.length ? MOOD_STATIONS : null);

  if (moodPool && moodPool.length) {
    var randomMood = moodPool[Math.floor(Math.random() * moodPool.length)];
    if (typeof MoodUniverseEngine !== 'undefined' && MoodUniverseEngine.playMoodStation) {
      MoodUniverseEngine.playMoodStation(randomMood);
    }
  }
  ```

### Observation 1.5: Progress Scrubber & Time Updates
- In `script.js:7827-7840`, `#progressBar` only has a `'click'` event listener:
  ```javascript
  var progressBar = $('progressBar');
  if (progressBar) {
    progressBar.addEventListener('click', function (e) {
      if (!player || !apiReady) return;
      claimAudioMaster();
      var rect = progressBar.getBoundingClientRect();
      var percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      var dur = player.getDuration ? player.getDuration() : 0;
      if (dur > 0) {
        player.seekTo(dur * percent, true);
        if ($('progressFill')) $('progressFill').style.width = (percent * 100) + '%';
        if ($('progressHandle')) $('progressHandle').style.left = (percent * 100) + '%';
      }
    });
  }
  ```
- In `script.js:7962-7985`, a 250ms `setInterval` unconditionally recalculates `pct = (cur / dur) * 100` and writes `_progressFill.style.width` and `_progressHandle.style.left` if `isPlaying()`.
- In `style.css`, `.progress-container`, `.progress-bar-wrap`, `.progress-track`, `.progress-fill`, and `.progress-handle` are declared twice: at lines `1469-1540` and `8159-8210`.

---

## 2. Logic Chain

1. **Audio Engine Initialization & Lifecycle**:
   - `loadApi()` reliably resolves the YouTube API promise even in slow networks via interval polling and timeout fallbacks (Observation 1.1).
   - Off-screen iframe container `#playerA` properly sets standard `playerVars` to minimize overhead for audio-first streaming (Observation 1.1).
   - State handling properly manages playback events, but when new songs load, YouTube resets playback rate to 1.0. Because `setPlaybackRate` is omitted from `onState` / track load, UI speed chip drifts out of sync with actual audio playback (Observation 1.2).

2. **Stations & Queue Resilience**:
   - Master stations and Mood Universe stations assemble large shuffled queues (80–150 tracks) and transition continuously through `onState(ENDED)` → `skip('next')` (Observation 1.3).
   - `#dockSurpriseBtn` correctly connects to `triggerSurpriseMe()`, selecting randomly from 44 mood stations (Observation 1.4).
   - When playing individual YouTube Explorer search results via `playSingleTrack()`, queue continuity breaks after 1 track because `currentTrackQueue` is not initialized and `STATION_TRACKS['explorer']` does not exist (Observation 1.3).

3. **Scrubber Mechanics & Jitter**:
   - The scrubber lacks drag/touch event listeners, preventing dragging (Observation 1.5).
   - Seeking suffers from rubber-banding jitter because YouTube's `seekTo` is asynchronous, and the 250ms interval immediately pulls the scrubber fill and handle back to the old pre-seek time until the player finishes buffering (Observation 1.5).

---

## 3. Caveats

- **No Caveats.** Investigation covered all requested focus areas across `script.js`, `index.html`, `style.css`, and `stations.json` with full line and code citations.

---

## 4. Conclusion

The Audio Engine and Station pipelines are robust and well-structured, but contain 4 specific technical defects requiring targeted improvements:
1. **Playback Speed Persistence**: Add speed re-application (`player.setPlaybackRate(currentSpeed)`) in `onState(YT.PlayerState.PLAYING)`.
2. **Queue Continuity for Explorer / Single Tracks**: Populate `currentTrackQueue` in `playSingleTrack()` using recommendations/catalog so playback never halts after a single song.
3. **Scrubber Drag & Smooth Seeking**: Add Pointer Events (`pointerdown`, `pointermove`, `pointerup`) on `#progressBar` and suppress the 250ms tracking loop overwrite for 400ms after seeking to eliminate rubber-banding jitter.
4. **CSS Consolidation**: Remove duplicate `.progress-` rule declarations in `style.css:8159-8210`.

---

## 5. Verification Method

To independently verify these findings:
1. **Speed Reset**: Inspect `script.js:8048-8070` and `script.js:6042-6065` — observe that `player.setPlaybackRate` is only called on button click, not on track change.
2. **Explorer Queue Halting**: Inspect `script.js:2019-2055` — observe that `playSingleTrack` does not set `currentTrackQueue`.
3. **Scrubber Drag Missing**: Search `script.js` for `addEventListener('mousedown'`, `addEventListener('mousemove'`, `addEventListener('pointerdown'` on `progressBar` — observe that only a `'click'` listener exists at line `7829`.
4. **Duplicate CSS**: Search `style.css` for `.progress-track` — observe matches at lines `1499` and `8178`.
