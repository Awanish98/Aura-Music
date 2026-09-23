<script lang="ts">
	import { onMount } from 'svelte';
	import { beforeNavigate } from '$app/navigation';
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		Cancel01Icon,
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
		AudioWave02Icon
	} from '@hugeicons/core-free-icons';
	import * as api from '$lib/api';
	import {
		audioFx,
		commitVolume,
		cycleRepeat,
		dragVolume,
		playback,
		toggleMute,
		toggleNowPlayingRating,
		ui,
		wheelVolume
	} from '$lib/player.svelte';
	import { artworkAccent } from '$lib/artcolor';
	import { hexToHsv } from '$lib/color';
	import { appearance } from '$lib/theme.svelte';
	import { thumb } from '$lib/thumb';
	import { t } from '$lib/i18n.svelte';
	import ArtistLine from './ArtistLine.svelte';
	import LyricsView from './LyricsView.svelte';
	import EqualizerDialog from './EqualizerDialog.svelte';

	const close = () => {
		if (typeof document !== 'undefined' && document.fullscreenElement) {
			document.exitFullscreen().catch(() => {});
		}
		ui.theaterOpen = false;
	};

	beforeNavigate(close);

	let isNativeFullscreen = $state(false);

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

	onMount(() => {
		api.theaterFullscreen(true).catch((e) => console.error('theater fullscreen failed', e));
		updateFullscreenStatus();
		document.addEventListener('fullscreenchange', updateFullscreenStatus);

		return () => {
			document.removeEventListener('fullscreenchange', updateFullscreenStatus);
			api.theaterFullscreen(false).catch(() => {});
		};
	});

	function onKey(e: KeyboardEvent) {
		if (e.defaultPrevented) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			close();
		}
	}

	let idle = $state(false);
	let idleTimer: ReturnType<typeof setTimeout>;
	function wake() {
		idle = false;
		clearTimeout(idleTimer);
		idleTimer = setTimeout(() => (idle = true), 4000);
	}
	onMount(() => {
		wake();
		return () => clearTimeout(idleTimer);
	});

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

	const MAX_WASHES = 8;
	const washes = new Map<string, string>();
	let wash = $state<string | null>(null);
	$effect(() => {
		const url = thumb(playback.now?.thumbnail, 400);
		if (!url) {
			wash = null;
			return;
		}
		const hit = washes.get(url);
		if (hit !== undefined) {
			wash = hit;
			return;
		}
		let alive = true;
		bake(url).then((data) => {
			if (!alive || !data) return;
			if (washes.size >= MAX_WASHES && !washes.has(url)) {
				const oldest = washes.keys().next().value;
				if (oldest !== undefined) washes.delete(oldest);
			}
			washes.set(url, data);
			wash = data;
		});
		return () => {
			alive = false;
		};
	});

	const WASH = 160;
	const WASH_BLUR = 28;
	async function bake(url: string): Promise<string | null> {
		try {
			const img = new Image();
			img.crossOrigin = 'anonymous';
			img.src = url;
			await img.decode();
			const canvas = document.createElement('canvas');
			canvas.width = canvas.height = WASH;
			const ctx = canvas.getContext('2d');
			if (!ctx) return null;
			ctx.imageSmoothingQuality = 'high';
			const over = WASH_BLUR * 1.6;
			const canFilter = typeof ctx.filter === 'string';
			if (canFilter) {
				ctx.filter = `blur(${WASH_BLUR}px) saturate(1.6)`;
				ctx.drawImage(img, -over, -over, WASH + over * 2, WASH + over * 2);
			} else {
				const small = document.createElement('canvas');
				small.width = small.height = 20;
				small.getContext('2d')?.drawImage(img, 0, 0, 20, 20);
				ctx.drawImage(small, -over, -over, WASH + over * 2, WASH + over * 2);
			}
			return canvas.toDataURL('image/png');
		} catch {
			return null;
		}
	}

	const hue = $derived(accent ? (hexToHsv(accent)?.h ?? null) : null);
	const mesh = $derived.by(() => {
		const h = hue ?? 265;
		const a = (deg: number) => (h + deg + 360) % 360;
		return [
			`radial-gradient(70% 60% at 15% 20%, hsl(${a(0)} 75% 50% / 0.38), transparent 70%)`,
			`radial-gradient(60% 55% at 85% 80%, hsl(${a(42)} 72% 46% / 0.32), transparent 70%)`,
			`radial-gradient(55% 50% at 70% 12%, hsl(${a(-45)} 68% 54% / 0.25), transparent 70%)`
		].join(',');
	});
	const glow = $derived(`radial-gradient(closest-side, hsl(${hue ?? 265} 85% 55% / 0.55), transparent)`);

	const fmt = (secs: number) => {
		if (!secs || secs < 0 || !isFinite(secs) || isNaN(secs)) return '0:00';
		const s = Math.floor(secs);
		const h = Math.floor(s / 3600);
		const m = Math.floor((s % 3600) / 60);
		const mm = h ? String(m).padStart(2, '0') : `${m}`;
		return `${h ? `${h}:` : ''}${mm}:${String(s % 60).padStart(2, '0')}`;
	};

	let seekDrag = $state<number | null>(null);
	const shownPosition = $derived(seekDrag ?? playback.position);
	const pct = $derived(playback.duration ? (shownPosition / playback.duration) * 100 : 0);

	const shuffleOn = $derived(playback.queue.shuffle ?? false);
	const repeat = $derived(playback.queue.repeat ?? 'off');
	const local = $derived(!!playback.now && api.isLocalId(playback.now.videoId));
	const album = $derived.by(() => {
		const cur = playback.queue.items[playback.queue.currentIndex];
		return cur?.video_id === playback.now?.videoId ? cur?.album : null;
	});

	let showLyrics = $state(true);
	let showEq = $state(false);

	let justLiked = $state(false);
	function toggleLike() {
		if (playback.rating !== 'like') justLiked = true;
		toggleNowPlayingRating();
	}
</script>

<svelte:window onkeydown={onKey} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<section
	transition:fade={{ duration: 250 }}
	onwheel={wheelVolume}
	onpointermove={wake}
	class="theater fixed inset-0 z-40 flex flex-col overflow-hidden bg-background text-foreground select-none"
>
	<!-- Ambient Multi-Layered Glow Backdrop -->
	{#if wash}
		<div
			in:fade={{ duration: 800 }}
			style="background-image:url({wash});background-size:cover;background-position:center"
			class="pointer-events-none absolute inset-0 opacity-40 dark:opacity-55 scale-105 blur-2xl"
		></div>
	{:else if src}
		<img
			{src}
			alt=""
			class="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30 dark:opacity-45 scale-125 blur-3xl"
		/>
	{/if}

	<!-- Room Light Glowing Mesh -->
	<div class="pointer-events-none absolute -inset-[15%]" style="background-image:{mesh}"></div>
	
	<!-- Vignette overlay for text contrast -->
	<div
		class="pointer-events-none absolute inset-0 bg-[radial-gradient(115%_90%_at_50%_42%,transparent_20%,var(--background)_95%)]"
	></div>
	<div
		class="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-background to-transparent"
	></div>

	<!-- Top Navigation Bar (Always reachable, dims subtly when idle) -->
	<header
		class="relative z-20 flex shrink-0 items-center justify-between px-6 py-4 xl:px-12 transition-opacity duration-300 {idle
			? 'opacity-40 hover:opacity-100'
			: 'opacity-100'}"
	>
		<!-- Left: Minimize to Mini-player / Return to App Pill -->
		<div class="flex items-center gap-3">
			<button
				onclick={close}
				class="flex items-center gap-2 rounded-full border border-white/20 bg-black/40 hover:bg-black/60 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-xl transition-all active:scale-95 shadow-lg"
				title="Minimize / Return to App (Esc)"
				aria-label="Minimize / Return to App"
			>
				<HugeiconsIcon icon={ArrowDown01Icon} class="h-4 w-4 text-primary" />
				<span>Minimize</span>
				<kbd class="hidden sm:inline-block rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-mono text-white/90">Esc</kbd>
			</button>

			{#if playback.queue.sourceName}
				<div class="hidden md:flex flex-col min-w-0 pl-2">
					<span class="text-[10px] font-bold uppercase tracking-widest text-white/60">
						{t('player.playing_from')}
					</span>
					<span class="truncate text-xs font-semibold text-white/90 max-w-[240px]">
						{playback.queue.sourceName}
					</span>
				</div>
			{/if}
		</div>

		<!-- Center: Quality & Status Badge -->
		<div class="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur-md">
			<span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
			<span>Lossless 320kbps</span>
			<span class="text-white/40">•</span>
			<span class="text-primary font-semibold">Aura Hi-Fi</span>
		</div>

		<!-- Right: Controls & Exit -->
		<div class="flex items-center gap-2">
			<!-- Lyrics Toggle -->
			<button
				onclick={() => (showLyrics = !showLyrics)}
				class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/80 backdrop-blur-md transition-all hover:bg-black/60 hover:text-white active:scale-95 {showLyrics ? 'text-primary border-primary/50 bg-primary/20' : ''}"
				title="{showLyrics ? 'Hide Lyrics' : 'Show Lyrics'}"
				aria-label={t('player.lyrics')}
			>
				<HugeiconsIcon icon={Mic01Icon} class="h-4 w-4" />
			</button>

			<!-- Equalizer -->
			<button
				onclick={() => (showEq = !showEq)}
				class="hidden sm:flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/80 backdrop-blur-md transition-all hover:bg-black/60 hover:text-white active:scale-95 {audioFx.eqPreset !== 'flat' ? 'text-primary border-primary/50' : ''}"
				title="Equalizer & Sound Effects"
				aria-label="Equalizer"
			>
				<HugeiconsIcon icon={AudioWave02Icon} class="h-4 w-4" />
			</button>

			<!-- Fullscreen Toggle -->
			<button
				onclick={toggleNativeFullscreen}
				class="hidden sm:flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/80 backdrop-blur-md transition-all hover:bg-black/60 hover:text-white active:scale-95"
				title="{isNativeFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}"
				aria-label="Toggle Fullscreen"
			>
				<HugeiconsIcon icon={isNativeFullscreen ? MinimizeScreenIcon : MaximizeScreenIcon} class="h-4 w-4" />
			</button>

			<!-- Close Button -->
			<button
				onclick={close}
				class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/80 backdrop-blur-md transition-all hover:bg-red-500/80 hover:text-white hover:border-red-500 active:scale-95 shadow-lg"
				title="{t('player.exit_theater')} (Esc)"
				aria-label={t('player.exit_theater')}
			>
				<HugeiconsIcon icon={Cancel01Icon} class="h-4 w-4" />
			</button>
		</div>
	</header>

	<!-- Main Content Area: Left Player + Right Synced Lyrics -->
	<div
		class="relative z-10 mx-auto grid min-h-0 w-full max-w-[108rem] flex-1 grid-rows-[minmax(0,1fr)] gap-8 px-6 pb-8 lg:px-12 xl:gap-16 {showLyrics
			? 'lg:grid-cols-[minmax(22rem,0.9fr)_minmax(0,1.1fr)]'
			: ''}"
	>
		<!-- Left: Album Art, Song Details & Transport Controls -->
		<div
			class="mx-auto flex w-full flex-col justify-center self-center {showLyrics ? 'max-w-[32rem]' : 'max-w-[38rem]'}"
		>
			<!-- Artwork with Glowing Aura -->
			<div class="relative mx-auto w-full max-w-[28rem]">
				<div
					class="pointer-events-none absolute -inset-6 -z-10 rounded-3xl opacity-75 blur-2xl"
					style="background-image:{glow}"
				></div>

				{#key playback.now?.videoId}
					<div in:scale={{ start: 0.94, duration: 420, easing: cubicOut }} class="relative">
						{#if src && attempt < srcs.length}
							<img
								{src}
								alt={playback.now?.title ?? 'Album artwork'}
								onerror={() => attempt++}
								class="aspect-square w-full rounded-3xl bg-cover object-cover shadow-[0_20px_60px_rgba(0,0,0,0.6)] ring-1 ring-white/15 transition-transform duration-500 hover:scale-[1.01]"
							/>
						{:else}
							<div
								class="flex aspect-square w-full items-center justify-center rounded-3xl bg-white/5 text-white/40 ring-1 ring-white/10 shadow-2xl"
							>
								<HugeiconsIcon icon={MusicNote01Icon} class="h-24 w-24" />
							</div>
						{/if}
						<div class="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/15"></div>
					</div>
				{/key}
			</div>

			<!-- Track Title & Metadata (Unclipped with line-clamp-2) -->
			<div class="mt-6 flex items-start justify-between gap-4">
				<div class="min-w-0 flex-1">
					<h1
						class="font-heading text-2xl md:text-3xl xl:text-4xl font-black leading-snug tracking-tight text-white drop-shadow-md line-clamp-2"
						title={playback.now?.title}
					>
						{playback.now?.title ?? t('player.not_playing')}
					</h1>
					<ArtistLine
						runs={playback.now?.artistRuns}
						text={playback.now?.artists ?? ''}
						class="mt-2 block text-base md:text-lg font-medium text-white/75"
					/>
					{#if album}
						<p class="mt-0.5 truncate text-xs md:text-sm font-medium text-white/50">{album}</p>
					{/if}
				</div>

				<!-- Action Buttons (Like / Favorite) -->
				{#if playback.now && !local}
					<div class="flex shrink-0 items-center pt-1">
						<button
							onclick={toggleLike}
							class="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition-all hover:bg-white/15 hover:text-white active:scale-95 shadow-md"
							aria-label={t('common.like')}
						>
							<span
								class="inline-flex"
								class:animate-heart-pop={justLiked}
								onanimationend={() => (justLiked = false)}
							>
								<HugeiconsIcon
									icon={FavouriteIcon}
									class="h-5 w-5 {playback.rating === 'like' ? 'fill-current text-primary' : ''}"
								/>
							</span>
						</button>
					</div>
				{/if}
			</div>

			<!-- Scrubber Timeline Slider -->
			<div class="mt-6">
				<input
					type="range"
					class="range theater-range w-full cursor-pointer"
					style="--pct:{pct}%"
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
					aria-label={t('player.seek')}
				/>
				<div class="mt-2 flex justify-between text-xs font-semibold tabular-nums text-white/60">
					<span>{fmt(shownPosition)}</span>
					{#if playback.now?.duration === 'LIVE' || !playback.duration}
						<span class="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">LIVE</span>
					{:else}
						<span>{fmt(playback.duration)}</span>
					{/if}
				</div>
			</div>

			<!-- Large Transport Controls -->
			<div class="mt-5 flex items-center justify-center gap-3 md:gap-5">
				<button
					onclick={() => api.toggleShuffle()}
					class="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition-all hover:bg-white/10 active:scale-95 {shuffleOn
						? 'text-primary'
						: 'text-white/60 hover:text-white'}"
					aria-label={t('player.shuffle')}
					aria-pressed={shuffleOn}
				>
					<HugeiconsIcon icon={ShuffleIcon} class="h-5 w-5" />
				</button>
				
				<button
					onclick={() => api.prevTrack()}
					class="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-white/90 transition-all hover:bg-white/10 hover:text-white active:scale-95"
					aria-label={t('player.previous')}
				>
					<HugeiconsIcon icon={PreviousIcon} class="h-6 w-6" />
				</button>
				
				<button
					onclick={() => api.togglePause()}
					class="mx-1 flex h-[68px] w-[68px] cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/50 transition-all duration-200 hover:scale-[1.08] active:scale-95"
					aria-label={playback.paused ? t('player.play') : t('player.pause')}
				>
					<HugeiconsIcon
						icon={PauseIcon}
						altIcon={PlayIcon}
						showAlt={playback.paused}
						class="h-8 w-8"
					/>
				</button>
				
				<button
					onclick={() => api.nextTrack()}
					class="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-white/90 transition-all hover:bg-white/10 hover:text-white active:scale-95"
					aria-label={t('player.next')}
				>
					<HugeiconsIcon icon={NextIcon} class="h-6 w-6" />
				</button>
				
				<button
					onclick={cycleRepeat}
					class="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition-all hover:bg-white/10 active:scale-95 {repeat !==
					'off'
						? 'text-primary'
						: 'text-white/60 hover:text-white'}"
					aria-label={t('player.repeat_state', {
						state:
							repeat === 'off'
								? t('player.repeat_off')
								: repeat === 'one'
									? t('player.repeat_one')
									: t('player.repeat_all')
					})}
					aria-pressed={repeat !== 'off'}
				>
					<HugeiconsIcon
						icon={RepeatIcon}
						altIcon={RepeatOne01Icon}
						showAlt={repeat === 'one'}
						class="h-5 w-5"
					/>
				</button>
			</div>

			<!-- Volume Controls Bar -->
			<div class="mt-5 flex items-center justify-center gap-3">
				<button
					class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white/70 transition-colors hover:text-white active:scale-95"
					onclick={toggleMute}
					aria-label={playback.volume === 0 ? t('player.unmute') : t('player.mute')}
				>
					<HugeiconsIcon
						icon={VolumeHighIcon}
						altIcon={VolumeMute02Icon}
						showAlt={playback.volume === 0}
						class="h-4 w-4"
					/>
				</button>
				<input
					type="range"
					class="range w-36 max-w-full cursor-pointer"
					style="--pct:{playback.volume}%"
					min="0"
					max="100"
					value={playback.volume}
					oninput={(e) => dragVolume(Number(e.currentTarget.value))}
					onchange={(e) => commitVolume(Number(e.currentTarget.value))}
					aria-label={t('player.volume')}
				/>
				<span class="text-xs font-semibold tabular-nums text-white/60 w-8">{playback.volume}%</span>
			</div>
		</div>

		<!-- Right: Synced Lyrics View -->
		{#if showLyrics}
			<div
				in:fly={{ y: 24, duration: 400, easing: cubicOut }}
				class="hidden h-full min-h-0 flex-col overflow-hidden lg:flex [&_*]:[scrollbar-width:none] [&_*::-webkit-scrollbar]:hidden"
			>
				<LyricsView expanded />
			</div>
		{/if}
	</div>
</section>

<EqualizerDialog bind:open={showEq} />
