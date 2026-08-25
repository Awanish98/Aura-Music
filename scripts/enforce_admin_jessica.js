const fs = require('fs');
const path = require('path');

const adminJsPath = path.join(__dirname, '..', 'admin.js');
const adminHtmlPath = path.join(__dirname, '..', 'admin.html');

let adminJs = fs.readFileSync(adminJsPath, 'utf8');
let adminHtml = fs.readFileSync(adminHtmlPath, 'utf8');

// 1. Update admin.html with cache-busting version params
adminHtml = adminHtml.replace(
  /<link rel="stylesheet" href="admin\.css(\?v=[^"]+)?"\s*>/,
  '<link rel="stylesheet" href="admin.css?v=134.0">'
);

adminHtml = adminHtml.replace(
  /<script src="admin\.js(\?v=[^"]+)?"\s*><\/script>/,
  '<script src="admin.js?v=134.0"></script>'
);

fs.writeFileSync(adminHtmlPath, adminHtml, 'utf8');
console.log('✅ Updated admin.html with admin.js?v=134.0');

// 2. Update admin.js to strictly enforce 'jessica'
const authSectionRegex = /\/\* =+ Admin PIN Authentication Gate =+ \*\/[\s\S]*?initAuth\(\);\s*\}\)\(\);/;

const newAuthSection = `/* ==================== Admin PIN Authentication Gate ==================== */
  var ADMIN_PIN = 'jessica';
  var AUTH_SESSION_KEY = 'ishq_admin_authenticated';

  function initAuth() {
    var overlay = $('adminAuthOverlay');
    var form = $('adminAuthForm');
    var pinInput = $('adminPinInput');

    if (sessionStorage.getItem(AUTH_SESSION_KEY) === 'true') {
      if (overlay) overlay.classList.add('unlocked');
      loadStations();
      return;
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var val = (pinInput ? pinInput.value : '').trim().toLowerCase();
        if (val === 'jessica') {
          sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
          if (overlay) overlay.classList.add('unlocked');
          showToast('Welcome back, Admin! 🔓');
          loadStations();
        } else {
          if (val === '2026') {
            showToast('2026 is obsolete! Master password is: jessica ❌');
          } else {
            showToast('Incorrect Password! Access Denied ❌');
          }
          if (pinInput) {
            pinInput.value = '';
            pinInput.focus();
            pinInput.style.borderColor = '#ff334b';
            setTimeout(function () { pinInput.style.borderColor = ''; }, 1200);
          }
        }
      });
    }
  }

  initAuth();
})();`;

if (authSectionRegex.test(adminJs)) {
  adminJs = adminJs.replace(authSectionRegex, newAuthSection);
  fs.writeFileSync(adminJsPath, adminJs, 'utf8');
  console.log('✅ Updated admin.js authentication logic');
} else {
  console.log('⚠️ Could not match authSectionRegex in admin.js');
}

// 3. Synchronize version to v134.0
const newVersion = '134.0';
['sw.js', 'index.html', 'script.js'].forEach(f => {
  let content = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  content = content.replace(/v133\.[0-9]+/g, 'v' + newVersion);
  content = content.replace(/v133\.0/g, 'v' + newVersion);
  content = content.replace(/aura-music-v[0-9.]+/g, 'aura-music-v' + newVersion);
  content = content.replace(/script\.js\?v=[0-9.]+/g, 'script.js?v=' + newVersion);
  content = content.replace(/style\.css\?v=[0-9.]+/g, 'style.css?v=' + newVersion);
  fs.writeFileSync(path.join(__dirname, '..', f), content, 'utf8');
});

console.log('🚀 Synchronized version to v' + newVersion);
