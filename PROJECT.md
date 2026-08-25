# Project: Aura Music 2.0 Web App

## Architecture
Aura Music is a premium Progressive Web Application (PWA) built with vanilla modern HTML5, CSS3, JavaScript ES6+, Web Audio API, Canvas 2D rendering, and Service Worker offline caching.
- **Frontend Presentation Layer (`index.html`)**: Glassmorphism UI, bottom glass dock, full-screen canvas layers (`#bgCanvas`, `#weatherCanvas`), atmospheric background glyph typography (`#bgGlyphs`), lightning flash overlay (`#lightningFlash`).
- **Core State & Audio Engine (`script.js`)**:
  - `MoodUniverseEngine`: Mood stations, mood switching, audio streaming queue, playback controls.
  - `SkyEngine`: Dynamic sky/weather Canvas 2D particle simulation (Rain, Snow, Fog, Stars, Thunderstorm) and lightning triggers.
  - `GlyphEngine`: Atmospheric typography rotation, station/mood theme integration, kinetic floating animations.
  - `DockController`: Bottom dock buttons, Surprise Me action, navigation tabs, responsive controls.
- **Visual & Layout Styling (`style.css`)**: Dark luxury theme, glowing accents, 390px mobile viewport responsive glass dock, multi-axis keyframe animations, 3-tier depth blur.
- **Service Worker (`sw.js`)**: Offline caching, asset versioning (`aura-music-v118.0`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Surprise Me Button Wiring | Wire `#dockSurpriseBtn` to `MoodUniverseEngine.playMoodStation()` or random song queue with zero errors | M1 | ORIGINAL_REQUEST §R1 |
| F2 | Surprise Me Visual Feedback | Add `.surprise-active` 3D dice-roll rotation and glowing pulse feedback on click | M1 | ORIGINAL_REQUEST §R1 |
| F3 | Premium Typography & Sizing | Upgrade `#bgGlyphs .glyph` to luxury typography with `clamp(2.5rem, 6vw, 5.5rem)`, uppercase tracking | M2 | ORIGINAL_REQUEST §R2 |
| F4 | Cinematic Kinetic Drift | Implement 38s-54s multi-axis float & drift CSS keyframe animations across glyphs | M2 | ORIGINAL_REQUEST §R2 |
| F5 | Multi-Tier Depth Blur & Opacity | Add 3-tier depth blur (0.5px to 2.2px) and opacity gradients for atmospheric depth | M2 | ORIGINAL_REQUEST §R2 |
| F6 | Dynamic Theme Integration | Dynamically update glyph text content and color accents when station or mood changes | M2 | ORIGINAL_REQUEST §R2 |
| F7 | Canvas RAF Animation Loop Fix | Restore recursive `requestAnimationFrame` call in `SkyEngine.renderParticles` | M3 | ORIGINAL_REQUEST §R3 |
| F8 | Mobile Weather Kill-Switch Fix | Remove restrictive mobile screen <=768px kill-switch to enable weather on mobile | M3 | ORIGINAL_REQUEST §R3 |
| F9 | Fog Atmospheric Rendering | Implement missing Fog particle drawing and drift logic in Canvas 2D | M3 | ORIGINAL_REQUEST §R3 |
| F10 | Thunderstorm Lightning Flash | Wire `#lightningFlash` trigger with natural stochastic intervals and smooth CSS opacity fade | M3 | ORIGINAL_REQUEST §R3 |
| F11 | SkyEngine API Export Fix | Export `setSkyTheme` on `SkyEngine` module to resolve Command Palette runtime `TypeError` | M3 | ORIGINAL_REQUEST §R3 |
| F12 | Dead JS Listeners Cleanup | Remove dead listeners for `#heroSurpriseBtn`, `#globalFloatingBackBtn`, `.stage-visual`, `extrasBtn` | M4 | ORIGINAL_REQUEST §R4 |
| F13 | HTML DOM & Duplicate ID Cleanup | Remove orphaned HTML fragments and duplicate Jam Room IDs in `index.html` | M4 | ORIGINAL_REQUEST §R4 |
| F14 | Dead CSS Elimination | Purge orphaned Nothing Phone matrix CSS, Visualizer Studio CSS, and dead button styles | M4 | ORIGINAL_REQUEST §R4 |
| F15 | 390px Mobile Dock Responsiveness | Adjust mobile dock width/gaps to <=363px to prevent overflow and button clipping on 390px screens | M4 | ORIGINAL_REQUEST §R4 |
| F16 | SW Cache Version Bump | Bump cache version consistently to `aura-music-v118.0` in `sw.js`, `script.js`, and `index.html` | M4 | ORIGINAL_REQUEST §Cache |
| F17 | Zero Console Errors & Clean Logs | Verify error-free initialization and interactions across all views | M4 | ORIGINAL_REQUEST §R4 |
| F18 | E2E Automated Verification | Complete Tier 1-4 automated testing suite validating all features | M5 | ORIGINAL_REQUEST §Criteria |
| F19 | Git Commit & Push | Commit all changes with clean commit log and push to `main` branch | M5 | ORIGINAL_REQUEST §Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Surprise Me Button (R1) | F1, F2 | none | PLANNED |
| M2 | Premium Animated Glyphs (R2) | F3, F4, F5, F6 | none | PLANNED |
| M3 | Weather & Climate Animations (R3) | F7, F8, F9, F10, F11 | none | PLANNED |
| M4 | Code Polish, 390px Dock, SW Bump (R4) | F12, F13, F14, F15, F16, F17 | M1, M2, M3 | PLANNED |
| M5 | E2E Testing & Git Push | F18, F19 | M1, M2, M3, M4 | PLANNED |

## Interface Contracts
### Surprise Me Button (`#dockSurpriseBtn` ↔ `MoodUniverseEngine`)
- Target element: `document.getElementById('dockSurpriseBtn')`
- Event: `click`
- Logic:
  ```js
  const surpriseBtn = document.getElementById('dockSurpriseBtn');
  if (surpriseBtn) {
    surpriseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      surpriseBtn.classList.add('surprise-active');
      setTimeout(() => surpriseBtn.classList.remove('surprise-active'), 800);
      if (typeof triggerHaptic === 'function') triggerHaptic('medium');
      if (window.MoodUniverseEngine && typeof MoodUniverseEngine.playMoodStation === 'function') {
        const stations = MoodUniverseEngine.stations || ['chill', 'focus', 'energy', 'romantic', 'ambient', 'cosmic'];
        const randomStation = stations[Math.floor(Math.random() * stations.length)];
        const moodId = typeof randomStation === 'object' ? (randomStation.id || randomStation.name) : randomStation;
        MoodUniverseEngine.playMoodStation(moodId);
      } else if (typeof playRandomStation === 'function') {
        playRandomStation();
      }
    });
  }
  ```

### SkyEngine & Weather Canvas Interface
- Exports: `SkyEngine = { init, setSkyTheme, setWeather, toggleWeather, isRunning, ... }`
- Particle Render Loop:
  ```js
  function renderParticles(timestamp) {
    if (!state.active) return;
    // draw weather particles (rain, snow, fog, stars)
    // check lightning condition and trigger #lightningFlash
    state.animationFrameId = requestAnimationFrame(renderParticles);
  }
  ```

### Glyph Engine Interface
- Target container: `#bgGlyphs`
- CSS Classes: `.bg-glyphs`, `.glyph`, `.heart-glyph`
- Dynamic Theme Update: `updateGlyphsForTheme(themeName, keywordsArray)`

## Code Layout
- `index.html`: Main HTML entry point, DOM structure, dock, canvas elements, SW registration.
- `style.css`: All CSS styling, keyframes, responsive media queries (`@media (max-width: 480px)` and `@media (max-width: 390px)`).
- `script.js`: Core client JS application logic, audio engine, canvas engines, UI handlers.
- `sw.js`: Service worker lifecycle and cache definitions (`CACHE_NAME = 'aura-music-v118.0'`).
