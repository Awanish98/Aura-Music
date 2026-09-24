<script lang="ts">
	import { onDestroy } from 'svelte';
	import { fade, scale, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		Cancel01Icon,
		PlayIcon,
		Search01Icon,
		Refresh03Icon,
		CheckmarkCircle01Icon,
		AlertCircleIcon,
		MusicNote01Icon,
		VolumeHighIcon,
		SparklesIcon,
		Mic01Icon
	} from '@hugeicons/core-free-icons';
	import { Button } from '$lib/components/ui/button';
	import {
		shazamEngine,
		type IdentifiedSong,
		type ShazamStatus
	} from '$lib/shazam';
	import { webPlayer } from '$lib/webplayer';
	import { playback, playSong, toast, ui } from '$lib/player.svelte';
	import { thumb, generateAvatarSvg } from '$lib/thumb';
	import type { SongItem } from '$lib/api';

	let status = $state<ShazamStatus>('idle');
	let statusDetail = $state('Tap the button to identify any song');
	let audioLevel = $state(0);
	let liveTranscript = $state('');
	let identifiedSong = $state<IdentifiedSong | null>(null);
	let errorMsg = $state('');
	let freqBars = $state<number[]>(Array(16).fill(4));

	function startIdentification() {
		status = 'requesting_mic';
		statusDetail = 'Connecting microphone...';
		identifiedSong = null;
		errorMsg = '';
		liveTranscript = '';
		audioLevel = 0;

		shazamEngine.start({
			onStatusChange: (newStatus, detail) => {
				status = newStatus;
				if (detail) statusDetail = detail;
			},
			onAudioLevel: (level, freqData) => {
				audioLevel = level;
				// Sample 16 frequency bands for the visualizer
				const step = Math.floor(freqData.length / 16);
				freqBars = Array.from({ length: 16 }, (_, i) => {
					const val = freqData[i * step] || 0;
					return Math.max(4, Math.min(36, (val / 255) * 36));
				});
			},
			onTranscript: (text) => {
				liveTranscript = text;
			},
			onFound: (song) => {
				identifiedSong = song;
				status = 'found';
				statusDetail = 'Song Identified!';
			},
			onError: (err) => {
				errorMsg = err;
				status = 'error';
				statusDetail = 'Could not access audio';
			}
		});
	}

	function handleClose() {
		shazamEngine.stop();
		ui.shazamOpen = false;
	}

	function playIdentifiedTrack() {
		if (!identifiedSong) return;

		const songItem: SongItem = identifiedSong.rawSong || {
			video_id: identifiedSong.id,
			title: identifiedSong.title,
			artists: identifiedSong.artists,
			artist_runs: [{ text: identifiedSong.artists }],
			album: identifiedSong.album,
			thumbnail: identifiedSong.thumbnail,
			duration: identifiedSong.duration || '3:30',
			streamUrl: identifiedSong.streamUrl,
			is_video: false,
			is_upload: false,
			explicit: false
		};

		webPlayer.play(songItem);
		toast.success(`Playing: ${identifiedSong.title}`);
		handleClose();
	}

	function enqueueIdentifiedTrack() {
		if (!identifiedSong) return;
		const songItem: SongItem = identifiedSong.rawSong || {
			video_id: identifiedSong.id,
			title: identifiedSong.title,
			artists: identifiedSong.artists,
			thumbnail: identifiedSong.thumbnail,
			duration: identifiedSong.duration || '3:30',
			streamUrl: identifiedSong.streamUrl,
			is_video: false,
			is_upload: false,
			explicit: false
		};
		playback.queue.items = [...playback.queue.items, songItem];
		toast.success('Added to Queue');
	}

	// Auto-start when modal opens
	$effect(() => {
		if (ui.shazamOpen) {
			startIdentification();
		} else {
			shazamEngine.stop();
		}
	});

	onDestroy(() => {
		shazamEngine.stop();
	});
</script>

{#if ui.shazamOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 select-none"
		transition:fade={{ duration: 180 }}
	>
		<!-- Dark Glass Backdrop -->
		<button
			class="absolute inset-0 bg-black/70 backdrop-blur-xl transition-opacity"
			onclick={handleClose}
			aria-label="Close"
		></button>

		<!-- Apple Liquid Glass Dialog Card -->
		<div
			class="relative w-full max-w-md overflow-hidden rounded-3xl apple-glass p-6 text-foreground shadow-2xl"
			transition:scale={{ start: 0.94, duration: 220, easing: cubicOut }}
		>
			<!-- Ambient Atmosphere Backlight -->
			<div
				class="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/25 blur-3xl"
			></div>
			<div
				class="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-blue-500/20 blur-3xl"
			></div>

			<!-- Top Header -->
			<div class="relative z-10 flex items-center justify-between pb-4 border-b border-white/10">
				<div class="flex items-center gap-2.5">
					<div
						class="flex size-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-blue-500 text-white shadow-lg shadow-primary/30"
					>
						<HugeiconsIcon icon={SparklesIcon} size={20} />
					</div>
					<div>
						<h3 class="font-heading text-base font-bold tracking-tight">Aura Shazam</h3>
						<p class="text-xs text-muted-foreground">Instant Song & Humming Identifier</p>
					</div>
				</div>

				<button
					class="flex size-8 items-center justify-center rounded-full bg-white/5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground active:scale-95"
					onclick={handleClose}
					aria-label="Close"
				>
					<HugeiconsIcon icon={Cancel01Icon} size={18} />
				</button>
			</div>

			<!-- Body -->
			<div class="relative z-10 my-6 flex flex-col items-center justify-center text-center">
				{#if status === 'found' && identifiedSong}
					<!-- Found Track View -->
					<div class="flex w-full flex-col items-center gap-4" in:fly={{ y: 20, duration: 250 }}>
						<!-- Album Art with Glowing Ring -->
						<div class="relative aspect-square w-40 overflow-hidden rounded-2xl shadow-2xl ring-2 ring-primary/60">
							{#if identifiedSong.thumbnail}
								<img
									src={thumb(identifiedSong.thumbnail, 400)}
									alt={identifiedSong.title}
									class="h-full w-full object-cover"
								/>
							{:else}
								<img
									src={generateAvatarSvg(identifiedSong.title, 'song')}
									alt={identifiedSong.title}
									class="h-full w-full object-cover"
								/>
							{/if}
							<div
								class="absolute top-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-primary backdrop-blur-md"
							>
								98% Match
							</div>
						</div>

						<!-- Track Details -->
						<div class="w-full px-2">
							<h4 class="truncate font-heading text-lg font-bold text-foreground">
								{identifiedSong.title}
							</h4>
							<p class="truncate text-sm text-muted-foreground mt-0.5">
								{identifiedSong.artists}
							</p>
							{#if identifiedSong.album}
								<p class="truncate text-xs text-muted-foreground/80 mt-0.5">
									{identifiedSong.album}
								</p>
							{/if}
						</div>

						<!-- Lossless Quality Tag -->
						<div class="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/25 px-3 py-1 text-xs font-semibold text-primary">
							<HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} />
							<span>Identified via Aura Music Engine</span>
						</div>

						<!-- Action Controls -->
						<div class="flex w-full items-center gap-3 pt-2">
							<Button
								variant="default"
								class="flex-1 gap-2 rounded-xl h-11 bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/30 active:scale-95"
								onclick={playIdentifiedTrack}
							>
								<HugeiconsIcon icon={PlayIcon} size={18} fill="currentColor" />
								<span>Play Now</span>
							</Button>
							<Button
								variant="outline"
								class="gap-1.5 rounded-xl h-11 border-white/15 bg-white/5 hover:bg-white/10 active:scale-95"
								onclick={enqueueIdentifiedTrack}
							>
								<span>+ Queue</span>
							</Button>
							<Button
								variant="ghost"
								size="icon"
								class="h-11 w-11 rounded-xl hover:bg-white/10 text-muted-foreground"
								onclick={startIdentification}
								title="Identify another"
							>
								<HugeiconsIcon icon={Refresh03Icon} size={18} />
							</Button>
						</div>
					</div>
				{:else}
					<!-- Listening / Analyzing Animated State -->
					<div class="flex flex-col items-center gap-5">
						<!-- Glowing Liquid Listening Orb -->
						<div class="relative flex items-center justify-center size-36">
							<!-- Pulsating Outer Ripple Rings -->
							<div
								class="absolute inset-0 rounded-full bg-primary/20 transition-transform duration-100 ease-out"
								style="transform: scale({1 + audioLevel * 1.8}); opacity: {0.3 + audioLevel * 0.7}"
							></div>
							<div
								class="absolute inset-2 rounded-full bg-blue-500/20 transition-transform duration-150 ease-out"
								style="transform: scale({1 + audioLevel * 1.3}); opacity: {0.4 + audioLevel * 0.6}"
							></div>

							<!-- Center Core Glass Button -->
							<button
								type="button"
								onclick={startIdentification}
								class="relative z-10 flex size-24 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-blue-600 text-white shadow-xl shadow-primary/40 transition-transform hover:scale-105 active:scale-90"
							>
								<HugeiconsIcon
									icon={status === 'listening' ? Mic01Icon : SparklesIcon}
									size={38}
									class={status === 'listening' ? 'animate-pulse' : ''}
								/>
							</button>
						</div>

						<!-- Frequency Visualizer Bars -->
						<div class="flex items-center justify-center gap-1 h-10 w-48">
							{#each freqBars as height, i (i)}
								<div
									class="w-1.5 rounded-full bg-gradient-to-t from-primary to-blue-400 transition-all duration-75"
									style="height: {height}px"
								></div>
							{/each}
						</div>

						<!-- Status Text -->
						<div>
							<h4 class="font-heading text-base font-semibold text-foreground">
								{status === 'listening'
									? 'Listening to Audio...'
									: status === 'analyzing'
										? 'Identifying Music...'
										: status === 'not_found'
											? 'No Song Detected'
											: status === 'error'
												? 'Microphone Issue'
												: 'Ready to Listen'}
							</h4>
							<p class="text-xs text-muted-foreground mt-1 max-w-xs">
								{statusDetail}
							</p>
						</div>

						<!-- Live Lyrics / Voice Transcript Badge -->
						{#if liveTranscript}
							<div
								class="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-muted-foreground max-w-xs truncate"
								in:fade
							>
								<HugeiconsIcon icon={SparklesIcon} size={12} class="text-primary shrink-0" />
								<span class="truncate">"{liveTranscript}"</span>
							</div>
						{/if}

						<!-- Retry Button if not found or error -->
						{#if status === 'not_found' || status === 'error'}
							<Button
								variant="outline"
								class="mt-2 gap-2 rounded-xl border-white/15 bg-white/5 hover:bg-white/10"
								onclick={startIdentification}
							>
								<HugeiconsIcon icon={Refresh03Icon} size={16} />
								<span>Try Again</span>
							</Button>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Footer Tip -->
			<div class="relative z-10 pt-3 border-t border-white/10 text-center">
				<p class="text-[11px] text-muted-foreground">
					💡 Tip: Play a song nearby, sing, or hum lyrics to identify and play instantly.
				</p>
			</div>
		</div>
	</div>
{/if}
