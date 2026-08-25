const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, '..', 'script.js');
let script = fs.readFileSync(scriptPath, 'utf8');

const targetPattern = /function fitBrandTitle\(text\) \{[\s\S]*?bTitle\.style\.setProperty\('--dynamic-brand-spacing-mobile', mobileSpacing\);\s*\}/;

const newFunc = `function fitBrandTitle(text) {
    var bTitle = $('brandTitle');
    if (!bTitle) return;
    var rawText = (text || bTitle.textContent || '').trim();
    var len = rawText.length;

    var desktopSize = 'clamp(18px, 2.0vw, 26px)';
    var desktopSpacing = '0.10em';
    var mobileSize = 'clamp(14px, 4.0vw, 18px)';
    var mobileSpacing = '0.06em';

    if (len <= 8) {
      // Short names (e.g. ISHQ, 90S, EDM)
      desktopSize = 'clamp(22px, 2.4vw, 32px)';
      desktopSpacing = '0.12em';
      mobileSize = 'clamp(16px, 4.8vw, 22px)';
      mobileSpacing = '0.08em';
    } else if (len <= 15) {
      // Medium short names (e.g. ARIJIT SINGH, TIME TRAVEL, MY VIBES)
      desktopSize = 'clamp(19px, 2.1vw, 27px)';
      desktopSpacing = '0.10em';
      mobileSize = 'clamp(14px, 4.2vw, 19px)';
      mobileSpacing = '0.07em';
    } else if (len <= 24) {
      // Medium names (e.g. SHREYA GHOSHAL, BOLLYWOOD ROMANCE)
      desktopSize = 'clamp(16px, 1.7vw, 22px)';
      desktopSpacing = '0.08em';
      mobileSize = 'clamp(12px, 3.5vw, 16px)';
      mobileSpacing = '0.05em';
    } else if (len <= 34) {
      // Long names
      desktopSize = 'clamp(14px, 1.4vw, 19px)';
      desktopSpacing = '0.06em';
      mobileSize = 'clamp(11px, 3.0vw, 14px)';
      mobileSpacing = '0.04em';
    } else {
      // Extra long names
      desktopSize = 'clamp(12px, 1.2vw, 16px)';
      desktopSpacing = '0.05em';
      mobileSize = 'clamp(10px, 2.6vw, 12px)';
      mobileSpacing = '0.03em';
    }

    bTitle.style.setProperty('--dynamic-brand-size', desktopSize);
    bTitle.style.setProperty('--dynamic-brand-spacing', desktopSpacing);
    bTitle.style.setProperty('--dynamic-brand-size-mobile', mobileSize);
    bTitle.style.setProperty('--dynamic-brand-spacing-mobile', mobileSpacing);
  }`;

if (targetPattern.test(script)) {
  script = script.replace(targetPattern, newFunc);
  fs.writeFileSync(scriptPath, script, 'utf8');
  console.log('✅ Successfully updated fitBrandTitle in script.js');
} else {
  console.log('❌ Could not match targetPattern in script.js');
}
