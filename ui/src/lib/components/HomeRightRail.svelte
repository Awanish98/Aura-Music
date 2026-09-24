<script lang="ts">
	// Ultra-Premium Information-Dense Slideable Right Sidebar with Live Audio Spectrum Visualizer & Moods
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
		CheckmarkCircle02Icon
	} from '@hugeicons/core-free-icons';
	import * as api from '$lib/api';
	import { webPlayer } from '$lib/webplayer';
	import { playback, audioFx, toast } from '$lib/player.svelte';
	import MinimalAudioSpectrum from './MinimalAudioSpectrum.svelte';

	// Active tab switch
	let activeTab = $state<'vibe' | 'charts' | 'visualizer'>('vibe');

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

<aside class="w-full select-none max-h-[calc(100vh-6.5rem)] overflow-y-auto no-scrollbar pr-0.5 space-y-4">
	<!-- Tab Navigation Pills -->
	<div class="flex items-center gap-1 rounded-2xl bg-black/50 border border-white/10 p-1 backdrop-blur-2xl shadow-inner">
		<button
			onclick={() => (activeTab = 'vibe')}
			class="flex-1 rounded-xl py-1.5 text-center text-xs font-bold transition-all cursor-pointer {activeTab === 'vibe'
				? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-500/30'
				: 'text-muted-foreground hover:text-white'}"
		>
			✨ Vibe
		</button>
		<button
			onclick={() => (activeTab = 'charts')}
			class="flex-1 rounded-xl py-1.5 text-center text-xs font-bold transition-all cursor-pointer {activeTab === 'charts'
				? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-500/30'
				: 'text-muted-foreground hover:text-white'}"
		>
			📊 Charts
		</button>
		<button
			onclick={() => (activeTab = 'visualizer')}
			class="flex-1 rounded-xl py-1.5 text-center text-xs font-bold transition-all cursor-pointer {activeTab === 'visualizer'
				? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-500/30'
				: 'text-muted-foreground hover:text-white'}"
		>
			🎚️ Spectrum
		</button>
	</div>

	<!-- TAB 1: VIBE & NOW MOOD (Slideable Carousel + Genres) -->
	{#if activeTab === 'vibe'}
		<div in:fade={{ duration: 150 }} class="space-y-4">
			<!-- Slideable Mood Carousel Header -->
			<div class="space-y-2.5">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-foreground">
						<span>Now Mood</span>
						<HugeiconsIcon icon={AudioWave02Icon} size={14} class="text-pink-500 animate-pulse" />
					</div>
					<!-- Slide Controls -->
					<div class="flex items-center gap-1">
						<button
							onclick={prevMoodSlide}
							class="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
							title="Previous Mood"
							aria-label="Previous Mood"
						>
							<HugeiconsIcon icon={ArrowLeft01Icon} size={13} />
						</button>
						<span class="text-[10px] font-bold text-muted-foreground px-1">{currentSlideIdx + 1}/{moodSlides.length}</span>
						<button
							onclick={nextMoodSlide}
							class="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
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
					class="group relative overflow-hidden rounded-2xl border border-white/12 bg-gradient-to-br {currentSlide.color} p-3.5 backdrop-blur-2xl shadow-xl transition-all duration-300 hover:border-pink-500/50 hover:shadow-pink-500/20 cursor-pointer"
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
							<h4 class="text-sm font-extrabold text-white group-hover:text-pink-300 transition-colors">
								{currentSlide.title}
							</h4>
							<p class="text-xs text-purple-200/80 mt-0.5 font-medium">
								{currentSlide.tagline}
							</p>
						</div>
						<span class="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 font-bold">
							Instant Play
						</span>
					</div>
				</div>
			</div>

			<!-- Top Genres Vertical List -->
			<div class="space-y-2.5">
				<div class="flex items-center justify-between">
					<h3 class="text-xs font-bold uppercase tracking-wider text-foreground">
						Top Genres
					</h3>
					<button
						onclick={() => goto('/discover')}
						class="text-xs font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
					>
						View All &gt;
					</button>
				</div>

				<div class="flex flex-col gap-1 rounded-2xl border border-white/10 bg-black/40 p-2 backdrop-blur-2xl">
					{#each topGenres as genre}
						<button
							onclick={() => goto(`/search?q=${encodeURIComponent(genre.query)}`)}
							class="group flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left transition-all duration-200 hover:bg-white/8 cursor-pointer"
						>
							<div class="flex items-center gap-3 min-w-0">
								<img
									src={genre.thumbnail}
									alt={genre.name}
									class="h-7 w-7 rounded-full object-cover ring-1 ring-white/20 transition-transform group-hover:scale-110"
									loading="lazy"
								/>
								<div class="min-w-0">
									<div class="text-xs font-bold text-foreground/90 group-hover:text-pink-400 transition-colors truncate">
										{genre.name}
									</div>
									<div class="text-[10px] text-muted-foreground/80 font-medium">
										{genre.count}
									</div>
								</div>
							</div>
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								size={14}
								class="text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-pink-400"
							/>
						</button>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<!-- TAB 2: DAILY CHARTS & VIRAL TRACKS -->
	{#if activeTab === 'charts'}
		<div in:fade={{ duration: 150 }} class="space-y-3">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-foreground">
					<span>Daily Top 5 Charts</span>
					<span class="text-amber-400">🔥</span>
				</div>
				<span class="text-[10px] font-bold text-pink-400 bg-pink-500/15 px-2 py-0.5 rounded-full border border-pink-500/30">
					Live Ranked
				</span>
			</div>

			<!-- Chart Tracks List -->
			<div class="flex flex-col gap-1.5 rounded-2xl border border-white/10 bg-black/40 p-2 backdrop-blur-2xl">
				{#each trendingCharts as track}
					<div
						onclick={() => playChartTrack(track)}
						role="button"
						tabindex="0"
						onkeydown={(e) => e.key === 'Enter' && playChartTrack(track)}
						class="group flex items-center justify-between gap-2.5 rounded-xl p-2 transition-all duration-200 hover:bg-white/8 cursor-pointer"
					>
						<div class="flex items-center gap-2.5 min-w-0">
							<!-- Rank Badge -->
							<span class="shrink-0 w-6 text-center text-xs font-black {track.rank === 1 ? 'text-amber-400' : track.rank === 2 ? 'text-slate-300' : track.rank === 3 ? 'text-amber-600' : 'text-muted-foreground'}">
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
								<h4 class="text-xs font-bold text-foreground group-hover:text-pink-400 transition-colors truncate">
									{track.title}
								</h4>
								<p class="text-[10px] text-muted-foreground truncate">
									{track.artists}
								</p>
							</div>
						</div>

						<!-- Play Button on Hover -->
						<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pink-500/20 text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-all shadow">
							<HugeiconsIcon icon={PlayIcon} size={14} fill="currentColor" class="ml-0.5" />
						</div>
					</div>
				{/each}
			</div>

			<!-- Listening Stats Widget -->
			<div class="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-black/50 p-3.5 backdrop-blur-2xl shadow-lg">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<HugeiconsIcon icon={HeadphonesIcon} size={16} class="text-cyan-400" />
						<span class="text-xs font-extrabold text-foreground">Listening Radar</span>
					</div>
					<span class="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
						Lossless HD
					</span>
				</div>
				<div class="grid grid-cols-2 gap-2 mt-2.5">
					<div class="rounded-xl bg-white/5 p-2 text-center border border-white/5">
						<div class="text-[10px] text-muted-foreground">Daily Listening</div>
						<div class="text-sm font-black text-white mt-0.5">2.8 hrs</div>
					</div>
					<div class="rounded-xl bg-white/5 p-2 text-center border border-white/5">
						<div class="text-[10px] text-muted-foreground">Audio Fidelity</div>
						<div class="text-sm font-black text-cyan-300 mt-0.5">320 kbps</div>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- TAB 3: LIVE AUDIO SPECTRUM & EQUALIZER FX -->
	{#if activeTab === 'visualizer'}
		<div in:fade={{ duration: 150 }} class="space-y-3.5">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-foreground">
					<span>Live Spectrum</span>
					<span class="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-ping"></span>
				</div>
				<span class="text-[10px] font-mono text-cyan-400 bg-cyan-500/15 px-2 py-0.5 rounded-full border border-cyan-500/30 font-bold">
					60 FPS • FFT
				</span>
			</div>

			<!-- Minimalist 60FPS Real-Time FFT Audio Spectrum -->
			<div class="relative overflow-hidden rounded-2xl border border-pink-500/20 bg-gradient-to-b from-purple-950/30 via-black/60 to-black/80 p-3.5 backdrop-blur-2xl shadow-xl">
				<MinimalAudioSpectrum height={115} barsCount={26} />

				<!-- Frequency Band Scale Labels -->
				<div class="flex justify-between text-[9px] font-mono text-muted-foreground/70 mt-1.5 border-t border-white/10 pt-1.5 px-1">
					<span>32Hz</span>
					<span>250Hz</span>
					<span>1kHz</span>
					<span>4kHz</span>
					<span>16kHz</span>
				</div>
			</div>

			<!-- Sound FX Profile Presets Selector -->
			<div class="space-y-2">
				<h4 class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
					Audio Enhancement
				</h4>
				<div class="grid grid-cols-2 gap-2">
					{#each fxProfiles as fx}
						<button
							onclick={() => selectFx(fx.id)}
							class="flex items-center gap-2 rounded-xl p-2.5 text-left border transition-all cursor-pointer {activeFxProfile === fx.id
								? 'border-pink-500 bg-pink-500/20 text-white shadow-lg shadow-pink-500/20 font-bold'
								: 'border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'}"
						>
							<span class="text-base">{fx.icon}</span>
							<span class="text-xs truncate">{fx.label}</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- High Resolution Audio Engine Info -->
			<div class="rounded-xl border border-white/10 bg-black/40 p-3 space-y-1.5 text-[11px] font-mono text-muted-foreground">
				<div class="flex justify-between">
					<span>Sample Rate:</span>
					<span class="text-cyan-300 font-bold">48.0 kHz • 24-Bit</span>
				</div>
				<div class="flex justify-between">
					<span>Bitrate:</span>
					<span class="text-pink-300 font-bold">320 kbps Lossless</span>
				</div>
				<div class="flex justify-between">
					<span>Decoder:</span>
					<span class="text-emerald-300 font-bold">Hardware Accelerated</span>
				</div>
			</div>
		</div>
	{/if}
</aside>
