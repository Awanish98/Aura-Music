# R3 Survey Report: Weather / Climate Canvas & Lightning Flash Animations

**Workspace**: `p:\Agents\ishq-radio-2.0`  
**Target Milestone**: R3 (Milestone 3) — Weather & Climate Canvas (`#weatherCanvas`, `#lightningFlash`)  
**Investigated By**: Explorer R3  
**Date**: 2026-08-25  

---

## 1. Executive Summary

The Aura Music web application includes a dynamic atmospheric climate system called **SkyEngine** (`script.js:2462-2913`) that drives a full-screen canvas (`#weatherCanvas` in `index.html:76`) and an overlay flash element (`#lightningFlash` in `index.html:77`). 

During our thorough codebase investigation, we identified **six critical bugs and design defects** that explain why the weather animations are currently completely invisible/frozen and why lightning never flashes:

1. **Dead `requestAnimationFrame` Loop (Primary Root Cause)**: At `script.js:2735`, a comment reads `// Weather particles RAF loop disabled for 0% CPU/GPU usage`. The recursive `animFrame = requestAnimationFrame(renderParticles)` call at the end of the particle rendering cycle was intentionally or accidentally removed. When initialized, `renderParticles(0)` executes exactly **one frame** and terminates.
2. **Aggressive Mobile RAF Termination**: At `script.js:2610-2614`, any screen width $\le 768\text{px}$ (all mobile devices and responsive views) immediately clears the canvas and exits without requesting future animation frames.
3. **Lightning Flash Animation Deadlock**: The random lightning trigger (`script.js:2653-2659`) is embedded inside `renderParticles()`. Because the render loop does not loop, the time delta threshold (`time - lastLightningTime > 9000...`) is never evaluated, completely preventing `#lightningFlash` from ever triggering.
4. **Missing Fog Particle Renderer**: In `script.js:2585-2595`, `initParticles()` generates fog particles, but `renderParticles()` has no branch for `currentSkyTheme === 'fog'`. Fog selection results in an empty canvas.
5. **Hardcoded 25 FPS Throttling**: At `script.js:2627`, `var throttleInterval = 40;` artificially clamps the frame rate to 25 FPS, directly violating the requirement for smooth $\ge 30\text{FPS}$ performance without heavy CPU usage.
6. **Command Palette Method Mismatch**: At `script.js:3787`, command palette invokes `SkyEngine.setSkyTheme(a.key, true)`, but `SkyEngine` exports `{ setTheme: setSkyTheme }`, causing a runtime `TypeError` when selecting weather moods via the command palette.

---

## 2. Codebase Architecture & File Mapping

### 2.1 DOM Structure (`index.html`)

```html
<!-- Line 73: Background Canvas Layering -->
<!-- Background Dust & Star Particles Canvas -->
<canvas id="particles" aria-hidden="true"></canvas>

<!-- Live Weather Atmosphere Living Canvas -->
<canvas id="weatherCanvas" class="weather-canvas" aria-hidden="true"></canvas>
<div class="lightning-flash" id="lightningFlash"></div>

<!-- Line 145: Top Navigation Pill -->
<button class="header-tool-btn header-weather-pill" id="weatherPillBtn" title="Atmospheric Sky & Weather Controls">
  <span class="weather-icon-badge" id="weatherIconBadge">🌤️</span>
  <span class="weather-temp-cond" id="weatherTempCond">--°C</span>
  <span class="weather-sep">•</span>
  <span class="weather-time-date" id="weatherTimeDate">--:--</span>
  <span class="weather-sync-dot" title="Live Auto-Sync Active"></span>
</button>

<!-- Line 792: Sky Weather Controls Modal -->
<div class="sky-modal-overlay" id="skyControlModal">
  <div class="sky-card"> ... </div>
</div>
```

### 2.2 CSS Layering & Stacking Context (`style.css`)

| Element / Class | Selector | `z-index` | Opacity / Display | Positioning | Behavior / Visibility |
|---|---|---|---|---|---|
| Ambient Mesh Glow | `.ambient-mesh-glow` | `0` | `0.85` | `fixed`, inset 0 | Soft background glow |
| Background Glyphs | `.bg-glyphs` | `0` | variable (`~0.03`) | `fixed`, inset 0 | Luxury typography |
| Dust / Star Particles | `#particles` | `1` | `0.45` | `fixed`, inset 0 | Static / disabled dust canvas |
| **Weather Canvas** | `#weatherCanvas` / `.weather-canvas` | **`2`** | **`0.9`** | **`fixed`, inset 0** | **On top of background, under vignette & UI** |
| **Lightning Flash** | `.lightning-flash` | **`4`** | **`0` (flashes `0.85`)** | **`fixed`, inset 0** | **Full-screen radial strobe overlay** |
| Vignette | `.vignette` | `4` | gradient overlay | `fixed`, inset 0 | Edge darkening gradient |
| App Shell | `.shell` | `10` | transparent bg | `relative` | Primary UI components |
| Modals / Dialogs | `.sky-modal-overlay` | `999990` | hidden / flex on open | `fixed`, inset 0 | Weather control panel |

**Layering Assessment**:
- The CSS z-index and opacity structure is valid. `#weatherCanvas` is at `z-index: 2` with `opacity: 0.9` and `pointer-events: none`.
- The shell and background layers do not have blocking opaque backgrounds. When canvas pixels are drawn, they are fully visible across the viewport.

---

## 3. Deep-Dive Root Cause Analysis

### 3.1 Root Cause 1: Missing Recursive `requestAnimationFrame` in `renderParticles`
- **Location**: `script.js:2608-2736`
- **Analysis**:
  ```javascript
  // script.js lines 2608-2736
  function renderParticles(time) {
    if (window.innerWidth <= 768) { ... return; }
    if (!ctx || !canvas || document.hidden) {
      animFrame = requestAnimationFrame(renderParticles);
      return;
    }
    if (currentSkyTheme === 'none') {
      ctx.clearRect(0, 0, width, height);
      animFrame = requestAnimationFrame(renderParticles);
      return;
    }

    var throttleInterval = 40; // 25 FPS on desktop
    if (time - lastSkyTime < throttleInterval) {
      animFrame = requestAnimationFrame(renderParticles);
      return;
    }
    lastSkyTime = time;

    ctx.clearRect(0, 0, width, height);

    // Particle rendering logic for rain, snow, sunny, sunset, windy, night...
    // [lines 2636-2734]

    // Weather particles RAF loop disabled for 0% CPU/GPU usage (line 2735)
    // <--- MISSING: animFrame = requestAnimationFrame(renderParticles);
  }
  ```
- **Consequence**:
  1. During startup (`script.js:2904`), `renderParticles(0)` executes once.
  2. Because the recursive RAF call at the end is missing, the loop dies after frame 0.
  3. When `setSkyTheme(theme, isManual)` is invoked (`script.js:2828-2856`), it calls `initParticles()`, but does **not** call `renderParticles()`.
  4. The canvas remains blank or frozen indefinitely.

---

### 3.2 Root Cause 2: Total Weather Kill on Mobile Viewports ($\le 768\text{px}$)
- **Location**: `script.js:2610-2614`
- **Analysis**:
  ```javascript
  if (window.innerWidth <= 768) {
    if (ctx && canvas) ctx.clearRect(0, 0, width, height);
    // Do NOT continue RAF loop on mobile
    return;
  }
  ```
- **Consequence**:
  1. On mobile devices or viewports $<768\text{px}$ (e.g. mobile 390px), weather animation is explicitly suppressed and cleared.
  2. Returning without scheduling `requestAnimationFrame` kills the loop permanently.
  3. Aura Music is a responsive PWA; mobile users should enjoy optimized lightweight atmospheric particles (e.g., 20-30 particles) with zero lag.

---

### 3.3 Root Cause 3: Lightning Flash Inactivity
- **Location**: `script.js:2598-2604` and `2653-2659`
- **Analysis**:
  - `triggerLightning()` toggles `.flash` class on `flashEl` for 70ms:
    ```javascript
    function triggerLightning() {
      if (!flashEl || currentSkyTheme !== 'thunderstorm') return;
      flashEl.classList.add('flash');
      setTimeout(function () {
        flashEl.classList.remove('flash');
      }, 70);
    }
    ```
  - The trigger check is inside `renderParticles()`:
    ```javascript
    if (currentSkyTheme === 'thunderstorm') {
      if (!lastLightningTime) lastLightningTime = time;
      if (time - lastLightningTime > 9000 + Math.random() * 9000) {
        triggerLightning();
        lastLightningTime = time;
      }
    }
    ```
  - Because `renderParticles()` never loops, `time - lastLightningTime > 9000` is never satisfied.
  - Visual Polish Note: A single 70ms flash with standard ease-out feels like a brief flicker. Realistic cinematic lightning utilizes a realistic multi-stage flash (e.g. initial strike of 40ms, 30ms dip, secondary bright bolt 90ms).

---

### 3.4 Root Cause 4: Missing `fog` Implementation in Renderer
- **Location**: `script.js:2585-2595` vs `2635-2735`
- **Analysis**:
  - `initParticles()` creates fog mist blobs:
    ```javascript
    } else if (currentSkyTheme === 'fog') {
      for (var f = 0; f < 4; f++) {
        particles.push({
          x: Math.random() * width,
          y: height * 0.4 + Math.random() * height * 0.6,
          r: Math.random() * 120 + 80,
          vx: Math.random() * 0.3 + 0.1,
          alpha: Math.random() * 0.04 + 0.02
        });
      }
    }
    ```
  - In `renderParticles()`, there is no `else if (currentSkyTheme === 'fog')` block.
  - When fog weather is active (or weather code 45/48 is received from Open-Meteo), the canvas renders nothing.

---

### 3.5 Root Cause 5: Particle Visuals & High-DPI Rendering
- **Location**: `script.js:2494-2595`, `2635-2735`
- **Analysis of Individual Themes**:
  1. **Rain**:
     - Particle `opacity` is generated in `initParticles()` but ignored in `renderParticles()`.
     - Lines are drawn with fixed 1.1px width in a single color (`rgba(180, 210, 255, 0.32)`).
     - Adding varied drop lengths, multi-depth opacity, and floor splash rings/ripples makes rain visually stunning.
  2. **Snow**:
     - Sway calculation `Math.sin(time * ps.swaySpeed + ps.swayOffset)` has `swaySpeed = 0.01 to 0.03`. In milliseconds (`time`), this oscillates at ~3.2 Hz (jittery horizontal vibration).
     - Proper scaling should use `time * 0.001 * swaySpeed` for a smooth, gentle 3–4 second drift.
     - Snowflake opacity `ps.alpha` should be respected, and radial gradients or soft alphas should be used for soft crystalline depth.
  3. **Night (Starry Night)**:
     - Draws static white dots at 0.5 fixed alpha with no twinkling.
     - Twinkling should dynamically modulate alpha via `sin(time * 0.002 * speed + phase)`.
     - Periodic shooting stars / meteors crossing the upper sky add extraordinary cinematic flair.
  4. **Fog (Lo-Fi Fog)**:
     - Render soft horizontal drifting radial gradients across the lower half with subtle alpha transitions.
  5. **Sunny / Solar Day & Sunset**:
     - Floating sunbeam particles / warm ambient embers should float upwards with gentle sinusoidal drift and fading alpha.
  6. **Windy / Autumn Wind**:
     - Rotating leaf particles with 2D rotation matrix (`ctx.ellipse`, `ctx.rotate`).

---

### 3.6 Root Cause 6: Command Palette API Method Name Discrepancy
- **Location**: `script.js:3787` vs `2909`
- **Analysis**:
  - `script.js:3787`: `SkyEngine.setSkyTheme(a.key, true);`
  - `script.js:2908-2912`:
    ```javascript
    return {
      setTheme: setSkyTheme,
      open: openModal,
      close: closeModal
    };
    ```
  - `SkyEngine.setSkyTheme` is `undefined`.
  - Fix: Export both `setTheme: setSkyTheme` and `setSkyTheme: setSkyTheme` for complete backward and cross-module compatibility.

---

## 4. Proposed Solution & Implementation Specification

### 4.1 Optimized Particle Engine Design (<1% CPU, 60 FPS Smoothness)

To guarantee $\ge 30\text{FPS}$ with zero frame drops and minimal battery impact across desktop and mobile:
1. **Lightweight Particle Budget**:
   - Desktop: Rain: 40–50 drops, Snow: 35 flakes, Night: 40 stars + occasional meteor, Fog: 5 misty haze puffs, Windy: 16 leaves, Sunny/Sunset: 20 motes.
   - Mobile ($\le 768\text{px}$): Automatically reduce particle count by 40% (e.g. 25 rain drops, 20 snowflakes) rather than disabling them completely.
2. **Batched Canvas Drawing**:
   - Use batched `beginPath()` and single `stroke()` / `fill()` passes per visual layer.
3. **Visibility API Handling**:
   - Pause the animation loop when `document.hidden` is true; resume immediately on `visibilitychange`.
4. **Lifecycle Control**:
   - Ensure `setSkyTheme()` checks if the animation loop is running and resumes `requestAnimationFrame` if idle.

---

### 4.2 Detailed Code Specification for `SkyEngine`

#### A. Particle Initialization & Sizing
```javascript
function resize() {
  if (!canvas) return;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  if (ctx) ctx.scale(dpr, dpr);
  initParticles();
}
```

#### B. Complete Particle Initialization (`initParticles`)
```javascript
function initParticles() {
  particles = [];
  ripples = [];
  var isMobile = window.innerWidth <= 768;

  if (currentSkyTheme === 'none') {
    if (ctx && canvas) ctx.clearRect(0, 0, width, height);
    return;
  }

  if (currentSkyTheme === 'rain' || currentSkyTheme === 'thunderstorm') {
    var count = currentSkyTheme === 'thunderstorm' ? (isMobile ? 35 : 60) : (isMobile ? 25 : 45);
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        l: Math.random() * 18 + 12,
        vy: Math.random() * 7 + 12,
        vx: (Math.random() * 1.5 - 2.0),
        alpha: Math.random() * 0.4 + 0.3,
        thickness: Math.random() * 0.8 + 0.8
      });
    }
  } else if (currentSkyTheme === 'snow') {
    var snowCount = isMobile ? 22 : 40;
    for (var k = 0; k < snowCount; k++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2.4 + 0.8,
        vy: Math.random() * 1.0 + 0.5,
        vxBase: (Math.random() - 0.5) * 0.4,
        swaySpeed: Math.random() * 1.5 + 0.8,
        swayOffset: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.5 + 0.25
      });
    }
  } else if (currentSkyTheme === 'night') {
    var starCount = isMobile ? 25 : 45;
    for (var s = 0; s < starCount; s++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.85,
        r: Math.random() * 1.5 + 0.5,
        twinkleSpeed: Math.random() * 2.0 + 1.0,
        twinklePhase: Math.random() * Math.PI * 2,
        baseAlpha: Math.random() * 0.35 + 0.2
      });
    }
  } else if (currentSkyTheme === 'fog') {
    var fogCount = isMobile ? 3 : 5;
    for (var f = 0; f < fogCount; f++) {
      particles.push({
        x: Math.random() * width,
        y: height * 0.35 + Math.random() * height * 0.55,
        r: Math.random() * 140 + 100,
        vx: Math.random() * 0.4 + 0.15,
        alpha: Math.random() * 0.05 + 0.02
      });
    }
  } else if (currentSkyTheme === 'sunny') {
    var sunCount = isMobile ? 12 : 22;
    for (var su = 0; su < sunCount; su++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2.2 + 0.8,
        vy: -(Math.random() * 0.7 + 0.3),
        vx: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.4 + 0.15
      });
    }
  } else if (currentSkyTheme === 'sunset') {
    var emberCount = isMobile ? 12 : 24;
    for (var se = 0; se < emberCount; se++) {
      particles.push({
        x: Math.random() * width,
        y: height + Math.random() * 40,
        r: Math.random() * 2.0 + 0.6,
        vy: -(Math.random() * 1.5 + 0.5),
        vx: (Math.random() - 0.5) * 0.6,
        alpha: Math.random() * 0.55 + 0.2,
        color: Math.random() > 0.5 ? 'rgba(255, 120, 50,' : 'rgba(255, 200, 80,'
      });
    }
  } else if (currentSkyTheme === 'windy') {
    var leafCount = isMobile ? 10 : 18;
    for (var j = 0; j < leafCount; j++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 6 + 4,
        vx: Math.random() * 2.2 + 1.6,
        vy: Math.random() * 1.2 + 0.4,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.06,
        color: Math.random() > 0.4 ? 'rgba(255, 140, 100,' : 'rgba(255, 192, 203,',
        alpha: Math.random() * 0.45 + 0.25
      });
    }
  }
}
```

#### C. Full Animation Loop (`renderParticles`)
```javascript
function renderParticles(time) {
  // Continue RAF loop
  animFrame = requestAnimationFrame(renderParticles);

  if (!ctx || !canvas || document.hidden) return;

  if (currentSkyTheme === 'none') {
    ctx.clearRect(0, 0, width, height);
    return;
  }

  // Smooth 60 FPS rendering with delta handling
  var nowSec = time * 0.001;
  ctx.clearRect(0, 0, width, height);

  if (currentSkyTheme === 'rain' || currentSkyTheme === 'thunderstorm') {
    var isStorm = currentSkyTheme === 'thunderstorm';
    ctx.strokeStyle = isStorm ? 'rgba(210, 230, 255, 0.55)' : 'rgba(185, 215, 255, 0.40)';
    ctx.lineWidth = isStorm ? 1.4 : 1.1;
    ctx.beginPath();
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.vx * 1.4, p.y + p.l);
      p.x += p.vx;
      p.y += p.vy;
      if (p.y >= height + 20 || p.x < -30) {
        p.y = -20;
        p.x = Math.random() * (width + 60);
      }
    }
    ctx.stroke();

    // Thunderstorm lightning strikes
    if (isStorm) {
      if (!lastLightningTime) lastLightningTime = time;
      if (time - lastLightningTime > 8000 + Math.random() * 10000) {
        triggerLightning();
        lastLightningTime = time;
      }
    }
  } else if (currentSkyTheme === 'snow') {
    for (var sn = 0; sn < particles.length; sn++) {
      var ps = particles[sn];
      ctx.fillStyle = 'rgba(240, 248, 255, ' + ps.alpha + ')';
      ctx.beginPath();
      ctx.arc(ps.x, ps.y, ps.r, 0, Math.PI * 2);
      ctx.fill();
      ps.y += ps.vy;
      ps.x += ps.vxBase + Math.sin(nowSec * ps.swaySpeed + ps.swayOffset) * 0.7;
      if (ps.y > height + 10) {
        ps.y = -10;
        ps.x = Math.random() * width;
      }
    }
  } else if (currentSkyTheme === 'night') {
    for (var ni = 0; ni < particles.length; ni++) {
      var pn = particles[ni];
      var twAlpha = pn.baseAlpha + Math.sin(nowSec * pn.twinkleSpeed + pn.twinklePhase) * 0.25;
      twAlpha = Math.max(0.08, Math.min(0.85, twAlpha));
      ctx.fillStyle = 'rgba(255, 255, 255, ' + twAlpha + ')';
      ctx.beginPath();
      ctx.arc(pn.x, pn.y, pn.r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (currentSkyTheme === 'fog') {
    for (var fg = 0; fg < particles.length; fg++) {
      var pf = particles[fg];
      var grad = ctx.createRadialGradient(pf.x, pf.y, 0, pf.x, pf.y, pf.r);
      grad.addColorStop(0, 'rgba(200, 220, 240, ' + pf.alpha + ')');
      grad.addColorStop(0.7, 'rgba(180, 200, 230, ' + (pf.alpha * 0.4) + ')');
      grad.addColorStop(1, 'rgba(160, 180, 220, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(pf.x, pf.y, pf.r, 0, Math.PI * 2);
      ctx.fill();
      pf.x += pf.vx;
      if (pf.x - pf.r > width) {
        pf.x = -pf.r;
        pf.y = height * 0.35 + Math.random() * height * 0.55;
      }
    }
  } else if (currentSkyTheme === 'sunny') {
    for (var su = 0; su < particles.length; su++) {
      var psu = particles[su];
      ctx.fillStyle = 'rgba(255, 225, 150, ' + psu.alpha + ')';
      ctx.beginPath();
      ctx.arc(psu.x, psu.y, psu.r, 0, Math.PI * 2);
      ctx.fill();
      psu.y += psu.vy;
      psu.x += psu.vx;
      if (psu.y < -10) {
        psu.y = height + 10;
        psu.x = Math.random() * width;
      }
    }
  } else if (currentSkyTheme === 'sunset') {
    for (var se = 0; se < particles.length; se++) {
      var pse = particles[se];
      ctx.fillStyle = pse.color + pse.alpha + ')';
      ctx.beginPath();
      ctx.arc(pse.x, pse.y, pse.r, 0, Math.PI * 2);
      ctx.fill();
      pse.y += pse.vy;
      pse.x += pse.vx;
      pse.alpha -= 0.002;
      if (pse.y < -10 || pse.alpha <= 0) {
        pse.y = height + Math.random() * 30;
        pse.x = Math.random() * width;
        pse.alpha = Math.random() * 0.55 + 0.2;
      }
    }
  } else if (currentSkyTheme === 'windy') {
    for (var w = 0; w < particles.length; w++) {
      var pw = particles[w];
      ctx.save();
      ctx.translate(pw.x, pw.y);
      ctx.rotate(pw.rot);
      ctx.fillStyle = pw.color + pw.alpha + ')';
      ctx.beginPath();
      ctx.ellipse(0, 0, pw.size, pw.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      pw.x += pw.vx;
      pw.y += pw.vy;
      pw.rot += pw.vRot;
      if (pw.x > width + 20) pw.x = -20;
      if (pw.y > height + 20) pw.y = -20;
    }
  }
}
```

#### D. Enhanced Lightning Strobe Sequence (`triggerLightning`)
```javascript
function triggerLightning() {
  if (!flashEl || currentSkyTheme !== 'thunderstorm') return;
  // Multi-stage realistic lightning double-strike
  flashEl.classList.add('flash');
  setTimeout(function () {
    flashEl.classList.remove('flash');
    setTimeout(function () {
      if (currentSkyTheme === 'thunderstorm') {
        flashEl.classList.add('flash');
        setTimeout(function () {
          flashEl.classList.remove('flash');
        }, 110);
      }
    }, 45);
  }, 50);
}
```

#### E. Robust SkyEngine Exports
```javascript
return {
  setTheme: setSkyTheme,
  setSkyTheme: setSkyTheme,
  open: openModal,
  close: closeModal,
  triggerLightning: triggerLightning
};
```

---

## 5. Verification Plan for Acceptance Criteria

| Requirement | Acceptance Criteria | Verification Method |
|---|---|---|
| **Visible Weather Particles** | Canvas has non-zero pixel data after initialization | Execute pixel check via canvas context: `ctx.getImageData(0, 0, width, height).data.some(c => c > 0) === true` |
| **Lightning Flash** | `#lightningFlash` triggers during thunderstorm | Invoke `triggerLightning()` or set theme to `thunderstorm` and verify `.flash` class toggling |
| **$\ge 30\text{FPS}$ Performance** | Smooth rendering without frame drops / low CPU usage | Run continuous RAF delta profiling; average frame duration $< 16.7\text{ms}$ |
| **Mobile Responsiveness** | Particles active on 390px viewport | Resize viewport to 390px; verify `renderParticles` remains active and canvas renders particles |
| **Command Palette Compatibility** | Switching weather via palette works cleanly | Trigger command palette weather item; confirm zero JavaScript exceptions and theme updates |
