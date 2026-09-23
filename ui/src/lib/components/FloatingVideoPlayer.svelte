<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		PlayIcon,
		PauseIcon,
		PreviousIcon,
		NextIcon,
		Maximize01Icon,
		Minimize01Icon,
		MaximizeScreenIcon,
		MinimizeScreenIcon,
		Cancel01Icon,
		VolumeHighIcon,
		VolumeMute02Icon
	} from '@hugeicons/core-free-icons';
	import { np, playback, ui, toggleMute } from '$lib/player.svelte';
	import * as api from '$lib/api';

	let container = $state<HTMLElement>();
	let isFullscreen = $state(false);
	let showControls = $state(true);
	let controlsTimeout: any = null;
	let seekDrag = $state<number | null>(null);

	const now = $derived(playback.now);
	const isVideoAvailable = $derived(
		!!now &&
		!now.videoId?.startsWith('gdrive:') &&
		!now.videoId?.startsWith('LOCAL:')
	);

	function resetControlsTimer() {
		showControls = true;
		if (controlsTimeout) clearTimeout(controlsTimeout);
		if (!playback.paused) {
			controlsTimeout = setTimeout(() => {
				showControls = false;
			}, 2500);
		}
	}

	function handleFullscreenChange() {
		isFullscreen = !!document.fullscreenElement;
		if (!isFullscreen && ui.videoMode === 'fullscreen') {
			ui.videoMode = 'docked';
		}
	}

	async function toggleFullscreen() {
		if (!container) return;
		try {
			if (!document.fullscreenElement) {
				await container.requestFullscreen();
				isFullscreen = true;
				ui.videoMode = 'fullscreen';
			} else {
				await document.exitFullscreen();
				isFullscreen = false;
				ui.videoMode = 'docked';
			}
		} catch (err) {
			console.warn('[Fullscreen error]', err);
		}
	}

	function setMode(mode: 'docked' | 'expanded' | 'fullscreen' | 'hidden') {
		ui.videoMode = mode;
		if (mode === 'fullscreen') {
			toggleFullscreen();
		} else if (isFullscreen) {
			document.exitFullscreen().catch(() => {});
			isFullscreen = false;
		}
	}

	function onSeekInput(e: Event) {
		seekDrag = Number((e.target as HTMLInputElement).value);
		resetControlsTimer();
	}

	function onSeekCommit(e: Event) {
		const v = Number((e.target as HTMLInputElement).value);
		playback.position = v;
		seekDrag = null;
		api.seek(v);
		resetControlsTimer();
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

	const shownPosition = $derived(seekDrag ?? playback.position);

	onMount(() => {
		document.addEventListener('fullscreenchange', handleFullscreenChange);
	});

	onDestroy(() => {
		if (typeof document !== 'undefined') {
			document.removeEventListener('fullscreenchange', handleFullscreenChange);
		}
		if (controlsTimeout) clearTimeout(controlsTimeout);
	});
</script>

{#if isVideoAvailable && ui.videoMode !== 'hidden' && (!np.open || ui.videoMode === 'expanded' || ui.videoMode === 'fullscreen')}
	<!-- Main Floating / Expanded / Fullscreen Video Container -->
	<!-- Backdrop for expanded mode -->
	{#if ui.videoMode === 'expanded'}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="fixed inset-0 z-50 bg-black/80 backdrop-blur-2xl transition-opacity"
			transition:fade={{ duration: 200 }}
			onclick={() => setMode('docked')}
		></div>
	{/if}

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={container}
		onmousemove={resetControlsTimer}
		ontouchstart={resetControlsTimer}
		transition:fly={{ y: 32, duration: 260, easing: cubicOut }}
		class="group select-none overflow-hidden transition-all duration-300
			{ui.videoMode === 'expanded'
				? 'fixed inset-x-4 top-1/2 z-50 mx-auto -translate-y-1/2 max-w-5xl rounded-3xl border border-white/20 bg-black/95 shadow-[0_32px_80px_rgba(0,0,0,0.9)] aspect-video'
				: ui.videoMode === 'fullscreen' || isFullscreen
					? 'fixed inset-0 z-[100] h-screen w-screen bg-black rounded-none border-0'
					: 'fixed bottom-32 right-4 md:bottom-24 md:right-8 z-40 w-64 sm:w-80 md:w-96 rounded-2xl border border-white/15 bg-black/90 shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl aspect-video'}"
	>
		<!-- Ambient Artwork Glow Background -->
		{#if now?.thumbnail}
			<div
				class="pointer-events-none absolute -inset-10 z-0 opacity-25 blur-3xl transition-opacity duration-700"
				style="background-image: url('{now.thumbnail}'); background-size: cover; background-position: center;"
			></div>
		{/if}

			<!-- Mount container where the YouTube Iframe is placed -->
			<div
				id="echo-video-mount"
				class="relative z-10 flex h-full w-full items-center justify-center overflow-hidden rounded-inherit bg-black"
			>
				<!-- The actual #echo-yt-iframe-player sits here natively -->
			</div>

			<!-- Premium Glassmorphic HUD Overlays (Auto-Hiding on Inactivity) -->
			<div
				class="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-3 md:p-4 transition-opacity duration-300 {showControls
					? 'opacity-100'
					: 'opacity-0'}"
				style="background: linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 65%, rgba(0,0,0,0.85) 100%);"
			>
				<!-- Top Header Controls -->
				<div class="pointer-events-auto flex items-center justify-between gap-2">
					<div class="flex items-center gap-2 overflow-hidden">
						<span class="flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-400 backdrop-blur-md">
							1080p HD
						</span>
						{#if now?.title}
							<p class="truncate text-xs font-semibold text-white drop-shadow-md">
								{now.title}
							</p>
						{/if}
					</div>

					<!-- Window / Fullscreen Action Buttons -->
					<div class="flex items-center gap-1">
						{#if ui.videoMode === 'docked'}
							<button
								onclick={() => setMode('expanded')}
								class="flex h-7 w-7 items-center justify-center rounded-lg bg-black/40 text-white/80 backdrop-blur-md transition hover:bg-white/20 hover:text-white"
								aria-label="Expand Video Player"
								title="Theater Size"
							>
								<HugeiconsIcon icon={Maximize01Icon} class="h-3.5 w-3.5" />
							</button>
						{:else if ui.videoMode === 'expanded'}
							<button
								onclick={() => setMode('docked')}
								class="flex h-7 w-7 items-center justify-center rounded-lg bg-black/40 text-white/80 backdrop-blur-md transition hover:bg-white/20 hover:text-white"
								aria-label="Dock Video Player"
								title="Dock Mini Player"
							>
								<HugeiconsIcon icon={Minimize01Icon} class="h-3.5 w-3.5" />
							</button>
						{/if}

						<button
							onclick={toggleFullscreen}
							class="flex h-7 w-7 items-center justify-center rounded-lg bg-black/40 text-white/80 backdrop-blur-md transition hover:bg-white/20 hover:text-white"
							aria-label="Toggle Fullscreen"
							title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
						>
							<HugeiconsIcon
								icon={isFullscreen ? MinimizeScreenIcon : MaximizeScreenIcon}
								class="h-3.5 w-3.5"
							/>
						</button>

						<button
							onclick={() => setMode('hidden')}
							class="flex h-7 w-7 items-center justify-center rounded-lg bg-black/40 text-white/80 backdrop-blur-md transition hover:bg-red-500/30 hover:text-red-400"
							aria-label="Minimize / Hide Video"
							title="Hide Video"
						>
							<HugeiconsIcon icon={Cancel01Icon} class="h-3.5 w-3.5" />
						</button>
					</div>
				</div>

				<!-- Center Quick Tap Play / Pause Button -->
				<div class="pointer-events-auto flex items-center justify-center">
					<button
						onclick={() => api.togglePause()}
						class="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-2xl backdrop-blur-md transition hover:scale-110 hover:bg-primary hover:text-primary-foreground"
						aria-label={playback.paused ? 'Play' : 'Pause'}
					>
						<HugeiconsIcon
							icon={playback.paused ? PlayIcon : PauseIcon}
							class="h-6 w-6 ml-0.5"
							fill="currentColor"
						/>
					</button>
				</div>

				<!-- Bottom Transport & Seek Bar -->
				<div class="pointer-events-auto flex flex-col gap-1.5">
					<div class="flex items-center gap-2">
						<span class="text-[11px] font-medium tabular-nums text-white/90 drop-shadow">
							{fmt(shownPosition)}
						</span>
						<input
							type="range"
							class="range flex-1 h-1.5 accent-primary cursor-pointer"
							style="--pct:{playback.duration ? (shownPosition / playback.duration) * 100 : 0}%"
							min="0"
							max={playback.duration || 0}
							value={shownPosition}
							oninput={onSeekInput}
							onchange={onSeekCommit}
							aria-label="Seek Video"
						/>
						<span class="text-[11px] font-medium tabular-nums text-white/70 drop-shadow">
							{fmt(playback.duration)}
						</span>
					</div>

					<div class="flex items-center justify-between pt-0.5">
						<div class="flex items-center gap-2">
							<button
								onclick={() => api.prevTrack()}
								class="text-white/80 transition hover:text-white"
								aria-label="Previous Track"
							>
								<HugeiconsIcon icon={PreviousIcon} class="h-4 w-4" />
							</button>
							<button
								onclick={() => api.nextTrack()}
								class="text-white/80 transition hover:text-white"
								aria-label="Next Track"
							>
								<HugeiconsIcon icon={NextIcon} class="h-4 w-4" />
							</button>
							<button
								onclick={toggleMute}
								class="text-white/80 transition hover:text-white ml-1"
								aria-label="Mute / Unmute"
							>
								<HugeiconsIcon
									icon={playback.volume === 0 ? VolumeMute02Icon : VolumeHighIcon}
									class="h-4 w-4"
								/>
							</button>
						</div>

						<div class="flex items-center gap-2">
							<span class="text-[10px] font-semibold uppercase tracking-wider text-white/60">
								Aura Video Player
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}

<style>
	:global(#echo-yt-iframe-player) {
		width: 100% !important;
		height: 100% !important;
		border: none !important;
		border-radius: inherit !important;
		object-fit: cover !important;
		background-color: #000 !important;
	}
</style>
