# BRIEFING — 2026-08-25T19:42:00Z

## Mission
Implement Milestone 1 (M1: Static Integrity & DOM Repair) covering F1 (Event hardening & Surprise Me wiring), F2 (DOM structural repair), F3 (Dead code & CSS selector pruning), and F4 (Cache version synchronization to v123.0).

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: p:\Agents\ishq-radio-2.0\.agents\worker_m1_2
- Original parent: 35c98dac-51a4-4994-87a0-97bfb20ec6a1
- Milestone: M1 (Static Integrity & DOM Repair)

## 🔒 Key Constraints
- Follow minimal change principle: no unrelated refactoring.
- Maintain real state and produce real behavior — DO NOT cheat or hardcode dummy tests.
- Re-read files before modifying.
- Run node verification scripts / syntax checks before reporting completion.
- Ensure all 4 cache version locations are updated to v123.0 simultaneously.

## Current Parent
- Conversation ID: 35c98dac-51a4-4994-87a0-97bfb20ec6a1
- Updated: 2026-08-25T19:42:00Z

## Task Summary
- **What to build**:
  1. F1: Ensure `#dockSurpriseBtn` is reliably connected to `triggerSurpriseMe()` with glowing feedback (`.surprise-active`) and random mood playback. Remove orphaned `#heroSurpriseBtn` handler. Add defensive null-guards to 9 unguarded `addEventListener` calls (`homeJamStatusPill`, `homeChatToggleBtn`, `homeQuickChatCloseBtn`, `homeQuickChatSendBtn`, `homeQuickChatInput`, `premiumMenuToggle`, `closeSidebarBtn`, `sidebarBackdrop`, `sidebarLoginBtn`). Wrap `JSON.parse(localStorage.getItem('ishq_liked_songs'))` in `try/catch` with fallback default. Prune dead/unused JS functions (`handleUniverseSearch`, `triggerAiDj`).
  2. F2: Fix `#extrasModal` in `index.html`: remove premature closing `</div></div></div>` at line 1151 and cleanly purge duplicate/malformed modal markup in lines 1152–1325. Ensure correct tag nesting and clean hierarchy.
  3. F3: Remove 152 dead CSS selector rules identified in Survey 1 (such as `.tonearm-*`, `.vinyl-*`, `.global-floating-back-btn`, `.manage-stations-link`).
  4. F4: Bump version to `v123.0` across all 4 locations: `sw.js` (`CACHE_NAME`), `index.html` (`style.css?v=123.0` and `script.js?v=123.0`), and `script.js` (cache cleanup comparison).
- **Success criteria**:
  - `#dockSurpriseBtn` works without console errors, has visual feedback, plays random mood station.
  - Zero unhandled exceptions in event listeners or startup parsing.
  - `#extrasModal` has valid, cleanly nested HTML DOM structure without orphaned or duplicate tab panes.
  - Dead CSS rules and dead JS functions pruned.
  - Cache version synchronized to `v123.0` across all 4 files.
  - Node syntax and validation scripts pass with 0 errors.
- **Interface contracts**: `PROJECT.md`
- **Code layout**: `PROJECT.md § Code Layout`

## Key Decisions Made
- Use defensive `if (el) el.addEventListener(...)` checks for all targeted event listeners.
- Use safe `try/catch` wrapper around `localStorage` JSON parsing.
- Validate DOM tree hierarchy after `#extrasModal` cleanup.
- Keep all active styles and rules untouched.

## Artifact Index
- `p:\Agents\ishq-radio-2.0\.agents\worker_m1_2\DISPATCH.md` — Dispatch instructions
- `p:\Agents\ishq-radio-2.0\.agents\worker_m1_2\BRIEFING.md` — Situational awareness
- `p:\Agents\ishq-radio-2.0\.agents\worker_m1_2\progress.md` — Progress tracker
- `p:\Agents\ishq-radio-2.0\.agents\worker_m1_2\handoff.md` — Final handoff report

## Change Tracker
- **Files modified**: None yet
- **Build status**: Pending
- **Pending issues**: None

## Quality Status
- **Build/test result**: Not yet executed
- **Lint status**: Not yet executed
- **Tests added/modified**: Static verification script

## Loaded Skills
None required for M1.
