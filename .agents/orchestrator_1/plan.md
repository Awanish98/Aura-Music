# Master Orchestration Plan — Aura Music 2.0

## Overview
Executing the comprehensive bug fix, visual upgrade, and quality review for the Aura Music web app across HTML, JS, CSS, and Service Worker.

## Objectives
1. **R1: Fix Surprise Me Button**: Wire `#dockSurpriseBtn` to pick random mood station or random song with glowing click animation and zero errors.
2. **R2: Premium Background Animated Glyphs**: Make `#bgGlyphs` larger, smoother (30s drift), elegant blur/depth, and reactive to station/mood theme.
3. **R3: Fix Weather/Climate Animations**: Fix `#weatherCanvas` and `#lightningFlash` particle rendering for rain, snow, fog, stars, thunderstorm with smooth 30+ FPS.
4. **R4: Full Codebase Polish & Mobile Responsive**: Clean dead CSS/JS listeners, ensure dock displays cleanly on 390px screens, bump SW cache across sw.js, index.html, script.js.
5. **Verification & Git Operations**: Run automated tests, verify no console errors, commit and push to `main` branch.

## Execution Strategy
- **Phase 0: Survey**: 3 parallel Explorers to investigate current state of all 4 key areas.
- **Phase 1: Project Plan & E2E Test Suite**: Generate `PROJECT.md` and `TEST_INFRA.md`.
- **Phase 2: Milestone Iteration Loops**:
  - Explorer -> Worker -> Reviewer -> Challenger -> Auditor -> Gate check.
- **Phase 3: E2E Verification & Git Push**: Final validation and commit/push.
