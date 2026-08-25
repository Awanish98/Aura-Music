# Project: Aura Music — Comprehensive Enhancement & Quality Assurance

## Architecture
Aura Music is a premium web audio streaming Progressive Web App (PWA) with the following core architectural layers:
1. **Presentation & DOM Layer (`index.html`, `style.css`)**:
   - High-fidelity glassmorphic UI with floating header, background visual layers (atmospheric canvas, kinetic glyphs), main audio player card, visualizer canvas, bottom floating dock, and modal overlays.
2. **Audio & Playback Engine (`script.js`)**:
   - `DualAudioEngine` & YouTube IFrame API integration with playback queue management, autoplay fallback, volume/mute control, audio rate pitch manipulation (1.0x, 1.25x, 0.85x), and progress scrubber seek mechanics.
3. **Atmospheric & Visual Engines (`script.js`, `style.css`)**:
   - `SkyEngine` for real-time and theme-driven weather/climate canvas particle simulation (rain, snow, fog, stars) and lightning effects.
   - Dynamic Kinetic Background Glyphs system for luxury ambient typography and theme harmonization.
4. **Stations & Discovery Pipelines (`script.js`, `stations.json`)**:
   - 40+ AI Mood Stations, Master Stations, YouTube Explorer, and Instant Surprise Me serendipity engine.
5. **PWA & Offline Service Layer (`sw.js`)**:
   - Cache-first strategy for static shell assets with synchronized multi-file cache versioning.

## Code Layout
- `index.html`: Main single-page application shell, audio harness, modal dialogs, and SVG icons.
- `script.js`: Complete application logic, audio engines, event handling, animations, and mood universe.
- `style.css`: Comprehensive glassmorphic styling, responsive layout definitions, typography, animations, and modal overlays.
- `sw.js`: Service worker caching lifecycle and offline caching rules.
- `stations.json`: Catalog of curated music stations and track configurations.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Surprise Me Discovery & Event Hardening | Wire `#dockSurpriseBtn`, prune dead `#heroSurpriseBtn`, guard 9 event listeners, wrap `JSON.parse` | M1 | Survey 1, Request R1 |
| F2 | DOM Structural Repair | Purge premature tag closure and duplicate modal fragments (lines 1152-1325) in `index.html` | M1 | Survey 1, Request R4 |
| F3 | Dead Code & CSS Pruning | Remove 152 dead CSS selectors and 4 unused JS functions | M1 | Survey 1, Request R4 |
| F4 | Cache Version Synchronization | Bump version to `v123.0` across `sw.js`, `index.html` (x2), and `script.js` | M1 / M4 | Survey 1, Request R4 |
| F5 | Playback Speed Persistence | Ensure `player.setPlaybackRate` is re-applied on track change in `onState(PLAYING)` | M2 | Survey 2, Request R2 |
| F6 | Explorer Queue Continuity | Populate continuous queue for single-track plays in `playSingleTrack()` | M2 | Survey 2, Request R2 |
| F7 | Smooth Scrubber Drag & Seek Precision | Add Pointer Events (`pointerdown/move/up`) and 400ms seek-cooldown against interval overwrite | M2 | Survey 2, Request R2 |
| F8 | Cinematic Background Glyphs | Implement luxury kinetic drift keyframes (38s-54s), 3-tier blur, and `clamp()` typography | M3 | Survey 3, Request R2 |
| F9 | Weather Particle Canvas & Lightning | Restore recursive RAF, remove mobile kill-switch, add fog rendering, style lightning flash, export `setSkyTheme` | M3 | Survey 3, Request R3 |
| F10 | Mobile Dock & Header Layout (360px-420px) | Prevent horizontal overflow on small viewports, ensure ≥40px touch targets, resolve header collision | M4 | Survey 3, Request R3 |
| F11 | Modal Accessibility & Dismissibility | Add backdrop click and Escape key dismiss handlers across all 11 modals/drawers | M4 | Survey 3, Request R3 |
| F12 | End-to-End Test Suite & Verification | Automated test suite covering Tiers 1-4 with pass validation | M5 | Request ACs |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Static Integrity & DOM Repair | F1 (Event hardening, Surprise Me), F2 (DOM repair), F3 (Dead code pruning), F4 (Initial cache sync) | none | PLANNED |
| M2 | Audio Engine & Scrubber Polish | F5 (Speed persistence), F6 (Queue continuity), F7 (Scrubber drag & smooth seek) | M1 | PLANNED |
| M3 | Visual Atmospheric Engines | F8 (Cinematic background glyphs), F9 (Weather canvas & lightning) | M1 | PLANNED |
| M4 | Mobile UX & Modal Accessibility | F10 (Mobile dock & header layout), F11 (Modal dismiss handlers), F4 (Final cache sync) | M2, M3 | PLANNED |
| M5 | E2E Testing & Final Acceptance | F12 (Tiers 1-4 test execution, live validation, adversarial hardening) | M4 | PLANNED |

## Interface Contracts
### `DualAudioEngine` ↔ YouTube Player
- `DualAudioEngine.init(playerA, playerB)`: Attaches to active YouTube player iframe.
- `onState(YT.PlayerState.PLAYING)`: Re-applies active `currentSpeedMode` (1.0x, 1.25x, 0.85x) to maintain user setting across track boundaries.
- `playSingleTrack(track)`: Initializes `currentTrackQueue` with upcoming station/genre tracks to guarantee endless playback.

### `SkyEngine` ↔ Application & Command Palette
- `SkyEngine.setTheme(themeName, forceActive)`: Updates active weather simulation and triggers particle recalculation.
- `SkyEngine.renderParticles()`: Executes continuous 60fps RAF loop on desktop and throttled 30fps loop on mobile with non-zero particle density.
- `SkyEngine.triggerLightning()`: Adds `.flash` class to `#lightningFlash` with CSS opacity transition.

### Modals & Drawers ↔ User Input
- All modals (`#extrasModal`, `#skyControlModal`, `#shortcutsModal`, `#premiumSidebarMenu`, `#explorerUniverseView`, `#queuePanel`, `#cinemaVideoModal`) must close on backdrop click (`e.target === modal`) and Escape keydown.
