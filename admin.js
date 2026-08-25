(function () {
  var DB_VERSION_KEY = 'ishq_db_version';
  var CURRENT_DB_VERSION = 'v10.1';
  var STORAGE_KEY = 'ishq_custom_stations';

  var stations = [];
  var currentEditingId = null;
  var syncChannel = window.BroadcastChannel ? new BroadcastChannel('ishq_stations_sync') : null;

  function $(id) { return document.getElementById(id); }

  /* ==================== Toast Notifications ==================== */
  function showToast(msg) {
    var c = $('toastContainer');
    if (!c) return;
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(function () {
      if (t.parentNode) t.parentNode.removeChild(t);
    }, 2800);
  }

  /* ==================== Load & Save Database with Versioning ==================== */
  function loadStations() {
    var storedVersion = localStorage.getItem(DB_VERSION_KEY);

    // If version is old, wipe stale legacy stations
    if (storedVersion !== CURRENT_DB_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('ishq_station_key');
      localStorage.setItem(DB_VERSION_KEY, CURRENT_DB_VERSION);
    }

    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        stations = JSON.parse(stored);
        if (stations && stations.length) {
          renderStationsList();
          updateStats();
          return;
        }
      } catch (e) {}
    }

    // Force load from stations.json
    fetch('stations.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        stations = data;
        saveStations(false);
        renderStationsList();
        updateStats();
      })
      .catch(function () {
        stations = [];
        renderStationsList();
        updateStats();
      });
  }

  function saveStations(notify) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stations));
    localStorage.setItem(DB_VERSION_KEY, CURRENT_DB_VERSION);
    if (syncChannel && notify !== false) {
      try { syncChannel.postMessage({ type: 'stations_updated' }); } catch (e) {}
    }
    renderStationsList();
    updateStats();
  }

  function updateStats() {
    if ($('totalStationsCount')) $('totalStationsCount').textContent = stations.length;
    if ($('totalTracksCount')) $('totalTracksCount').textContent = '5 Playlists (1,000+ Songs)';
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ==================== Render Station Cards ==================== */
  function renderStationsList() {
    var grid = $('stationsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!stations.length) {
      grid.innerHTML = '<div class="empty-state">No stations configured yet. Click "+ Add Station" above!</div>';
      return;
    }

    stations.forEach(function (st) {
      var card = document.createElement('div');
      card.className = 'station-card';
      var accent = (st.theme && st.theme.accent) ? st.theme.accent : '#a855f7';
      var glow = (st.theme && st.theme.accentGlow) ? st.theme.accentGlow : 'rgba(168, 85, 247, 0.45)';
      var glyphs = (st.theme && st.theme.glyphs) ? st.theme.glyphs : ['वक़्त', 'सफ़र'];

      card.style.setProperty('--station-accent', accent);
      card.style.setProperty('--station-glow', glow);

      var glyphsHtml = glyphs.slice(0, 4).map(function (g) {
        return '<span class="glyph-tag">' + escapeHtml(g) + '</span>';
      }).join('');

      var safeName = escapeHtml(st.name || '');
      var safeShort = escapeHtml(st.short || '');
      var safeIcon = escapeHtml(st.icon || '📻');
      var safeDesc = escapeHtml(st.desc || 'YouTube Music Playlist');
      var safePlaylistId = escapeHtml(st.playlistId || 'Custom');

      card.innerHTML = 
        '<div class="card-ambient-tint"></div>' +
        '<div class="card-header-row">' +
          '<div class="card-icon-title">' +
            '<div class="card-icon">' + safeIcon + '</div>' +
            '<div>' +
              '<div class="card-title">' + safeName + '</div>' +
              '<div class="card-short">' + safeShort + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="card-theme-pill" style="background:' + escapeHtml(accent) + ';" title="Theme Color"></div>' +
        '</div>' +
        '<div class="card-desc">' + safeDesc + '</div>' +
        '<div class="card-glyphs-preview">' + glyphsHtml + '</div>' +
        '<div class="card-meta-row">' +
          '<span>📺 YouTube Playlist: ' + safePlaylistId + '</span>' +
          '<div class="card-actions">' +
            '<button class="action-btn btn-play" data-action="play" data-id="' + escapeHtml(st.id) + '" title="Open in Radio Player">▶ Play</button>' +
            '<button class="action-btn btn-edit" data-action="edit" data-id="' + escapeHtml(st.id) + '" title="Edit Station & Theme">Edit</button>' +
            '<button class="action-btn btn-delete" data-action="delete" data-id="' + escapeHtml(st.id) + '" title="Delete Station">Delete</button>' +
          '</div>' +
        '</div>';

      grid.appendChild(card);
    });

    grid.querySelectorAll('.action-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var action = btn.getAttribute('data-action');
        var id = btn.getAttribute('data-id');
        if (action === 'play') {
          localStorage.setItem('ishq_station_key', id);
          window.location.href = 'index.html';
        } else if (action === 'edit') {
          openEditModal(id);
        } else if (action === 'delete') {
          deleteStation(id);
        }
      });
    });
  }

  /* ==================== Modal & Theme Designer ==================== */
  var modal = $('stationModal');
  var isPlaylistMode = true;

  $('addStationBtn').addEventListener('click', function () {
    openCreateModal();
  });

  $('closeModalBtn').addEventListener('click', closeModal);
  $('cancelModalBtn').addEventListener('click', closeModal);

  function openCreateModal() {
    currentEditingId = null;
    $('modalTitle').textContent = 'Create New Station';
    $('stationIdInput').value = 'st_' + Math.random().toString(36).slice(2, 9);
    $('stationNameInput').value = '';
    $('stationShortInput').value = '';
    $('stationIconInput').value = '📻';
    $('stationDescInput').value = '';
    $('playlistUrlInput').value = '';
    $('customTracksInput').value = '';
    
    setThemeFields('#060714', '#f3e8ff', '#a855f7', 'वक़्त, सफ़र, ज़माना, सदियाँ, लम्हा, कायनात');
    setSourceMode(true);
    updateLivePreview();
    modal.classList.add('open');
  }

  function openEditModal(id) {
    var st = stations.find(function (s) { return s.id === id; });
    if (!st) return;

    currentEditingId = id;
    $('modalTitle').textContent = 'Edit Station: ' + st.name;
    $('stationIdInput').value = st.id;
    $('stationNameInput').value = st.name || '';
    $('stationShortInput').value = st.short || '';
    $('stationIconInput').value = st.icon || '📻';
    $('stationDescInput').value = st.desc || '';

    setSourceMode(true);
    $('playlistUrlInput').value = st.playlistUrl || ('https://music.youtube.com/playlist?list=' + (st.playlistId || ''));
    $('customTracksInput').value = '';

    var th = st.theme || {};
    var bg = th.bg || '#060714';
    var fg = th.fg || '#f3e8ff';
    var accent = th.accent || '#a855f7';
    var glyphs = th.glyphs ? th.glyphs.join(', ') : 'वक़्त, सफ़र, ज़माना';

    setThemeFields(bg, fg, accent, glyphs);
    updateLivePreview();
    modal.classList.add('open');
  }

  function closeModal() {
    modal.classList.remove('open');
  }

  function setSourceMode(isPl) {
    isPlaylistMode = isPl;
    $('modePlaylistTab').classList.toggle('active', isPl);
    $('modeCustomTracksTab').classList.toggle('active', !isPl);
    $('playlistUrlGroup').style.display = isPl ? 'block' : 'none';
    $('customTracksGroup').style.display = isPl ? 'none' : 'block';
  }

  $('modePlaylistTab').addEventListener('click', function () { setSourceMode(true); });
  $('modeCustomTracksTab').addEventListener('click', function () { setSourceMode(false); });

  function setThemeFields(bg, fg, accent, glyphsStr) {
    $('themeBgInput').value = bg;
    $('themeBgHex').value = bg;
    $('themeFgInput').value = fg;
    $('themeFgHex').value = fg;
    $('themeAccentInput').value = accent;
    $('themeAccentHex').value = accent;
    $('themeGlyphsInput').value = glyphsStr;
  }

  ['themeBgInput', 'themeFgInput', 'themeAccentInput', 'themeGlyphsInput', 'stationNameInput', 'stationShortInput', 'stationIconInput', 'stationDescInput'].forEach(function (id) {
    var el = $(id);
    if (!el) return;
    el.addEventListener('input', function () {
      if (id === 'themeBgInput') $('themeBgHex').value = $('themeBgInput').value;
      if (id === 'themeFgInput') $('themeFgHex').value = $('themeFgInput').value;
      if (id === 'themeAccentInput') $('themeAccentHex').value = $('themeAccentInput').value;
      updateLivePreview();
    });
  });

  ['themeBgHex', 'themeFgHex', 'themeAccentHex'].forEach(function (id) {
    var el = $(id);
    if (!el) return;
    el.addEventListener('change', function () {
      if (id === 'themeBgHex') $('themeBgInput').value = $('themeBgHex').value;
      if (id === 'themeFgHex') $('themeFgInput').value = $('themeFgHex').value;
      if (id === 'themeAccentHex') $('themeAccentInput').value = $('themeAccentHex').value;
      updateLivePreview();
    });
  });

  document.querySelectorAll('.swatch-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var bg = btn.getAttribute('data-bg');
      var fg = btn.getAttribute('data-fg');
      var accent = btn.getAttribute('data-accent');
      setThemeFields(bg, fg, accent, $('themeGlyphsInput').value);
      updateLivePreview();
    });
  });

  function updateLivePreview() {
    var bg = $('themeBgInput').value;
    var fg = $('themeFgInput').value;
    var accent = $('themeAccentInput').value;
    var name = $('stationNameInput').value || 'Station Name';
    var short = $('stationShortInput').value || 'STATION';
    var icon = $('stationIconInput').value || '📻';
    var desc = $('stationDescInput').value || 'YouTube Music Frequency';
    var glyphs = ($('themeGlyphsInput').value || 'वक़्त, सफ़र, ज़माना').split(',').map(function (s) { return s.trim(); });

    var prevBox = $('themeLivePreview');
    var prevGlow = $('prevGlow');
    var prevBadge = $('prevBadge');
    var prevTitle = $('prevTitle');
    var prevDesc = $('prevDesc');
    var prevVinylCenter = $('prevVinylCenter');
    var prevWave = $('prevWave');

    if (prevBox) prevBox.style.backgroundColor = bg;
    if (prevGlow) prevGlow.style.background = 'radial-gradient(circle at 50% 40%, ' + accent + ' 0%, transparent 70%)';
    if (prevBadge) {
      prevBadge.textContent = icon + ' ' + short.toUpperCase();
      prevBadge.style.color = fg;
      prevBadge.style.borderColor = accent;
    }
    if (prevTitle) {
      prevTitle.textContent = name;
      prevTitle.style.color = fg;
    }
    if (prevDesc) prevDesc.textContent = desc;
    if (prevVinylCenter) prevVinylCenter.style.backgroundColor = accent;
    if (prevWave) {
      prevWave.querySelectorAll('span').forEach(function (s) { s.style.backgroundColor = accent; });
    }

    var glyphContainer = $('prevGlyphs');
    if (glyphContainer) {
      glyphContainer.innerHTML = 
        '<span class="pg-1">' + (glyphs[0] || 'वक़्त') + '</span>' +
        '<span class="pg-2">' + (glyphs[1] || 'सफ़र') + '</span>' +
        '<span class="pg-3">' + (glyphs[2] || 'ज़माना') + '</span>';
    }
  }

  /* ==================== Save Station Logic ==================== */
  $('saveStationBtn').addEventListener('click', function () {
    var name = $('stationNameInput').value.trim();
    var short = $('stationShortInput').value.trim();
    if (!name || !short) {
      showToast('Please enter Station Name and Short Label');
      return;
    }

    var id = currentEditingId || $('stationIdInput').value || ('st_' + Date.now());
    var icon = $('stationIconInput').value.trim() || '📻';
    var desc = $('stationDescInput').value.trim();
    var bg = $('themeBgInput').value;
    var fg = $('themeFgInput').value;
    var accent = $('themeAccentInput').value;
    var glyphs = $('themeGlyphsInput').value.split(',').map(function (s) { return s.trim(); }).filter(Boolean);

    var playlistUrl = $('playlistUrlInput').value.trim();
    var match = playlistUrl.match(/list=([a-zA-Z0-9_-]+)/);
    var plId = match ? match[1] : playlistUrl;

    if (!plId) {
      showToast('Please enter a valid YouTube Playlist Link or ID');
      return;
    }

    var stationObj = {
      id: id,
      name: name,
      short: short,
      desc: desc,
      icon: icon,
      type: 'playlist',
      playlistId: plId,
      playlistUrl: playlistUrl,
      theme: {
        bg: bg,
        fg: fg,
        fgDim: fg,
        muted: '#7e7e8a',
        accent: accent,
        accentGlow: hexToRgba(accent, 0.45),
        themeAmbient: hexToRgba(accent, 0.09),
        glassBg: hexToRgba(bg, 0.9),
        glyphs: glyphs.length ? glyphs : ['वक़्त', 'सफ़र', 'ज़माना']
      }
    };

    if (currentEditingId) {
      var idx = stations.findIndex(function (s) { return s.id === currentEditingId; });
      if (idx !== -1) stations[idx] = stationObj;
      else stations.push(stationObj);
      showToast('Station updated successfully! ✨');
    } else {
      stations.push(stationObj);
      showToast('New Station created successfully! 🚀');
    }

    saveStations(true);
    closeModal();
  });

  function hexToRgba(hex, alpha) {
    var c = hex.replace('#', '');
    if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
    var num = parseInt(c, 16);
    return 'rgba(' + ((num >> 16) & 255) + ', ' + ((num >> 8) & 255) + ', ' + (num & 255) + ', ' + alpha + ')';
  }

  function deleteStation(id) {
    if (!confirm('Are you sure you want to delete this station?')) return;
    stations = stations.filter(function (s) { return s.id !== id; });
    saveStations(true);
    showToast('Station deleted');
  }

  /* ==================== Export & Import JSON ==================== */
  $('exportJsonBtn').addEventListener('click', function () {
    var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(stations, null, 2));
    var dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', 'ishq-radio-stations.json');
    dl.click();
    showToast('Stations exported to JSON! 📥');
  });

  $('importJsonBtn').addEventListener('click', function () {
    $('importFileInput').click();
  });

  $('importFileInput').addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (evt) {
      try {
        var imported = JSON.parse(evt.target.result);
        if (Array.isArray(imported)) {
          stations = imported;
          saveStations(true);
          showToast('Imported ' + stations.length + ' stations successfully! ✨');
        }
      } catch (err) {
        showToast('Error parsing JSON file');
      }
    };
    reader.readAsText(file);
  });

  /* ==================== Admin PIN Authentication Gate ==================== */
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
        var val = (pinInput ? pinInput.value : '').trim();
        if (val.toLowerCase() === 'jessica') {
          sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
          if (overlay) overlay.classList.add('unlocked');
          showToast('Welcome back, Admin! 🔓');
          loadStations();
        } else {
          showToast('Incorrect Password! Access Denied ❌');
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
})();

