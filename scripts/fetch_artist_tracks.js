/**
 * fetch_artist_tracks.js
 * ========================
 * Scrapes YouTube search results for each artist (no API key needed).
 * Uses YouTube's embedded ytInitialData JSON from search result pages.
 * Writes output to: artist_tracks_catalog.js
 *
 * Usage: node scripts/fetch_artist_tracks.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ─── Artist definitions ───────────────────────────────────────────────────────
const ARTISTS = [
  { id: 'artist-arijit-singh',          query: 'Arijit Singh songs official',           maxTracks: 30 },
  { id: 'artist-shreya-ghoshal',        query: 'Shreya Ghoshal songs official',         maxTracks: 25 },
  { id: 'artist-ap-dhillon',            query: 'AP Dhillon songs official',              maxTracks: 25 },
  { id: 'artist-badshah',               query: 'Badshah songs official music video',     maxTracks: 25 },
  { id: 'artist-taylor-swift',          query: 'Taylor Swift official music video',      maxTracks: 25 },
  { id: 'artist-the-weeknd',            query: 'The Weeknd official music video',        maxTracks: 25 },
  { id: 'artist-diljit-dosanjh',        query: 'Diljit Dosanjh songs official',         maxTracks: 25 },
  { id: 'artist-atif-aslam',            query: 'Atif Aslam songs official',             maxTracks: 20 },
  { id: 'artist-kishore-kumar',         query: 'Kishore Kumar songs old Bollywood',     maxTracks: 20 },
  { id: 'artist-sidhu-moosewala',       query: 'Sidhu Moosewala songs official',        maxTracks: 20 },
  { id: 'artist-arman-malik',           query: 'Armaan Malik official songs',           maxTracks: 20 },
  { id: 'artist-kk',                    query: 'KK singer songs Bollywood official',    maxTracks: 20 },
  { id: 'artist-drake',                 query: 'Drake official music video',            maxTracks: 20 },
  { id: 'artist-lata-mangeshkar',       query: 'Lata Mangeshkar songs classic',        maxTracks: 20 },
  { id: 'artist-rahat-fateh-ali-khan',  query: 'Rahat Fateh Ali Khan songs official',  maxTracks: 20 },
  { id: 'artist-nucleya',               query: 'Nucleya songs official music',          maxTracks: 15 },
  { id: 'artist-neha-kakkar',           query: 'Neha Kakkar songs official',            maxTracks: 20 },
  { id: 'artist-arjun-kanungo',         query: 'Arjun Kanungo songs official',         maxTracks: 15 },
  { id: 'artist-punjabi-mc',            query: 'Guru Randhawa songs official',         maxTracks: 20 },
  { id: 'artist-ed-sheeran',            query: 'Ed Sheeran official music video',       maxTracks: 20 },
  { id: 'artist-billie-eilish',         query: 'Billie Eilish official music video',    maxTracks: 20 },
  { id: 'artist-vishal-shekhar',        query: 'Vishal Shekhar Bollywood songs',       maxTracks: 15 },
  { id: 'artist-imagine-dragons',       query: 'Imagine Dragons official music video',  maxTracks: 20 },
  { id: 'artist-a-r-rahman',            query: 'AR Rahman songs official',              maxTracks: 20 },
  { id: 'artist-yo-yo-honey-singh',     query: 'Yo Yo Honey Singh songs official',     maxTracks: 20 },
];

// ─── YouTube search scraper ───────────────────────────────────────────────────
function fetchYouTubeSearch(query) {
  return new Promise((resolve, reject) => {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%3D%3D`;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractVideoIds(html, maxTracks) {
  const videoIds = [];
  const seen = new Set();

  // Method 1: Extract from ytInitialData JSON
  const match = html.match(/var ytInitialData\s*=\s*(\{.+?\});\s*(?:var |<\/script>)/s);
  if (match) {
    try {
      const data = JSON.parse(match[1]);
      const contents =
        data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
             ?.sectionListRenderer?.contents ?? [];

      for (const section of contents) {
        const items = section?.itemSectionRenderer?.contents ?? [];
        for (const item of items) {
          const vid = item?.videoRenderer?.videoId;
          if (vid && !seen.has(vid)) {
            seen.add(vid);
            videoIds.push(vid);
            if (videoIds.length >= maxTracks) break;
          }
        }
        if (videoIds.length >= maxTracks) break;
      }
    } catch (e) {
      // JSON parse failed — fall through to regex method
    }
  }

  // Method 2: Regex fallback — extract all "videoId":"..." from page
  if (videoIds.length < 5) {
    const regex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
    let m;
    while ((m = regex.exec(html)) !== null) {
      const vid = m[1];
      if (!seen.has(vid)) {
        seen.add(vid);
        videoIds.push(vid);
        if (videoIds.length >= maxTracks) break;
      }
    }
  }

  return videoIds.slice(0, maxTracks);
}

// ─── Delay helper ─────────────────────────────────────────────────────────────
const delay = ms => new Promise(r => setTimeout(r, ms));

// ─── Main runner ─────────────────────────────────────────────────────────────
async function main() {
  const catalog = {};
  const errors = [];

  console.log('\n🎵 Aura Music — Artist Track Fetcher');
  console.log('=====================================');
  console.log(`Fetching tracks for ${ARTISTS.length} artists...\n`);

  for (let i = 0; i < ARTISTS.length; i++) {
    const artist = ARTISTS[i];
    process.stdout.write(`[${i + 1}/${ARTISTS.length}] ${artist.query}... `);

    try {
      const html = await fetchYouTubeSearch(artist.query);
      const ids = extractVideoIds(html, artist.maxTracks);

      if (ids.length === 0) {
        console.log('⚠️  No IDs found!');
        errors.push(artist.id);
        catalog[artist.id] = [];
      } else {
        console.log(`✅ ${ids.length} tracks`);
        catalog[artist.id] = ids;
      }
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
      errors.push(artist.id);
      catalog[artist.id] = [];
    }

    // Polite delay — avoid rate limiting (1.5–2.5 seconds between requests)
    if (i < ARTISTS.length - 1) {
      await delay(1500 + Math.random() * 1000);
    }
  }

  // ─── Write output ───────────────────────────────────────────────────────────
  const totalTracks = Object.values(catalog).reduce((sum, ids) => sum + ids.length, 0);

  const outputJs = `// ARTIST_TRACKS_CATALOG — Auto-generated by scripts/fetch_artist_tracks.js
// Generated: ${new Date().toISOString()}
// Total artists: ${ARTISTS.length} | Total tracks: ${totalTracks}
// DO NOT EDIT MANUALLY — regenerate with: node scripts/fetch_artist_tracks.js

var ARTIST_TRACKS_CATALOG = ${JSON.stringify(catalog, null, 2)};
`;

  const outPath = path.join(__dirname, '..', 'artist_tracks_catalog.js');
  fs.writeFileSync(outPath, outputJs, 'utf8');

  console.log('\n=====================================');
  console.log(`✅ Done! Total tracks fetched: ${totalTracks}`);
  console.log(`📁 Saved to: artist_tracks_catalog.js`);
  if (errors.length > 0) {
    console.log(`⚠️  Artists with 0 tracks: ${errors.join(', ')}`);
  }
  console.log('\nNext: Run `node scripts/apply_artist_catalog.js` to patch script.js\n');
}

main().catch(console.error);
