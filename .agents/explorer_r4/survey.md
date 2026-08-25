# Aura Music — Comprehensive R4 Survey & Codebase Audit Report

**Date**: 2026-08-25  
**Investigator**: Explorer R4 Agent  
**Scope**: Full Codebase Review, Dead Code Cleanup, 390px Responsive Dock & Controls, Service Worker Cache Versioning, Testing Setup  
**Target Files**: `index.html`, `script.js`, `style.css`, `sw.js`, `admin.js`, `admin.html`

---

## Executive Summary

This survey provides an exhaustive forensic audit of the entire Aura Music codebase to fulfill Requirement R4 (Full Project Review & Polish, Dead Code Cleanup, 390px Mobile Ergonomics, SW Cache Versioning, and Testing Baseline).

### Key Findings at a Glance:
1. **Dead JS Event Listeners & Orphaned Selectors**: Identified multiple dead element listeners (e.g., `#heroSurpriseBtn` in `script.js` lines 7904–7920, `#globalFloatingBackBtn` at line 2438, `.stage-visual` at line 7624, `#extrasBtn` at line 5377) targeting elements deleted from `index.html`.
2. **Unwired Buttons**: `#dockSurpriseBtn` (line 442 in `index.html`), `#shuffleBtn` (line 430), and `#waveVol` (line 658) are present in the DOM but lack active click/input event handlers in `script.js`.
3. **Severe HTML Corruption & Duplicate DOM IDs**: Found ~35 lines of dead HTML fragments (lines 968–1001) with duplicate `id="glyphModeChips"` and unmatched `</div>` tags, plus a duplicate Jam room block (lines 1030–1143) creating 11+ duplicate DOM IDs (`#jamSetupView`, `#startJamHostBtn`, `#jamRoomCodeInput`, `#joinJamBtn`, `#jamActiveView`, `#activeJamCodeText`, `#copyJamLinkBtn`, `#jamPeersList`, `#jamHostName`, `#leaveJamBtn`).
4. **Massive Orphaned CSS (970+ lines)**: Located 733 lines of dead Nothing Phone Glyph Matrix CSS (lines 7988–8720), 134 lines of dead Visualizer Studio CSS (lines 8815–8948), 50 lines of Hero Surprise Me CSS (lines 8996–9045), and 51 lines of Global Back Button CSS (lines 2368–2415).
5. **Mobile 390px Viewport Dock Clipping/Overflow**: Unscoped `!important` overrides at lines 9241–9300 force the bottom controls dock to a width of **512px**, overflowing a 390px mobile screen (iPhone 12/13/14/15/16/Pro) by **122px** and clipping buttons off-screen.
6. **Service Worker Versioning**: Confirmed current version is `aura-music-v117.0` (present in 4 distinct file locations) and documented exact bump steps to `aura-music-v118.0`.

---

## 1. Dead Code & Orphaned Inventory

### 1.1 Dead / Orphaned JS Event Listeners & Selectors in `script.js`

| Location | Identifier / Code | Status | Action Required |
|---|---|---|---|
| `script.js:7904–7920` | `var heroSurpriseBtn = $('heroSurpriseBtn');`<br>`heroSurpriseBtn.addEventListener('click', ...)` | **DEAD**: `#heroSurpriseBtn` was deleted from `index.html`. | Replace with `#dockSurpriseBtn` event listener to fulfill R1. |
| `script.js:2438–2445` | `var globalFloatingBackBtn = $('globalFloatingBackBtn');`<br>`globalFloatingBackBtn.addEventListener('click', ...)` | **DEAD**: `#globalFloatingBackBtn` does not exist in `index.html`. | Remove unused listener block. |
| `script.js:7624–7625` | `var stageVisual = document.querySelector('.stage-visual');`<br>`stageVisual.addEventListener('click', togglePlay);` | **DEAD SELECTOR**: No DOM element in `index.html` has class `.stage-visual`. | Remove or target existing `.stage` / `.turntable-wrap`. |
| `script.js:5377, 5400, 7590` | `var openBtn = $('extrasBtn');`<br>`['extrasBtn', ...].forEach(...)` | **ORPHANED ID**: `#extrasBtn` was removed from the sidebar. | Clean up reference from array and listener. |
| `script.js:7455–7461, 7474` | `var GlyphMatrixEngine = { init: function() {}, ... };`<br>`GlyphMatrixEngine.init();` | **EMPTY STUB**: Visualizer was removed; stub remains. | Safely prune stub if not needed, or keep minimal no-op. |

### 1.2 Unwired / Missing JS Listeners for DOM Elements in `index.html`

| DOM Element | `index.html` Location | Issue | Recommended Fix |
|---|---|---|---|
| `#dockSurpriseBtn` | `index.html:442` | Surprise Me button in bottom dock has NO event listener in `script.js`. | Wire click listener to trigger `MoodUniverseEngine.playMoodStation(picked)` or random song with tactile haptic feedback and glowing animation. |
| `#shuffleBtn` | `index.html:430` | Shuffle button in bottom dock has `active-btn` class but NO event listener in `script.js`. | Add toggle listener that toggles shuffle state / toast feedback. |
| `#waveVol` | `index.html:658` | "Ocean Waves" ambient slider in `#ambientPanel` has no handler in Web Audio ambient engine. | Wire to ambient synthesizer oscillator/gain or remove slider. |

---

## 2. HTML Defects & Structural Issues in `index.html`

### 2.1 Orphaned Toolbar Fragments (`index.html:968–1001`)
Between `#lyricsModal` (line 965) and `#commandPaletteModal` (line 1004), there are leftover DOM fragments from removed modals:
```html
968:      </div>
972:      <!-- Mode Switcher Toolbar -->
973:      <div class="glyph-footer-bar visualizer-footer-bar">
974:        <div class="glyph-mode-chips" id="glyphModeChips">
975:          <button class="glyph-chip active" data-glyph-mode="spectrum">📊 NEON SPECTRUM</button>
...
984:    </div>
985:  </div>
987:      <!-- Glyph Mode Switcher Toolbar -->
988:      <div class="glyph-footer-bar">
989:        <div class="glyph-mode-chips" id="glyphModeChips">
...
999:    </div>
1000: </div>
```
- **Defects**:
  - Unmatched closing `</div>` tags breaking DOM tree hierarchy.
  - Duplicate `id="glyphModeChips"` on lines 974 and 989.
  - Orphaned buttons with no active visualizer container.
- **Remedy**: Delete lines 968–1001 entirely.

### 2.2 Duplicated `#extrasModal` & Jam Room (`index.html:1030–1312`)
- **Structure**:
  - `index.html:1030–1143`: A standalone copy of `#extrasModal` containing only Jam Room.
  - `index.html:1145–1148`: A dangling footer (`#resetEqBtn`).
  - `index.html:1150–1312`: The real tabbed container with `#tab-timer`, `#tab-mini`, and `#tab-jam`.
- **Resulting Duplicate IDs**:
  - `#extrasModal` (lines 1031 & 1143)
  - `#jamSetupView` (lines 1046 & 1213)
  - `#startJamHostBtn` (lines 1051 & 1218)
  - `#jamRoomCodeInput` (lines 1061 & 1228)
  - `#joinJamBtn` (lines 1063 & 1229)
  - `#jamActiveView` (lines 1068 & 1235)
  - `#activeJamCodeText` (lines 1072 & 1239)
  - `#copyJamLinkBtn` (lines 1073 & 1240)
  - `#jamPeersList` (lines 1088 & 1255)
  - `#jamHostName` (lines 1082 & 1249)
  - `#leaveJamBtn` (lines 1137 & 1304)
- **Remedy**: Consolidate into a clean, unified `#extrasModal` and remove the redundant first block.

### 2.3 Trailing Blank Lines (`index.html:1541–1598`)
- Over 57 blank lines at the end of `index.html` before `</body>`. Clean up for crisp formatting.

---

## 3. Orphaned CSS Inventory in `style.css`

Over **968 lines** of dead CSS rules were identified targeting deleted elements:

| CSS Block Description | Line Range in `style.css` | Line Count | Target Selectors |
|---|---|---|---|
| **Nothing Phone Glyph Matrix & Dot Play** | `7988–8720` | **733 lines** | `.glyph-matrix-modal`, `.glyph-matrix-container`, `.glyph-header`, `.glyph-dot-rec`, `.glyph-top-diag`, `.glyph-bottom-bar`, `.glyph-bottom-dot`, `.nothing-phone-body`, `.glyph-strip`, `.glyph-live-bpm`, `.glyph-mode-pill`, `.glyph-chip`, `.glyph-matrix-modal.theme-*` |
| **Live Audio Visualizer Studio** | `8815–8948` | **134 lines** | `.visualizer-studio-modal`, `.visualizer-container`, `.visualizer-stage`, `.visualizer-canvas-card`, `.visualizer-track-overlay`, `.viz-track-badge`, `.visualizer-studio-modal.theme-*` |
| **Hero Section Surprise Me Button** | `8996–9045`, `9072` | **50 lines** | `.hero-surprise-btn`, `.hero-dice-icon` |
| **Global Floating Back Button** | `2368–2415`, `8967–8969` | **51 lines** | `.global-floating-back-btn` |
| **Deleted Modal/Card Performance Overrides** | `9058–9075` | **~15 lines** | `.bento-card`, `.exp-uni-header`, `.shortcuts-card`, `.sky-card`, `.glass-modal-card`, `.sky-canvas` |

**Total Dead CSS**: ~983 lines. Pruning these dead rules will reduce stylesheet weight by ~25KB and improve CSSOM parsing time.

---

## 4. Mobile 390px Viewport Responsive Dock & Controls Layout

### 4.1 Diagnosis of Dock Overflow at 390px

At the bottom of `style.css` (lines 9241–9300), an unconstrained override block applies `!important` to dock elements across all screen widths:
```css
.controls-glass {
  padding: 6px 14px !important;
  display: inline-flex !important;
  gap: 8px !important;
}
.dock-core, .dock-wing, .dock-wing-left, .dock-wing-right {
  display: flex !important;
  gap: 8px !important;
}
.ctrl-btn {
  width: 40px !important;
  height: 40px !important;
}
.ctrl-btn.play-btn {
  width: 52px !important;
  height: 52px !important;
}
```

#### Total Width Calculation on 390px Viewport:
- **Left Wing** (`.dock-wing-left`): `#shuffleBtn` (40px) + `#dockSurpriseBtn` (40px) + `#eqDockBtn` (40px) + 2 gaps (16px) = **136px**
- **Center Core** (`.dock-core`): `#prev` (40px) + `#play` (52px) + `#next` (40px) + 2 gaps (16px) = **148px**
- **Right Wing** (`.dock-wing-right`): `#watchVideoBtn` (40px) + `#lyricsToggleBtn` (40px) + `#lrcGodDockBtn` (40px) + `#fsbtn` (40px) + 3 gaps (24px) = **184px**
- **Dock Total**: 136px + 8px gap + 148px + 8px gap + 184px + 28px padding = **512px**!

**Result**: On a 390px mobile screen (e.g. iPhone 12/13/14/15/16 Pro), a 512px dock overflows horizontally by **122px**, causing critical buttons (`#fsbtn`, `#shuffleBtn`) to be clipped off-screen and horizontal scrolling/jitter.

### 4.2 Recommended Responsive Fix for <= 480px and 390px

Add dedicated, high-specificity mobile responsive rules:
```css
@media (max-width: 480px) {
  .controls-glass {
    gap: 4px !important;
    padding: 4px 8px !important;
    max-width: 96vw !important;
    width: auto !important;
  }
  
  .dock-core,
  .dock-wing,
  .dock-wing-left,
  .dock-wing-right {
    gap: 4px !important;
  }

  .ctrl-btn {
    width: 29px !important;
    height: 29px !important;
  }

  .ctrl-btn svg {
    width: 13px !important;
    height: 13px !important;
  }

  .ctrl-btn.side-btn {
    width: 32px !important;
    height: 32px !important;
  }

  .ctrl-btn.play-btn {
    width: 44px !important;
    height: 44px !important;
  }

  .ctrl-btn.play-btn svg {
    width: 17px !important;
    height: 17px !important;
  }

  .volume-flyout {
    display: none !important;
  }
}

@media (max-width: 360px) {
  .controls-glass {
    gap: 3px !important;
    padding: 3px 6px !important;
  }
  .ctrl-btn {
    width: 26px !important;
    height: 26px !important;
  }
  .ctrl-btn.play-btn {
    width: 40px !important;
    height: 40px !important;
  }
}
```

#### Resulting Mobile Width Calculation (at 390px):
- Left wing: (3 * 29) + (2 * 4) = 95px
- Center core: 32 + 44 + 32 + (2 * 4) = 116px
- Right wing: (4 * 29) + (3 * 4) = 128px
- Gaps & padding: (2 * 4) + 16 = 24px
- **Total**: 95 + 116 + 128 + 24 = **363px** <= **Perfect fit on 390px screen with 27px margin safety!**

---

## 5. Service Worker Cache Versioning Audit & Bump Plan

### 5.1 Current Audit

| File | Line Number | Current Code |
|---|---|---|
| `sw.js` | Line 1 | `var CACHE_NAME = 'aura-music-v117.0';` |
| `script.js` | Line 194 | `if (name !== 'aura-music-v117.0') caches.delete(name);` |
| `index.html` | Line 15 | `<link rel="stylesheet" href="style.css?v=117.0">` |
| `index.html` | Line 1540 | `<script src="script.js?v=117.0"></script>` |

### 5.2 Next Bump Plan (v118.0)

Synchronously update all 4 locations to `118.0`:
1. `sw.js:1` → `var CACHE_NAME = 'aura-music-v118.0';`
2. `script.js:194` → `if (name !== 'aura-music-v118.0') caches.delete(name);`
3. `index.html:15` → `<link rel="stylesheet" href="style.css?v=118.0">`
4. `index.html:1540` → `<script src="script.js?v=118.0"></script>`

Also clean up 26 blank lines at the top of `sw.js`.

---

## 6. Testing Baseline & Verification Protocol

1. **Syntax Integrity**:
   - `node -c script.js` (must exit 0 with zero syntax errors)
   - `node -c sw.js` (must exit 0)
   - `node -c admin.js` (must exit 0)
2. **HTML DOM Validation**:
   - Check all closing tags match.
   - Verify zero duplicate DOM IDs across `index.html`.
3. **Console Diagnostics**:
   - Verify page load triggers zero `TypeError: null is not an object` or `addEventListener of null` errors.
4. **Dock Touch & Click Interaction**:
   - Test clicking `#dockSurpriseBtn`, `#shuffleBtn`, `#eqDockBtn`, `#prev`, `#play`, `#next`, `#watchVideoBtn`, `#lyricsToggleBtn`, `#lrcGodDockBtn`, `#fsbtn`.
5. **Mobile Viewport Emulation**:
   - Test responsive layout at 360px, 390px, 414px, 768px, and 1440px widths to verify zero horizontal scroll bar and zero button clipping.
