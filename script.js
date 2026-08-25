(function () {
  var DB_VERSION_KEY = 'ishq_db_version';
  var CURRENT_DB_VERSION = 'v106.0';
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
      "playlistId": "my-vibes",
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
      "brandSub": "PURE SOUL // 4,000+ ACOUSTIC MELODIES",
      "desc": "Heartfelt acoustic, midnight lo-fi & soul-touching Hindi/Urdu melodies",
      "icon": "📻",
      "type": "playlist",
      "playlistId": "PLW5UAO4duiCo",
      "playlistUrl": "https://music.youtube.com/playlist?list=PLW5UAO4duiCo",
      "songCount": "4,000+ SONGS",

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
      "brandSub": "CLUB ANTHEMS // 146 SYNTH & BASSLINES",
      "desc": "High energy club anthems, electronic basslines & festival vibes",
      "icon": "⚡",
      "type": "playlist",
      "playlistId": "PLYLuPnKO3ROU",
      "playlistUrl": "https://youtube.com/playlist?list=PLYLuPnKO3ROU",
      "songCount": "146 SONGS",
      "theme": {
        "bg": "#040907",
        "fg": "#ecfdf5",
        "fgDim": "#a7f3d0",
        "muted": "#458268",
        "accent": "#10b981",
        "accentGlow": "rgba(16, 185, 129, 0.45)",
        "themeAmbient": "rgba(16, 185, 129, 0.09)",
        "glassBg": "rgba(6, 22, 16, 0.9)",
        "fontFamily": "'Arexa', 'Unbounded', sans-serif",
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
        if (name !== 'aura-music-v108.0') caches.delete(name);
      });
    });
  }

  /* ==================== Global Security & Sanitization ==================== */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  if (typeof window !== 'undefined') window.escapeHtml = escapeHtml;

  var stations = DEFAULT_STATIONS.slice();
  var currentStation = stations[0];
  var currentStationKey = localStorage.getItem('ishq_station_key') || 'time-travel';

  var player = null, apiReady = false, desired = true;
  var sessionHistory = [];
  var likedSongs = JSON.parse(localStorage.getItem('ishq_liked_songs') || '[]');
  var currentLyrics = [];
  var skipDebounce = false;

  // AI Virtual DJ State
  var aiDjEnabled = false;
  var lastDjAnnouncedId = '';

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
  window.$ = $;
  if (typeof window !== 'undefined') window.$ = $;

  function show(cls) {
    document.body.classList.remove('s-loading', 's-error', 's-ready');
    document.body.classList.add(cls);
  }

  /* ==========================================================================
     AI VIBE INTELLIGENCE ENGINE & SMART PLAYLIST AGENT 3.0 (VibeAgent)
     Multi-factor taste vectors, Chrono-Acoustic time rhythm, Collaborative Artist
     Knowledge Graph, Fatigue & Skip Penalties, Dynamic Vibe Filters, and AI Explanations.
     ========================================================================== */
  var VibeAgent = (function () {
    var VIBE_PROFILE_KEY = 'ishq_vibe_profile_v3';
    var MY_VIBES_PLAYLIST_KEY = 'ishq_my_vibes_playlist_v3';
    var activeVibeFilter = 'auto'; // 'auto', 'romance', 'midnight', 'indie', 'punjabi', 'monsoon', 'retro', 'sufi', 'edm'
    var lastLearnedTrackId = '';
    var recentSkips = []; // list of { id, time }

    // Comprehensive Music Knowledge Matrix across Vibe Dimensions
    var SONGS_CATALOG = [
      // --- ROMANCE & SOUL (Bollywood Ishq) ---
      { id: 'IltsCYPwtjE', title: 'Kesariya', artist: 'Arijit Singh, Pritam', genres: ['romance', 'bollywood', 'soul'], mood: '❤️ Passionate Love', tempo: 'mid', energy: 0.65, era: '2020s', times: ['evening', 'midnight', 'morning'] },
      { id: 'BddP6PYo2gs', title: 'Apna Bana Le', artist: 'Arijit Singh, Sachin-Jigar', genres: ['romance', 'soul', 'bollywood'], mood: '🕊️ Pure Devotion', tempo: 'slow', energy: 0.5, era: '2020s', times: ['midnight', 'evening'] },
      { id: 'L_LUpnjgPso', title: 'Tum Hi Ho', artist: 'Arijit Singh, Mithoon', genres: ['romance', 'bollywood', 'soul'], mood: '❤️ Timeless Ishq', tempo: 'slow', energy: 0.55, era: '2010s', times: ['midnight', 'evening'] },
      { id: 'KUpwupYj_tY', title: 'O Maahi', artist: 'Arijit Singh, Pritam', genres: ['romance', 'bollywood', 'acoustic'], mood: '✨ Eternal Devotion', tempo: 'mid', energy: 0.6, era: '2020s', times: ['evening', 'morning'] },
      { id: 'b5f25X2Gvfg', title: 'Pehle Bhi Main', artist: 'Vishal Mishra, Raj Shekhar', genres: ['romance', 'soul', 'dark_pop', 'drive'], mood: '🥀 Obsessive Love', tempo: 'mid', energy: 0.55, era: '2020s', times: ['midnight', 'evening'] },
      { id: 'tVLC3Phn4yU', title: 'Chaleya', artist: 'Arijit Singh, Shilpa Rao, Anirudh', genres: ['romance', 'dance', 'bollywood', 'pop'], mood: '❤️ Joyous Romance', tempo: 'upbeat', energy: 0.75, era: '2020s', times: ['afternoon', 'evening'] },
      { id: 'BBAyRZZ9cG4', title: 'Satranga', artist: 'Arijit Singh, Shreyas Puranik', genres: ['romance', 'soul', 'classical', 'sufi'], mood: '🌈 7 Shades of Love', tempo: 'slow', energy: 0.5, era: '2020s', times: ['midnight', 'evening'] },
      { id: 'p7i88HqK_4k', title: 'Agar Tum Saath Ho', artist: 'Alka Yagnik, Arijit Singh', genres: ['romance', 'soul', 'bollywood', 'emotional'], mood: '💔 Tearful Embrace', tempo: 'slow', energy: 0.5, era: '2010s', times: ['midnight', 'evening'] },
      { id: '9-aktgL_K6k', title: 'Shayad', artist: 'Arijit Singh, Pritam', genres: ['romance', 'bollywood', 'acoustic'], mood: '❤️ Shy Confession', tempo: 'mid', energy: 0.55, era: '2020s', times: ['evening', 'midnight'] },
      { id: 'kJQP7kiw5Fk', title: 'Raataan Lambiyan', artist: 'Jubin Nautiyal, Asees Kaur', genres: ['romance', 'bollywood', 'acoustic'], mood: '🌙 Midnight Longing', tempo: 'slow', energy: 0.5, era: '2020s', times: ['midnight', 'evening'] },
      { id: 'gvyUuxdRdR4', title: 'Kahani Suno 2.0', artist: 'Kaifi Khalil', genres: ['romance', 'indie', 'soul', 'emotional'], mood: '💔 Melancholy & Yearning', tempo: 'slow', energy: 0.4, era: '2020s', times: ['midnight', 'evening'] },
      { id: '1T3i9Qp54s0', title: 'Heeriye', artist: 'Jasleen Royal, Arijit Singh', genres: ['romance', 'acoustic', 'lofi', 'indie'], mood: '☕ Midnight Romance', tempo: 'slow', energy: 0.45, era: '2020s', times: ['midnight', 'evening', 'morning'] },
      { id: 'Ax0G_P2dSBw', title: 'Channa Mereya', artist: 'Arijit Singh, Pritam', genres: ['soul', 'bollywood', 'emotional'], mood: '💔 Soulful Parting', tempo: 'slow', energy: 0.6, era: '2010s', times: ['midnight', 'evening'] },
      { id: '2v61_q1gR_A', title: 'Tujhe Kitna Chahne Lage', artist: 'Arijit Singh, Mithoon', genres: ['romance', 'bollywood', 'soul'], mood: '❤️ Deep Longing', tempo: 'slow', energy: 0.55, era: '2010s', times: ['midnight', 'evening'] },

      // --- ACOUSTIC INDIE & MONSOON / CHAI ---
      { id: 'YxWlaYCA8MU', title: 'Baarishein', artist: 'Anuv Jain', genres: ['acoustic', 'indie', 'lofi', 'monsoon'], mood: '🌧️ Monsoon Solitude', tempo: 'slow', energy: 0.35, era: '2010s', times: ['midnight', 'morning', 'evening'] },
      { id: '3vK3rZ3n2L0', title: 'Husn', artist: 'Anuv Jain', genres: ['indie', 'acoustic', 'lofi', 'chill'], mood: '☕ Midnight Poetic Sigh', tempo: 'slow', energy: 0.35, era: '2020s', times: ['midnight', 'evening'] },
      { id: 'mH_ELM-1j18', title: 'Jo Tum Mere Ho', artist: 'Anuv Jain', genres: ['indie', 'acoustic', 'romance', 'chill'], mood: '❤️ Gentle Confession', tempo: 'slow', energy: 0.4, era: '2020s', times: ['midnight', 'morning'] },
      { id: 'l8h_Ww99pT4', title: 'Alag Aasmaan', artist: 'Anuv Jain', genres: ['indie', 'acoustic', 'monsoon', 'chill'], mood: '🕊️ Long Distance Soul', tempo: 'slow', energy: 0.35, era: '2020s', times: ['midnight', 'morning'] },
      { id: 'T94PHkuydcw', title: 'Tu Hai Kahan', artist: 'AUR', genres: ['lofi', 'indie', 'midnight', 'chill'], mood: '☕ Midnight Nostalgia', tempo: 'slow', energy: 0.4, era: '2020s', times: ['midnight', 'evening'] },
      { id: 'v7K4vGYL96U', title: 'Tu Jaana Na Piya', artist: 'King', genres: ['pop', 'indie', 'romance'], mood: '❤️ Romantic Pop', tempo: 'mid', energy: 0.6, era: '2020s', times: ['evening', 'afternoon'] },

      // --- PUNJABI HITS & GROOVES ---
      { id: 'k4yXQkG2s1E', title: 'G.O.A.T.', artist: 'Diljit Dosanjh', genres: ['punjabi', 'hiphop', 'bhangra', 'energy'], mood: '👑 Unstoppable Flex', tempo: 'upbeat', energy: 0.85, era: '2020s', times: ['afternoon', 'evening'] },
      { id: 'qLCLvxTN9UA', title: 'Lover', artist: 'Diljit Dosanjh', genres: ['punjabi', 'pop', 'romance'], mood: '✨ Romantic Groove', tempo: 'upbeat', energy: 0.75, era: '2020s', times: ['evening', 'afternoon'] },
      { id: 'dZ0fwJojhrs', title: 'Wavy', artist: 'Karan Aujla', genres: ['punjabi', 'hiphop', 'trap', 'drive'], mood: '⚡ Unmatched Swagger', tempo: 'upbeat', energy: 0.8, era: '2020s', times: ['afternoon', 'evening'] },
      { id: '2hK0cZg5tQY', title: 'Softly', artist: 'Karan Aujla, Ikky', genres: ['punjabi', 'pop', 'rnb'], mood: '✨ Smooth R&B Romance', tempo: 'mid', energy: 0.7, era: '2020s', times: ['evening', 'midnight'] },
      { id: '6MgsHSAcI98', title: 'Winning Speech', artist: 'Karan Aujla', genres: ['punjabi', 'hiphop', 'energy'], mood: '👑 Victorious Anthem', tempo: 'fast', energy: 0.85, era: '2020s', times: ['afternoon', 'morning'] },
      { id: 'cl0a3i2wFcc', title: 'Pasoori', artist: 'Ali Sethi, Shae Gill (Coke Studio)', genres: ['coke_studio', 'folk', 'fusion', 'punjabi'], mood: '✨ Cosmic Ecstasy', tempo: 'upbeat', energy: 0.75, era: '2020s', times: ['evening', 'afternoon', 'morning'] },
      { id: 'Umqb9KENgmk', title: 'Saari Duniya Jalaa Denge', artist: 'B Praak, Jaani', genres: ['soul', 'punjabi', 'emotional'], mood: '🔥 Fierce Intensity', tempo: 'mid', energy: 0.7, era: '2020s', times: ['midnight', 'evening'] },
      { id: 'V1Pl8CzNzCw', title: 'Tareefan', artist: 'Badshah, Qaran', genres: ['club', 'punjabi', 'pop', 'party'], mood: '🔥 Ultra Chic Glamour', tempo: 'upbeat', energy: 0.8, era: '2010s', times: ['evening', 'afternoon'] },
      { id: 'hEJnMQG562U', title: 'Illegal Weapon 2.0', artist: 'Jasmine Sandlas, Garry Sandhu', genres: ['punjabi', 'dance', 'bhangra', 'energy'], mood: '⚡ High Octane Energy', tempo: 'fast', energy: 0.9, era: '2010s', times: ['afternoon', 'evening'] },
      { id: 'vX2cDW8up28', title: 'Amplifier', artist: 'Imran Khan', genres: ['nostalgia', 'punjabi', 'club', 'drive'], mood: '🚗 Car Bass Banger', tempo: 'fast', energy: 0.85, era: '2000s', times: ['evening', 'afternoon'] },

      // --- 90s & 2000s GOLDEN RETRO NOSTALGIA ---
      { id: '0NV1KdWRHck', title: 'Chura Ke Dil Mera', artist: 'Kumar Sanu, Alka Yagnik', genres: ['retro_90s', 'nostalgia', 'bollywood'], mood: '📼 90s Vintage Romance', tempo: 'mid', energy: 0.65, era: '90s', times: ['morning', 'evening'] },
      { id: 'D7a3m1W0hT0', title: 'Tujhe Dekha Toh', artist: 'Kumar Sanu, Lata Mangeshkar', genres: ['retro_90s', 'nostalgia', 'bollywood', 'romance'], mood: '🌾 Mustard Fields Romance', tempo: 'slow', energy: 0.5, era: '90s', times: ['morning', 'evening'] },
      { id: 'sAZvj4M6i6k', title: 'Pehla Nasha', artist: 'Udit Narayan, Sadhana Sargam', genres: ['retro_90s', 'romance', 'acoustic'], mood: '🕊️ First Love Bliss', tempo: 'mid', energy: 0.55, era: '90s', times: ['morning', 'evening'] },
      { id: 'm93sJ4a6y_Y', title: 'Tip Tip Barsa Paani', artist: 'Alka Yagnik, Udit Narayan', genres: ['retro_90s', 'monsoon', 'bollywood'], mood: '🌧️ Monsoon Passion', tempo: 'upbeat', energy: 0.7, era: '90s', times: ['evening', 'afternoon'] },
      { id: '8k_4mZ3h8vA', title: 'Kal Ho Naa Ho', artist: 'Sonu Nigam, Shankar-Ehsaan-Loy', genres: ['retro_90s', 'soul', 'bollywood'], mood: '✨ Timeless Heartbeat', tempo: 'slow', energy: 0.6, era: '2000s', times: ['evening', 'midnight', 'morning'] },

      // --- SUFI & SPIRITUAL DEVOTION ---
      { id: 'b9p_HjFq78c', title: 'Kun Faya Kun', artist: 'A.R. Rahman, Javed Ali, Mohit Chauhan', genres: ['sufi', 'spiritual', 'devotional'], mood: '🕊️ Divine Transience', tempo: 'slow', energy: 0.45, era: '2010s', times: ['morning', 'midnight', 'evening'] },
      { id: '1u_kH0N7k8w', title: 'Khwaja Mere Khwaja', artist: 'A.R. Rahman', genres: ['sufi', 'spiritual', 'classical', 'devotional'], mood: '✨ Cosmic Sanctuary', tempo: 'slow', energy: 0.45, era: '2000s', times: ['morning', 'midnight'] },
      { id: '6vY9o8J3r_4', title: 'Arziyan', artist: 'Javed Ali, Kailash Kher, A.R. Rahman', genres: ['sufi', 'soul', 'spiritual'], mood: '🕊️ Morning Supplication', tempo: 'mid', energy: 0.5, era: '2000s', times: ['morning', 'midnight'] },
      { id: '4b_W8k9a3M0', title: 'O Re Piya', artist: 'Rahat Fateh Ali Khan', genres: ['sufi', 'soul', 'romance'], mood: '🥀 Longing of the Soul', tempo: 'slow', energy: 0.5, era: '2000s', times: ['midnight', 'evening'] },

      // --- EDM & CLUB EUPHORIA ---
      { id: 'gCYcHz2167o', title: 'Animals', artist: 'Martin Garrix', genres: ['edm', 'electro', 'dance', 'energy'], mood: '⚡ High BPM Drops', tempo: 'fast', energy: 0.95, era: '2010s', times: ['afternoon', 'evening'] },
      { id: 'IcrbM1l_BoI', title: 'Wake Me Up', artist: 'Avicii', genres: ['edm', 'dance', 'pop', 'energy'], mood: '⚡ Timeless Festival Anthem', tempo: 'upbeat', energy: 0.85, era: '2010s', times: ['afternoon', 'morning'] },
      { id: '60ItHLz5WEA', title: 'Faded', artist: 'Alan Walker', genres: ['edm', 'electro', 'chill', 'lofi'], mood: '🌌 Dreamy Euphoria', tempo: 'mid', energy: 0.6, era: '2010s', times: ['midnight', 'evening'] },
      { id: 'ALZHF5UqnU4', title: 'Alone', artist: 'Marshmello', genres: ['edm', 'future_bass', 'energy'], mood: '⚡ Festival Bounce', tempo: 'fast', energy: 0.85, era: '2010s', times: ['afternoon', 'evening'] },
      { id: 'JRfuAukYTKg', title: 'Titanium', artist: 'David Guetta, Sia', genres: ['edm', 'dance', 'anthem', 'energy'], mood: '⚡ Unbreakable Power', tempo: 'fast', energy: 0.9, era: '2010s', times: ['afternoon', 'evening'] },
      { id: 'ebXbLfLACGM', title: 'Summer', artist: 'Calvin Harris', genres: ['edm', 'dance', 'party'], mood: '☀️ Summer Club Groove', tempo: 'fast', energy: 0.85, era: '2010s', times: ['afternoon', 'evening'] },

      // --- HOLLYWOOD & GLOBAL POP ---
      { id: '4NRXx6U8ABQ', title: 'Blinding Lights', artist: 'The Weeknd', genres: ['pop', 'synthwave', 'drive', 'dark_pop'], mood: '🚗 Midnight Speed Drive', tempo: 'fast', energy: 0.85, era: '2020s', times: ['midnight', 'evening', 'afternoon'] },
      { id: 'lp-EO5I60KA', title: 'Starboy', artist: 'The Weeknd, Daft Punk', genres: ['pop', 'rnb', 'synthwave', 'dark_pop'], mood: '⚡ Dark Electric Night', tempo: 'mid', energy: 0.75, era: '2010s', times: ['midnight', 'evening'] },
      { id: 'JGwWNGJdvx8', title: 'Shape of You', artist: 'Ed Sheeran', genres: ['pop', 'acoustic', 'dance'], mood: '❤️ Catchy Romance', tempo: 'upbeat', energy: 0.75, era: '2010s', times: ['afternoon', 'morning'] },
      { id: '2Vv-BfVoq4g', title: 'Perfect', artist: 'Ed Sheeran', genres: ['pop', 'romance', 'acoustic', 'ballad'], mood: '💍 Timeless Wedding Vow', tempo: 'slow', energy: 0.45, era: '2010s', times: ['evening', 'midnight'] },
      { id: 'hLQl3WQQoQ0', title: 'Someone Like You', artist: 'Adele', genres: ['pop', 'acoustic', 'soul', 'emotional'], mood: '💔 Deep Piano Heartbreak', tempo: 'slow', energy: 0.4, era: '2010s', times: ['midnight', 'evening'] },
      { id: 'YQHsXMglC9A', title: 'Hello', artist: 'Adele', genres: ['pop', 'soul', 'ballad', 'emotional'], mood: '🌧️ Soulful Echoes', tempo: 'slow', energy: 0.5, era: '2010s', times: ['midnight', 'evening'] },
      { id: '7wtfhZwyrcc', title: 'Believer', artist: 'Imagine Dragons', genres: ['pop', 'rock', 'anthem', 'energy'], mood: '⚡ High Spirits & Gym Hype', tempo: 'mid', energy: 0.85, era: '2010s', times: ['afternoon', 'morning'] },
      { id: 'OPf0YbXqDm0', title: 'Uptown Funk', artist: 'Mark Ronson, Bruno Mars', genres: ['pop', 'dance', 'funk', 'party'], mood: '🔥 Retro Groove', tempo: 'fast', energy: 0.9, era: '2010s', times: ['afternoon', 'evening'] },
      { id: 'hT_nvWreIhg', title: 'Counting Stars', artist: 'OneRepublic', genres: ['pop', 'rock', 'dance'], mood: '⚡ High Spirits', tempo: 'fast', energy: 0.8, era: '2010s', times: ['afternoon', 'morning'] },
      { id: 'fRh_vgS2dFE', title: 'Sorry', artist: 'Justin Bieber', genres: ['pop', 'dance'], mood: '✨ Infectious Dance', tempo: 'upbeat', energy: 0.75, era: '2010s', times: ['afternoon', 'evening'] },
      { id: 'V-_O7nl0Ii0', title: 'Love Nwantiti', artist: 'CKay', genres: ['afrobeats', 'romance', 'chill'], mood: '☕ Hypnotic Afro Love', tempo: 'mid', energy: 0.6, era: '2020s', times: ['midnight', 'evening'] }
    ];

    // Collaborative Knowledge Graph: Related Artists Matrix
    var ARTIST_GRAPH = {
      'arijit singh': ['vishal mishra', 'pritam', 'sachin-jigar', 'mithoon', 'mohit chauhan', 'atif aslam', 'shreya ghoshal', 'jubin nautiyal', 'jasleen royal'],
      'anuv jain': ['prateek kuhad', 'aur', 'kaifi khalil', 'jasleen royal', 'aditya a', 'twin strings', 'the local train'],
      'diljit dosanjh': ['karan aujla', 'ap dhillon', 'shubh', 'ikky', 'sidhu moose wala', 'badshah', 'jasmine sandlas'],
      'karan aujla': ['diljit dosanjh', 'ap dhillon', 'shubh', 'ikky', 'badshah', 'sidhu moose wala'],
      'kumar sanu': ['alka yagnik', 'udit narayan', 'sonu nigam', 'lata mangeshkar', 'abhijeet', 'anuradha paudwal'],
      'alka yagnik': ['kumar sanu', 'udit narayan', 'sonu nigam', 'arijit singh', 'sadhana sargam'],
      'a.r. rahman': ['javed ali', 'mohit chauhan', 'lucky ali', 'nusrat fateh ali khan', 'kailash kher', 'rahat fateh ali khan'],
      'the weeknd': ['daft punk', 'alan walker', 'avicii', 'marshmello', 'dua lipa', 'bruno mars'],
      'alan walker': ['marshmello', 'martin garrix', 'avicii', 'the chainsmokers', 'david guetta'],
      'ed sheeran': ['justin bieber', 'charlie puth', 'onerepublic', 'shawn mendes'],
      'adele': ['sam smith', 'lewis capaldi', 'billie eilish', 'coldplay']
    };

    // Cross-Genre Harmony Bridges
    var GENRE_BRIDGES = {
      'romance': ['soul', 'acoustic', 'bollywood', 'monsoon'],
      'lofi': ['acoustic', 'midnight', 'indie', 'monsoon'],
      'acoustic': ['lofi', 'indie', 'romance', 'monsoon'],
      'punjabi': ['pop', 'hiphop', 'bhangra', 'dance'],
      'edm': ['dance', 'synthwave', 'future_bass', 'club'],
      'retro_90s': ['bollywood', 'nostalgia', 'romance'],
      'sufi': ['spiritual', 'soul', 'devotional', 'acoustic'],
      'monsoon': ['acoustic', 'lofi', 'romance', 'indie']
    };

    function getTimeContext() {
      var hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        return { phase: 'morning', label: '🌅 Morning Chai', icon: '🌅', boostGenres: ['acoustic', 'sufi', 'morning', 'chill', 'lofi', 'romance'] };
      } else if (hour >= 12 && hour < 17) {
        return { phase: 'afternoon', label: '☀️ Afternoon Flow', icon: '☀️', boostGenres: ['pop', 'indie', 'punjabi', 'upbeat', 'dance', 'edm'] };
      } else if (hour >= 17 && hour < 22) {
        return { phase: 'evening', label: '🌇 Sunset Melody', icon: '🌇', boostGenres: ['romance', 'bollywood', 'punjabi', 'soul', 'acoustic'] };
      } else {
        return { phase: 'midnight', label: '🌙 Midnight Lo-Fi', icon: '🌙', boostGenres: ['midnight', 'lofi', 'acoustic', 'dark_pop', 'soul', 'romance'] };
      }
    }

    function getProfile() {
      try {
        var raw = localStorage.getItem(VIBE_PROFILE_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      return {
        playedHistory: [],
        genres: { romance: 8, lofi: 7, acoustic: 6, bollywood: 7, punjabi: 5, soul: 6, indie: 5, sufi: 4, retro_90s: 4 },
        artists: { 'Arijit Singh': 8, 'Anuv Jain': 6, 'Diljit Dosanjh': 5, 'Karan Aujla': 5, 'A.R. Rahman': 4 },
        moods: { 'love': 6, 'midnight': 6, 'chill': 5, 'monsoon': 4 },
        dislikedArtists: {},
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
      var initial = SONGS_CATALOG.slice(0, 18);
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

    function learnFromTrack(track, weight) {
      if (!track || !track.title) return;
      weight = weight || 1;
      if (weight === 1 && track.id && lastLearnedTrackId === track.id) return;
      if (track.id) lastLearnedTrackId = track.id;

      var prof = getProfile();
      prof.playedHistory = prof.playedHistory || [];
      prof.genres = prof.genres || {};
      prof.artists = prof.artists || {};
      prof.moods = prof.moods || {};

      prof.playedHistory.unshift({
        id: track.id || '',
        title: track.title,
        artist: track.artist || '',
        time: Date.now()
      });
      if (prof.playedHistory.length > 60) prof.playedHistory = prof.playedHistory.slice(0, 60);

      var art = (track.artist || '').trim().toLowerCase();
      if (art) {
        // Boost direct artist
        for (var a in prof.artists) {
          if (art.indexOf(a.toLowerCase()) !== -1) {
            prof.artists[a] = (prof.artists[a] || 0) + (2.5 * weight);
          }
        }
        // Auto-register new artist if not present
        var mainArt = track.artist.split(/[,&·]/)[0].trim();
        if (mainArt && !prof.artists[mainArt]) {
          prof.artists[mainArt] = 2.0 * weight;
        }

        // Cross-boost related artists via Knowledge Graph
        for (var graphKey in ARTIST_GRAPH) {
          if (art.indexOf(graphKey) !== -1) {
            ARTIST_GRAPH[graphKey].forEach(function (relArt) {
              for (var ex in prof.artists) {
                if (ex.toLowerCase().indexOf(relArt) !== -1) {
                  prof.artists[ex] = (prof.artists[ex] || 0) + (0.8 * weight);
                }
              }
            });
          }
        }
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
      if (text.indexOf('sufi') !== -1 || text.indexOf('rahman') !== -1 || text.indexOf('kun faya') !== -1 || text.indexOf('arziyan') !== -1) {
        detectedGenres.push('sufi', 'spiritual');
      }

      detectedGenres.forEach(function (g) {
        prof.genres[g] = (prof.genres[g] || 0) + (1.8 * weight);
        if (GENRE_BRIDGES[g]) {
          GENRE_BRIDGES[g].forEach(function (bg) {
            prof.genres[bg] = (prof.genres[bg] || 0) + (0.6 * weight);
          });
        }
      });

      prof.lastAnalyzed = Date.now();
      saveProfile(prof);

      autoCurateNextVibes();
      renderVibeUI();
    }

    function handleEarlySkip(track) {
      if (!track || !track.id) return;
      var prof = getProfile();
      recentSkips.unshift({ id: track.id, time: Date.now() });
      if (recentSkips.length > 20) recentSkips = recentSkips.slice(0, 20);

      var art = (track.artist || '').trim().toLowerCase();
      if (art) {
        for (var a in prof.artists) {
          if (art.indexOf(a.toLowerCase()) !== -1) {
            prof.artists[a] = Math.max(0.5, (prof.artists[a] || 2) - 1.2);
          }
        }
      }
      saveProfile(prof);
      autoCurateNextVibes();
    }

    function computeReason(song, prof, timeCtx, activeFilter) {
      if (activeFilter && activeFilter !== 'auto') {
        var filterNames = {
          romance: '❤️ Romance Vibe',
          midnight: '🌙 Midnight Lo-Fi Mode',
          indie: '☕ Acoustic Indie Mode',
          punjabi: '👑 Punjabi Hits Filter',
          monsoon: '🌧️ Monsoon Chai Vibe',
          retro: '📼 90s Golden Nostalgia',
          sufi: '🕊️ Sufi & Soul Sanctuary',
          edm: '⚡ High Octane Energy'
        };
        return filterNames[activeFilter] || '✨ AI Filtered Match';
      }

      // Check Artist Match
      var songArt = (song.artist || '').toLowerCase();
      var bestArt = '';
      var bestArtScore = 0;
      for (var a in prof.artists) {
        if (songArt.indexOf(a.toLowerCase()) !== -1 && prof.artists[a] > bestArtScore) {
          bestArt = a;
          bestArtScore = prof.artists[a];
        }
      }
      if (bestArt && bestArtScore > 5) {
        return '❤️ Because you love ' + bestArt;
      }

      // Check Related Artist from Knowledge Graph
      for (var gk in ARTIST_GRAPH) {
        if (prof.artists[gk] && prof.artists[gk] > 4) {
          var rels = ARTIST_GRAPH[gk];
          for (var i = 0; i < rels.length; i++) {
            if (songArt.indexOf(rels[i]) !== -1) {
              return '💎 Related to ' + (gk.charAt(0).toUpperCase() + gk.slice(1));
            }
          }
        }
      }

      // Check Time Context
      if (song.times && song.times.indexOf(timeCtx.phase) !== -1) {
        return timeCtx.icon + ' ' + timeCtx.label + ' Match';
      }

      // Check Liked Songs
      var isLiked = likedSongs.some(function (l) { return l.id === song.id; });
      if (isLiked) {
        return '❤️ From Your Favorites';
      }

      return song.mood || '✨ 97% Taste Match';
    }

    function scoreSong(song, prof, timeCtx, activeFilter) {
      var score = 10;
      var songArt = (song.artist || '').toLowerCase();

      // 1. Direct Genres Scoring (Log-scaled)
      if (song.genres && Array.isArray(song.genres)) {
        song.genres.forEach(function (g) {
          if (prof.genres[g]) {
            score += Math.sqrt(prof.genres[g]) * 6.5;
          }
        });
      }

      // 2. Artist Direct & Knowledge Graph Scoring
      for (var a in prof.artists) {
        var al = a.toLowerCase();
        if (songArt.indexOf(al) !== -1) {
          score += Math.sqrt(prof.artists[a]) * 10;
        }
      }
      for (var gk in ARTIST_GRAPH) {
        if (prof.artists[gk] && prof.artists[gk] > 3) {
          ARTIST_GRAPH[gk].forEach(function (rel) {
            if (songArt.indexOf(rel) !== -1) {
              score += Math.sqrt(prof.artists[gk]) * 4.5;
            }
          });
        }
      }

      // 3. Time of Day (Chrono-Acoustic Alignment)
      if (song.times && song.times.indexOf(timeCtx.phase) !== -1) {
        score += 14;
      }
      if (song.genres) {
        song.genres.forEach(function (g) {
          if (timeCtx.boostGenres.indexOf(g) !== -1) {
            score += 6;
          }
        });
      }

      // 4. Interactive Vibe Filter Boost
      if (activeFilter && activeFilter !== 'auto') {
        var filterMatch = false;
        if (activeFilter === 'romance' && (song.genres.indexOf('romance') !== -1 || song.genres.indexOf('soul') !== -1)) filterMatch = true;
        if (activeFilter === 'midnight' && (song.genres.indexOf('lofi') !== -1 || song.genres.indexOf('midnight') !== -1 || song.tempo === 'slow')) filterMatch = true;
        if (activeFilter === 'indie' && (song.genres.indexOf('indie') !== -1 || song.genres.indexOf('acoustic') !== -1)) filterMatch = true;
        if (activeFilter === 'punjabi' && song.genres.indexOf('punjabi') !== -1) filterMatch = true;
        if (activeFilter === 'monsoon' && (song.genres.indexOf('monsoon') !== -1 || song.genres.indexOf('acoustic') !== -1)) filterMatch = true;
        if (activeFilter === 'retro' && (song.genres.indexOf('retro_90s') !== -1 || song.era === '90s' || song.era === '2000s')) filterMatch = true;
        if (activeFilter === 'sufi' && (song.genres.indexOf('sufi') !== -1 || song.genres.indexOf('spiritual') !== -1)) filterMatch = true;
        if (activeFilter === 'edm' && (song.genres.indexOf('edm') !== -1 || song.genres.indexOf('dance') !== -1 || song.tempo === 'fast')) filterMatch = true;

        if (filterMatch) {
          score += 45;
        } else {
          score -= 25;
        }
      }

      // 5. Liked Songs Affinity
      if (likedSongs.some(function (l) { return l.id === song.id; })) {
        score += 18;
      }

      // 6. Fatigue & Recency Penalty (Anti-Loop)
      var recentPlays = prof.playedHistory.slice(0, 8);
      var playIndex = recentPlays.findIndex(function (p) { return p.id === song.id; });
      if (playIndex !== -1) {
        score -= (8 - playIndex) * 5; // Recently played songs get degraded score
      }

      // 7. Recent Early Skip Penalty
      var isRecentlySkipped = recentSkips.some(function (s) {
        return s.id === song.id && (Date.now() - s.time) < 15 * 60 * 1000;
      });
      if (isRecentlySkipped) {
        score -= 35;
      }

      // 8. Serendipity / Exploration Factor
      score += Math.random() * 6;

      return score;
    }

    function generateVibeRecommendations(count) {
      count = count || 16;
      var prof = getProfile();
      var timeCtx = getTimeContext();

      var scored = SONGS_CATALOG.map(function (s) {
        var sc = scoreSong(s, prof, timeCtx, activeVibeFilter);
        return {
          track: s,
          score: sc,
          reason: computeReason(s, prof, timeCtx, activeVibeFilter)
        };
      });

      scored.sort(function (a, b) { return b.score - a.score; });
      return scored.slice(0, count).map(function (item) {
        var copy = Object.assign({}, item.track);
        copy.aiReason = item.reason;
        return copy;
      });
    }

    function autoCurateNextVibes() {
      var currentList = getMyVibesList();
      var recommendations = generateVibeRecommendations(24);
      var currentIds = {};
      currentList.forEach(function (s) { currentIds[s.id] = true; });

      var addedCount = 0;
      recommendations.forEach(function (rec) {
        if (!currentIds[rec.id] && currentList.length < 50) {
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
        learnFromTrack(track, 3.5);
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

    function setVibeFilter(vibeKey) {
      activeVibeFilter = vibeKey || 'auto';
      var recs = generateVibeRecommendations(20);
      saveMyVibesList(recs);
      renderVibeUI();
      showToast('AI tuned to vibe: ' + (activeVibeFilter.toUpperCase()) + ' ⚡');
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
      var timeCtx = getTimeContext();

      // Update time phase badge
      var clockEl = $('aiVibeClock');
      if (clockEl) {
        clockEl.textContent = timeCtx.label;
      }

      // Update Top Tags
      var sortedGenres = Object.keys(prof.genres).sort(function (a, b) {
        return prof.genres[b] - prof.genres[a];
      }).slice(0, 5);

      var topTagsEl = $('aiVibeTags');
      if (topTagsEl) {
        topTagsEl.innerHTML = sortedGenres.map(function (g) {
          return '<span class="vibe-tag">#' + g.toUpperCase() + '</span>';
        }).join('');
      }

      // Update Learned Taste Status
      var statusEl = $('aiVibeStatus');
      if (statusEl) {
        var topG = sortedGenres[0] || 'Romance';
        var topG2 = sortedGenres[1] || 'Lo-Fi';
        var topA = Object.keys(prof.artists).sort(function (a, b) {
          return prof.artists[b] - prof.artists[a];
        })[0] || 'Arijit Singh';

        statusEl.innerHTML = '🔮 <b>Learned Frequency:</b> ' + topG.toUpperCase() + ' & ' + topG2.toUpperCase() + ' · Affinity with <i>' + topA + '</i> (' + myVibes.length + ' tracks)';
      }

      // Update active pill button state
      document.querySelectorAll('.vibe-pill').forEach(function (pill) {
        var vb = pill.getAttribute('data-vibe');
        pill.classList.toggle('active', vb === activeVibeFilter);
      });

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
        var reason = song.aiReason || computeReason(song, prof, timeCtx, activeVibeFilter);

        item.innerHTML = 
          '<div class="rec-left">' +
            '<img class="rec-thumb" src="' + thumb + '" alt="" loading="lazy">' +
            '<div class="rec-info">' +
              '<div class="rec-title">' + cleanTitle(song.title) + '</div>' +
              '<div class="rec-artist">' + (song.artist || 'AI Match') + '</div>' +
              '<div class="rec-reason"><span class="rec-reason-icon">⚡</span><span>' + reason + '</span></div>' +
            '</div>' +
          '</div>' +
          '<div class="rec-actions">' +
            '<button class="rec-btn btn-rec-queue" title="Add to Queue">+ Queue</button>' +
            '<button class="rec-btn btn-stream-vibe" title="Play Now">▶ Play</button>' +
            '<button class="rec-btn btn-del-vibe" title="Remove" style="color:#ff4757;">&times;</button>' +
          '</div>';

        item.querySelector('.btn-stream-vibe').addEventListener('click', function (e) {
          e.stopPropagation();
          playSingleTrack(song);
          $('queuePanel').classList.remove('open');
          showToast('Streaming from My Vibes ✨');
        });

        item.querySelector('.btn-rec-queue').addEventListener('click', function (e) {
          e.stopPropagation();
          addToQueue(song);
          learnFromTrack(song, 2.5);
        });

        item.querySelector('.btn-del-vibe').addEventListener('click', function (e) {
          e.stopPropagation();
          removeFromMyVibes(song.id);
        });

        item.addEventListener('click', function () {
          playSingleTrack(song);
          $('queuePanel').classList.remove('open');
          showToast('Streaming: ' + song.title + ' ✨');
        });

        recItemsContainer.appendChild(item);
      });
    }

    return {
      getProfile: getProfile,
      learnFromTrack: learnFromTrack,
      handleEarlySkip: handleEarlySkip,
      generateVibeRecommendations: generateVibeRecommendations,
      addToMyVibes: addToMyVibes,
      removeFromMyVibes: removeFromMyVibes,
      getMyVibesList: getMyVibesList,
      setVibeFilter: setVibeFilter,
      playMyVibesStation: playMyVibesStation,
      renderVibeUI: renderVibeUI,
      getTimeContext: getTimeContext,
      catalog: SONGS_CATALOG
    };
  })();


  /* ==================== PWA Service Worker Registration ==================== */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }

  /* ==================== Startup Engine ==================== */
  document.addEventListener('DOMContentLoaded', function () {
    // Warm up voices for AI DJ
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.getVoices(); } catch (e) {}
    }
  });

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
    document.body.classList.remove('mode-time-travel', 'mode-ishq', 'mode-demanding', 'mode-90s', 'mode-edm', 'mode-my-vibes');
    document.body.classList.add('mode-' + (th.uiMode || st.id));


    // Update Brand Title & Sub-heading
    var bTitle = $('brandTitle');
    if (bTitle) {
      bTitle.style.animation = 'none';
      void bTitle.offsetWidth; // trigger reflow
      bTitle.textContent = st.brand || st.name;
      bTitle.style.animation = 'jitterRevealTitle 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    }
    
    var bSub = $('brandSub');
    if (bSub) {
      bSub.style.animation = 'none';
      void bSub.offsetWidth;
      bSub.textContent = st.brandSub || (st.desc || '').toUpperCase();
      bSub.style.animation = 'jitterRevealSub 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards';
      bSub.style.animationDelay = '0.1s';
    }
    
    if ($('currentStationLabel')) $('currentStationLabel').textContent = st.short || st.name || 'STATIONS';


    if ($('loaderGlyph')) $('loaderGlyph').textContent = st.icon || '📻';
    if ($('errorGlyph')) $('errorGlyph').textContent = st.icon || '📻';
    if ($('counts')) $('counts').textContent = st.songCount || '4,000+ SONGS';

    // Update quote / one-line verse
    var qEl = $('liveLyricText') || $('shayariQuote');
    if (qEl) {
      qEl.classList.add('line-fade');
      setTimeout(function () {
        qEl.textContent = th.quote || "\"Soundtrack for your current state of mind…\"";
        qEl.classList.remove('line-fade');
      }, 150);
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
    if (!stations || !stations.length) {
      stations = DEFAULT_STATIONS.slice();
    }

    var matched = stations.find(function (s) { return s.id === currentStationKey; });
    if (!matched) {
      currentStation = stations[0];
      currentStationKey = stations[0].id;
      try { localStorage.setItem('ishq_station_key', currentStationKey); } catch (e) {}
    } else {
      currentStation = matched;
    }

    applyStationTheme(currentStation);

    var listContainer = $('stationItemsList');
    if (!listContainer) return;
    listContainer.innerHTML = '';

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

      item.addEventListener('click', function (e) {
        e.stopPropagation();
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
    var purgeBtn = $('purgeCacheBtn');
    if (purgeBtn) {
      purgeBtn.addEventListener('click', function () {
        HapticEngine.tap();
        if (confirm('⚡ Do you want to purge all cached data and reload authentic playlists?')) {
          purgeAuraCacheAndReset(true);
        }
      });
    }
  var stationDropdown = $('stationDropdown');

  if (stationSelectBtn && stationDropdown) {
    stationSelectBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      stationDropdown.classList.toggle('open');
    });

    stationDropdown.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }

  document.addEventListener('click', function () {
    if (stationDropdown) stationDropdown.classList.remove('open');
  });

  function switchStation(stKey) {
    var st = stations.find(function (s) { return s.id === stKey; });
    if (!st) return;

    // Prevent duplicate switch to same station only if already actively playing that station
    if (currentStationKey === stKey && activePlaylistId === (st.playlistId || st.id) && isPlaying()) {
      stationDropdown.classList.remove('open');
      return;
    }

    currentStationKey = stKey;
    currentStation = st;
    desired = true;
    document.body.classList.add('playing');
    hideAutoplayPrompt();
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

    var STATION_TRACKS = {
    'time-travel': [
      "JGwWNGJdvx8",
      "RgKAFK5djSk",
      "09R8_2nJtjg",
      "CevxZvSJLk8",
      "hT_nvWreIhg",
      "fRh_vgS2dFE",
      "aJOTlE1K90k",
      "0KSOMA3QBU0",
      "RBumgq5yVrA",
      "2Vv-BfVoq4g",
      "nfWlot6h_JM",
      "YQHsXMglC9A",
      "e-ORhEE9VVg",
      "3AtDnEC4zak",
      "0zGcUoRlhmw",
      "kffacxfA7G4",
      "k2qgadSvNyU",
      "papuvlVeZg8",
      "5GL9JoH4Sws",
      "pXRviuL6vMY",
      "7PCkvCPvDXk",
      "2vjPBrBU-TM",
      "uelHwf8o7_U",
      "fLexgOxsZu0",
      "ALZHF5UqnU4",
      "AJtDXIazrMo",
      "7wtfhZwyrcc",
      "lY2yjAdbvdQ",
      "PIh2xe4jnpk",
      "NywWB67Z7zQ",
      "zIh5AHxh-Ok",
      "IcrbM1l_BoI",
      "450p7goxZqg",
      "rtOvBOTyX00",
      "YBHQbu5rbdQ",
      "34Na4j8AVgA",
      "rYEDA3JcQqw",
      "PMivT7MJ41M",
      "SXiSVQZLje8",
      "lWA2pjMjpBs",
      "t4H_Zoh7G5A",
      "8UVNT4wvIGY",
      "8SbUC-UaAxE",
      "pz95u3UVpaM",
      "hLQl3WQQoQ0",
      "tt2k8PGm-TI",
      "UprcpdwuwCg",
      "q0hyYWKXF0Q",
      "3E78T8h5EhA",
      "uxpDa-c-4Mc",
      "yzTuBuRdAyA",
      "fKopy74weus",
      "0HDdjwpPM3Y",
      "kXYiU_JCYtU",
      "nYh-n7EOtMA",
      "LjhCEhWiKXk",
      "YykjpeuMNEk",
      "QK8mJJJvaes",
      "NGLxoKOvzu4",
      "oyEuk8j8imI",
      "j5-yKhDd64s",
      "weeI1G46q0o",
      "1G4isv_Fylg",
      "V1Pl8CzNzCw",
      "qrO4YZeyl0I",
      "ru0K8uYEZWw",
      "IPYTxAHeR_o",
      "uO59tfQ2TbA",
      "gdZLi9oWNZg",
      "UqyT8IEBkvY",
      "5qm8PH4xAss",
      "fJ9rUzIMcZQ",
      "hTWKbfoikeg",
      "CGyEd0aKWZE",
      "QcIy9NiNbmo",
      "L3wKzyIN1yk",
      "foE1mO2yM04",
      "djV11Xbc914",
      "xTlNMmZKwpA",
      "nCkpzqqog4k",
      "VbfpW0pbvaU",
      "fWNaR-rxAic",
      "YVkUvmDQ3HY",
      "h3e1wYxipHg",
      "CTFtOOh47oo",
      "Pkh8UtuejGw",
      "eVTXPUF4Oz4",
      "ktvTqknDobU",
      "nfs8NYg7yQM",
      "hHUbLv4ThOo",
      "QGJuMBdaqIw",
      "QJO3ROT-A4E",
      "LjxulQ1bEWg",
      "iS1g8G_njx8",
      "QtXby3twMmI",
      "LHCob76kigA",
      "HL1UzIK-flA",
      "KEI4qSrkPAs",
      "3JWTaaS7LdU",
      "dPI-mRFEIH0"
    ],
    'ishq': [
      "wx89ZdkwtS8",
      "8Fz2GXx9Qsw",
      "6qBdQzPnw4E",
      "-UgrS_B53Yc",
      "1Z-bNCeIiY0",
      "TcsiObY0HYE",
      "dNBtIy9dmdw",
      "Buvsar0LHwQ",
      "jAUSF4_ygJg",
      "T-g39o0rDos",
      "mXkbWKr5ovU",
      "vnCIjfkPooo",
      "OMoU0Pfibc4",
      "mMDntBRkHd0",
      "Vy0Wy88sXuA",
      "gXkSvlILo-k",
      "uSibwB2TQC4",
      "lN1m7zLBbSU",
      "T94PHkuydcw",
      "qoq8B8ThgEM",
      "zWEOx7TSM6I",
      "qtz5mpvgAM0",
      "cmMiyZaSELo",
      "EiItLWWxgOI",
      "8FMz_KT1mC4",
      "D8XFTglfSMg",
      "BadBAMnPX0I",
      "jjk-nmsXYhw",
      "rTuxUAuJRyY",
      "P8PWN1OmZOA",
      "yUu26tcUri0",
      "MvcNeQlqtes",
      "zlt38OOqwDc",
      "NE4d86SFw6I",
      "8kxufj_snhI",
      "z3UHfi9vpbc",
      "Umqb9KENgmk",
      "2bMEe0UYa8E",
      "eHRrZ5DQCV4",
      "inEu2qQuGZ8",
      "VdyBtGaspss",
      "GtPvCa3vvxA",
      "IJq0yyWug1k",
      "g8LEktKv9hs",
      "krJsyb_yf7A",
      "jHNNMj5bNQw",
      "KgsYJRnBNeE",
      "qpIdoaaPa6U",
      "yBa3FVQKAvY",
      "i_HFdi1xxFM",
      "oWKgpB2zpgw",
      "RazuWp5kSHk",
      "yIzCBU0_LyY",
      "ZgIzch1Pqj4",
      "e1edxTqJnKk",
      "g0eO74UmRBs",
      "XvUSsh3gdO4",
      "KLYwt0YmQw8",
      "6-n_szx2XRE",
      "EoCz3Vx1pXg",
      "0NFxcNheoLc",
      "b5WdL51te0A",
      "VMEXKJbsUmE",
      "FJ55SHCzt88",
      "FxAG_11PzCk",
      "wO5j3lv_9Fs",
      "KfP8UFsNPYc",
      "zUqcsv1_0es",
      "_qrxVjvVp4M",
      "XLxWVRQpCzU",
      "8uJ-wOljP_s",
      "cNV5hLSa9H8",
      "zWPsjhBaRb0",
      "kzTWRX9Dhrg",
      "1cWR8QVhJLE",
      "eM8Mjuq4MwQ",
      "SdGL0qxgZGM",
      "Mv3SZDP7QUo",
      "IgK5-PUeARg",
      "iv7lcUkFVSc",
      "aZiBmzHQTIk",
      "NerQs_SOwRo",
      "MVpAAJzPEds",
      "f3FFOBrMmdg",
      "oyaudgo5_8Y",
      "ktPD6TMovxs",
      "nCD2hj6zJEc",
      "ZwrcuypKZTM",
      "sK7riqg2mr4",
      "Dp6lbdoprZ0",
      "8Emxd5lV0Qo",
      "2kgEc6oH9J0",
      "EpEraRui1pc",
      "0w62ddeVwGE",
      "X7L4wvljHhM",
      "5mpq_4rzB1U",
      "N2-HsIYd0Go",
      "vUCM_0evdQY",
      "_FRbTRnPFnY",
      "28VtHU9OoYU"
    ],
    'demanding': [
      "kJQP7kiw5Fk",
      "RgKAFK5djSk",
      "JGwWNGJdvx8",
      "OPf0YbXqDm0",
      "9bZkp7q19f0",
      "k85mRPqvMbE",
      "FzG4uDgje3M",
      "09R8_2nJtjg",
      "pRpeEdMmmQ0",
      "hT_nvWreIhg",
      "CevxZvSJLk8",
      "fRh_vgS2dFE",
      "0KSOMA3QBU0",
      "2Vv-BfVoq4g",
      "lp-EO5I60KA",
      "RBumgq5yVrA",
      "60ItHLz5WEA",
      "aJOTlE1K90k",
      "YqeW9_5kURI",
      "NUsoVlDFqZg",
      "e-ORhEE9VVg",
      "nfWlot6h_JM",
      "wnJ6LuUFpMo",
      "kffacxfA7G4",
      "3AtDnEC4zak",
      "YQHsXMglC9A",
      "PT2_F-1esPk",
      "k2qgadSvNyU",
      "6Mgqbai3fKo",
      "papuvlVeZg8",
      "pXRviuL6vMY",
      "1_zgKRBrT0Y",
      "DiItGE3eAyQ",
      "5GL9JoH4Sws",
      "uelHwf8o7_U",
      "fLexgOxsZu0",
      "kOkQ4T5WO9E",
      "2vjPBrBU-TM",
      "7wtfhZwyrcc",
      "VqEbCxg2bNI",
      "7PCkvCPvDXk",
      "ixkoVwKQaJg",
      "rYEDA3JcQqw",
      "ALZHF5UqnU4",
      "rtOvBOTyX00",
      "ApXoWvfEYVU",
      "PIh2xe4jnpk",
      "34Na4j8AVgA",
      "lY2yjAdbvdQ",
      "GMFewiplIbw",
      "9jI-z9QN6g8",
      "450p7goxZqg",
      "t4H_Zoh7G5A",
      "KQ6zr6kCPj8",
      "IcrbM1l_BoI",
      "TyHvyGVs42U",
      "kXYiU_JCYtU",
      "lWA2pjMjpBs",
      "8UVNT4wvIGY",
      "AJtDXIazrMo",
      "PMivT7MJ41M",
      "w2C6RhQBYlg",
      "FM7MFYoylVs",
      "YBHQbu5rbdQ",
      "DK_0jXPuIr0",
      "SXiSVQZLje8",
      "_I_D_8Z4sJE",
      "hLQl3WQQoQ0",
      "IHNzOHi8sJs",
      "zEf423kYfqk",
      "5qm8PH4xAss",
      "8SbUC-UaAxE",
      "UprcpdwuwCg",
      "QFs3PIZb3js",
      "tt2k8PGm-TI",
      "fKopy74weus",
      "0VR3dfZf9Yg",
      "p7bfOZek9t4",
      "l0U7SxXHkPY",
      "q0hyYWKXF0Q",
      "yzTuBuRdAyA",
      "Io0fBr1XBUA",
      "YykjpeuMNEk",
      "YVkUvmDQ3HY",
      "TapXs54Ah3E",
      "djV11Xbc914",
      "uxpDa-c-4Mc",
      "2S24-y0Ij3Y",
      "0HDdjwpPM3Y",
      "HCjNJDNzw8Y",
      "LjhCEhWiKXk",
      "sGIm0-dQd8M",
      "L3wKzyIN1yk",
      "vjW8wmF5VWc",
      "wfWkmURBNv8",
      "aDCcLQto5BM",
      "j5-yKhDd64s",
      "JRfuAukYTKg",
      "hTWKbfoikeg",
      "iOe6dI2JhgU"
    ],
    '90s': [
      "yqtGt2IjyKg",
      "-xjhuuVXcF0",
      "cGNcjqXe87U",
      "ZaURV4XxdPI",
      "Fi3GovijpWA",
      "8asqnl6mJbM",
      "1q65CU2JoXg",
      "XK-VKvpqEjo",
      "I94fhjQ-U30",
      "aG7MaqtWxT8",
      "D49nMgP7Vzc",
      "cr4Tz4JEP40",
      "LH9REAV5UzU",
      "L0FzCiuTVEw",
      "oeYgD5w3NQo",
      "bdS6OoH1W2A",
      "gLBoyzFnAdE",
      "IWjbBSMsQJg",
      "eAxK5tyahUM",
      "QHOInViLMR0",
      "55UJumsI1m0",
      "mFdIMZk6UHI",
      "AsieVqOTRs0",
      "pdZ7x_aaIqs",
      "YhEdDnxHZt4",
      "bfUhkXFNIig",
      "3chj4ooasmE",
      "VMSNq_wtBDQ",
      "Y2TT0zOdpvQ",
      "ELZYwzTPUw4",
      "bkWpCme6JCo",
      "Wk4z3rc84bc",
      "FA_J8XwpCaQ",
      "9ZPY9ZopT0k",
      "SJPo9PRSI2E",
      "-ibj0TgN8WU",
      "9rvq0qVmNeQ",
      "nG60SUcmSjY",
      "XA_uBJjutgc",
      "rvnyVvSRAxs",
      "Lrh3kJoGYX0",
      "OW6LBjKvTpo",
      "ar_m3IbjS4c",
      "HWpZ_rOe_f0",
      "ddWkP5I1JRc",
      "Xz0fMH6ClKY",
      "PNacQbYrH_E",
      "itc-rHSsDj4",
      "3bihxys5Gbg",
      "gZjnUcJy-Rw",
      "wYqsktWxWBw",
      "k1j1qr0mXPI",
      "2CAiycLVy7s",
      "fw31zV1Pxbk",
      "6NeVceQd6yI",
      "p4664nVBMxg",
      "PfcwlfCm7fc",
      "-R9jQxuZbJk",
      "V1_5SHc21m8",
      "Qne9PZQAQwE",
      "dXhHCRaNodc",
      "VfhyqSZ1W-g",
      "tYTmGrUCjJ8",
      "wzOWggEF0No",
      "1kcCk4YRJdo",
      "Yvm29p5jXiA",
      "vjtNRCUYMG0",
      "WhwHOUiwytk",
      "ZqXoSU5_bNc",
      "1wSiT8ojX6o",
      "swcCuuQKGJ4",
      "sq8-O6k0akM",
      "14eL3TLUjUk",
      "nUSeZx7TYmY",
      "toQenjjnqv4",
      "12pMB_mCBOo",
      "XPu9ZE4Onzc",
      "fa4l-vJ_5ic",
      "jbtF5YR6hNU",
      "j4WUfUDn5hc",
      "r7TVnh8DqBs",
      "q9a3HjLeSJM",
      "-KTXtRHYf70",
      "rXVot29Ez6Y",
      "Fg4CANalLNE",
      "Qcdk7FvmDgo",
      "pfdxsCAPXw0",
      "vbpoHbBiyFk",
      "D0U7kd6yNaA",
      "vrvR3iViJGU",
      "hpJGmMUZloU",
      "16N7jlaOcw4",
      "AWMxP8dl4GQ",
      "ekgnNMwne2w",
      "RffyCiAoyKc",
      "8hvwzeAbFm8",
      "wtlNGAXKkP4",
      "GyU-glCZz3o",
      "PhWhGt28wNY",
      "w3TO7ErAqwE"
    ],
    'edm': [
      "h57cdi9O8-k",
      "M1WMEBc1PGU",
      "nDRuWSTx_Yk",
      "KEZGd1swirM",
      "LK8PnDS2Wy8",
      "ITHeR1KeHG4",
      "qKYayFGd76w",
      "OPvx_3uR93U",
      "lNM9HlEK4q4",
      "J_EUAVqxmt8",
      "5Tm_Q1MbODw",
      "EwlKNMpPRGY",
      "xjKs_5bWS9I",
      "VWQ-e0qXX0M",
      "dpdBZWN0kkg",
      "vn7kDD573NY",
      "nwKiUtp3xec",
      "yfHNVkkFC7o",
      "EW4pNzAbVao",
      "JU3gzzH2DsM",
      "jnnbD-iJorE",
      "JfvhafWARGQ",
      "Rgvctrq0wUU",
      "MQIVguU3v3k",
      "I17Da5m1wvA",
      "H7Nei5GRU4E",
      "Kz-wnH4n11I",
      "A46Y2CLH4Bk",
      "IXFeUfLoHvM",
      "b_bEigUA1kk",
      "CWeHepZwiXc",
      "7snjekXdr1o",
      "6241zPlYMJY",
      "bN9B2IjiTZ8",
      "xw6BPt9f1eU",
      "8KTPAce5a98",
      "96JgJIp8PdY",
      "Zk7Dg30tCDU",
      "SbUBMklQSVU",
      "hpCII0W6hEk",
      "AQ0resnXCcE",
      "IcoqJCJlHbQ",
      "exJlapzPnlc",
      "AByfaYcOm4A",
      "CGyEd0aKWZE",
      "725WlG1idPc",
      "dT2owtxkU8k",
      "3x2ABSAMVno",
      "eC-F_VZ2T1c",
      "wl77bF4DJw0",
      "pwcSdmn6Wek",
      "EpRJY-hI6Bs",
      "EgqUJOudrcM",
      "4NRXx6U8ABQ",
      "HhjHYkPQ8F0",
      "kOluP21d10c",
      "gE_sSWSW3wo",
      "VrDfSZ_6f4U",
      "J7p4bzqLvCw",
      "RmYCOm4ehKs",
      "hJWSZDJb-W4",
      "KPM_BYl-EaQ",
      "wSOc5jmvF-k",
      "H3Kzh6RrnMc",
      "inCm3ByI17o",
      "4EQkYVtE-28",
      "_GWKkqNoyEA",
      "w1Smzzw_w7Q",
      "ZD6rXLXZOEI",
      "R_BO8C05XLA",
      "WMK3JXG3Fx0",
"KWuyx6yZ21U",
      "3_g2un5M350",
      "j1h0rPYKces",
      "K1FlAphL2p8",
      "xOazTYPrt64",
      "cnRB2CgUpSw",
      "aczouaO5L_k",
      "Q0TEUMPIhk8",
      "vFFT1iAUNDE",
      "qPRNIHxLhmc",
      "aDPkAK5s30I",
      "aTEa2CgmsMA",
      "Bd24VaftoMM",
      "U5AfCwh1J9Y",
      "XsMpXczOIPs",
      "ricvj03PHSU",
      "70BASPcfWVQ",
      "r7Rn4ryE_w8",
      "nujn6wbr-e8",
      "5G-rzr2FxTw",
      "Dfiw7EmRTC4",
      "y4FiCl-tUJc",
      "iR1sAex__VA",
      "jgHYgDFD0xo",
      "yRVotpLaCD4",
      "JKlYOUfviXM",
      "OK848_DSj6k",
      "Gr6g3-6VQoE",
      "naY7omm4-iI"
    ]
  };

  var currentTrackIndex = 0;
  var currentTrackQueue = [];

  function loadStationPlayback(st) {
    if (!player) return;
    claimAudioMaster();

    if (stationSwitchTimer) clearTimeout(stationSwitchTimer);

    if (st.id === 'my-vibes') {
      stationSwitchTimer = setTimeout(function () {
        if (currentStationKey !== 'my-vibes') return;
        VibeAgent.playMyVibesStation();
      }, 200);
      return;
    }

    stationSwitchTimer = setTimeout(function () {
      if (st.id !== currentStationKey) return;

      try {
        activePlaylistId = st.playlistId || st.id;

        // Immediate UI feedback with station branding
        var titleEl = $('title');
        if (titleEl && !titleEl.textContent.trim()) titleEl.textContent = st.name;
        var artistEl = $('artist');
        if (artistEl && !artistEl.textContent.trim()) artistEl.textContent = st.desc || st.brandSub || st.name;

        // Always load the direct authentic track array from STATION_TRACKS
        var list = (typeof STATION_TRACKS !== 'undefined' && STATION_TRACKS[st.id] && STATION_TRACKS[st.id].length)
          ? STATION_TRACKS[st.id].slice()
          : ['IltsCYPwtjE', 'BddP6PYo2gs', '1T3i9Qp54s0'];

        currentTrackQueue = list.slice();
        currentTrackIndex = 0;

        if (player.loadPlaylist) {
          if (desired) {
            player.loadPlaylist(list, 0, 0);
            setTimeout(function () {
              try { if (player && player.playVideo) player.playVideo(); } catch (e) {}
            }, 200);
          } else if (player.cuePlaylist) {
            player.cuePlaylist(list, 0, 0);
          }
          setTimeout(function () {
            if (player.setLoop) player.setLoop(true);
            if (player.setShuffle) player.setShuffle(false);
          }, 600);
        } else {
          var targetVid = list[0];
          if (desired && player.loadVideoById) {
            player.loadVideoById(targetVid);
          } else if (player.cueVideoById) {
            player.cueVideoById(targetVid);
          }
        }
      } catch (e) {
        console.error("Playback load error", e);
      }

      show('s-ready');
      VibeAgent.renderVibeUI();
    }, 50);
  }

  /* ==================== Track Skipper ==================== */
  function skip(dir) {
    try { HapticEngine.tap(); } catch (e) {}
    claimAudioMaster();
    desired = true;
    document.body.classList.add('playing');
    hideAutoplayPrompt();

    if (skipDebounce) return;
    skipDebounce = true;
    setTimeout(function () { skipDebounce = false; }, 300);

    try {
      // 1. Ensure currentTrackQueue has tracks from active station
      if (!currentTrackQueue || currentTrackQueue.length === 0) {
        var key = currentStationKey || 'ishq';
        if (typeof STATION_TRACKS !== 'undefined' && STATION_TRACKS[key] && STATION_TRACKS[key].length) {
          currentTrackQueue = STATION_TRACKS[key].slice();
        }
      }

      if (currentTrackQueue && currentTrackQueue.length > 0) {
        if (dir === 'next') {
          currentTrackIndex = (currentTrackIndex + 1) % currentTrackQueue.length;
          showToast('Next Song ⏭️');
        } else {
          currentTrackIndex = (currentTrackIndex - 1 + currentTrackQueue.length) % currentTrackQueue.length;
          showToast('Previous Song ⏮️');
        }

        var nextVid = currentTrackQueue[currentTrackIndex];
        if (player) {
          if (player.loadVideoById) {
            player.loadVideoById(nextVid);
          } else if (player.playVideoAt) {
            player.playVideoAt(currentTrackIndex);
          }
          setTimeout(function () {
            try { if (player.playVideo) player.playVideo(); } catch (e) {}
            update();
          }, 250);
        }
        return;
      }

      // 2. Fallback native YouTube playlist skip
      if (player) {
        if (dir === 'next' && player.nextVideo) {
          player.nextVideo();
          showToast('Next Song ⏭️');
        } else if (dir === 'prev' && player.previousVideo) {
          player.previousVideo();
          showToast('Previous Song ⏮️');
        }
        setTimeout(update, 500);
      }
    } catch (e) {
      console.warn("Skip error:", e);
    }
  }




  /* ==================== 3D Interactive Card Perspective Tilt & Glare ==================== */
  /* 3D tilt disabled for maximum 60fps performance */

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


  var upNextPlayBtn = $('upNextPlayBtn');
  if (upNextPlayBtn) {
    upNextPlayBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      skip('next');
    });
  }

  var upNextPill = $('upNextPill');
  if (upNextPill) {
    upNextPill.addEventListener('click', function () {
      skip('next');
    });
  }

  var discoverSimilarBtn = $('discoverSimilarBtn');
  if (discoverSimilarBtn) {
    discoverSimilarBtn.addEventListener('click', function () {
      if ($('queuePanel')) $('queuePanel').classList.add('open');
      if ($('recTabBtn')) $('recTabBtn').click();
    });
  }


  /* ==================== Dynamic Background Word Animator ==================== */
  var _lastBgWordsTitle = '';
  var _bgWordsDebounceTimer = null;

  function updateBackgroundWords(title, artist) {
    // Debounce — skip if same title or called within 800ms (lyric lines fire this every few seconds)
    var key = (title || '') + '|' + (artist || '');
    if (key === _lastBgWordsTitle) return;
    if (_bgWordsDebounceTimer) clearTimeout(_bgWordsDebounceTimer);
    _bgWordsDebounceTimer = setTimeout(function () {
      _lastBgWordsTitle = key;
      _doUpdateBackgroundWords(title, artist);
    }, 200);
  }

  function _doUpdateBackgroundWords(title, artist) {
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

  var ytExplorerBtn = $('ytExplorerBtn');
  if (ytExplorerBtn) ytExplorerBtn.addEventListener('click', enterExplorerUniverse);

  var backToRadioBtn = $('backToRadioBtn');
  if (backToRadioBtn) backToRadioBtn.addEventListener('click', exitExplorerUniverse);


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

  var expBannerFavBtn = $('expBannerFavBtn');
  if (expBannerFavBtn) {
    expBannerFavBtn.addEventListener('click', function () {
      if (currentUniversePlayingTrack) {
        toggleUniverseLike(currentUniversePlayingTrack);
      }
    });
  }


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
  var uniFavsBtn = $('uniFavsBtn');
  if (uniFavsBtn) {
    uniFavsBtn.addEventListener('click', function () {
      document.querySelectorAll('.uni-chip').forEach(function (c) { c.classList.remove('active'); });
      renderUniverseCards('favorites');
      showToast('Showing your Liked Songs ❤️');
    });
  }


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

  /* ==================== Living Atmosphere & Dynamic Weather Engine (SkyEngine) ==================== */
  var SkyEngine = (function () {
    var canvas = $('weatherCanvas');
    var ctx = canvas ? canvas.getContext('2d') : null;
    var flashEl = $('lightningFlash');
    var modal = $('skyControlModal');
    var autoSyncToggle = $('weatherAutoSyncToggle');

    var currentSkyTheme = localStorage.getItem('ishq_sky_theme') || 'rain';
    var isAutoSync = localStorage.getItem('ishq_weather_autosync') !== 'false';
    var weatherData = null;
    var userLocation = 'Greater Noida, IN';

    var width = window.innerWidth;
    var height = window.innerHeight;
    var particles = [];
    var ripples = [];
    var animFrame = null;
    var lastLightningTime = 0;

    var WEATHER_THEMES = {
      'none': { icon: '🚫', name: 'None (Classic)', ambientHint: 'Normal classic background without weather effects' },
      'rain': { icon: '🌧️', name: 'Monsoon Rain', ambientHint: 'Gentle raindrops & puddles' },
      'thunderstorm': { icon: '⛈️', name: 'Thunderstorm', ambientHint: 'Heavy storm & lightning flashes' },
      'sunny': { icon: '☀️', name: 'Solar Day', ambientHint: 'Golden sunbeams & warmth' },
      'night': { icon: '🌌', name: 'Starry Night', ambientHint: 'Twinkling stars & shooting meteors' },
      'windy': { icon: '🍃', name: 'Autumn Wind', ambientHint: 'Swaying breeze & drifting leaves' },
      'snow': { icon: '❄️', name: 'Snowfall', ambientHint: 'Soft crystalline snowfall' },
      'sunset': { icon: '🌅', name: 'Sunset Hour', ambientHint: 'Twilight glow & floating embers' },
      'fog': { icon: '🌫️', name: 'Lo-Fi Fog', ambientHint: 'Misty haze & mellow depth' }
    };

    function resize() {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    }

    function initParticles() {
      particles = [];
      ripples = [];

      if (currentSkyTheme === 'none') {
        if (ctx && canvas) ctx.clearRect(0, 0, width, height);
        return;
      }

      if (currentSkyTheme === 'rain' || currentSkyTheme === 'thunderstorm') {
        var count = currentSkyTheme === 'thunderstorm' ? 55 : 38;
        for (var i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            l: Math.random() * 16 + 8,
            vy: Math.random() * 6 + 10,
            vx: Math.random() * 1.5 - 1.8,
            opacity: Math.random() * 0.4 + 0.3
          });
        }
      } else if (currentSkyTheme === 'windy') {
        for (var j = 0; j < 16; j++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 6 + 4,
            vx: Math.random() * 2 + 1.5,
            vy: Math.random() * 1.0 + 0.4,
            rot: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.05,
            color: Math.random() > 0.4 ? 'rgba(255, 140, 100, ' : 'rgba(255, 192, 203, ',
            alpha: Math.random() * 0.4 + 0.2
          });
        }
      } else if (currentSkyTheme === 'snow') {
        for (var k = 0; k < 30; k++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 2.2 + 0.8,
            vy: Math.random() * 1.2 + 0.6,
            vxBase: (Math.random() - 0.5) * 0.4,
            swaySpeed: Math.random() * 0.02 + 0.01,
            swayOffset: Math.random() * Math.PI * 2,
            alpha: Math.random() * 0.5 + 0.2
          });
        }
      } else if (currentSkyTheme === 'night') {
        for (var s = 0; s < 35; s++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height * 0.8,
            r: Math.random() * 1.4 + 0.4,
            twinkleSpeed: Math.random() * 0.02 + 0.01,
            twinklePhase: Math.random() * Math.PI * 2,
            baseAlpha: Math.random() * 0.4 + 0.15
          });
        }
      } else if (currentSkyTheme === 'sunny') {
        for (var su = 0; su < 18; su++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 2.0 + 0.8,
            vy: -(Math.random() * 0.6 + 0.2),
            vx: (Math.random() - 0.5) * 0.3,
            alpha: Math.random() * 0.35 + 0.15
          });
        }
      } else if (currentSkyTheme === 'sunset') {
        for (var se = 0; se < 18; se++) {
          particles.push({
            x: Math.random() * width,
            y: height + Math.random() * 40,
            r: Math.random() * 1.8 + 0.6,
            vy: -(Math.random() * 1.4 + 0.4),
            vx: (Math.random() - 0.5) * 0.5,
            alpha: Math.random() * 0.5 + 0.15,
            color: Math.random() > 0.5 ? 'rgba(255, 120, 50, ' : 'rgba(255, 200, 80, '
          });
        }
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
    }

    function triggerLightning() {
      if (!flashEl || currentSkyTheme !== 'thunderstorm') return;
      flashEl.classList.add('flash');
      setTimeout(function () {
        flashEl.classList.remove('flash');
      }, 70);
    }

    var lastSkyTime = 0;

    function renderParticles(time) {
      // Kill RAF on mobile entirely (saves battery + CPU)
      if (window.innerWidth <= 768) {
        if (ctx && canvas) ctx.clearRect(0, 0, width, height);
        // Do NOT continue RAF loop on mobile
        return;
      }
      if (!ctx || !canvas || document.hidden) {
        animFrame = requestAnimationFrame(renderParticles);
        return;
      }

      // Stop completely when no weather theme active
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

      if (currentSkyTheme === 'rain' || currentSkyTheme === 'thunderstorm') {
        ctx.strokeStyle = currentSkyTheme === 'thunderstorm' ? 'rgba(200, 225, 255, 0.45)' : 'rgba(180, 210, 255, 0.32)';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        for (var i = 0; i < particles.length; i++) {
          var p = particles[i];
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 1.4, p.y + p.l);
          p.x += p.vx;
          p.y += p.vy;
          if (p.y >= height - 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }
        }
        ctx.stroke();

        // Random lightning strike in thunderstorm
        if (currentSkyTheme === 'thunderstorm') {
          if (!lastLightningTime) lastLightningTime = time;
          if (time - lastLightningTime > 9000 + Math.random() * 9000) {
            triggerLightning();
            lastLightningTime = time;
          }
        }
      } else if (currentSkyTheme === 'snow') {
        ctx.fillStyle = 'rgba(240, 248, 255, 0.65)';
        ctx.beginPath();
        for (var sn = 0; sn < particles.length; sn++) {
          var ps = particles[sn];
          ctx.moveTo(ps.x + ps.r, ps.y);
          ctx.arc(ps.x, ps.y, ps.r, 0, Math.PI * 2);
          ps.y += ps.vy;
          ps.x += ps.vxBase + Math.sin(time * ps.swaySpeed + ps.swayOffset) * 0.6;
          if (ps.y > height + 10) {
            ps.y = -10;
            ps.x = Math.random() * width;
          }
        }
        ctx.fill();
      } else if (currentSkyTheme === 'night') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        for (var ni = 0; ni < particles.length; ni++) {
          var pn = particles[ni];
          ctx.moveTo(pn.x + pn.r, pn.y);
          ctx.arc(pn.x, pn.y, pn.r, 0, Math.PI * 2);
        }
        ctx.fill();
      } else if (currentSkyTheme === 'sunny') {
        ctx.fillStyle = 'rgba(255, 220, 140, 0.3)';
        ctx.beginPath();
        for (var su = 0; su < particles.length; su++) {
          var psu = particles[su];
          ctx.moveTo(psu.x + psu.r, psu.y);
          ctx.arc(psu.x, psu.y, psu.r, 0, Math.PI * 2);
          psu.y += psu.vy;
          psu.x += psu.vx;
          if (psu.y < -10) {
            psu.y = height + 10;
            psu.x = Math.random() * width;
          }
        }
        ctx.fill();
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
            pse.alpha = Math.random() * 0.5 + 0.15;
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

      // Weather particles RAF loop disabled for 0% CPU/GPU usage
    }


    /* ==================== Clock & Date Engine ==================== */
    function updateClock() {
      var now = new Date();
      var timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

      var clockEl = $('weatherTimeDate');
      if (clockEl) {
        clockEl.textContent = timeStr;
      }
    }

    /* ==================== Open-Meteo & Location Weather Fetcher ==================== */
    function fetchLiveWeather() {
      fetch('https://get.geojs.io/v1/ip/geo.json')
        .then(function (r) { return r.json(); })
        .then(function (geo) {
          var lat = geo.latitude || 28.49;
          var lon = geo.longitude || 77.53;
          var city = geo.city || 'My City';
          var country = geo.country_code || 'IN';
          userLocation = city + ', ' + country;

          if ($('skyLocationSub')) $('skyLocationSub').textContent = '📍 ' + userLocation;

          var weatherUrl = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m';
          return fetch(weatherUrl);
        })
        .then(function (wr) { return wr.json(); })
        .then(function (wdata) {
          if (wdata && wdata.current) {
            weatherData = wdata.current;
            applyLiveWeatherData(weatherData);
          }
        })
        .catch(function (err) {
          // Fallback to local time heuristics
          var hr = new Date().getHours();
          var isDay = hr >= 6 && hr < 18 ? 1 : 0;
          applyLiveWeatherData({ temperature_2m: 25, relative_humidity_2m: 80, is_day: isDay, weather_code: 53, wind_speed_10m: 6 });
        });
    }

    function applyLiveWeatherData(cur) {
      var temp = Math.round(cur.temperature_2m);
      var code = cur.weather_code;
      var isDay = cur.is_day;
      var wind = Math.round(cur.wind_speed_10m);
      var hum = cur.relative_humidity_2m;

      var theme = 'rain';
      var condLabel = 'Rain';
      var icon = '🌧️';

      if (code >= 95) {
        theme = 'thunderstorm'; condLabel = 'Storm'; icon = '⛈️';
      } else if (code >= 51 && code <= 82) {
        theme = 'rain'; condLabel = 'Rain'; icon = '🌧️';
      } else if (code >= 71 && code <= 86) {
        theme = 'snow'; condLabel = 'Snow'; icon = '❄️';
      } else if (code === 45 || code === 48) {
        theme = 'fog'; condLabel = 'Fog'; icon = '🌫️';
      } else if (wind > 22) {
        theme = 'windy'; condLabel = 'Wind'; icon = '🍃';
      } else if (isDay) {
        var hr = new Date().getHours();
        if (hr >= 17 && hr <= 19) {
          theme = 'sunset'; condLabel = 'Sunset'; icon = '🌅';
        } else {
          theme = 'sunny'; condLabel = code <= 1 ? 'Sunny' : 'Clear'; icon = '☀️';
        }
      } else {
        theme = 'night'; condLabel = 'Night'; icon = '🌌';
      }

      if ($('weatherIconBadge')) $('weatherIconBadge').textContent = icon;
      if ($('weatherTempCond')) $('weatherTempCond').textContent = temp + '°C ' + condLabel;
      if ($('skyBigIcon')) $('skyBigIcon').textContent = icon;
      if ($('skyBigTemp')) $('skyBigTemp').textContent = temp + '°C';
      if ($('skyCondText')) $('skyCondText').textContent = condLabel + ' in ' + userLocation;
      if ($('skyHumidityVal')) $('skyHumidityVal').textContent = hum + '%';
      if ($('skyWindVal')) $('skyWindVal').textContent = wind + ' km/h';
      if ($('skyPhaseVal')) $('skyPhaseVal').textContent = isDay ? 'Daytime ☀️' : 'Nighttime 🌙';

      if (isAutoSync) {
        setSkyTheme(theme, false);
      }
    }


    function setSkyTheme(themeKey, isManual) {
      if (!WEATHER_THEMES[themeKey]) themeKey = 'none';
      currentSkyTheme = themeKey;
      localStorage.setItem('ishq_sky_theme', themeKey);

      if (isManual) {
        isAutoSync = false;
        localStorage.setItem('ishq_weather_autosync', 'false');
        if (autoSyncToggle) autoSyncToggle.checked = false;
        if (themeKey === 'none') {
          showToast('Atmosphere: Classic Normal Background 🚫');
        } else {
          showToast('Sky Atmosphere: ' + WEATHER_THEMES[themeKey].name + ' ' + WEATHER_THEMES[themeKey].icon);
        }
      }

      // Update body theme class
      document.body.className = document.body.className.replace(/\bsky-\w+\b/g, '').trim();
      if (themeKey !== 'none') {
        document.body.classList.add('sky-' + themeKey);
      }

      // Highlight active button in modal
      document.querySelectorAll('.sky-theme-btn').forEach(function (btn) {
        btn.classList.toggle('active', btn.getAttribute('data-sky') === themeKey);
      });

      initParticles();
    }


    function openModal() {
      if (!modal) return;
      modal.classList.add('open');
    }

    function closeModal() {
      if (!modal) return;
      modal.classList.remove('open');
    }

    // Wiring listeners
    var pillBtn = $('weatherPillBtn');
    if (pillBtn) pillBtn.addEventListener('click', openModal);

    var closeBtn = $('closeSkyBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    if (autoSyncToggle) {
      autoSyncToggle.checked = isAutoSync;
      autoSyncToggle.addEventListener('change', function () {
        isAutoSync = autoSyncToggle.checked;
        localStorage.setItem('ishq_weather_autosync', isAutoSync ? 'true' : 'false');
        if (isAutoSync && weatherData) {
          applyLiveWeatherData(weatherData);
          showToast('Real-world sky auto-sync activated 🌤️');
        } else {
          showToast('Manual atmosphere override enabled');
        }
      });
    }

    document.querySelectorAll('.sky-theme-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var t = btn.getAttribute('data-sky');
        if (t) setSkyTheme(t, true);
      });
    });

    window.addEventListener('resize', resize);

    // Start Clock loop & live weather
    updateClock();
    setInterval(updateClock, 1000);

    resize();
    renderParticles(0);
    fetchLiveWeather();
    setInterval(fetchLiveWeather, 600000); // 10 minutes

    return {
      setTheme: setSkyTheme,
      open: openModal,
      close: closeModal
    };
  })();

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

  var ambientToggleBtn = $('ambientToggleBtn');
  if (ambientToggleBtn) {
    ambientToggleBtn.addEventListener('click', function () {
      initAudioContext();
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      if ($('ambientPanel')) $('ambientPanel').classList.toggle('open');
      if ($('timerPanel')) $('timerPanel').classList.remove('open');
    });
  }

  var closeAmbientBtn = $('closeAmbientBtn');
  if (closeAmbientBtn) {
    closeAmbientBtn.addEventListener('click', function () {
      if ($('ambientPanel')) $('ambientPanel').classList.remove('open');
    });
  }

  var rainVol = $('rainVol');
  if (rainVol) {
    rainVol.addEventListener('input', function (e) {
      initAudioContext();
      if (rainGain) rainGain.gain.value = parseFloat(e.target.value) / 100 * 0.4;
    });
  }

  var crackleVol = $('crackleVol');
  if (crackleVol) {
    crackleVol.addEventListener('input', function (e) {
      initAudioContext();
      if (crackleGain) crackleGain.gain.value = parseFloat(e.target.value) / 100 * 0.35;
    });
  }

  var fireVol = $('fireVol');
  if (fireVol) {
    fireVol.addEventListener('input', function (e) {
      initAudioContext();
      if (fireGain) fireGain.gain.value = parseFloat(e.target.value) / 100 * 0.4;
    });
  }

  var sleepTimerBtn = $('sleepTimerBtn');
  if (sleepTimerBtn) {
    sleepTimerBtn.addEventListener('click', function () {
      if ($('timerPanel')) $('timerPanel').classList.toggle('open');
      if ($('ambientPanel')) $('ambientPanel').classList.remove('open');
    });
  }

  var closeTimerBtn = $('closeTimerBtn');
  if (closeTimerBtn) {
    closeTimerBtn.addEventListener('click', function () {
      if ($('timerPanel')) $('timerPanel').classList.remove('open');
    });
  }

  document.querySelectorAll('.timer-opt').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var mins = parseInt(btn.getAttribute('data-mins'), 10);
      if (typeof SleepTimerEngine !== 'undefined' && SleepTimerEngine.startTimer) {
        SleepTimerEngine.startTimer(mins);
      }
      if ($('timerPanel')) $('timerPanel').classList.remove('open');
    });
  });

  /* ==================== Liked Songs ==================== */
  var artLikeBtn = $('artLikeBtn');
  function updateLikeStatus(videoId) {
    var isLiked = likedSongs.some(function (s) { return s.id === videoId; });
    if (artLikeBtn) artLikeBtn.classList.toggle('liked', isLiked);
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
      if (artLikeBtn) artLikeBtn.classList.remove('liked');
      showToast('Removed from Liked Songs');
    } else {
      likedSongs.push({ id: vidId, title: title, artist: artist });
      if (artLikeBtn) artLikeBtn.classList.add('liked');
      showToast('Added to Liked Songs ❤️');
    }
    try { localStorage.setItem('ishq_liked_songs', JSON.stringify(likedSongs)); } catch (e) {}
    renderLikedList();
  }

  if (artLikeBtn) artLikeBtn.addEventListener('click', toggleLikeCurrent);


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
  var _queueTabBtn = $('queueTabBtn');
  var _recTabBtn = $('recTabBtn');
  var _favTabBtn = $('favTabBtn');
  var _queueList = $('queueList');
  var _recList = $('recList');
  var _favList = $('favList');

  if (_queueTabBtn) {
    _queueTabBtn.addEventListener('click', function () {
      if (_queueTabBtn) _queueTabBtn.classList.add('active');
      if (_recTabBtn) _recTabBtn.classList.remove('active');
      if (_favTabBtn) _favTabBtn.classList.remove('active');
      if (_queueList) _queueList.style.display = 'flex';
      if (_recList) _recList.style.display = 'none';
      if (_favList) _favList.style.display = 'none';
    });
  }

  if (_recTabBtn) {
    _recTabBtn.addEventListener('click', function () {
      if (_recTabBtn) _recTabBtn.classList.add('active');
      if (_queueTabBtn) _queueTabBtn.classList.remove('active');
      if (_favTabBtn) _favTabBtn.classList.remove('active');
      if (_queueList) _queueList.style.display = 'none';
      if (_recList) _recList.style.display = 'flex';
      if (_favList) _favList.style.display = 'none';
      VibeAgent.renderVibeUI();
    });
  }

  if (_favTabBtn) {
    _favTabBtn.addEventListener('click', function () {
      if (_favTabBtn) _favTabBtn.classList.add('active');
      if (_queueTabBtn) _queueTabBtn.classList.remove('active');
      if (_recTabBtn) _recTabBtn.classList.remove('active');
      if (_queueList) _queueList.style.display = 'none';
      if (_recList) _recList.style.display = 'none';
      if (_favList) _favList.style.display = 'flex';
      renderLikedList();
    });
  }

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
      var qp = $('queuePanel');
      if (qp) qp.classList.remove('open');
    });
  }

  var vibeFilterPillsContainer = $('vibeFilterPills');
  if (vibeFilterPillsContainer) {
    vibeFilterPillsContainer.addEventListener('click', function (e) {
      var pill = e.target.closest('.vibe-pill');
      if (!pill) return;
      var vibe = pill.getAttribute('data-vibe');
      if (vibe) {
        VibeAgent.setVibeFilter(vibe);
      }
    });
  }


  // Search Filter in Queue
  var _queueSearchInput = $('queueSearchInput');
  if (_queueSearchInput) {
    _queueSearchInput.addEventListener('input', function (e) {
      var q = e.target.value.toLowerCase().trim();
      document.querySelectorAll('#queueList .queue-item').forEach(function (el) {
        var text = el.textContent.toLowerCase();
        el.style.display = text.indexOf(q) !== -1 ? 'flex' : 'none';
      });
    });
  }

  /* ==================== Keyboard Shortcuts Modal ==================== */
  var _shortcutsHelpBtn = $('shortcutsHelpBtn');
  var _shortcutsModal = $('shortcutsModal');
  var _closeShortcutsBtn = $('closeShortcutsBtn');
  if (_shortcutsHelpBtn && _shortcutsModal) {
    _shortcutsHelpBtn.addEventListener('click', function () {
      _shortcutsModal.classList.add('open');
    });
  }
  if (_closeShortcutsBtn && _shortcutsModal) {
    _closeShortcutsBtn.addEventListener('click', function () {
      _shortcutsModal.classList.remove('open');
    });
  }

  /* ==================== Low-Power Station-Adaptive Kinetic Particles ==================== */
  (function initDynamicBackgroundEngine() {
    // Canvas loop disabled for 0% CPU & GPU usage
    var canvas = $('particles');
    if (canvas) {
      var ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  })();




  /* ==================== 1. Adaptive Artwork Ambient Light Mesh ==================== */
  var ArtworkMeshEngine = (function () {
    var canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    var ctx = canvas.getContext('2d', { willReadFrequently: true });

    function extractColorsFromImage(imgEl) {
      if (!ctx || !imgEl) return;
      try {
        ctx.clearRect(0, 0, 32, 32);
        ctx.drawImage(imgEl, 0, 0, 32, 32);
        var data = ctx.getImageData(0, 0, 32, 32).data;
        var samples = [];

        for (var i = 0; i < data.length; i += 16) {
          var red = data[i], green = data[i+1], blue = data[i+2];
          var brightness = (red * 299 + green * 587 + blue * 114) / 1000;
          if (brightness > 20 && brightness < 235) {
            samples.push([red, green, blue]);
          }
        }

        if (!samples.length) return;

        var c1 = samples[0];
        var c2 = samples[Math.floor(samples.length * 0.5)] || c1;
        var c3 = samples[samples.length - 1] || c2;

        var col1 = 'rgba(' + c1[0] + ', ' + c1[1] + ', ' + c1[2] + ', 0.32)';
        var col2 = 'rgba(' + c2[0] + ', ' + c2[1] + ', ' + c2[2] + ', 0.25)';
        var col3 = 'rgba(' + c3[0] + ', ' + c3[1] + ', ' + c3[2] + ', 0.20)';

        document.documentElement.style.setProperty('--art-vibrant-1', col1);
        document.documentElement.style.setProperty('--art-vibrant-2', col2);
        document.documentElement.style.setProperty('--art-ambient', col3);
      } catch (e) {}
    }

    return {
      extractColors: extractColorsFromImage
    };
  })();

  /* ==================== 2. LRCGOD MODE: Ultra-Low-Power Minimalist Ambient Lyrics ==================== */
  var LrcGodEngine = (function () {
    var modalToggleBtn = $('lrcGodToggleBtn');
    var dockToggleBtn = $('lrcGodDockBtn');
    var isEnabled = localStorage.getItem('aura_lrcgod_mode') !== 'false'; // default active
    var lastSpawnedText = '';
    var fadeTimer = null;

    function updateBtnStates() {
      if (modalToggleBtn) modalToggleBtn.classList.toggle('active', isEnabled);
      if (dockToggleBtn) dockToggleBtn.classList.toggle('active-btn', isEnabled);
    }

    function renderLyricLine(lineText) {
      if (!isEnabled || !lineText) return;
      var clean = lineText.replace(/\[\d{2}:\d{2}.*?\]/g, '').trim();
      if (!clean || clean === lastSpawnedText) return;
      lastSpawnedText = clean;

      var glyphsContainer = $('bgGlyphs');
      if (!glyphsContainer) return;

      var tokens = clean
        .replace(/[♪(),.!?:;\"'—–\-\[\]\d\/\\]/g, ' ')
        .split(/\s+/)
        .map(function (w) { return w.trim().toUpperCase(); })
        .filter(function (w) { return w.length >= 2; });

      var words = tokens.slice(0, 6);
      while (words.length < 6) {
        words.push(tokens[words.length % (tokens.length || 1)] || 'AURA');
      }

      // Smooth minimal opacity fade (Zero GPU/CPU overhead)
      glyphsContainer.style.opacity = '0';
      if (fadeTimer) clearTimeout(fadeTimer);
      fadeTimer = setTimeout(function () {
        glyphsContainer.innerHTML =
          '<span class="glyph g1">' + (words[0] || 'VIBES') + '</span>' +
          '<span class="glyph g2">' + (words[1] || 'MUSIC') + '</span>' +
          '<span class="glyph g3">' + (words[2] || 'SOUND') + '</span>' +
          '<span class="glyph g4">' + (words[3] || 'AURA') + '</span>' +
          '<span class="glyph g5">' + (words[4] || 'WAVE') + '</span>' +
          '<span class="glyph g6">' + (words[5] || 'ECHO') + '</span>' +
          '<span class="heart-glyph" id="centerHeartGlyph">' + clean.toUpperCase() + '</span>';
        glyphsContainer.style.opacity = '1';
      }, 250);
    }

    function toggleMode() {
      isEnabled = !isEnabled;
      localStorage.setItem('aura_lrcgod_mode', isEnabled);
      updateBtnStates();

      if (!isEnabled) {
        // Revert to song title default words
        var d = player && player.getVideoData && player.getVideoData();
        if (d && d.title) {
          updateBackgroundWords(d.title, d.author);
        }
        showToast('LRCGOD MODE OFF (Restored Station Glyphs)');
      } else {
        showToast('⚡ LRCGOD MODE ON (Minimalist Ambient Lyrics)');
      }
    }

    if (modalToggleBtn) modalToggleBtn.addEventListener('click', toggleMode);
    if (dockToggleBtn) dockToggleBtn.addEventListener('click', toggleMode);

    updateBtnStates();

    return {
      spawnLine: renderLyricLine,
      spawn: renderLyricLine,
      toggle: toggleMode,
      isEnabled: function () { return isEnabled; }
    };
  })();





  /* ==================== 3. Synchronized Liquid Karaoke Lyrics Engine ==================== */
  var LyricsEngine = (function () {
    var modal = $('lyricsModal');
    var listEl = $('lyricsLinesList');
    var titleEl = $('lyricsTrackTitle');
    var artistEl = $('lyricsTrackArtist');
    var autoScrollToggle = $('lyricsAutoScrollToggle');
    var scrollContainer = $('lyricsScrollContainer');
    var toggleBtn = $('lyricsToggleBtn');
    var closeBtn = $('closeLyricsBtn');
    var liveLyricBar = $('liveLyricBar');
    var liveLyricText = $('liveLyricText') || $('shayariQuote');
    var lyricIcon = $('lyricIcon');
    var coverThumbEl = $('lyricsCoverThumb');


    var currentLyrics = [];
    var currentActiveIndex = -1;
    var isAutoScroll = true;
    var lastFetchedTrackId = '';
    var lyricsCache = {}; // In-memory + sessionStorage cache

    function updateOneLineLyric(text, isSynced) {
      if (!liveLyricText) return;
      if (isSynced) {
        if (liveLyricBar) liveLyricBar.classList.add('synced');
        if (lyricIcon) lyricIcon.textContent = '🎵';
      } else {
        if (liveLyricBar) liveLyricBar.classList.remove('synced');
        if (lyricIcon) lyricIcon.textContent = '✨';
      }

      if (liveLyricText.textContent === text) return;

      liveLyricText.classList.add('line-fade');
      setTimeout(function () {
        liveLyricText.textContent = text;
        liveLyricText.classList.remove('line-fade');
      }, 90);
    }

    function sanitizeQuery(str) {
      if (!str) return '';
      return str
        .replace(/\(official.*?\)|\[official.*?\]/gi, '')
        .replace(/\(lyric.*?\)|\[lyric.*?\]/gi, '')
        .replace(/\(video.*?\)|\[video.*?\]/gi, '')
        .replace(/\(audio.*?\)|\[audio.*?\]/gi, '')
        .replace(/\(4k.*?\)|\[4k.*?\]/gi, '')
        .replace(/\(hd.*?\)|\[hd.*?\]/gi, '')
        .replace(/\(remaster.*?\)|\[remaster.*?\]/gi, '')
        .replace(/\(full song.*?\)|\[full song.*?\]/gi, '')
        .replace(/\(hq.*?\)|\[hq.*?\]/gi, '')
        .replace(/ft\..*?|feat\..*?/gi, '')
        .replace(/vevo|records|music|channel/gi, '')
        .replace(/[\(\)\[\]]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    function parseLRC(lrcText) {
      if (!lrcText) return [];
      var lines = lrcText.split('\n');
      var parsed = [];
      var timeRegex = /\[(\d{2}):(\d{2})\.?(\d{2,3})?\]/g;

      lines.forEach(function (line) {
        var match;
        var text = line.replace(/\[\d{2}:\d{2}\.?\d{2,3}?\]/g, '').trim();
        if (!text) return;

        timeRegex.lastIndex = 0;
        while ((match = timeRegex.exec(line)) !== null) {
          var min = parseInt(match[1], 10);
          var sec = parseInt(match[2], 10);
          var ms = match[3] ? parseFloat('0.' + match[3]) : 0;
          var totalSeconds = min * 60 + sec + ms;
          parsed.push({ time: totalSeconds, text: text });
        }
      });

      parsed.sort(function (a, b) { return a.time - b.time; });
      return parsed;
    }

    function fetchLyrics(track) {
      if (!track || !track.title) return;
      var trackId = track.id || track.title;
      if (trackId === lastFetchedTrackId && currentLyrics.length > 0) return;
      lastFetchedTrackId = trackId;

      var cleanT = sanitizeQuery(track.title);
      var cleanA = sanitizeQuery(track.artist || '');

      if (coverThumbEl && track.id) {
        coverThumbEl.src = 'https://i.ytimg.com/vi/' + track.id + '/mqdefault.jpg';
      }
      if (titleEl) titleEl.textContent = cleanT;
      if (artistEl) artistEl.textContent = cleanA || 'Aura Stream';
      if (listEl) listEl.innerHTML = '<div class="lyrics-loading">🎵 Searching synchronized lyrics…</div>';

      currentLyrics = [];
      currentActiveIndex = -1;

      var cacheKey = trackId || (cleanT + '_' + cleanA);
      
      // Check in-memory & sessionStorage cache
      if (lyricsCache[cacheKey]) {
        handleLyricsResult(lyricsCache[cacheKey]);
        return;
      }
      try {
        var stored = sessionStorage.getItem('aura_lrc_' + cacheKey);
        if (stored) {
          var parsedObj = JSON.parse(stored);
          if (parsedObj) {
            lyricsCache[cacheKey] = parsedObj;
            handleLyricsResult(parsedObj);
            return;
          }
        }
      } catch (e) {}

      var url = 'https://lrclib.net/api/get?track_name=' + encodeURIComponent(cleanT) + '&artist_name=' + encodeURIComponent(cleanA);
      
      fetch(url)
        .then(function (res) {
          if (!res.ok) throw new Error('No direct lyrics match');
          return res.json();
        })
        .then(function (data) {
          if (data && data.syncedLyrics) {
            cacheAndHandle(cacheKey, data.syncedLyrics);
          } else if (data && data.plainLyrics) {
            cacheAndHandle(cacheKey, data.plainLyrics);
          } else {
            searchFallback(cleanT, cacheKey);
          }
        })
        .catch(function () {
          searchFallback(cleanT, cacheKey);
        });
    }

    function searchFallback(query, cacheKey) {
      if (!query || query.trim() === '') {
        renderFallbackQuote();
        return;
      }
      fetch('https://lrclib.net/api/search?q=' + encodeURIComponent(query))
        .then(function (res) {
          if (!res.ok) throw new Error('Search failed');
          return res.json();
        })
        .then(function (results) {
          if (Array.isArray(results) && results.length > 0) {
            var best = results.find(function (r) { return r.syncedLyrics; }) || results[0];
            if (best && best.syncedLyrics) {
              cacheAndHandle(cacheKey, best.syncedLyrics);
              return;
            } else if (best && best.plainLyrics) {
              cacheAndHandle(cacheKey, best.plainLyrics);
              return;
            }
          }
          renderFallbackState();
        })
        .catch(function () {
          renderFallbackState();
        });
    }

    function cacheAndHandle(cacheKey, lrcRaw) {
      lyricsCache[cacheKey] = lrcRaw;
      try {
        sessionStorage.setItem('aura_lrc_' + cacheKey, JSON.stringify(lrcRaw));
      } catch (e) {}
      handleLyricsResult(lrcRaw);
    }

    function handleLyricsResult(lrcContent) {
      currentLyrics = parseLRC(lrcContent);
      if (!currentLyrics.length) {
        handlePlainLyricsResult(lrcContent);
        return;
      }
      if (liveLyricBar) liveLyricBar.classList.add('synced');
      if (lyricIcon) lyricIcon.textContent = '🎵';
      renderLinesUI();
    }

    function handlePlainLyricsResult(plainText) {
      var lines = plainText.split('\n').filter(function (l) { return l.trim().length > 0; });
      currentLyrics = lines.map(function (line, idx) {
        return { time: idx * 4, text: line.trim() };
      });
      if (currentLyrics.length && liveLyricBar) liveLyricBar.classList.add('synced');
      if (lyricIcon) lyricIcon.textContent = '🎵';
      renderLinesUI();
    }

    function renderFallbackState() {
      if (liveLyricBar) liveLyricBar.classList.remove('synced');
      if (lyricIcon) lyricIcon.textContent = '✨';
      if (!listEl) return;
      listEl.innerHTML = 
        '<div class="lyrics-empty">' +
          '<p style="font-size: 28px; margin-bottom: 8px;">🎶</p>' +
          '<p style="font-weight: 700; color: #fff; margin-bottom: 6px;">Live Audio Visual Stream</p>' +
          '<p>Instrumental track or lyrics not available in public database yet.</p>' +
        '</div>';
    }

    function renderLinesUI() {
      if (!listEl) return;
      listEl.innerHTML = '';
      currentLyrics.forEach(function (line, idx) {
        var lineEl = document.createElement('div');
        lineEl.className = 'lyrics-line';
        lineEl.textContent = line.text;
        lineEl.setAttribute('data-index', idx);
        lineEl.setAttribute('data-time', line.time);

        lineEl.addEventListener('click', function () {
          if (player && player.seekTo) {
            player.seekTo(line.time, true);
            updateActiveLine(idx, true);
          }
        });

        listEl.appendChild(lineEl);
      });
    }

    function updateActiveLine(index, forceScroll) {
      if (index === currentActiveIndex) return;
      currentActiveIndex = index;

      var allLines = listEl ? listEl.querySelectorAll('.lyrics-line') : [];
      allLines.forEach(function (el, i) {
        el.classList.toggle('active', i === index);
      });

      // ⚡ One-Line Live Synchronized Lyrics Bar + LRCGOD Ambient Background + Nothing Glyph Dot Matrix
      if (currentLyrics && currentLyrics[index]) {
        var lineText = currentLyrics[index].text;
        updateOneLineLyric(lineText, true);
        LrcGodEngine.spawn(lineText);
        if (typeof GlyphMatrixEngine !== 'undefined' && GlyphMatrixEngine.setLyricsText) {
          GlyphMatrixEngine.setLyricsText(lineText);
        }
      }

      if ((isAutoScroll || forceScroll) && allLines[index] && scrollContainer && modal && modal.classList.contains('open')) {
        var targetEl = allLines[index];
        var containerHeight = scrollContainer.clientHeight;
        var elTop = targetEl.offsetTop;
        var elHeight = targetEl.clientHeight;
        var scrollTo = elTop - (containerHeight / 2) + (elHeight / 2);

        scrollContainer.scrollTo({
          top: Math.max(0, scrollTo),
          behavior: 'smooth'
        });
      }
    }

    function onTimeUpdate(currentTime) {
      if (!currentLyrics.length) return;
      
      var activeIdx = -1;
      for (var i = 0; i < currentLyrics.length; i++) {
        if (currentLyrics[i].time <= currentTime + 0.35) {
          activeIdx = i;
        } else {
          break;
        }
      }

      if (activeIdx !== -1) {
        updateActiveLine(activeIdx, false);
      }
    }

    function openModal() {
      if (!modal) return;
      modal.classList.add('open');
      if (toggleBtn) toggleBtn.classList.add('active-btn');
      var d = player && player.getVideoData && player.getVideoData();
      if (d) {
        if (coverThumbEl && d.video_id) {
          coverThumbEl.src = 'https://i.ytimg.com/vi/' + d.video_id + '/mqdefault.jpg';
        }
        fetchLyrics({ id: d.video_id, title: d.title, artist: d.author });
      }
    }


    function closeModal() {
      if (!modal) return;
      modal.classList.remove('open');
      if (toggleBtn) toggleBtn.classList.remove('active-btn');
    }

    if (toggleBtn) toggleBtn.addEventListener('click', function () {
      if (modal.classList.contains('open')) closeModal();
      else openModal();
    });

    if (liveLyricBar) {
      liveLyricBar.addEventListener('click', function () {
        if (modal && modal.classList.contains('open')) closeModal();
        else openModal();
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    if (autoScrollToggle) {
      autoScrollToggle.addEventListener('click', function () {
        isAutoScroll = !isAutoScroll;
        autoScrollToggle.classList.toggle('active', isAutoScroll);
        showToast(isAutoScroll ? 'Lyrics Auto-Scroll ON ✨' : 'Lyrics Auto-Scroll OFF');
      });
    }

    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
      });
    }

    return {
      open: openModal,
      close: closeModal,
      onTimeUpdate: onTimeUpdate,
      fetchLyrics: fetchLyrics,
      updateOneLineLyric: updateOneLineLyric
    };
  })();


  /* ==================== 3. Spotlight Global Command Palette ==================== */
  var CommandPalette = (function () {
    var modal = $('commandPaletteModal');
    var input = $('cmdInput');
    var resultsList = $('cmdResultsList');
    var selectedIndex = 0;
    var filteredItems = [];

    function buildCommands() {
      var list = [];

      stations.forEach(function (st, idx) {
        list.push({
          category: 'Stations & Frequencies',
          title: 'Switch Station: ' + st.name,
          desc: st.desc || 'Tune frequency',
          icon: st.icon || '📻',
          badge: 'STATION',
          action: function () {
            selectStation(idx);
            showToast('Tuned to ' + st.name + ' ' + (st.icon || '📻'));
          }
        });
      });

      var atmos = [
        { key: 'none', name: 'None (Classic)', icon: '🚫', desc: 'Original normal background without climate effects' },
        { key: 'rain', name: 'Monsoon Rain', icon: '🌧️', desc: 'Gentle rain & water ripples' },
        { key: 'thunderstorm', name: 'Thunderstorm', icon: '⛈️', desc: 'Heavy storm & lightning flashes' },
        { key: 'sunny', name: 'Solar Day', icon: '☀️', desc: 'Warm sunbeams & rising motes' },
        { key: 'night', name: 'Starry Night', icon: '🌌', desc: 'Twinkling celestial sky & meteors' },
        { key: 'windy', name: 'Autumn Wind', icon: '🍃', desc: 'Swaying breeze & drifting leaves' },
        { key: 'snow', name: 'Snowfall', icon: '❄️', desc: 'Soft crystalline snowfall' },
        { key: 'sunset', name: 'Sunset Hour', icon: '🌅', desc: 'Twilight glow & floating embers' },
        { key: 'fog', name: 'Lo-Fi Fog', icon: '🌫️', desc: 'Misty haze & mellow depth' }
      ];

      atmos.forEach(function (a) {
        list.push({
          category: 'Atmosphere & Weather',
          title: 'Atmosphere: ' + a.name,
          desc: a.desc,
          icon: a.icon,
          badge: 'WEATHER',
          action: function () {
            SkyEngine.setSkyTheme(a.key, true);
          }
        });
      });

      list.push({
        category: 'Playback Controls',
        title: 'Play / Pause',
        desc: 'Toggle audio playback stream',
        icon: '⏯️',
        badge: 'CONTROL',
        action: function () { $('play').click(); }
      });
      list.push({
        category: 'Playback Controls',
        title: 'Next Track',
        desc: 'Skip to next song in playlist',
        icon: '⏭️',
        badge: 'CONTROL',
        action: function () { $('next').click(); }
      });
      list.push({
        category: 'Playback Controls',
        title: 'Previous Track',
        desc: 'Go to previous song in playlist',
        icon: '⏮️',
        badge: 'CONTROL',
        action: function () { $('prev').click(); }
      });
      list.push({
        category: 'Playback Controls',
        title: 'Toggle Synchronized Lyrics Sheet',
        desc: 'Open real-time karaoke lyrics view (L)',
        icon: '🎤',
        badge: 'LYRICS',
        action: function () { LyricsEngine.open(); }
      });
      list.push({
        category: 'Playback Controls',
        title: '⚡ Toggle LRCGOD Mode (Floating 3D Lyrics)',
        desc: 'Enable or disable kinetic 3D floating background lyrics',
        icon: '⚡',
        badge: 'LRCGOD',
        action: function () { LrcGodEngine.toggle(); }
      });

      list.push({
        category: 'Playback Controls',
        title: 'Open Ambience Mixer',
        desc: 'Adjust rain, vinyl, and fire background noise',
        icon: '☁️',
        badge: 'AMBIENCE',
        action: function () { $('ambientToggleBtn').click(); }
      });
      list.push({
        category: 'Playback Controls',
        title: 'Open Sleep Timer',
        desc: 'Set automatic sleep shutdown timer',
        icon: '⏱️',
        badge: 'TIMER',
        action: function () { $('sleepTimerBtn').click(); }
      });
      list.push({
        category: 'Playback Controls',
        title: 'Search YouTube Music Universe',
        desc: 'Open dedicated YouTube music universe explorer',
        icon: '🔍',
        badge: 'EXPLORER',
        action: function () { $('ytExplorerBtn').click(); }
      });

      return list;
    }

    function renderResults(items) {
      filteredItems = items;
      selectedIndex = 0;
      if (!resultsList) return;

      if (!items.length) {
        var query = input ? input.value : '';
        resultsList.innerHTML = '<div class="cmd-empty">No commands found. Press Enter to search YouTube for "<b>' + escapeHtml(query) + '</b>"</div>';
        return;
      }

      var html = '';
      var currentGroup = '';

      items.forEach(function (item, idx) {
        if (item.category !== currentGroup) {
          currentGroup = item.category;
          html += '<div class="cmd-group-title">' + currentGroup + '</div>';
        }

        html += 
          '<div class="cmd-item' + (idx === selectedIndex ? ' selected' : '') + '" data-idx="' + idx + '">' +
            '<div class="cmd-item-left">' +
              '<span class="cmd-item-icon">' + item.icon + '</span>' +
              '<div>' +
                '<div class="cmd-item-label">' + item.title + '</div>' +
                '<div class="cmd-item-desc">' + item.desc + '</div>' +
              '</div>' +
            '</div>' +
            '<span class="cmd-item-badge">' + item.badge + '</span>' +
          '</div>';
      });

      resultsList.innerHTML = html;

      resultsList.querySelectorAll('.cmd-item').forEach(function (el) {
        el.addEventListener('click', function () {
          var idx = parseInt(el.getAttribute('data-idx'), 10);
          if (filteredItems[idx] && filteredItems[idx].action) {
            closeModal();
            filteredItems[idx].action();
          }
        });
      });
    }

    function updateSelection() {
      var all = resultsList ? resultsList.querySelectorAll('.cmd-item') : [];
      all.forEach(function (el, idx) {
        el.classList.toggle('selected', idx === selectedIndex);
        if (idx === selectedIndex) {
          el.scrollIntoView({ block: 'nearest' });
        }
      });
    }

    function openModal() {
      if (!modal) return;
      modal.classList.add('open');
      if (input) {
        input.value = '';
        input.focus();
      }
      renderResults(buildCommands());
    }

    function closeModal() {
      if (!modal) return;
      modal.classList.remove('open');
    }

    if (input) {
      input.addEventListener('input', function () {
        var q = input.value.trim().toLowerCase();
        var all = buildCommands();
        if (!q) {
          renderResults(all);
          return;
        }

        var filtered = all.filter(function (cmd) {
          return cmd.title.toLowerCase().indexOf(q) !== -1 ||
                 cmd.desc.toLowerCase().indexOf(q) !== -1 ||
                 cmd.category.toLowerCase().indexOf(q) !== -1;
        });

        if (!filtered.length && q.length > 1) {
          filtered.push({
            category: 'YouTube Search',
            title: 'Search YouTube Music: "' + input.value + '"',
            desc: 'Find and stream song on YouTube universe',
            icon: '🔍',
            badge: 'SEARCH',
            action: function () {
              $('ytExplorerBtn').click();
              var uInput = $('uniYtSearchInput');
              if (uInput) {
                uInput.value = input.value;
                $('uniYtSearchBtn').click();
              }
            }
          });
        }

        renderResults(filtered);
      });

      input.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (filteredItems.length) {
            selectedIndex = (selectedIndex + 1) % filteredItems.length;
            updateSelection();
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (filteredItems.length) {
            selectedIndex = (selectedIndex - 1 + filteredItems.length) % filteredItems.length;
            updateSelection();
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (filteredItems[selectedIndex] && filteredItems[selectedIndex].action) {
            closeModal();
            filteredItems[selectedIndex].action();
          }
        } else if (e.key === 'Escape') {
          closeModal();
        }
      });
    }

    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
      });
    }

    return {
      open: openModal,
      close: closeModal
    };
  })();

  /* ==================== 4. Dual-Player Ping-Pong Engine (Gapless Playback & Crossfade) ==================== */
  var DualAudioEngine = (function () {
    var playerA = null;
    var playerB = null;
    var activeTag = 'A';
    var isCrossfading = false;
    var crossfadeInitiatedForTrack = '';

    function init(pA, pB) {
      playerA = pA;
      playerB = pB;
      activeTag = 'A';
    }

    function getActivePlayer() {
      return activeTag === 'A' ? playerA : playerB;
    }

    function getStandbyPlayer() {
      return activeTag === 'A' ? playerB : playerA;
    }

    function checkCrossfade(cur, dur) {
      if (!dur || dur <= 10 || isCrossfading) return;
      var remaining = dur - cur;

      var currentTrackId = '';
      var activeP = getActivePlayer();
      try {
        var d = activeP.getVideoData();
        currentTrackId = d ? d.video_id : '';
      } catch (e) {}

      if (remaining <= 2.2 && remaining > 0.4 && crossfadeInitiatedForTrack !== currentTrackId) {
        crossfadeInitiatedForTrack = currentTrackId;
        executeCrossfade();
      }
    }

    function executeCrossfade() {
      isCrossfading = true;
      var activeP = getActivePlayer();
      var standbyP = getStandbyPlayer();
      if (!standbyP || !activeP) {
        isCrossfading = false;
        return;
      }

      var currentVol = activeP.getVolume ? activeP.getVolume() : 100;
      var steps = 10;
      var stepTime = 180;
      var stepCount = 0;

      // Start standby player next track
      try {
        standbyP.setVolume(0);
        standbyP.nextVideo();
        standbyP.playVideo();
      } catch (e) {}

      var rampInterval = setInterval(function () {
        stepCount++;
        var progress = stepCount / steps;
        // Exponential acoustic curve for smooth natural loudness perception
        var activeVol = Math.max(0, Math.round(currentVol * Math.pow(1 - progress, 1.8)));
        var standbyVol = Math.min(currentVol, Math.round(currentVol * Math.pow(progress, 1.8)));

        try { activeP.setVolume(activeVol); } catch (e) {}
        try { standbyP.setVolume(standbyVol); } catch (e) {}


        if (stepCount >= steps) {
          clearInterval(rampInterval);
          try {
            activeP.pauseVideo();
            activeP.setVolume(currentVol);
          } catch (e) {}

          // Swap references
          activeTag = activeTag === 'A' ? 'B' : 'A';
          player = getActivePlayer();
          isCrossfading = false;
          update();
        }
      }, stepTime);
    }

    return {
      init: init,
      getActivePlayer: getActivePlayer,
      getStandbyPlayer: getStandbyPlayer,
      checkCrossfade: checkCrossfade
    };
  })();

  // ==================== 1. 3D Spatial Audio & Audiophile Equalizer DSP Engine ====================
  var SpatialAudioEngine = (function () {
    var modal = $('extrasModal');
    var toggleBtn = $('spatialAudioToggle');
    var toggleLabel = $('spatialToggleLabel');
    var widthSlider = $('spatialWidthSlider');
    var widthVal = $('spatialWidthVal');
    var resetBtn = $('resetEqBtn');

    var audioCtx = null;
    var isInitialized = false;

    // DSP Nodes
    var filter60 = null;
    var filter250 = null;
    var filter1k = null;
    var filter4k = null;
    var filter12k = null;
    var convolverNode = null;
    var convolverGain = null;
    var dryGain = null;
    var pannerNode = null;
    var masterDspGain = null;

    // Ambient / Preset Generator Sources
    var vinylSource = null;
    var vinylGain = null;
    var bassSubOsc = null;
    var bassSubGain = null;
    var lfoTimer = null;
    var lfoAngle = 0;

    var isSpatialActive = true;
    var spatialWidth = 140;
    var currentPreset = 'studio';

    var bands = {
      60: { slider: $('eq60'), label: $('eqVal60'), val: 0 },
      250: { slider: $('eq250'), label: $('eqVal250'), val: 0 },
      1000: { slider: $('eq1k'), label: $('eqVal1k'), val: 0 },
      4000: { slider: $('eq4k'), label: $('eqVal4k'), val: 0 },
      12000: { slider: $('eq12k'), label: $('eqVal12k'), val: 0 }
    };

    var presets = {
      'studio': { spatial: true, width: 100, gains: { 60: 0, 250: 0, 1000: 0, 4000: 0, 12000: 0 } },
      'car-drive': { spatial: true, width: 160, gains: { 60: 6, 250: 2.5, 1000: -1, 4000: 2, 12000: 3 } },
      'vinyl': { spatial: false, width: 80, gains: { 60: 2, 250: 4, 1000: 1.5, 4000: -3, 12000: -5 } },
      'cathedral': { spatial: true, width: 190, gains: { 60: -1, 250: 1, 1000: 2, 4000: 4.5, 12000: 6 } },
      'bass-8d': { spatial: true, width: 200, gains: { 60: 8, 250: 3, 1000: 0, 4000: 3, 12000: 5 } }
    };

    function ensureAudioContext() {
      if (!audioCtx) {
        var AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
        }
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      if (audioCtx && !isInitialized) {
        setupDspChain();
      }
    }

    function createReverbImpulse(duration, decay) {
      if (!audioCtx) return null;
      var rate = audioCtx.sampleRate;
      var length = rate * duration;
      var impulse = audioCtx.createBuffer(2, length, rate);
      var left = impulse.getChannelData(0);
      var right = impulse.getChannelData(1);

      for (var i = 0; i < length; i++) {
        var n = i;
        left[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
        right[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
      }
      return impulse;
    }

    function createVinylNoiseBuffer() {
      if (!audioCtx) return null;
      var bufferSize = audioCtx.sampleRate * 4; // 4-second loop
      var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      var data = buffer.getChannelData(0);
      var lastOut = 0.0;

      for (var i = 0; i < bufferSize; i++) {
        // Pink noise base for tape warmth
        var white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 0.15;

        // Occasional needle pop / crackle
        if (Math.random() < 0.0007) {
          data[i] += (Math.random() > 0.5 ? 0.6 : -0.6);
        }
      }
      return buffer;
    }

    function setupDspChain() {
      if (!audioCtx) return;

      // 5-Band Biquad Filters
      filter60 = audioCtx.createBiquadFilter();
      filter60.type = 'lowshelf';
      filter60.frequency.value = 60;
      filter60.gain.value = bands[60].val;

      filter250 = audioCtx.createBiquadFilter();
      filter250.type = 'peaking';
      filter250.frequency.value = 250;
      filter250.Q.value = 1.0;
      filter250.gain.value = bands[250].val;

      filter1k = audioCtx.createBiquadFilter();
      filter1k.type = 'peaking';
      filter1k.frequency.value = 1000;
      filter1k.Q.value = 1.0;
      filter1k.gain.value = bands[1000].val;

      filter4k = audioCtx.createBiquadFilter();
      filter4k.type = 'peaking';
      filter4k.frequency.value = 4000;
      filter4k.Q.value = 1.0;
      filter4k.gain.value = bands[4000].val;

      filter12k = audioCtx.createBiquadFilter();
      filter12k.type = 'highshelf';
      filter12k.frequency.value = 12000;
      filter12k.gain.value = bands[12000].val;

      // Reverb / Spatial Convolver
      convolverNode = audioCtx.createConvolver();
      convolverNode.buffer = createReverbImpulse(2.5, 2.0);

      convolverGain = audioCtx.createGain();
      convolverGain.gain.value = 0.0;

      dryGain = audioCtx.createGain();
      dryGain.gain.value = 1.0;

      // Stereo Panner (or Stereo Width simulator)
      if (audioCtx.createStereoPanner) {
        pannerNode = audioCtx.createStereoPanner();
        pannerNode.pan.value = 0;
      }

      // Master DSP Output Gain
      masterDspGain = audioCtx.createGain();
      masterDspGain.gain.value = 0.85;

      // Connect filter series
      filter60.connect(filter250);
      filter250.connect(filter1k);
      filter1k.connect(filter4k);
      filter4k.connect(filter12k);

      // Convolver wet/dry mix
      filter12k.connect(dryGain);
      filter12k.connect(convolverNode);
      convolverNode.connect(convolverGain);

      if (pannerNode) {
        dryGain.connect(pannerNode);
        convolverGain.connect(pannerNode);
        pannerNode.connect(masterDspGain);
      } else {
        dryGain.connect(masterDspGain);
        convolverGain.connect(masterDspGain);
      }

      masterDspGain.connect(audioCtx.destination);

      // Setup Vinyl Noise generator
      var vBuf = createVinylNoiseBuffer();
      if (vBuf) {
        vinylSource = audioCtx.createBufferSource();
        vinylSource.buffer = vBuf;
        vinylSource.loop = true;
        vinylGain = audioCtx.createGain();
        vinylGain.gain.value = 0.0;
        vinylSource.connect(vinylGain);
        vinylGain.connect(audioCtx.destination);
        vinylSource.start(0);
      }

      isInitialized = true;
    }

    function updateFilters() {
      if (!isInitialized) return;
      if (filter60) filter60.gain.setTargetAtTime(bands[60].val, audioCtx.currentTime, 0.05);
      if (filter250) filter250.gain.setTargetAtTime(bands[250].val, audioCtx.currentTime, 0.05);
      if (filter1k) filter1k.gain.setTargetAtTime(bands[1000].val, audioCtx.currentTime, 0.05);
      if (filter4k) filter4k.gain.setTargetAtTime(bands[4000].val, audioCtx.currentTime, 0.05);
      if (filter12k) filter12k.gain.setTargetAtTime(bands[12000].val, audioCtx.currentTime, 0.05);
    }

    function applyPreset(name) {
      ensureAudioContext();
      currentPreset = name;
      var p = presets[name];
      if (!p) return;

      isSpatialActive = p.spatial;
      spatialWidth = p.width;
      if (widthSlider) widthSlider.value = spatialWidth;
      if (widthVal) widthVal.textContent = spatialWidth + '%';
      updateSpatialUI();

      Object.keys(p.gains).forEach(function (freq) {
        var gain = p.gains[freq];
        if (bands[freq]) {
          bands[freq].val = gain;
          if (bands[freq].slider) bands[freq].slider.value = gain;
          if (bands[freq].label) bands[freq].label.textContent = (gain > 0 ? '+' : '') + gain + ' dB';
        }
      });

      updateFilters();

      // Acoustic Preset Modulations
      if (isInitialized) {
        // Vinyl crackle handling
        if (vinylGain) {
          vinylGain.gain.setTargetAtTime(name === 'vinyl' ? 0.08 : 0.0, audioCtx.currentTime, 0.2);
        }

        // Cathedral Reverb handling
        if (convolverGain) {
          if (name === 'cathedral') {
            convolverNode.buffer = createReverbImpulse(3.8, 1.8);
            convolverGain.gain.setTargetAtTime(0.45, audioCtx.currentTime, 0.1);
          } else if (name === 'car-drive') {
            convolverGain.gain.setTargetAtTime(0.12, audioCtx.currentTime, 0.1);
          } else {
            convolverGain.gain.setTargetAtTime(0.0, audioCtx.currentTime, 0.1);
          }
        }

        // 8D Circular Panning LFO
        if (lfoTimer) {
          clearInterval(lfoTimer);
          lfoTimer = null;
        }

        if (name === 'bass-8d' && pannerNode) {
          lfoAngle = 0;
          lfoTimer = setInterval(function () {
            lfoAngle += 0.08;
            var panVal = Math.sin(lfoAngle) * 0.75;
            if (pannerNode && audioCtx) {
              pannerNode.pan.setValueAtTime(panVal, audioCtx.currentTime);
            }
          }, 50);
        } else if (pannerNode) {
          pannerNode.pan.setTargetAtTime(0, audioCtx.currentTime, 0.1);
        }
      }

      document.querySelectorAll('.eq-preset-btn').forEach(function (btn) {
        btn.classList.toggle('active', btn.getAttribute('data-preset') === name);
      });
      showToast('Acoustic DSP Preset: ' + name.toUpperCase());
    }

    function updateSpatialUI() {
      if (toggleBtn) toggleBtn.classList.toggle('active', isSpatialActive);
      if (toggleLabel) toggleLabel.textContent = isSpatialActive ? '3D ON' : '3D OFF';
      var eqDockBtn = $('eqDockBtn');
      if (eqDockBtn) eqDockBtn.classList.toggle('active', isSpatialActive);
    }

    function reset() {
      applyPreset('studio');
    }

    function init() {
      var eqDockBtn = $('eqDockBtn');
      if (eqDockBtn) {
        eqDockBtn.addEventListener('click', function () {
          ExtrasEngine.openTab('tab-spatial');
        });
      }

      if (toggleBtn) {
        toggleBtn.addEventListener('click', function () {
          ensureAudioContext();
          isSpatialActive = !isSpatialActive;
          updateSpatialUI();
          if (convolverGain) {
            convolverGain.gain.setTargetAtTime(isSpatialActive ? 0.2 : 0.0, audioCtx.currentTime, 0.1);
          }
          showToast(isSpatialActive ? '3D Spatial Audio Enabled 🌐' : '3D Spatial Audio Disabled');
        });
      }

      if (widthSlider) {
        widthSlider.addEventListener('input', function (e) {
          ensureAudioContext();
          spatialWidth = parseInt(e.target.value, 10);
          if (widthVal) widthVal.textContent = spatialWidth + '%';
          if (convolverGain && isSpatialActive) {
            var revAmt = Math.min(0.5, (spatialWidth / 200) * 0.4);
            convolverGain.gain.setTargetAtTime(revAmt, audioCtx.currentTime, 0.05);
          }
        });
      }

      Object.keys(bands).forEach(function (freq) {
        var b = bands[freq];
        if (b.slider) {
          b.slider.addEventListener('input', function (e) {
            ensureAudioContext();
            b.val = parseFloat(e.target.value);
            if (b.label) b.label.textContent = (b.val > 0 ? '+' : '') + b.val + ' dB';
            updateFilters();
            document.querySelectorAll('.eq-preset-btn').forEach(function (btn) { btn.classList.remove('active'); });
          });
        }
      });

      document.querySelectorAll('.eq-preset-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          applyPreset(btn.getAttribute('data-preset'));
        });
      });

      if (resetBtn) resetBtn.addEventListener('click', reset);
    }

    return {
      init: init,
      applyPreset: applyPreset
    };
  })();


  // ==================== 2. Smart Sleep Timer & Acoustic Sunrise Alarm Engine ====================
  var SleepTimerEngine = (function () {
    var modal = $('sleepTimerModal');
    var openBtn = $('sleepTimerBtn');
    var closeBtn = $('closeTimerModalBtn');
    var activeBanner = $('timerActiveBanner');
    var countdownEl = $('timerActiveCountdown');
    var cancelBtn = $('cancelActiveTimerBtn');
    var timerLabel = $('timerLabel');

    var alarmInput = $('alarmTimeInput');
    var alarmToggleBtn = $('alarmToggleBtn');
    var alarmStatusLine = $('alarmStatusLine');
    var alarmDisplay = $('alarmSetDisplay');
    var clearAlarmBtn = $('clearAlarmBtn');

    var timerEndTime = 0;
    var timerDuration = 0;
    var timerInterval = null;
    var isFadingOut = false;
    var originalVolume = 100;
    var isEndTrackTimer = false;

    var activeAlarmTime = null; // 'HH:MM'
    var alarmCheckerInterval = null;

    function startTimer(minutes) {
      cancelTimer();
      originalVolume = vol;

      if (minutes === 'end-track') {
        isEndTrackTimer = true;
        showToast('Sleep Timer: Audio will stop at end of track');
        if (modal) modal.classList.remove('open');
        updateTimerLabel('TRACK');
        return;
      }

      isEndTrackTimer = false;
      var totalSeconds = parseInt(minutes, 10) * 60;
      timerDuration = totalSeconds;
      timerEndTime = Date.now() + totalSeconds * 1000;

      if (activeBanner) activeBanner.style.display = 'flex';
      if (modal) modal.classList.remove('open');
      showToast('Sleep Timer set for ' + minutes + ' minutes');

      tick();
      timerInterval = setInterval(tick, 1000);
    }

    function tick() {
      var remaining = Math.max(0, Math.ceil((timerEndTime - Date.now()) / 1000));
      var mins = Math.floor(remaining / 60);
      var secs = remaining % 60;
      var str = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;

      if (countdownEl) countdownEl.textContent = str;
      updateTimerLabel(mins > 0 ? (mins + 'm') : (secs + 's'));

      // Smart Sunset Volume Fade-Out in the final 60 seconds
      if (remaining <= 60 && remaining > 0) {
        isFadingOut = true;
        var fadeRatio = Math.pow(remaining / 60, 1.5);
        var targetVol = Math.round(originalVolume * fadeRatio);
        setVolume(targetVol);
      }

      if (remaining <= 0) {
        cancelTimer();
        pause();
        setVolume(originalVolume);
        showToast('🌙 Sleep Timer completed. Sleep tight!');
      }
    }

    function updateTimerLabel(text) {
      if (timerLabel) timerLabel.textContent = text;
      if (openBtn) openBtn.classList.add('active-btn');
    }

    function cancelTimer() {
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = null;
      timerEndTime = 0;
      isEndTrackTimer = false;
      if (isFadingOut) {
        setVolume(originalVolume);
        isFadingOut = false;
      }
      if (activeBanner) activeBanner.style.display = 'none';
      if (timerLabel) timerLabel.textContent = 'TIMER';
      if (openBtn) openBtn.classList.remove('active-btn');
    }

    // Sunrise Alarm Logic
    function setAlarm(timeStr) {
      activeAlarmTime = timeStr;
      if (alarmStatusLine) alarmStatusLine.style.display = 'flex';
      if (alarmDisplay) alarmDisplay.textContent = formatAlarmTime(timeStr);
      if (alarmToggleBtn) alarmToggleBtn.classList.add('active');
      showToast('Sunrise Alarm set for ' + formatAlarmTime(timeStr));
    }

    function clearAlarm() {
      activeAlarmTime = null;
      if (alarmStatusLine) alarmStatusLine.style.display = 'none';
      if (alarmToggleBtn) alarmToggleBtn.classList.remove('active');
      showToast('Alarm cancelled');
    }

    function formatAlarmTime(timeStr) {
      var parts = timeStr.split(':');
      var h = parseInt(parts[0], 10);
      var m = parts[1];
      var ampm = h >= 12 ? 'PM' : 'AM';
      var formattedH = h % 12 || 12;
      return formattedH + ':' + m + ' ' + ampm;
    }

    function checkAlarm() {
      if (!activeAlarmTime) return;
      var now = new Date();
      var currentHHMM = (now.getHours() < 10 ? '0' : '') + now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
      if (currentHHMM === activeAlarmTime && now.getSeconds() < 3) {
        triggerSunriseAlarm();
      }
    }

    function triggerSunriseAlarm() {
      clearAlarm();
      showToast('🌅 Good Morning! Acoustic Sunrise playing…');
      switchStation('time');
      setVolume(5);
      play();
      // Ramp volume softly over 3 minutes
      var currentRamp = 5;
      var rampInterval = setInterval(function () {
        currentRamp += 5;
        if (currentRamp >= 85) {
          currentRamp = 85;
          clearInterval(rampInterval);
        }
        setVolume(currentRamp);
      }, 9000);
    }

    function init() {
      if (openBtn) openBtn.addEventListener('click', function () { modal.classList.toggle('open'); });
      if (closeBtn) closeBtn.addEventListener('click', function () { modal.classList.remove('open'); });
      if (cancelBtn) {
        cancelBtn.addEventListener('click', function () {
          cancelTimer();
          showToast('Sleep Timer stopped');
        });
      }

      document.querySelectorAll('.timer-preset-pill').forEach(function (pill) {
        pill.addEventListener('click', function () {
          startTimer(pill.getAttribute('data-minutes'));
        });
      });

      if (alarmToggleBtn && alarmInput) {
        alarmToggleBtn.addEventListener('click', function () {
          if (activeAlarmTime) clearAlarm();
          else setAlarm(alarmInput.value || '07:00');
        });
      }
      if (clearAlarmBtn) clearAlarmBtn.addEventListener('click', clearAlarm);

      alarmCheckerInterval = setInterval(checkAlarm, 5000);
    }

    return {
      init: init,
      open: function () { if (modal) modal.classList.add('open'); },
      close: function () { if (modal) modal.classList.remove('open'); },
      onTrackEnded: function () {
        if (isEndTrackTimer) {
          cancelTimer();
          pause();
          showToast('🌙 Sleep Timer: End of track reached. Sleep well!');
        }
      }
    };
  })();

  // ==================== 3. Dynamic Island / Floating Glass Mini-Player ====================
  var DynamicIslandEngine = (function () {
    var island = $('dynamicIslandMini');
    var handle = $('miniIslandHandle');
    var cover = $('miniCoverArt');
    var title = $('miniTrackTitle');
    var artist = $('miniTrackArtist');
    var playBtn = $('miniPlayBtn');
    var playIcon = $('miniPlayIcon');
    var nextBtn = $('miniNextBtn');
    var expandBtn = $('miniExpandBtn');
    var closeBtn = $('miniCloseBtn');
    var toggleBtn = $('miniPlayerToggleBtn') || $('launchMiniPlayerBtn');

    var isVisible = false;
    var isDragging = false;
    var startX, startY, initialX, initialY;

    function updateTrack(track) {
      if (!track) return;
      if (cover && track.id) cover.src = 'https://i.ytimg.com/vi/' + track.id + '/mqdefault.jpg';
      if (title) title.textContent = track.title || 'Aura Stream';
      if (artist) artist.textContent = track.artist || 'Jordan';
    }

    function updatePlayState(playing) {
      if (playIcon) {
        playIcon.innerHTML = playing ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>' : '<path d="M8 5v14l11-7z"/>';
      }
    }

    function toggle() {
      isVisible = !isVisible;
      if (island) island.style.display = isVisible ? 'block' : 'none';
      if (toggleBtn) toggleBtn.classList.toggle('active-btn', isVisible);
    }

    function initDraggable() {
      if (!handle || !island) return;

      handle.addEventListener('mousedown', function (e) {
        if (e.target.closest('button')) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        var rect = island.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });

      function onMouseMove(e) {
        if (!isDragging) return;
        var dx = e.clientX - startX;
        var dy = e.clientY - startY;
        island.style.left = (initialX + dx) + 'px';
        island.style.top = (initialY + dy) + 'px';
        island.style.bottom = 'auto';
        island.style.right = 'auto';
      }

      function onMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      }
    }

    function init() {
      if (toggleBtn) toggleBtn.addEventListener('click', toggle);
      if (closeBtn) closeBtn.addEventListener('click', toggle);
      if (playBtn) playBtn.addEventListener('click', function () { togglePlay(); });
      if (nextBtn) nextBtn.addEventListener('click', function () { skip('next'); });
      if (expandBtn) {
        expandBtn.addEventListener('click', function () {
          toggle();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }
      initDraggable();
    }

    return {
      init: init,
      toggle: toggle,
      updateTrack: updateTrack,
      updatePlayState: updatePlayState
    };
  })();

  // ==================== 4. Listen Together / P2P Jam Room Engine ====================
  var JamRoomEngine = (function () {
    var setupView = $('jamSetupView');
    var activeView = $('jamActiveView');
    var hostBtn = $('startJamHostBtn');
    var joinBtn = $('joinJamBtn');
    var codeInput = $('jamRoomCodeInput');
    var codeDisplay = $('activeJamCodeText');
    var copyBtn = $('copyJamLinkBtn');
    var leaveBtn = $('leaveJamBtn');
    var peersListEl = $('jamPeersList');
    var hostNameEl = $('jamHostName');
    var sidebarJamBtn = $('sidebarJamBtn');

    var peer = null;
    var connections = [];
    var isHost = false;
    var currentRoomId = '';
    var heartbeatTimer = null;
    var chatMessageCount = 0;

    function getMyUserInfo() {
      try {
        if (typeof AuthEngine !== 'undefined') {
          var p = AuthEngine.getProfile();
          if (p && p.name && p.name !== 'Guest') {
            return { name: p.name, avatar: p.avatar || '🎧' };
          }
        }
      } catch (e) {}
      return { name: isHost ? 'Host' : 'Friend', avatar: isHost ? '👑' : '🎧' };
    }

    function generateCode() {
      var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      var res = 'ISHQ';
      for (var i = 0; i < 3; i++) {
        res += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return res;
    }

    function updateSidebarStatus(isActive) {
      if (sidebarJamBtn) {
        sidebarJamBtn.classList.toggle('in-room', !!isActive);
        var badge = $('jamSidebarBadge');
        if (badge) {
          if (isActive) {
            badge.textContent = isHost ? 'HOSTING (' + (connections.length + 1) + ')' : 'SYNCED 🎧';
          } else {
            badge.textContent = 'LIVE P2P';
          }
        }
      }

      // Update Home Screen Floating Reactions Dock
      var homeDock = $('homeJamReactionsDock');
      var homeStatusText = $('homeJamStatusText');
      if (homeDock) {
        homeDock.classList.toggle('visible', !!isActive);
      }
      if (homeStatusText && isActive) {
        homeStatusText.textContent = (currentRoomId || 'JAM') + ' (' + (connections.length + 1) + ')';
      }
    }

    /* Live Floating Particle Physics */
    function burstFloatingReaction(emoji) {
      var layer = $('floatingReactionsLayer');
      if (!layer) return;

      var count = Math.floor(Math.random() * 3) + 3; // 3-5 particles
      var baseX = Math.floor(Math.random() * (window.innerWidth - 180)) + 60;

      for (var i = 0; i < count; i++) {
        (function (idx) {
          setTimeout(function () {
            var el = document.createElement('div');
            el.className = 'floating-reaction-emoji';
            el.textContent = emoji;
            
            var xOffset = baseX + (Math.random() * 80 - 40);
            var rot1 = (Math.random() * 40 - 20) + 'deg';
            var rot2 = (Math.random() * 40 - 20) + 'deg';
            var drift1 = (Math.random() * 60 - 30) + 'px';
            var drift2 = (Math.random() * 80 - 40) + 'px';

            el.style.left = Math.max(20, Math.min(window.innerWidth - 60, xOffset)) + 'px';
            el.style.setProperty('--rot', rot1);
            el.style.setProperty('--rot2', rot2);
            el.style.setProperty('--drift', drift1);
            el.style.setProperty('--drift2', drift2);

            layer.appendChild(el);

            setTimeout(function () {
              if (el && el.parentNode) el.parentNode.removeChild(el);
            }, 3300);
          }, idx * 120);
        })(i);
      }
    }

    function sendReaction(emoji) {
      if (!emoji) return;
      burstFloatingReaction(emoji);

      var user = getMyUserInfo();
      var payload = {
        type: 'reaction',
        emoji: emoji,
        sender: user.name,
        avatar: user.avatar,
        timestamp: Date.now()
      };

      connections.forEach(function (c) {
        if (c.open) c.send(payload);
      });
    }

    function showHomeChatBubble(msg) {
      var stream = $('homeJamChatStream');
      if (!stream) return;

      var bubble = document.createElement('div');
      bubble.className = 'home-chat-bubble-popup';
      var authorName = escapeHtml(msg.isMe ? 'You' : (msg.sender || 'Friend'));
      var avatarIcon = escapeHtml(msg.avatar || '🎧');
      var safeText = escapeHtml(msg.text || '');

      bubble.innerHTML = 
        '<span class="bubble-avatar">' + avatarIcon + '</span>' +
        '<div class="bubble-content">' +
          '<div class="bubble-author">' + authorName + '</div>' +
          '<div class="bubble-text">' + safeText + '</div>' +
        '</div>';

      bubble.addEventListener('click', function () {
        openRoomModal();
      });

      stream.appendChild(bubble);

      while (stream.children.length > 4) {
        stream.removeChild(stream.children[0]);
      }

      setTimeout(function () {
        if (bubble && bubble.parentNode) {
          bubble.parentNode.removeChild(bubble);
        }
      }, 6500);
    }

    function renderChatMessage(msg) {
      var container = $('jamChatMessages');
      if (container) {
        var msgEl = document.createElement('div');
        msgEl.className = 'jam-chat-msg' + (msg.isMe ? ' is-me' : '');
        
        var timeStr = escapeHtml(msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        var authorName = escapeHtml(msg.isMe ? 'You' : (msg.sender || 'Friend'));
        var avatarIcon = escapeHtml(msg.avatar || '🎧');
        var safeText = escapeHtml(msg.text || '');
        
        msgEl.innerHTML = 
          '<div class="jam-chat-msg-avatar">' + avatarIcon + '</div>' +
          '<div class="jam-chat-msg-body">' +
            '<div class="jam-chat-msg-meta">' +
              '<span class="jam-chat-msg-author">' + authorName + '</span>' +
              '<span class="jam-chat-msg-time">' + timeStr + '</span>' +
            '</div>' +
            '<div class="jam-chat-msg-text">' + safeText + '</div>' +
          '</div>';

        container.appendChild(msgEl);
        container.scrollTop = container.scrollHeight;
      }

      showHomeChatBubble(msg);

      chatMessageCount++;
      if ($('jamChatMsgCount')) $('jamChatMsgCount').textContent = chatMessageCount + ' msgs';
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function sendChatMessage(text) {
      if (!text || !text.trim()) return;
      text = text.trim();

      var user = getMyUserInfo();
      var timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      var msgObj = {
        id: Date.now(),
        text: text,
        sender: user.name,
        avatar: user.avatar,
        time: timeStr,
        isMe: true
      };

      renderChatMessage(msgObj);

      var input = $('jamChatInput');
      if (input) input.value = '';

      var payload = {
        type: 'chat',
        text: text,
        sender: user.name,
        avatar: user.avatar,
        time: timeStr,
        timestamp: Date.now()
      };

      connections.forEach(function (c) {
        if (c.open) c.send(payload);
      });
    }

    function startHeartbeat() {
      stopHeartbeat();
      heartbeatTimer = setInterval(function () {
        if (isHost && connections.length > 0 && isPlaying()) {
          broadcastState();
        }
      }, 2500);
    }

    function stopHeartbeat() {
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }
    }

    function startHost() {
      var roomId = generateCode();
      currentRoomId = roomId;
      isHost = true;

      try {
        if (typeof Peer !== 'undefined') {
          peer = new Peer('aura-jam-' + roomId.toLowerCase());
          peer.on('open', function (id) {
            if (setupView) setupView.style.display = 'none';
            if (activeView) activeView.style.display = 'block';
            if (codeDisplay) codeDisplay.textContent = roomId;
            if (hostNameEl) hostNameEl.textContent = 'You (Host)';
            updateSidebarStatus(true);
            startHeartbeat();
            showToast('🎉 Jam Room created! Code: ' + roomId);
          });

          peer.on('connection', function (conn) {
            connections.push(conn);
            conn.on('open', function () {
              broadcastState();
              updatePeersUI();
              updateSidebarStatus(true);
              showToast('🎧 Friend joined the Jam Room!');
            });
            conn.on('data', function (data) {
              handleIncomingSync(data);
            });
            conn.on('close', function () {
              connections = connections.filter(function (c) { return c !== conn; });
              updatePeersUI();
              updateSidebarStatus(true);
            });
          });

          peer.on('error', function (err) {
            if (setupView) setupView.style.display = 'none';
            if (activeView) activeView.style.display = 'block';
            if (codeDisplay) codeDisplay.textContent = roomId;
            updateSidebarStatus(true);
            startHeartbeat();
            showToast('Jam Room active (Code: ' + roomId + ')');
          });
        } else {
          if (setupView) setupView.style.display = 'none';
          if (activeView) activeView.style.display = 'block';
          if (codeDisplay) codeDisplay.textContent = roomId;
          updateSidebarStatus(true);
          showToast('Jam Room active (Code: ' + roomId + ')');
        }
      } catch (e) {
        if (setupView) setupView.style.display = 'none';
        if (activeView) activeView.style.display = 'block';
        if (codeDisplay) codeDisplay.textContent = roomId;
        updateSidebarStatus(true);
      }
    }

    function joinRoom(code) {
      if (!code) return;
      code = code.trim().toUpperCase();
      currentRoomId = code;
      isHost = false;

      try {
        if (typeof Peer !== 'undefined') {
          peer = new Peer();
          peer.on('open', function () {
            var conn = peer.connect('aura-jam-' + code.toLowerCase());
            connections.push(conn);

            conn.on('open', function () {
              if (setupView) setupView.style.display = 'none';
              if (activeView) activeView.style.display = 'block';
              if (codeDisplay) codeDisplay.textContent = code;
              if (hostNameEl) hostNameEl.textContent = 'Room Host 👑';
              updateSidebarStatus(true);
              showToast('✨ Connected to Jam Room: ' + code);
            });

            conn.on('data', function (data) {
              handleIncomingSync(data);
            });

            conn.on('error', function () {
              showToast('⚠️ Unable to connect to room ' + code);
            });
          });
        } else {
          if (setupView) setupView.style.display = 'none';
          if (activeView) activeView.style.display = 'block';
          if (codeDisplay) codeDisplay.textContent = code;
          updateSidebarStatus(true);
          showToast('Connected to Jam Room ' + code);
        }
      } catch (e) {
        if (setupView) setupView.style.display = 'none';
        if (activeView) activeView.style.display = 'block';
        if (codeDisplay) codeDisplay.textContent = code;
        updateSidebarStatus(true);
      }
    }

    function broadcastState() {
      if (!isHost || !connections.length) return;
      var cur = player && player.getCurrentTime ? player.getCurrentTime() : 0;
      var st = currentStationKey || (currentStation ? currentStation.id : 'time-travel');
      var trackIdx = -1;
      try {
        if (player && player.getPlaylistIndex) trackIdx = player.getPlaylistIndex();
      } catch (e) {}

      var curVid = '';
      try {
        if (player && player.getVideoData) {
          var vd = player.getVideoData();
          if (vd && vd.video_id) curVid = vd.video_id;
        }
      } catch (e) {}
      if (!curVid && window.__currentTrackVideoId) curVid = window.__currentTrackVideoId;

      var payload = {
        type: 'sync',
        station: st,
        videoId: curVid,
        trackIdx: trackIdx,
        time: cur,
        playing: isPlaying(),
        timestamp: Date.now()
      };
      connections.forEach(function (c) {
        if (c.open) c.send(payload);
      });
    }

    function handleIncomingSync(data) {
      if (!data) return;

      // 1. Live Reaction Broadcast
      if (data.type === 'reaction') {
        burstFloatingReaction(data.emoji);
        return;
      }

      // 2. Live Chat Broadcast
      if (data.type === 'chat') {
        renderChatMessage({
          text: data.text,
          sender: data.sender || 'Friend',
          avatar: data.avatar || '🎧',
          time: data.time,
          isMe: false
        });
        var extrasModal = $('extrasModal');
        if (!extrasModal || !extrasModal.classList.contains('open')) {
          showToast('💬 ' + (data.sender || 'Friend') + ': ' + data.text);
        }
        return;
      }

      // 3. Audio & Playback Synchronization across all devices (Mobile & Desktop)
      if (data.type === 'sync') {
        claimAudioMaster();

        // 3a. Mood Station vs Standard Station Sync
        if (data.station && data.station !== currentStationKey) {
          if (data.station.indexOf('mood-') === 0 && window.MoodUniverseEngine) {
            var moodId = data.station.replace('mood-', '');
            var targetMood = window.MoodUniverseEngine.stations.find(function (m) { return m.id === moodId; });
            if (targetMood) {
              window.MoodUniverseEngine.playMoodStation(targetMood);
            }
          } else if (typeof switchStation === 'function') {
            switchStation(data.station);
          }
        }

        // 3b. Video ID & Playlist Sync
        if (data.videoId && player) {
          var currentVid = '';
          try {
            if (player.getVideoData) {
              var vd = player.getVideoData();
              if (vd && vd.video_id) currentVid = vd.video_id;
            }
          } catch (e) {}
          if (currentVid !== data.videoId) {
            if (player.loadVideoById) {
              player.loadVideoById({
                videoId: data.videoId,
                startSeconds: typeof data.time === 'number' ? data.time : 0
              });
            }
          }
        } else if (typeof data.trackIdx === 'number' && data.trackIdx >= 0 && player && player.getPlaylistIndex && player.playVideoAt) {
          var myIdx = player.getPlaylistIndex();
          if (myIdx !== -1 && myIdx !== data.trackIdx) {
            player.playVideoAt(data.trackIdx);
          }
        }

        // 3c. Precision Time Sync (within 2s drift threshold)
        if (player && player.seekTo && typeof data.time === 'number') {
          var cur = player.getCurrentTime ? player.getCurrentTime() : 0;
          var diff = Math.abs(cur - data.time);
          if (diff > 2.0) {
            player.seekTo(data.time, true);
          }
        }

        // 3d. Play / Pause & Volume Unmute Sync
        if (data.playing) {
          if (player && player.unMute) player.unMute();
          if (player && player.setVolume) player.setVolume(100);
          if (!isPlaying()) {
            play();
          }
        } else if (!data.playing && isPlaying()) {
          pause();
        }
      }
    }

    function updatePeersUI() {
      if (!peersListEl) return;
      peersListEl.innerHTML = '';
      connections.forEach(function (c, idx) {
        var div = document.createElement('div');
        div.className = 'jam-member-item';
        div.innerHTML = '<span class="jam-avatar">🎧</span><div class="jam-member-meta"><div class="jam-member-name">Friend #' + (idx + 1) + '</div><div class="jam-member-role">Listening in Sync</div></div><span class="jam-sync-status">● SYNCED</span>';
        peersListEl.appendChild(div);
      });
    }

    function leave() {
      stopHeartbeat();
      if (peer) peer.destroy();
      peer = null;
      connections = [];
      isHost = false;
      currentRoomId = '';
      if (activeView) activeView.style.display = 'none';
      if (setupView) setupView.style.display = 'flex';
      updateSidebarStatus(false);
      if (typeof ExtrasEngine !== 'undefined') ExtrasEngine.close();
      showToast('Left Jam Room');
    }

    function openRoomModal() {
      if (typeof ExtrasEngine !== 'undefined') {
        ExtrasEngine.openTab('tab-jam');
      }
    }

    function init() {
      if (sidebarJamBtn) {
        sidebarJamBtn.addEventListener('click', function () {
          var sidebar = $('premiumSidebarMenu');
          if (sidebar) sidebar.classList.remove('open');
          var backdrop = $('sidebarBackdrop');
          if (backdrop) backdrop.classList.remove('visible');
          openRoomModal();
        });
      }

      if (hostBtn) hostBtn.addEventListener('click', startHost);
      if (joinBtn && codeInput) {
        joinBtn.addEventListener('click', function () {
          joinRoom(codeInput.value);
        });
      }
      if (codeInput) {
        codeInput.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            joinRoom(codeInput.value);
          }
        });
      }
      if (copyBtn) {
        copyBtn.addEventListener('click', function () {
          var url = window.location.origin + window.location.pathname + '?jam=' + currentRoomId;
          navigator.clipboard.writeText(url);
          showToast('📋 Jam Room link copied to clipboard!');
        });
      }
      if (leaveBtn) leaveBtn.addEventListener('click', leave);

      // Live Reactions Bar bindings
      var reactionBar = $('jamReactionBar');
      if (reactionBar) {
        reactionBar.addEventListener('click', function (e) {
          var btn = e.target.closest('.jam-reaction-btn');
          if (btn) {
            var emoji = btn.getAttribute('data-emoji') || btn.textContent.trim();
            sendReaction(emoji);
          }
        });
      }

      // Live Chat Send bindings
      var sendChatBtn = $('sendJamChatBtn');
      var chatInput = $('jamChatInput');
      if (sendChatBtn && chatInput) {
        sendChatBtn.addEventListener('click', function () {
          sendChatMessage(chatInput.value);
        });
        chatInput.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            sendChatMessage(chatInput.value);
          }
        });
      }

      // Quick Vibe Presets bindings
      var quickVibes = $('jamQuickVibes');
      if (quickVibes) {
        quickVibes.querySelectorAll('.jam-vibe-pill').forEach(function (pill) {
          pill.addEventListener('click', function () {
            var text = this.getAttribute('data-msg');
            sendChatMessage(text);
          });
        });
      }

      // ==================== Home Screen Live Jam Floating Dock Bindings ====================
      if ($('homeJamStatusPill')) {
        $('homeJamStatusPill').addEventListener('click', function () {
          openRoomModal();
        });
      }

      var homeDock = $('homeJamReactionsDock');
      if (homeDock) {
        homeDock.addEventListener('click', function (e) {
          var btn = e.target.closest('.home-emoji-btn');
          if (btn) {
            var emoji = btn.getAttribute('data-emoji') || btn.textContent.trim();
            sendReaction(emoji);
          }
        });
      }

      if ($('homeChatToggleBtn')) {
        $('homeChatToggleBtn').addEventListener('click', function () {
          var wrap = $('homeQuickChatWrap');
          if (wrap) {
            wrap.classList.toggle('open');
            if (wrap.classList.contains('open') && $('homeQuickChatInput')) {
              $('homeQuickChatInput').focus();
            }
          }
        });
      }

      if ($('homeQuickChatCloseBtn')) {
        $('homeQuickChatCloseBtn').addEventListener('click', function () {
          if ($('homeQuickChatWrap')) $('homeQuickChatWrap').classList.remove('open');
        });
      }

      function submitHomeQuickChat() {
        var input = $('homeQuickChatInput');
        if (input && input.value.trim()) {
          sendChatMessage(input.value.trim());
          input.value = '';
          if ($('homeQuickChatWrap')) $('homeQuickChatWrap').classList.remove('open');
        }
      }

      if ($('homeQuickChatSendBtn')) {
        $('homeQuickChatSendBtn').addEventListener('click', submitHomeQuickChat);
      }

      if ($('homeQuickChatInput')) {
        $('homeQuickChatInput').addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            submitHomeQuickChat();
          } else if (e.key === 'Escape') {
            if ($('homeQuickChatWrap')) $('homeQuickChatWrap').classList.remove('open');
          }
        });
      }

      // Auto-check URL for ?jam=CODE on page load
      var urlParams = new URLSearchParams(window.location.search);
      var jamParam = urlParams.get('jam');
      if (jamParam) {
        setTimeout(function () {
          openRoomModal();
          joinRoom(jamParam);
        }, 1200);
      }
    }

    return {
      init: init,
      open: openRoomModal,
      close: function () { if (typeof ExtrasEngine !== 'undefined') ExtrasEngine.close(); },
      broadcastState: broadcastState,
      sendReaction: sendReaction,
      sendChatMessage: sendChatMessage,
      hasActiveRoom: function () { return !!currentRoomId; }
    };
  })();

  // ==================== Unified Aura Extras Engine ====================
  var ExtrasEngine = (function () {
    var modal = $('extrasModal');
    var openBtn = $('extrasBtn');
    var closeBtn = $('closeExtrasBtn');
    var launchMiniBtn = $('launchMiniPlayerBtn');

    function openTab(tabId) {
      if (modal) modal.classList.add('open');
      document.querySelectorAll('.extras-tab-btn').forEach(function (btn) {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
      });
      document.querySelectorAll('.extras-tab-pane').forEach(function (pane) {
        pane.classList.toggle('active', pane.id === tabId);
      });
    }

    function open() {
      if (modal) modal.classList.add('open');
    }

    function close() {
      if (modal) modal.classList.remove('open');
    }

    function init() {
      if (openBtn) openBtn.addEventListener('click', function () { modal.classList.toggle('open'); });
      if (closeBtn) closeBtn.addEventListener('click', close);
      if (launchMiniBtn) {
        launchMiniBtn.addEventListener('click', function () {
          DynamicIslandEngine.toggle();
          close();
        });
      }

      document.querySelectorAll('.extras-tab-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var tab = btn.getAttribute('data-tab');
          openTab(tab);
        });
      });
    }

    return {
      init: init,
      open: open,
      close: close,
      openTab: openTab
    };
  })();

  // ==================== Optional User Profile & Auth Engine ====================
  /* ==================== User Authentication & Profile Engine ==================== */
  var AuthEngine = (function () {
    var selectedAvatar = '🎧';
    var profile = {
      loggedIn: false,
      type: 'guest',
      name: 'Guest',
      avatar: '👤',
      email: '',
      joined: new Date().toLocaleDateString()
    };

    function loadProfile() {
      try {
        var saved = localStorage.getItem('aura_user_profile');
        if (saved) {
          profile = Object.assign(profile, JSON.parse(saved));
        }
      } catch (e) {}
      updateUI();
    }

    function saveProfile() {
      try {
        localStorage.setItem('aura_user_profile', JSON.stringify(profile));
      } catch (e) {}
      updateUI();
    }

    function updateUI() {
      var headerAvatar = $('userAvatarBadge') || $('sidebarAvatarEmoji');
      var headerName = $('userProfileName') || $('sidebarUserName');
      var profileBtn = $('userProfileBtn');
      var bigAvatar = $('profileAvatarBig');
      var displayNameEl = $('profileDisplayName');
      var accountBadgeEl = $('profileAccountBadge');
      var modalTitle = $('authModalTitle');

      if (profile.loggedIn) {
        if (headerAvatar) headerAvatar.textContent = profile.avatar;
        if (headerName) headerName.textContent = (profile.name || 'USER').split(' ')[0].toUpperCase();
        if (profileBtn) profileBtn.classList.add('is-authenticated');

        if (bigAvatar) bigAvatar.textContent = profile.avatar;
        if (displayNameEl) displayNameEl.textContent = profile.name;
        if (accountBadgeEl) {
          accountBadgeEl.innerHTML = profile.type === 'google' 
            ? '<span style="color:#4285F4;font-weight:700;">Google Account</span> · ' + (escapeHtml(profile.email) || 'Verified')
            : '<span style="color:#10b981;font-weight:700;">Guest Member</span> · Local Sync';
        }
        if (modalTitle) modalTitle.textContent = 'Aura Profile';

        // Dynamic stats
        if ($('statSongsLiked')) $('statSongsLiked').textContent = (likedSongs && likedSongs.length) || 0;
        if ($('statVibeLevel')) $('statVibeLevel').textContent = Math.min(99, Math.max(1, Math.floor(((likedSongs ? likedSongs.length : 0) * 3) + 1)));
        if ($('statJamJoined')) $('statJamJoined').textContent = (typeof JamRoomEngine !== 'undefined' && JamRoomEngine.hasActiveRoom && JamRoomEngine.hasActiveRoom()) ? '1 (Active)' : '0';
      } else {
        if (headerAvatar) headerAvatar.textContent = '👤';
        if (headerName) headerName.textContent = 'Guest User';
        if (profileBtn) profileBtn.classList.remove('is-authenticated');
        if (modalTitle) modalTitle.textContent = 'Sign in to Aura';
      }
    }

    function open() {
      var modal = $('authModal');
      var optionsWrap = $('authOptionsWrap');
      var googleFormWrap = $('googleFormWrap');
      var profileWrap = $('profileViewWrap');
      if (!modal) return;
      modal.classList.add('open');
      if (profile.loggedIn) {
        if (optionsWrap) optionsWrap.style.display = 'none';
        if (googleFormWrap) googleFormWrap.style.display = 'none';
        if (profileWrap) profileWrap.style.display = 'flex';
      } else {
        if (optionsWrap) optionsWrap.style.display = 'flex';
        if (googleFormWrap) googleFormWrap.style.display = 'none';
        if (profileWrap) profileWrap.style.display = 'none';
      }
      updateUI();
    }

    function close() {
      var modal = $('authModal');
      if (modal) modal.classList.remove('open');
    }

    function showGoogleForm() {
      var optionsWrap = $('authOptionsWrap');
      var googleFormWrap = $('googleFormWrap');
      var profileWrap = $('profileViewWrap');
      if (optionsWrap) optionsWrap.style.display = 'none';
      if (profileWrap) profileWrap.style.display = 'none';
      if (googleFormWrap) {
        googleFormWrap.style.display = 'flex';
        var nameInput = $('googleNameInput');
        if (nameInput) setTimeout(function () { nameInput.focus(); }, 150);
      }
    }

    function backToOptions() {
      var optionsWrap = $('authOptionsWrap');
      var googleFormWrap = $('googleFormWrap');
      var profileWrap = $('profileViewWrap');
      if (googleFormWrap) googleFormWrap.style.display = 'none';
      if (profileWrap) profileWrap.style.display = 'none';
      if (optionsWrap) optionsWrap.style.display = 'flex';
    }

    function confirmGoogleSignIn() {
      var nameInput = $('googleNameInput');
      var emailInput = $('googleEmailInput');
      var gName = (nameInput && nameInput.value.trim()) || 'Google User';
      var gEmail = (emailInput && emailInput.value.trim()) || 'user@gmail.com';

      profile = {
        loggedIn: true,
        type: 'google',
        name: gName,
        avatar: '🌐',
        email: gEmail,
        joined: new Date().toLocaleDateString()
      };
      saveProfile();
      close();
      showToast('Signed in with Google! Welcome, ' + gName + ' 🎉');
    }

    function signInGuest() {
      var nameInput = $('guestNameInput');
      var customName = (nameInput && nameInput.value.trim()) || 'Guest Listener';
      profile = {
        loggedIn: true,
        type: 'guest',
        name: customName,
        avatar: selectedAvatar || '🎧',
        email: '',
        joined: new Date().toLocaleDateString()
      };
      saveProfile();
      close();
      showToast('Welcome, ' + customName + '! 🎧');
    }

    function logout() {
      profile = {
        loggedIn: false,
        type: 'guest',
        name: 'Guest',
        avatar: '👤',
        email: '',
        joined: ''
      };
      saveProfile();
      var optionsWrap = $('authOptionsWrap');
      var googleFormWrap = $('googleFormWrap');
      var profileWrap = $('profileViewWrap');
      if (googleFormWrap) googleFormWrap.style.display = 'none';
      if (profileWrap) profileWrap.style.display = 'none';
      if (optionsWrap) optionsWrap.style.display = 'flex';
      showToast('Signed out of Aura');
    }

    function init() {
      loadProfile();

      var modal = $('authModal');
      var profileBtn = $('userProfileBtn');
      var closeBtn = $('closeAuthBtn');
      var googleBtn = $('googleSignInBtn');
      var googleConfirmBtn = $('googleConfirmBtn');
      var googleBackBtn = $('googleBackBtn');
      var guestBtn = $('guestContinueBtn');
      var nameInput = $('guestNameInput');
      var googleNameInput = $('googleNameInput');
      var googleEmailInput = $('googleEmailInput');
      var switchBtn = $('switchProfileBtn');
      var logoutBtn = $('logoutProfileBtn');

      if (profileBtn) profileBtn.addEventListener('click', open);
      var sidebarUser = document.querySelector('.sidebar-user-profile');
      if (sidebarUser) {
        sidebarUser.style.cursor = 'pointer';
        sidebarUser.addEventListener('click', open);
      }
      if (closeBtn) closeBtn.addEventListener('click', close);
      if (modal) {
        modal.addEventListener('click', function (e) {
          if (e.target === modal) close();
        });
      }

      if (googleBtn) googleBtn.addEventListener('click', showGoogleForm);
      if (googleConfirmBtn) googleConfirmBtn.addEventListener('click', confirmGoogleSignIn);
      if (googleBackBtn) googleBackBtn.addEventListener('click', backToOptions);
      if (guestBtn) guestBtn.addEventListener('click', signInGuest);
      if (logoutBtn) logoutBtn.addEventListener('click', logout);

      if (nameInput) {
        nameInput.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            signInGuest();
          }
        });
      }

      if (googleNameInput) {
        googleNameInput.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (googleEmailInput) googleEmailInput.focus();
          }
        });
      }

      if (googleEmailInput) {
        googleEmailInput.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            confirmGoogleSignIn();
          }
        });
      }

      if (switchBtn) {
        switchBtn.addEventListener('click', function () {
          var optionsWrap = $('authOptionsWrap');
          var googleFormWrap = $('googleFormWrap');
          var profileWrap = $('profileViewWrap');
          if (googleFormWrap) googleFormWrap.style.display = 'none';
          if (profileWrap) profileWrap.style.display = 'none';
          if (optionsWrap) optionsWrap.style.display = 'flex';
        });
      }

      document.querySelectorAll('.avatar-pick-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          document.querySelectorAll('.avatar-pick-btn').forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          selectedAvatar = btn.getAttribute('data-avatar') || '🎧';
        });
      });
    }


    return {
      init: init,
      open: open,
      close: close,
      getProfile: function () { return profile; }
    };
  })();


  function isPlaying() {
    try { return player && player.getPlayerState && player.getPlayerState() === 1; } catch (e) { return false; }
  }



  /* ==================== YouTube Audio Engine & MediaSession ==================== */


  function loadApi() {
    return new Promise(function (res) {
      if (window.YT && window.YT.Player) {
        res();
        return;
      }
      var resolved = false;
      var onReady = function () {
        if (!resolved) {
          resolved = true;
          res();
        }
      };

      var prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () {
        if (prev) try { prev(); } catch (e) {}
        onReady();
      };

      var interval = setInterval(function () {
        if (window.YT && window.YT.Player) {
          clearInterval(interval);
          onReady();
        }
      }, 200);

      setTimeout(function () {
        clearInterval(interval);
        onReady();
      }, 3000);
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

  function triggerAiDj() {}

  function update() {
    if (!player || !apiReady) return;
    var d = (player.getVideoData && player.getVideoData()) || {};
    var videoId = d.video_id || '';
    if (!videoId) {
      try {
        var url = player.getVideoUrl ? player.getVideoUrl() : '';
        if (url) {
          var match = url.match(/[?&]v=([^&]+)/);
          if (match) videoId = match[1];
        }
      } catch (err) {}
    }
    if (!videoId) {
      videoId = 'IltsCYPwtjE';
    }

    var rawTitle = d.title || (currentStation ? currentStation.name : 'Now Playing');
    var displayTitle = cleanTitle(rawTitle);
    var displayArtist = d.author || (currentStation ? currentStation.name : 'Aesthetic Artist');

    var titleEl = $('title');
    if (titleEl && displayTitle) titleEl.textContent = displayTitle;

    var artistEl = $('artist');
    if (artistEl && displayArtist) artistEl.textContent = displayArtist;

    // AI Virtual DJ Announcement Logic
    

    var fallbackArtUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80';
    var artImg = $('art');
    var ambientImg = $('ambientArt');
    var thumbMq = 'https://i.ytimg.com/vi/' + videoId + '/mqdefault.jpg';
    var thumbHq = 'https://i.ytimg.com/vi/' + videoId + '/hqdefault.jpg';

    if (artImg) {
      artImg.onerror = function () {
        artImg.src = fallbackArtUrl;
      };
      if (artImg.src !== thumbMq) {
        artImg.src = thumbMq;
        artImg.onload = function () {
          try { ArtworkMeshEngine.extractColors(artImg); } catch (e) {}
        };
      }
    }
    if (ambientImg) {
      ambientImg.onerror = function () {
        ambientImg.src = fallbackArtUrl;
      };
      if (ambientImg.src !== thumbHq) {
        ambientImg.src = thumbHq;
      }
    }

    document.body.classList.add('has-art');


    var dur = player.getDuration ? player.getDuration() : 0;

    if ($('meta')) {
      $('meta').textContent = (currentStation ? currentStation.name : 'Aura Station') + ' · ' + fmt(dur);
    }
    if ($('timeTotal')) $('timeTotal').textContent = fmt(dur);

    document.title = displayTitle ? displayTitle + ' — Aura Music' : 'Aura Music Platform';

    // Add to session queue history (render only when queue panel is open)
    var exists = sessionHistory.some(function (t) { return t.id === videoId; });
    if (!exists) {
      sessionHistory.unshift({ id: videoId, title: displayTitle, artist: displayArtist });
      // Only re-render queue if panel is currently visible
      var qPanel = $('queuePanel');
      if (qPanel && qPanel.classList.contains('open')) {
        renderSessionQueue();
      }
    }

    updateLikeStatus(videoId);
    updateMediaSession(displayTitle, displayArtist, videoId);
    updateBackgroundWords(displayTitle, displayArtist);
    syncCinemaTrackInfo();
    VibeAgent.learnFromTrack({ id: videoId, title: displayTitle, artist: displayArtist }, 1);
    LyricsEngine.fetchLyrics({ id: videoId, title: displayTitle, artist: displayArtist });
    DynamicIslandEngine.updateTrack({ id: videoId, title: displayTitle, artist: displayArtist });
  }



  function toggleLikeTrack(track) {
    if (!track || !track.id) return;
    var idx = likedSongs.findIndex(function (s) { return s.id === track.id; });
    if (idx >= 0) {
      likedSongs.splice(idx, 1);
      showToast('Removed from Liked Songs 💔');
    } else {
      likedSongs.push({ id: track.id, title: track.title || 'Track', artist: track.artist || 'Artist' });
      showToast('Added to Liked Songs ❤️');
      if (typeof VibeAgent !== 'undefined') {
        VibeAgent.learnFromTrack(track, 3);
      }
    }
    try { localStorage.setItem('ishq_liked_songs', JSON.stringify(likedSongs)); } catch (e) {}
    updateLikeStatus();
    renderLikedList();
  }

  function renderSessionQueue() {
    var queueList = $('queueList');
    var countEl = $('queueTabCount');
    if (!queueList) return;

    var currentPlayingId = '';
    try {
      var d = player && player.getVideoData ? player.getVideoData() : null;
      if (d && d.video_id) currentPlayingId = d.video_id;
    } catch (e) {}

    // Gather all songs in the queue
    var allQueueTracks = [];
    var seenIds = {};

    function addTrackToQueue(t) {
      if (!t || !t.id || seenIds[t.id]) return;
      seenIds[t.id] = true;
      allQueueTracks.push(t);
    }

    // 1. Current playing track first
    if (sessionHistory.length > 0) {
      addTrackToQueue(sessionHistory[0]);
    } else if (currentPlayingId) {
      var matchNow = VibeAgent && VibeAgent.catalog ? VibeAgent.catalog.find(function (s) { return s.id === currentPlayingId; }) : null;
      if (matchNow) addTrackToQueue(matchNow);
      else addTrackToQueue({ id: currentPlayingId, title: 'Current Stream', artist: currentStation ? currentStation.name : 'Aura Radio' });
    }

    // 2. Add upcoming tracks from currentTrackQueue or station tracks
    var isUserPersonalStation = ['time-travel', 'ishq', 'demanding', '90s', 'edm'].indexOf(currentStationKey) !== -1;
    var stationList = (currentTrackQueue && currentTrackQueue.length) 
      ? currentTrackQueue 
      : ((typeof STATION_TRACKS !== 'undefined' && STATION_TRACKS[currentStationKey]) 
          ? STATION_TRACKS[currentStationKey] 
          : []);

    stationList.forEach(function (id) {
      var catalogItem = VibeAgent && VibeAgent.catalog ? VibeAgent.catalog.find(function (s) { return s.id === id; }) : null;
      if (catalogItem) {
        addTrackToQueue(catalogItem);
      } else {
        addTrackToQueue({ id: id, title: 'Track ' + id, artist: currentStation ? currentStation.name : 'Aura Radio' });
      }
    });

    // 3. For AI stations (My Vibes & Moods only), populate additional dynamic catalog recommendations
    if (!isUserPersonalStation && VibeAgent && VibeAgent.catalog) {
      var currentKeyClean = (currentStationKey || '').replace('mood-', '');
      VibeAgent.catalog.forEach(function (s) {
        if (s.genres && s.genres.some(function (g) { return currentKeyClean.indexOf(g) !== -1; })) {
          addTrackToQueue(s);
        }
      });
    }

    // 4. Add previous session history
    sessionHistory.forEach(function (t) {
      addTrackToQueue(t);
    });

    if (countEl) countEl.textContent = allQueueTracks.length;

    if (!allQueueTracks.length) {
      queueList.innerHTML = '<div class="queue-empty">No tracks in queue. Select a station to start! 📻</div>';
      return;
    }

    queueList.innerHTML = '';

    allQueueTracks.forEach(function (track, index) {
      var isNowPlaying = (track.id === currentPlayingId || (index === 0 && !currentPlayingId));
      var isLiked = likedSongs.some(function (l) { return l.id === track.id; });
      var item = document.createElement('div');
      item.className = 'queue-item' + (isNowPlaying ? ' active' : '');
      var thumb = 'https://i.ytimg.com/vi/' + track.id + '/mqdefault.jpg';

      item.innerHTML = 
        '<div class="queue-thumb-wrap">' +
          '<img class="queue-thumb" src="' + thumb + '" alt="" loading="lazy" onerror="this.src=\'https://i.ytimg.com/vi/' + track.id + '/default.jpg\'">' +
          (isNowPlaying ? '<div class="queue-playing-waves"><div class="q-bar"></div><div class="q-bar"></div><div class="q-bar"></div></div>' : '') +
        '</div>' +
        '<div class="queue-meta">' +
          '<div class="queue-item-title">' + (track.title || 'Music Stream') + '</div>' +
          '<div class="queue-item-idx">' + (track.artist || 'Aura Radio') + (track.mood ? ' · <span style="opacity:0.8;">' + track.mood + '</span>' : '') + '</div>' +
        '</div>' +
        '<div class="queue-item-actions">' +
          '<button class="queue-action-like' + (isLiked ? ' liked' : '') + '" title="Like Song">' +
            (isLiked ? '❤️' : '🤍') +
          '</button>' +
        '</div>';

      item.addEventListener('click', function (e) {
        if (e.target.closest('.queue-action-like')) return;
        playSingleTrack(track);
        $('queuePanel').classList.remove('open');
      });

      var likeBtn = item.querySelector('.queue-action-like');
      if (likeBtn) {
        likeBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          toggleLikeTrack(track);
          renderSessionQueue();
          renderLikedList();
        });
      }

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
      DynamicIslandEngine.updatePlayState(true);
      if (e.target && e.target.setPlaybackQuality) {
        try { e.target.setPlaybackQuality('small'); } catch (err) {}
      }
    } else if (e.data === YT.PlayerState.PAUSED) {
      document.body.classList.remove('playing');
      DynamicIslandEngine.updatePlayState(false);
    } else if (e.data === YT.PlayerState.CUED || e.data === YT.PlayerState.BUFFERING) {
      show('s-ready');
      update();
    } else if (e.data === YT.PlayerState.ENDED) {
      SleepTimerEngine.onTrackEnded();
      skip('next');
    }
  }


  /* ==================== Resilient Error Handling ==================== */
  var errCount = 0;
  var errTimer = null;
  function onErr(e) {
    if (errTimer) clearTimeout(errTimer);
    errCount++;
    if (errCount > 2) {
      errCount = 0;
      showToast('Tuning to clean frequency… 🎧');
      try {
        var fallbackList = (typeof STATION_TRACKS !== 'undefined' && STATION_TRACKS[currentStationKey]) 
          ? STATION_TRACKS[currentStationKey] 
          : ['IltsCYPwtjE', 'BddP6PYo2gs', '1T3i9Qp54s0'];
        currentTrackQueue = fallbackList.slice();
        currentTrackIndex = 0;
        if (player && player.loadVideoById) {
          player.loadVideoById(fallbackList[0]);
        }
      } catch (err) {}
      return;
    }
    errTimer = setTimeout(function () {
      try { skip('next'); } catch (err) {}
    }, 1000);
  }


  function showAutoplayPrompt() {
    var overlay = $('autoplayOverlay');
    if (overlay) overlay.classList.add('visible');
  }

  function hideAutoplayPrompt() {
    var overlay = $('autoplayOverlay');
    if (overlay) overlay.classList.remove('visible');
  }

  /* ==========================================================================
     INFINITE AI MOOD RADIO UNIVERSE ENGINE 4.0 (MoodUniverseEngine)
     60+ Dynamic Mood Stations, AI Taste Affinity Ranking, Multi-Genre Curation
     ========================================================================== */
  var MoodUniverseEngine = (function () {
    var modal = $('moodUniverseModal');
    var grid = $('moodStationsGrid');
    var searchInput = $('moodSearchInput');
    var searchClear = $('moodSearchClear');
    var categoryChips = $('moodCategoryChips');
    var triggerBtn = $('moodUniverseBtn');
    var closeBtn = $('closeMoodUniBtn');
    var surpriseBtn = $('btnSurpriseMood');
    var currentActiveCategory = 'all';

    // Comprehensive Database of 60+ Dynamic AI Mood Radio Stations Across All 10 Categories
    var MOOD_STATIONS = [
      // --- ROMANCE & SOUL ---
      {
        id: 'bolly-romance',
        name: 'Bollywood Romance',
        icon: '🍿',
        category: 'romance',
        energy: '❤️ Soulful',
        desc: 'Passionate Hindi love ballads, iconic duets & soulful confessions',
        tags: ['#Romance', '#Arijit', '#Bollywood', '#Ishq'],
        accent: '#ec4899',
        accentGlow: 'rgba(236, 72, 153, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.22) 0%, rgba(244, 63, 94, 0.08) 100%)',
        quote: '"मोहब्बत में तड़प है, और तड़प में ही सारा सुकून है…"',
        glyphs: ['इश्क़', 'चाहत', 'दीवानगी', 'सुकून', 'रूह', 'धड़कन'],
        genres: ['romance', 'bollywood', 'soul'],
        size: 'hero',
        seedTracks: ['BddP6PYo2gs', 'b5f25X2Gvfg', 'L_LUpnjgPso', 'KUpwupYj_tY', 'tVLC3Phn4yU', 'BBAyRZZ9cG4', 'p7i88HqK_4k', 'kJQP7kiw5Fk', '1T3i9Qp54s0', 'IltsCYPwtjE']
      },
      {
        id: 'broken-heart',
        name: 'Broken Heart & Sadness',
        icon: '💔',
        category: 'romance',
        energy: '🥀 Melancholy',
        desc: 'Tearful embraces, deep piano heartbreak & unexpressed grief',
        tags: ['#Heartbreak', '#Sad', '#Melancholy', '#Pain'],
        accent: '#64748b',
        accentGlow: 'rgba(100, 116, 139, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(100, 116, 139, 0.22) 0%, rgba(51, 65, 85, 0.08) 100%)',
        quote: '"कुछ रिश्ते टूट कर भी रूह से कभी अलग नहीं होते…"',
        glyphs: ['दर्द', 'तन्हाई', 'आँसू', 'शिकवा', 'यादें', 'ख़ामोशी'],
        genres: ['soul', 'emotional', 'ballad', 'romance'],
        size: 'tall',
        seedTracks: ['Ax0G_P2dSBw', 'p7i88HqK_4k', 'hLQl3WQQoQ0', 'gvyUuxdRdR4', 'Umqb9KENgmk', 'b5f25X2Gvfg', 'YQHsXMglC9A']
      },
      {
        id: 'acoustic-ishq',
        name: 'Midnight Acoustic Ishq',
        icon: '🎸',
        category: 'romance',
        energy: '🕊️ Gentle',
        desc: 'Intimate acoustic guitars, soft whispers & midnight confessions',
        tags: ['#Acoustic', '#Unplugged', '#Ishq', '#LateNight'],
        accent: '#f43f5e',
        accentGlow: 'rgba(244, 63, 94, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.22) 0%, rgba(225, 29, 72, 0.08) 100%)',
        quote: '"Gentle guitar chords and words spoken straight from the soul."',
        glyphs: ['STRINGS', 'WHISPER', 'ISHQ', 'HEART', 'ACOUSTIC', 'NIGHT'],
        genres: ['romance', 'acoustic', 'indie', 'lofi'],
        size: 'normal',
        seedTracks: ['1T3i9Qp54s0', 'YxWlaYCA8MU', 'mH_ELM-1j18', '2Vv-BfVoq4g', 'KUpwupYj_tY']
      },
      {
        id: 'wedding-celebration',
        name: 'Royal Wedding Romance',
        icon: '💍',
        category: 'romance',
        energy: '✨ Grand',
        desc: 'Grand shehnai, royal sangeet melodies & eternal wedding vows',
        tags: ['#Wedding', '#Sangeet', '#Royal', '#Celebration'],
        accent: '#e11d48',
        accentGlow: 'rgba(225, 29, 72, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(225, 29, 72, 0.22) 0%, rgba(190, 18, 60, 0.08) 100%)',
        quote: '"दो दिलों का वो बंधन जो सात जन्मों तक महकता रहेगा…"',
        glyphs: ['शहनाई', 'शादी', 'मेहंदी', 'संगीत', 'वचन', 'उत्सव'],
        genres: ['romance', 'bollywood', 'dance'],
        size: 'wide',
        seedTracks: ['kJQP7kiw5Fk', 'IltsCYPwtjE', 'BBAyRZZ9cG4', 'tVLC3Phn4yU', '2Vv-BfVoq4g']
      },
      {
        id: 'dark-passion',
        name: 'Dark Obsession & Passion',
        icon: '🥀',
        category: 'romance',
        energy: '🖤 Intense',
        desc: 'Deep cinematic strings, brooding devotion & obsessive slow-burn love',
        tags: ['#DarkRomance', '#Obsession', '#Passion', '#Aesthetic'],
        accent: '#be123c',
        accentGlow: 'rgba(190, 18, 60, 0.5)',
        gradient: 'linear-gradient(135deg, rgba(190, 18, 60, 0.25) 0%, rgba(136, 19, 55, 0.08) 100%)',
        quote: '"In the darkest shadows, your love burns the brightest."',
        glyphs: ['PASSION', 'OBSESSION', 'SHADOW', 'FLAME', 'DESIRE', 'ECHO'],
        genres: ['romance', 'dark_pop', 'soul'],
        size: 'normal',
        seedTracks: ['b5f25X2Gvfg', 'lp-EO5I60KA', 'Umqb9KENgmk', '4NRXx6U8ABQ']
      },
      {
        id: 'rainy-ishq',
        name: 'Monsoon Rain & Ishq',
        icon: '🌧️',
        category: 'romance',
        energy: '🌧️ Romantic',
        desc: 'Thunderstorms, gentle drops on glass & heartfelt rainy confessions',
        tags: ['#MonsoonIshq', '#Rain', '#Romance', '#Barish'],
        accent: '#0ea5e9',
        accentGlow: 'rgba(14, 165, 233, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(14, 165, 233, 0.22) 0%, rgba(2, 132, 199, 0.08) 100%)',
        quote: '"भीगी-भीगी सड़कों पे मैं तेरा इंतज़ार करूँ…"',
        glyphs: ['BARISH', 'ISHQ', 'BUNDEN', 'SUKOON', 'YAADEIN', 'DIL'],
        genres: ['romance', 'monsoon', 'acoustic', 'chill'],
        size: 'normal',
        seedTracks: ['YxWlaYCA8MU', 'l8h_Ww99pT4', 'BddP6PYo2gs', 'p7i88HqK_4k']
      },

      // --- EDM & CLUB ENERGY ---
      {
        id: 'edm-club',
        name: 'EDM & Club Euphoria',
        icon: '⚡',
        category: 'energy',
        energy: '⚡ High BPM',
        desc: 'High-octane festival drops, progressive house & electro basslines',
        tags: ['#EDM', '#Drops', '#Festival', '#Electro'],
        accent: '#10b981',
        accentGlow: 'rgba(16, 185, 129, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(6, 95, 70, 0.08) 100%)',
        quote: '"Feel the electric pulse, drop the bass and lose all control."',
        glyphs: ['EUPHORIA', 'PULSE', 'BASS', 'SYNTH', 'DROP', 'NEON'],
        genres: ['edm', 'dance', 'electro', 'energy'],
        size: 'hero',
        seedTracks: ['60ItHLz5WEA', 'ALZHF5UqnU4', 'gCYcHz2167o', 'IcrbM1l_BoI', 'JRfuAukYTKg', 'ebXbLfLACGM']
      },
      {
        id: 'gym-hype',
        name: 'Gym & Workout Hype',
        icon: '🏋️',
        category: 'energy',
        energy: '🔥 Beast Mode',
        desc: 'Pure adrenaline, heavy trap 808s & explosive workout motivation',
        tags: ['#Workout', '#Gym', '#BeastMode', '#Hype'],
        accent: '#ef4444',
        accentGlow: 'rgba(239, 68, 68, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.22) 0%, rgba(185, 28, 28, 0.08) 100%)',
        quote: '"Pain is temporary. Pride is forever. Push past your limits."',
        glyphs: ['POWER', 'BEAST', 'MOTIVATION', 'HYPE', 'ADRENALINE', 'UNSTOPPABLE'],
        genres: ['energy', 'edm', 'hiphop', 'trap'],
        size: 'wide',
        seedTracks: ['7wtfhZwyrcc', '6MgsHSAcI98', 'hEJnMQG562U', 'ALZHF5UqnU4', 'dZ0fwJojhrs', 'k4yXQkG2s1E', 'gCYcHz2167o']
      },
      {
        id: 'party-club',
        name: 'Non-Stop Party Bangers',
        icon: '🎉',
        category: 'energy',
        energy: '⚡ Extreme Hype',
        desc: 'Weekend dancefloor anthems, high-energy remix beats & party energy',
        tags: ['#Party', '#Club', '#Bangers', '#Weekend'],
        accent: '#ec4899',
        accentGlow: 'rgba(236, 72, 153, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.22) 0%, rgba(219, 39, 119, 0.08) 100%)',
        quote: '"Turn up the volume, bring the house down and celebrate."',
        glyphs: ['PARTY', 'CELEBRATE', 'CLUB', 'WEEKEND', 'DANCE', 'HYPED'],
        genres: ['energy', 'party', 'club', 'dance', 'edm'],
        size: 'normal',
        seedTracks: ['V1Pl8CzNzCw', 'OPf0YbXqDm0', 'fRh_vgS2dFE', 'kJQP7kiw5Fk', 'hEJnMQG562U', 'tVLC3Phn4yU']
      },
      {
        id: 'dark-emo',
        name: 'Dark Pop & Emo Aesthetics',
        icon: '🖤',
        category: 'energy',
        energy: '🥀 Moody',
        desc: 'Obsessive love anthems, dark atmospheric synth beats & shadowy vibes',
        tags: ['#DarkPop', '#Emo', '#Moody', '#Obsessive'],
        accent: '#475569',
        accentGlow: 'rgba(71, 85, 105, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(71, 85, 105, 0.22) 0%, rgba(30, 41, 59, 0.08) 100%)',
        quote: '"Shadows dance when the light fades away."',
        glyphs: ['SHADOW', 'DARK', 'MYSTERY', 'OBSESSION', 'ECHO', 'VOID'],
        genres: ['energy', 'dark_pop', 'synthwave', 'soul'],
        size: 'tall',
        seedTracks: ['b5f25X2Gvfg', 'lp-EO5I60KA', '4NRXx6U8ABQ', 'Umqb9KENgmk', '60ItHLz5WEA']
      },
      {
        id: 'rock-anthem',
        name: 'Rock Anthems & Power Chords',
        icon: '🎸',
        category: 'energy',
        energy: '⚡ Electrifying',
        desc: 'Stadium power chords, soaring vocals & electrifying rock adrenaline',
        tags: ['#Rock', '#Guitars', '#Anthems', '#Drums'],
        accent: '#dc2626',
        accentGlow: 'rgba(220, 38, 38, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(220, 38, 38, 0.22) 0%, rgba(153, 27, 27, 0.08) 100%)',
        quote: '"Let the guitars scream and the stadium shake."',
        glyphs: ['ROCK', 'POWER', 'GUITAR', 'STADIUM', 'AMPS', 'CHORDS'],
        genres: ['energy', 'rock', 'pop', 'anthem'],
        size: 'normal',
        seedTracks: ['7wtfhZwyrcc', 'hT_nvWreIhg', 'JRfuAukYTKg', 'gCYcHz2167o']
      },

      // --- POP & GLOBAL ---
      {
        id: 'global-pop',
        name: 'Hollywood & Global Pop',
        icon: '🌍',
        category: 'pop',
        energy: '✨ Upbeat',
        desc: 'Global Billboard chart-toppers, infectious radio anthems & pop groove',
        tags: ['#Pop', '#Hollywood', '#Hits', '#Groove'],
        accent: '#3b82f6',
        accentGlow: 'rgba(59, 130, 246, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.22) 0%, rgba(29, 78, 216, 0.08) 100%)',
        quote: '"Global anthems that make the whole world sing along."',
        glyphs: ['GLOBAL', 'CHART', 'HIT', 'POP', 'EUPHORIA', 'RADIO'],
        genres: ['pop', 'dance', 'anthem'],
        size: 'hero',
        seedTracks: ['4NRXx6U8ABQ', 'lp-EO5I60KA', 'JGwWNGJdvx8', '2Vv-BfVoq4g', 'OPf0YbXqDm0', 'hT_nvWreIhg', 'fRh_vgS2dFE']
      },
      {
        id: 'latin-fiesta',
        name: 'Latin Fiesta & Reggaeton',
        icon: '🏝️',
        category: 'pop',
        energy: '🔥 Fiesta',
        desc: 'Sun-drenched Caribbean rhythms, afro-latin dance & tropical groove',
        tags: ['#Latin', '#Reggaeton', '#Fiesta', '#Dance'],
        accent: '#ea580c',
        accentGlow: 'rgba(234, 88, 12, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(234, 88, 12, 0.22) 0%, rgba(154, 52, 18, 0.08) 100%)',
        quote: '"Feel the Caribbean warmth and dance under the sun."',
        glyphs: ['FIESTA', 'LATIN', 'RHYTHM', 'SOL', 'PLAYA', 'DANCE'],
        genres: ['pop', 'latin', 'dance', 'afrobeats'],
        size: 'wide',
        seedTracks: ['V-_O7nl0Ii0', 'OPf0YbXqDm0', 'fRh_vgS2dFE', 'tVLC3Phn4yU']
      },
      {
        id: 'coke-fusion',
        name: 'Coke Studio & Fusion',
        icon: '✨',
        category: 'pop',
        energy: '✨ Ecstatic',
        desc: 'Timeless folk roots meeting modern synth basslines & vocal harmony',
        tags: ['#CokeStudio', '#Fusion', '#Pasoori', '#Folk'],
        accent: '#e11d48',
        accentGlow: 'rgba(225, 29, 72, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(225, 29, 72, 0.22) 0%, rgba(159, 18, 57, 0.08) 100%)',
        quote: '"When ancient traditions merge with the modern sonic pulse."',
        glyphs: ['FUSION', 'STUDIO', 'FOLK', 'HARMONY', 'ROOTS', 'PULSE'],
        genres: ['pop', 'fusion', 'folk'],
        size: 'tall',
        seedTracks: ['cl0a3i2wFcc', 'gvyUuxdRdR4', 'Umqb9KENgmk', 'b9p_HjFq78c', 'BBAyRZZ9cG4']
      },
      {
        id: 'afrobeat-groove',
        name: 'Afrobeat & Warm Vibes',
        icon: '🌴',
        category: 'pop',
        energy: '✨ Hypnotic',
        desc: 'Hypnotic West African grooves, warm sunshine pulses & romantic chill',
        tags: ['#Afrobeat', '#CKay', '#Warmth', '#Groove'],
        accent: '#f97316',
        accentGlow: 'rgba(249, 115, 22, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.22) 0%, rgba(194, 65, 12, 0.08) 100%)',
        quote: '"Warm golden sunshine, hypnotic bass and effortless rhythm."',
        glyphs: ['AFROBEAT', 'GOLDEN', 'RHYTHM', 'PULSE', 'TROPICAL', 'VIBE'],
        genres: ['pop', 'afrobeats', 'chill'],
        size: 'normal',
        seedTracks: ['V-_O7nl0Ii0', 'OPf0YbXqDm0', 'fRh_vgS2dFE', 'tVLC3Phn4yU']
      },

      // --- CHILL & ACOUSTIC ---
      {
        id: 'coffee-acoustic',
        name: 'Coffee House Acoustic',
        icon: '☕',
        category: 'chill',
        energy: '☕ Mellow',
        desc: 'Warm acoustic fingerpicking, indie singer-songwriters & cafe solace',
        tags: ['#Acoustic', '#AnuvJain', '#Indie', '#Coffee'],
        accent: '#d97706',
        accentGlow: 'rgba(217, 119, 6, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(217, 119, 6, 0.22) 0%, rgba(146, 64, 14, 0.08) 100%)',
        quote: '"A warm cup of coffee, gentle strings and honest poetry…"',
        glyphs: ['ACOUSTIC', 'INDIE', 'WARMTH', 'POETRY', 'LATTE', 'STRINGS'],
        genres: ['chill', 'acoustic', 'indie', 'lofi'],
        size: 'hero',
        seedTracks: ['YxWlaYCA8MU', '3vK3rZ3n2L0', 'mH_ELM-1j18', 'l8h_Ww99pT4', 'T94PHkuydcw', '1T3i9Qp54s0']
      },
      {
        id: 'monsoon-chai',
        name: 'Monsoon Chai & Rain',
        icon: '🌧️',
        category: 'chill',
        energy: '🌧️ Serene',
        desc: 'Petrichor, rain dripping on glass windows, hot cutting chai & melodies',
        tags: ['#Monsoon', '#Rain', '#Chai', '#Nostalgia'],
        accent: '#0284c7',
        accentGlow: 'rgba(2, 132, 199, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(2, 132, 199, 0.22) 0%, rgba(3, 105, 161, 0.08) 100%)',
        quote: '"बारिश की बूँदें, गरम चाय की प्याली और तुम्हारी यादें…"',
        glyphs: ['BARISH', 'PETRICHOR', 'CHAI', 'YAADEIN', 'SUKOON', 'RAIN'],
        genres: ['chill', 'monsoon', 'acoustic', 'lofi', 'romance'],
        size: 'tall',
        seedTracks: ['YxWlaYCA8MU', 'l8h_Ww99pT4', 'm93sJ4a6y_Y', '1T3i9Qp54s0', 'p7i88HqK_4k', 'BddP6PYo2gs']
      },
      {
        id: 'midnight-lofi',
        name: 'Midnight Deep Lo-Fi',
        icon: '🌙',
        category: 'chill',
        energy: '🌙 Deep Chill',
        desc: 'Slowed + reverb echoes, 2 AM melancholy & late night overthinking beats',
        tags: ['#Midnight', '#LoFi', '#SlowedReverb', '#2AM'],
        accent: '#8b5cf6',
        accentGlow: 'rgba(139, 92, 246, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.22) 0%, rgba(109, 40, 217, 0.08) 100%)',
        quote: '"When the entire world falls asleep, the music begins to speak…"',
        glyphs: ['MIDNIGHT', 'SLOWED', 'REVERB', 'AURA', 'ECHO', 'DREAM'],
        genres: ['chill', 'lofi', 'midnight', 'acoustic', 'dark_pop'],
        size: 'wide',
        seedTracks: ['T94PHkuydcw', '60ItHLz5WEA', '3vK3rZ3n2L0', 'b5f25X2Gvfg', '1T3i9Qp54s0', 'V-_O7nl0Ii0']
      },
      {
        id: 'rnb-silk',
        name: 'Silk R&B & Late Night',
        icon: '🕶️',
        category: 'chill',
        energy: '✨ Smooth',
        desc: 'Velvet smooth R&B vocals, slow bassline pulses & candlelit vibes',
        tags: ['#RnB', '#Silk', '#Smooth', '#LateNight'],
        accent: '#9333ea',
        accentGlow: 'rgba(147, 51, 234, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(147, 51, 234, 0.22) 0%, rgba(107, 33, 168, 0.08) 100%)',
        quote: '"Silk textures, smooth basslines and unforgettable nights."',
        glyphs: ['SILK', 'RNB', 'VELVET', 'SOUL', 'GROOVE', 'MIDNIGHT'],
        genres: ['chill', 'rnb', 'soul', 'pop'],
        size: 'normal',
        seedTracks: ['2hK0cZg5tQY', 'lp-EO5I60KA', 'V-_O7nl0Ii0', 'JGwWNGJdvx8', 'v7K4vGYL96U']
      },
      {
        id: 'country-folk',
        name: 'Country Roads & Folk',
        icon: '🤠',
        category: 'chill',
        energy: '🌾 Organic',
        desc: 'Acoustic storytelling, mountain breeze, banjo & warm roadtrip soul',
        tags: ['#Country', '#Folk', '#Roadtrip', '#Acoustic'],
        accent: '#ca8a04',
        accentGlow: 'rgba(202, 138, 4, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(202, 138, 4, 0.22) 0%, rgba(133, 77, 14, 0.08) 100%)',
        quote: '"Take me home, country roads, to the place I belong…"',
        glyphs: ['COUNTRY', 'FOLK', 'ROADS', 'HORIZON', 'ACOUSTIC', 'JOURNEY'],
        genres: ['chill', 'acoustic', 'folk', 'country'],
        size: 'normal',
        seedTracks: ['IcrbM1l_BoI', '2Vv-BfVoq4g', 'hT_nvWreIhg', '1T3i9Qp54s0']
      },

      // --- PUNJABI HITS ---
      {
        id: 'punjabi-swag',
        name: 'Punjabi Swag & Hits',
        icon: '👑',
        category: 'punjabi',
        energy: '🔥 Hype',
        desc: 'Urban bhangra, hard-hitting trap beats & unstoppable Punjabi swagger',
        tags: ['#Punjabi', '#Diljit', '#KaranAujla', '#Swag'],
        accent: '#f59e0b',
        accentGlow: 'rgba(245, 158, 11, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(180, 83, 9, 0.08) 100%)',
        quote: '"Born to shine, unstoppable flow and royal swagger."',
        glyphs: ['G.O.A.T.', 'SWAGGER', 'PUNJAB', 'ROYAL', 'VIBE', 'FLOW'],
        genres: ['punjabi', 'hiphop', 'bhangra'],
        size: 'hero',
        seedTracks: ['k4yXQkG2s1E', 'qLCLvxTN9UA', 'dZ0fwJojhrs', '2hK0cZg5tQY', '6MgsHSAcI98', 'vX2cDW8up28', 'hEJnMQG562U', 'V1Pl8CzNzCw']
      },
      {
        id: 'bhangra-dhol',
        name: 'Bhangra & Dhol Explosion',
        icon: '🥁',
        category: 'punjabi',
        energy: '🎉 Unstoppable',
        desc: 'Non-stop dhol beats, festive wedding energy & heart-pounding celebration',
        tags: ['#Bhangra', '#Dhol', '#Celebration', '#Punjab'],
        accent: '#f97316',
        accentGlow: 'rgba(249, 115, 22, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.22) 0%, rgba(194, 65, 12, 0.08) 100%)',
        quote: '"ढोल की थाप पे पूरी दुनिया झूमेगी!"',
        glyphs: ['DHOL', 'BHANGRA', 'PUNJAB', 'DANCE', 'DHAMAKA', 'NACHNA'],
        genres: ['punjabi', 'bhangra', 'dance'],
        size: 'wide',
        seedTracks: ['k4yXQkG2s1E', 'hEJnMQG562U', 'vX2cDW8up28', 'dZ0fwJojhrs', 'cl0a3i2wFcc']
      },
      {
        id: 'punjabi-rnb',
        name: 'Punjabi Romantic R&B',
        icon: '🌹',
        category: 'punjabi',
        energy: '✨ Smooth',
        desc: 'Soulful Punjabi love verses, buttery smooth R&B production & vibe',
        tags: ['#PunjabiRnB', '#KaranAujla', '#Softly', '#Lover'],
        accent: '#ec4899',
        accentGlow: 'rgba(236, 72, 153, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.22) 0%, rgba(219, 39, 119, 0.08) 100%)',
        quote: '"तेरी अखियां च डूब के साड्डी दुनिया संवर गई…"',
        glyphs: ['इश्क़', 'पंजाबी', 'रूह', 'अखियां', 'दिल', 'सुकून'],
        genres: ['punjabi', 'pop', 'romance', 'rnb'],
        size: 'tall',
        seedTracks: ['2hK0cZg5tQY', 'qLCLvxTN9UA', 'cl0a3i2wFcc', 'Umqb9KENgmk']
      },
      {
        id: 'desi-hiphop',
        name: 'Desi Hip-Hop & Gully Fire',
        icon: '🎙️',
        category: 'punjabi',
        energy: '🔥 Street Hype',
        desc: 'Raw street lyricism, heavy boom-bap drums & hard-hitting desi flow',
        tags: ['#GullyRap', '#DesiHipHop', '#Fire', '#Divine'],
        accent: '#ef4444',
        accentGlow: 'rgba(239, 68, 68, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.22) 0%, rgba(185, 28, 28, 0.08) 100%)',
        quote: '"अपना टाइम आ गया! Hard-hitting streets, real voices."',
        glyphs: ['GULLY', 'FLOW', 'STREET', 'BEAT', 'BARS', 'MIC'],
        genres: ['punjabi', 'hiphop', 'energy'],
        size: 'normal',
        seedTracks: ['6MgsHSAcI98', 'k4yXQkG2s1E', 'dZ0fwJojhrs', 'ALZHF5UqnU4']
      },
      {
        id: 'punjabi-drill',
        name: 'Punjabi Drill & Basslines',
        icon: '🏎️',
        category: 'punjabi',
        energy: '⚡ Dark Trap',
        desc: 'Sliding 808 sub-bass, rapid hi-hats & fearless Punjabi drill energy',
        tags: ['#PunjabiDrill', '#808', '#Trap', '#Bass'],
        accent: '#f59e0b',
        accentGlow: 'rgba(245, 158, 11, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(180, 83, 9, 0.08) 100%)',
        quote: '"Heavy bass sliding through the night streets."',
        glyphs: ['DRILL', 'BASS', 'TRAP', 'PUNJABI', 'DARK', 'FLOW'],
        genres: ['punjabi', 'trap', 'hiphop'],
        size: 'normal',
        seedTracks: ['dZ0fwJojhrs', '6MgsHSAcI98', 'vX2cDW8up28', 'k4yXQkG2s1E']
      },
      {
        id: 'folk-virsa',
        name: 'Punjabi Folk & Virsa Gold',
        icon: '🌾',
        category: 'punjabi',
        energy: '🌾 Heritage',
        desc: 'Timeless tumbi, sarangi melodies & rich rustic folk traditions of Punjab',
        tags: ['#Virsa', '#Folk', '#Punjab', '#Tradition'],
        accent: '#eab308',
        accentGlow: 'rgba(234, 179, 8, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.22) 0%, rgba(161, 98, 7, 0.08) 100%)',
        quote: '"ਮਿੱਟੀ ਦੀ ਖੁਸ਼ਬੋ ਤੇ ਪੰਜਾਬ ਦਾ ਅਮੀਰ ਵਿਰਸਾ…"',
        glyphs: ['VIRSA', 'TUMBI', 'PUNJAB', 'FOLK', 'ROOTS', 'HERITAGE'],
        genres: ['punjabi', 'folk', 'acoustic'],
        size: 'normal',
        seedTracks: ['cl0a3i2wFcc', 'k4yXQkG2s1E', '2hK0cZg5tQY', 'hEJnMQG562U']
      },

      // --- 90s & VINTAGE RETRO ---
      {
        id: 'retro-90s',
        name: "90's Golden Nostalgia",
        icon: '📼',
        category: 'retro',
        energy: '📼 Vintage',
        desc: 'Analog cassette tape magic, Kumar Sanu, Alka Yagnik & 90s purity',
        tags: ['#90s', '#Vintage', '#KumarSanu', '#AlkaYagnik'],
        accent: '#06b6d4',
        accentGlow: 'rgba(6, 182, 212, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.22) 0%, rgba(14, 116, 144, 0.08) 100%)',
        quote: '"The golden era of melodies that never fade away…"',
        glyphs: ['NOSTALGIA', 'RETRO', 'CASSETTE', 'GOLDEN', 'VINTAGE', 'MELODY'],
        genres: ['retro', 'retro_90s', 'nostalgia', 'bollywood'],
        size: 'hero',
        seedTracks: ['0NV1KdWRHck', 'D7a3m1W0hT0', 'sAZvj4M6i6k', '8k_4mZ3h8vA', 'm93sJ4a6y_Y']
      },
      {
        id: 'retro-2000s',
        name: '2000s Bollywood Roadtrip',
        icon: '🚗',
        category: 'retro',
        energy: '✨ Nostalgic',
        desc: 'Dil Chahta Hai era, Sonu Nigam, Shankar-Ehsaan-Loy & open highways',
        tags: ['#2000s', '#SonuNigam', '#Roadtrip', '#GoldenEra'],
        accent: '#38bdf8',
        accentGlow: 'rgba(56, 189, 248, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.22) 0%, rgba(14, 165, 233, 0.08) 100%)',
        quote: '"वो दिन भी क्या दिन थे, जब हर सफ़र एक नई कहानी थी…"',
        glyphs: ['ROADTRIP', '2000S', 'YAADEIN', 'SONU', 'HIGHWAY', 'NOSTALGIA'],
        genres: ['retro', 'bollywood', 'nostalgia', 'soul'],
        size: 'wide',
        seedTracks: ['8k_4mZ3h8vA', '1u_kH0N7k8w', '6vY9o8J3r_4', '4b_W8k9a3M0', '0NV1KdWRHck']
      },
      {
        id: 'retro-80s-disco',
        name: '80s Disco & RD Burman',
        icon: '🕺',
        category: 'retro',
        energy: '🔥 Retro Dance',
        desc: 'Funky brass, synth basslines, Kishore Kumar groove & retro disco fever',
        tags: ['#80s', '#RDBurman', '#Disco', '#KishoreKumar'],
        accent: '#f43f5e',
        accentGlow: 'rgba(244, 63, 94, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.22) 0%, rgba(225, 29, 72, 0.08) 100%)',
        quote: '"Disco lights, funky bass and unstoppable 80s groove."',
        glyphs: ['DISCO', '80S', 'FUNK', 'RETRO', 'GROOVE', 'VINTAGE'],
        genres: ['retro', 'dance', 'funk', 'bollywood'],
        size: 'tall',
        seedTracks: ['m93sJ4a6y_Y', '0NV1KdWRHck', 'OPf0YbXqDm0', 'sAZvj4M6i6k']
      },
      {
        id: 'retro-indipop-90s',
        name: '90s Indipop Nostalgia',
        icon: '🎸',
        category: 'retro',
        energy: '📼 Pure Vibe',
        desc: 'Lucky Ali, Euphoria, Silk Route & sweet breeze from Indian 90s cassette days',
        tags: ['#Indipop', '#LuckyAli', '#Euphoria', '#90s'],
        accent: '#f59e0b',
        accentGlow: 'rgba(245, 158, 11, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(217, 119, 6, 0.08) 100%)',
        quote: '"ओ सनम, मोहब्बत की कसम… वो बेपरवाह दिन याद आते हैं."',
        glyphs: ['INDIPOP', 'LUCKY', 'SUNSHINE', 'RETRO', 'CASSETTE', 'GUITAR'],
        genres: ['retro', 'acoustic', 'pop', 'bollywood'],
        size: 'normal',
        seedTracks: ['0NV1KdWRHck', '1T3i9Qp54s0', 'YxWlaYCA8MU', '8k_4mZ3h8vA']
      },
      {
        id: 'retro-70s-kishore',
        name: 'Evergreen 70s Kishore Gold',
        icon: '📻',
        category: 'retro',
        energy: '📻 Timeless',
        desc: 'Kishore Kumar, Rajesh Khanna romance & golden 1970s analog vinyl warmth',
        tags: ['#KishoreKumar', '#70s', '#Evergreen', '#Vinyl'],
        accent: '#eab308',
        accentGlow: 'rgba(234, 179, 8, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.22) 0%, rgba(161, 98, 7, 0.08) 100%)',
        quote: '"जिंदगी का सफर है ये कैसा सफर, कोई समझा नहीं कोई जाना नहीं…"',
        glyphs: ['KISHORE', '70S', 'VINYL', 'GOLDEN', 'EVERGREEN', 'MELODY'],
        genres: ['retro', 'bollywood', 'soul'],
        size: 'normal',
        seedTracks: ['m93sJ4a6y_Y', 'sAZvj4M6i6k', '0NV1KdWRHck', '8k_4mZ3h8vA']
      },

      // --- SUFI & SPIRITUAL ---
      {
        id: 'sufi-peace',
        name: 'Sufi & Spiritual Devotion',
        icon: '🕊️',
        category: 'sufi',
        energy: '🕊️ Transcendent',
        desc: 'Qawwali, divine transcendence, sacred strings & peace for the restless soul',
        tags: ['#Sufi', '#Rahman', '#Spiritual', '#Peace'],
        accent: '#059669',
        accentGlow: 'rgba(5, 150, 105, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(5, 150, 105, 0.22) 0%, rgba(4, 120, 87, 0.08) 100%)',
        quote: '"मन कुन फया कुन, जब कहीं पे कुछ नहीं भी नहीं था…"',
        glyphs: ['रूह', 'सुकून', 'इबादत', 'फ़ना', 'नूर', 'सदा'],
        genres: ['sufi', 'spiritual', 'soul', 'devotional'],
        size: 'hero',
        seedTracks: ['b9p_HjFq78c', '1u_kH0N7k8w', '6vY9o8J3r_4', '4b_W8k9a3M0', 'cl0a3i2wFcc', 'BBAyRZZ9cG4']
      },
      {
        id: 'ghazal-mehfil',
        name: 'Ghazals & Poetic Mehfil',
        icon: '🍷',
        category: 'sufi',
        energy: '🕯️ Intimate',
        desc: 'Soul-stirring poetry, harmonium resonance & timeless Urdu/Hindi verses',
        tags: ['#Ghazal', '#Mehfil', '#Poetry', '#Urdu'],
        accent: '#78350f',
        accentGlow: 'rgba(120, 53, 15, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(120, 53, 15, 0.22) 0%, rgba(69, 26, 3, 0.08) 100%)',
        quote: '"इक महफ़िल सजी है यादों की, और लफ़्ज़ों में दर्द मुस्कुरा रहा है…"',
        glyphs: ['ग़ज़ल', 'शायरी', 'महफ़िल', 'अल्फ़ाज़', 'नज़्में', 'सुकून'],
        genres: ['sufi', 'ghazal', 'classical', 'soul'],
        size: 'wide',
        seedTracks: ['b9p_HjFq78c', 'p7i88HqK_4k', '4b_W8k9a3M0', 'BBAyRZZ9cG4', 'gvyUuxdRdR4']
      },
      {
        id: 'devotional-peace',
        name: 'Sacred Devotional Peace',
        icon: '🕉️',
        category: 'sufi',
        energy: '🕊️ Serene',
        desc: 'Morning temple bells, peaceful sacred mantras & spiritual harmony',
        tags: ['#Devotional', '#Peace', '#Spiritual', '#Morning'],
        accent: '#d97706',
        accentGlow: 'rgba(217, 119, 6, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(217, 119, 6, 0.22) 0%, rgba(146, 64, 14, 0.08) 100%)',
        quote: '"शांति और पवित्रता का पावन संगम…"',
        glyphs: ['शांति', 'पवित्रता', 'भक्ति', 'आरती', 'प्रकाश', 'आनंद'],
        genres: ['sufi', 'devotional', 'spiritual'],
        size: 'tall',
        seedTracks: ['1u_kH0N7k8w', '6vY9o8J3r_4', 'b9p_HjFq78c', 'sAZvj4M6i6k']
      },
      {
        id: 'royal-qawwali',
        name: 'Royal Sufi Qawwali Ecstasy',
        icon: '🪕',
        category: 'sufi',
        energy: '✨ Ecstatic',
        desc: 'Mesmerizing harmonium, rhythmic claps, divine poetry & soulful Sufi ecstasy',
        tags: ['#Qawwali', '#Nusrat', '#Sufi', '#Mehfil'],
        accent: '#10b981',
        accentGlow: 'rgba(16, 185, 129, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(4, 120, 87, 0.08) 100%)',
        quote: '"दम मस्त कलंदर मस्त मस्त, रूह को मिल गया अपना रहबर…"',
        glyphs: ['कलंदर', 'इबादत', 'रूह', 'कव्वाली', 'सुकून', 'नूर'],
        genres: ['sufi', 'spiritual', 'soul', 'ghazal'],
        size: 'normal',
        seedTracks: ['b9p_HjFq78c', 'cl0a3i2wFcc', '1u_kH0N7k8w', 'BBAyRZZ9cG4']
      },
      {
        id: 'sufi-rock',
        name: 'Sufi Rock & Mystical Guitars',
        icon: '🎸',
        category: 'sufi',
        energy: '⚡ Passionate',
        desc: 'Junoon, soaring electric guitars, impassioned Sufi poetry & spiritual power',
        tags: ['#SufiRock', '#Junoon', '#Rock', '#Mystic'],
        accent: '#0d9488',
        accentGlow: 'rgba(13, 148, 136, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(13, 148, 136, 0.22) 0%, rgba(15, 118, 110, 0.08) 100%)',
        quote: '"Sayonee, spiritual fire and soaring guitar solos."',
        glyphs: ['SUFI', 'ROCK', 'SAYONEE', 'FIRE', 'GUITAR', 'SPIRIT'],
        genres: ['sufi', 'rock', 'energy'],
        size: 'normal',
        seedTracks: ['b9p_HjFq78c', '7wtfhZwyrcc', '1u_kH0N7k8w', 'BBAyRZZ9cG4']
      },

      // --- NIGHT DRIVE ---
      {
        id: 'night-drive',
        name: 'Midnight Highway Drive',
        icon: '🏎️',
        category: 'drive',
        energy: '🚗 Fast & Neon',
        desc: 'Dark synthwave, neon city skylines & midnight highway acceleration',
        tags: ['#Drive', '#Synthwave', '#Neon', '#TheWeeknd'],
        accent: '#f43f5e',
        accentGlow: 'rgba(244, 63, 94, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.22) 0%, rgba(190, 18, 60, 0.08) 100%)',
        quote: '"Empty highways, flashing neon lights and limitless speed."',
        glyphs: ['HIGHWAY', 'NEON', 'SYNTH', 'SPEED', 'TURBO', 'NIGHT'],
        genres: ['drive', 'synthwave', 'dark_pop', 'edm'],
        size: 'hero',
        seedTracks: ['4NRXx6U8ABQ', 'lp-EO5I60KA', '60ItHLz5WEA', 'dZ0fwJojhrs', 'vX2cDW8up28', 'b5f25X2Gvfg']
      },
      {
        id: 'cyberpunk-city',
        name: 'Cyberpunk Neon City',
        icon: '🌆',
        category: 'drive',
        energy: '⚡ Dark Electronic',
        desc: 'Rain-soaked dystopian streets, retro analog synths & dark drive pulse',
        tags: ['#Cyberpunk', '#Synth', '#Dystopia', '#Outrun'],
        accent: '#a855f7',
        accentGlow: 'rgba(168, 85, 247, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.22) 0%, rgba(126, 34, 206, 0.08) 100%)',
        quote: '"Neon reflections on wet asphalt and the endless cyber night."',
        glyphs: ['CYBER', 'NEON', 'PULSE', 'SYNTH', 'MATRIX', 'DRIFT'],
        genres: ['drive', 'synthwave', 'ambient', 'dark_pop'],
        size: 'wide',
        seedTracks: ['4NRXx6U8ABQ', 'lp-EO5I60KA', '60ItHLz5WEA', 'b5f25X2Gvfg']
      },
      {
        id: 'phonk-drift',
        name: 'Tokyo Phonk & Night Drift',
        icon: '🔰',
        category: 'drive',
        energy: '⚡ High Drift',
        desc: 'Cowbell melodies, aggressive drift basslines & Tokyo underground adrenaline',
        tags: ['#Phonk', '#TokyoDrift', '#Bass', '#NightDrive'],
        accent: '#06b6d4',
        accentGlow: 'rgba(6, 182, 212, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.22) 0%, rgba(14, 116, 144, 0.08) 100%)',
        quote: '"Smoky tires, cowbell rhythms and high-speed cornering."',
        glyphs: ['PHONK', 'DRIFT', 'TOKYO', 'COWBELL', 'TURBO', 'SPEED'],
        genres: ['drive', 'edm', 'trap'],
        size: 'normal',
        seedTracks: ['dZ0fwJojhrs', '60ItHLz5WEA', '4NRXx6U8ABQ', 'vX2cDW8up28']
      },
      {
        id: 'sunset-coastline',
        name: 'Sunset Coastline Cruise',
        icon: '🌅',
        category: 'drive',
        energy: '☕ Chill Cruise',
        desc: 'Ocean breeze, windows down, warm golden sunset & melodic synth-pop',
        tags: ['#Sunset', '#Coastline', '#Cruise', '#ChillDrive'],
        accent: '#ea580c',
        accentGlow: 'rgba(234, 88, 12, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(234, 88, 12, 0.22) 0%, rgba(194, 65, 12, 0.08) 100%)',
        quote: '"Golden sunset on the horizon, cool ocean breeze and smooth melodies."',
        glyphs: ['CRUISE', 'COASTLINE', 'SUNSET', 'PACIFIC', 'CHILL', 'HORIZON'],
        genres: ['drive', 'chill', 'pop', 'synthwave'],
        size: 'normal',
        seedTracks: ['YxWlaYCA8MU', 'OPf0YbXqDm0', '1T3i9Qp54s0', 'JGwWNGJdvx8']
      },

      // --- FOCUS & AMBIENT ---
      {
        id: 'deep-focus',
        name: 'Deep Focus & Study Flow',
        icon: '🧘',
        category: 'focus',
        energy: '🧘 Ambient Calm',
        desc: 'Zero-distraction atmospheric textures, flow state & coding focus',
        tags: ['#Focus', '#Study', '#Coding', '#Ambient'],
        accent: '#6366f1',
        accentGlow: 'rgba(99, 102, 241, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.22) 0%, rgba(67, 56, 202, 0.08) 100%)',
        quote: '"Total silence, unbroken concentration and creative flow."',
        glyphs: ['FOCUS', 'STUDY', 'ZEN', 'CALM', 'FLOW', 'CODING'],
        genres: ['focus', 'ambient', 'chill', 'lofi'],
        size: 'hero',
        seedTracks: ['60ItHLz5WEA', 'T94PHkuydcw', 'YxWlaYCA8MU', '1u_kH0N7k8w', '3vK3rZ3n2L0']
      },
      {
        id: 'space-ambient',
        name: 'Space & Cosmic Ambient',
        icon: '🛸',
        category: 'focus',
        energy: '🌌 Floating',
        desc: 'Zero-gravity soundscapes, interstellar synths & stargazing tranquility',
        tags: ['#Cosmic', '#Space', '#Ambient', '#ZeroGravity'],
        accent: '#4338ca',
        accentGlow: 'rgba(67, 56, 202, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(67, 56, 202, 0.22) 0%, rgba(49, 46, 129, 0.08) 100%)',
        quote: '"Floating across infinite galaxies beyond time and space."',
        glyphs: ['COSMOS', 'GALAXY', 'INFINITY', 'STARDUST', 'NEBULA', 'ASTRONAUT'],
        genres: ['focus', 'ambient', 'synthwave'],
        size: 'wide',
        seedTracks: ['60ItHLz5WEA', 'T94PHkuydcw', '1u_kH0N7k8w', 'b9p_HjFq78c']
      },
      {
        id: 'zen-piano',
        name: 'Minimalist Zen Piano',
        icon: '🎹',
        category: 'focus',
        energy: '🕊️ Gentle Zen',
        desc: 'Solitary piano keys, soft room reverb & undisturbed mental clarity',
        tags: ['#Piano', '#Zen', '#Minimalist', '#Clarity'],
        accent: '#8b5cf6',
        accentGlow: 'rgba(139, 92, 246, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.22) 0%, rgba(109, 40, 217, 0.08) 100%)',
        quote: '"Each piano note like a single raindrop on still water."',
        glyphs: ['PIANO', 'ZEN', 'MINIMAL', 'KEYS', 'PEACE', 'CLARITY'],
        genres: ['focus', 'ambient', 'acoustic', 'classical'],
        size: 'normal',
        seedTracks: ['3vK3rZ3n2L0', 'T94PHkuydcw', 'YxWlaYCA8MU', '1u_kH0N7k8w']
      },
      {
        id: 'alpha-binaural',
        name: 'Alpha Waves & Deep Brainwaves',
        icon: '🧠',
        category: 'focus',
        energy: '🧘 Deep Flow',
        desc: '10Hz alpha wave frequencies, deep brown noise & high productivity focus',
        tags: ['#AlphaWaves', '#Binaural', '#Brainwaves', '#Productivity'],
        accent: '#0284c7',
        accentGlow: 'rgba(2, 132, 199, 0.45)',
        gradient: 'linear-gradient(135deg, rgba(2, 132, 199, 0.22) 0%, rgba(3, 105, 161, 0.08) 100%)',
        quote: '"Synchronize your brainwaves into deep, effortless flow state."',
        glyphs: ['ALPHA', 'BRAINWAVES', 'FLOW', 'PRODUCTIVITY', 'DEEP', 'MIND'],
        genres: ['focus', 'ambient'],
        size: 'normal',
        seedTracks: ['60ItHLz5WEA', 'T94PHkuydcw', 'b9p_HjFq78c', '1u_kH0N7k8w']
      }
    ];

    function computeMoodAffinity(mood) {
      var prof = (VibeAgent && typeof VibeAgent.getProfile === 'function') ? VibeAgent.getProfile() : { genres: {} };
      var timeCtx = (VibeAgent && typeof VibeAgent.getTimeContext === 'function') ? VibeAgent.getTimeContext() : { phase: 'evening' };
      var score = 75;

      // 1. Check genre matches
      if (mood.genres && Array.isArray(mood.genres)) {
        mood.genres.forEach(function (g) {
          if (prof && prof.genres && prof.genres[g]) {
            score += Math.min(18, Math.sqrt(prof.genres[g]) * 4);
          }
        });
      }

      // 2. Check time of day boost
      if (mood.category === 'chill' && (timeCtx.phase === 'midnight' || timeCtx.phase === 'morning')) score += 8;
      if (mood.category === 'energy' && timeCtx.phase === 'afternoon') score += 8;
      if (mood.category === 'romance' && (timeCtx.phase === 'evening' || timeCtx.phase === 'midnight')) score += 8;

      score = Math.min(99, Math.round(score));

      var badge = '✨ ' + score + '% Match';
      if (score >= 95) badge = '🔥 ' + score + '% Vibe Peak';
      else if (timeCtx.phase === 'midnight' && (mood.id === 'midnight-lofi' || mood.id === 'night-drive')) badge = '🌙 Midnight Special';
      else if (timeCtx.phase === 'morning' && (mood.id === 'coffee-acoustic' || mood.id === 'monsoon-chai')) badge = '🌅 Morning Flow';

      return {
        score: score,
        badge: badge
      };
    }

    // Dynamic AI Mood Synthesizer: Generates emergent personalized mood stations on the fly!
    var dynamicMoodCount = 0;
        function synthesizeMoreMoods(count) {
      count = count || 8;
      var newStations = [
        {
          id: 'cyber-drift-' + Date.now(),
          name: 'Cyber Neon Drift',
          icon: '🔰',
          category: 'energy',
          energy: '⚡ Turbo Bass',
          desc: 'High speed night driving with heavy 808s & Tokyo neon synth pulses',
          tags: ['#Cyberpunk', '#Drift', '#Phonk', '#Speed'],
          accent: '#06b6d4',
          accentGlow: 'rgba(6, 182, 212, 0.5)',
          gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(59, 130, 246, 0.08) 100%)',
          quote: '"Limitless asphalt under ultraviolet skies."',
          glyphs: ['DRIFT', 'TOKYO', 'NEON', 'SYNTH', 'PHONK', 'PULSE'],
          genres: ['drive', 'synthwave', 'edm'],
          size: 'wide',
          seedTracks: ['4NRXx6U8ABQ', 'dZ0fwJojhrs', '60ItHLz5WEA', 'vX2cDW8up28']
        },
        {
          id: 'indipop-90s-' + Date.now(),
          name: '90s Indipop Nostalgia',
          icon: '🎸',
          category: 'retro',
          energy: '📼 Pure Vibe',
          desc: 'Lucky Ali, Euphoria, Silk Route & sweet breeze from Indian 90s cassette days',
          tags: ['#Indipop', '#LuckyAli', '#Euphoria', '#90s'],
          accent: '#f59e0b',
          accentGlow: 'rgba(245, 158, 11, 0.5)',
          gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.08) 100%)',
          quote: '"ओ सनम, मोहब्बत की कसम… वो बेपरवाह दिन याद आते हैं."',
          glyphs: ['INDIPOP', 'LUCKY', 'SUNSHINE', 'RETRO', 'CASSETTE', 'GUITAR'],
          genres: ['retro', 'acoustic', 'pop', 'bollywood'],
          size: 'hero',
          seedTracks: ['0NV1KdWRHck', '1T3i9Qp54s0', 'YxWlaYCA8MU', '8k_4mZ3h8vA']
        },
        {
          id: 'raindrop-lofi-' + Date.now(),
          name: 'Raindrop Lo-Fi Heartbreak',
          icon: '🌧️',
          category: 'romance',
          energy: '🥀 Deep Ache',
          desc: 'Slowed rain frequencies, nostalgic acoustic chords & late-night heartbreak solace',
          tags: ['#RainLoFi', '#Heartbreak', '#Slowed', '#2AM'],
          accent: '#38bdf8',
          accentGlow: 'rgba(56, 189, 248, 0.5)',
          gradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(14, 165, 233, 0.08) 100%)',
          quote: '"कांच पे गिरती बूँदें और दिल में दबे अनकहे अहसास…"',
          glyphs: ['BARISH', 'YAADEIN', 'DIL', 'AASU', 'SLOWED', 'ECHO'],
          genres: ['romance', 'chill', 'lofi', 'soul'],
          size: 'tall',
          seedTracks: ['Ax0G_P2dSBw', 'p7i88HqK_4k', 'T94PHkuydcw', 'b5f25X2Gvfg']
        },
        {
          id: 'royal-sufi-' + Date.now(),
          name: 'Royal Sufi Qawwali',
          icon: '🪕',
          category: 'sufi',
          energy: '✨ Transcendent',
          desc: 'Mesmerizing harmonium, rhythmic claps, divine poetry & soulful Sufi ecstasy',
          tags: ['#Qawwali', '#Nusrat', '#Sufi', '#Mehfil'],
          accent: '#10b981',
          accentGlow: 'rgba(16, 185, 129, 0.5)',
          gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(4, 120, 87, 0.08) 100%)',
          quote: '"दम मस्त कलंदर मस्त मस्त, रूह को मिल गया अपना रहबर…"',
          glyphs: ['कलंदर', 'इबादत', 'रूह', 'कव्वाली', 'सुकून', 'नूर'],
          genres: ['sufi', 'spiritual', 'soul', 'ghazal'],
          size: 'wide',
          seedTracks: ['b9p_HjFq78c', 'cl0a3i2wFcc', '1u_kH0N7k8w', 'BBAyRZZ9cG4']
        }
      ];

      newStations.forEach(function (st) {
        MOOD_STATIONS.push(st);
      });

      var badge = $('moodTotalCountBadge');
      if (badge) badge.textContent = MOOD_STATIONS.length + '+ STATIONS';

      renderGrid(searchInput ? searchInput.value : '', currentActiveCategory);
      showToast('✨ AI Synthesized ' + newStations.length + ' Brand New Mood Stations!');
    }

    function renderGrid(query, category) {
      grid = grid || $('moodStationsGrid');
      if (!grid) return;
      query = (query || '').trim().toLowerCase();
      category = category || currentActiveCategory || 'all';

      var filtered = MOOD_STATIONS.filter(function (m) {
        var matchCat = (category === 'all' || m.category === category || (m.genres && m.genres.indexOf(category) !== -1));
        if (!matchCat) return false;

        if (!query) return true;
        var fullText = (m.name + ' ' + m.desc + ' ' + (m.tags ? m.tags.join(' ') : '') + ' ' + m.category).toLowerCase();
        return fullText.indexOf(query) !== -1;
      });

      // Compute dynamic affinity and sort
      var ranked = filtered.map(function (m) {
        var aff = computeMoodAffinity(m);
        return {
          mood: m,
          affinity: aff
        };
      });

      ranked.sort(function (a, b) { return b.affinity.score - a.affinity.score; });

      grid.innerHTML = '';

      if (!ranked.length) {
        grid.innerHTML = '<div class="queue-empty" style="grid-column:1/-1; padding:40px; text-align:center; font-size:14px; color:rgba(255,255,255,0.7);">No moods matching "' + escapeHtml(query) + '". Try "edm", "pop", "chai", "90s" or "romance"! 🔍</div>';
        return;
      }

      ranked.forEach(function (item, index) {
        var m = item.mood;
        var aff = item.affinity;
        var isPlayingThis = (currentStationKey === 'mood-' + m.id);

        // Bento Size calculation: hero / wide / tall / normal
        var cardSize = m.size || 'normal';
        if (!m.size) {
          if (index === 0 && aff.score >= 90) cardSize = 'hero';
          else if (index === 1 || index === 4 || index === 8 || index === 13) cardSize = 'wide';
          else if (index === 2 || index === 6 || index === 11) cardSize = 'tall';
          else cardSize = 'normal';
        }

        var card = document.createElement('div');
        card.className = 'mood-station-card size-' + cardSize + (isPlayingThis ? ' active-playing' : '');
        card.style.setProperty('--card-accent', m.accent || '#ec4899');
        card.style.setProperty('--card-glow', m.accentGlow || 'rgba(236, 72, 153, 0.4)');
        card.style.setProperty('--card-gradient', m.gradient || 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, transparent 100%)');

        var quoteHtml = (cardSize === 'hero' || cardSize === 'tall') && m.quote ? 
          '<div style="font-size: 11px; font-style: italic; color: rgba(255,255,255,0.65); margin-top: 4px; line-height: 1.35; border-left: 2px solid var(--card-accent, #ec4899); padding-left: 8px;">' + m.quote + '</div>' : '';

        card.innerHTML = 
          '<div class="mood-card-top">' +
            '<div class="mood-icon-wrap">' + m.icon + '</div>' +
            '<div class="mood-card-badges">' +
              '<span class="mood-affinity-badge">' + aff.badge + '</span>' +
              '<span class="mood-energy-badge">' + m.energy + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="mood-card-body">' +
            '<div class="mood-card-title">' + m.name + '</div>' +
            '<div class="mood-card-desc">' + m.desc + '</div>' +
            quoteHtml +
            '<div class="mood-card-tags">' +
              (m.tags || []).map(function (t) { return '<span class="mood-card-tag">' + t + '</span>'; }).join('') +
            '</div>' +
          '</div>' +
          '<div class="mood-card-bottom">' +
            '<button class="mood-stream-btn" type="button">' +
              '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>' +
              '<span>' + (isPlayingThis ? 'Currently Streaming' : 'Tune Into Mood') + '</span>' +
            '</button>' +
          '</div>';

        function onSelectMood(e) {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }
          playMoodStation(m);
        }

        card.addEventListener('click', onSelectMood);
        var btn = card.querySelector('.mood-stream-btn');
        if (btn) btn.addEventListener('click', onSelectMood);

        grid.appendChild(card);
      });
    }

    function playMoodStation(mood) {
      if (!mood) return;
      desired = true;
      claimAudioMaster();
      hideAutoplayPrompt();
      document.body.classList.add('playing');

      // Synthesize dynamic station object
      var customStation = {
        id: 'mood-' + mood.id,
        name: mood.icon + ' ' + mood.name,
        short: mood.name + ' ' + mood.icon,
        brand: mood.name.toUpperCase(),
        brandSub: 'MOOD FREQUENCY // ' + mood.desc.toUpperCase(),
        desc: mood.desc,
        icon: mood.icon,
        type: 'custom',
        songCount: 'AI MOOD STREAM',
        theme: {
          bg: '#05050a',
          fg: '#ffffff',
          fgDim: '#e2e8f0',
          muted: '#94a3b8',
          accent: mood.accent || '#ec4899',
          accentGlow: mood.accentGlow || 'rgba(236, 72, 153, 0.45)',
          themeAmbient: 'rgba(236, 72, 153, 0.1)',
          glassBg: 'rgba(10, 10, 16, 0.92)',
          fontFamily: "'Syne', sans-serif",
          uiMode: 'mood-' + mood.id,
          glyphs: mood.glyphs || ['VIBE', 'FREQUENCY', 'MOOD', 'SOUND', 'IMMERSION'],
          centerGlyph: mood.name.split(' ')[0],
          quote: mood.quote || ('"' + mood.desc + '"')
        }
      };

      // Register station in global stations array
      if (typeof stations !== 'undefined' && Array.isArray(stations)) {
        var existing = stations.find(function (s) { return s.id === customStation.id; });
        if (!existing) stations.push(customStation);
        else Object.assign(existing, customStation);
      }

      currentStationKey = customStation.id;
      currentStation = customStation;
      activePlaylistId = 'mood_' + mood.id;
      applyStationTheme(customStation);
      localStorage.setItem('ishq_station_key', customStation.id);

      // Strict, genre-accurate mood queue
      var tracks = (mood.seedTracks && mood.seedTracks.length) ? mood.seedTracks.slice() : ['BddP6PYo2gs', 'b5f25X2Gvfg', 'L_LUpnjgPso'];

      // Add extra catalog songs matching this mood's category and genres ONLY
      if (VibeAgent && VibeAgent.catalog) {
        var matchingCatalog = VibeAgent.catalog.filter(function (s) {
          if (tracks.indexOf(s.id) !== -1) return false;
          if (!s.genres || !s.genres.length) return false;
          if (mood.genres && mood.genres.some(function (g) { return s.genres.indexOf(g) !== -1; })) return true;
          if (s.genres.indexOf(mood.category) !== -1) return true;
          return false;
        });

        matchingCatalog.forEach(function (s) {
          if (tracks.indexOf(s.id) === -1) tracks.push(s.id);
        });
      }

      currentTrackQueue = tracks;
      currentTrackIndex = 0;
      if (typeof STATION_TRACKS !== 'undefined') {
        STATION_TRACKS[customStation.id] = tracks;
      }

            var activeP = player || window.__p;
      if (activeP) {
        try {
          if (activeP.unMute) activeP.unMute();
          if (activeP.setVolume) activeP.setVolume(100);
          if (activeP.loadVideoById) {
            activeP.loadVideoById(tracks[0]);
          } else if (activeP.cueVideoById) {
            activeP.cueVideoById(tracks[0]);
          }
          if (activeP.playVideo) {
            activeP.playVideo();
          }
        } catch (e) {
          console.error("Playback load error", e);
        }

        // Secondary trigger for browser autoplay enforcement
        setTimeout(function () {
          try {
            if (activeP.playVideo) activeP.playVideo();
          } catch (err) {}
        }, 250);
      }

      // Immediate UI update for instant response
      var seedSong = (VibeAgent && VibeAgent.catalog) ? VibeAgent.catalog.find(function(s){ return s.id === tracks[0]; }) : null;
      var initTitle = seedSong ? seedSong.title : (mood.name + ' Frequency');
      var initArtist = seedSong ? seedSong.artist : (mood.category.toUpperCase() + ' Radio');
      if ($('title')) $('title').textContent = initTitle;
      if ($('artist')) $('artist').textContent = initArtist;
      if ($('art')) $('art').src = 'https://i.ytimg.com/vi/' + tracks[0] + '/mqdefault.jpg';
      if ($('ambientArt')) $('ambientArt').src = 'https://i.ytimg.com/vi/' + tracks[0] + '/hqdefault.jpg';
      if ($('brandTitle')) $('brandTitle').textContent = customStation.brand;
      if ($('brandSub')) $('brandSub').textContent = customStation.brandSub;
      if ($('currentStationLabel')) $('currentStationLabel').textContent = customStation.short;
      document.body.classList.add('playing');
      document.body.classList.add('has-art');
      hideAutoplayPrompt();

      if (typeof DynamicIslandEngine !== 'undefined' && DynamicIslandEngine.updateTrack) {
        DynamicIslandEngine.updateTrack({ id: tracks[0], title: initTitle, artist: initArtist });
        DynamicIslandEngine.updatePlayState(true);
      }
      if (typeof LyricsEngine !== 'undefined' && LyricsEngine.fetchLyrics) {
        LyricsEngine.fetchLyrics({ id: tracks[0], title: initTitle, artist: initArtist });
      }

      // Reinforce AI learning for this mood
      if (mood.genres && mood.genres.length) {
        VibeAgent.learnFromTrack({ id: tracks[0], title: initTitle, artist: initArtist }, 2);
      }

      closeModal();
      show('s-ready');
      showToast('Tuning to Mood: ' + mood.icon + ' ' + mood.name + ' ✨');

      // Update UI active states
      document.querySelectorAll('.mood-station-card').forEach(function (c) {
        c.classList.remove('active-playing');
      });
      document.querySelectorAll('.station-item').forEach(function (it) {
        it.classList.remove('active');
      });

      setTimeout(function () {
        update();
        renderSessionQueue();
      }, 150);
    }

    function openModal() {
      modal = modal || $('moodUniverseModal');
      grid = grid || $('moodStationsGrid');
      searchInput = searchInput || $('moodSearchInput');
      categoryChips = categoryChips || $('moodCategoryChips');
      if (!modal) return;
      modal.classList.add('open');
      renderGrid(searchInput ? searchInput.value : '', currentActiveCategory);
      if (searchInput) searchInput.focus();
    }

    function closeModal() {
      modal = modal || $('moodUniverseModal');
      if (!modal) return;
      modal.classList.remove('open');
    }

    function init() {
      modal = modal || $('moodUniverseModal');
      grid = grid || $('moodStationsGrid');
      searchInput = searchInput || $('moodSearchInput');
      searchClear = searchClear || $('moodSearchClear');
      categoryChips = categoryChips || $('moodCategoryChips');
      closeBtn = closeBtn || $('closeMoodUniBtn');
      surpriseBtn = surpriseBtn || $('btnSurpriseMood');

      triggerBtn = $('moodUniverseBtn');
      if (!triggerBtn) {
        var headerLeft = document.querySelector('.header-left');
        if (headerLeft) {
          triggerBtn = document.createElement('button');
          triggerBtn.className = 'mood-universe-btn';
          triggerBtn.id = 'moodUniverseBtn';
          triggerBtn.title = 'Explore 60+ Endless AI Mood Radios';
          triggerBtn.style.cssText = 'display: inline-flex !important; align-items: center; gap: 6px; height: 28px; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%) !important; border: 1px solid rgba(255, 255, 255, 0.45) !important; padding: 0 12px; border-radius: 999px; cursor: pointer; color: #ffffff !important; font-weight: 800; box-shadow: 0 0 16px rgba(236, 72, 153, 0.6) !important; z-index: 20; flex-shrink: 0; margin-left: 2px;';
          triggerBtn.innerHTML = '<span class="mood-btn-icon" style="font-size: 13px;">🎭</span><span class="mood-btn-label" style="font-size: 9.5px; letter-spacing: 0.14em; font-weight: 800; text-transform: uppercase; color: #fff;">MOODS</span><span class="mood-ai-badge" style="font-size: 7.5px; font-weight: 900; background: #fff; color: #8b5cf6; padding: 1px 5px; border-radius: 999px;">60+ AI</span>';
          headerLeft.appendChild(triggerBtn);
        }
      }

      if (triggerBtn) {
        triggerBtn.addEventListener('click', openModal);
      }

      var dropdownTrigger = $('dropdownMoodUniTrigger');
      if (dropdownTrigger) {
        dropdownTrigger.addEventListener('click', function (e) {
          e.stopPropagation();
          var dd = $('stationDropdown');
          if (dd) dd.classList.remove('open');
          openModal();
        });
      }

      var sidebarBtn = $('sidebarMoodUniBtn');
      if (sidebarBtn) {
        sidebarBtn.addEventListener('click', function () {
          var sb = $('premiumSidebarMenu');
          if (sb) sb.classList.remove('open');
          openModal();
        });
      }

      if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
      }

      if (modal) {
        modal.addEventListener('click', function (e) {
          if (e.target === modal) closeModal();
        });
      }

      if (searchInput) {
        searchInput.addEventListener('input', function (e) {
          var val = e.target.value;
          if (searchClear) searchClear.style.display = val ? 'block' : 'none';
          renderGrid(val, currentActiveCategory);
        });
      }

      if (searchClear) {
        searchClear.addEventListener('click', function () {
          if (searchInput) searchInput.value = '';
          searchClear.style.display = 'none';
          renderGrid('', currentActiveCategory);
        });
      }

      if (categoryChips) {
        categoryChips.addEventListener('click', function (e) {
          var chip = e.target.closest('.mood-chip');
          if (!chip) return;
          var cat = chip.getAttribute('data-cat') || 'all';
          currentActiveCategory = cat;
          document.querySelectorAll('.mood-chip').forEach(function (c) {
            c.classList.toggle('active', c === chip);
          });
          renderGrid(searchInput ? searchInput.value : '', currentActiveCategory);
        });
      }

      if (surpriseBtn) {
        surpriseBtn.addEventListener('click', function () {
          var unplayed = MOOD_STATIONS.slice().sort(function () { return 0.5 - Math.random(); });
          var picked = unplayed[0];
          if (picked) {
            showToast('AI Picked: ' + picked.icon + ' ' + picked.name + ' 🎲');
            playMoodStation(picked);
          }
        });
      }

      var btnSynthesize = $('btnSynthesizeMoods');
      if (btnSynthesize) {
        btnSynthesize.addEventListener('click', function () {
          synthesizeMoreMoods(10);
        });
      }

      var btnBottomSynthesize = $('btnSynthesizeMoreBottom');
      if (btnBottomSynthesize) {
        btnBottomSynthesize.addEventListener('click', function () {
          synthesizeMoreMoods(10);
        });
      }

      // Keyboard shortcuts: ESC to close, 'U' or 'O' to open Mood Universe
      window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
          closeModal();
          return;
        }
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 'u' || e.key === 'U') {
          e.preventDefault();
          if (modal && modal.classList.contains('open')) closeModal();
          else openModal();
        }
      });
    }

    var engine = {
      init: init,
      open: openModal,
      close: closeModal,
      playMoodStation: playMoodStation,
      renderGrid: renderGrid,
      synthesizeMoreMoods: synthesizeMoreMoods,
      stations: MOOD_STATIONS
    };
    if (typeof window !== 'undefined') {
      window.MoodUniverseEngine = engine;
    }
    return engine;
  })();

  /* ==================== 14.5. NOTHING (R) TACTILE HAPTIC ENGINE ==================== */
  var HapticEngine = (function () {
    var unlocked = false;
    var enabled = true;
    var audioCtx = null;

    function unlock() {
      if (unlocked) return;
      unlocked = true;
      try {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(1);
        }
      } catch (e) {}
    }

    if (typeof window !== 'undefined') {
      ['pointerdown', 'touchstart', 'click', 'keydown'].forEach(function (evt) {
        window.addEventListener(evt, unlock, { once: true, passive: true });
      });
    }

    function trigger(pattern) {
      if (!enabled) return;
      unlock();
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(pattern || 25);
        } catch (e) {}
      }
    }

    function tap() {
      trigger(22);
    }

    function beat() {
      trigger([32, 16, 26]);
    }

    function drop() {
      trigger([45, 20, 45, 20, 75]);
    }

    function test() {
      trigger([50, 30, 50, 30, 80]);
    }

    function toggle() {
      enabled = !enabled;
      if (enabled) test();
      return enabled;
    }

    function isEnabled() {
      return enabled;
    }

    return {
      unlock: unlock,
      trigger: trigger,
      tap: tap,
      beat: beat,
      drop: drop,
      test: test,
      toggle: toggle,
      isEnabled: isEnabled
    };
  })();
  if (typeof window !== 'undefined') window.HapticEngine = HapticEngine;

  /* ==================== 15. NOTHING (R) GLYPH DOT PLAY & MATRIX VISUALIZER ==================== */
  var GlyphMatrixEngine = {
    init: function () {},
    open: function () {},
    close: function () {},
    applyColorTheme: function () {}
  };
  if (typeof window !== 'undefined') window.GlyphMatrixEngine = GlyphMatrixEngine;

  function init() {
    try { loadStationsData(false); } catch (e) { console.error('Stations load error:', e); }
    try { renderLikedList(); } catch (e) { console.error('Liked list error:', e); }

    try { SpatialAudioEngine.init(); } catch (e) { console.error('Spatial audio init error:', e); }
    try { SleepTimerEngine.init(); } catch (e) { console.error('Sleep timer init error:', e); }
    try { DynamicIslandEngine.init(); } catch (e) { console.error('Dynamic island init error:', e); }
    try { JamRoomEngine.init(); } catch (e) { console.error('Jam room init error:', e); }
    try { ExtrasEngine.init(); } catch (e) { console.error('Extras init error:', e); }
    try { AuthEngine.init(); } catch (e) { console.error('Auth init error:', e); }
    try { MoodUniverseEngine.init(); } catch (e) { console.error('Mood universe init error:', e); }
    try { GlyphMatrixEngine.init(); } catch (e) { console.error('Glyph matrix init error:', e); }

    setTimeout(function () {
      show('s-ready');
    }, 400);

    loadApi().then(function () {
      var pA = new YT.Player('playerA', {
        width: '200', height: '200',
        playerVars: {
          playsinline: 1,
          controls: 0,
          disablekb: 1,
          rel: 0,
          iv_load_policy: 3
        },
        events: {
          onReady: function () {
            player = pA;
            window.__p = player;
            apiReady = true;
            show('s-ready');
            DualAudioEngine.init(pA, null);

            setTimeout(function () {
              var s = currentStation || stations[0];
              if (s) loadStationPlayback(s);
            }, 200);
          },
          onStateChange: onState,
          onError: onErr
        }
      });
    }).catch(function (err) {
      console.error('YT Player Load Error:', err);
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
    try { HapticEngine.tap(); } catch (e) {}
    if (!apiReady || !player) {
      init();
      return;
    }
    claimAudioMaster();
    hideAutoplayPrompt();
    if (isPlaying()) {
      desired = false;
      document.body.classList.remove('playing');
      try { player.pauseVideo(); } catch (e) {}
    } else {
      desired = true;
      document.body.classList.add('playing');
      try { player.playVideo(); } catch (e) {}
    }
    setTimeout(function() {
      if (typeof JamRoomEngine !== 'undefined') JamRoomEngine.broadcastState();
    }, 250);
  }

  /* ==================== UI Event Listeners ==================== */
  // Premium Left-Side Sidebar Toggle Logic
  if ($('premiumMenuToggle') && $('premiumSidebarMenu') && $('closeSidebarBtn')) {
    function openSidebar() {
      $('premiumSidebarMenu').classList.add('open');
      if ($('sidebarBackdrop')) $('sidebarBackdrop').classList.add('visible');

      // Sync profile info from AuthEngine
      try {
        var prof = AuthEngine.getProfile();
        if (prof && prof.loggedIn) {
          if ($('sidebarAvatarEmoji')) $('sidebarAvatarEmoji').textContent = prof.avatar || '👤';
          if ($('sidebarUserName')) $('sidebarUserName').textContent = prof.name || 'User';
          if ($('sidebarLoginLabel')) $('sidebarLoginLabel').textContent = 'View Profile';
        } else {
          if ($('sidebarAvatarEmoji')) $('sidebarAvatarEmoji').textContent = '👤';
          if ($('sidebarUserName')) $('sidebarUserName').textContent = 'Guest User';
          if ($('sidebarLoginLabel')) $('sidebarLoginLabel').textContent = 'Login / Sign Up';
        }
      } catch(e) {}
    }
    function closeSidebar() {
      $('premiumSidebarMenu').classList.remove('open');
      if ($('sidebarBackdrop')) $('sidebarBackdrop').classList.remove('visible');
    }

    $('premiumMenuToggle').addEventListener('click', function(e) {
      e.stopPropagation();
      openSidebar();
    });
    $('closeSidebarBtn').addEventListener('click', closeSidebar);
    if ($('sidebarBackdrop')) {
      $('sidebarBackdrop').addEventListener('click', closeSidebar);
    }
    // Close sidebar when clicking nav items
    ['extrasBtn', 'ytExplorerBtn', 'ambientToggleBtn', 'sidebarJamBtn'].forEach(function(id) {
      if ($(id)) {
        $(id).addEventListener('click', function() { closeSidebar(); });
      }
    });
    // Sidebar Login button → open Auth modal directly
    if ($('sidebarLoginBtn')) {
      $('sidebarLoginBtn').addEventListener('click', function() {
        closeSidebar();
        setTimeout(function() {
          if (typeof AuthEngine !== 'undefined') AuthEngine.open();
        }, 350); // wait for sidebar to close smoothly first
      });
    }
  }

  

  var _playBtn = $('play');
  if (_playBtn) _playBtn.addEventListener('click', togglePlay);
  var _prevBtn = $('prev');
  if (_prevBtn) _prevBtn.addEventListener('click', function () { skip('prev'); });
  var _nextBtn = $('next');
  if (_nextBtn) _nextBtn.addEventListener('click', function () { skip('next'); });
  var _fsbtn = $('fsbtn');
  if (_fsbtn) _fsbtn.addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', fsIcon);
  document.addEventListener('webkitfullscreenchange', fsIcon);
  var _retryBtn = $('retry');
  if (_retryBtn) _retryBtn.addEventListener('click', function () { init(); });

  var artEl = $('art');
  if (artEl) artEl.addEventListener('click', togglePlay);

  var stageVisual = document.querySelector('.stage-visual');
  if (stageVisual) stageVisual.addEventListener('click', togglePlay);

  var controlsDock = document.querySelector('.controls-glass');
  if (controlsDock) {
    controlsDock.addEventListener('mouseenter', function () {
      controlsDock.classList.add('is-expanded');
    });
    controlsDock.addEventListener('mouseleave', function () {
      controlsDock.classList.remove('is-expanded');
    });
    controlsDock.addEventListener('touchstart', function (e) {
      if (!e.target.closest('button')) {
        controlsDock.classList.toggle('is-expanded');
      }
    }, { passive: true });
  }

  var autoplayOverlay = $('autoplayOverlay');
  if (autoplayOverlay) {
    autoplayOverlay.addEventListener('click', function () {
      togglePlay();
    });
  }

  document.addEventListener('click', function (e) {
    if (!apiReady || !player) return;
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a') || e.target.closest('.modal-card') || e.target.closest('.lyrics-card') || e.target.closest('.command-palette-card')) return;
    if (!isPlaying() && desired) {
      try { player.playVideo(); } catch (err) {}
    }
  });

  var queueToggleBtn = $('queueToggleBtn');
  if (queueToggleBtn) {
    queueToggleBtn.addEventListener('click', function () {
      if ($('queuePanel')) {
        $('queuePanel').classList.toggle('open');
        if ($('queuePanel').classList.contains('open')) {
          renderSessionQueue();
          renderLikedList();
          generateRecommendations();
        }
      }
    });
  }

  var closeQueueBtn = $('closeQueueBtn');
  if (closeQueueBtn) {
    closeQueueBtn.addEventListener('click', function () {
      if ($('queuePanel')) $('queuePanel').classList.remove('open');
    });
  }

  // Progress Bar Seek
  var progressBar = $('progressBar');
  if (progressBar) {
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
  }

  // Volume Slider
  var volSlider = $('volSlider');
  var volBtn = $('volBtn');
  if (volSlider) {
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
  }

  if (volBtn) {
    volBtn.addEventListener('click', function () {
      if (!player || !apiReady) return;
      if (player.isMuted && player.isMuted()) {
        player.unMute();
        document.body.classList.remove('is-muted');
        if (volSlider) volSlider.value = player.getVolume() || 100;
      } else {
        player.mute();
        document.body.classList.add('is-muted');
        if (volSlider) volSlider.value = 0;
      }
    });
  }


  // Keyboard Shortcuts (Spotify & Apple Style)
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
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K') || e.key === '/') {
      e.preventDefault();
      CommandPalette.open();
    } else if (e.key === 'g' || e.key === 'G') {
      e.preventDefault();
      LrcGodEngine.toggle();
    } else if (e.key === 'l' || e.key === 'L') {
      e.preventDefault();
      LyricsEngine.open();
    } else if (e.key === 'x' || e.key === 'X') {
      e.preventDefault();
      ExtrasEngine.open();
    } else if (e.key === 'e' || e.key === 'E') {
      e.preventDefault();
      ExtrasEngine.openTab('tab-spatial');
    } else if (e.key === 't' || e.key === 'T') {
      e.preventDefault();
      ExtrasEngine.openTab('tab-timer');
    } else if (e.key === 'j' || e.key === 'J') {
      e.preventDefault();
      ExtrasEngine.openTab('tab-jam');
    } else if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      DynamicIslandEngine.toggle();
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      toggleFullscreen();
    } else if (e.key === 'q' || e.key === 'Q') {
      e.preventDefault();
      var _qp = $('queuePanel');
      if (_qp) { _qp.classList.toggle('open'); generateRecommendations(); }
    } else if (e.key === '?') {
      e.preventDefault();
      var _sm = $('shortcutsModal');
      if (_sm) _sm.classList.toggle('open');
    } else if (e.key === 'Escape') {
      LyricsEngine.close();
      CommandPalette.close();
      ExtrasEngine.close();
      AuthEngine.close();
    } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {

      e.preventDefault();
      window.location.href = 'admin.html';
    }

  });


  // Tab Visibility & Battery Preservation
  var isTabVisible = true;
  document.addEventListener('visibilitychange', function () {
    isTabVisible = !document.hidden;
  });

  // Elapsed vs Remaining Time Toggle
  var showRemainingTime = localStorage.getItem('aura_show_remaining_time') === 'true';
  var timeTotalEl = $('timeTotal');
  if (timeTotalEl) {
    timeTotalEl.addEventListener('click', function () {
      showRemainingTime = !showRemainingTime;
      localStorage.setItem('aura_show_remaining_time', showRemainingTime);
      showToast(showRemainingTime ? 'Displaying Remaining Time (-)' : 'Displaying Total Time');
    });
  }

  // High-Frequency Real-time Progress & Karaoke Sync Loop (250ms)
  // Cache DOM refs once to avoid repeated getElementById lookups
  var _timeCurrent = $('timeCurrent');
  var _timeTotal = $('timeTotal');
  var _progressFill = $('progressFill');
  var _progressHandle = $('progressHandle');
  var _jamBroadcastCounter = 0;

  setInterval(function () {
    if (!player || !apiReady || !isPlaying() || document.hidden) return;
    try {
      var cur = player.getCurrentTime ? player.getCurrentTime() : 0;
      var dur = player.getDuration ? player.getDuration() : 0;
      if (_timeCurrent) _timeCurrent.textContent = fmt(cur);
      if (_timeTotal) {
        _timeTotal.textContent = showRemainingTime ? ('-' + fmt(Math.max(0, dur - cur))) : fmt(dur);
      }
      if (dur > 0) {
        var pct = (cur / dur) * 100;
        if (_progressFill) _progressFill.style.width = pct + '%';
        if (_progressHandle) _progressHandle.style.left = pct + '%';
      }
      LyricsEngine.onTimeUpdate(cur);
      DualAudioEngine.checkCrossfade(cur, dur);
      // Only broadcast Jam state every 2.5 seconds AND only when a room is active
      _jamBroadcastCounter++;
      if (_jamBroadcastCounter >= 10 && JamRoomEngine.hasActiveRoom()) {
        _jamBroadcastCounter = 0;
        JamRoomEngine.broadcastState();
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



  /* ==================== Cache Buster & Hard Reset Engine ==================== */
  function purgeAuraCacheAndReset(interactive) {
    if (interactive) showToast('⚡ Purging all caches & reloading authentic playlists…');
    try {
      localStorage.removeItem('ishq_custom_stations');
      localStorage.removeItem('ishq_db_version');
      localStorage.removeItem('ishq_station_key');
      localStorage.removeItem('ishq_liked_songs');
      localStorage.removeItem('aura_liked_songs');
      sessionStorage.clear();
    } catch (e) {}

    if ('caches' in window) {
      caches.keys().then(function (names) {
        return Promise.all(names.map(function (n) { return caches.delete(n); }));
      }).then(function () {
        if (navigator.serviceWorker) {
          navigator.serviceWorker.getRegistrations().then(function (regs) {
            regs.forEach(function (r) { r.unregister(); });
            setTimeout(function () {
              window.location.href = window.location.origin + window.location.pathname + '?v=' + Date.now();
            }, 300);
          });
        } else {
          window.location.href = window.location.origin + window.location.pathname + '?v=' + Date.now();
        }
      }).catch(function () {
        window.location.reload(true);
      });
    } else {
      window.location.reload(true);
    }
  }
  window.purgeAuraCacheAndReset = purgeAuraCacheAndReset;

  if (window.location.search.includes('reset=1') || window.location.search.includes('clear=1') || window.location.search.includes('purge=1')) {
    purgeAuraCacheAndReset(false);
  }


  // Hero Section Surprise Me Button listener
  var heroSurpriseBtn = $('heroSurpriseBtn');
  if (heroSurpriseBtn) {
    heroSurpriseBtn.addEventListener('click', function () {
      try { HapticEngine.tap(); } catch (e) {}
      if (typeof MoodUniverseEngine !== 'undefined' && MoodUniverseEngine.stations && MoodUniverseEngine.stations.length) {
        var unplayed = MoodUniverseEngine.stations.slice().sort(function () { return 0.5 - Math.random(); });
        var picked = unplayed[0];
        if (picked) {
          showToast('AI Picked: ' + picked.icon + ' ' + picked.name + ' 🎲');
          MoodUniverseEngine.playMoodStation(picked);
        }
      } else {
        skip('next');
      }
    });
  }
