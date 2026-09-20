# 🚀 Aura Music Backend Server

Dedicated, high-performance Node.js / Express backend server for Aura Music.

## ✨ Features
- **YouTube Music API Proxy**: `/api/yt-music/*` for live search, browse, trending, artist discography, and playlists.
- **Synced Lyrics Engine**: `/api/lyrics` for timed LRC lyrics via LRCLIB.
- **Spotify Link Resolver**: `/api/spotify/resolve` for instant playback of Spotify URLs.
- **Unified Frontend & Backend**: Directly serves the built SvelteKit web player from `ui/build`.

## 🛠️ Run Locally
```bash
# Install dependencies
npm --prefix server install

# Start backend server (port 3000)
npm run server
```

## 🌐 1-Click Free Cloud Deployment (Render / Railway / Fly.io / Vercel)

### Deploy to Render:
1. Connect your repository `https://github.com/Awanish98/Aura-Music` to **[Render.com](https://render.com/)**.
2. Select **Web Service**.
3. Set **Build Command**: `npm run build && npm --prefix server install`
4. Set **Start Command**: `npm start`
5. Click **Deploy**! Your app will be live with full backend support!

### Deploy to Railway:
1. Connect repo on **[Railway.app](https://railway.app/)**.
2. Set root start command to `npm start`.
