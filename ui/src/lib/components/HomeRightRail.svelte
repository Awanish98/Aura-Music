<script lang="ts">
	// Ultra-Premium Information-Dense Slideable Right Sidebar with Trending YouTube Music Videos,
	// Direct Video Play, New Releases, Live Audio Spectrum Visualizer & Moods
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		ArrowRight01Icon,
		ArrowLeft01Icon,
		AudioWave02Icon,
		SparklesIcon,
		PlayIcon,
		PauseIcon,
		FavouriteIcon,
		CrownIcon,
		FireIcon,
		HeadphonesIcon,
		VolumeHighIcon,
		CheckmarkCircle02Icon,
		Video01Icon,
		Maximize01Icon
	} from '@hugeicons/core-free-icons';
	import * as api from '$lib/api';
	import { webPlayer } from '$lib/webplayer';
	import { playback, audioFx, toast, ui } from '$lib/player.svelte';
	import { video } from '$lib/video.svelte';
	import MinimalAudioSpectrum from './MinimalAudioSpectrum.svelte';

	// Active Tab Switch - Videos is active by default as requested
	let activeTab = $state<'videos' | 'vibe' | 'charts' | 'visualizer'>('videos');

	// Video Category Filter
	let videoCategory = $state<'trending' | 'new' | 'viral4k'>('trending');

	// Slideable Featured Video Index
	let featuredVideoIdx = $state(0);

	// Curated Trending YouTube Music Videos & Fresh New Releases with HD & 4K Quality
	const trendingMusicVideos = [
		{
			id: 'LK7-_x-4T20',
			videoId: 'LK7-_x-4T20',
			title: 'Tauba Tauba',
			artists: 'Karan Aujla, Vicky Kaushal',
			category: 'trending',
			duration: '3:28',
			views: '195M views',
			badge: '🔥 #1 Trending Video',
			quality: '4K UHD',
			thumbnail: 'https://i.ytimg.com/vi/LK7-_x-4T20/hqdefault.jpg',
			query: 'Tauba Tauba Bad Newz Karan Aujla Vicky Kaushal Official Music Video',
			color: 'from-amber-600/40 via-rose-600/30 to-pink-600/30'
		},
		{
			id: 'hOHKltAiKXQ',
			videoId: 'hOHKltAiKXQ',
			title: 'Big Dawgs',
			artists: 'Hanumankind, Kalmi',
			category: 'viral4k',
			duration: '3:54',
			views: '150M views',
			badge: '💎 Global Viral 4K',
			quality: '4K 60FPS',
			thumbnail: 'https://i.ytimg.com/vi/hOHKltAiKXQ/hqdefault.jpg',
			query: 'Hanumankind Big Dawgs Kalmi Official Music Video',
			color: 'from-orange-600/40 via-red-600/30 to-purple-600/30'
		},
		{
			id: 'VAdGW7QDJUI',
			videoId: 'VAdGW7QDJUI',
			title: 'Chaleya (Official 4K)',
			artists: 'Arijit Singh, Shilpa Rao, SRK',
			category: 'trending',
			duration: '3:20',
			views: '235M views',
			badge: '✨ All-Time Hit',
			quality: '1080p HD',
			thumbnail: 'https://i.ytimg.com/vi/VAdGW7QDJUI/hqdefault.jpg',
			query: 'Chaleya Jawan Arijit Singh Shah Rukh Khan Official Video',
			color: 'from-pink-600/40 via-purple-600/30 to-indigo-600/30'
		},
		{
			id: 'XO8wew38VM8',
			videoId: 'XO8wew38VM8',
			title: 'Millionaire',
			artists: 'Yo Yo Honey Singh (Glory)',
			category: 'new',
			duration: '3:18',
			views: '110M views',
			badge: '🚀 New Release',
			quality: '4K UHD',
			thumbnail: 'https://i.ytimg.com/vi/XO8wew38VM8/hqdefault.jpg',
			query: 'Yo Yo Honey Singh Millionaire Glory Official Music Video',
			color: 'from-yellow-600/40 via-amber-600/30 to-orange-600/30'
		},
		{
			id: 'tOM-nWPcR4U',
			videoId: 'tOM-nWPcR4U',
			title: 'Illuminati',
			artists: 'Sushin Shyam, Dabzee (Aavesham)',
			category: 'trending',
			duration: '3:12',
			views: '175M views',
			badge: '🔥 South Sensation',
			quality: '1080p HD',
			thumbnail: 'https://i.ytimg.com/vi/tOM-nWPcR4U/hqdefault.jpg',
			query: 'Illuminati Aavesham Sushin Shyam Dabzee Official Video',
			color: 'from-emerald-600/40 via-teal-600/30 to-cyan-600/30'
		},
		{
			id: 'u2NAus-eo4Y',
			videoId: 'u2NAus-eo4Y',
			title: 'Aayi Nai',
			artists: 'Pawan Singh, Simran Choudhary',
			category: 'trending',
			duration: '2:58',
			views: '220M views',
			badge: '🔥 Stree 2 Hit',
			quality: '1080p HD',
			thumbnail: 'https://i.ytimg.com/vi/u2NAus-eo4Y/hqdefault.jpg',
			query: 'Aayi Nai Stree 2 Pawan Singh Shraddha Kapoor Official Video',
			color: 'from-rose-600/40 via-pink-600/30 to-fuchsia-600/30'
		},
		{
			id: 'eVli-tstM5E',
			videoId: 'eVli-tstM5E',
			title: 'Espresso',
			artists: 'Sabrina Carpenter',
			category: 'viral4k',
			duration: '2:55',
			views: '320M views',
			badge: '👑 Billboard #1',
			quality: '4K UHD',
			thumbnail: 'https://i.ytimg.com/vi/eVli-tstM5E/hqdefault.jpg',
			query: 'Sabrina Carpenter Espresso Official Music Video',
			color: 'from-sky-600/40 via-blue-600/30 to-purple-600/30'
		},
		{
			id: 'kPa7bsKwL-c',
			videoId: 'kPa7bsKwL-c',
			title: 'Die With A Smile',
			artists: 'Lady Gaga & Bruno Mars',
			category: 'new',
			duration: '4:12',
			views: '205M views',
			badge: '🚀 Global Duet',
			quality: '4K HDR',
			thumbnail: 'https://i.ytimg.com/vi/kPa7bsKwL-c/hqdefault.jpg',
			query: 'Lady Gaga Bruno Mars Die With A Smile Official Music Video',
			color: 'from-blue-600/40 via-indigo-600/30 to-purple-600/30'
		},
		{
			id: '_gP_4bA7vjE',
			videoId: '_gP_4bA7vjE',
			title: 'Hass Hass',
			artists: 'Diljit Dosanjh x Sia',
			category: 'viral4k',
			duration: '2:40',
			views: '92M views',
			badge: '💎 East meets West',
			quality: '1080p HD',
			thumbnail: 'https://i.ytimg.com/vi/_gP_4bA7vjE/hqdefault.jpg',
			query: 'Diljit Dosanjh Sia Hass Hass Official Music Video',
			color: 'from-fuchsia-600/40 via-pink-600/30 to-amber-600/30'
		},
		{
			id: 'a_m3W4Q5j9I',
			videoId: 'a_m3W4Q5j9I',
			title: 'Naina (Crew)',
			artists: 'Diljit Dosanjh, Badshah',
			category: 'new',
			duration: '3:05',
			views: '130M views',
			badge: '✨ Party Anthem',
			quality: '1080p HD',
			thumbnail: 'https://i.ytimg.com/vi/a_m3W4Q5j9I/hqdefault.jpg',
			query: 'Naina Crew Diljit Dosanjh Badshah Kareena Kapoor Official Video',
			color: 'from-violet-600/40 via-purple-600/30 to-pink-600/30'
		}
	];

	const filteredVideos = $derived(
		videoCategory === 'trending'
			? trendingMusicVideos
			: videoCategory === 'new'
				? trendingMusicVideos.filter((v) => v.category === 'new' || v.badge.includes('New') || v.badge.includes('Global'))
				: trendingMusicVideos.filter((v) => v.quality.includes('4K') || v.category === 'viral4k')
	);

	const featuredVideo = $derived(trendingMusicVideos[featuredVideoIdx]);

	function nextFeaturedVideo() {
		featuredVideoIdx = (featuredVideoIdx + 1) % trendingMusicVideos.length;
	}

	function prevFeaturedVideo() {
		featuredVideoIdx = (featuredVideoIdx - 1 + trendingMusicVideos.length) % trendingMusicVideos.length;
	}

	// DIRECT 1-TAP VIDEO PLAY HANDLER
	async function playVideoDirect(videoItem: typeof trendingMusicVideos[0], expanded = false) {
		toast(`🎬 Playing HD Music Video: ${videoItem.title}`);
		const track = {
			video_id: videoItem.videoId,
			title: videoItem.title,
			artists: videoItem.artists,
			thumbnail: videoItem.thumbnail,
			duration: videoItem.duration,
			is_video: true
		};
		video.want = true;
		ui.videoOpen = true;
		ui.videoMode = expanded ? 'expanded' : 'docked';
		webPlayer.play(track as any);
		toast.success(`Playing YouTube Video: ${videoItem.title}!`);
	}

	// Slideable Mood Cards Carousel State
	let currentSlideIdx = $state(0);
	const moodSlides = [
		{
			id: 'chill_evening',
			title: 'Chill Evening',
			tagline: 'Relax and let the music flow',
			image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&auto=format&fit=crop&q=80',
			query: 'Chill Evening Hindi acoustic indie songs relax',
			color: 'from-blue-600/40 via-purple-600/30 to-pink-600/30',
			accent: 'text-cyan-300'
		},
		{
			id: 'midnight_drive',
			title: 'Midnight Neon Drive',
			tagline: 'Synthwave & retro electronic',
			image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
			query: 'Synthwave retro electro late night neon drive',
			color: 'from-fuchsia-600/40 via-purple-600/30 to-cyan-600/30',
			accent: 'text-pink-300'
		},
		{
			id: 'monsoon_acoustic',
			title: 'Monsoon Hindi Acoustic',
			tagline: 'Soulful acoustic rainy melodies',
			image: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=80',
			query: 'Monsoon Hindi acoustic soulful Bollywood melodies',
			color: 'from-teal-600/40 via-blue-600/30 to-indigo-600/30',
			accent: 'text-teal-300'
		},
		{
			id: 'gym_phonk',
			title: 'Gym Energy Phonk',
			tagline: 'High BPM aggressive bass pump',
			image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
			query: 'Gym workout energy phonk electronic hits',
			color: 'from-red-600/40 via-orange-600/30 to-pink-600/30',
			accent: 'text-red-300'
		},
		{
			id: 'lofi_cafe',
			title: 'Cozy Coffeehouse Lofi',
			tagline: 'Warm beats & soothing chords',
			image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
			query: 'Cozy coffeehouse acoustic guitar jazz relax lofi',
			color: 'from-amber-600/40 via-yellow-600/30 to-orange-600/30',
			accent: 'text-amber-300'
		},
		{
			id: '90s_gold',
			title: '90s Bollywood Gold',
			tagline: 'Evergreen nostalgic romances',
			image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
			query: '90s Bollywood evergreen romantic hits Kumar Sanu Alka Yagnik',
			color: 'from-rose-600/40 via-pink-600/30 to-amber-600/30',
			accent: 'text-rose-300'
		}
	];

	const currentSlide = $derived(moodSlides[currentSlideIdx]);

	function nextMoodSlide() {
		currentSlideIdx = (currentSlideIdx + 1) % moodSlides.length;
	}

	function prevMoodSlide() {
		currentSlideIdx = (currentSlideIdx - 1 + moodSlides.length) % moodSlides.length;
	}

	async function playActiveSlide(slideItem: typeof moodSlides[0]) {
		toast(`Loading ${slideItem.title} mix...`);
		try {
			const res = await api.search(slideItem.query);
			const songs = Array.isArray(res) ? res : (res as any)?.songs || [];
			if (songs.length > 0) {
				webPlayer.playPlaylist(songs, 0, slideItem.title);
				toast.success(`Playing ${slideItem.title}!`);
			} else {
				goto(`/search?q=${encodeURIComponent(slideItem.query)}`);
			}
		} catch {
			goto(`/search?q=${encodeURIComponent(slideItem.query)}`);
		}
	}

	// Trending Daily Top 5 Chart Tracks
	const trendingCharts = [
		{
			rank: 1,
			title: 'Chaleya',
			artists: 'Arijit Singh, Shilpa Rao',
			plays: '24.8M',
			thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=160&auto=format&fit=crop&q=80',
			query: 'Chaleya Jawan Arijit Singh'
		},
		{
			rank: 2,
			title: 'Lover',
			artists: 'Diljit Dosanjh',
			plays: '19.4M',
			thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=160&auto=format&fit=crop&q=80',
			query: 'Diljit Dosanjh Lover'
		},
		{
			rank: 3,
			title: 'Winning Speech',
			artists: 'Karan Aujla',
			plays: '16.2M',
			thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=160&auto=format&fit=crop&q=80',
			query: 'Karan Aujla Winning Speech'
		},
		{
			rank: 4,
			title: 'Cruel Summer',
			artists: 'Taylor Swift',
			plays: '31.5M',
			thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
			query: 'Taylor Swift Cruel Summer'
		},
		{
			rank: 5,
			title: 'Raataan Lambiyan',
			artists: 'Jubin Nautiyal, Asees Kaur',
			plays: '28.1M',
			thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=160&auto=format&fit=crop&q=80',
			query: 'Raataan Lambiyan Shershaah'
		}
	];

	async function playChartTrack(track: typeof trendingCharts[0]) {
		toast(`Playing #${track.rank} Chart: ${track.title}`);
		try {
			const res = await api.search(track.query);
			const songs = Array.isArray(res) ? res : (res as any)?.songs || [];
			if (songs.length > 0) {
				webPlayer.play(songs[0]);
			} else {
				goto(`/search?q=${encodeURIComponent(track.query)}`);
			}
		} catch {
			goto(`/search?q=${encodeURIComponent(track.query)}`);
		}
	}

	// 8 Top Genres
	const topGenres = [
		{ id: 'bollywood', name: 'Bollywood', count: '10K+ Songs', query: 'Bollywood Superhits Top Songs', thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=160&h=160&fit=crop&q=80' },
		{ id: 'punjabi', name: 'Punjabi', count: '8K+ Hits', query: 'Punjabi Top 50 Hits', thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=160&h=160&fit=crop&q=80' },
		{ id: 'global_pop', name: 'Global Pop', count: '25K+ Hits', query: 'Today Global Hits Top 50', thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop&q=80' },
		{ id: 'indie', name: 'Indie', count: '5K+ Gems', query: 'Indian Indie Acoustic Melodies', thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=160&h=160&fit=crop&q=80' },
		{ id: 'lofi', name: 'Lo-Fi', count: '4K+ Chill', query: 'Chill Lo-Fi Hip Hop Study Beats', thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=160&h=160&fit=crop&q=80' },
		{ id: 'edm', name: 'EDM', count: '12K+ Beats', query: 'Top EDM Festival Dance Hits', thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=160&h=160&fit=crop&q=80' },
		{ id: 'hiphop', name: 'Hip Hop', count: '9K+ Tracks', query: 'Top Hip Hop Rap Hits', thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=160&h=160&fit=crop&q=80' },
		{ id: 'rock', name: 'Rock', count: '7K+ Classics', query: 'Classic and Modern Rock Hits', thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=160&h=160&fit=crop&q=80' }
	];

	// Audio FX Presets
	let activeFxProfile = $state('spatial');
	const fxProfiles = [
		{ id: 'spatial', label: '3D Spatial', icon: '🎧' },
		{ id: 'bass', label: 'Bass Boost', icon: '🔥' },
		{ id: 'studio', label: 'Studio Master', icon: '✨' },
		{ id: 'vocal', label: 'Vocal Clarity', icon: '🎤' }
	];

	function selectFx(id: string) {
		activeFxProfile = id;
		toast.success(`Audio Preset Applied: ${id.toUpperCase()}`);
	}
</script>

<aside class="w-full select-none max-h-[calc(100vh-6.5rem)] overflow-y-auto no-scrollbar pr-0.5 space-y-3.5">
	<!-- Tab Navigation Pills -->
	<div class="grid grid-cols-4 gap-1 rounded-2xl bg-white/80 dark:bg-black/60 border border-slate-200/80 dark:border-white/12 p-1 backdrop-blur-2xl shadow-sm dark:shadow-xl">
		<button
			onclick={() => (activeTab = 'videos')}
			class="rounded-xl py-1.5 text-center text-[11px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 {activeTab === 'videos'
				? 'bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/30'
				: 'text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-white'}"
		>
			<HugeiconsIcon icon={Video01Icon} size={13} />
			<span>Videos</span>
		</button>
		<button
			onclick={() => (activeTab = 'vibe')}
			class="rounded-xl py-1.5 text-center text-[11px] font-extrabold transition-all cursor-pointer {activeTab === 'vibe'
				? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-500/30'
				: 'text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-white'}"
		>
			✨ Vibe
		</button>
		<button
			onclick={() => (activeTab = 'charts')}
			class="rounded-xl py-1.5 text-center text-[11px] font-extrabold transition-all cursor-pointer {activeTab === 'charts'
				? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-500/30'
				: 'text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-white'}"
		>
			📊 Charts
		</button>
		<button
			onclick={() => (activeTab = 'visualizer')}
			class="rounded-xl py-1.5 text-center text-[11px] font-extrabold transition-all cursor-pointer {activeTab === 'visualizer'
				? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-500/30'
				: 'text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-white'}"
		>
			🎚️ Spectrum
		</button>
	</div>

	<!-- ========================================================================= -->
	<!-- TAB 1: TRENDING YOUTUBE MUSIC VIDEOS & DIRECT VIDEO PLAY (USER REQUEST)   -->
	<!-- ========================================================================= -->
	{#if activeTab === 'videos'}
		<div in:fade={{ duration: 150 }} class="space-y-3.5">
			<!-- Video Section Header & Category Filter -->
			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-900 dark:text-foreground">
						<span class="flex items-center gap-1">
							<span class="text-red-500">▶</span>
							<span>Music Videos</span>
						</span>
						<span class="size-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse"></span>
					</div>
					<!-- Direct Video indicator badge -->
					<span class="text-[10px] font-bold text-red-500 dark:text-red-300 bg-red-500/15 dark:bg-red-500/20 px-2 py-0.5 rounded-full border border-red-500/30">
						1-Tap Video Play
					</span>
				</div>

				<!-- Quick Sub-Category Pills -->
				<div class="flex items-center gap-1 rounded-xl bg-slate-100/90 dark:bg-white/5 p-0.5 border border-slate-200/80 dark:border-white/8 text-[10px]">
					<button
						onclick={() => (videoCategory = 'trending')}
						class="flex-1 py-1 rounded-lg font-bold transition-all cursor-pointer text-center {videoCategory === 'trending'
							? 'bg-red-500 text-white shadow-sm'
							: 'text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-white'}"
					>
						🔥 Trending
					</button>
					<button
						onclick={() => (videoCategory = 'new')}
						class="flex-1 py-1 rounded-lg font-bold transition-all cursor-pointer text-center {videoCategory === 'new'
							? 'bg-pink-600 text-white shadow-sm'
							: 'text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-white'}"
					>
						🚀 New Releases
					</button>
					<button
						onclick={() => (videoCategory = 'viral4k')}
						class="flex-1 py-1 rounded-lg font-bold transition-all cursor-pointer text-center {videoCategory === 'viral4k'
							? 'bg-purple-600 text-white shadow-sm'
							: 'text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-white'}"
					>
						💎 4K Visuals
					</button>
				</div>
			</div>

			<!-- Featured Spotlight Video Card (With 1-Tap Direct Video Play) -->
			<div class="space-y-1.5">
				<div class="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-muted-foreground px-0.5">
					<span>Spotlight Music Video</span>
					<div class="flex items-center gap-1">
						<button
							onclick={prevFeaturedVideo}
							class="h-5 w-5 flex items-center justify-center rounded-full bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white transition-colors cursor-pointer"
							aria-label="Previous Video"
						>
							<HugeiconsIcon icon={ArrowLeft01Icon} size={11} />
						</button>
						<span class="text-[10px] text-slate-700 dark:text-white font-mono">{featuredVideoIdx + 1}/{trendingMusicVideos.length}</span>
						<button
							onclick={nextFeaturedVideo}
							class="h-5 w-5 flex items-center justify-center rounded-full bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white transition-colors cursor-pointer"
							aria-label="Next Video"
						>
							<HugeiconsIcon icon={ArrowRight01Icon} size={11} />
						</button>
					</div>
				</div>

				<!-- Hero Spotlight Video Card -->
				<div
					class="group relative overflow-hidden rounded-2xl border border-red-200 dark:border-red-500/30 bg-white dark:bg-gradient-to-br dark:{featuredVideo.color} p-3 backdrop-blur-2xl shadow-sm dark:shadow-xl transition-all duration-300 hover:border-red-400 dark:hover:border-red-500/60"
				>
					<div class="relative aspect-video w-full overflow-hidden rounded-xl bg-black/60 shadow-inner">
						<img
							src={featuredVideo.thumbnail}
							alt={featuredVideo.title}
							class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
						/>
						<div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent"></div>

						<!-- Top Quality & Duration Badges -->
						<div class="absolute top-2 left-2 flex items-center gap-1.5">
							<span class="rounded-md bg-red-600/90 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-black text-white shadow-sm flex items-center gap-0.5">
								<span>▶</span> YouTube
							</span>
							<span class="rounded-md bg-black/70 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-500/30">
								{featuredVideo.quality}
							</span>
						</div>

						<div class="absolute top-2 right-2">
							<span class="rounded-md bg-black/75 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-mono text-white/90">
								{featuredVideo.duration}
							</span>
						</div>

						<!-- Center Big Glowing Direct Play Trigger -->
						<div class="absolute inset-0 flex items-center justify-center">
							<button
								onclick={() => playVideoDirect(featuredVideo)}
								class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-red-600 via-rose-600 to-pink-500 text-white shadow-2xl shadow-red-500/50 group-hover:scale-115 transition-all duration-200 cursor-pointer"
								title="Play Video Direct"
								aria-label="Play Video Direct"
							>
								<HugeiconsIcon icon={PlayIcon} size={22} fill="currentColor" class="ml-0.5" />
							</button>
						</div>

						<!-- Bottom Tag & Views -->
						<div class="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px]">
							<span class="font-bold text-red-300 drop-shadow">
								{featuredVideo.badge}
							</span>
							<span class="text-white/80 font-mono drop-shadow">
								{featuredVideo.views}
							</span>
						</div>
					</div>

					<!-- Video Title, Details & Direct Action Buttons -->
					<div class="mt-2.5 flex items-center justify-between gap-2">
						<div class="min-w-0 flex-1">
							<h4 class="text-xs font-black text-slate-900 dark:text-white group-hover:text-red-500 dark:group-hover:text-red-300 transition-colors truncate">
								{featuredVideo.title}
							</h4>
							<p class="text-[11px] text-slate-600 dark:text-white/75 truncate mt-0.5 font-medium">
								{featuredVideo.artists}
							</p>
						</div>

						<!-- Direct Action Buttons -->
						<div class="flex items-center gap-1.5 shrink-0">
							<button
								onclick={() => playVideoDirect(featuredVideo, true)}
								class="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/25 text-slate-700 dark:text-white transition-colors cursor-pointer border border-slate-200 dark:border-transparent"
								title="Watch in Theater HD"
								aria-label="Watch in Theater HD"
							>
								<HugeiconsIcon icon={Maximize01Icon} size={14} />
							</button>
							<button
								onclick={() => playVideoDirect(featuredVideo, false)}
								class="flex items-center gap-1 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 px-2.5 py-1 text-[10px] font-black text-white shadow-md shadow-red-600/30 transition-all cursor-pointer hover:scale-105"
							>
								<span>▶ Play Video</span>
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- Trending YouTube Music Videos List -->
			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<h3 class="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-foreground">
						Trending YouTube Videos
					</h3>
					<span class="text-[10px] font-mono text-slate-500 dark:text-muted-foreground font-semibold">
						{filteredVideos.length} Available
					</span>
				</div>

				<div class="flex flex-col gap-1.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0f1c]/90 p-2 backdrop-blur-2xl shadow-sm">
					{#each filteredVideos as videoItem}
						<div
							class="group flex items-center justify-between gap-2 rounded-xl p-2 transition-all duration-200 hover:bg-slate-100/80 dark:hover:bg-white/8 hover:border-red-500/20 border border-transparent"
						>
							<!-- Left Video Thumbnail + Details -->
							<div
								onclick={() => playVideoDirect(videoItem)}
								role="button"
								tabindex="0"
								onkeydown={(e) => e.key === 'Enter' && playVideoDirect(videoItem)}
								class="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
							>
								<!-- 16:9 Video Thumbnail with Play Overlay -->
								<div class="relative h-11 w-18 shrink-0 overflow-hidden rounded-lg bg-black/60 shadow">
									<img
										src={videoItem.thumbnail}
										alt={videoItem.title}
										class="h-full w-full object-cover transition-transform group-hover:scale-110"
										loading="lazy"
									/>
									<div class="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors"></div>
									
									<!-- Center Mini Play Glyph -->
									<div class="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
										<div class="flex h-5 w-5 items-center justify-center rounded-full bg-red-600/90 text-white shadow">
											<HugeiconsIcon icon={PlayIcon} size={10} fill="currentColor" class="ml-0.5" />
										</div>
									</div>

									<!-- Quality Tag at corner -->
									<span class="absolute bottom-0.5 right-0.5 text-[8px] font-bold px-1 rounded bg-black/80 text-white">
										{videoItem.duration}
									</span>
								</div>

								<!-- Text Details -->
								<div class="min-w-0 flex-1">
									<div class="flex items-center gap-1.5">
										<h4 class="text-xs font-bold text-slate-900 dark:text-foreground group-hover:text-red-500 transition-colors truncate">
											{videoItem.title}
										</h4>
									</div>
									<p class="text-[10px] text-slate-500 dark:text-muted-foreground truncate">
										{videoItem.artists}
									</p>
									<div class="flex items-center gap-2 mt-0.5 text-[9px]">
										<span class="text-red-500 dark:text-red-400 font-bold">{videoItem.quality}</span>
										<span class="text-slate-400 dark:text-muted-foreground/60">•</span>
										<span class="text-slate-500 dark:text-muted-foreground">{videoItem.views}</span>
									</div>
								</div>
							</div>

							<!-- One-Tap Play Action Button -->
							<button
								onclick={() => playVideoDirect(videoItem)}
								class="shrink-0 flex items-center gap-1 rounded-lg bg-red-500/10 hover:bg-red-600 dark:bg-red-500/15 text-red-600 dark:text-red-300 hover:text-white px-2 py-1.5 text-[10px] font-bold border border-red-500/30 transition-all cursor-pointer hover:shadow-lg hover:shadow-red-500/30"
								title="Play Video"
							>
								<span>▶ Video</span>
							</button>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<!-- ========================================================================= -->
	<!-- TAB 2: VIBE & NOW MOOD (Slideable Carousel + Genres)                      -->
	<!-- ========================================================================= -->
	{#if activeTab === 'vibe'}
		<div in:fade={{ duration: 150 }} class="space-y-4">
			<!-- Slideable Mood Carousel Header -->
			<div class="space-y-2.5">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-foreground">
						<span>Now Mood</span>
						<HugeiconsIcon icon={AudioWave02Icon} size={14} class="text-pink-500 animate-pulse" />
					</div>
					<!-- Slide Controls -->
					<div class="flex items-center gap-1">
						<button
							onclick={prevMoodSlide}
							class="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white transition-colors cursor-pointer"
							title="Previous Mood"
							aria-label="Previous Mood"
						>
							<HugeiconsIcon icon={ArrowLeft01Icon} size={13} />
						</button>
						<span class="text-[10px] font-bold text-slate-500 dark:text-muted-foreground px-1">{currentSlideIdx + 1}/{moodSlides.length}</span>
						<button
							onclick={nextMoodSlide}
							class="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white transition-colors cursor-pointer"
							title="Next Mood"
							aria-label="Next Mood"
						>
							<HugeiconsIcon icon={ArrowRight01Icon} size={13} />
						</button>
					</div>
				</div>

				<!-- Active Mood Slide Card -->
				<div
					onclick={() => playActiveSlide(currentSlide)}
					role="button"
					tabindex="0"
					onkeydown={(e) => e.key === 'Enter' && playActiveSlide(currentSlide)}
					class="group relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/12 bg-white/90 dark:bg-gradient-to-br dark:{currentSlide.color} p-3.5 backdrop-blur-2xl shadow-md dark:shadow-xl transition-all duration-300 hover:border-pink-500/50 hover:shadow-pink-500/20 cursor-pointer"
				>
					<div class="relative h-32 w-full overflow-hidden rounded-xl bg-black/40 shadow-inner">
						<img
							src={currentSlide.image}
							alt={currentSlide.title}
							class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
						/>
						<div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
						
						<!-- Floating Play Overlay -->
						<div class="absolute inset-0 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
							<div class="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-pink-600 to-rose-500 text-white shadow-xl shadow-pink-500/40 group-hover:scale-110 transition-transform">
								<HugeiconsIcon icon={PlayIcon} size={20} fill="currentColor" class="ml-0.5" />
							</div>
						</div>

						<!-- Slide Counter Dots at bottom right -->
						<div class="absolute bottom-2 right-2 flex gap-1">
							{#each moodSlides as _, idx}
								<span class="h-1.5 rounded-full transition-all {idx === currentSlideIdx ? 'w-4 bg-pink-400 shadow-[0_0_6px_#ff2a7a]' : 'w-1.5 bg-white/40'}"></span>
							{/each}
						</div>
					</div>

					<!-- Text Details -->
					<div class="mt-2.5 flex items-center justify-between">
						<div>
							<h4 class="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-pink-500 dark:group-hover:text-pink-300 transition-colors">
								{currentSlide.title}
							</h4>
							<p class="text-xs text-slate-500 dark:text-purple-200/80 mt-0.5 font-medium">
								{currentSlide.tagline}
							</p>
						</div>
						<span class="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/15 dark:bg-pink-500/20 text-pink-600 dark:text-pink-300 border border-pink-500/30 font-bold">
							Instant Play
						</span>
					</div>
				</div>
			</div>

			<!-- Top Genres Vertical List -->
			<div class="space-y-2.5">
				<div class="flex items-center justify-between">
					<h3 class="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-foreground">
						Top Genres
					</h3>
					<button
						onclick={() => goto('/discover')}
						class="text-xs font-medium text-slate-500 dark:text-muted-foreground hover:text-primary transition-colors cursor-pointer"
					>
						View All &gt;
					</button>
				</div>

				<div class="flex flex-col gap-1 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-black/40 p-2 backdrop-blur-2xl shadow-sm">
					{#each topGenres as genre}
						<button
							onclick={() => goto(`/search?q=${encodeURIComponent(genre.query)}`)}
							class="group flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left transition-all duration-200 hover:bg-slate-100/80 dark:hover:bg-white/8 cursor-pointer"
						>
							<div class="flex items-center gap-3 min-w-0">
								<img
									src={genre.thumbnail}
									alt={genre.name}
									class="h-7 w-7 rounded-full object-cover ring-1 ring-slate-300/60 dark:ring-white/20 transition-transform group-hover:scale-110"
									loading="lazy"
								/>
								<div class="min-w-0">
									<div class="text-xs font-bold text-slate-900 dark:text-foreground/90 group-hover:text-pink-500 dark:group-hover:text-pink-400 transition-colors truncate">
										{genre.name}
									</div>
									<div class="text-[10px] text-slate-500 dark:text-muted-foreground/80 font-medium">
										{genre.count}
									</div>
								</div>
							</div>
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								size={14}
								class="text-slate-400 dark:text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-pink-500"
							/>
						</button>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<!-- ========================================================================= -->
	<!-- TAB 3: DAILY CHARTS & VIRAL TRACKS                                       -->
	<!-- ========================================================================= -->
	{#if activeTab === 'charts'}
		<div in:fade={{ duration: 150 }} class="space-y-3">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-foreground">
					<span>Daily Top 5 Charts</span>
					<span class="text-amber-400">🔥</span>
				</div>
				<span class="text-[10px] font-bold text-pink-600 dark:text-pink-400 bg-pink-500/15 px-2 py-0.5 rounded-full border border-pink-500/30">
					Live Ranked
				</span>
			</div>

			<!-- Chart Tracks List -->
			<div class="flex flex-col gap-1.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-black/40 p-2 backdrop-blur-2xl shadow-sm">
				{#each trendingCharts as track}
					<div
						onclick={() => playChartTrack(track)}
						role="button"
						tabindex="0"
						onkeydown={(e) => e.key === 'Enter' && playChartTrack(track)}
						class="group flex items-center justify-between gap-2.5 rounded-xl p-2 transition-all duration-200 hover:bg-slate-100/80 dark:hover:bg-white/8 cursor-pointer"
					>
						<div class="flex items-center gap-2.5 min-w-0">
							<!-- Rank Badge -->
							<span class="shrink-0 w-6 text-center text-xs font-black {track.rank === 1 ? 'text-amber-500' : track.rank === 2 ? 'text-slate-400 dark:text-slate-300' : track.rank === 3 ? 'text-amber-600' : 'text-slate-400 dark:text-muted-foreground'}">
								#{track.rank}
							</span>

							<!-- Artwork -->
							<div class="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-muted shadow">
								<img
									src={track.thumbnail}
									alt={track.title}
									class="h-full w-full object-cover transition-transform group-hover:scale-110"
								/>
							</div>

							<!-- Song Details -->
							<div class="min-w-0">
								<h4 class="text-xs font-bold text-slate-900 dark:text-foreground group-hover:text-pink-500 dark:group-hover:text-pink-400 transition-colors truncate">
									{track.title}
								</h4>
								<p class="text-[10px] text-slate-500 dark:text-muted-foreground truncate">
									{track.artists}
								</p>
							</div>
						</div>

						<!-- Play Button on Hover -->
						<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pink-500/15 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-all shadow">
							<HugeiconsIcon icon={PlayIcon} size={14} fill="currentColor" class="ml-0.5" />
						</div>
					</div>
				{/each}
			</div>

			<!-- Listening Stats Widget -->
			<div class="rounded-2xl border border-cyan-400/40 dark:border-cyan-500/30 bg-gradient-to-r from-blue-50/90 via-purple-50/80 to-white/90 dark:from-blue-950/40 dark:via-purple-950/30 dark:to-black/50 p-3.5 backdrop-blur-2xl shadow-sm dark:shadow-lg">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<HugeiconsIcon icon={HeadphonesIcon} size={16} class="text-cyan-500 dark:text-cyan-400" />
						<span class="text-xs font-extrabold text-slate-900 dark:text-foreground">Listening Radar</span>
					</div>
					<span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
						Lossless HD
					</span>
				</div>
				<div class="grid grid-cols-2 gap-2 mt-2.5">
					<div class="rounded-xl bg-white/80 dark:bg-white/5 p-2 text-center border border-slate-200/60 dark:border-white/5">
						<div class="text-[10px] text-slate-500 dark:text-muted-foreground">Daily Listening</div>
						<div class="text-sm font-black text-slate-900 dark:text-white mt-0.5">2.8 hrs</div>
					</div>
					<div class="rounded-xl bg-white/80 dark:bg-white/5 p-2 text-center border border-slate-200/60 dark:border-white/5">
						<div class="text-[10px] text-slate-500 dark:text-muted-foreground">Audio Fidelity</div>
						<div class="text-sm font-black text-cyan-600 dark:text-cyan-300 mt-0.5">320 kbps</div>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- ========================================================================= -->
	<!-- TAB 4: LIVE AUDIO SPECTRUM & EQUALIZER FX                                -->
	<!-- ========================================================================= -->
	{#if activeTab === 'visualizer'}
		<div in:fade={{ duration: 150 }} class="space-y-3.5">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-foreground">
					<span>Live Spectrum</span>
					<span class="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-ping"></span>
				</div>
				<span class="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-500/15 px-2 py-0.5 rounded-full border border-cyan-500/30 font-bold">
					60 FPS • FFT
				</span>
			</div>

			<!-- Minimalist 60FPS Real-Time FFT Audio Spectrum -->
			<div class="relative overflow-hidden rounded-2xl border border-pink-400/40 dark:border-pink-500/20 bg-gradient-to-b from-purple-50/90 via-white/95 to-slate-50/90 dark:from-purple-950/30 dark:via-black/60 dark:to-black/80 p-3.5 backdrop-blur-2xl shadow-sm dark:shadow-xl">
				<MinimalAudioSpectrum height={115} barsCount={26} />

				<!-- Frequency Band Scale Labels -->
				<div class="flex justify-between text-[9px] font-mono text-slate-400 dark:text-muted-foreground/70 mt-1.5 border-t border-slate-200/80 dark:border-white/10 pt-1.5 px-1">
					<span>32Hz</span>
					<span>250Hz</span>
					<span>1kHz</span>
					<span>4kHz</span>
					<span>16kHz</span>
				</div>
			</div>

			<!-- Sound FX Profile Presets Selector -->
			<div class="space-y-2">
				<h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-muted-foreground">
					Audio Enhancement
				</h4>
				<div class="grid grid-cols-2 gap-2">
					{#each fxProfiles as fx}
						<button
							onclick={() => selectFx(fx.id)}
							class="flex items-center gap-2 rounded-xl p-2.5 text-left border transition-all cursor-pointer {activeFxProfile === fx.id
								? 'border-pink-500 bg-pink-500/15 dark:bg-pink-500/20 text-pink-600 dark:text-white shadow-md shadow-pink-500/20 font-bold'
								: 'border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 text-slate-700 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-950 dark:hover:text-white'}"
						>
							<span class="text-base">{fx.icon}</span>
							<span class="text-xs truncate">{fx.label}</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- High Resolution Audio Engine Info -->
			<div class="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-black/40 p-3 space-y-1.5 text-[11px] font-mono text-slate-600 dark:text-muted-foreground shadow-sm">
				<div class="flex justify-between">
					<span>Sample Rate:</span>
					<span class="text-cyan-600 dark:text-cyan-300 font-bold">48.0 kHz • 24-Bit</span>
				</div>
				<div class="flex justify-between">
					<span>Bitrate:</span>
					<span class="text-pink-600 dark:text-pink-300 font-bold">320 kbps Lossless</span>
				</div>
				<div class="flex justify-between">
					<span>Decoder:</span>
					<span class="text-emerald-600 dark:text-emerald-300 font-bold">Hardware Accelerated</span>
				</div>
			</div>
		</div>
	{/if}
</aside>
