<script lang="ts">
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { beforeNavigate, goto } from '$app/navigation';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		Maximize01Icon,
		Minimize01Icon,
		MaximizeScreenIcon,
		Mic01Icon,
		MusicNote01Icon,
		PlayIcon,
		PauseIcon,
		PreviousIcon,
		NextIcon,
		ShuffleIcon,
		RepeatIcon,
		RepeatOne01Icon,
		Queue01Icon,
		Video01Icon,
		VideoOffIcon,
		VolumeHighIcon,
		VolumeMute02Icon,
		SparklesIcon,
		AudioWave01Icon,
		AudioWave02Icon,
		ArrowDown01Icon,
		FavouriteIcon,
		Add01Icon,
		Share01Icon,
		InfinityIcon,
		CdIcon
	} from '@hugeicons/core-free-icons';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as api from '$lib/api';
	import {
		np,
		playback,
		ui,
		wheelVolume,
		audioFx,
		cycleRepeat,
		dragVolume,
		commitVolume,
		toggleMute,
		toggleNowPlayingRating,
		openAddToPlaylist,
		openShare
	} from '$lib/player.svelte';
	import { canVideo, claimVideo, parkVideo, showVideo, video } from '$lib/video.svelte';
	import { appearance } from '$lib/theme.svelte';
	import { t } from '$lib/i18n.svelte';
	import { thumb, generateAvatarSvg } from '$lib/thumb';
	import QueueList from './QueueList.svelte';
	import type { QueueScrollMemory } from '$lib/queue-history';
	import LyricsView from './LyricsView.svelte';
	import AiSongStory from './AiSongStory.svelte';
	import VisualizerStudio from './VisualizerStudio.svelte';
	import ArtistLine from './ArtistLine.svelte';
	import EqualizerDialog from './EqualizerDialog.svelte';
	import LiveSongCanvas from './LiveSongCanvas.svelte';
	import Marquee from './Marquee.svelte';

	let { queueOpen, lyricsOpen }: { queueOpen: boolean; lyricsOpen: boolean } = $props();
	const tabbed = $derived(appearance.tabbedPlayer);
	const queueScrollMemory: QueueScrollMemory = {};
	const panels = $derived(Number(queueOpen) + Number(lyricsOpen));
	const inset = $derived(['', 'lg:right-80', 'lg:right-[40rem]'][panels]);

	beforeNavigate(() => (np.open = false));

	let big = $state(false);
	$effect(() => {
		if (np.tab !== 'lyrics') big = false;
	});

	let showEq = $state(false);
	let justLiked = $state(false);
	let artViewMode = $state<'canvas' | 'cover' | 'vinyl'>('canvas');

	function toggleLike() {
		if (playback.rating !== 'like') justLiked = true;
		toggleNowPlayingRating();
	}

	let attempt = $state(0);
	let bgFailed = $state(false);
	$effect(() => {
		playback.now?.thumbnail;
		attempt = 0;
		bgFailed = false;
	});
	const srcs = $derived([720, 400, 120].map((px) => thumb(playback.now?.thumbnail, px)));
	const src = $derived(srcs[attempt]);

	let flash: 'play' | 'pause' | null = $state(null);
	let flashTimer: ReturnType<typeof setTimeout>;
	function toggle() {
		flash = playback.paused ? 'play' : 'pause';
		clearTimeout(flashTimer);
		flashTimer = setTimeout(() => (flash = null), 220);
		api.togglePause();
	}

	let volFlash = $state(false);
	let volTimer: ReturnType<typeof setTimeout>;
	function onWheel(e: WheelEvent) {
		wheelVolume(e);
		volFlash = true;
		clearTimeout(volTimer);
		volTimer = setTimeout(() => (volFlash = false), 1000);
	}

	const fmt = (secs: number) => {
		if (!secs || secs < 0 || !isFinite(secs) || isNaN(secs)) return '0:00';
		const t = Math.floor(secs);
		const h = Math.floor(t / 3600);
		const m = Math.floor((t % 3600) / 60);
		const s = t % 60;
		const mm = h ? m.toString().padStart(2, '0') : `${m}`;
		return `${h ? `${h}:` : ''}${mm}:${s.toString().padStart(2, '0')}`;
	};

	const shuffleOn = $derived(playback.queue.shuffle ?? false);
	const repeat = $derived(playback.queue.repeat ?? 'off');

	const currentSong = $derived.by(() => {
		const cur = playback.queue.items[playback.queue.currentIndex];
		return cur?.video_id === playback.now?.videoId ? cur : null;
	});

	const albumId = $derived(
		currentSong && !api.isLocalId(currentSong.video_id) ? currentSong.album_id : undefined
	);

	const autoplayTrack = $derived.by(() => {
		const cur = playback.queue.items[playback.queue.currentIndex];
		return !!cur?.autoplay && cur.video_id === playback.now?.videoId;
	});

	let seekDrag = $state<number | null>(null);
	const shownPosition = $derived(seekDrag ?? playback.position);

	function onSeekInput(e: Event) {
		seekDrag = Number((e.target as HTMLInputElement).value);
	}
	function onSeekCommit(e: Event) {
		const v = Number((e.target as HTMLInputElement).value);
		playback.position = v;
		seekDrag = null;
		api.seek(v);
	}

	const onVolume = (e: Event) => dragVolume(Number((e.target as HTMLInputElement).value));
	const onVolumeCommit = (e: Event) => commitVolume(Number((e.target as HTMLInputElement).value));
</script>

<!-- Full Desktop Now Playing Experience (Integrated Controls + Ambient Glow) -->
<div
	transition:fly={{ y: '100%', duration: 320, easing: cubicOut }}
	class="absolute inset-y-0 left-16 right-0 z-20 flex justify-center overflow-hidden bg-background/95 text-foreground backdrop-blur-3xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8 {ui.sidebarCollapsed
		? ''
		: 'lg:left-60'} {inset}"
>
	<!-- Apple Music & Spotify Style Live Ambient Motion Canvas Background -->
	{#if audioFx.liveCanvasEnabled && !showVideo()}
		<LiveSongCanvas class="pointer-events-none absolute inset-0 z-0 opacity-40 dark:opacity-60" />
	{:else if appearance.artworkBackground && !showVideo() && srcs[2] && !bgFailed}
		<img
			src={srcs[2]}
			alt=""
			onerror={() => (bgFailed = true)}
			class="pointer-events-none absolute inset-0 h-full w-full art-wash scale-125 object-cover opacity-35 blur-3xl dark:opacity-45"
		/>
	{:else if appearance.artworkBackground && !showVideo()}
		<div
			class="pointer-events-none absolute inset-0 h-full w-full opacity-25 blur-3xl transition-opacity duration-700 dark:opacity-35"
			style="background: radial-gradient(circle at 40% 40%, #a855f7 0%, #ec4899 45%, #3b82f6 80%, transparent 100%)"
		></div>
	{/if}
	<div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-background/75 to-background"></div>

	<!-- Main Container -->
	<div class="relative z-10 flex w-full max-w-[98rem] h-full min-h-0 gap-6 xl:gap-8 {big ? 'justify-center' : ''}">
		<!-- Left: Album Art & Integrated Player Controls (Hidden when lyrics enlarged) -->
		{#if !big}
			<div class="flex flex-col justify-between w-full md:w-[22rem] lg:w-[26rem] xl:w-[29rem] shrink-0 h-full min-h-0 py-1 overflow-y-auto no-scrollbar">
				<!-- Artwork Container with Badges & Minimize Button -->
				<div class="relative w-full max-w-[280px] lg:max-w-[320px] xl:max-w-[340px] mx-auto shrink-0" onwheel={onWheel}>
					{#if volFlash}
						<div
							transition:fade={{ duration: 120 }}
							class="pointer-events-none absolute left-3 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-2 rounded-full border bg-popover/90 px-2 py-3 text-popover-foreground shadow-2xl backdrop-blur-md"
						>
							<HugeiconsIcon
								icon={VolumeHighIcon}
								altIcon={VolumeMute02Icon}
								showAlt={playback.volume === 0}
								class="h-4 w-4"
							/>
							<div class="relative h-20 w-1 overflow-hidden rounded-full bg-muted">
								<div
									class="absolute inset-x-0 bottom-0 rounded-full bg-primary"
									style="height:{playback.volume}%"
								></div>
							</div>
							<span class="text-[10px] tabular-nums">{playback.volume}</span>
						</div>
					{/if}

					<!-- Dynamic Glowing Vinyl / Cover / Live Canvas Container -->
					<div class="relative w-full aspect-square flex items-center justify-center">
						<!-- Ambient Aura Glow Ring behind art when playing -->
						{#if !playback.paused}
							<div class="pointer-events-none absolute -inset-3 rounded-full bg-gradient-to-tr from-pink-500/40 via-purple-500/30 to-cyan-400/40 blur-2xl animate-pulse opacity-85"></div>
						{/if}

						<button
							type="button"
							onclick={toggle}
							aria-label={t('a11y.play_pause')}
							class="block w-full h-full cursor-pointer relative group transition-transform duration-300 hover:scale-[1.015] {artViewMode === 'vinyl' ? 'rounded-full' : 'rounded-3xl overflow-hidden shadow-2xl'}"
						>
							{#if flash}
								<div
									in:scale={{ start: 0.7, duration: 150, easing: cubicOut }}
									out:scale={{ start: 1.3, duration: 320, easing: cubicOut }}
									class="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[2px] {artViewMode === 'vinyl' ? 'rounded-full' : 'rounded-3xl'}"
								>
									<div class="rounded-full bg-black/70 p-4 text-white shadow-2xl ring-1 ring-white/20">
										<HugeiconsIcon
											icon={PauseIcon}
											altIcon={PlayIcon}
											showAlt={flash === 'play'}
											class="h-8 w-8"
										/>
									</div>
								</div>
							{/if}

							<div
								class="contents"
								{@attach (box: HTMLElement) => {
									claimVideo(box);
									return parkVideo;
								}}
							></div>

							{#if artViewMode === 'canvas'}
								<!-- 🌟 Apple Music & Spotify Live Animated Motion Canvas Artwork -->
								<div class="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/15">
									<LiveSongCanvas class="w-full h-full" />
									<div class="absolute bottom-2.5 right-3 px-2 py-0.5 rounded-full bg-black/50 text-[10px] font-bold text-white/90 backdrop-blur-md border border-white/10 pointer-events-none flex items-center gap-1">
										<span class="size-1.5 rounded-full bg-emerald-400 animate-ping"></span>
										<span>Live Canvas</span>
									</div>
								</div>
							{:else if artViewMode === 'vinyl'}
								<!-- Realistic Audiophile Spinning 12-inch Vinyl LP Record -->
								<div class="relative w-full h-full rounded-full bg-[#0a0a0f] shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_0_0_2px_rgba(255,255,255,0.12)] flex items-center justify-center overflow-hidden {!playback.paused ? 'animate-spin-vinyl' : 'animate-spin-vinyl-paused'}">
									<!-- Concentric Vinyl Grooves -->
									<div class="absolute inset-2 rounded-full border border-white/[0.04] shadow-[inset_0_0_15px_rgba(0,0,0,0.9)]"></div>
									<div class="absolute inset-5 rounded-full border border-white/[0.05]"></div>
									<div class="absolute inset-9 rounded-full border border-white/[0.04]"></div>
									<div class="absolute inset-13 rounded-full border border-white/[0.06]"></div>
									<div class="absolute inset-17 rounded-full border border-white/[0.04]"></div>
									<div class="absolute inset-21 rounded-full border border-white/[0.05]"></div>
									<!-- Holographic Light Reflections -->
									<div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.09] to-transparent pointer-events-none"></div>
									<div class="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.06] to-transparent pointer-events-none"></div>
									<!-- Center Artwork Label -->
									<div class="relative w-[38%] h-[38%] rounded-full overflow-hidden border-2 border-white/25 shadow-2xl ring-2 ring-black/80">
										{#if src}
											<img
												{src}
												alt={playback.now?.title || 'Aura'}
												class="w-full h-full object-cover"
												decoding="async"
											/>
										{:else}
											<img
												src={generateAvatarSvg(playback.now?.title || 'Aura', 'song')}
												alt={playback.now?.title || 'Aura'}
												class="w-full h-full object-cover"
												decoding="async"
											/>
										{/if}
										<!-- Spindle Center Hole -->
										<div class="absolute inset-0 m-auto w-4 h-4 rounded-full bg-[#070709] border-2 border-white/40 shadow-inner"></div>
									</div>
								</div>
							{:else}
								<!-- Premium Album Cover Sleeve with Aura Glow -->
								{#if !showVideo() && src && attempt < srcs.length}
									<img
										{src}
										alt={playback.now?.title || 'Aura'}
										onerror={(e) => {
											if (attempt < srcs.length - 1) {
												attempt++;
											} else {
												const target = e.currentTarget as HTMLImageElement;
												target.src = generateAvatarSvg(playback.now?.title || 'Aura', 'song');
											}
										}}
										class="aspect-square w-full rounded-3xl object-cover shadow-2xl ring-1 ring-white/10 transition-all duration-500 {!playback.paused ? 'artwork-aura-playing' : ''}"
										decoding="async"
									/>
								{:else if !showVideo()}
									<img
										src={generateAvatarSvg(playback.now?.title || 'Aura', 'song')}
										alt={playback.now?.title || 'Aura'}
										class="aspect-square w-full rounded-3xl object-cover shadow-2xl ring-1 ring-white/10 transition-all duration-500 {!playback.paused ? 'artwork-aura-playing' : ''}"
										decoding="async"
									/>
								{/if}
							{/if}
						</button>
					</div>

					<!-- Artwork Floating Header Badges (Live Canvas + Vinyl Disc + Cover + Visualizer) -->
					<div class="absolute left-3 top-3 z-10 flex items-center gap-1.5">
						<!-- Live Canvas Toggle Button -->
						<button
							type="button"
							onclick={() => (artViewMode = artViewMode === 'canvas' ? 'cover' : 'canvas')}
							aria-label="Toggle Apple & Spotify Live Canvas"
							class="flex items-center gap-1.5 cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-bold backdrop-blur-md transition-all border shadow-lg active:scale-95 {artViewMode === 'canvas'
								? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-400/50 shadow-emerald-500/30'
								: 'bg-black/60 text-white/80 hover:text-white border-white/10'}"
							title="Apple Music & Spotify Live Canvas Motion"
						>
							<HugeiconsIcon icon={SparklesIcon} class="h-3.5 w-3.5 {artViewMode === 'canvas' ? 'text-white animate-spin' : 'text-emerald-400'}" />
							<span>Canvas</span>
						</button>

						<!-- Vinyl Disc Toggle Button -->
						<button
							type="button"
							onclick={() => (artViewMode = artViewMode === 'vinyl' ? 'cover' : 'vinyl')}
							aria-label={artViewMode === 'vinyl' ? 'Switch to Album Cover' : 'Switch to Vinyl Disc'}
							class="flex items-center gap-1.5 cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-bold backdrop-blur-md transition-all border shadow-lg active:scale-95 {artViewMode === 'vinyl'
								? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-pink-400/50 shadow-pink-500/30'
								: 'bg-black/60 text-white/80 hover:text-white border-white/10'}"
							title={artViewMode === 'vinyl' ? 'Cover View' : 'Vinyl Disc Mode'}
						>
							<HugeiconsIcon icon={CdIcon} class="h-3.5 w-3.5 {artViewMode === 'vinyl' ? 'animate-spin-vinyl text-white' : 'text-pink-400'}" />
							<span>{artViewMode === 'vinyl' ? 'Vinyl' : 'Disc'}</span>
						</button>

						<!-- Visualizer Studio Toggle -->
						<button
							type="button"
							onclick={() => (audioFx.visualizerModalOpen = true)}
							aria-label="Launch Fullscreen Visualizer Studio"
							class="flex items-center gap-1.5 cursor-pointer rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white/90 backdrop-blur-md transition-all hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-600 hover:text-white shadow-lg border border-white/10 active:scale-95"
						>
							<HugeiconsIcon icon={AudioWave01Icon} class="h-3.5 w-3.5 text-pink-400" />
							<span>Studio</span>
						</button>
					</div>

					<div class="absolute right-3 top-3 z-10 flex items-center gap-1.5">
						{#if canVideo()}
							<button
								type="button"
								onclick={() => (video.want = !video.want)}
								aria-label={showVideo() ? t('a11y.show_artwork') : t('a11y.show_video')}
								class="cursor-pointer rounded-full bg-black/60 p-1.5 text-white/70 backdrop-blur-md transition-colors hover:text-white border border-white/10 active:scale-95"
								title="Toggle Video"
							>
								<HugeiconsIcon
									icon={Video01Icon}
									altIcon={VideoOffIcon}
									showAlt={showVideo()}
									class="h-4 w-4"
								/>
							</button>
						{/if}
						<button
							type="button"
							onclick={() => {
								np.open = false;
								ui.theaterOpen = true;
							}}
							aria-label="Enter Fullscreen Theater Mode"
							class="cursor-pointer rounded-full bg-black/60 p-1.5 text-white/80 backdrop-blur-md transition-all hover:text-primary hover:bg-black/80 hover:scale-105 border border-white/10 shadow-lg active:scale-95"
							title="Cinema / Fullscreen Theater Mode"
						>
							<HugeiconsIcon icon={MaximizeScreenIcon} class="h-4 w-4" />
						</button>
						<button
							type="button"
							onclick={() => (np.open = false)}
							aria-label="Minimize Player"
							class="cursor-pointer rounded-full bg-black/60 p-1.5 text-white/80 backdrop-blur-md transition-all hover:text-white hover:bg-black/80 hover:scale-105 border border-white/10 shadow-lg active:scale-95"
							title="Minimize Now Playing"
						>
							<HugeiconsIcon icon={ArrowDown01Icon} class="h-4 w-4 text-primary" />
						</button>
					</div>
				</div>

				<!-- Track Metadata & Status -->
				<div class="mt-3 shrink-0 flex flex-col gap-1 px-1">
					<div class="flex items-center justify-between gap-3">
						<div class="min-w-0 flex-1">
							{#if albumId}
								<button
									class="min-w-0 cursor-pointer text-left hover:underline block max-w-full"
									onclick={() => goto(`/album/${encodeURIComponent(albumId)}`)}
								>
									<Marquee
										text={playback.now?.title ?? 'Aura Music'}
										class="font-heading text-xl lg:text-2xl font-black text-foreground tracking-tight hover:text-primary transition-colors"
									/>
								</button>
							{:else}
								<Marquee
									text={playback.now?.title ?? 'Aura Music'}
									class="font-heading text-xl lg:text-2xl font-black text-foreground tracking-tight"
								/>
							{/if}
							<div class="mt-0.5 flex items-center gap-2">
								<ArtistLine
									runs={playback.now?.artistRuns}
									text={playback.now?.artists ?? ''}
									marquee
									class="block text-xs lg:text-sm font-semibold text-muted-foreground"
								/>
								{#if autoplayTrack}
									<span class="shrink-0 text-muted-foreground" title={t('player.autoplay_notice')}>
										<HugeiconsIcon icon={InfinityIcon} size={13} />
									</span>
								{/if}
							</div>
						</div>

						<!-- Like Button -->
						<button
							onclick={toggleLike}
							class="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-200/70 dark:bg-white/5 border border-slate-300/60 dark:border-white/10 text-slate-700 dark:text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95 shadow-md"
							aria-label={t('common.like')}
						>
							<span class:animate-heart-pop={justLiked} onanimationend={() => (justLiked = false)}>
								<HugeiconsIcon
									icon={FavouriteIcon}
									size={19}
									class={playback.rating === 'like' ? 'fill-current text-primary drop-shadow-[0_0_8px_#ff0a78]' : ''}
								/>
							</span>
						</button>
					</div>

					<div class="mt-1 flex items-center gap-2">
						<span class="rounded-md bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
							320kbps Lossless
						</span>
						<span class="rounded-md bg-primary/15 border border-primary/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
							Aura Hi-Fi
						</span>
					</div>
				</div>

				<!-- Timeline Progress Scrubber -->
				<div class="mt-3 shrink-0 flex flex-col gap-1 px-1">
					<div
						class="relative flex h-4 w-full cursor-pointer select-none items-center group/seek"
						role="slider"
						tabindex="0"
						aria-valuemin="0"
						aria-valuemax={playback.duration || 100}
						aria-valuenow={shownPosition}
						aria-label={t('player.seek')}
						onkeydown={(e) => {
							if (e.key === 'ArrowRight') {
								const targetTime = Math.min(playback.duration || 0, (playback.position || 0) + 5);
								playback.position = targetTime;
								api.seek(targetTime);
							} else if (e.key === 'ArrowLeft') {
								const targetTime = Math.max(0, (playback.position || 0) - 5);
								playback.position = targetTime;
								api.seek(targetTime);
							}
						}}
						onclick={(e) => {
							const rect = e.currentTarget.getBoundingClientRect();
							const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
							const targetTime = pos * (playback.duration || 0);
							playback.position = targetTime;
							api.seek(targetTime);
						}}
					>
						<div class="w-full h-1.5 rounded-full bg-slate-300/80 dark:bg-white/15 overflow-hidden transition-all group-hover/seek:h-2">
							<div
								class="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-primary shadow-[0_0_8px_rgba(255,10,120,0.8)] rounded-full transition-all"
								style="width: {playback.duration ? (shownPosition / playback.duration) * 100 : 0}%"
							></div>
						</div>
						<div
							class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-white border-2 border-pink-500 shadow-[0_0_10px_#ff0a78] pointer-events-none opacity-0 group-hover/seek:opacity-100 transition-opacity"
							style="left: {playback.duration ? (shownPosition / playback.duration) * 100 : 0}%"
						></div>
						<input
							type="range"
							class="sr-only"
							min="0"
							max={playback.duration || 0}
							value={shownPosition}
							oninput={onSeekInput}
							onchange={onSeekCommit}
						/>
					</div>
					<div class="flex justify-between text-[11px] font-mono font-semibold text-slate-600 dark:text-muted-foreground/80">
						<span>{fmt(shownPosition)}</span>
						{#if playback.now?.duration === 'LIVE' || !playback.duration}
							<span class="rounded bg-rose-500/20 px-1.5 py-0.2 text-[9px] font-bold text-rose-500 dark:text-rose-400">LIVE</span>
						{:else}
							<span>{fmt(playback.duration)}</span>
						{/if}
					</div>
				</div>

				<!-- Hero Playback Transport Controls -->
				<div class="mt-2 shrink-0 flex items-center justify-center gap-3 lg:gap-4">
					<button
						onclick={() => api.toggleShuffle()}
						aria-label={t('player.shuffle')}
						class="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 dark:text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer {shuffleOn ? 'text-primary' : ''}"
					>
						<HugeiconsIcon icon={ShuffleIcon} size={18} />
					</button>

					<button
						onclick={() => api.prevTrack()}
						aria-label={t('player.previous')}
						class="flex h-10 w-10 items-center justify-center rounded-full text-slate-800 dark:text-foreground/80 hover:text-foreground hover:scale-105 active:scale-95 transition-all cursor-pointer"
					>
						<HugeiconsIcon icon={PreviousIcon} size={22} />
					</button>

					<!-- Glowing Neon Center Play Button -->
					<button
						onclick={toggle}
						aria-label={playback.paused ? t('player.play') : t('player.pause')}
						class="flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-pink-600 via-rose-500 to-pink-500 text-white shadow-xl shadow-pink-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
					>
						<HugeiconsIcon
							icon={PauseIcon}
							altIcon={PlayIcon}
							showAlt={playback.paused}
							size={24}
							fill="currentColor"
							class={playback.paused ? 'ml-0.5' : ''}
						/>
					</button>

					<button
						onclick={() => api.nextTrack()}
						aria-label={t('player.next')}
						class="flex h-10 w-10 items-center justify-center rounded-full text-slate-800 dark:text-foreground/80 hover:text-foreground hover:scale-105 active:scale-95 transition-all cursor-pointer"
					>
						<HugeiconsIcon icon={NextIcon} size={22} />
					</button>

					<button
						onclick={cycleRepeat}
						aria-label="Repeat"
						class="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 dark:text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer {repeat !== 'off' ? 'text-primary' : ''}"
					>
						<HugeiconsIcon
							icon={RepeatIcon}
							altIcon={RepeatOne01Icon}
							showAlt={repeat === 'one'}
							size={18}
						/>
					</button>
				</div>

				<!-- Bottom Controls Bar (Volume Slider + Add To Playlist + Equalizer + Share) -->
				<div class="mt-2 shrink-0 flex items-center justify-between border-t border-border/40 dark:border-white/10 pt-2 px-1">
					<!-- Volume -->
					<div class="flex items-center gap-1.5">
						<button
							onclick={toggleMute}
							class="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 dark:text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
							aria-label={playback.volume === 0 ? t('player.unmute') : t('player.mute')}
						>
							<HugeiconsIcon
								icon={VolumeHighIcon}
								altIcon={VolumeMute02Icon}
								showAlt={playback.volume === 0}
								size={15}
							/>
						</button>
						<input
							type="range"
							class="range w-20 cursor-pointer"
							style="--pct:{playback.volume}%"
							min="0"
							max="100"
							value={playback.volume}
							oninput={onVolume}
							onchange={onVolumeCommit}
							onwheel={wheelVolume}
							aria-label={t('player.volume')}
						/>
						<span class="text-[10px] font-mono text-slate-600 dark:text-muted-foreground/80 w-6">{playback.volume}%</span>
					</div>

					<div class="flex items-center gap-1">
						{#if currentSong}
							<button
								onclick={() => openAddToPlaylist(currentSong!)}
								class="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 dark:text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground transition-colors cursor-pointer"
								title="Add to Playlist"
							>
								<HugeiconsIcon icon={Add01Icon} size={15} />
							</button>
						{/if}

						<button
							onclick={() => (showEq = true)}
							class="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 dark:text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground transition-colors cursor-pointer"
							title="Equalizer & Audio FX"
						>
							<HugeiconsIcon icon={SparklesIcon} size={15} class={audioFx.playbackMode !== 'normal' || audioFx.eqPreset !== 'flat' ? 'text-primary' : ''} />
						</button>

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
								class="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 dark:text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground transition-colors cursor-pointer"
								title="Share Track"
							>
								<HugeiconsIcon icon={Share01Icon} size={15} />
							</button>
						{/if}
					</div>
				</div>
			</div>
		{/if}

		<!-- Right: Clean Full-Height Tabbed Content (Queue, Visualizer, Lyrics, Story) -->
		{#if tabbed}
			<div class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-border/50 dark:border-white/10 bg-white/75 dark:bg-card/30 backdrop-blur-2xl shadow-xl dark:shadow-2xl p-3 lg:p-4 {big ? 'max-w-5xl w-full' : ''}">
				<Tabs.Root
					value={np.tab}
					onValueChange={(v) => (np.tab = v as typeof np.tab)}
					class="min-h-0 flex-1 flex flex-col"
				>
					<div class="flex items-center justify-between gap-2 pb-2 shrink-0 border-b border-border/40 dark:border-white/10">
						<Tabs.List class="flex-1 max-w-lg">
							<Tabs.Trigger value="queue" class="gap-2">
								<HugeiconsIcon icon={Queue01Icon} class="h-4 w-4" /> {t('player.queue')}
							</Tabs.Trigger>
							<Tabs.Trigger value="visualizer" class="gap-2">
								<HugeiconsIcon icon={AudioWave01Icon} class="h-4 w-4 text-pink-400" /> Visualizer
							</Tabs.Trigger>
							<Tabs.Trigger value="lyrics" class="gap-2">
								<HugeiconsIcon icon={Mic01Icon} class="h-4 w-4" /> {t('player.lyrics')}
							</Tabs.Trigger>
							<Tabs.Trigger value="story" class="gap-2">
								<HugeiconsIcon icon={SparklesIcon} class="h-4 w-4 text-primary" /> Story
							</Tabs.Trigger>
						</Tabs.List>

						<div class="flex items-center gap-1.5">
							{#if np.tab === 'lyrics'}
								<button
									onclick={() => (big = !big)}
									class="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
									aria-label={big ? t('player.shrink_lyrics') : t('player.enlarge_lyrics')}
									title={big ? 'Restore side view' : 'Maximize lyrics'}
								>
									<HugeiconsIcon
										icon={Maximize01Icon}
										altIcon={Minimize01Icon}
										showAlt={big}
										class="h-4 w-4"
									/>
								</button>
							{/if}
						</div>
					</div>

					<div class="relative min-h-0 flex-1 overflow-hidden mt-2">
						{#if np.tab === 'queue'}
							<Tabs.Content value="queue" class="h-full flex min-h-0 flex-col overflow-hidden">
								<QueueList scrollMemory={queueScrollMemory} />
							</Tabs.Content>
						{:else if np.tab === 'visualizer'}
							<Tabs.Content value="visualizer" class="h-full flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-2xl relative p-1">
								<VisualizerStudio inline />
							</Tabs.Content>
						{:else if np.tab === 'lyrics'}
							<Tabs.Content value="lyrics" class="h-full flex min-h-0 flex-col overflow-hidden">
								<LyricsView expanded={big} />
							</Tabs.Content>
						{:else if np.tab === 'story'}
							<Tabs.Content value="story" class="h-full flex min-h-0 flex-col overflow-y-auto">
								<AiSongStory />
							</Tabs.Content>
						{/if}
					</div>
				</Tabs.Root>
			</div>
		{/if}
	</div>
</div>

<EqualizerDialog bind:open={showEq} />
