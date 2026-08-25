## 2026-08-25T17:35:57Z
You are a Test Writer agent for Aura Music 2.0.
Your Working Directory: p:\Agents\ishq-radio-2.0\.agents\test_writer_1
Workspace Root: p:\Agents\ishq-radio-2.0
Authoritative Request: p:\Agents\ishq-radio-2.0\ORIGINAL_REQUEST.md
Test Infra Spec: p:\Agents\ishq-radio-2.0\TEST_INFRA.md

MANDATORY: You MUST read ORIGINAL_REQUEST.md and TEST_INFRA.md before starting work.
You MUST NOT modify source code (index.html, script.js, style.css, sw.js). You ONLY create and run test files in tests/.

TASK: Build a complete, standalone, robust automated test suite in `p:\Agents\ishq-radio-2.0\tests\`.
The test suite must be runnable via `node tests/run_all_tests.js` (using Node.js built-in modules `fs`, `path`, `vm`, `assert`, regex/AST/DOM checks without requiring heavy external npm packages if possible, or standard node scripts).

Implement:
1. `tests/tier1_unit.js`:
   - Verify `#dockSurpriseBtn` exists in `index.html` and has click event listener attached in `script.js`.
   - Verify `#bgGlyphs` and `.glyph` typography and CSS keyframes exist in `style.css`.
   - Verify `#weatherCanvas` and `#lightningFlash` exist in `index.html`.
   - Verify `SkyEngine` exports `setSkyTheme` and has recursive `requestAnimationFrame` call in `script.js`.
   - Verify `sw.js` and `index.html` contain matching cache version string.
2. `tests/tier2_boundary.js`:
   - Verify mobile CSS rules: dock width at <=390px viewport fits cleanly (dock max-width / button widths + gaps <= 363px).
   - Verify glyph animation duration >= 30s in `style.css`.
   - Verify weather canvas particle bounds & velocity limits.
   - Verify dead CSS rules (Nothing Phone glyph matrix, visualizer studio, dead buttons) are purged or flagged.
3. `tests/tier3_integration.js`:
   - Test Surprise Me handler invocation triggers mood station or random song.
   - Test station/mood change updates background glyphs.
   - Test weather theme switching updates sky particle system and lightning flash on thunderstorm.
4. `tests/tier4_scenario.js`:
   - Full end-to-end integration check across HTML, JS, CSS, SW.
   - Verify zero syntax errors via `node -c script.js`, `node -c sw.js`.
   - Verify all acceptance criteria from ORIGINAL_REQUEST.md.
5. `tests/run_all_tests.js`:
   - Master runner that runs Tiers 1-4, tallies pass/fail, and prints a clear report.
6. When tests are written and ready to run, create `p:\Agents\ishq-radio-2.0\TEST_READY.md` with the runner command and coverage summary.
7. Write `p:\Agents\ishq-radio-2.0\.agents\test_writer_1\handoff.md` and send a message to parent when done.
