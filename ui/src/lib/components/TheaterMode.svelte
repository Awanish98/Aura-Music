<script lang="ts">
	import { onMount } from 'svelte';
	import { beforeNavigate } from '$app/navigation';
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		ArrowDown01Icon,
		FavouriteIcon,
		Mic01Icon,
		MusicNote01Icon,
		NextIcon,
		PauseIcon,
		PlayIcon,
		PreviousIcon,
		RepeatIcon,
		RepeatOne01Icon,
		ShuffleIcon,
		VolumeHighIcon,
		VolumeMute02Icon,
		MaximizeScreenIcon,
		MinimizeScreenIcon,
		AudioWave01Icon,
		AudioWave02Icon,
		SparklesIcon,
		Queue01Icon,
		Moon02Icon,
		DashboardSpeed01Icon,
		Add01Icon,
		Share01Icon,
		MoreHorizontalIcon,
		InformationCircleIcon,
		Cancel01Icon
	} from '@hugeicons/core-free-icons';
	import * as api from '$lib/api';
	import {
		playback,
		ui,
		audioFx,
		cycleRepeat,
		dragVolume,
		commitVolume,
		toggleMute,
		toggleNowPlayingRating,
		openAddToPlaylist,
		openShare,
		sleepTimer,
		setPlaybackSpeed,
		wheelVolume
	} from '$lib/player.svelte';
	import { webPlayer } from '$lib/webplayer';
	import { artworkAccent } from '$lib/artcolor';
	import { hexToHsv } from '$lib/color';
	import { thumb } from '$lib/thumb';
	import { t } from '$lib/i18n.svelte';
	import LyricsView from './LyricsView.svelte';
	import QueueList from './QueueList.svelte';
	import type { QueueScrollMemory } from '$lib/queue-history';
	import VisualizerStudio from './VisualizerStudio.svelte';
	import EqualizerDialog from './EqualizerDialog.svelte';
	import SleepTimerModal from './SleepTimerModal.svelte';

	const close = () => {
		if (typeof document !== 'undefined' && document.fullscreenElement) {
			document.exitFullscreen().catch(() => {});
		}
		ui.theaterOpen = false;
	};

	beforeNavigate(close);

	// Tabs: Lyrics | Queue | Visualizer | About
	let activeTab = $state<'lyrics' | 'queue' | 'visualizer' | 'about'>('lyrics');
	let isNativeFullscreen = $state(false);
	let showEq = $state(false);
	let sleepModalOpen = $state(false);
	let speedMenuOpen = $state(false);
	let cardMenuOpen = $state(false);
	let showShortcutsGuide = $state(false);
	let justLiked = $state(false);
	const queueScrollMemory: QueueScrollMemory = {};

	const speeds = [0.75, 1, 1.25, 1.5, 2];

	function toggleLike() {
		if (playback.rating !== 'like') justLiked = true;
		toggleNowPlayingRating();
	}

	function updateFullscreenStatus() {
		if (typeof document !== 'undefined') {
			isNativeFullscreen = !!document.fullscreenElement;
		}
	}

	function toggleNativeFullscreen() {
		if (typeof document === 'undefined') return;
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen().catch(() => {});
		} else {
			document.exitFullscreen().catch(() => {});
		}
	}

	// Dynamic Idle Fade
	let idle = $state(false);
	let idleTimer: ReturnType<typeof setTimeout>;
	function wake() {
		idle = false;
		clearTimeout(idleTimer);
		idleTimer = setTimeout(() => (idle = true), 4500);
	}

	// Dynamic Particle & Bokeh Atmosphere Canvas
	let starCanvas: HTMLCanvasElement | null = $state(null);
	let starAnimId: number | null = null;

	let attempt = $state(0);
	$effect(() => {
		playback.now?.thumbnail;
		attempt = 0;
	});
	const srcs = $derived([720, 400, 120].map((px) => thumb(playback.now?.thumbnail, px)));
	const src = $derived(srcs[attempt]);

	let accent = $state<string | null>(null);
	$effect(() => {
		const url = thumb(playback.now?.thumbnail, 120);
		if (!url) {
			accent = null;
			return;
		}
		let alive = true;
		artworkAccent(url).then((hex) => {
			if (alive) accent = hex;
		});
		return () => {
			alive = false;
		};
	});

	const hue = $derived(accent ? (hexToHsv(accent)?.h ?? 35) : 35);
	const mesh = $derived.by(() => {
		const h = hue;
		const a = (deg: number) => (h + deg + 360) % 360;
		return [
			`radial-gradient(ellipse 95% 85% at 75% 45%, hsl(${a(0)} 90% 34% / 0.65) 0%, transparent 75%)`,
			`radial-gradient(ellipse 70% 70% at 20% 75%, hsl(${a(30)} 85% 26% / 0.5) 0%, transparent 70%)`,
			`radial-gradient(circle at 50% 20%, hsl(${a(-25)} 90% 30% / 0.45) 0%, transparent 65%)`
		].join(',');
	});

	onMount(() => {
		wake();
		api.theaterFullscreen(true).catch(() => {});
		updateFullscreenStatus();
		document.addEventListener('fullscreenchange', updateFullscreenStatus);

		// Rich Dynamic Particle Canvas (Floating Bokeh Lights + Golden Embers + Audio Reactive Pulse)
		if (starCanvas) {
			const ctx = starCanvas.getContext('2d');
			if (ctx) {
				let w = (starCanvas.width = window.innerWidth);
				let h = (starCanvas.height = window.innerHeight);

				const resizeHandler = () => {
					if (!starCanvas) return;
					w = starCanvas.width = window.innerWidth;
					h = starCanvas.height = window.innerHeight;
				};
				window.addEventListener('resize', resizeHandler);

				// 1. Floating Bokeh Orbs
				const numOrbs = 20;
				const orbs: {
					x: number;
					y: number;
					baseRadius: number;
					radius: number;
					alpha: number;
					speedY: number;
					speedX: number;
					phase: number;
					hueShift: number;
				}[] = [];

				for (let i = 0; i < numOrbs; i++) {
					const baseR = Math.random() * 55 + 25;
					orbs.push({
						x: Math.random() * w,
						y: Math.random() * h,
						baseRadius: baseR,
						radius: baseR,
						alpha: Math.random() * 0.16 + 0.05,
						speedY: Math.random() * 0.4 + 0.15,
						speedX: (Math.random() - 0.5) * 0.3,
						phase: Math.random() * Math.PI * 2,
						hueShift: (Math.random() - 0.5) * 40
					});
				}

				// 2. Sparkling Golden Stardust Embers
				const numStars = Math.min(80, Math.floor((w * h) / 16000));
				const stars: {
					x: number;
					y: number;
					size: number;
					alpha: number;
					baseAlpha: number;
					speedY: number;
					twinkleSpeed: number;
					phase: number;
				}[] = [];

				for (let i = 0; i < numStars; i++) {
					const bAlpha = Math.random() * 0.6 + 0.25;
					stars.push({
						x: Math.random() * w,
						y: Math.random() * h,
						size: Math.random() * 1.8 + 0.6,
						alpha: bAlpha,
						baseAlpha: bAlpha,
						speedY: Math.random() * 0.35 + 0.08,
						twinkleSpeed: Math.random() * 0.04 + 0.015,
						phase: Math.random() * Math.PI * 2
					});
				}

				let tick = 0;
				const render = () => {
					tick++;
					ctx.clearRect(0, 0, w, h);

					const metrics = webPlayer.getAudioMetrics();
					const bassBoost = playback.paused ? 0 : (metrics.bass / 255) * 0.45;
					const energyBoost = playback.paused ? 0 : (metrics.energy / 255) * 0.35;
					const curHue = hue;

					// Draw Bokeh Orbs
					for (const orb of orbs) {
						orb.y -= orb.speedY * (1 + bassBoost * 0.8);
						orb.x += Math.sin(tick * 0.015 + orb.phase) * 0.5 + orb.speedX;

						if (orb.y + orb.radius < 0) {
							orb.y = h + orb.radius;
							orb.x = Math.random() * w;
						}
						if (orb.x < -orb.radius) orb.x = w + orb.radius;
						if (orb.x > w + orb.radius) orb.x = -orb.radius;

						orb.radius = orb.baseRadius * (1 + bassBoost * 0.35);
						const orbHue = (curHue + orb.hueShift + 360) % 360;
						const orbAlpha = orb.alpha * (playback.paused ? 0.6 : 1 + energyBoost * 0.5);

						const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
						grad.addColorStop(0, `hsla(${orbHue}, 90%, 65%, ${orbAlpha})`);
						grad.addColorStop(0.5, `hsla(${orbHue}, 80%, 55%, ${orbAlpha * 0.5})`);
						grad.addColorStop(1, `hsla(${orbHue}, 80%, 45%, 0)`);

						ctx.fillStyle = grad;
						ctx.beginPath();
						ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
						ctx.fill();
					}

					// Draw Twinkling Stardust Embers
					for (const s of stars) {
						s.y -= s.speedY * (1 + energyBoost * 0.6);
						if (s.y < 0) {
							s.y = h;
							s.x = Math.random() * w;
						}

						const twinkle = Math.sin(tick * s.twinkleSpeed + s.phase) * 0.35;
						const effAlpha = Math.max(0.1, Math.min(1, (s.baseAlpha + twinkle) * (playback.paused ? 0.45 : 1 + bassBoost)));

						ctx.fillStyle = `rgba(254, 240, 138, ${effAlpha})`;
						ctx.beginPath();
						ctx.arc(s.x, s.y, s.size * (1 + bassBoost * 0.25), 0, Math.PI * 2);
						ctx.fill();
					}

					starAnimId = requestAnimationFrame(render);
				};
				render();

				return () => {
					window.removeEventListener('resize', resizeHandler);
				};
			}
		}

		return () => {
			clearTimeout(idleTimer);
			document.removeEventListener('fullscreenchange', updateFullscreenStatus);
			if (starAnimId) cancelAnimationFrame(starAnimId);
			if (typeof document !== 'undefined' && document.fullscreenElement) {
				document.exitFullscreen().catch(() => {});
			}
			api.theaterFullscreen(false).catch(() => {});
		};
	});

	function onKey(e: KeyboardEvent) {
		const target = e.target as HTMLElement | null;
		if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
		if (e.defaultPrevented) return;

		wake();

		if (e.key === 'Escape') {
			e.preventDefault();
			close();
		} else if (e.key === ' ' || e.code === 'Space') {
			e.preventDefault();
			api.togglePause();
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			api.seek(Math.min(playback.duration, playback.position + 5));
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			api.seek(Math.max(0, playback.position - 5));
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			commitVolume(Math.min(100, playback.volume + 5));
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			commitVolume(Math.max(0, playback.volume - 5));
		} else if (e.key === 'm' || e.key === 'M') {
			e.preventDefault();
			toggleMute();
		} else if (e.key === 'l' || e.key === 'L') {
			e.preventDefault();
			activeTab = 'lyrics';
		} else if (e.key === 'v' || e.key === 'V') {
			e.preventDefault();
			activeTab = 'visualizer';
		} else if (e.key === 'q' || e.key === 'Q') {
			e.preventDefault();
			activeTab = 'queue';
		} else if (e.key === 's' || e.key === 'S') {
			e.preventDefault();
			api.toggleShuffle();
		} else if (e.key === 'r' || e.key === 'R') {
			e.preventDefault();
			cycleRepeat();
		} else if (e.key === 'f' || e.key === 'F') {
			e.preventDefault();
			api.nextTrack();
		} else if (e.key === 'd' || e.key === 'D') {
			e.preventDefault();
			api.prevTrack();
		} else if (e.key === '?') {
			e.preventDefault();
			showShortcutsGuide = !showShortcutsGuide;
		}
	}

	const fmt = (secs: number) => {
		if (!secs || secs < 0 || !isFinite(secs) || isNaN(secs)) return '0:00';
		const s = Math.floor(secs);
		const h = Math.floor(s / 3600);
		const m = Math.floor((s % 3600) / 60);
		const mm = h ? String(m).padStart(2, '0') : `${m}`;
		return `${h ? `${h}:` : ''}${mm}:${String(s % 60).padStart(2, '0')}`;
	};

	let seekDrag = $state<number | null>(null);
	let hoverSeekPos = $state<number | null>(null);
	let hoverSeekPct = $state<number>(0);
	const shownPosition = $derived(seekDrag ?? playback.position);
	const pct = $derived(playback.duration ? (shownPosition / playback.duration) * 100 : 0);

	const shuffleOn = $derived(playback.queue.shuffle ?? false);
	const repeat = $derived(playback.queue.repeat ?? 'off');
	const currentSong = $derived.by(() => {
		const cur = playback.queue.items[playback.queue.currentIndex];
		return cur?.video_id === playback.now?.videoId ? cur : null;
	});

	function onScrubberMouseMove(e: MouseEvent) {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
		hoverSeekPct = pos * 100;
		hoverSeekPos = pos * (playback.duration || 0);
	}
	function onScrubberMouseLeave() {
		hoverSeekPos = null;
	}
</script>

<svelte:window onkeydown={onKey} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<section
	transition:fade={{ duration: 300 }}
	onwheel={wheelVolume}
	onpointermove={wake}
	class="theater fixed inset-0 z-50 flex h-[100dvh] w-[100dvw] flex-col overflow-hidden bg-[#07080d] text-white select-none"
>
	<!-- 🌌 1. Deep Animated Particle & Bokeh Atmosphere Canvas -->
	<canvas bind:this={starCanvas} class="pointer-events-none absolute inset-0 h-full w-full z-0 opacity-80"></canvas>

	<!-- 🎨 2. Rich Dynamic Blurred Artwork Backdrop & Accent Mesh -->
	<div class="pointer-events-none absolute inset-0 z-0 overflow-hidden">
		{#if src}
			<img
				src={src}
				alt=""
				class="absolute inset-0 h-full w-full object-cover object-center scale-125 blur-3xl opacity-35 saturate-180 brightness-40 transition-all duration-1000"
			/>
		{/if}
		<div class="absolute inset-0 opacity-90 transition-all duration-1000" style="background-image:{mesh}"></div>
		<!-- Dark edge vignettes for rich contrast & readability without harsh vertical bands -->
		<div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/60 pointer-events-none"></div>
		<div class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.7)_100%)] pointer-events-none"></div>
	</div>

	<!-- 🎛️ 3. TOP NAVIGATION HEADER (Matching Reference Screenshot) -->
	<header
		class="relative z-40 flex shrink-0 items-center justify-between px-6 pt-5 pb-3 sm:px-10 sm:pt-6 transition-all duration-400 {idle
			? 'opacity-30 hover:opacity-100'
			: 'opacity-100'}"
	>
		<!-- Left: Brand Logo -->
		<div class="flex items-center gap-2.5">
			<span
				class="flex size-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#ff0a78] to-[#f43f5e] shadow-[0_0_15px_rgba(255,10,120,0.65)] font-black text-white text-xs tracking-tighter"
			>
				A
			</span>
			<span
				class="font-heading font-black tracking-widest text-sm sm:text-base uppercase bg-gradient-to-r from-[#ff0a78] via-[#fb7185] to-white bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(255,10,120,0.4)]"
			>
				AURA MUSIC
			</span>
		</div>

		<!-- Center: Floating Capsule Dock [ Lyrics | Queue | Visualizer | About ] -->
		<div
			class="flex items-center gap-1 rounded-full border border-white/15 bg-black/45 p-1 backdrop-blur-2xl shadow-[0_12px_35px_rgba(0,0,0,0.6)]"
		>
			{#each [
				{ id: 'lyrics', label: 'Lyrics', icon: Mic01Icon },
				{ id: 'queue', label: 'Queue', icon: Queue01Icon },
				{ id: 'visualizer', label: 'Visualizer', icon: AudioWave01Icon },
				{ id: 'about', label: 'About', icon: InformationCircleIcon }
			] as tab (tab.id)}
				<button
					onclick={() => (activeTab = tab.id as any)}
					class="flex items-center gap-1.5 rounded-full px-3.5 sm:px-4 py-1.5 text-xs font-semibold transition-all duration-300 cursor-pointer {activeTab === tab.id
						? 'bg-gradient-to-r from-amber-500/40 via-orange-500/30 to-amber-600/40 border border-amber-400/60 text-amber-100 shadow-[0_0_18px_rgba(245,158,11,0.45)] scale-100 font-bold'
						: 'text-white/65 hover:text-white hover:bg-white/10'}"
				>
					<HugeiconsIcon
						icon={tab.icon}
						size={14}
						class={activeTab === tab.id ? 'text-amber-300 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]' : ''}
					/>
					<span>{tab.label}</span>
				</button>
			{/each}
		</div>

		<!-- Right: Action Buttons [ Share | Fullscreen | More Options (...) ] -->
		<div class="flex items-center gap-2">
			<!-- Share -->
			{#if playback.now}
				<button
					onclick={() => {
						const now = playback.now!;
						openShare({
							id: now.videoId,
							title: now.title,
							subtitle: now.artists,
							kind: 'song',
							thumbnail: now.thumbnail
						});
					}}
					class="flex size-9 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/80 backdrop-blur-xl transition-all hover:scale-105 hover:bg-white/15 hover:text-white active:scale-95 shadow-lg"
					title="Share Song"
					aria-label="Share"
				>
					<HugeiconsIcon icon={Share01Icon} size={15} />
				</button>
			{/if}

			<!-- Fullscreen Toggle -->
			<button
				onclick={toggleNativeFullscreen}
				class="flex size-9 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/80 backdrop-blur-xl transition-all hover:scale-105 hover:bg-white/15 hover:text-white active:scale-95 shadow-lg"
				title={isNativeFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
				aria-label="Fullscreen"
			>
				<HugeiconsIcon icon={isNativeFullscreen ? MinimizeScreenIcon : MaximizeScreenIcon} size={15} />
			</button>

			<!-- More Options Button -->
			<div class="relative">
				<button
					onclick={() => (cardMenuOpen = !cardMenuOpen)}
					class="flex size-9 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/80 backdrop-blur-xl transition-all hover:scale-105 hover:bg-white/15 hover:text-white active:scale-95 shadow-lg"
					title="More Options"
					aria-label="More Options"
				>
					<HugeiconsIcon icon={MoreHorizontalIcon} size={16} />
				</button>

				{#if cardMenuOpen}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="absolute top-full right-0 mt-2 z-50 flex flex-col gap-1 min-w-[190px] rounded-2xl border border-white/20 bg-black/90 p-2 shadow-2xl backdrop-blur-2xl text-xs text-white"
						transition:scale={{ start: 0.9, duration: 150 }}
						onclick={(e) => e.stopPropagation()}
					>
						<!-- Sleep Timer -->
						<button
							class="flex items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-white/90 hover:bg-white/15 transition cursor-pointer"
							onclick={() => {
								sleepModalOpen = true;
								cardMenuOpen = false;
							}}
						>
							<HugeiconsIcon icon={Moon02Icon} size={15} />
							<span>Sleep Timer {sleepTimer.active ? `(${Math.ceil(sleepTimer.remainingSecs / 60)}m)` : ''}</span>
						</button>

						<!-- Speed Menu Toggle -->
						<button
							type="button"
							class="flex items-center justify-between w-full rounded-xl px-3 py-2 text-left font-medium text-white/90 hover:bg-white/15 transition cursor-pointer"
							onclick={() => (speedMenuOpen = !speedMenuOpen)}
						>
							<div class="flex items-center gap-2">
								<HugeiconsIcon icon={DashboardSpeed01Icon} size={15} />
								<span>Speed</span>
							</div>
							<span class="text-[11px] font-bold text-amber-400 font-mono">{playback.speed}x</span>
						</button>

						{#if speedMenuOpen}
							<div class="flex items-center justify-around py-1 bg-white/5 rounded-lg">
								{#each speeds as sp}
									<button
										type="button"
										class="px-2 py-0.5 text-[11px] font-bold rounded {playback.speed === sp ? 'bg-amber-500 text-black' : 'text-white/60 hover:text-white'}"
										onclick={() => {
											setPlaybackSpeed(sp);
											speedMenuOpen = false;
											cardMenuOpen = false;
										}}
									>
										{sp}x
									</button>
								{/each}
							</div>
						{/if}

						<!-- Equalizer -->
						<button
							class="flex items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-white/90 hover:bg-white/15 transition cursor-pointer"
							onclick={() => {
								showEq = true;
								cardMenuOpen = false;
							}}
						>
							<HugeiconsIcon icon={AudioWave02Icon} size={15} />
							<span>Equalizer & FX</span>
						</button>

						<!-- Add to Playlist -->
						{#if currentSong}
							<button
								class="flex items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-white/90 hover:bg-white/15 transition cursor-pointer"
								onclick={() => {
									openAddToPlaylist(currentSong!);
									cardMenuOpen = false;
								}}
							>
								<HugeiconsIcon icon={Add01Icon} size={15} />
								<span>Add to Playlist</span>
							</button>
						{/if}

						<!-- Shortcuts Guide -->
						<button
							class="flex items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-white/90 hover:bg-white/15 transition cursor-pointer"
							onclick={() => {
								showShortcutsGuide = true;
								cardMenuOpen = false;
							}}
						>
							<HugeiconsIcon icon={SparklesIcon} size={15} />
							<span>Keyboard Shortcuts (?)</span>
						</button>
					</div>
				{/if}
			</div>

			<!-- Close Button -->
			<button
				onclick={close}
				class="flex size-9 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/80 backdrop-blur-xl transition-all hover:scale-105 hover:bg-white/15 hover:text-white active:scale-95 shadow-lg"
				title="Minimize Theater (Esc)"
				aria-label="Close"
			>
				<HugeiconsIcon icon={ArrowDown01Icon} size={17} />
			</button>
		</div>
	</header>

	<!-- 🎬 4. MAIN STAGE (Left: 3D Vinyl Player | Right: Synced Lyrics / Tabs) -->
	<div class="relative z-10 grid min-h-0 flex-1 w-full grid-cols-1 lg:grid-cols-2 overflow-x-clip overflow-y-hidden px-4 pb-6 sm:px-10 lg:px-14">
		
		<!-- 💿 LEFT STAGE: 3D FLOATING VINYL RECORD SLEEVE & CONTROLS -->
		<div class="relative flex h-full w-full flex-col items-center justify-center px-2 py-4 sm:px-6 overflow-visible select-none">
			<div class="flex flex-col w-full max-w-[320px] sm:max-w-[360px] xl:max-w-[400px] items-center gap-4 sm:gap-6 my-auto z-10">
				
				<!-- 3D Floating Vinyl Record + Artwork Sleeve Container -->
				<div class="relative mx-auto w-full aspect-square flex items-center justify-center group perspective-1000 overflow-visible">
					
					<!-- Sliding Vinyl Disc Wrapper (Slides out smoothly to right when playing) -->
					<div
						class="absolute top-1/2 -translate-y-1/2 right-0 w-[96%] aspect-square z-0 transition-transform duration-800 ease-out {!playback.paused
							? 'translate-x-[36%] sm:translate-x-[40%]'
							: 'translate-x-2'}"
					>
						<!-- Rotating Vinyl Disc Body (Whole Disc, Micro Grooves, Conic Specular Sheen & Center Label Spin Together) -->
						<div
							class="w-full h-full rounded-full bg-[#0a0c10] shadow-[0_25px_70px_rgba(0,0,0,0.95)] border border-white/10 relative flex items-center justify-center overflow-hidden {!playback.paused
								? 'animate-spin-vinyl'
								: 'animate-spin-vinyl-paused'}"
						>
							<!-- Micro Grooves Texture -->
							<div
								class="absolute inset-0 rounded-full"
								style="background: repeating-radial-gradient(circle at center, #0d1016 0, #0d1016 2.5px, #07080c 3px, #07080c 5px);"
							></div>
							<div class="absolute inset-3.5 rounded-full border border-white/[0.08] pointer-events-none"></div>
							<div class="absolute inset-7.5 rounded-full border border-white/[0.06] pointer-events-none"></div>
							<div class="absolute inset-12 rounded-full border border-white/[0.05] pointer-events-none"></div>
							<div class="absolute inset-17 rounded-full border border-white/[0.05] pointer-events-none"></div>
							<div class="absolute inset-22 rounded-full border border-white/[0.04] pointer-events-none"></div>
							<div class="absolute inset-27 rounded-full border border-white/[0.04] pointer-events-none"></div>

							<!-- Realistic 3D Conic Specular Holographic Reflection Sheen (Rotates with the disc!) -->
							<div
								class="absolute inset-0 rounded-full pointer-events-none opacity-45 mix-blend-screen"
								style="background: conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(255, 255, 255, 0.28) 45deg, transparent 90deg, transparent 180deg, rgba(255, 255, 255, 0.28) 225deg, transparent 270deg);"
							></div>

							<!-- Ambient Artwork Reflected Glow on Vinyl Grooves -->
							<div
								class="absolute inset-0 rounded-full pointer-events-none opacity-25 mix-blend-color-dodge"
								style="background: radial-gradient(circle at 50% 50%, {accent || '#ff0a78'}, transparent 70%);"
							></div>

							<!-- Center Album Label with Thumbnail & Spindle Hole -->
							<div
								class="relative z-10 size-22 sm:size-26 rounded-full flex items-center justify-center border-4 border-[#08090d] shadow-[0_0_15px_rgba(0,0,0,0.85)] overflow-hidden"
							>
								<img
									src={src || '/default_cover.jpg'}
									alt=""
									onerror={(e) => {
										(e.currentTarget as HTMLImageElement).src = '/default_cover.jpg';
									}}
									class="h-full w-full object-cover rounded-full select-none"
								/>
								<!-- Center Spindle Hole -->
								<div class="absolute size-4.5 rounded-full bg-[#050608] border-2 border-white/40 shadow-inner"></div>
							</div>
						</div>
					</div>

					<!-- Front Glass Artwork Sleeve -->
					<div class="relative z-10 w-full aspect-square rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.9)] ring-1 ring-white/20 bg-black/40 backdrop-blur-md">
						<img
							src={src || '/default_cover.jpg'}
							alt={playback.now?.title ?? 'Album Artwork'}
							onerror={(e) => {
								if (attempt < srcs.length - 1) {
									attempt++;
								} else {
									(e.currentTarget as HTMLImageElement).src = '/default_cover.jpg';
								}
							}}
							class="h-full w-full object-cover shadow-2xl transition-transform duration-700 select-none group-hover:scale-102"
						/>
						<div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
					</div>
				</div>

				<!-- Track Metadata & Action Row -->
				<div class="w-full flex items-start justify-between gap-3">
					<div class="min-w-0 flex-1">
						<h2 class="truncate font-heading text-lg sm:text-xl font-extrabold text-white tracking-tight drop-shadow-md">
							{playback.now?.title ?? 'Aura Music'}
						</h2>
						<p class="truncate text-xs sm:text-sm font-medium text-white/70 mt-0.5">
							{playback.now?.artists ?? 'Ready to Play'}
						</p>
					</div>

					<div class="flex items-center gap-2 shrink-0">
						<!-- Like Button with Pop Animation -->
						<button
							onclick={toggleLike}
							class="flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-white/20 hover:text-white active:scale-90 shadow-md"
							title="Like Song"
						>
							<span class:animate-heart-burst={justLiked} onanimationend={() => (justLiked = false)}>
								<HugeiconsIcon
									icon={FavouriteIcon}
									size={17}
									class={playback.rating === 'like' ? 'fill-current text-emerald-400 drop-shadow-[0_0_10px_#34d399]' : ''}
								/>
							</span>
						</button>

						<!-- More Button -->
						<button
							onclick={() => (cardMenuOpen = !cardMenuOpen)}
							class="flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-white/20 hover:text-white active:scale-90 shadow-md"
							title="More Options"
						>
							<HugeiconsIcon icon={MoreHorizontalIcon} size={17} />
						</button>
					</div>
				</div>

				<!-- Scrubber Timeline (Warm Golden-Amber Accent) -->
				<div class="w-full flex flex-col gap-1.5">
					<div
						class="relative flex h-4 w-full cursor-pointer select-none items-center group/seek"
						role="slider"
						tabindex="0"
						aria-valuemin="0"
						aria-valuemax={playback.duration || 100}
						aria-valuenow={shownPosition}
						aria-label={t('player.seek')}
						onmousemove={onScrubberMouseMove}
						onmouseleave={onScrubberMouseLeave}
						onkeydown={(e) => {
							if (e.key === 'ArrowRight') api.seek(Math.min(playback.duration, playback.position + 5));
							if (e.key === 'ArrowLeft') api.seek(Math.max(0, playback.position - 5));
						}}
						onclick={(e) => {
							const rect = e.currentTarget.getBoundingClientRect();
							const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
							const targetTime = pos * (playback.duration || 0);
							playback.position = targetTime;
							api.seek(targetTime);
						}}
					>
						<!-- Track Background -->
						<div class="w-full h-1.5 rounded-full bg-white/20 overflow-hidden transition-all group-hover/seek:h-2">
							<div
								class="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.85)]"
								style="width: {pct}%"
							></div>
						</div>

						<!-- Glowing Amber Scrubber Thumb -->
						<div
							class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-3.5 rounded-full bg-amber-200 border-2 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.95)] pointer-events-none transition-transform group-hover/seek:scale-130"
							style="left: {pct}%"
						></div>

						<!-- Hover Timestamp Tooltip -->
						{#if hoverSeekPos !== null}
							<div
								class="absolute -top-7 -translate-x-1/2 rounded-md bg-black/95 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 shadow-xl border border-amber-500/30 pointer-events-none"
								style="left: {hoverSeekPct}%"
							>
								{fmt(hoverSeekPos)}
							</div>
						{/if}

						<input
							type="range"
							class="sr-only"
							min="0"
							max={playback.duration || 0}
							value={shownPosition}
							oninput={(e) => (seekDrag = Number(e.currentTarget.value))}
							onchange={(e) => {
								const v = Number(e.currentTarget.value);
								playback.position = v;
								seekDrag = null;
								api.seek(v);
							}}
						/>
					</div>

					<!-- Timestamps: Left Elapsed, Right Total Duration -->
					<div class="flex justify-between text-[11px] font-mono font-medium text-white/70 tabular-nums">
						<span>{fmt(shownPosition)}</span>
						{#if playback.now?.duration === 'LIVE' || !playback.duration}
							<span class="text-amber-400 font-bold">LIVE</span>
						{:else}
							<span>{fmt(playback.duration)}</span>
						{/if}
					</div>
				</div>

				<!-- Playback Transport Row (Hero Circular Center Ring Play/Pause Button) -->
				<div class="w-full flex items-center justify-between px-2">
					<!-- Shuffle -->
					<button
						onclick={() => api.toggleShuffle()}
						class="flex size-9 cursor-pointer items-center justify-center rounded-full transition-all hover:bg-white/10 active:scale-95 {shuffleOn
							? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
							: 'text-white/60 hover:text-white'}"
						aria-label="Shuffle"
					>
						<HugeiconsIcon icon={ShuffleIcon} size={18} />
					</button>

					<!-- Previous -->
					<button
						onclick={() => api.prevTrack()}
						class="flex size-10 cursor-pointer items-center justify-center rounded-full text-white transition-all hover:bg-white/10 hover:scale-110 active:scale-90"
						aria-label="Previous Track"
					>
						<HugeiconsIcon icon={PreviousIcon} size={22} />
					</button>

					<!-- Hero Circular Ring Center Play/Pause Button (Matching Screenshot) -->
					<button
						onclick={() => api.togglePause()}
						class="flex size-15 sm:size-16 cursor-pointer items-center justify-center rounded-full border-2 border-amber-300/80 bg-black/45 text-amber-200 backdrop-blur-md shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all duration-200 hover:scale-108 hover:border-amber-200 hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] active:scale-95"
						aria-label={playback.paused ? t('player.play') : t('player.pause')}
					>
						<HugeiconsIcon
							icon={PauseIcon}
							altIcon={PlayIcon}
							showAlt={playback.paused}
							size={26}
							fill="currentColor"
							class={playback.paused ? 'ml-0.5' : ''}
						/>
					</button>

					<!-- Next -->
					<button
						onclick={() => api.nextTrack()}
						class="flex size-10 cursor-pointer items-center justify-center rounded-full text-white transition-all hover:bg-white/10 hover:scale-110 active:scale-90"
						aria-label="Next Track"
					>
						<HugeiconsIcon icon={NextIcon} size={22} />
					</button>

					<!-- Repeat -->
					<button
						onclick={cycleRepeat}
						class="flex size-9 cursor-pointer items-center justify-center rounded-full transition-all hover:bg-white/10 active:scale-95 {repeat !== 'off'
							? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
							: 'text-white/60 hover:text-white'}"
						aria-label="Repeat"
					>
						<HugeiconsIcon
							icon={RepeatIcon}
							altIcon={RepeatOne01Icon}
							showAlt={repeat === 'one'}
							size={18}
						/>
					</button>
				</div>

				<!-- Bottom Utility Row (Volume Bar + EQ + Fullscreen) -->
				<div class="w-full flex items-center justify-between gap-3 pt-2">
					<!-- Volume Control -->
					<div class="flex items-center gap-2 flex-1 max-w-[200px]">
						<button
							onclick={toggleMute}
							class="text-white/60 hover:text-white transition cursor-pointer"
							aria-label="Mute"
						>
							<HugeiconsIcon
								icon={VolumeHighIcon}
								altIcon={VolumeMute02Icon}
								showAlt={playback.volume === 0}
								size={16}
							/>
						</button>
						<input
							type="range"
							class="range flex-1 h-1.5 cursor-pointer accent-amber-400"
							min="0"
							max="100"
							value={playback.volume}
							oninput={(e) => dragVolume(Number(e.currentTarget.value))}
							onchange={(e) => commitVolume(Number(e.currentTarget.value))}
							aria-label="Volume"
						/>
					</div>

					<!-- Right Utilities -->
					<div class="flex items-center gap-2">
						<!-- Equalizer -->
						<button
							onclick={() => (showEq = true)}
							class="flex size-8 cursor-pointer items-center justify-center rounded-full text-white/60 transition-all hover:bg-white/10 hover:text-white active:scale-95 {audioFx.eqPreset !== 'flat' ? 'text-amber-400' : ''}"
							title="Equalizer & Audio Master"
							aria-label="Equalizer"
						>
							<HugeiconsIcon icon={AudioWave02Icon} size={16} />
						</button>

						<!-- Fullscreen Toggle -->
						<button
							onclick={toggleNativeFullscreen}
							class="flex size-8 cursor-pointer items-center justify-center rounded-full text-white/60 transition-all hover:bg-white/10 hover:text-white active:scale-95"
							title={isNativeFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
							aria-label="Fullscreen"
						>
							<HugeiconsIcon icon={isNativeFullscreen ? MinimizeScreenIcon : MaximizeScreenIcon} size={16} />
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- 🎤 RIGHT STAGE: Synced Lyrics / Queue / Visualizer / About -->
		<div class="relative flex h-full w-full flex-col justify-center overflow-hidden px-4 sm:px-8 lg:px-10">
			<div class="relative min-h-0 flex-1 overflow-hidden flex flex-col justify-center">
				{#if activeTab === 'lyrics'}
					<div in:fade={{ duration: 250 }} class="h-full flex flex-col overflow-hidden [&_*]:[scrollbar-width:none] [&_*::-webkit-scrollbar]:hidden">
						<LyricsView expanded />
					</div>
				{:else if activeTab === 'queue'}
					<div in:fade={{ duration: 250 }} class="h-full flex flex-col overflow-hidden max-w-xl mx-auto w-full my-auto rounded-3xl border border-white/15 bg-black/60 p-5 backdrop-blur-3xl shadow-2xl">
						<div class="flex items-center justify-between pb-3 border-b border-white/10">
							<h3 class="font-heading text-lg font-bold text-white">Up Next</h3>
							<span class="text-xs font-mono text-white/50">{playback.queue.items.length} tracks</span>
						</div>
						<div class="min-h-0 flex-1 overflow-y-auto mt-2">
							<QueueList scrollMemory={queueScrollMemory} />
						</div>
					</div>
				{:else if activeTab === 'visualizer'}
					<div in:fade={{ duration: 250 }} class="h-full w-full flex flex-col overflow-hidden relative my-auto [mask-image:radial-gradient(ellipse_95%_95%_at_center,black_60%,transparent_100%)]">
						<VisualizerStudio inline />
					</div>
				{:else if activeTab === 'about'}
					<div in:fade={{ duration: 250 }} class="h-full flex flex-col justify-center max-w-lg mx-auto w-full my-auto rounded-3xl border border-white/15 bg-black/65 p-6 backdrop-blur-3xl shadow-2xl space-y-4">
						<div class="flex items-center gap-3 pb-3 border-b border-white/10">
							<span class="flex size-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
								<HugeiconsIcon icon={InformationCircleIcon} size={22} />
							</span>
							<div>
								<h3 class="font-heading text-lg font-bold text-white">Track & Audio Details</h3>
								<p class="text-xs text-white/60">Aura High-Fidelity Audio Engine</p>
							</div>
						</div>

						<div class="grid grid-cols-2 gap-3 text-xs">
							<div class="rounded-xl bg-white/5 p-3 border border-white/10">
								<span class="text-white/50 block text-[10px] uppercase font-semibold tracking-wider">Audio Quality</span>
								<span class="text-emerald-400 font-bold text-sm mt-0.5 block">320 kbps Lossless</span>
							</div>
							<div class="rounded-xl bg-white/5 p-3 border border-white/10">
								<span class="text-white/50 block text-[10px] uppercase font-semibold tracking-wider">Audio Engine</span>
								<span class="text-amber-300 font-bold text-sm mt-0.5 block">Dual-Deck HTML5</span>
							</div>
							<div class="rounded-xl bg-white/5 p-3 border border-white/10">
								<span class="text-white/50 block text-[10px] uppercase font-semibold tracking-wider">Sample Rate</span>
								<span class="text-white/90 font-mono text-sm mt-0.5 block">48.0 kHz 24-bit</span>
							</div>
							<div class="rounded-xl bg-white/5 p-3 border border-white/10">
								<span class="text-white/50 block text-[10px] uppercase font-semibold tracking-wider">Equalizer Preset</span>
								<span class="text-primary font-bold text-sm mt-0.5 capitalize block">{audioFx.eqPreset}</span>
							</div>
						</div>

						{#if playback.now}
							<div class="rounded-xl bg-white/5 p-3 border border-white/10 text-xs space-y-1">
								<p><strong class="text-white/50 font-semibold">Title:</strong> <span class="text-white">{playback.now.title}</span></p>
								<p><strong class="text-white/50 font-semibold">Artist:</strong> <span class="text-white/80">{playback.now.artists}</span></p>
								{#if currentSong?.album}
									<p><strong class="text-white/50 font-semibold">Album:</strong> <span class="text-white/80">{currentSong.album}</span></p>
								{/if}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- ⌨️ Shortcuts Guide Dialog -->
	{#if showShortcutsGuide}
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div
			class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
			transition:fade={{ duration: 180 }}
			onclick={() => (showShortcutsGuide = false)}
		>
			<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
			<div
				class="relative w-full max-w-md rounded-3xl border border-white/20 bg-black/90 p-6 text-white shadow-2xl backdrop-blur-2xl"
				transition:scale={{ start: 0.92, duration: 200, easing: cubicOut }}
				onclick={(e) => e.stopPropagation()}
			>
				<div class="flex items-center justify-between pb-3 border-b border-white/15">
					<div class="flex items-center gap-2">
						<HugeiconsIcon icon={SparklesIcon} class="h-5 w-5 text-amber-400" />
						<h3 class="font-heading text-base font-bold">Theater Mode Shortcuts</h3>
					</div>
					<button
						onclick={() => (showShortcutsGuide = false)}
						class="text-white/60 hover:text-white rounded-full p-1 cursor-pointer"
					>
						✕
					</button>
				</div>

				<div class="grid grid-cols-2 gap-3 mt-4 text-xs">
					<div class="flex items-center justify-between rounded-xl bg-white/5 p-2 border border-white/10">
						<span class="text-white/70">Play / Pause</span>
						<kbd class="rounded bg-white/15 px-2 py-0.5 font-mono text-amber-300 font-bold">Space</kbd>
					</div>
					<div class="flex items-center justify-between rounded-xl bg-white/5 p-2 border border-white/10">
						<span class="text-white/70">Seek ±5s</span>
						<kbd class="rounded bg-white/15 px-2 py-0.5 font-mono text-amber-300 font-bold">← / →</kbd>
					</div>
					<div class="flex items-center justify-between rounded-xl bg-white/5 p-2 border border-white/10">
						<span class="text-white/70">Volume ±5%</span>
						<kbd class="rounded bg-white/15 px-2 py-0.5 font-mono text-amber-300 font-bold">↑ / ↓</kbd>
					</div>
					<div class="flex items-center justify-between rounded-xl bg-white/5 p-2 border border-white/10">
						<span class="text-white/70">Mute Toggle</span>
						<kbd class="rounded bg-white/15 px-2 py-0.5 font-mono text-amber-300 font-bold">M</kbd>
					</div>
					<div class="flex items-center justify-between rounded-xl bg-white/5 p-2 border border-white/10">
						<span class="text-white/70">Lyrics Tab</span>
						<kbd class="rounded bg-white/15 px-2 py-0.5 font-mono text-amber-300 font-bold">L</kbd>
					</div>
					<div class="flex items-center justify-between rounded-xl bg-white/5 p-2 border border-white/10">
						<span class="text-white/70">Visualizer Tab</span>
						<kbd class="rounded bg-white/15 px-2 py-0.5 font-mono text-amber-300 font-bold">V</kbd>
					</div>
					<div class="flex items-center justify-between rounded-xl bg-white/5 p-2 border border-white/10">
						<span class="text-white/70">Next / Prev</span>
						<kbd class="rounded bg-white/15 px-2 py-0.5 font-mono text-amber-300 font-bold">F / D</kbd>
					</div>
					<div class="flex items-center justify-between rounded-xl bg-white/5 p-2 border border-white/10">
						<span class="text-white/70">Exit Theater</span>
						<kbd class="rounded bg-white/15 px-2 py-0.5 font-mono text-amber-300 font-bold">Esc</kbd>
					</div>
				</div>
			</div>
		</div>
	{/if}
</section>

<EqualizerDialog bind:open={showEq} />
<SleepTimerModal bind:open={sleepModalOpen} />
