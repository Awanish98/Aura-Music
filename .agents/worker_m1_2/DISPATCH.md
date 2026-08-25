## 2026-08-25T19:40:07Z
You are teamwork_preview_worker for Milestone 1 (M1: Static Integrity & DOM Repair).
Your working directory is: `p:\Agents\ishq-radio-2.0\.agents\worker_m1_2`
Read the authoritative user request at: `p:\Agents\ishq-radio-2.0\.agents\ORIGINAL_REQUEST.md` and `p:\Agents\ishq-radio-2.0\ORIGINAL_REQUEST.md`.
Read the project specification at: `p:\Agents\ishq-radio-2.0\PROJECT.md`.
Read Explorer findings at:
- `p:\Agents\ishq-radio-2.0\.agents\teamwork_preview_explorer_survey_1\analysis.md`
- `p:\Agents\ishq-radio-2.0\.agents\teamwork_preview_explorer_survey_1\handoff.md`
Workspace root: `p:\Agents\ishq-radio-2.0`

Your mission:
Implement all changes for Milestone 1:
1. **F1: Event Listener Hardening & Surprise Me Wiring**:
   - Ensure `#dockSurpriseBtn` is reliably connected to `triggerSurpriseMe()` with glowing feedback (`.surprise-active`) and plays random mood from `MoodUniverseEngine.stations` / `MOOD_STATIONS`.
   - Remove orphaned handler for non-existent `#heroSurpriseBtn` (`script.js:8162`).
   - Add defensive null-guards to the 9 unguarded `addEventListener` calls (`homeJamStatusPill`, `homeChatToggleBtn`, `homeQuickChatCloseBtn`, `homeQuickChatSendBtn`, `homeQuickChatInput`, `premiumMenuToggle`, `closeSidebarBtn`, `sidebarBackdrop`, `sidebarLoginBtn`).
   - Wrap `JSON.parse(localStorage.getItem('ishq_liked_songs'))` in `try/catch` with fallback default (`script.js:216`).
   - Prune dead/unused JS functions (`handleUniverseSearch`, `triggerAiDj`).
2. **F2: HTML DOM Structure Repair**:
   - Fix `#extrasModal` in `index.html`: remove premature closing `</div></div></div>` at line 1151 and cleanly purge the duplicate/malformed modal markup in lines 1152–1325. Ensure correct tag nesting and clean hierarchy.
3. **F3: Dead Code & CSS Selector Pruning**:
   - Remove the 152 dead CSS selector rules identified in Survey 1 (such as `.tonearm-*`, `.vinyl-*`, `.global-floating-back-btn`, `.manage-stations-link`).
4. **F4: Cache Version Synchronization**:
   - Bump version to `v123.0` across all 4 locations: `sw.js` (`CACHE_NAME`), `index.html` (`style.css?v=123.0` and `script.js?v=123.0`), and `script.js` (cache cleanup comparison).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Verify your changes using node scripts/syntax checks.
Deliver your report to `p:\Agents\ishq-radio-2.0\.agents\worker_m1_2\handoff.md` and notify via send_message when complete.
