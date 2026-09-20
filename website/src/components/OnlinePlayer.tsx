import { useState, useEffect, useRef } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  PlayIcon,
  Search01Icon
} from '@hugeicons/core-free-icons'

export interface Track {
  id: string
  title: string
  artist: string
  thumbnail: string
  duration: string
  videoId?: string
  streamUrl?: string
  category: string
}

const FEATURED_TRACKS: Track[] = [
  {
    id: 'lofi-girl',
    title: 'Lofi Hip Hop Radio - Beats to Relax/Study',
    artist: 'Lofi Girl',
    thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/maxresdefault.jpg',
    duration: 'LIVE',
    videoId: 'jfKfPfyJRdk',
    category: 'Lo-Fi & Chill'
  },
  {
    id: 'synthwave-radio',
    title: 'Synthwave Radio - Chill & Retro Beats',
    artist: 'Lofi Girl / Synthwave',
    thumbnail: 'https://i.ytimg.com/vi/4xDzrJKXOOY/maxresdefault.jpg',
    duration: 'LIVE',
    videoId: '4xDzrJKXOOY',
    category: 'Lo-Fi & Chill'
  },
  {
    id: 'soma-groovesalad',
    title: 'Groove Salad (Commercial-Free Chill)',
    artist: 'SomaFM Radio',
    thumbnail: 'https://somafm.com/img3/groovesalad400.jpg',
    duration: 'LIVE',
    streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
    category: 'Ambient & Radio'
  },
  {
    id: 'soma-dronezone',
    title: 'Drone Zone: Atmospheric Ambient Textures',
    artist: 'SomaFM Radio',
    thumbnail: 'https://somafm.com/img3/dronezone400.jpg',
    duration: 'LIVE',
    streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3',
    category: 'Ambient & Radio'
  },
  {
    id: 'starboy',
    title: 'Starboy (ft. Daft Punk)',
    artist: 'The Weeknd',
    thumbnail: 'https://i.ytimg.com/vi/34Na4j8AVgA/hqdefault.jpg',
    duration: '3:50',
    videoId: '34Na4j8AVgA',
    category: 'Global Hits'
  },
  {
    id: 'blinding-lights',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    thumbnail: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg',
    duration: '3:20',
    videoId: '4NRXx6U8ABQ',
    category: 'Global Hits'
  },
  {
    id: 'kesariya',
    title: 'Kesariya - Brahmāstra',
    artist: 'Arijit Singh, Pritam',
    thumbnail: 'https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg',
    duration: '4:28',
    videoId: 'BddP6PYo2gs',
    category: 'Bollywood & Hindi'
  },
  {
    id: 'tum-hi-ho',
    title: 'Tum Hi Ho - Aashiqui 2',
    artist: 'Arijit Singh, Mithoon',
    thumbnail: 'https://i.ytimg.com/vi/Umqb9KENgmk/hqdefault.jpg',
    duration: '4:22',
    videoId: 'Umqb9KENgmk',
    category: 'Bollywood & Hindi'
  },
  {
    id: 'nightwave-plaza',
    title: 'Nightwave Plaza - 24/7 Vaporwave',
    artist: 'Plaza One',
    thumbnail: 'https://plaza.one/img/logo.png',
    duration: 'LIVE',
    streamUrl: 'https://radio.plaza.one/mp3',
    category: 'Ambient & Radio'
  }
]

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void
    YT?: any
  }
}

export default function OnlinePlayer() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(85)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Track[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('All')

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const ytPlayerRef = useRef<any>(null)
  const progressIntervalRef = useRef<any>(null)

  // Initialize YouTube Player & Audio Element
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio()
      audio.preload = 'auto'
      audio.volume = volume / 100
      audio.addEventListener('play', () => setIsPlaying(true))
      audio.addEventListener('pause', () => setIsPlaying(false))
      audio.addEventListener('timeupdate', () => {
        if (audio.currentTime) setCurrentTime(audio.currentTime)
        if (audio.duration && !isNaN(audio.duration)) setDuration(audio.duration)
      })
      audio.addEventListener('ended', () => handleNext())
      audioRef.current = audio
    }

    // Embed hidden container for YouTube Iframe
    let container = document.getElementById('website-yt-player-container')
    if (!container) {
      container = document.createElement('div')
      container.id = 'website-yt-player-container'
      container.style.position = 'fixed'
      container.style.bottom = '-500px'
      container.style.left = '-500px'
      container.style.width = '100px'
      container.style.height = '100px'
      container.style.opacity = '0'
      container.style.pointerEvents = 'none'
      container.style.zIndex = '-999'
      document.body.appendChild(container)
    }

    const initYT = () => {
      if (!window.YT || !window.YT.Player) return
      try {
        ytPlayerRef.current = new window.YT.Player('website-yt-player-container', {
          height: '100',
          width: '100',
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1
          },
          events: {
            onReady: () => {
              try {
                ytPlayerRef.current.unMute()
                ytPlayerRef.current.setVolume(volume)
              } catch {}
            },
            onStateChange: (event: any) => {
              if (event.data === 1) {
                // Playing
                setIsPlaying(true)
                try {
                  const d = ytPlayerRef.current.getDuration()
                  if (d && !isNaN(d)) setDuration(d)
                } catch {}
              } else if (event.data === 2) {
                // Paused
                setIsPlaying(false)
              } else if (event.data === 0) {
                // Ended
                handleNext()
              }
            }
          }
        })
      } catch (e) {
        console.warn('YT Player init err:', e)
      }
    }

    if (window.YT && window.YT.Player) {
      initYT()
    } else {
      const prev = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        if (prev) prev()
        initYT()
      }
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(tag)
      }
    }

    // Progress polling interval
    progressIntervalRef.current = setInterval(() => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        try {
          const t = ytPlayerRef.current.getCurrentTime()
          const d = ytPlayerRef.current.getDuration()
          if (typeof t === 'number' && !isNaN(t)) setCurrentTime(t)
          if (typeof d === 'number' && !isNaN(d) && d > 0) setDuration(d)
        } catch {}
      }
    }, 500)

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }, [])

  const playTrack = (track: Track) => {
    setCurrentTrack(track)
    setCurrentTime(0)
    setDuration(0)

    // Direct MP3 Stream URL
    if (track.streamUrl) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
        try {
          ytPlayerRef.current.pauseVideo()
        } catch {}
      }
      if (audioRef.current) {
        audioRef.current.src = track.streamUrl
        audioRef.current.play().catch(console.warn)
      }
      setIsPlaying(true)
      return
    }

    // YouTube Stream
    if (audioRef.current) {
      audioRef.current.pause()
    }

    if (track.videoId && ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
      try {
        ytPlayerRef.current.unMute()
        ytPlayerRef.current.setVolume(volume)
        ytPlayerRef.current.loadVideoById({
          videoId: track.videoId,
          startSeconds: 0
        })
        ytPlayerRef.current.playVideo()
        setIsPlaying(true)
      } catch (e) {
        console.warn('YT play err:', e)
      }
    }
  }

  const togglePlay = () => {
    if (!currentTrack) {
      if (FEATURED_TRACKS.length > 0) playTrack(FEATURED_TRACKS[0])
      return
    }

    if (currentTrack.streamUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch(console.warn)
      }
    } else if (ytPlayerRef.current && typeof ytPlayerRef.current.getPlayerState === 'function') {
      try {
        if (isPlaying) {
          ytPlayerRef.current.pauseVideo()
        } else {
          ytPlayerRef.current.playVideo()
        }
      } catch {}
    }
  }

  const handleNext = () => {
    const list = searchResults.length > 0 ? searchResults : FEATURED_TRACKS
    if (!currentTrack) return
    const idx = list.findIndex((t) => t.id === currentTrack.id)
    if (idx !== -1 && idx < list.length - 1) {
      playTrack(list[idx + 1])
    } else if (list.length > 0) {
      playTrack(list[0])
    }
  }

  const handlePrev = () => {
    if (currentTime > 3) {
      handleSeek(0)
      return
    }
    const list = searchResults.length > 0 ? searchResults : FEATURED_TRACKS
    if (!currentTrack) return
    const idx = list.findIndex((t) => t.id === currentTrack.id)
    if (idx > 0) {
      playTrack(list[idx - 1])
    }
  }

  const handleSeek = (time: number) => {
    setCurrentTime(time)
    if (currentTrack?.streamUrl && audioRef.current) {
      audioRef.current.currentTime = time
    } else if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      try {
        ytPlayerRef.current.seekTo(time, true)
      } catch {}
    }
  }

  const handleVolumeChange = (vol: number) => {
    setVolume(vol)
    if (audioRef.current) audioRef.current.volume = vol / 100
    if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
      try {
        ytPlayerRef.current.setVolume(vol)
      } catch {}
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setIsSearching(true)

    try {
      // Search via public Invidious API
      const q = encodeURIComponent(searchQuery.trim())
      const urls = [
        `https://invidious.jing.rocks/api/v1/search?q=${q}&type=video`,
        `https://inv.nadeko.net/api/v1/search?q=${q}&type=video`
      ]

      let found = false
      for (const url of urls) {
        try {
          const res = await fetch(url)
          if (res.ok) {
            const data = await res.json()
            if (Array.isArray(data) && data.length > 0) {
              const mapped: Track[] = data.slice(0, 12).map((item: any) => ({
                id: item.videoId || Math.random().toString(),
                title: item.title,
                artist: item.author || 'Artist',
                thumbnail:
                  item.videoThumbnails?.[0]?.url ||
                  `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
                duration: item.lengthSeconds ? `${Math.floor(item.lengthSeconds / 60)}:${String(item.lengthSeconds % 60).padStart(2, '0')}` : '3:30',
                videoId: item.videoId,
                category: 'Search Result'
              }))
              setSearchResults(mapped)
              found = true
              break
            }
          }
        } catch {}
      }

      if (!found) {
        // Fallback filter from local catalog
        const filtered = FEATURED_TRACKS.filter(
          (t) =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.artist.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setSearchResults(filtered)
      }
    } catch {
      // Fallback
    } finally {
      setIsSearching(false)
    }
  }

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const categories = ['All', 'Lo-Fi & Chill', 'Ambient & Radio', 'Global Hits', 'Bollywood & Hindi']
  const displayTracks =
    searchResults.length > 0
      ? searchResults
      : activeCategory === 'All'
      ? FEATURED_TRACKS
      : FEATURED_TRACKS.filter((t) => t.category === activeCategory)

  return (
    <section id="online-player" className="relative mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
      {/* Mobile Notice Bar */}
      <div className="mb-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-primary-bright/30 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-4 sm:flex-row sm:p-5">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-bright text-white shadow-lg shadow-primary/30">
            📱
          </span>
          <div>
            <h4 className="font-heading font-semibold text-foreground">Using a Mobile Phone?</h4>
            <p className="text-xs text-muted-foreground">
              Aura Music has a dedicated full-screen Mobile Web App with Apple Music glow, gesture scrubber, and sleep timer.
            </p>
          </div>
        </div>
        <a
          href="./app/"
          className="flex shrink-0 items-center gap-2 rounded-full bg-primary-bright px-5 py-2 text-xs font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          <span>Open Mobile App (PWA)</span>
          <span>→</span>
        </a>
      </div>

      {/* Header */}
      <div className="text-center">
        <span className="rounded-full border border-primary-bright/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold tracking-widest text-primary-bright uppercase">
          Direct Online Streaming
        </span>
        <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Listen to Music Right Now on Web
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          No download required. Search any song or pick from curated live radios and hit play directly in your browser.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mx-auto mt-8 max-w-2xl">
        <div className="relative flex items-center">
          <HugeiconsIcon
            icon={Search01Icon}
            size={18}
            className="absolute left-4 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search any song, artist, album (e.g. Arijit Singh, Weeknd, Lo-Fi)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-white/15 bg-card/80 py-3.5 pr-28 pl-11 text-sm text-foreground shadow-xl backdrop-blur-md transition-all placeholder:text-muted-foreground focus:border-primary-bright focus:ring-2 focus:ring-primary-bright/20 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-2 rounded-full bg-primary-bright px-5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
        {searchResults.length > 0 && (
          <div className="mt-2 flex items-center justify-between px-2 text-xs text-muted-foreground">
            <span>Found {searchResults.length} search results</span>
            <button
              type="button"
              onClick={() => {
                setSearchResults([])
                setSearchQuery('')
              }}
              className="text-primary-bright hover:underline"
            >
              Clear Search
            </button>
          </div>
        )}
      </form>

      {/* Category Pills (Only when not in search mode) */}
      {searchResults.length === 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-primary-bright text-white shadow-md shadow-primary/30'
                  : 'border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Tracks Grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayTracks.map((track) => {
          const isThisPlaying = currentTrack?.id === track.id && isPlaying
          return (
            <div
              key={track.id}
              onClick={() => playTrack(track)}
              className={`group relative flex cursor-pointer items-center gap-3.5 rounded-xl border p-3 transition-all ${
                currentTrack?.id === track.id
                  ? 'border-primary-bright/60 bg-primary/10 shadow-lg shadow-primary/10'
                  : 'border-white/10 bg-card/60 hover:border-white/20 hover:bg-card/90'
              }`}
            >
              {/* Thumbnail */}
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-black/40">
                <img
                  src={track.thumbnail}
                  alt={track.title}
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div
                  className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${
                    isThisPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary-bright text-white shadow">
                    {isThisPlaying ? (
                      <span className="flex gap-0.5">
                        <span className="h-3 w-0.5 animate-pulse bg-white" />
                        <span className="h-4 w-0.5 animate-pulse bg-white" />
                        <span className="h-2 w-0.5 animate-pulse bg-white" />
                      </span>
                    ) : (
                      <HugeiconsIcon icon={PlayIcon} size={14} fill="currentColor" />
                    )}
                  </span>
                </div>
              </div>

              {/* Meta */}
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-semibold ${currentTrack?.id === track.id ? 'text-primary-bright' : 'text-foreground'}`}>
                  {track.title}
                </p>
                <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
                <span className="mt-1 inline-block text-[10px] text-muted-foreground/80">
                  {track.duration === 'LIVE' ? (
                    <span className="font-semibold text-red-400">🔴 LIVE STREAM</span>
                  ) : (
                    track.duration
                  )}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Floating Bottom Player Bar (Appears when music is playing) */}
      {currentTrack && (
        <div className="fixed inset-x-0 bottom-4 z-50 mx-auto max-w-3xl px-4">
          <div className="flex flex-col gap-2 rounded-2xl border border-white/20 bg-background/95 p-3 shadow-2xl backdrop-blur-xl sm:p-4">
            {/* Top Row: Track info & Controls */}
            <div className="flex items-center justify-between gap-3">
              {/* Info */}
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={currentTrack.thumbnail}
                  alt=""
                  className="size-11 shrink-0 rounded-lg object-cover shadow"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{currentTrack.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{currentTrack.artist}</p>
                </div>
              </div>

              {/* Main Play Controls */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handlePrev}
                  className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                  title="Previous"
                >
                  ⏮
                </button>
                <button
                  onClick={togglePlay}
                  className="flex size-10 items-center justify-center rounded-full bg-primary-bright text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <span>⏸</span>
                  ) : (
                    <HugeiconsIcon icon={PlayIcon} size={16} fill="currentColor" />
                  )}
                </button>
                <button
                  onClick={handleNext}
                  className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                  title="Next"
                >
                  ⏭
                </button>
              </div>

              {/* Volume Slider (Desktop) */}
              <div className="hidden items-center gap-2 sm:flex">
                <span className="text-xs text-muted-foreground">🔊</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="h-1.5 w-20 cursor-pointer accent-primary-bright"
                />
              </div>
            </div>

            {/* Bottom Scrubber (For non-live tracks) */}
            {currentTrack.duration !== 'LIVE' && duration > 0 && (
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => handleSeek(Number(e.target.value))}
                  className="h-1 flex-1 cursor-pointer accent-primary-bright"
                />
                <span>{formatTime(duration)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
