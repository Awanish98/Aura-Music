<script lang="ts">
	// Ultra-Premium Aura Music Right Sidebar
	// Features: Aura AI Vibe Station (Smart DJ), Top Ranked Charts, Live 60FPS Audio Spectrum Visualizer & Moods
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		ArrowRight01Icon,
		ArrowLeft01Icon,
		AudioWave02Icon,
		SparklesIcon,
		PlayIcon,
		Loading03Icon,
		HeadphonesIcon,
		CrownIcon,
		FireIcon
	} from '@hugeicons/core-free-icons';
	import aiMascot from '$lib/assets/ai_mascot.svg';
	import * as api from '$lib/api';
	import type { SongItem } from '$lib/api';
	import { aiAgent } from '$lib/aiAgent';
	import { webPlayer } from '$lib/webplayer';
	import { playback, audioFx, toast, ui } from '$lib/player.svelte';
	import MinimalAudioSpectrum from './MinimalAudioSpectrum.svelte';

	// Active Tab Switch - AI Vibe Station is active by default
	let activeTab = $state<'aidj' | 'charts' | 'visualizer' | 'moods'>('aidj');

	// --- AI Vibe Station State & Logic ---
	let customVibe = $state('');
	let generating = $state(false);
	let generatedMix = $state<SongItem[]>([]);
	let activeVibeName = $state('');

	const vibePresets = [
		{ label: '🌧️ Monsoon Hindi Acoustic', prompt: 'Monsoon rainy day Hindi acoustic & soulful Bollywood melodies' },
		{ label: '🚗 Midnight Neon Drive', prompt: 'Synthwave, retro electro, and chill phonk for a late night neon drive' },
		{ label: '☕ Cozy Coffeehouse Lofi', prompt: 'Warm relaxing lofi hip hop and acoustic coffeehouse instrumentals' },
		{ label: '🔥 Gym Energy Phonk', prompt: 'Aggressive workout gym phonk, high BPM electronic and hype tracks' },
		{ label: '☀️ 90s Bollywood Gold', prompt: 'Classic evergreen 90s Bollywood romantic hits by Kumar Sanu, Alka Yagnik, Udit Narayan' },
		{ label: '🌙 Late Night Deep Focus', prompt: 'Calm ambient electronic and peaceful downtempo for deep work and coding' },
		{ label: '💖 Romantic Melodies', prompt: 'Soulful acoustic Hindi love songs and soft unplugged hits' },
		{ label: '🎉 Punjabi Dance Party', prompt: 'High energy Punjabi party bangers and bhangra club hits' }
	];

	async function handleGenerate(vibeText: string) {
		const prompt = vibeText.trim();
		if (!prompt || generating) return;

		generating = true;
		activeVibeName = prompt;
		toast(`Aura AI DJ: Crafting "${prompt.slice(0, 22)}..." mix`);
		try {
			const tracks = await aiAgent.generateVibeMix(prompt);
			if (tracks.length > 0) {
				generatedMix = tracks;
				api.playPlaylist(tracks, 0, undefined, `Aura AI: ${prompt.slice(0, 28)}`, false);
				toast.success(`Playing AI Vibe Mix (${tracks.length} songs)!`);
			} else {
				toast.error('Could not find matching tracks. Please try another vibe prompt.');
			}
		} catch (e: any) {
			toast.error(e?.message || 'Failed to generate AI vibe mix');
		} finally {
			generating = false;
		}
	}

	// --- Slideable Mood Carousel ---
	let currentSlideIdx = $state(0);
	const moodSlides = [
		{
			id: 'rainy',
			title: 'Monsoon Chai',
			tagline: 'Soulful Hindi acoustic & indie vibes',
			query: 'Monsoon acoustic Hindi indie relaxing',
			image: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=500&auto=format&fit=crop&q=80',
			color: 'from-blue-600/30 via-indigo-600/20 to-purple-600/20'
		},
		{
			id: 'synth',
			title: 'Cyberpunk Drive',
			tagline: 'High-octane retro electro & phonk',
			query: 'Cyberpunk neon synthwave retro phonk',
			image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=500&auto=format&fit=crop&q=80',
			color: 'from-pink-600/30 via-purple-600/20 to-cyan-600/20'
		},
		{
			id: 'lofi',
			title: 'Midnight Coffee',
			tagline: 'Warm lofi beats for coding & reading',
			query: 'Lofi hip hop beats study relax',
			image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&auto=format&fit=crop&q=80',
			color: 'from-amber-600/30 via-orange-600/20 to-rose-600/20'
		},
		{
			id: 'energy',
			title: 'Beast Workout',
			tagline: 'Max BPM pump for heavy sets',
			query: 'Workout motivation gym phonk EDM',
			image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80',
			color: 'from-red-600/30 via-rose-600/20 to-orange-600/20'
		}
	];

	const currentSlide = $derived(moodSlides[currentSlideIdx]);

	function nextMoodSlide() {
		currentSlideIdx = (currentSlideIdx + 1) % moodSlides.length;
	}

	function prevMoodSlide() {
		currentSlideIdx = (currentSlideIdx - 1 + moodSlides.length) % moodSlides.length;
	}

	async function playActiveSlide(slide: typeof moodSlides[0]) {
		toast(`Loading ${slide.title}...`);
		try {
			const res = await api.search(slide.query);
			const songs = Array.isArray(res) ? res : (res as any)?.songs || [];
			if (songs.length > 0) {
				webPlayer.playPlaylist(songs, 0, slide.title);
				toast.success(`Playing ${slide.title}!`);
			} else {
				goto(`/search?q=${encodeURIComponent(slide.query)}`);
			}
		} catch {
			goto(`/search?q=${encodeURIComponent(slide.query)}`);
		}
	}

	// --- Daily Top Charts ---
	const trendingCharts = [
		{
			id: 'chart_1',
			rank: 1,
			title: 'Tauba Tauba',
			artists: 'Karan Aujla, Vicky Kaushal',
			thumbnail: 'https://i.ytimg.com/vi/LK7-_x-4T20/hqdefault.jpg',
			query: 'Tauba Tauba Karan Aujla Bad Newz'
		},
		{
			id: 'chart_2',
			rank: 2,
			title: 'Big Dawgs',
			artists: 'Hanumankind, Kalmi',
			thumbnail: 'https://i.ytimg.com/vi/hOHKltAiKXQ/hqdefault.jpg',
			query: 'Hanumankind Big Dawgs'
		},
		{
			id: 'chart_3',
			rank: 3,
			title: 'Chaleya',
			artists: 'Arijit Singh, Shilpa Rao',
			thumbnail: 'https://i.ytimg.com/vi/VAdGW7QDJUI/hqdefault.jpg',
			query: 'Chaleya Jawan Arijit Singh'
		},
		{
			id: 'chart_4',
			rank: 4,
			title: 'Millionaire',
			artists: 'Yo Yo Honey Singh',
			thumbnail: 'https://i.ytimg.com/vi/XO8wew38VM8/hqdefault.jpg',
			query: 'Yo Yo Honey Singh Millionaire Glory'
		},
		{
			id: 'chart_5',
			rank: 5,
			title: 'Aayi Nai',
			artists: 'Pawan Singh, Simran Choudhary',
			thumbnail: 'https://i.ytimg.com/vi/u2NAus-eo4Y/hqdefault.jpg',
			query: 'Aayi Nai Stree 2'
		}
	];

	async function playChartTrack(track: typeof trendingCharts[0]) {
		toast(`Playing #${track.rank} ${track.title}...`);
		try {
			const res = await api.search(track.query);
			const songs = Array.isArray(res) ? res : (res as any)?.songs || [];
			if (songs.length > 0) {
				webPlayer.playPlaylist(songs, 0, track.title);
			} else {
				goto(`/search?q=${encodeURIComponent(track.query)}`);
			}
		} catch {
			goto(`/search?q=${encodeURIComponent(track.query)}`);
		}
	}

	// Top Genres
	const topGenres = [
		{ name: 'Bollywood Hits', count: '500+ Songs', query: 'Bollywood Hits Superhits', thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&auto=format&fit=crop&q=80' },
		{ name: 'Lofi Chillout', count: '320+ Tracks', query: 'Lofi Chill Study Beats', thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100&auto=format&fit=crop&q=80' },
		{ name: 'Punjabi Pop', count: '450+ Bangers', query: 'Punjabi Superhits Diljit Sidhu', thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&auto=format&fit=crop&q=80' },
		{ name: 'EDM & Phonk', count: '280+ Anthems', query: 'EDM Festival House Phonk', thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=100&auto=format&fit=crop&q=80' }
	];

	// Audio FX profiles
	let activeFxProfile = $state('studio');
	const fxProfiles = [
		{ id: 'studio', label: 'Studio Pure', icon: '🎧' },
		{ id: 'bass', label: 'Bass Booster', icon: '⚡' },
		{ id: 'concert', label: '3D Spatial', icon: '🌌' },
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
			onclick={() => (activeTab = 'aidj')}
			class="rounded-xl py-1.5 text-center text-[11px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 {activeTab === 'aidj'
				? 'bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 text-white shadow-lg shadow-pink-500/30'
				: 'text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-white'}"
		>
			<HugeiconsIcon icon={SparklesIcon} size={13} />
			<span>AI DJ</span>
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
		<button
			onclick={() => (activeTab = 'moods')}
			class="rounded-xl py-1.5 text-center text-[11px] font-extrabold transition-all cursor-pointer {activeTab === 'moods'
				? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-500/30'
				: 'text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-white'}"
		>
			🌊 Moods
		</button>
	</div>

	<!-- ========================================================================= -->
	<!-- TAB 1: AURA AI VIBE STATION (INTEGRATED ON THE RIGHT RAIL)                 -->
	<!-- ========================================================================= -->
	{#if activeTab === 'aidj'}
		<div in:fade={{ duration: 150 }} class="space-y-3.5">
			<!-- AI Vibe Station Card -->
			<div class="relative overflow-hidden rounded-2xl border border-pink-500/30 bg-gradient-to-br from-white/90 via-purple-50/40 to-pink-50/40 dark:from-[#080614]/95 dark:via-[#0c081e]/90 dark:to-[#05040f]/95 p-4 backdrop-blur-2xl shadow-md dark:shadow-[0_12px_36px_rgba(0,0,0,0.85)]">
				<!-- Ambient Glow Lights -->
				<div class="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-pink-500/20 blur-2xl"></div>
				<div class="pointer-events-none absolute -left-8 -bottom-8 size-28 rounded-full bg-purple-500/20 blur-2xl"></div>

				<!-- Header with Animated Mascot & Smart DJ Badge -->
				<div class="relative z-10 flex items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-white/10">
					<div class="flex items-center gap-2.5">
						<div class="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 p-1.5 text-white shadow-lg shadow-pink-500/30">
							<img src={aiMascot} alt="Aura AI Mascot" class="h-full w-full drop-shadow animate-pulse" />
							<span class="absolute -top-1 -right-1 flex h-2.5 w-2.5">
								<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
								<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500"></span>
							</span>
						</div>
						<div>
							<h3 class="text-xs font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
								<span>Aura AI Vibe Station</span>
							</h3>
							<p class="text-[10px] text-slate-600 dark:text-purple-200/80 font-medium">
								Instant mood mixes & Smart curation
							</p>
						</div>
					</div>

					<span class="rounded-full bg-pink-500/15 dark:bg-pink-500/20 px-2 py-0.5 text-[9px] font-bold text-pink-600 dark:text-pink-400 border border-pink-500/30 shrink-0">
						⚡ AI DJ
					</span>
				</div>

				<!-- Prompt Input Form -->
				<form
					onsubmit={(e) => {
						e.preventDefault();
						handleGenerate(customVibe);
					}}
					class="relative z-10 mt-3 space-y-2"
				>
					<div class="relative">
						<input
							type="text"
							bind:value={customVibe}
							placeholder="Type any mood (e.g. Chill Hindi indie)..."
							disabled={generating}
							class="w-full rounded-xl border border-slate-300 dark:border-white/12 bg-white/90 dark:bg-white/6 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/30 transition-all shadow-inner"
						/>
					</div>

					<button
						type="submit"
						disabled={generating || !customVibe.trim()}
						class="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 py-2 text-xs font-black text-white shadow-md shadow-pink-500/30 hover:shadow-pink-500/50 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
					>
						{#if generating}
							<HugeiconsIcon icon={Loading03Icon} size={14} class="animate-spin" />
							<span>Crafting AI Mix...</span>
						{:else}
							<HugeiconsIcon icon={SparklesIcon} size={14} />
							<span>Generate & Play Mix</span>
						{/if}
					</button>
				</form>

				<!-- Preset Vibe Pills -->
				<div class="relative z-10 mt-3.5 space-y-1.5">
					<div class="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-white/60">
						<span>Trending AI Presets</span>
						<span>1-Tap Play</span>
					</div>

					<div class="flex flex-col gap-1.5">
						{#each vibePresets as v}
							<button
								onclick={() => handleGenerate(v.prompt)}
								disabled={generating}
								class="group flex items-center justify-between rounded-xl border border-slate-200/90 dark:border-white/8 bg-white/70 dark:bg-white/4 px-2.5 py-1.5 text-left text-xs font-semibold text-slate-700 dark:text-white/80 transition-all hover:border-pink-500/50 hover:bg-pink-50/50 dark:hover:bg-pink-500/15 hover:text-pink-600 dark:hover:text-white active:scale-98 cursor-pointer disabled:opacity-50 {activeVibeName === v.prompt ? 'border-pink-500 bg-pink-500/20 text-pink-700 dark:text-pink-300 font-bold shadow-sm' : ''}"
							>
								<span class="text-[11px] truncate">{v.label}</span>
								<div class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-500/10 text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-colors">
									<HugeiconsIcon icon={PlayIcon} size={10} fill="currentColor" class="ml-0.5" />
								</div>
							</button>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- ========================================================================= -->
	<!-- TAB 2: DAILY CHARTS & VIRAL TRACKS                                       -->
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
			<div class="flex flex-col gap-1.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#050610]/95 p-2 backdrop-blur-2xl shadow-sm dark:shadow-[0_8px_30px_rgba(0,0,0,0.8)]">
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

			<!-- Listening Radar Widget -->
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
	<!-- TAB 3: LIVE AUDIO SPECTRUM & EQUALIZER FX                                -->
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

	<!-- ========================================================================= -->
	<!-- TAB 4: VIBE & NOW MOOD (Slideable Carousel + Genres)                      -->
	<!-- ========================================================================= -->
	{#if activeTab === 'moods'}
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
</aside>
