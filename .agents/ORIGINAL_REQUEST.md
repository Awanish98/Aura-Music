# Original User Request

## 2026-08-25T17:22:08Z

Comprehensive bug fix, visual upgrade, and quality review for the Aura Music web app — a premium music streaming PWA hosted on GitHub Pages.

Working directory: p:\Agents\ishq-radio-2.0
Integrity mode: development

**Live URL**: https://awanish98.github.io/Aura-Music/
**Repository**: https://github.com/Awanish98/Aura-Music (branch main)
**Key files**: index.html, script.js, style.css, sw.js
**Cache versioning**: Service worker uses ar CACHE_NAME = 'aura-music-v117.0'; — bump to next version after changes. Also update style.css?v= and script.js?v= query params in index.html, and the cache check string in script.js.

---

## Requirements

### R1. Fix Surprise Me (??) Button — Not Working
The bottom dock has a Surprise Me button (#dockSurpriseBtn, line ~442 in index.html) but it has **no working click handler** in script.js. The old handler was tied to #heroSurpriseBtn and #btnSurpriseMood (which have been removed from the DOM). Wire #dockSurpriseBtn to actually trigger a random mood station or random song playback when clicked. It should pick a random mood from the available mood stations and call playMoodStation(mood), or pick a random song from the current queue and play it.

### R2. Premium Background Animated Words (Glyphs)
The background has animated text glyphs (#bgGlyphs with .glyph spans like  TIMELESS, COSMOS, INFINITY etc.) floating behind the UI. Make these **more premium and cinematic**: larger font sizes, smoother/slower drift animations, more elegant opacity transitions, subtle blur effects, and better color/gradient integration with the current station theme. They should feel like luxury brand typography floating in the atmosphere.

### R3. Fix Weather/Climate Animations
The weather animation system (#weatherCanvas, #lightningFlash) is not producing any visible effects. The weather canvas should render atmospheric particles (rain, snow, fog, stars) based on the current real weather data or the station theme. Debug why the canvas animations are not rendering and fix them so they produce visible, beautiful atmospheric effects.

### R4. Full Project Review & Polish
Review the entire codebase (index.html, script.js, style.css) for:
- Dead/orphaned code (CSS rules targeting removed elements, JS handlers for non-existent DOM nodes, unused variables)
- Console errors or warnings
- UI glitches (overlapping elements, broken layouts on mobile 390px width, elements hidden behind others)
- Performance issues (excessive DOM manipulation, memory leaks, unnecessary re-renders)
- Any other quality improvements that make the app feel more polished and professional

Do NOT remove any working features. Only clean up genuinely dead code and fix genuine bugs.

---

## Acceptance Criteria

### Surprise Me Button
- [ ] Clicking #dockSurpriseBtn in the bottom dock triggers a random mood station or random song — verified by checking that playMoodStation() or equivalent playback function is called
- [ ] No JavaScript console errors when clicking the button
- [ ] Button has visual feedback (brief animation/glow) on click

### Background Glyphs
- [ ] Background glyphs are visually larger, with smoother animations (drift speed = 30s per cycle)
- [ ] Glyphs have subtle blur and opacity effects that create depth
- [ ] Glyphs text content updates dynamically to reflect the current station/mood theme

### Weather Animations
- [ ] Weather canvas renders visible atmospheric particles (rain drops, snow flakes, stars, or fog) — verified by checking canvas has non-zero pixel data after initialization
- [ ] Lightning flash effect triggers during thunderstorm weather conditions
- [ ] Weather animations don't cause frame drops below 30fps (no heavy CPU usage)

### Project Cleanup
- [ ] No orphaned CSS rules targeting elements that don't exist in the DOM
- [ ] No orphaned JS event listeners for non-existent element IDs
- [ ] Zero console errors on page load and during normal playback flow
- [ ] All bottom dock buttons are visible and not clipped on mobile (390px viewport)
- [ ] Service worker cache version bumped consistently across all 4 files (sw.js, index.html ×2, script.js)

### Deployment
- [ ] All changes committed and pushed to main branch
- [ ] Live site loads without errors at https://awanish98.github.io/Aura-Music/?reset=1
