# E2E Test Infra: Aura Music 2.0

## Test Philosophy
- Opaque-box & Requirement-driven.
- Automated static, AST, DOM structure, CSS layout, Canvas 2D simulation, and integration tests.
- Execution via Node.js test runner `node tests/run_all_tests.js`.

## Feature Inventory & Test Coverage Mapping
| # | Feature | Requirement | Tier 1 (Unit) | Tier 2 (Boundary) | Tier 3 (Integration) | Tier 4 (Scenario) |
|---|---------|-------------|:-------------:|:-----------------:|:--------------------:|:-----------------:|
| 1 | F1-F2 (Surprise Me Button) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 2 | F3-F6 (Background Glyphs) | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 3 | F7-F11 (Weather Animations) | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 4 | F12-F17 (Code Polish & SW) | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ | ✓ |
| 5 | F18-F19 (E2E & Git Status) | Acceptance Criteria | 5 | 5 | ✓ | ✓ |

## Test Architecture
- Test runner: `node tests/run_all_tests.js`
- Test files directory: `p:\Agents\ishq-radio-2.0\tests/`
  - `tier1_unit.js`: Individual feature verification (DOM elements exist, functions exported, syntax clean).
  - `tier2_boundary.js`: Edge cases, mobile screen bounds (390px dock width <= 363px), canvas particle bounds, rapid clicks.
  - `tier3_integration.js`: Surprise Me -> playback triggers, Theme change -> Glyph update, SkyEngine theme change -> Particle switch.
  - `tier4_scenario.js`: Full lifecycle scenario (load app -> switch stations -> trigger surprise -> check weather rendering -> SW version consistency).
  - `run_all_tests.js`: Master runner executing all tiers and outputting structured TAP / test report.

## Coverage Thresholds
- Tier 1: >= 25 test cases
- Tier 2: >= 25 test cases
- Tier 3: >= 10 test cases
- Tier 4: >= 5 comprehensive scenarios
- Total: >= 65 automated test cases passing with exit code 0.
