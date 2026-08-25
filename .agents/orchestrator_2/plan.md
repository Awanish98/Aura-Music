# Orchestrator Plan — Aura Music Enhancement & QA

## Objectives
Execute full-codebase analysis, issue detection, bug fixes, visual & mobile layout audit, performance optimization, and end-to-end quality assurance across all 4 requirements:
- R1: Full Codebase Static Analysis & Error Elimination (including Surprise Me button wiring and dead code elimination)
- R2: End-to-End Playback & Audio Engine Verification (YouTube API iframe, playback rates, stations, tracks, progress scrubber)
- R3: Cross-Device Responsive UI & Mobile UX Audit (Background glyphs, weather canvas, mobile viewport layouts, dock, modals)
- R4: Performance, Battery & PWA Caching Optimization (RAF loops, canvas particles, Service Worker cache sync)

## Execution Phases
1. **Phase 0: Survey**
   - Spawn 3 parallel Explorers to inspect:
     - Explorer 1: Static analysis, syntax/runtime errors, event listener bindings, dead code, Surprise Me button wiring, SW cache version sync.
     - Explorer 2: Audio engine, YouTube player integration, mood stations, track progression, scrubber drag/seek, speed/vibe controls.
     - Explorer 3: UI/UX layout, mobile responsiveness (360px–420px), background glyph typography & animations, weather/climate particle canvas & lightning, modal overlays.
2. **Phase 1: Synthesis & Decomposition**
   - Aggregate findings into `PROJECT.md` with Feature Inventory and Interface Contracts.
   - Decompose into focused Implementation Milestones and spawn parallel E2E Test Track.
3. **Phase 2: Milestone Execution Loop**
   - For each milestone: Explorer → Worker → 2 Reviewers → 2 Challengers → Forensic Auditor → Gate.
4. **Phase 3: E2E Verification & Hardening**
   - Run complete test suite across all tiers.
   - Adversarial coverage hardening.
5. **Phase 4: Final Reporting & Handoff**
   - Final audit and synthesis report to Sentinel / Parent.
