# इश्क़ — ISHQ Radio 2.0

An aesthetic, ambient lo-fi web radio station with real-time multi-device P2P synchronization and hidden YouTube background audio streaming.

## Features
- **YouTube Playlist Streaming**: Seamlessly streams tracks with custom minimal controls.
- **Dynamic Ambient Glow**: Extracts color from track artwork and bathes the background in a soothing, breathing gradient.
- **P2P Synchronization**: Real-time cross-device listening rooms powered by WebRTC (PeerJS).
- **Keyboard Shortcuts**:
  - `Space`: Play / Pause
  - `Arrow Right`: Next track
  - `Arrow Left`: Previous track
  - `F`: Toggle Fullscreen

## Running Locally

To serve the app locally with Python:
```bash
python -m http.server 8080
```
Then open `http://localhost:8080` in your browser.

## Customizing

- **Change Playlist**: In `script.js`, change `var PLAYLIST = 'YOUR_YOUTUBE_PLAYLIST_ID';`
- **Private Room**: Open `http://localhost:8080?room=my-private-room`
