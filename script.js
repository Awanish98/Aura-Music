(function () {
  var DB_VERSION_KEY = 'ishq_db_version';
  var CURRENT_DB_VERSION = 'v10.0';
  var STORAGE_KEY = 'ishq_custom_stations';


  // 6 Official Master Stations (including AI-Powered My Vibes)
  var DEFAULT_STATIONS = [
    {
      "id": "time-travel",
      "name": "⏳ Time Travel",
      "short": "Time Travel ⏳",
      "brand": "TIME TRAVEL",
      "brandSub": "COSMIC VOYAGE // 4,066 TIMELESS SOUNDS",
      "desc": "Cosmic celestial journey across 4,066 timeless melodies and eras",
      "icon": "⏳",
      "type": "playlist",
      "playlistId": "PLITHjw3sQBek",
      "playlistUrl": "https://music.youtube.com/playlist?list=PLITHjw3sQBek",
      "songCount": "4,066 SONGS",
      "theme": {
        "bg": "#060714",
        "fg": "#f3e8ff",
        "fgDim": "#d8b4fe",
        "muted": "#7c6899",
        "accent": "#a855f7",
        "accentGlow": "rgba(168, 85, 247, 0.45)",
        "themeAmbient": "rgba(168, 85, 247, 0.09)",
        "glassBg": "rgba(12, 10, 26, 0.9)",
        "fontFamily": "'Cinzel', serif",
        "uiMode": "time-travel",
        "glyphs": ["TIMELESS", "COSMOS", "INFINITY", "VOYAGE", "STARDUST", "EONS"],
        "centerGlyph": "TIMELESS",
        "quote": "\"Travelling across eras through 4,066 echoes of sound…\""
      }
    },
    {
      "id": "my-vibes",
      "name": "✨ My Vibes — AI Curation",
      "short": "My Vibes ✨",
      "brand": "MY VIBES",
      "brandSub": "AI AGENT // REAL-TIME PERSONALIZED FLOW",
      "desc": "Smart AI-curated frequency tailored dynamically to your playing taste, moods & likes",
      "icon": "✨",
      "type": "playlist",
      "playlistId": "PLFf55m7SQo5Q",
      "playlistUrl": "custom://my-vibes",
      "songCount": "AI ADAPTIVE",
      "theme": {
        "bg": "#080512",
        "fg": "#faf5ff",
        "fgDim": "#e9d5ff",
        "muted": "#a78bfa",
        "accent": "#ec4899",
        "accentGlow": "rgba(236, 72, 153, 0.45)",
        "themeAmbient": "rgba(236, 72, 153, 0.09)",
        "glassBg": "rgba(18, 10, 30, 0.92)",
        "fontFamily": "'Space Grotesk', sans-serif",
        "uiMode": "my-vibes",
        "glyphs": ["AURA", "VIBES", "ENERGY", "HARMONY", "FREQUENCY", "SYNTHESIS"],
        "centerGlyph": "VIBES",
        "quote": "\"Learning your soul frequency, curating one timeless vibe at a time…\""
      }
    },



    {
      "id": "ishq",
      "name": "📻 ISHQ — Pure Soul",
      "short": "ISHQ 📻",
      "brand": "इश्क़",
      "brandSub": "PURE SOUL // 1,427 ACOUSTIC MELODIES",
      "desc": "Heartfelt acoustic, midnight lo-fi & soul-touching Hindi/Urdu melodies",
      "icon": "📻",
      "type": "playlist",
      "playlistId": "PLFf55m7SQo5Q",
      "playlistUrl": "https://youtube.com/playlist?list=PLFf55m7SQo5Q",
      "songCount": "1,427 SONGS",

      "theme": {
        "bg": "#080706",
        "fg": "#fef3c7",
        "fgDim": "#fde68a",
        "muted": "#927848",
        "accent": "#f59e0b",
        "accentGlow": "rgba(245, 158, 11, 0.4)",
        "themeAmbient": "rgba(245, 158, 11, 0.08)",
        "glassBg": "rgba(22, 16, 10, 0.9)",
        "fontFamily": "'Tiro Devanagari Hindi', 'Rozha One', serif",
        "uiMode": "ishq",
        "glyphs": ["इश्क़", "सुकून", "रूह", "आफ़रीन", "धड़कन", "चाहत"],
        "centerGlyph": "इश्क़",
        "quote": "\"इश्क़ वो नहीं जो बयाँ हो, इश्क़ वो है जो महसूस हो…\""
      }
    },
    {
      "id": "demanding",
      "name": "🔥 Demand — Intense Energy",
      "short": "Demand 🔥",
      "brand": "DEMAND",
      "brandSub": "HIGH ENERGY // 1,921 PASSION ANTHEMS",
      "desc": "Powerful, fiery romantic beats & passionate high-energy hits",
      "icon": "🔥",
      "type": "playlist",
      "playlistId": "PLfghIz9Cf1tc",
      "playlistUrl": "https://youtube.com/playlist?list=PLfghIz9Cf1tc",
      "songCount": "1,921 SONGS",
      "theme": {
        "bg": "#0d0408",
        "fg": "#ffe4e6",
        "fgDim": "#fda4af",
        "muted": "#9f4a5d",
        "accent": "#ff2a5f",
        "accentGlow": "rgba(255, 42, 95, 0.45)",
        "themeAmbient": "rgba(255, 42, 95, 0.09)",
        "glassBg": "rgba(26, 8, 16, 0.9)",
        "fontFamily": "'Cinzel', sans-serif",
        "uiMode": "demanding",
        "glyphs": ["PASSION", "FIRE", "ENERGY", "DESIRE", "HYPER", "INTENSE"],
        "centerGlyph": "PASSION",
        "quote": "\"Unstoppable adrenaline, passionate rhythm and fierce sound.\""
      }
    },
    {
      "id": "90s",
      "name": "📼 90's — Golden Nostalgia",
      "short": "90's Era 📼",
      "brand": "90's NOSTALGIA",
      "brandSub": "EVERGREEN CLASSICS // 95 VINTAGE DUETS",
      "desc": "Timeless 90s vintage romance, evergreen duets & melodious nostalgia",
      "icon": "📼",
      "type": "playlist",
      "playlistId": "PLcOcdMHSwLrU",
      "playlistUrl": "https://music.youtube.com/playlist?list=PLcOcdMHSwLrU",
      "songCount": "95 SONGS",
      "theme": {
        "bg": "#050a0d",
        "fg": "#ecfeff",
        "fgDim": "#a5f3fc",
        "muted": "#4d808c",
        "accent": "#06b6d4",
        "accentGlow": "rgba(6, 182, 212, 0.4)",
        "themeAmbient": "rgba(6, 182, 212, 0.08)",
        "glassBg": "rgba(8, 20, 26, 0.9)",
        "fontFamily": "'Playfair Display', serif",
        "uiMode": "90s",
        "glyphs": ["RETRO", "NOSTALGIA", "CLASSIC", "MELODY", "EVERGREEN", "GOLDEN"],
        "centerGlyph": "RETRO",
        "quote": "\"The golden era of melodies that never fade away…\""
      }
    },
    {
      "id": "edm",
      "name": "⚡ EDM — Electric Euphoria",
      "short": "EDM & Club ⚡",
      "brand": "EDM // EUPHORIA",
      "brandSub": "CLUB ANTHEMS // 144 SYNTH & BASSLINES",
      "desc": "High energy club anthems, electronic basslines & festival vibes",
      "icon": "⚡",
      "type": "playlist",
      "playlistId": "PLYLuPnKO3ROU",
      "playlistUrl": "https://youtube.com/playlist?list=PLYLuPnKO3ROU",
      "songCount": "144 SONGS",
      "theme": {
        "bg": "#040907",
        "fg": "#ecfdf5",
        "fgDim": "#a7f3d0",
        "muted": "#458268",
        "accent": "#10b981",
        "accentGlow": "rgba(16, 185, 129, 0.45)",
        "themeAmbient": "rgba(16, 185, 129, 0.09)",
        "glassBg": "rgba(6, 22, 16, 0.9)",
        "fontFamily": "'Plus Jakarta Sans', sans-serif",
        "uiMode": "edm",
        "glyphs": ["EUPHORIA", "PULSE", "ELECTRO", "NEON", "BASS", "SYNTH"],
        "centerGlyph": "EUPHORIA",
        "quote": "\"Feel the electric pulse, drop the bass and lose control.\""
      }
    }
  ];

  // Purge legacy storage versions
  if (localStorage.getItem(DB_VERSION_KEY) !== CURRENT_DB_VERSION) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('ishq_station_key');
    localStorage.setItem(DB_VERSION_KEY, CURRENT_DB_VERSION);
  }

  /* ==================== Clear Old Service Worker Caches ==================== */
  if ('caches' in window) {
    caches.keys().then(function (names) {
      names.forEach(function (name) {
        if (name !== 'ishq-radio-v9.0') caches.delete(name);
      });
    });
  }

  var stations = DEFAULT_STATIONS.slice();
  var currentStation = stations[0];
  var currentStationKey = localStorage.getItem('ishq_station_key') || 'time-travel';

  var player = null, apiReady = false, desired = true;
  var sessionHistory = [];
  var likedSongs = JSON.parse(localStorage.getItem('ishq_liked_songs') || '[]');
  var currentLyrics = [];
  var skipDebounce = false;

  // Single-Tab Audio Lock
  var myTabId = 'tab_' + Math.random().toString(36).slice(2, 9);
  var tabChannel = window.BroadcastChannel ? new BroadcastChannel('ishq_audio_lock') : null;
  var syncChannel = window.BroadcastChannel ? new BroadcastChannel('ishq_stations_sync') : null;

  if (tabChannel) {
    tabChannel.onmessage = function (e) {
      if (e.data && e.data.type === 'claim_audio' && e.data.tabId !== myTabId) {
        if (player && isPlaying()) {
          desired = false;
          try { player.pauseVideo(); } catch (err) {}
          showToast('Audio paused: Playing in another tab');
        }
      }
    };
  }

  if (syncChannel) {
    syncChannel.onmessage = function (e) {
      if (e.data && e.data.type === 'stations_updated') {
        loadStationsData(true);
      }
    };
  }

  window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY) {
      loadStationsData(true);
    }
  });

  function claimAudioMaster() {
    if (tabChannel) {
      try { tabChannel.postMessage({ type: 'claim_audio', tabId: myTabId }); } catch (e) {}
    }
  }

  function $(id) { return document.getElementById(id); }

  function show(cls) {
    document.body.classList.remove('s-loading', 's-error', 's-ready');
    document.body.classList.add(cls);
  }

  /* ==========================================================================
     AI VIBE INTELLIGENCE ENGINE & SMART PLAYLIST AGENT (VibeAgent)
     Learns user listening habits, builds taste vectors, and auto-curates "My Vibes"
     ========================================================================== */
  var VibeAgent = (function () {
    var VIBE_PROFILE_KEY = 'ishq_vibe_profile';
    var MY_VIBES_PLAYLIST_KEY = 'ishq_my_vibes_playlist';

    // Comprehensive Music Knowledge Matrix across Vibe Dimensions
    var SONGS_CATALOG = [
      { id: 'IltsCYPwtjE', title: 'Kesariya', artist: 'Arijit Singh, Pritam', genres: ['romance', 'bollywood', 'soul'], mood: '❤️ Passionate Love', tempo: 'mid' },
      { id: '1T3i9Qp54s0', title: 'Heeriye', artist: 'Jasleen Royal, Arijit Singh', genres: ['romance', 'acoustic', 'lofi'], mood: '☕ Midnight Romance', tempo: 'slow' },
      { id: 'BddP6PYo2gs', title: 'Apna Bana Le', artist: 'Arijit Singh, Sachin-Jigar', genres: ['romance', 'soul', 'bollywood'], mood: '🕊️ Pure Devotion', tempo: 'slow' },
      { id: 'gvyUuxdRdR4', title: 'Kahani Suno 2.0', artist: 'Kaifi Khalil', genres: ['romance', 'indie', 'soul'], mood: '💔 Melancholy & Yearning', tempo: 'slow' },
      { id: 'cl0a3i2wFcc', title: 'Pasoori', artist: 'Ali Sethi, Shae Gill (Coke Studio)', genres: ['coke_studio', 'folk', 'fusion'], mood: '✨ Cosmic Ecstasy', tempo: 'upbeat' },
      { id: 'T94PHkuydcw', title: 'Tu Hai Kahan', artist: 'AUR', genres: ['lofi', 'indie', 'midnight'], mood: '☕ Midnight Nostalgia', tempo: 'slow' },
      { id: 'kJQP7kiw5Fk', title: 'Despacito', artist: 'Luis Fonsi, Daddy Yankee', genres: ['edm', 'pop', 'dance'], mood: '🔥 High Energy Fiesta', tempo: 'fast' },
      { id: 'k4yXQkG2s1E', title: 'G.O.A.T.', artist: 'Diljit Dosanjh', genres: ['punjabi', 'hiphop', 'bhangra'], mood: '👑 Unstoppable Flex', tempo: 'upbeat' },
      { id: 'qLCLvxTN9UA', title: 'Lover', artist: 'Diljit Dosanjh', genres: ['punjabi', 'pop', 'romance'], mood: '✨ Romantic Groove', tempo: 'upbeat' },
      { id: 'v7K4vGYL96U', title: 'Tu Jaana Na Piya', artist: 'King', genres: ['pop', 'indie', 'romance'], mood: '❤️ Romantic Pop', tempo: 'mid' },
      { id: 'YxWlaYCA8MU', title: 'Baarishein', artist: 'Anuv Jain', genres: ['acoustic', 'indie', 'lofi'], mood: '🌧️ Monsoon Solitude', tempo: 'slow' },
      { id: 'kffacxfA7G4', title: 'Baby', artist: 'Justin Bieber', genres: ['pop', 'nostalgia'], mood: '⚡ Pure Pop Euphoria', tempo: 'upbeat' },
      { id: 'hT_nvWreIhg', title: 'Counting Stars', artist: 'OneRepublic', genres: ['pop', 'rock', 'edm'], mood: '⚡ High Spirits', tempo: 'fast' },
      { id: 'OPf0YbXqDm0', title: 'Uptown Funk', artist: 'Mark Ronson, Bruno Mars', genres: ['dance', 'funk', 'edm'], mood: '🔥 Retro Groove', tempo: 'fast' },
      { id: '60ItHLz5WEA', title: 'Faded', artist: 'Alan Walker', genres: ['edm', 'electro', 'chill'], mood: '🌌 Dreamy Euphoria', tempo: 'mid' },
      { id: 'ALZHF5UqnU4', title: 'Alone', artist: 'Marshmello', genres: ['edm', 'future_bass'], mood: '⚡ Festival Bounce', tempo: 'fast' },
      { id: 'fRh_vgS2dFE', title: 'Sorry', artist: 'Justin Bieber', genres: ['dance', 'pop'], mood: '✨ Infectious Dance', tempo: 'upbeat' },
      { id: 'RgKAFK5djSk', title: 'See You Again', artist: 'Wiz Khalifa, Charlie Puth', genres: ['soul', 'pop', 'hiphop'], mood: '🕊️ Heartfelt Tribute', tempo: 'mid' },
      { id: 'CevxZvSJLk8', title: 'Roar', artist: 'Katy Perry', genres: ['pop', 'anthem'], mood: '🔥 Empowering Anthem', tempo: 'mid' },
      { id: 'hLQl3WQQoQ0', title: 'Someone Like You', artist: 'Adele', genres: ['acoustic', 'soul'], mood: '💔 Deep Piano Heartbreak', tempo: 'slow' },
      { id: 'L_LUpnjgPso', title: 'Tum Hi Ho', artist: 'Arijit Singh, Mithoon', genres: ['romance', 'bollywood', 'soul'], mood: '❤️ Timeless Ishq', tempo: 'slow' },
      { id: 'Ax0G_P2dSBw', title: 'Channa Mereya', artist: 'Arijit Singh, Pritam', genres: ['soul', 'bollywood', 'emotional'], mood: '💔 Soulful Parting', tempo: 'slow' },
      { id: 'KUpwupYj_tY', title: 'O Maahi', artist: 'Arijit Singh, Pritam', genres: ['romance', 'bollywood', 'acoustic'], mood: '✨ Eternal Devotion', tempo: 'mid' },
      { id: 'b5f25X2Gvfg', title: 'Pehle Bhi Main', artist: 'Vishal Mishra, Raj Shekhar', genres: ['romance', 'soul', 'dark_pop'], mood: '🥀 Obsessive Love', tempo: 'mid' },
      { id: 'Umqb9KENgmk', title: 'Saari Duniya Jalaa Denge', artist: 'B Praak, Jaani', genres: ['soul', 'punjabi', 'emotional'], mood: '🔥 Fierce Intensity', tempo: 'mid' },
      { id: 'tVLC3Phn4yU', title: 'Chaleya', artist: 'Arijit Singh, Shilpa Rao, Anirudh', genres: ['romance', 'dance', 'bollywood'], mood: '❤️ Joyous Romance', tempo: 'upbeat' },
      { id: 'BBAyRZZ9cG4', title: 'Satranga', artist: 'Arijit Singh, Shreyas Puranik', genres: ['romance', 'soul', 'classical'], mood: '🌈 7 Shades of Love', tempo: 'slow' },
      { id: '3vK3rZ3n2L0', title: 'Husn', artist: 'Anuv Jain', genres: ['indie', 'acoustic', 'lofi'], mood: '☕ Midnight Poetic Sigh', tempo: 'slow' },
      { id: 'mH_ELM-1j18', title: 'Jo Tum Mere Ho', artist: 'Anuv Jain', genres: ['indie', 'acoustic', 'romance'], mood: '❤️ Gentle Confession', tempo: 'slow' },
      { id: 'l8h_Ww99pT4', title: 'Alag Aasmaan', artist: 'Anuv Jain', genres: ['indie', 'acoustic'], mood: '🕊️ Long Distance Soul', tempo: 'slow' },
      { id: 'dZ0fwJojhrs', title: 'Wavy', artist: 'Karan Aujla', genres: ['punjabi', 'hiphop', 'trap'], mood: '⚡ Unmatched Swagger', tempo: 'upbeat' },
      { id: '2hK0cZg5tQY', title: 'Softly', artist: 'Karan Aujla, Ikky', genres: ['punjabi', 'pop', 'rnb'], mood: '✨ Smooth R&B Romance', tempo: 'mid' },
      { id: '6MgsHSAcI98', title: 'Winning Speech', artist: 'Karan Aujla', genres: ['punjabi', 'hiphop'], mood: '👑 Victorious Anthem', tempo: 'fast' },
      { id: 'V1Pl8CzNzCw', title: 'Tareefan', artist: 'Badshah, Qaran', genres: ['club', 'punjabi', 'pop'], mood: '🔥 Ultra Chic Glamour', tempo: 'upbeat' },
      { id: 'hEJnMQG562U', title: 'Illegal Weapon 2.0', artist: 'Jasmine Sandlas, Garry Sandhu', genres: ['punjabi', 'dance', 'bhangra'], mood: '⚡ High Octane Energy', tempo: 'fast' },
      { id: 'vX2cDW8up28', title: 'Amplifier', artist: 'Imran Khan', genres: ['nostalgia', 'punjabi', 'club'], mood: '🚗 Car Bass Banger', tempo: 'fast' },
      { id: 'V-_O7nl0Ii0', title: 'Love Nwantiti', artist: 'CKay', genres: ['afrobeats', 'romance', 'chill'], mood: '☕ Hypnotic Afro Love', tempo: 'mid' },
      { id: 'kOHB85vDuow', title: 'Calm Down', artist: 'Rema, Selena Gomez', genres: ['afrobeats', 'pop', 'dance'], mood: '✨ Sun-kissed Groove', tempo: 'mid' },
      { id: 'JGwWNGJdvx8', title: 'Shape of You', artist: 'Ed Sheeran', genres: ['pop', 'acoustic', 'dance'], mood: '❤️ Catchy Romance', tempo: 'upbeat' },
      { id: '2Vv-BfVoq4g', title: 'Perfect', artist: 'Ed Sheeran', genres: ['romance', 'acoustic', 'ballad'], mood: '💍 Timeless Wedding Vow', tempo: 'slow' },
      { id: 'lp-EO5I60KA', title: 'Starboy', artist: 'The Weeknd, Daft Punk', genres: ['rnb', 'synthwave', 'dark_pop'], mood: '⚡ Dark Electric Night', tempo: 'mid' },
      { id: '4NRXx6U8ABQ', title: 'Blinding Lights', artist: 'The Weeknd', genres: ['synthwave', '80s', 'pop'], mood: '🚗 Midnight Speed Drive', tempo: 'fast' },
      { id: '0NV1KdWRHck', title: 'Chura Ke Dil Mera', artist: 'Kumar Sanu, Alka Yagnik', genres: ['retro_90s', 'nostalgia', 'bollywood'], mood: '📼 90s Vintage Romance', tempo: 'mid' },
      { id: 'YQHsXMglC9A', title: 'Hello', artist: 'Adele', genres: ['soul', 'ballad'], mood: '🌧️ Soulful Echoes', tempo: 'slow' },
      { id: 'p7i88HqK_4k', title: 'Agar Tum Saath Ho', artist: 'Alka Yagnik, Arijit Singh', genres: ['romance', 'soul', 'bollywood'], mood: '💔 Tearful Embrace', tempo: 'slow' },
      { id: 'b9p_HjFq78c', title: 'Kun Faya Kun', artist: 'A.R. Rahman, Javed Ali, Mohit Chauhan', genres: ['sufi', 'spiritual', 'devotional'], mood: '🕊️ Divine Transience', tempo: 'slow' }
    ];

    function getProfile() {
      try {
        var raw = localStorage.getItem(VIBE_PROFILE_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      return {
        playedHistory: [],
        genres: { romance: 6, lofi: 6, acoustic: 5, bollywood: 6, punjabi: 4, soul: 5 },
        artists: { 'Arijit Singh': 6, 'Anuv Jain': 5, 'Diljit Dosanjh': 4 },
        moodKeywords: ['love', 'soul', 'night', 'chill'],
        lastAnalyzed: Date.now()
      };
    }

    function saveProfile(p) {
      try { localStorage.setItem(VIBE_PROFILE_KEY, JSON.stringify(p)); } catch (e) {}
    }

    function getMyVibesList() {
      try {
        var raw = localStorage.getItem(MY_VIBES_PLAYLIST_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      var initial = SONGS_CATALOG.slice(0, 16);
      saveMyVibesList(initial);
      return initial;
    }

    function saveMyVibesList(list) {
      try {
        localStorage.setItem(MY_VIBES_PLAYLIST_KEY, JSON.stringify(list));
        var countEl = $('recTabCount');
        if (countEl) countEl.textContent = list.length;
      } catch (e) {}
    }

    var lastLearnedTrackId = '';
    function learnFromTrack(track, weight) {
      if (!track || !track.title) return;
      weight = weight || 1;
      if (weight === 1 && track.id && lastLearnedTrackId === track.id) return;
      if (track.id) lastLearnedTrackId = track.id;

      var prof = getProfile();

      prof.playedHistory.unshift({
        id: track.id || '',
        title: track.title,
        artist: track.artist || '',
        time: Date.now()
      });
      if (prof.playedHistory.length > 50) prof.playedHistory = prof.playedHistory.slice(0, 50);

      var art = (track.artist || '').trim();
      if (art) {
        prof.artists[art] = (prof.artists[art] || 0) + (2 * weight);
      }

      var matchedCatalog = SONGS_CATALOG.find(function (s) { return s.id === track.id; });
      var detectedGenres = matchedCatalog ? matchedCatalog.genres.slice() : [];

      var text = (track.title + ' ' + (track.artist || '')).toLowerCase();
      if (text.indexOf('arijit') !== -1 || text.indexOf('ishq') !== -1 || text.indexOf('pyaar') !== -1 || text.indexOf('dil') !== -1 || text.indexOf('love') !== -1) {
        detectedGenres.push('romance', 'soul');
      }
      if (text.indexOf('lofi') !== -1 || text.indexOf('lo-fi') !== -1 || text.indexOf('chill') !== -1 || text.indexOf('midnight') !== -1 || text.indexOf('acoustic') !== -1) {
        detectedGenres.push('lofi', 'acoustic');
      }
      if (text.indexOf('punjabi') !== -1 || text.indexOf('diljit') !== -1 || text.indexOf('karan') !== -1 || text.indexOf('ap dhillon') !== -1) {
        detectedGenres.push('punjabi');
      }
      if (text.indexOf('edm') !== -1 || text.indexOf('remix') !== -1 || text.indexOf('club') !== -1 || text.indexOf('beat') !== -1 || text.indexOf('bass') !== -1) {
        detectedGenres.push('edm');
      }
      if (text.indexOf('90s') !== -1 || text.indexOf('retro') !== -1 || text.indexOf('sanu') !== -1 || text.indexOf('alka') !== -1) {
        detectedGenres.push('retro_90s');
      }

      detectedGenres.forEach(function (g) {
        prof.genres[g] = (prof.genres[g] || 0) + (1.5 * weight);
      });

      prof.lastAnalyzed = Date.now();
      saveProfile(prof);

      autoCurateNextVibes();
      renderVibeUI();
    }

    function scoreSong(song, prof) {
      var score = 0;
      if (song.genres && Array.isArray(song.genres)) {
        song.genres.forEach(function (g) {
          if (prof.genres[g]) score += prof.genres[g] * 2.2;
        });
      }
      if (song.artist) {
        for (var a in prof.artists) {
          if (song.artist.toLowerCase().indexOf(a.toLowerCase()) !== -1) {
            score += prof.artists[a] * 3.5;
          }
        }
      }
      score += Math.random() * 8;
      return score;
    }

    function generateVibeRecommendations(count) {
      count = count || 14;
      var prof = getProfile();

      var scored = SONGS_CATALOG.map(function (s) {
        return {
          track: s,
          score: scoreSong(s, prof)
        };
      });

      scored.sort(function (a, b) { return b.score - a.score; });
      return scored.slice(0, count).map(function (item) { return item.track; });
    }

    function autoCurateNextVibes() {
      var currentList = getMyVibesList();
      var recommendations = generateVibeRecommendations(20);
      var currentIds = {};
      currentList.forEach(function (s) { currentIds[s.id] = true; });

      var addedCount = 0;
      recommendations.forEach(function (rec) {
        if (!currentIds[rec.id] && currentList.length < 45) {
          currentList.push(rec);
          currentIds[rec.id] = true;
          addedCount++;
        }
      });

      if (addedCount > 0) {
        saveMyVibesList(currentList);
      }
    }

    function addToMyVibes(track) {
      if (!track || !track.id) return;
      var list = getMyVibesList();
      var exists = list.some(function (s) { return s.id === track.id; });
      if (!exists) {
        list.unshift(track);
        saveMyVibesList(list);
        learnFromTrack(track, 3);
        showToast('Added "' + cleanTitle(track.title) + '" to My Vibes! ✨');
      } else {
        showToast('Already in My Vibes! ✨');
      }
      renderVibeUI();
    }

    function removeFromMyVibes(trackId) {
      var list = getMyVibesList().filter(function (s) { return s.id !== trackId; });
      saveMyVibesList(list);
      renderVibeUI();
      showToast('Removed from My Vibes');
    }

    function playMyVibesStation() {
      var list = getMyVibesList();
      if (!list || !list.length) list = generateVibeRecommendations(20);
      if (!list.length) list = SONGS_CATALOG.slice(0, 15);

      var myVibesStation = DEFAULT_STATIONS.find(function (s) { return s.id === 'my-vibes'; });
      if (myVibesStation) {
        currentStationKey = 'my-vibes';
        currentStation = myVibesStation;
        applyStationTheme(myVibesStation);
        localStorage.setItem('ishq_station_key', 'my-vibes');
        activePlaylistId = 'my-vibes';

        document.querySelectorAll('.station-item').forEach(function (it) {
          it.classList.toggle('active', it.getAttribute('data-station') === 'my-vibes');
        });
      }

      var videoIds = list.map(function (s) { return s.id; }).filter(Boolean);
      try {
        if (player && player.loadPlaylist) {
          player.loadPlaylist(videoIds, 0, 0);
          setTimeout(function () {
            if (player.setShuffle) player.setShuffle(true);
            if (player.setLoop) player.setLoop(true);
          }, 400);
        } else if (list[0]) {
          playSingleTrack(list[0], true);
        }
      } catch (e) {
        if (list[0]) playSingleTrack(list[0], true);
      }

      show('s-ready');
      renderVibeUI();
      showToast('Streaming AI Personal Frequency: My Vibes ✨');
      setTimeout(update, 900);
    }


    function renderVibeUI() {
      var prof = getProfile();
      var myVibes = getMyVibesList();

      var sortedGenres = Object.keys(prof.genres).sort(function (a, b) {
        return prof.genres[b] - prof.genres[a];
      }).slice(0, 4);

      var topTagsEl = $('aiVibeTags');
      if (topTagsEl) {
        topTagsEl.innerHTML = sortedGenres.map(function (g) {
          return '<span class="vibe-tag">#' + g.toUpperCase() + '</span>';
        }).join('');
      }

      var statusEl = $('aiVibeStatus');
      if (statusEl) {
        var topG = sortedGenres[0] || 'Romance';
        var topG2 = sortedGenres[1] || 'Lo-Fi';
        statusEl.textContent = '🔮 Learned Taste: ' + topG.charAt(0).toUpperCase() + topG.slice(1) + ' & ' + topG2.charAt(0).toUpperCase() + topG2.slice(1) + ' (' + myVibes.length + ' personalized tracks)';
      }

      var recItemsContainer = $('vibeRecItems');
      if (!recItemsContainer) return;
      recItemsContainer.innerHTML = '';

      var countEl = $('recTabCount');
      if (countEl) countEl.textContent = myVibes.length;

      if (!myVibes.length) {
        recItemsContainer.innerHTML = '<div class="queue-empty">AI is discovering songs for your vibes…</div>';
        return;
      }

      myVibes.forEach(function (song) {
        var item = document.createElement('div');
        item.className = 'rec-item';
        var thumb = 'https://i.ytimg.com/vi/' + song.id + '/default.jpg';

        item.innerHTML = 
          '<div class="rec-left">' +
            '<img class="rec-thumb" src="' + thumb + '" alt="" loading="lazy">' +
            '<div class="rec-info">' +
              '<div class="rec-title">' + cleanTitle(song.title) + '</div>' +
              '<div class="rec-artist">' + (song.artist || 'AI Match') + '</div>' +
              '<span class="rec-badge">' + (song.mood || '✨ AI Match') + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="rec-actions">' +
            '<button class="rec-btn btn-stream-vibe" title="Play Now">▶ Play</button>' +
            '<button class="rec-btn btn-del-vibe" title="Remove" style="color:#ff4757;">&times;</button>' +
          '</div>';

        item.querySelector('.btn-stream-vibe').addEventListener('click', function (e) {
          e.stopPropagation();
          playSingleTrack(song);
          $('queuePanel').classList.remove('open');
          showToast('Streaming from My Vibes ✨');
        });

        item.querySelector('.btn-del-vibe').addEventListener('click', function (e) {
          e.stopPropagation();
          removeFromMyVibes(song.id);
        });

        recItemsContainer.appendChild(item);
      });
    }

    return {
      learnFromTrack: learnFromTrack,
      generateVibeRecommendations: generateVibeRecommendations,
      addToMyVibes: addToMyVibes,
      removeFromMyVibes: removeFromMyVibes,
      getMyVibesList: getMyVibesList,
      playMyVibesStation: playMyVibesStation,
      renderVibeUI: renderVibeUI,
      catalog: SONGS_CATALOG
    };
  })();


  /* ==================== PWA Service Worker Registration ==================== */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }

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
    }, 2500);
  }

  /* ==================== Dynamic Genre-Adaptive Theme Engine ==================== */
  function applyStationTheme(st) {
    if (!st || !st.theme) return;
    var th = st.theme;
    var root = document.documentElement;

    if (th.bg) root.style.setProperty('--bg', th.bg);
    if (th.fg) root.style.setProperty('--fg', th.fg);
    if (th.fgDim) root.style.setProperty('--fg-dim', th.fgDim);
    if (th.muted) root.style.setProperty('--muted', th.muted);
    if (th.accent) root.style.setProperty('--accent', th.accent);
    if (th.accentGlow) root.style.setProperty('--accent-glow', th.accentGlow);
    if (th.themeAmbient) root.style.setProperty('--theme-ambient', th.themeAmbient);
    if (th.fontFamily) root.style.setProperty('--theme-font', th.fontFamily);

    // Apply distinct station mode class to body for custom UI styling
    document.body.classList.remove('mode-time-travel', 'mode-ishq', 'mode-demanding', 'mode-90s', 'mode-edm');
    document.body.classList.add('mode-' + (th.uiMode || st.id));

    // Update Brand Title & Sub-heading
    if ($('brandTitle')) $('brandTitle').textContent = st.brand || st.name;
    if ($('brandSub')) $('brandSub').textContent = st.brandSub || (st.desc || '').toUpperCase();
    if ($('currentStationLabel')) $('currentStationLabel').textContent = st.short;
    if ($('loaderGlyph')) $('loaderGlyph').textContent = st.icon || '📻';
    if ($('errorGlyph')) $('errorGlyph').textContent = st.icon || '📻';
    if ($('counts')) $('counts').textContent = st.songCount || '4,000+ SONGS';

    // Update quote
    var qEl = $('shayariQuote');
    if (qEl) {
      qEl.style.opacity = '0';
      setTimeout(function () {
        qEl.textContent = th.quote || "\"Soundtrack for your current state of mind…\"";
        qEl.style.opacity = '0.85';
      }, 200);
    }

    // Update background glyphs dynamically with station-specific words
    var glyphsContainer = $('bgGlyphs');
    if (glyphsContainer && th.glyphs && Array.isArray(th.glyphs) && th.glyphs.length) {
      var g = th.glyphs;
      var cG = th.centerGlyph || g[0];
      glyphsContainer.innerHTML = 
        '<span class="glyph g1">' + (g[0] || 'VIBES') + '</span>' +
        '<span class="glyph g2">' + (g[1] || 'MUSIC') + '</span>' +
        '<span class="glyph g3">' + (g[2] || 'SOUND') + '</span>' +
        '<span class="glyph g4">' + (g[3] || 'AURA') + '</span>' +
        '<span class="glyph g5">' + (g[4] || 'WAVE') + '</span>' +
        '<span class="glyph g6">' + (g[5] || 'ECHO') + '</span>' +
        '<span class="heart-glyph" id="centerHeartGlyph">' + cG + '</span>';
    }
  }

  /* ==================== Clean Song Title Helper ==================== */
  function cleanTitle(raw) {
    if (!raw) return 'Now Playing';
    return raw
      .replace(/\[.*?\]/g, '')
      .replace(/\(.*?(official|video|audio|lyric|hd|4k|remix|version|visualizer|full song|coke studio|season|soundtrack|ost|film|movie|teaser|trailer|album|jukebox|song).*?\)/gi, '')
      .replace(/\b(audio\s+jukebox|jukebox|full\s+album|all\s+songs|non\s+stop|mashup|lo-fi|lofi|slowed\s*\+?\s*reverb|full\s+song|video\s+song|lyrical\s+video|official\s+video|official\s+audio|original\s+soundtrack|title\s+track|4k\s+ultra\s+hd|hd\s+1080p|1080p|720p|hd|hq)\b/gi, '')
      .replace(/\|.*$/g, '')
      .replace(/- official.*$/gi, '')
      .replace(/feat\..*$/gi, '')
      .replace(/ft\..*$/gi, '')
      .replace(/[-–—\s]+$/, '')
      .replace(/^[-–—\s]+/, '')
      .trim() || raw;
  }


  /* ==================== Station Catalogue Loader ==================== */
  function loadStationsData(isSync) {
    // ALWAYS use DEFAULT_STATIONS from code — never trust localStorage for station configs
    // (localStorage may have stale playlist IDs from previous sessions)
    stations = DEFAULT_STATIONS.slice();

    // Persist fresh stations to localStorage for sync channel
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stations)); } catch(e) {}

    initStationDropdown();
    if (isSync) syncCurrentStation();
  }

  function initStationDropdown() {
    var listContainer = $('stationItemsList');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    if (!stations || !stations.length) {
      stations = DEFAULT_STATIONS.slice();
    }

    var matched = stations.find(function (s) { return s.id === currentStationKey; });
    if (!matched) {
      currentStation = stations[0];
      currentStationKey = stations[0].id;
      localStorage.setItem('ishq_station_key', currentStationKey);
    } else {
      currentStation = matched;
    }

    applyStationTheme(currentStation);

    stations.forEach(function (st) {
      var item = document.createElement('div');
      item.className = 'station-item' + (st.id === currentStationKey ? ' active' : '');
      item.setAttribute('data-station', st.id);
      
      var accent = (st.theme && st.theme.accent) ? st.theme.accent : '#a855f7';

      item.innerHTML = 
        '<div class="st-icon">' + (st.icon || '📻') + '</div>' +
        '<div class="st-info">' +
          '<div class="st-title">' + st.name + '</div>' +
          '<div class="st-desc">' + (st.desc || '') + '</div>' +
        '</div>' +
        '<div style="width:8px;height:8px;border-radius:50%;background:' + accent + ';opacity:0.8;"></div>';

      item.addEventListener('click', function () {
        switchStation(st.id);
      });

      listContainer.appendChild(item);
    });
  }

  function syncCurrentStation() {
    var matched = stations.find(function (s) { return s.id === currentStationKey; });
    if (matched) {
      currentStation = matched;
      applyStationTheme(matched);
      document.querySelectorAll('.station-item').forEach(function (it) {
        it.classList.toggle('active', it.getAttribute('data-station') === currentStationKey);
      });
    }
  }

  /* ==================== Station Dropdown & Switcher ==================== */
  var stationSelectBtn = $('stationSelectBtn');
  var stationDropdown = $('stationDropdown');

  stationSelectBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    stationDropdown.classList.toggle('open');
  });

  stationDropdown.addEventListener('click', function (e) {
    e.stopPropagation();
  });

  document.addEventListener('click', function () {
    stationDropdown.classList.remove('open');
  });

  function switchStation(stKey) {
    var st = stations.find(function (s) { return s.id === stKey; });
    if (!st) return;

    // Prevent duplicate switch to same station
    if (currentStationKey === stKey && activePlaylistId === st.playlistId) {
      stationDropdown.classList.remove('open');
      return;
    }

    currentStationKey = stKey;
    currentStation = st;
    localStorage.setItem('ishq_station_key', stKey);

    document.querySelectorAll('.station-item').forEach(function (it) {
      it.classList.toggle('active', it.getAttribute('data-station') === stKey);
    });

    stationDropdown.classList.remove('open');
    showToast('Tuning to: ' + st.name);

    applyStationTheme(st);
    loadStationPlayback(st);
  }

  var activePlaylistId = '';
  var stationSwitchTimer = null;

  function loadStationPlayback(st) {
    if (!player) return;
    claimAudioMaster();

    // Clear any pending switch
    if (stationSwitchTimer) clearTimeout(stationSwitchTimer);

    // Check if this is the AI My Vibes station
    if (st.id === 'my-vibes') {
      stationSwitchTimer = setTimeout(function () {
        if (currentStationKey !== 'my-vibes') return;
        VibeAgent.playMyVibesStation();
      }, 250);
      return;
    }

    var plId = (st.playlistId && st.playlistId.startsWith('PL')) ? st.playlistId : 'PLITHjw3sQBek';

    // Stop current video first to prevent old playlist audio bleeding
    try { player.stopVideo(); } catch (e) {}

    // Short pause so YouTube releases the old playlist before loading new one
    stationSwitchTimer = setTimeout(function () {
      // Double-check we still want this station (user may have switched again)
      if (st.id !== currentStationKey) return;

      try {
        player.loadPlaylist({
          list: plId,
          listType: 'playlist',
          index: 0,
          startSeconds: 0
        });
        activePlaylistId = plId;
        setTimeout(function () {
          if (player.setShuffle) player.setShuffle(true);
          if (player.setLoop) player.setLoop(true);
        }, 500);
      } catch (e) {}

      show('s-ready');
      VibeAgent.renderVibeUI();
      setTimeout(update, 900);
    }, 350);
  }

  /* ==================== Track Skipper (4,000+ YouTube Playlist Next/Prev) ==================== */
  function skip(dir) {
    if (!apiReady || !player) return;
    claimAudioMaster();
    if (skipDebounce) return;
    skipDebounce = true;
    setTimeout(function () { skipDebounce = false; }, 400);

    try {
      if (dir === 'next') {
        if (player.nextVideo) player.nextVideo();
        showToast('Skipping to Next Song ⏭️');
      } else {
        if (player.previousVideo) player.previousVideo();
        showToast('Previous Song ⏮️');
      }
    } catch (e) {}

    setTimeout(update, 700);
  }



  /* ==================== 3D Interactive Card Perspective Tilt & Glare ==================== */
  (function initCardTilt() {
    var card = $('artCard');
    var turntable = document.querySelector('.turntable-wrap');
    var glare = document.querySelector('.art-glare');
    if (!card || !turntable) return;

    turntable.addEventListener('mousemove', function (e) {
      var rect = turntable.getBoundingClientRect();
      var x = e.clientX - rect.left - rect.width / 2;
      var y = e.clientY - rect.top - rect.height / 2;
      var rotateX = (-y / (rect.height / 2)) * 14;
      var rotateY = (x / (rect.width / 2)) * 14;

      card.style.transform = 'perspective(800px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) scale3d(1.04, 1.04, 1.04)';
      if (glare) {
        var glareX = (e.clientX - rect.left) / rect.width * 100;
        var glareY = (e.clientY - rect.top) / rect.height * 100;
        glare.style.background = 'radial-gradient(circle at ' + glareX + '% ' + glareY + '%, rgba(255,255,255,0.22) 0%, transparent 60%)';
      }
    });

    turntable.addEventListener('mouseleave', function () {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      if (glare) {
        glare.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 60%)';
      }
    });
  })();

  /* ==================== High-Fidelity Multi-Genre YouTube Music Database ==================== */
  var YOUTUBE_DISCOVERY_CATALOG = [
    // ── ISHQ / Romantic & Soul Anthems ──
    { id: 'Umqb9KENgmk', title: 'Tum Hi Ho', artist: 'Arijit Singh · Mithoon', genre: 'ishq', mood: '❤️ Romance', tags: ['arijit', 'tum hi ho', 'aashiqui', 'love', 'romantic', 'slow'] },
    { id: 'BddP6PYo2gs', title: 'Kesariya', artist: 'Arijit Singh · Pritam', genre: 'ishq', mood: '❤️ Romance', tags: ['kesariya', 'brahmastra', 'arijit', 'ranbir', 'love'] },
    { id: 'ElZfdU54Cp8', title: 'Apna Bana Le', artist: 'Arijit Singh · Sachin-Jigar', genre: 'ishq', mood: '❤️ Romance', tags: ['apna bana le', 'bhediya', 'arijit', 'love', 'romantic'] },
    { id: 'sK7riqg2mr4', title: 'Agar Tum Saath Ho', artist: 'Alka Yagnik & Arijit Singh · AR Rahman', genre: 'ishq', mood: '🕊️ Soul', tags: ['agar tum saath ho', 'tamasha', 'arijit', 'deep', 'sad'] },
    { id: '284Ov7ysmfA', title: 'Channa Mereya', artist: 'Arijit Singh · Pritam', genre: 'ishq', mood: '🕊️ Soul', tags: ['channa mereya', 'ae dil hai mushkil', 'arijit', 'soul'] },
    { id: 'K248U_3j4yU', title: 'Hamari Adhuri Kahani', artist: 'Arijit Singh · Jeet Gannguli', genre: 'ishq', mood: '💔 Melancholy', tags: ['hamari adhuri kahani', 'arijit', 'sad', 'heartbreak'] },
    { id: 'd6gI03uE3oY', title: 'Hasi Ban Gaye', artist: 'Shreya Ghoshal · Ami Mishra', genre: 'ishq', mood: '✨ Melodic', tags: ['hasi ban gaye', 'shreya ghoshal', 'romantic', 'sweet'] },
    { id: 'jHNNMj5bNQw', title: 'Kabira (Encore)', artist: 'Arijit Singh & Harshdeep Kaur', genre: 'ishq', mood: '🕊️ Soul', tags: ['kabira', 'arijit', 'yjhd', 'acoustic', 'sufi'] },
    { id: 'bSdnzVp6wQI', title: 'Shayad', artist: 'Arijit Singh · Pritam', genre: 'ishq', mood: '❤️ Romance', tags: ['shayad', 'love aaj kal', 'arijit', 'kartik', 'love'] },
    { id: '1uYWYWPcKqU', title: 'Raanjhanaa', artist: 'Jaswinder Singh & Shiraz Uppal · AR Rahman', genre: 'ishq', mood: '🕊️ Sufi', tags: ['raanjhanaa', 'dhanush', 'ar rahman', 'love'] },
    { id: '4n4u3sZ9f_g', title: 'Faasle (Lo-Fi Acoustic)', artist: 'Aditya A', genre: 'ishq', mood: '☕ Lo-Fi', tags: ['faasle', 'aditya a', 'lofi', 'chill', 'aesthetic'] },
    { id: 'gvyUuxdRdR4', title: 'Baarishein', artist: 'Anuv Jain', genre: 'ishq', mood: '🌧️ Acoustic', tags: ['baarishein', 'anuv jain', 'indie', 'guitar', 'rain'] },
    { id: 'W0DM5lcj6mw', title: 'Kho Gaye Hum Kahan', artist: 'Jasleen Royal & Prateek Kuhad', genre: 'ishq', mood: '✨ Indie', tags: ['kho gaye hum kahan', 'prateek kuhad', 'jasleen', 'dreamy'] },

    // ── Demand / High Energy & Punjabi Chartbusters ──
    { id: 'mH_LFkWMTI4', title: 'Lover', artist: 'Diljit Dosanjh · Intense', genre: 'demand', mood: '🔥 Pop', tags: ['lover', 'diljit dosanjh', 'punjabi', 'moonchild', 'hype'] },
    { id: '1F3hm6MfR1k', title: 'Born to Shine', artist: 'Diljit Dosanjh · Desi Crew', genre: 'demand', mood: '⚡ Swagger', tags: ['born to shine', 'diljit dosanjh', 'goat', 'banger'] },
    { id: 'vX2cDW8LUWk', title: 'Excuses', artist: 'AP Dhillon & Gurinder Gill · Intense', genre: 'demand', mood: '🌊 Vibe', tags: ['excuses', 'ap dhillon', 'gurinder gill', 'kehndi hundi si'] },
    { id: 'VNs_cCtdbPc', title: 'Brown Munde', artist: 'AP Dhillon, Gurinder Gill, Shinda Kahlon', genre: 'demand', mood: '🔥 Anthem', tags: ['brown munde', 'ap dhillon', 'hip hop', 'trap'] },
    { id: 'cWMxCE2HTag', title: 'Softly', artist: 'Karan Aujla · Ikky', genre: 'demand', mood: '✨ Smooth', tags: ['softly', 'karan aujla', 'four me', 'punjabi', 'viral'] },
    { id: 'JgV2lGvCj5Q', title: 'Players', artist: 'Badshah & Karan Aujla', genre: 'demand', mood: '⚡ Trap', tags: ['players', 'badshah', 'karan aujla', 'drill', 'hype'] },
    { id: 'g9i_VqV-J2M', title: 'Proper Patola', artist: 'Diljit Dosanjh & Badshah', genre: 'demand', mood: '🔥 Party', tags: ['proper patola', 'diljit', 'badshah', 'club'] },
    { id: 'cl0a3i2wFcc', title: 'G.O.A.T.', artist: 'Diljit Dosanjh', genre: 'demand', mood: '👑 Banger', tags: ['goat', 'diljit dosanjh', 'punjabi', 'fire'] },

    // ── Coke Studio & Sufi Legends ──
    { id: '5Eqb_-j3FDA', title: 'Pasoori', artist: 'Ali Sethi x Shae Gill · Coke Studio', genre: 'timetravel', mood: '🕊️ Global Folk', tags: ['pasoori', 'ali sethi', 'shae gill', 'coke studio', 'pakistani'] },
    { id: '7D4vNcK6D38', title: 'Tu Jhoom', artist: 'Abida Parveen x Naseebo Lal', genre: 'timetravel', mood: '🕊️ Sufi Trance', tags: ['tu jhoom', 'abida parveen', 'naseebo lal', 'coke studio'] },
    { id: 'kw4tT7SCmaY', title: 'Afreen Afreen', artist: 'Rahat Fateh Ali Khan & Momina Mustehsan', genre: 'timetravel', mood: '❤️ Qawwali', tags: ['afreen afreen', 'rahat fateh ali khan', 'momina', 'coke studio'] },
    { id: 'a18py61_F_w', title: 'Tajdar-e-Haram', artist: 'Atif Aslam · Coke Studio', genre: 'timetravel', mood: '🕊️ Devotional', tags: ['tajdar e haram', 'atif aslam', 'sufi', 'qawwali'] },
    { id: 'zQDAi8tP-cU', title: 'Kana Yaari', artist: 'Kaifi Khalil, Eva B, Wahab Bugti', genre: 'timetravel', mood: '🌊 Balochi Wave', tags: ['kana yaari', 'kaifi khalil', 'coke studio', 'folk'] },
    { id: '_XBVWlI8TsQ', title: 'Kahani Suno 2.0', artist: 'Kaifi Khalil', genre: 'ishq', mood: '💔 Soulful', tags: ['kahani suno', 'kaifi khalil', 'mujhe pyaar hua tha', 'sad'] },

    // ── 90s Golden Bollywood & Retro Evergreen ──
    { id: '1zyhQjQh6uE', title: 'Pal Pal Dil Ke Paas', artist: 'Kishore Kumar · Kalyanji Anandji', genre: '90s', mood: '📼 Retro Gold', tags: ['pal pal dil ke paas', 'kishore kumar', 'dharmendra', 'retro'] },
    { id: 'HENaoxX41xM', title: 'Roop Tera Mastana', artist: 'Kishore Kumar · SD Burman', genre: '90s', mood: '📼 Classic', tags: ['roop tera mastana', 'kishore kumar', 'aradhana', 'evergreen'] },
    { id: 'T3b6T9P7j_o', title: 'Pehla Nasha', artist: 'Udit Narayan & Sadhana Sargam · Jatin-Lalit', genre: '90s', mood: '📼 90s Magic', tags: ['pehla nasha', 'udit narayan', 'jo jeeta wohi sikandar', '90s'] },
    { id: 'cNV5hLKh980', title: 'Tujhe Dekha Toh Yeh Jaana Sanam', artist: 'Kumar Sanu & Lata Mangeshkar · Jatin-Lalit', genre: '90s', mood: '📼 90s Love', tags: ['tujhe dekha toh', 'ddlj', 'kumar sanu', 'shah rukh khan'] },
    { id: 'Qz9T3yF8wE8', title: 'Yeh Shaam Mastani', artist: 'Kishore Kumar · RD Burman', genre: '90s', mood: '📼 Sunset Gold', tags: ['yeh shaam mastani', 'kishore kumar', 'rd burman', 'retro'] },
    { id: '_L0k5H6m3pM', title: 'Chura Liya Hai Tumne Jo Dil Ko', artist: 'Asha Bhosle & Mohd Rafi · RD Burman', genre: '90s', mood: '📼 Timeless', tags: ['chura liya hai', 'rd burman', 'asha bhosle', 'zeenat aman'] },
    { id: '0vG_6_e1K3g', title: 'Tip Tip Barsa Paani', artist: 'Alka Yagnik & Udit Narayan · Viju Shah', genre: '90s', mood: '📼 90s Rain', tags: ['tip tip barsa paani', 'mohra', 'alka yagnik', 'udit narayan'] },

    // ── EDM & Electronic Festival Hits ──
    { id: 'gCYcHz2167o', title: 'Animals', artist: 'Martin Garrix · Spinnin Records', genre: 'edm', mood: '⚡ Festival Drop', tags: ['animals', 'martin garrix', 'edm', 'club', 'festival'] },
    { id: '60ItHLz5WEA', title: 'Faded', artist: 'Alan Walker · NCS', genre: 'edm', mood: '🌌 Melodic Bass', tags: ['faded', 'alan walker', 'electronic', 'nostalgia'] },
    { id: 'IcrbM1l_BoI', title: 'Wake Me Up', artist: 'Avicii · Aloe Blacc', genre: 'edm', mood: '⚡ Electro Folk', tags: ['wake me up', 'avicii', 'country edm', 'timeless'] },
    { id: 'JRfuAukYTKg', title: 'Titanium', artist: 'David Guetta ft. Sia', genre: 'edm', mood: '⚡ Stadium Pop', tags: ['titanium', 'david guetta', 'sia', 'dance', 'anthem'] },
    { id: '1y6smkh6c-0', title: 'Don\'t You Worry Child', artist: 'Swedish House Mafia ft. John Martin', genre: 'edm', mood: '✨ Euphoria', tags: ['dont you worry child', 'swedish house mafia', 'progressive house'] },
    { id: 'ALZHF5UqnU4', title: 'Alone', artist: 'Marshmello · Monstercat', genre: 'edm', mood: '⚡ Future Bass', tags: ['alone', 'marshmello', 'edm', 'banger'] },
    { id: 'AOeY-nDp7hI', title: 'The Spectre', artist: 'Alan Walker', genre: 'edm', mood: '🌌 Cyber Bass', tags: ['the spectre', 'alan walker', 'synth', 'bass'] },
    { id: 'e2vBLd5Egnk', title: 'Scared to Be Lonely', artist: 'Martin Garrix & Dua Lipa', genre: 'edm', mood: '⚡ Melodic', tags: ['scared to be lonely', 'martin garrix', 'dua lipa', 'future bass'] },
    { id: 'jfKfPfyJRdk', title: 'Cyber Synthwave Beats', artist: 'Synth Horizon', genre: 'edm', mood: '🌙 Synthwave', tags: ['synthwave', 'retrowave', 'cyberpunk', 'chill'] }
  ];

  /* ==================== Dynamic Station-Aware Smart Recommendations ==================== */

  function generateRecommendations() {
    var recList = $('recList');
    var countEl = $('recTabCount');
    if (!recList) return;

    // Filter catalog based on active station key
    var matched = YOUTUBE_DISCOVERY_CATALOG.filter(function (t) {
      if (currentStationKey === 'ishq') return t.genre === 'ishq' || t.mood.indexOf('Romance') !== -1 || t.mood.indexOf('Soul') !== -1;
      if (currentStationKey === 'demand') return t.genre === 'demand' || t.mood.indexOf('Pop') !== -1 || t.mood.indexOf('Swagger') !== -1 || t.mood.indexOf('Anthem') !== -1;
      if (currentStationKey === '90s') return t.genre === '90s';
      if (currentStationKey === 'edm') return t.genre === 'edm';
      return true;
    });

    if (!matched.length) matched = YOUTUBE_DISCOVERY_CATALOG.slice(0, 8);

    // Shuffle and pick 6 to 8 items
    var shuffled = matched.slice().sort(function () { return 0.5 - Math.random(); }).slice(0, 8);

    if (countEl) countEl.textContent = shuffled.length;
    recList.innerHTML = '';

    shuffled.forEach(function (track) {
      var card = document.createElement('div');
      card.className = 'rec-item';
      var thumb = 'https://i.ytimg.com/vi/' + track.id + '/mqdefault.jpg';

      card.innerHTML = 
        '<div class="rec-left">' +
          '<img class="rec-thumb" src="' + thumb + '" alt="" loading="lazy">' +
          '<div class="rec-info">' +
            '<div class="rec-title">' + track.title + '</div>' +
            '<div class="rec-artist">' + track.artist + '</div>' +
            '<span class="rec-badge">' + track.mood + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="rec-actions">' +
          '<button class="rec-btn btn-rec-play" title="Play Now">▶ Play</button>' +
          '<button class="rec-btn btn-rec-queue" title="Add to Queue">+ Queue</button>' +
        '</div>';

      card.querySelector('.btn-rec-play').addEventListener('click', function (e) {
        e.stopPropagation();
        playSingleTrack(track);
        showToast('Playing: ' + track.title + ' 🎶');
      });

      card.querySelector('.btn-rec-queue').addEventListener('click', function (e) {
        e.stopPropagation();
        addToQueue(track);
      });

      card.addEventListener('click', function () {
        playSingleTrack(track);
        showToast('Playing: ' + track.title + ' 🎶');
      });

      recList.appendChild(card);
    });
  }

  function addToQueue(track) {
    if (!track || !track.id) return;
    var exists = sessionHistory.some(function (t) { return t.id === track.id; });
    if (!exists) {
      sessionHistory.push({ id: track.id, title: track.title, artist: track.artist });
      renderSessionQueue();
      showToast('Added to Queue: ' + track.title + ' 🎶');
    } else {
      showToast('Already in Queue: ' + track.title);
    }
  }

  var EXPLORER_STATION = {
    id: 'explorer',
    name: 'YouTube Explorer',
    short: 'YouTube 📺',
    brand: 'YOUTUBE EXPLORER',
    brandSub: 'LIVE STREAM // DIRECT AUDIO',
    icon: '📺',
    songCount: 'UNLIMITED YOUTUBE',
    desc: 'Direct YouTube Music Streaming',
    theme: {
      accent: '#ff0033',
      accentGlow: 'rgba(255, 0, 51, 0.45)',
      bg: '#08080a',
      fg: '#ffffff',
      fgDim: '#e4e4e7',
      muted: '#a1a1aa',
      quote: '"Exploring the infinite universe of music on YouTube…"',
      uiMode: 'explorer',
      glyphs: ['YOUTUBE', 'STREAM', 'EXPLORE', 'VIBES', 'SOUND', 'INFINITY'],
      centerGlyph: 'YOUTUBE'
    }
  };

  function playSingleTrack(track, preserveStation) {
    if (!player || !track || !track.id) return;
    claimAudioMaster();

    if (!preserveStation) {
      // Switch Station State to YouTube Explorer only when played from search/explorer cards
      currentStationKey = 'explorer';
      currentStation = EXPLORER_STATION;
      activePlaylistId = '';
      applyStationTheme(EXPLORER_STATION);

      // Remove active ring from radio stations in the dropdown list
      document.querySelectorAll('.station-item').forEach(function (it) {
        it.classList.remove('active');
      });
    }


    try {
      if (player.loadVideoById) {
        player.loadVideoById(track.id);
      }
    } catch (e) {}

    // Instant UI update for zero latency
    var titleEl = $('title');
    if (titleEl) titleEl.textContent = cleanTitle(track.title || 'Now Playing');
    var artistEl = $('artist');
    if (artistEl) artistEl.textContent = track.artist || 'Aura Stream';

    var artImg = $('art');
    var ambientImg = $('ambientArt');
    var thumbMq = 'https://i.ytimg.com/vi/' + track.id + '/mqdefault.jpg';
    var thumbHq = 'https://i.ytimg.com/vi/' + track.id + '/hqdefault.jpg';
    if (artImg) artImg.src = thumbMq;
    if (ambientImg) ambientImg.src = thumbHq;

    document.body.classList.add('playing', 'has-art');

    // Add to session queue
    var exists = sessionHistory.some(function (t) { return t.id === track.id; });
    if (!exists) {
      sessionHistory.unshift({ id: track.id, title: track.title, artist: track.artist });
      renderSessionQueue();
    }

    generateRecommendations();
    updateBackgroundWords(track.title, track.artist);
    setTimeout(update, 800);
  }


  $('upNextPlayBtn').addEventListener('click', function (e) {
    e.stopPropagation();
    skip('next');
  });

  $('upNextPill').addEventListener('click', function () {
    skip('next');
  });

  $('discoverSimilarBtn').addEventListener('click', function () {
    $('queuePanel').classList.add('open');
    $('recTabBtn').click();
  });

  /* ==================== Dynamic Background Word Animator ==================== */
  function updateBackgroundWords(title, artist) {
    var glyphsContainer = $('bgGlyphs');
    if (!glyphsContainer) return;

    var cleanT = cleanTitle(title);
    var tokens = (cleanT + ' ' + (artist || ''))
      .replace(/[♪(),.!?:;\"'—–\-\[\]\d\/\\]/g, ' ')
      .split(/\s+/)
      .map(function (w) { return w.trim().toUpperCase(); })
      .filter(function (w) { return w.length >= 4; });

    var defaults = ['TIMELESS', 'INFINITY', 'ECHOES', 'CELESTIAL', 'SYMPHONY', 'HORIZON', 'AURA'];
    if (currentStationKey === 'ishq') {
      defaults = ['इश्क़', 'रूहानी', 'सुकून', 'मोहब्बत', 'धड़कन', 'आफ़रीन', 'चाहत'];
    } else if (currentStationKey === 'demand') {
      defaults = ['PASSION', 'FIRE', 'ENERGY', 'HYPER', 'DESIRE', 'SURGE', 'PULSE'];
    } else if (currentStationKey === '90s') {
      defaults = ['NOSTALGIA', 'CLASSIC', 'MELODY', 'EVERGREEN', 'RETRO', 'GOLDEN', 'VINTAGE'];
    } else if (currentStationKey === 'edm') {
      defaults = ['EUPHORIA', 'MATRIX', 'BASS', 'SYNTH', 'DROP', 'ELECTRIC', 'FREQUENCY'];
    }

    var words = tokens.slice(0, 7);
    for (var i = 0; i < defaults.length && words.length < 7; i++) {
      if (words.indexOf(defaults[i]) === -1) words.push(defaults[i]);
    }

    glyphsContainer.style.opacity = '0';
    setTimeout(function () {
      glyphsContainer.innerHTML =
        '<span class="glyph g1">' + (words[0] || 'VIBES') + '</span>' +
        '<span class="glyph g2">' + (words[1] || 'MUSIC') + '</span>' +
        '<span class="glyph g3">' + (words[2] || 'SOUND') + '</span>' +
        '<span class="glyph g4">' + (words[3] || 'AURA') + '</span>' +
        '<span class="glyph g5">' + (words[4] || 'WAVE') + '</span>' +
        '<span class="glyph g6">' + (words[5] || 'ECHO') + '</span>' +
        '<span class="heart-glyph" id="centerHeartGlyph">' + (words[0] || 'TIMELESS') + '</span>';
      glyphsContainer.style.opacity = '1';
    }, 400);
  }


  /* ==================== Dedicated YouTube Music Universe Controller ==================== */

  var explorerUniverseView = $('explorerUniverseView');
  var currentUniversePlayingTrack = null;

  function enterExplorerUniverse() {
    document.body.classList.add('in-explorer-mode');
    if (explorerUniverseView) {
      explorerUniverseView.style.display = 'flex';
    }
    updateUniverseFavsCount();
    renderUniverseCards('Trending');

    // Sync now playing banner if a track is currently streaming
    syncUniverseNowPlayingBanner();

    var searchInput = $('uniYtSearchInput');
    if (searchInput) searchInput.focus();
  }

  function exitExplorerUniverse() {
    document.body.classList.remove('in-explorer-mode');
    if (explorerUniverseView) {
      explorerUniverseView.style.display = 'none';
    }
  }

  $('ytExplorerBtn').addEventListener('click', function () {
    enterExplorerUniverse();
  });

  $('backToRadioBtn').addEventListener('click', function () {
    exitExplorerUniverse();
  });

  // Keyboard shortcut 'E' for Explorer
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'e' || e.key === 'E') {
      if (document.body.classList.contains('in-explorer-mode')) {
        exitExplorerUniverse();
      } else {
        enterExplorerUniverse();
      }
    }
  });

  function updateUniverseFavsCount() {
    var countEl = $('uniFavsCount');
    if (countEl) countEl.textContent = likedSongs.length;
    var favTabCount = $('favTabCount');
    if (favTabCount) favTabCount.textContent = likedSongs.length;
  }

  function toggleUniverseLike(track) {
    if (!track || !track.id) return;
    var idx = likedSongs.findIndex(function (s) { return s.id === track.id; });
    var isNowLiked = false;

    if (idx >= 0) {
      likedSongs.splice(idx, 1);
      showToast('Removed from Favorites');
    } else {
      likedSongs.push({ id: track.id, title: track.title, artist: track.artist });
      isNowLiked = true;
      showToast('Saved to Favorites ❤️');
      // AI Vibe learning & Auto-add
      VibeAgent.learnFromTrack(track, 3);
      VibeAgent.addToMyVibes(track);
    }

    localStorage.setItem('ishq_liked_songs', JSON.stringify(likedSongs));
    updateUniverseFavsCount();
    renderLikedList();

    // Update Banner Fav button if this track is on banner
    if (currentUniversePlayingTrack && currentUniversePlayingTrack.id === track.id) {
      var bFavBtn = $('expBannerFavBtn');
      var bFavLbl = $('expBannerFavLabel');
      if (bFavBtn) bFavBtn.classList.toggle('liked', isNowLiked);
      if (bFavLbl) bFavLbl.textContent = isNowLiked ? 'Liked ❤️' : 'Add to Fav';
    }

    // Refresh active grid cards favorite icons
    document.querySelectorAll('.btn-card-fav[data-id="' + track.id + '"]').forEach(function (btn) {
      btn.classList.toggle('liked', isNowLiked);
      btn.innerHTML = isNowLiked ? '❤️ Liked' : '🤍 Fav';
    });
  }

  function syncUniverseNowPlayingBanner(track) {
    var banner = $('expNowPlayingBanner');
    if (!banner) return;

    if (!track) {
      var d = player && player.getVideoData ? player.getVideoData() : null;
      if (d && d.video_id) {
        track = {
          id: d.video_id,
          title: cleanTitle(d.title || 'Now Playing'),
          artist: d.author || 'YouTube Artist'
        };
      }
    }

    if (!track || !track.id) {
      banner.style.display = 'none';
      return;
    }

    currentUniversePlayingTrack = track;
    banner.style.display = 'flex';

    var thumbEl = $('expBannerThumb');
    var titleEl = $('expBannerTitle');
    var artistEl = $('expBannerArtist');
    var favBtn = $('expBannerFavBtn');
    var favLbl = $('expBannerFavLabel');

    if (thumbEl) thumbEl.src = 'https://i.ytimg.com/vi/' + track.id + '/mqdefault.jpg';
    if (titleEl) titleEl.textContent = track.title;
    if (artistEl) artistEl.textContent = track.artist;

    var isLiked = likedSongs.some(function (s) { return s.id === track.id; });
    if (favBtn) favBtn.classList.toggle('liked', isLiked);
    if (favLbl) favLbl.textContent = isLiked ? 'Liked ❤️' : 'Add to Fav';
  }

  $('expBannerFavBtn').addEventListener('click', function () {
    if (currentUniversePlayingTrack) {
      toggleUniverseLike(currentUniversePlayingTrack);
    }
  });

  function renderUniverseCards(queryOrFilter) {
    var grid = $('expUniGrid');
    if (!grid) return;

    var matched = [];
    var q = (queryOrFilter || '').trim().toLowerCase();

    if (q === 'my-vibes') {
      matched = VibeAgent.getMyVibesList().map(function (s) {
        return {
          id: s.id,
          title: s.title,
          artist: s.artist,
          mood: s.mood || '✨ My Vibe',
          genre: 'my-vibes',
          tags: ['my-vibes', 'ai']
        };
      });
    } else if (!q || q === 'trending' || q === 'all') {
      matched = YOUTUBE_DISCOVERY_CATALOG.slice().sort(function () { return 0.5 - Math.random(); });
    } else if (q === 'favorites' || q === 'liked') {
      matched = likedSongs.map(function (s) {
        return {
          id: s.id,
          title: s.title,
          artist: s.artist,
          mood: '❤️ Favorite',
          genre: 'fav',
          tags: ['fav']
        };
      });
    } else {
      var qTokens = q.split(/\s+/).filter(Boolean);
      matched = YOUTUBE_DISCOVERY_CATALOG.filter(function (item) {
        var fullText = (item.title + ' ' + item.artist + ' ' + item.tags.join(' ') + ' ' + item.genre + ' ' + item.mood).toLowerCase();
        return qTokens.some(function (tok) { return fullText.indexOf(tok) !== -1; });
      });

      if (!matched.length) {
        matched = YOUTUBE_DISCOVERY_CATALOG.slice(0, 8);
      }
    }


    grid.innerHTML = '';

    if (!matched.length) {
      grid.innerHTML = '<div class="queue-empty" style="grid-column:1/-1; padding:40px; text-align:center;">No songs found. Try a different search! 🔍</div>';
      return;
    }

    matched.forEach(function (song) {
      var isLiked = likedSongs.some(function (s) { return s.id === song.id; });
      var card = document.createElement('div');
      card.className = 'exp-grid-card';
      var thumb = 'https://i.ytimg.com/vi/' + song.id + '/mqdefault.jpg';

      card.innerHTML = 
        '<div class="exp-grid-thumb-wrap">' +
          '<img class="exp-grid-thumb" src="' + thumb + '" alt="" loading="lazy">' +
          '<div class="exp-grid-play-overlay">' +
            '<div class="exp-grid-play-circle">' +
              '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>' +
            '</div>' +
          '</div>' +
          '<span class="exp-grid-duration">4K AUDIO</span>' +
        '</div>' +
        '<div class="exp-grid-meta">' +
          '<div class="exp-grid-title">' + song.title + '</div>' +
          '<div class="exp-grid-sub">' +
            '<span>' + (song.artist || 'YouTube Artist') + '</span>' +
            '<span class="exp-grid-mood">' + (song.mood || 'VIBE') + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="exp-grid-actions">' +
          '<button class="btn-card-stream">▶ Stream</button>' +
          '<button class="btn-card-fav' + (isLiked ? ' liked' : '') + '" data-id="' + song.id + '">' + (isLiked ? '❤️ Liked' : '🤍 Fav') + '</button>' +
        '</div>';

      // Stream Action
      function triggerStream(e) {
        if (e) e.stopPropagation();
        playSingleTrack(song);
        syncUniverseNowPlayingBanner(song);
        showToast('Streaming on YouTube: ' + song.title + ' 🎶');
      }

      card.addEventListener('click', triggerStream);
      card.querySelector('.btn-card-stream').addEventListener('click', triggerStream);

      // Fav Action
      card.querySelector('.btn-card-fav').addEventListener('click', function (e) {
        e.stopPropagation();
        toggleUniverseLike(song);
      });

      grid.appendChild(card);
    });
  }

  // Category Chips
  document.querySelectorAll('.uni-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      document.querySelectorAll('.uni-chip').forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      var q = chip.getAttribute('data-query');
      renderUniverseCards(q);
    });
  });

  // Favorites Button in Header
  $('uniFavsBtn').addEventListener('click', function () {
    document.querySelectorAll('.uni-chip').forEach(function (c) { c.classList.remove('active'); });
    renderUniverseCards('favorites');
    showToast('Showing your Liked Songs ❤️');
  });

  // Search in Explorer Universe
  function handleUniverseSearch() {
    var query = $('uniYtSearchInput').value.trim();
    if (!query) return;

    // 1. Direct Playlist URL
    if (query.indexOf('list=') !== -1) {
      var plMatch = query.match(/list=([a-zA-Z0-9_-]+)/);
      if (plMatch && plMatch[1]) {
        var plId = plMatch[1];
        if (player && player.loadPlaylist) {
          claimAudioMaster();
          player.loadPlaylist({ list: plId, listType: 'playlist', index: 0 });
          syncUniverseNowPlayingBanner({ id: plId, title: 'YouTube Playlist Stream', artist: 'Custom Playlist' });
          showToast('Streaming YouTube Playlist! 📻');
          return;
        }
      }
    }

    // 2. Direct Video URL or Raw ID
    if (query.indexOf('v=') !== -1 || query.indexOf('youtu.be/') !== -1 || query.indexOf('shorts/') !== -1) {
      var vMatch = query.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/);
      if (vMatch && vMatch[1]) {
        var vid = vMatch[1];
        var customTrack = { id: vid, title: 'YouTube Video (' + vid + ')', artist: 'Custom Stream', mood: '✨ Direct' };
        playSingleTrack(customTrack);
        syncUniverseNowPlayingBanner(customTrack);
        showToast('Streaming Direct YouTube Track! 🎶');
        return;
      }
    } else if (/^[a-zA-Z0-9_-]{11}$/.test(query)) {
      var idTrack = { id: query, title: 'YouTube Video', artist: 'Direct Video', mood: '✨ Direct' };
      playSingleTrack(idTrack);
      syncUniverseNowPlayingBanner(idTrack);
      showToast('Streaming Direct YouTube Track! 🎶');
      return;
    }

    // 3. Search catalog with keywords
    document.querySelectorAll('.uni-chip').forEach(function (c) { c.classList.remove('active'); });
    renderUniverseCards(query);
    showToast('YouTube Search Results for: ' + query);
  }

  /* ==================== Full HD Video Cinema Theater Controller ==================== */
  var cinemaVideoModal = $('cinemaVideoModal');
  var cinemaVideoStage = $('cinemaVideoStage');
  var playerEl = $('player');
  var playerOriginalParent = playerEl ? playerEl.parentNode : document.body;

  function openCinemaMode() {
    if (!cinemaVideoModal || !playerEl) return;
    document.body.classList.add('in-cinema-mode');
    cinemaVideoModal.classList.add('open');

    // Move player container inside cinema stage
    if (cinemaVideoStage && playerEl.parentNode !== cinemaVideoStage) {
      cinemaVideoStage.appendChild(playerEl);
    }

    syncCinemaTrackInfo();
    showToast('Entered Full HD Cinema Mode 🎬');
  }

  function closeCinemaMode() {
    if (!cinemaVideoModal || !playerEl) return;
    document.body.classList.remove('in-cinema-mode');
    cinemaVideoModal.classList.remove('open');

    // Restore player container to background body
    if (playerOriginalParent && playerEl.parentNode !== playerOriginalParent) {
      playerOriginalParent.appendChild(playerEl);
    }

    showToast('Exited Cinema Mode (Ambient Audio Mode)');
  }

  function syncCinemaTrackInfo() {
    var titleEl = $('cinemaTrackTitle');
    var artistEl = $('cinemaTrackArtist');
    var d = player && player.getVideoData ? player.getVideoData() : null;
    var rawTitle = (d && d.title) ? d.title : 'Now Playing';
    var author = (d && d.author) ? d.author : (currentStation ? currentStation.name : 'Aura Music');

    if (titleEl) titleEl.textContent = cleanTitle(rawTitle);
    if (artistEl) artistEl.textContent = author;
  }

  var watchVideoBtn = $('watchVideoBtn');
  if (watchVideoBtn) watchVideoBtn.addEventListener('click', openCinemaMode);

  var expBannerVideoBtn = $('expBannerVideoBtn');
  if (expBannerVideoBtn) expBannerVideoBtn.addEventListener('click', openCinemaMode);

  var cinemaBackBtn = $('cinemaBackBtn');
  if (cinemaBackBtn) cinemaBackBtn.addEventListener('click', closeCinemaMode);

  var cinemaBottomBackBtn = $('cinemaBottomBackBtn');
  if (cinemaBottomBackBtn) cinemaBottomBackBtn.addEventListener('click', closeCinemaMode);

  var closeCinemaBtn = $('closeCinemaBtn');
  if (closeCinemaBtn) closeCinemaBtn.addEventListener('click', closeCinemaMode);

  var globalFloatingBackBtn = $('globalFloatingBackBtn');
  if (globalFloatingBackBtn) {
    globalFloatingBackBtn.addEventListener('click', function () {
      closeCinemaMode();
      exitExplorerUniverse();
      showToast('Returned to Radio Player 📻');
    });
  }

  // Keyboard Shortcuts: 'V' for Video Mode, 'Esc' to exit Cinema Mode

  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'v' || e.key === 'V') {
      if (document.body.classList.contains('in-cinema-mode')) {
        closeCinemaMode();
      } else {
        openCinemaMode();
      }
    } else if (e.key === 'Escape' && document.body.classList.contains('in-cinema-mode')) {
      closeCinemaMode();
    }
  });

  /* ==================== Mobile Native PWA Install Engine ==================== */

  (function initPWAEngine() {
    var deferredPrompt = null;
    var banner = $('pwaInstallBanner');
    var installBtn = $('pwaInstallBtn');
    var dismissBtn = $('pwaDismissBtn');

    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      deferredPrompt = e;

      var dismissed = localStorage.getItem('ishq_pwa_dismissed');
      if (!dismissed && banner) {
        setTimeout(function () {
          banner.style.display = 'block';
        }, 3000);
      }
    });

    if (installBtn) {
      installBtn.addEventListener('click', function () {
        if (banner) banner.style.display = 'none';
        if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then(function (res) {
            if (res.outcome === 'accepted') {
              showToast('Thank you for installing Aura Music! 🚀');
            }
            deferredPrompt = null;
          });
        }
      });
    }

    if (dismissBtn) {
      dismissBtn.addEventListener('click', function () {
        if (banner) banner.style.display = 'none';
        localStorage.setItem('ishq_pwa_dismissed', 'true');
      });
    }
  })();

  /* ==================== Web Audio API Ambient Synthesizer ==================== */
  var audioCtx = null;
  var rainGain = null, crackleGain = null, fireGain = null;

  var rainNode = null, crackleNode = null, fireNode = null;

  function initAudioContext() {
    if (audioCtx) return;
    try {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();

      var bufferSize = audioCtx.sampleRate * 2;
      var rainBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      var rainData = rainBuffer.getChannelData(0);
      var b0 = 0, b1 = 0, b2 = 0;
      for (var i = 0; i < bufferSize; i++) {
        var white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.95 * b1 + white * 0.07;
        b2 = 0.85 * b2 + white * 0.12;
        rainData[i] = (b0 + b1 + b2) * 0.5;
      }
      rainNode = audioCtx.createBufferSource();
      rainNode.buffer = rainBuffer;
      rainNode.loop = true;
      var rainFilter = audioCtx.createBiquadFilter();
      rainFilter.type = 'lowpass';
      rainFilter.frequency.value = 1000;
      rainGain = audioCtx.createGain();
      rainGain.gain.value = 0;
      rainNode.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(audioCtx.destination);
      rainNode.start(0);

      var crackleBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      var crackleData = crackleBuffer.getChannelData(0);
      for (var j = 0; j < bufferSize; j++) {
        crackleData[j] = Math.random() > 0.998 ? (Math.random() * 2 - 1) * 0.4 : 0;
      }
      crackleNode = audioCtx.createBufferSource();
      crackleNode.buffer = crackleBuffer;
      crackleNode.loop = true;
      crackleGain = audioCtx.createGain();
      crackleGain.gain.value = 0;
      crackleNode.connect(crackleGain);
      crackleGain.connect(audioCtx.destination);
      crackleNode.start(0);

      var fireBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      var fireData = fireBuffer.getChannelData(0);
      var lastOut = 0.0;
      for (var k = 0; k < bufferSize; k++) {
        var w = Math.random() * 2 - 1;
        lastOut = (lastOut + (0.02 * w)) / 1.02;
        var pop = Math.random() > 0.9992 ? (Math.random() * 2 - 1) * 0.6 : 0;
        fireData[k] = (lastOut * 1.5) + pop;
      }
      fireNode = audioCtx.createBufferSource();
      fireNode.buffer = fireBuffer;
      fireNode.loop = true;
      var fireFilter = audioCtx.createBiquadFilter();
      fireFilter.type = 'lowpass';
      fireFilter.frequency.value = 600;
      fireGain = audioCtx.createGain();
      fireGain.gain.value = 0;
      fireNode.connect(fireFilter);
      fireFilter.connect(fireGain);
      fireGain.connect(audioCtx.destination);
      fireNode.start(0);
    } catch (e) {}
  }

  $('ambientToggleBtn').addEventListener('click', function () {
    initAudioContext();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    $('ambientPanel').classList.toggle('open');
    $('timerPanel').classList.remove('open');
  });

  $('closeAmbientBtn').addEventListener('click', function () {
    $('ambientPanel').classList.remove('open');
  });

  $('rainVol').addEventListener('input', function (e) {
    initAudioContext();
    if (rainGain) rainGain.gain.value = parseFloat(e.target.value) / 100 * 0.4;
  });

  $('crackleVol').addEventListener('input', function (e) {
    initAudioContext();
    if (crackleGain) crackleGain.gain.value = parseFloat(e.target.value) / 100 * 0.35;
  });

  $('fireVol').addEventListener('input', function (e) {
    initAudioContext();
    if (fireGain) fireGain.gain.value = parseFloat(e.target.value) / 100 * 0.4;
  });

  /* ==================== Sleep Timer with Smooth Volume Fade-Out ==================== */
  var sleepTimerInterval = null;
  var sleepRemainingSecs = 0;
  var sleepInitialVolume = 100;

  $('sleepTimerBtn').addEventListener('click', function () {
    $('timerPanel').classList.toggle('open');
    $('ambientPanel').classList.remove('open');
  });

  $('closeTimerBtn').addEventListener('click', function () {
    $('timerPanel').classList.remove('open');
  });

  document.querySelectorAll('.timer-opt').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var mins = parseInt(btn.getAttribute('data-mins'), 10);
      clearInterval(sleepTimerInterval);

      if (mins > 0) {
        sleepRemainingSecs = mins * 60;
        sleepInitialVolume = (player && player.getVolume) ? player.getVolume() : 100;
        $('timerLabel').textContent = mins + 'M';
        $('sleepTimerBtn').classList.add('active');
        showToast('Sleep timer set: ' + mins + ' mins with smooth fade-out 🌙');

        sleepTimerInterval = setInterval(function () {
          sleepRemainingSecs--;
          var m = Math.ceil(sleepRemainingSecs / 60);
          $('timerLabel').textContent = m + 'M';

          // Smooth 15-second acoustic fade-out
          if (sleepRemainingSecs <= 15 && sleepRemainingSecs > 0) {
            var targetVol = Math.max(0, Math.round((sleepRemainingSecs / 15) * sleepInitialVolume));
            if (player && player.setVolume) player.setVolume(targetVol);
          }

          if (sleepRemainingSecs <= 0) {
            clearInterval(sleepTimerInterval);
            if (player && player.pauseVideo) player.pauseVideo();
            if (player && player.setVolume) player.setVolume(sleepInitialVolume); // Restore for morning
            $('timerLabel').textContent = 'TIMER';
            $('sleepTimerBtn').classList.remove('active');
            showToast('Goodnight 🌙 Aura is resting…');
          }
        }, 1000);
      } else {
        $('timerLabel').textContent = 'TIMER';
        $('sleepTimerBtn').classList.remove('active');
        if (player && player.setVolume) player.setVolume(sleepInitialVolume);
        showToast('Sleep timer turned off');
      }
      $('timerPanel').classList.remove('open');
    });
  });


  /* ==================== Liked Songs ==================== */
  var artLikeBtn = $('artLikeBtn');
  function updateLikeStatus(videoId) {
    var isLiked = likedSongs.some(function (s) { return s.id === videoId; });
    artLikeBtn.classList.toggle('liked', isLiked);
  }

  function toggleLikeCurrent() {
    var d = player && player.getVideoData ? player.getVideoData() : {};
    var vidId = d.video_id;
    var title = d.title || 'Track';
    var artist = d.author || 'Aesthetic Artist';

    if (!vidId) return;
    var idx = likedSongs.findIndex(function (s) { return s.id === vidId; });
    if (idx >= 0) {
      likedSongs.splice(idx, 1);
      artLikeBtn.classList.remove('liked');
      showToast('Removed from Liked Songs');
    } else {
      likedSongs.push({ id: vidId, title: title, artist: artist });
      artLikeBtn.classList.add('liked');
      showToast('Added to Liked Songs ❤️');
    }
    localStorage.setItem('ishq_liked_songs', JSON.stringify(likedSongs));
    renderLikedList();
  }

  artLikeBtn.addEventListener('click', toggleLikeCurrent);

  function renderLikedList() {
    var favList = $('favList');
    var countEl = $('favTabCount');
    if (countEl) countEl.textContent = likedSongs.length;
    if (!favList) return;

    if (!likedSongs.length) {
      favList.innerHTML = '<div class="queue-empty">No liked songs yet. Click the ❤️ icon on any song!</div>';
      return;
    }

    favList.innerHTML = '';
    likedSongs.forEach(function (song) {
      var it = document.createElement('div');
      it.className = 'queue-item';
      it.innerHTML = 
        '<img class="queue-thumb" src="https://i.ytimg.com/vi/' + song.id + '/default.jpg" alt="" loading="lazy">' +
        '<div class="queue-meta">' +
          '<div class="queue-item-title">' + (song.title || 'Liked Track') + '</div>' +
          '<div class="queue-item-idx">' + (song.artist || 'Liked Song') + '</div>' +
        '</div>';
      it.addEventListener('click', function () {
        playSingleTrack(song);
        $('queuePanel').classList.remove('open');
      });
      favList.appendChild(it);
    });
  }

  // Queue Tabs Toggle
  $('queueTabBtn').addEventListener('click', function () {
    $('queueTabBtn').classList.add('active');
    $('recTabBtn').classList.remove('active');
    $('favTabBtn').classList.remove('active');
    $('queueList').style.display = 'flex';
    $('recList').style.display = 'none';
    $('favList').style.display = 'none';
  });

  $('recTabBtn').addEventListener('click', function () {
    $('recTabBtn').classList.add('active');
    $('queueTabBtn').classList.remove('active');
    $('favTabBtn').classList.remove('active');
    $('queueList').style.display = 'none';
    $('recList').style.display = 'flex';
    $('favList').style.display = 'none';
    VibeAgent.renderVibeUI();
  });

  var refreshVibeBtn = $('refreshVibeBtn');
  if (refreshVibeBtn) {
    refreshVibeBtn.addEventListener('click', function () {
      VibeAgent.generateVibeRecommendations(20);
      VibeAgent.renderVibeUI();
      showToast('AI Re-Tuned to your latest vibe! ⚡');
    });
  }

  var playMyVibesStationBtn = $('playMyVibesStationBtn');
  if (playMyVibesStationBtn) {
    playMyVibesStationBtn.addEventListener('click', function () {
      VibeAgent.playMyVibesStation();
      $('queuePanel').classList.remove('open');
    });
  }

  $('favTabBtn').addEventListener('click', function () {
    $('favTabBtn').classList.add('active');
    $('queueTabBtn').classList.remove('active');
    $('recTabBtn').classList.remove('active');
    $('queueList').style.display = 'none';
    $('recList').style.display = 'none';
    $('favList').style.display = 'flex';
    renderLikedList();
  });


  // Search Filter in Queue
  $('queueSearchInput').addEventListener('input', function (e) {
    var q = e.target.value.toLowerCase().trim();
    document.querySelectorAll('#queueList .queue-item').forEach(function (el) {
      var text = el.textContent.toLowerCase();
      el.style.display = text.indexOf(q) !== -1 ? 'flex' : 'none';
    });
  });

  /* ==================== Keyboard Shortcuts Modal ==================== */
  $('shortcutsHelpBtn').addEventListener('click', function () {
    $('shortcutsModal').classList.add('open');
  });
  $('closeShortcutsBtn').addEventListener('click', function () {
    $('shortcutsModal').classList.remove('open');
  });

  /* ==================== Dynamic Aurora Fluid Mesh & Station-Adaptive Kinetic Particles ==================== */
  (function initDynamicBackgroundEngine() {
    var canvas = $('particles');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    var width = 0, height = 0;
    var particles = [];
    var auroraBlobs = [];
    var globalTime = 0;
    var pulseBeat = 0;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initElements();
    }
    window.addEventListener('resize', resize, { passive: true });

    function initElements() {
      particles = [];
      auroraBlobs = [];

      // 1. Aurora Plasma Gradient Orbs
      var blobColors = [
        { r: 168, g: 85, b: 247 }, // Purple (Time Travel)
        { r: 245, g: 158, b: 11 }, // Amber (Ishq)
        { r: 255, g: 42, b: 95 },  // Magenta/Ruby (Demand)
        { r: 6, g: 182, b: 212 },  // Cyan (90s)
        { r: 16, g: 185, b: 129 }  // Emerald (EDM)
      ];

      for (var b = 0; b < 4; b++) {
        auroraBlobs.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.min(width, height) * (0.35 + Math.random() * 0.25),
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          baseColor: blobColors[b % blobColors.length],
          phase: Math.random() * Math.PI * 2
        });
      }

      // 2. Station-Adaptive Particle Field
      var particleCount = Math.min(Math.floor(width / 22), 55);
      for (var i = 0; i < particleCount; i++) {
        particles.push(createParticle());
      }
    }

    function createParticle(initial) {
      var mode = currentStationKey || 'time-travel';
      var p = {
        x: Math.random() * width,
        y: initial ? Math.random() * height : (mode === 'demand' || mode === 'ishq' ? height + 10 : Math.random() * height),
        r: Math.random() * 2.2 + 0.8,
        alpha: Math.random() * 0.5 + 0.2,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
        mode: mode
      };

      if (mode === 'edm') {
        p.vx = (Math.random() - 0.5) * 0.8;
        p.vy = -Math.random() * 1.4 - 0.3;
        p.shape = Math.random() > 0.6 ? 'square' : 'circle';
      } else if (mode === 'demand') {
        p.vx = (Math.random() - 0.5) * 0.9;
        p.vy = -Math.random() * 1.8 - 0.5; // Upward fire embers
        p.r = Math.random() * 2.6 + 1.0;
      } else if (mode === 'ishq') {
        p.vx = (Math.random() - 0.5) * 0.35;
        p.vy = -Math.random() * 0.6 - 0.15; // Gentle warm rising motes
        p.sway = Math.random() * Math.PI * 2;
        p.r = Math.random() * 2.8 + 1.2;
      } else if (mode === '90s') {
        p.vx = (Math.random() - 0.5) * 0.4;
        p.vy = Math.random() * 0.3 - 0.15; // Nostalgic drifting dust
        p.r = Math.random() * 1.5 + 0.5;
      } else {
        // Time Travel: Cosmic stardust drifting in space
        p.vx = (Math.random() - 0.5) * 0.25;
        p.vy = -Math.random() * 0.3 - 0.05;
        p.r = Math.random() * 1.8 + 0.6;
      }
      return p;
    }

    resize();

    function render() {
      if (!document.hidden) {
        globalTime += 0.015;
        var playing = isPlaying();
        pulseBeat = playing ? Math.sin(globalTime * 3) * 0.15 + 1.0 : 1.0;

        ctx.clearRect(0, 0, width, height);

        // --- Render Aurora Liquid Plasma Glow ---
        for (var b = 0; b < auroraBlobs.length; b++) {
          var blob = auroraBlobs[b];
          blob.x += blob.vx;
          blob.y += blob.vy;

          if (blob.x < -blob.radius) blob.x = width + blob.radius;
          if (blob.x > width + blob.radius) blob.x = -blob.radius;
          if (blob.y < -blob.radius) blob.y = height + blob.radius;
          if (blob.y > height + blob.radius) blob.y = -blob.radius;

          var rad = blob.radius * (1 + Math.sin(globalTime + blob.phase) * 0.12) * (playing ? 1.08 : 1.0);
          var grad = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, rad);

          // Get active station accent color if available
          var accentRgb = '168, 85, 247'; // Default purple
          if (currentStation && currentStation.theme && currentStation.theme.accent) {
            var hex = currentStation.theme.accent;
            if (hex.indexOf('#') === 0 && hex.length === 7) {
              var r = parseInt(hex.substring(1, 3), 16);
              var g = parseInt(hex.substring(3, 5), 16);
              var bl = parseInt(hex.substring(5, 7), 16);
              accentRgb = r + ', ' + g + ', ' + bl;
            }
          }

          var alphaMax = (playing ? 0.07 : 0.04) * (b === 0 ? 1.4 : 0.8);
          grad.addColorStop(0, 'rgba(' + accentRgb + ', ' + alphaMax + ')');
          grad.addColorStop(0.6, 'rgba(' + accentRgb + ', ' + (alphaMax * 0.3) + ')');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(blob.x, blob.y, rad, 0, Math.PI * 2);
          ctx.fill();
        }

        // --- Render Kinetic Particle Field ---
        var stMode = currentStationKey || 'time-travel';

        for (var i = 0; i < particles.length; i++) {
          var p = particles[i];
          p.twinklePhase += p.twinkleSpeed;
          var curAlpha = p.alpha * (0.6 + Math.sin(p.twinklePhase) * 0.4) * (playing ? 1.2 : 0.85);

          if (stMode === 'ishq') {
            p.sway += 0.02;
            p.x += p.vx + Math.sin(p.sway) * 0.3;
            p.y += p.vy * (playing ? 1.3 : 1.0);
            ctx.fillStyle = 'rgba(254, 230, 138, ' + Math.min(curAlpha, 0.75) + ')'; // Warm golden ember
          } else if (stMode === 'demand') {
            p.x += p.vx;
            p.y += p.vy * (playing ? 1.5 : 1.1);
            ctx.fillStyle = 'rgba(255, 68, 110, ' + Math.min(curAlpha, 0.8) + ')'; // Fiery magenta spark
          } else if (stMode === 'edm') {
            p.x += p.vx;
            p.y += p.vy * (playing ? 1.6 : 1.2);
            ctx.fillStyle = 'rgba(16, 185, 129, ' + Math.min(curAlpha, 0.85) + ')'; // Neon emerald matrix
          } else if (stMode === '90s') {
            p.x += p.vx;
            p.y += p.vy;
            ctx.fillStyle = 'rgba(165, 243, 252, ' + Math.min(curAlpha, 0.6) + ')'; // Cyan retro dust
          } else {
            // Time Travel
            p.x += p.vx;
            p.y += p.vy;
            ctx.fillStyle = 'rgba(216, 180, 254, ' + Math.min(curAlpha, 0.7) + ')'; // Stardust violet
          }

          // Wrap boundaries
          if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
          if (p.y > height + 10) { p.y = -10; p.x = Math.random() * width; }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;

          var drawRadius = p.r * (playing ? pulseBeat : 1.0);

          ctx.beginPath();
          if (p.shape === 'square') {
            ctx.fillRect(p.x - drawRadius, p.y - drawRadius, drawRadius * 2, drawRadius * 2);
          } else {
            ctx.arc(p.x, p.y, drawRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // --- Special Effect: Cosmic Shooting Star for Time Travel ---
        if (stMode === 'time-travel' && Math.random() < 0.012) {
          var startX = Math.random() * width * 0.8;
          var startY = Math.random() * height * 0.4;
          var len = Math.random() * 90 + 40;
          var meteorGrad = ctx.createLinearGradient(startX, startY, startX + len, startY + len * 0.5);
          meteorGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
          meteorGrad.addColorStop(0.3, 'rgba(168, 85, 247, 0.6)');
          meteorGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
          ctx.strokeStyle = meteorGrad;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(startX + len, startY + len * 0.5);
          ctx.stroke();
        }

        // --- Special Effect: Laser Beam Pulse for EDM ---
        if (stMode === 'edm' && playing && Math.random() < 0.035) {
          var lx = Math.random() * width;
          ctx.strokeStyle = 'rgba(16, 185, 129, ' + (Math.random() * 0.25 + 0.1) + ')';
          ctx.lineWidth = Math.random() * 1.8 + 0.5;
          ctx.beginPath();
          ctx.moveTo(lx, 0);
          ctx.lineTo(lx + (Math.random() - 0.5) * 80, height);
          ctx.stroke();
        }
      }
      requestAnimationFrame(render);
    }
    render();
  })();



  function isPlaying() {
    try { return player && player.getPlayerState && player.getPlayerState() === 1; } catch (e) { return false; }
  }

  /* ==================== YouTube Audio Engine & MediaSession ==================== */
  function loadApi() {
    return new Promise(function (res, rej) {
      if (window.YT && YT.Player) { res(); return; }
      var prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () { if (prev) prev(); res(); };
      var s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      s.async = true;
      s.onerror = function () { rej(new Error('api')); };
      document.head.appendChild(s);
      setTimeout(function () { rej(new Error('timeout')); }, 8000);
    });
  }

  function fmt(sec) {
    if (!isFinite(sec) || sec <= 0) return '0:00';
    var m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    var h = Math.floor(m / 60); m = m % 60;
    return h
      ? h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0')
      : m + ':' + String(s).padStart(2, '0');
  }

  function updateMediaSession(title, artist, videoId) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title || 'Aura Stream',
        artist: artist || (currentStation && currentStation.name) || 'Music Stream',
        album: 'Aura Music 8.0',
        artwork: [
          { src: 'https://i.ytimg.com/vi/' + videoId + '/mqdefault.jpg', sizes: '320x180', type: 'image/jpeg' },
          { src: 'https://i.ytimg.com/vi/' + videoId + '/hqdefault.jpg', sizes: '480x360', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', function () { claimAudioMaster(); desired = true; if (player) player.playVideo(); });
      navigator.mediaSession.setActionHandler('pause', function () { desired = false; if (player) player.pauseVideo(); });
      navigator.mediaSession.setActionHandler('previoustrack', function () { skip('prev'); });
      navigator.mediaSession.setActionHandler('nexttrack', function () { skip('next'); });
    }
  }

  function update() {
    if (!player || !apiReady) return;
    var d = player.getVideoData && player.getVideoData();
    var videoId = (d && d.video_id) ? d.video_id : '';
    if (!videoId) return;

    var rawTitle = (d && d.title) ? d.title : 'Now Playing';
    var displayTitle = cleanTitle(rawTitle);
    var displayArtist = (d && d.author) ? d.author : (currentStation ? currentStation.name : 'Aesthetic Artist');



    var titleEl = $('title');
    if (titleEl) titleEl.textContent = displayTitle;

    var artistEl = $('artist');
    if (artistEl) artistEl.textContent = displayArtist;

    var artImg = $('art');
    var ambientImg = $('ambientArt');
    var thumbMq = 'https://i.ytimg.com/vi/' + videoId + '/mqdefault.jpg';
    var thumbHq = 'https://i.ytimg.com/vi/' + videoId + '/hqdefault.jpg';
    var thumbMax = 'https://i.ytimg.com/vi/' + videoId + '/maxresdefault.jpg';

    if (artImg && artImg.src !== thumbMq) artImg.src = thumbMq;
    if (ambientImg) {
      var probe = new Image();
      probe.onload = function () {
        if (probe.naturalWidth > 120) ambientImg.src = thumbMax;
        else ambientImg.src = thumbHq;
      };
      probe.onerror = function () { ambientImg.src = thumbHq; };
      probe.src = thumbMax;
    }

    document.body.classList.add('has-art');


    var dur = player.getDuration ? player.getDuration() : 0;

    if ($('meta')) {
      $('meta').textContent = (currentStation ? currentStation.name : 'Aura Station') + ' · ' + fmt(dur);
    }
    if ($('timeTotal')) $('timeTotal').textContent = fmt(dur);

    document.title = displayTitle ? displayTitle + ' — Aura Music' : 'Aura Music Platform';

    // Add to session queue history
    var exists = sessionHistory.some(function (t) { return t.id === videoId; });
    if (!exists) {
      sessionHistory.unshift({ id: videoId, title: displayTitle, artist: displayArtist });
      renderSessionQueue();
    }

    updateLikeStatus(videoId);
    updateMediaSession(displayTitle, displayArtist, videoId);
    updateBackgroundWords(displayTitle, displayArtist);
    syncCinemaTrackInfo();
    VibeAgent.learnFromTrack({ id: videoId, title: displayTitle, artist: displayArtist }, 1);
  }







  function renderSessionQueue() {
    var queueList = $('queueList');
    var countEl = $('queueTabCount');
    if (countEl) countEl.textContent = sessionHistory.length;
    if (!queueList) return;

    if (!sessionHistory.length) {
      queueList.innerHTML = '<div class="queue-empty">Streaming 4,000+ songs playlist from YouTube…</div>';
      return;
    }

    queueList.innerHTML = '';
    sessionHistory.forEach(function (track, index) {
      var item = document.createElement('div');
      item.className = 'queue-item' + (index === 0 ? ' active' : '');
      var thumb = 'https://i.ytimg.com/vi/' + track.id + '/default.jpg';

      item.innerHTML = 
        '<img class="queue-thumb" src="' + thumb + '" alt="" loading="lazy">' +
        '<div class="queue-meta">' +
          '<div class="queue-item-title">' + track.title + '</div>' +
          '<div class="queue-item-idx">' + track.artist + '</div>' +
        '</div>';

      item.addEventListener('click', function () {
        playSingleTrack(track);
        $('queuePanel').classList.remove('open');
      });

      queueList.appendChild(item);
    });
  }

  function onState(e) {
    if (!YT) return;
    if (e.data === YT.PlayerState.PLAYING) {
      document.body.classList.add('playing');
      desired = true;
      hideAutoplayPrompt();
      show('s-ready');
      update();
    } else if (e.data === YT.PlayerState.PAUSED) {
      document.body.classList.remove('playing');
    } else if (e.data === YT.PlayerState.CUED || e.data === YT.PlayerState.BUFFERING) {
      show('s-ready');
      update();
    } else if (e.data === YT.PlayerState.ENDED) {
      skip('next');
    }
  }

  /* ==================== Resilient Error Handling ==================== */
  var errCount = 0;
  var errTimer = null;
  function onErr(e) {
    if (errTimer) clearTimeout(errTimer);
    errCount++;
    if (errCount > 3) {
      errCount = 0;
      showToast('Tuning to clean frequency… 🎧');
      try {
        if (player && player.loadVideoById) {
          player.loadVideoById('IltsCYPwtjE');
        }
      } catch (err) {}
      return;
    }
    errTimer = setTimeout(function () {
      try { skip('next'); } catch (err) {}
    }, 1500);
  }

  function showAutoplayPrompt() {
    var overlay = $('autoplayOverlay');
    if (overlay) overlay.classList.add('visible');
  }

  function hideAutoplayPrompt() {
    var overlay = $('autoplayOverlay');
    if (overlay) overlay.classList.remove('visible');
  }

  function init() {
    renderLikedList();
    loadStationsData(false);

    setTimeout(function () {
      show('s-ready');
    }, 600);

    loadApi().then(function () {
      var plId = 'PLITHjw3sQBek'; // Safe initialization playlist

      player = new YT.Player('player', {
        width: '640', height: '390',
        playerVars: {
          listType: 'playlist',
          list: plId,
          playsinline: 1,
          controls: 0,
          disablekb: 1,
          rel: 0,
          iv_load_policy: 3
        },
        events: {
          onReady: function () {
            window.__p = player;
            apiReady = true;
            show('s-ready');

            setTimeout(function () {
              var s = currentStation || stations[0];
              if (s) loadStationPlayback(s);
            }, 350);
          },
          onStateChange: onState,
          onError: onErr
        }
      });
    }).catch(function () {
      show('s-ready');
    });
  }


  /* Fullscreen */
  function toggleFullscreen() {
    var d = document;
    try {
      if (!d.fullscreenElement) {
        if (d.documentElement.requestFullscreen) d.documentElement.requestFullscreen().catch(function () {});
        else if (d.documentElement.webkitRequestFullscreen) d.documentElement.webkitRequestFullscreen();
      } else {
        if (d.exitFullscreen) d.exitFullscreen();
        else if (d.webkitExitFullscreen) d.webkitExitFullscreen();
      }
    } catch (e) {}
  }

  function fsIcon() {
    document.body.classList.toggle('fs-on', !!document.fullscreenElement || !!document.webkitFullscreenElement);
  }

  function togglePlay() {
    if (!apiReady || !player) return;
    claimAudioMaster();
    hideAutoplayPrompt();
    desired = !desired;
    try {
      if (desired) player.playVideo();
      else player.pauseVideo();
    } catch (e) {}
  }

  /* ==================== UI Event Listeners ==================== */
  $('play').addEventListener('click', togglePlay);
  $('prev').addEventListener('click', function () { skip('prev'); });
  $('next').addEventListener('click', function () { skip('next'); });
  $('fsbtn').addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', fsIcon);
  document.addEventListener('webkitfullscreenchange', fsIcon);
  $('retry').addEventListener('click', function () { init(); });

  $('autoplayOverlay').addEventListener('click', function () {
    togglePlay();
  });

  document.addEventListener('click', function (e) {
    if (!apiReady || !player) return;
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a') || e.target.closest('.modal-card')) return;
    if (!isPlaying() && desired) {
      try { player.playVideo(); } catch (err) {}
    }
  });

  $('queueToggleBtn').addEventListener('click', function () {
    $('queuePanel').classList.toggle('open');
    generateRecommendations();
  });
  $('closeQueueBtn').addEventListener('click', function () {
    $('queuePanel').classList.remove('open');
  });

  // Progress Bar Seek
  var progressBar = $('progressBar');
  progressBar.addEventListener('click', function (e) {
    if (!player || !apiReady) return;
    claimAudioMaster();
    var rect = progressBar.getBoundingClientRect();
    var percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    var dur = player.getDuration ? player.getDuration() : 0;
    if (dur > 0) {
      player.seekTo(dur * percent, true);
      if ($('progressFill')) $('progressFill').style.width = (percent * 100) + '%';
      if ($('progressHandle')) $('progressHandle').style.left = (percent * 100) + '%';
    }
  });

  // Volume Slider
  var volSlider = $('volSlider');
  var volBtn = $('volBtn');
  volSlider.addEventListener('input', function () {
    if (!player || !apiReady) return;
    var val = parseInt(volSlider.value, 10);
    player.setVolume(val);
    if (val === 0) {
      document.body.classList.add('is-muted');
    } else {
      document.body.classList.remove('is-muted');
      if (player.isMuted && player.isMuted()) player.unMute();
    }
  });

  volBtn.addEventListener('click', function () {
    if (!player || !apiReady) return;
    if (player.isMuted && player.isMuted()) {
      player.unMute();
      document.body.classList.remove('is-muted');
      volSlider.value = player.getVolume() || 100;
    } else {
      player.mute();
      document.body.classList.add('is-muted');
      volSlider.value = 0;
    }
  });

  // Keyboard Shortcuts
  window.addEventListener('keydown', function (e) {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlay();
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      skip('next');
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      skip('prev');
    } else if (e.key === 'l' || e.key === 'L') {
      e.preventDefault();
      toggleLikeCurrent();
    } else if (e.key === 'e' || e.key === 'E') {
      e.preventDefault();
      ytExplorerModal.classList.toggle('open');
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      toggleFullscreen();
    } else if (e.key === 'q' || e.key === 'Q') {
      e.preventDefault();
      $('queuePanel').classList.toggle('open');
      generateRecommendations();
    } else if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      volBtn.click();
    } else if (e.key === '?') {
      e.preventDefault();
      $('shortcutsModal').classList.toggle('open');
    } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      window.location.href = 'admin.html';
    }
  });


  // High-Frequency Real-time Progress Loop (250ms)
  setInterval(function () {
    if (!player || !apiReady || !isPlaying()) return;
    try {
      var cur = player.getCurrentTime ? player.getCurrentTime() : 0;
      var dur = player.getDuration ? player.getDuration() : 0;
      if ($('timeCurrent')) $('timeCurrent').textContent = fmt(cur);
      if (dur > 0) {
        var pct = (cur / dur) * 100;
        if ($('progressFill')) $('progressFill').style.width = pct + '%';
        if ($('progressHandle')) $('progressHandle').style.left = pct + '%';
      }
    } catch (e) {}
  }, 250);





  // Play watchdog
  var autoplayBlockedCount = 0;
  setInterval(function () {
    if (!apiReady || !desired) return;
    var st = -1;
    try { st = player.getPlayerState(); } catch (e) {}
    if (st === 1 || st === 3) {
      autoplayBlockedCount = 0;
      hideAutoplayPrompt();
      return;
    }
    autoplayBlockedCount++;
    if (autoplayBlockedCount >= 3 && !isPlaying()) {
      showAutoplayPrompt();
    }
  }, 2500);

  init();
})();
