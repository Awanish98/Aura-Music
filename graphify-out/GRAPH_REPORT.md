# Graph Report - ishq-radio-2.0  (2026-08-24)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 149 nodes · 391 edges · 16 communities
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `80d2b825`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- init
- playSingleTrack
- admin.js
- script.js
- showToast
- update
- playMyVibesStation
- fetchLyrics
- startHost
- setSkyTheme
- switchStation
- openModal
- executeCrossfade
- initDraggable
- updateActiveLine

## God Nodes (most connected - your core abstractions)
1. `init()` - 35 edges
2. `showToast()` - 32 edges
3. `toggle()` - 16 edges
4. `update()` - 14 edges
5. `playSingleTrack()` - 13 edges
6. `playMyVibesStation()` - 10 edges
7. `renderVibeUI()` - 10 edges
8. `applyPreset()` - 9 edges
9. `switchStation()` - 8 edges
10. `skip()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `init()` --indirect_call--> `checkAlarm()`  [INFERRED]
  script.js → script.js  _Bridges community 0 → community 4_
- `init()` --indirect_call--> `onErr()`  [INFERRED]
  script.js → script.js  _Bridges community 0 → community 5_
- `init()` --indirect_call--> `startHost()`  [INFERRED]
  script.js → script.js  _Bridges community 0 → community 8_
- `playSingleTrack()` --indirect_call--> `update()`  [INFERRED]
  script.js → script.js  _Bridges community 1 → community 5_
- `playMyVibesStation()` --indirect_call--> `update()`  [INFERRED]
  script.js → script.js  _Bridges community 5 → community 6_

## Import Cycles
- None detected.

## Communities (16 total, 0 thin omitted)

### Community 0 - "init"
Cohesion: 0.16
Nodes (19): applyPreset(), backToOptions(), createReverbImpulse(), createVinylNoiseBuffer(), ensureAudioContext(), fsIcon(), init(), loadApi() (+11 more)

### Community 1 - "playSingleTrack"
Cohesion: 0.17
Nodes (16): addToQueue(), enterExplorerUniverse(), generateRecommendations(), handleUniverseSearch(), playSingleTrack(), renderLikedList(), renderSessionQueue(), renderUniverseCards() (+8 more)

### Community 2 - "admin.js"
Cohesion: 0.30
Nodes (12): deleteStation(), initAuth(), loadStations(), openCreateModal(), openEditModal(), renderStationsList(), saveStations(), setSourceMode() (+4 more)

### Community 3 - "script.js"
Cohesion: 0.15
Nodes (4): formatAlarmTime(), renderParticles(), setAlarm(), triggerLightning()

### Community 4 - "showToast"
Cohesion: 0.20
Nodes (15): cancelTimer(), checkAlarm(), clearAlarm(), close(), closeCinemaMode(), confirmGoogleSignIn(), leave(), logout() (+7 more)

### Community 5 - "update"
Cohesion: 0.22
Nodes (13): claimAudioMaster(), fmt(), hideAutoplayPrompt(), loadStationPlayback(), onErr(), onState(), openCinemaMode(), show() (+5 more)

### Community 6 - "playMyVibesStation"
Cohesion: 0.35
Nodes (12): addToMyVibes(), autoCurateNextVibes(), cleanTitle(), generateVibeRecommendations(), getMyVibesList(), getProfile(), learnFromTrack(), playMyVibesStation() (+4 more)

### Community 7 - "fetchLyrics"
Cohesion: 0.31
Nodes (9): cacheAndHandle(), fetchLyrics(), handleLyricsResult(), handlePlainLyricsResult(), parseLRC(), renderFallbackState(), renderLinesUI(), sanitizeQuery() (+1 more)

### Community 8 - "startHost"
Cohesion: 0.25
Nodes (8): broadcastState(), generateCode(), handleIncomingSync(), isPlaying(), joinRoom(), startHost(), togglePlay(), updatePeersUI()

### Community 9 - "setSkyTheme"
Cohesion: 0.29
Nodes (7): applyLiveWeatherData(), createParticle(), fetchLiveWeather(), initElements(), initParticles(), resize(), setSkyTheme()

### Community 10 - "switchStation"
Cohesion: 0.60
Nodes (5): applyStationTheme(), initStationDropdown(), loadStationsData(), switchStation(), syncCurrentStation()

### Community 11 - "openModal"
Cohesion: 0.50
Nodes (4): buildCommands(), closeModal(), openModal(), renderResults()

### Community 12 - "executeCrossfade"
Cohesion: 0.67
Nodes (4): checkCrossfade(), executeCrossfade(), getActivePlayer(), getStandbyPlayer()

### Community 13 - "initDraggable"
Cohesion: 1.00
Nodes (3): initDraggable(), onMouseMove(), onMouseUp()

### Community 14 - "updateActiveLine"
Cohesion: 0.67
Nodes (3): onTimeUpdate(), updateActiveLine(), updateOneLineLyric()

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `init()` connect `init` to `playSingleTrack`, `script.js`, `showToast`, `update`, `startHost`, `switchStation`, `initDraggable`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `initDraggable()` connect `initDraggable` to `init`, `script.js`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `showToast()` connect `showToast` to `init`, `playSingleTrack`, `script.js`, `update`, `playMyVibesStation`, `startHost`, `setSkyTheme`, `switchStation`, `openModal`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Are the 13 inferred relationships involving `init()` (e.g. with `backToOptions()` and `checkAlarm()`) actually correct?**
  _`init()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `update()` (e.g. with `loadStationPlayback()` and `playMyVibesStation()`) actually correct?**
  _`update()` has 4 INFERRED edges - model-reasoned connections that need verification._