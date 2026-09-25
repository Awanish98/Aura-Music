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
		VolumeMute02Icon,
		SparklesIcon,
		Video01Icon,
		ArrowUpRight01Icon,
		Refresh03Icon
	} from '@hugeicons/core-free-icons';
	import { np, playback, ui, toggleMute } from '$lib/player.svelte';
	import { video } from '$lib/video.svelte';
	import * as api from '$lib/api';

	let container = $state<HTMLElement>();
	let iframeEl = $state<HTMLIFrameElement>();
	let isFullscreen = $state(false);
	let showControls = $state(true);
	let controlsTimeout: any = null;
	let seekDrag = $state<number | null>(null);
	let resolvedVideoId = $state<string | null>(null);
	let isResolving = $state(false);
	let videoAudioMuted = $state(true); // By default Aura lossless audio is primary, video is muted in sync
	let embedFailed = $state(false);

	const now = $derived(playback.now);
	const isVideoAvailable = $derived(
		!!now &&
		!now.videoId?.startsWith('gdrive:') &&
		!now.videoId?.startsWith('LOCAL:')
	);

	const pageOrigin = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';

	// Resolve exact 11-character YouTube Video ID for currently playing track
	$effect(() => {
		const vid = now?.videoId;
		const trackTitle = now?.title;
		const trackArtist = now?.artists;
		embedFailed = false;

		if (!vid) {
			resolvedVideoId = null;
			return;
		}

		// 1. Direct 11-char YouTube ID (standard YouTube video)
		if (
			typeof vid === 'string' &&
			vid.length === 11 &&
			!vid.startsWith('saavn_') &&
			!vid.startsWith('sp:') &&
			!vid.startsWith('radio_') &&
			!vid.startsWith('fmhy_') &&
			!vid.startsWith('gdrive:') &&
			!vid.startsWith('LOCAL:') &&
			!vid.startsWith('demo')
		) {
			resolvedVideoId = vid;
			return;
		}

		// 2. Resolve via YouTube Search for JioSaavn / Spotify / FMHY items
		let cancelled = false;
		isResolving = true;
		const q = `${trackTitle || ''} ${trackArtist || ''} official music video`.trim();

		api.search(q)
			.then((res: any) => {
				if (cancelled) return;
				const songs = Array.isArray(res) ? res : res?.songs || res?.top || [];
				for (const s of songs) {
					const candId = s?.video_id || s?.id || s?.videoId;
					if (candId && typeof candId === 'string' && candId.length === 11) {
						resolvedVideoId = candId;
						return;
					}
				}
				if (vid && vid.length === 11) {
					resolvedVideoId = vid;
				}
			})
			.catch(() => {
				if (!cancelled && vid && vid.length === 11) resolvedVideoId = vid;
			})
			.finally(() => {
				if (!cancelled) isResolving = false;
			});

		return () => {
			cancelled = true;
		};
	});

	// Send PostMessage Command to YouTube Iframe API
	function sendYtCommand(func: string, args: any = '') {
		if (!iframeEl?.contentWindow) return;
		try {
			iframeEl.contentWindow.postMessage(
				JSON.stringify({ event: 'command', func, args }),
				'*'
			);
		} catch {}
	}

	// Synchronize Play/Pause State with Iframe
	$effect(() => {
		const paused = playback.paused;
		if (iframeEl && resolvedVideoId) {
			sendYtCommand(paused ? 'pauseVideo' : 'playVideo');
		}
	});

	// Periodic Drift Alignment to keep video and audio frames locked
	let syncTimer: any = null;
	$effect(() => {
		if (typeof window === 'undefined') return;
		if (ui.videoMode !== 'hidden' && !playback.paused && resolvedVideoId) {
			syncTimer = setInterval(() => {
				if (!playback.paused && iframeEl) {
					sendYtCommand('seekTo', [Math.floor(playback.position || 0), true]);
				}
			}, 6000);
		} else if (syncTimer) {
			clearInterval(syncTimer);
		}
		return () => {
			if (syncTimer) clearInterval(syncTimer);
		};
	});

	function toggleVideoSound() {
		videoAudioMuted = !videoAudioMuted;
		sendYtCommand(videoAudioMuted ? 'mute' : 'unMute');
		if (!videoAudioMuted) {
			sendYtCommand('setVolume', [playback.volume ?? 100]);
		}
	}

	function resetControlsTimer() {
		showControls = true;
		if (controlsTimeout) clearTimeout(controlsTimeout);
		if (!playback.paused) {
			controlsTimeout = setTimeout(() => {
				showControls = false;
			}, 3200);
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
		sendYtCommand('seekTo', [v, true]);
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
		if (syncTimer) clearInterval(syncTimer);
	});
</script>

{#if isVideoAvailable && ui.videoMode !== 'hidden' && (!np.open || ui.videoMode === 'expanded' || ui.videoMode === 'fullscreen')}
	<!-- Main Floating / Expanded / Fullscreen Video Container -->
	<!-- Backdrop for expanded mode -->
	{#if ui.videoMode === 'expanded'}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl transition-opacity"
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
				? 'fixed inset-x-4 top-1/2 z-50 mx-auto -translate-y-1/2 max-w-5xl rounded-3xl border border-white/20 bg-black shadow-[0_32px_80px_rgba(0,0,0,0.95)] aspect-video ring-1 ring-white/10'
				: ui.videoMode === 'fullscreen' || isFullscreen
					? 'fixed inset-0 z-[100] h-screen w-screen bg-black rounded-none border-0'
					: 'fixed bottom-32 right-4 md:bottom-24 md:right-8 z-40 w-72 sm:w-84 md:w-96 rounded-2xl border border-white/20 bg-black shadow-[0_20px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl aspect-video ring-1 ring-white/10'}"
	>
		<!-- Ambient Artwork Glow Background -->
		{#if now?.thumbnail}
			<div
				class="pointer-events-none absolute -inset-10 z-0 opacity-30 blur-3xl transition-opacity duration-700"
				style="background-image: url('{now.thumbnail}'); background-size: cover; background-position: center;"
			></div>
		{/if}

		<!-- Mount container with Live Synced YouTube Iframe Player -->
		<div
			id="echo-video-mount"
			class="relative z-10 flex h-full w-full items-center justify-center overflow-hidden rounded-inherit bg-black"
		>
			{#if resolvedVideoId && !embedFailed}
				{#key resolvedVideoId}
					<iframe
						bind:this={iframeEl}
						src="https://www.youtube.com/embed/{resolvedVideoId}?autoplay=1&mute={videoAudioMuted ? 1 : 0}&enablejsapi=1&origin={pageOrigin}&rel=0&modestbranding=1&playsinline=1&controls=1&iv_load_policy=3&start={Math.floor(playback.position || 0)}"
						title={now?.title || 'Aura Music Video'}
						class="h-full w-full border-0 object-cover pointer-events-auto bg-black rounded-inherit"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowfullscreen
						onerror={() => (embedFailed = true)}
					></iframe>
				{/key}
			{:else if embedFailed}
				<div class="flex flex-col items-center justify-center gap-3 text-center p-6 bg-black/90 z-20">
					<p class="text-sm font-bold text-white font-heading">YouTube Video Embedding Notice</p>
					<p class="text-xs text-white/70 max-w-xs">This official music video is protected by the publisher.</p>
					{#if resolvedVideoId}
						<a
							href="https://www.youtube.com/watch?v={resolvedVideoId}"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-red-500 transition-colors"
						>
							<span>Watch Directly on YouTube</span>
							<HugeiconsIcon icon={ArrowUpRight01Icon} size={14} />
						</a>
					{/if}
				</div>
			{:else}
				<div class="flex flex-col items-center justify-center gap-3 text-center p-6">
					<div class="size-10 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
					<p class="text-xs font-semibold text-white/80 font-mono">Loading HD YouTube Music Video...</p>
				</div>
			{/if}
		</div>

		<!-- Premium Glassmorphic HUD Overlays (Auto-Hiding on Inactivity) -->
		<div
			class="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-3 md:p-4 transition-opacity duration-300 {showControls
				? 'opacity-100'
				: 'opacity-0'}"
			style="background: linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 65%, rgba(0,0,0,0.85) 100%);"
		>
			<!-- Top Header Controls -->
			<div class="pointer-events-auto flex items-center justify-between gap-2">
				<div class="flex items-center gap-2 overflow-hidden">
					<span class="flex items-center gap-1 rounded-md border border-red-500/40 bg-red-950/70 px-2 py-0.5 text-[10px] font-bold tracking-wider text-red-400 backdrop-blur-md">
						<span class="size-1.5 rounded-full bg-red-500 animate-pulse"></span>
						YouTube 4K/HD
					</span>
					{#if now?.title}
						<p class="truncate text-xs font-semibold text-white drop-shadow-md">
							{now.title}
						</p>
					{/if}
				</div>

				<!-- Window / Fullscreen / Sound Action Buttons -->
				<div class="flex items-center gap-1.5">
					<!-- Direct Sound Switch -->
					<button
						onclick={toggleVideoSound}
						class="flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-semibold backdrop-blur-md transition cursor-pointer {videoAudioMuted ? 'bg-black/50 text-white/80 hover:bg-white/20 hover:text-white' : 'bg-primary text-white shadow-lg shadow-pink-500/30'}"
						title={videoAudioMuted ? 'Video audio is muted (playing lossless Aura audio)' : 'Video audio is unmuted'}
					>
						<HugeiconsIcon icon={videoAudioMuted ? VolumeMute02Icon : VolumeHighIcon} size={13} />
						<span class="text-[10px]">{videoAudioMuted ? 'Lossless Audio' : 'YT Audio'}</span>
					</button>

					<!-- External YouTube Link -->
					{#if resolvedVideoId}
						<a
							href="https://www.youtube.com/watch?v={resolvedVideoId}"
							target="_blank"
							rel="noopener noreferrer"
							class="flex h-7 w-7 items-center justify-center rounded-lg bg-black/50 text-white/80 backdrop-blur-md transition hover:bg-red-600 hover:text-white"
							title="Open on YouTube"
						>
							<HugeiconsIcon icon={ArrowUpRight01Icon} size={14} />
						</a>
					{/if}

					{#if ui.videoMode === 'docked'}
						<button
							onclick={() => setMode('expanded')}
							class="flex h-7 w-7 items-center justify-center rounded-lg bg-black/50 text-white/80 backdrop-blur-md transition hover:bg-white/20 hover:text-white"
							aria-label="Expand Video Player"
							title="Theater Size"
						>
							<HugeiconsIcon icon={Maximize01Icon} class="h-3.5 w-3.5" />
						</button>
					{:else if ui.videoMode === 'expanded'}
						<button
							onclick={() => setMode('docked')}
							class="flex h-7 w-7 items-center justify-center rounded-lg bg-black/50 text-white/80 backdrop-blur-md transition hover:bg-white/20 hover:text-white"
							aria-label="Dock Video Player"
							title="Dock Mini Player"
						>
							<HugeiconsIcon icon={Minimize01Icon} class="h-3.5 w-3.5" />
						</button>
					{/if}

					<button
						onclick={toggleFullscreen}
						class="flex h-7 w-7 items-center justify-center rounded-lg bg-black/50 text-white/80 backdrop-blur-md transition hover:bg-white/20 hover:text-white"
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
						class="flex h-7 w-7 items-center justify-center rounded-lg bg-black/50 text-white/80 backdrop-blur-md transition hover:bg-red-500/40 hover:text-red-400"
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
							Aura Video Player • Synced HD
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
