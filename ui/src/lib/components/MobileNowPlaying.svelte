<script lang="ts">
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { goto } from '$app/navigation';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		ArrowDown01Icon,
		PreviousIcon,
		NextIcon,
		PlayIcon,
		PauseIcon,
		ShuffleIcon,
		RepeatIcon,
		RepeatOne01Icon,
		FavouriteIcon,
		Add01Icon,
		Mic01Icon,
		Queue01Icon,
		MusicNote01Icon,
		Moon02Icon,
		DashboardSpeed01Icon,
		VolumeHighIcon,
		VolumeMute02Icon,
		Share01Icon,
		AudioWave01Icon,
		SparklesIcon,
		CdIcon
	} from '@hugeicons/core-free-icons';
	import {
		np,
		playback,
		audioFx,
		cycleRepeat,
		dragVolume,
		commitVolume,
		toggleMute,
		openAddToPlaylist,
		openShare,
		sleepTimer,
		setPlaybackSpeed,
		toggleNowPlayingRating,
		wheelVolume
	} from '$lib/player.svelte';
	import * as api from '$lib/api';
	import { thumb, generateAvatarSvg } from '$lib/thumb';
	import { t } from '$lib/i18n.svelte';
	import Marquee from './Marquee.svelte';
	import ArtistLine from './ArtistLine.svelte';
	import LyricsView from './LyricsView.svelte';
	import QueueList from './QueueList.svelte';
	import SleepTimerModal from './SleepTimerModal.svelte';
	import EqualizerDialog from './EqualizerDialog.svelte';
	import TrackMenu from './TrackMenu.svelte';
	import AiSongStory from './AiSongStory.svelte';
	import VisualizerStudio from './VisualizerStudio.svelte';

	let activeTab = $state<'player' | 'visualizer' | 'lyrics' | 'story' | 'queue'>('player');
	let sleepModalOpen = $state(false);
	let eqModalOpen = $state(false);
	let speedMenuOpen = $state(false);
	let justLiked = $state(false);
	let vinylMode = $state(false);

	// Header touch swipe down to dismiss
	let headerStartY = 0;
	let headerCurrentY = 0;

	function handleHeaderTouchStart(e: TouchEvent) {
		headerStartY = e.touches[0].clientY;
		headerCurrentY = headerStartY;
	}

	function handleHeaderTouchMove(e: TouchEvent) {
		headerCurrentY = e.touches[0].clientY;
	}

	function handleHeaderTouchEnd(e: TouchEvent) {
		const diffY = headerCurrentY - headerStartY;
		if (diffY > 80) {
			np.open = false;
		}
		headerStartY = 0;
		headerCurrentY = 0;
	}

	// Artwork horizontal swipe to skip track
	let artStartX = 0;
	let artCurrentX = 0;
	let artStartY = 0;

	function handleArtTouchStart(e: TouchEvent) {
		artStartX = e.touches[0].clientX;
		artCurrentX = artStartX;
		artStartY = e.touches[0].clientY;
	}

	function handleArtTouchMove(e: TouchEvent) {
		artCurrentX = e.touches[0].clientX;
	}

	function handleArtTouchEnd(e: TouchEvent) {
		const diffX = artCurrentX - artStartX;
		const diffY = Math.abs(e.changedTouches[0].clientY - artStartY);
		if (Math.abs(diffX) > 70 && diffY < 50) {
			if (diffX < 0) {
				api.nextTrack();
			} else {
				api.prevTrack();
			}
		}
		artStartX = 0;
		artCurrentX = 0;
		artStartY = 0;
	}

	function toggleLike() {
		if (playback.rating !== 'like') justLiked = true;
		toggleNowPlayingRating();
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

	const fmtRemaining = (secs: number) => {
		if (!playback.duration || !isFinite(playback.duration) || playback.now?.duration === 'LIVE') return 'LIVE';
		const rem = Math.max(0, playback.duration - secs);
		return `-${fmt(rem)}`;
	};

	let isDragging = $state(false);
	let dragPosition = $state(0);
	const shownPosition = $derived(isDragging ? dragPosition : playback.position);

	function onSeekInput(e: Event) {
		isDragging = true;
		dragPosition = parseFloat((e.currentTarget as HTMLInputElement).value);
	}

	function onSeekCommit(e: Event) {
		isDragging = false;
		const val = parseFloat((e.currentTarget as HTMLInputElement).value);
		playback.position = val;
		playback.positionAt = performance.now();
		api.seek(val);
	}

	const shuffleOn = $derived(playback.queue.shuffle ?? false);
	const repeat = $derived(playback.queue.repeat ?? 'off');

	const currentSong = $derived.by(() => {
		const cur = playback.queue.items[playback.queue.currentIndex];
		return cur?.video_id === playback.now?.videoId ? cur : null;
	});

	const speeds = [0.75, 1, 1.25, 1.5, 2];
</script>

<!-- Full-screen Mobile Now Playing View -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="fixed inset-0 z-[60] flex h-[100dvh] w-full flex-col justify-between overflow-hidden bg-background/95 text-foreground select-none md:hidden"
	transition:fly={{ y: '100%', duration: 320, easing: cubicOut }}
>
	<!-- Ambient Artwork Backdrop (Optimized for Mobile GPU) -->
	{#if playback.now?.thumbnail}
		<img
			src={thumb(playback.now.thumbnail, 400)}
			alt=""
			onerror={(e) => {
				(e.currentTarget as HTMLImageElement).src = '/default_cover.jpg';
			}}
			class="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-20 blur-xl transition-opacity duration-700 dark:opacity-30"
		/>
	{/if}
	<div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/80 via-background/92 to-background"></div>

	<!-- Top Drag Handle & Bar -->
	<header
		class="relative z-10 flex shrink-0 flex-col px-4 pt-[calc(env(safe-area-inset-top,0px)+0.5rem)] pb-1 touch-none"
		ontouchstart={handleHeaderTouchStart}
		ontouchmove={handleHeaderTouchMove}
		ontouchend={handleHeaderTouchEnd}
	>
		<!-- Drag-to-dismiss handle bar -->
		<button
			type="button"
			aria-label="Dismiss player"
			class="w-12 h-1.5 rounded-full bg-black/20 dark:bg-white/25 mx-auto mb-2 hover:bg-black/30 dark:hover:bg-white/40 cursor-pointer active:scale-95 transition-transform"
			onclick={(e) => {
				e.stopPropagation();
				np.open = false;
			}}
		></button>

		<div class="flex items-center justify-between">
			<button
				class="flex size-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/5 text-muted-foreground transition hover:bg-black/10 dark:hover:bg-white/10 hover:text-foreground active:scale-90 cursor-pointer"
				onclick={(e) => {
					e.stopPropagation();
					np.open = false;
				}}
				aria-label="Minimize"
			>
				<HugeiconsIcon icon={ArrowDown01Icon} size={22} />
			</button>

			<div class="flex flex-col items-center text-center px-2 min-w-0 flex-1">
				<span class="text-[10px] font-bold tracking-widest text-primary/80 uppercase">
					{playback.queue.sourceName || 'Now Playing'}
				</span>
				<span class="text-xs font-semibold text-foreground truncate max-w-[200px]">
					{playback.now?.title ?? ''}
				</span>
			</div>

			<div class="flex items-center gap-1">
				{#if currentSong}
					<TrackMenu
						song={currentSong}
						linksOnly={false}
						onAdd={() => openAddToPlaylist(currentSong!)}
						triggerClass="flex size-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/5 text-muted-foreground transition hover:bg-black/10 dark:hover:bg-white/10 hover:text-foreground active:scale-90"
					/>
				{:else}
					<button
						class="flex size-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/5 text-muted-foreground transition hover:bg-black/10 dark:hover:bg-white/10 hover:text-foreground active:scale-90"
						onclick={() => (sleepModalOpen = true)}
					>
						<HugeiconsIcon icon={Moon02Icon} size={20} />
					</button>
				{/if}
			</div>
		</div>
	</header>

	<!-- Segmented Glass Tab Switcher (Track, Visualizer, Lyrics, AI Story, Queue) -->
	<div class="relative z-10 flex shrink-0 items-center justify-center px-2 py-1.5 overflow-x-auto no-scrollbar">
		<div class="flex items-center gap-1 rounded-full bg-slate-200/80 dark:bg-black/50 p-1 border border-black/5 dark:border-white/10 shadow-inner backdrop-blur-md">
			<button
				class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all {activeTab === 'player'
					? 'bg-primary text-primary-foreground shadow-md shadow-primary/30 scale-100'
					: 'text-muted-foreground hover:text-foreground'}"
				onclick={() => (activeTab = 'player')}
			>
				<HugeiconsIcon icon={MusicNote01Icon} size={13} />
				Track
			</button>
			<button
				class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all {activeTab === 'visualizer'
					? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/30 scale-100'
					: 'text-muted-foreground hover:text-foreground'}"
				onclick={() => (activeTab = 'visualizer')}
			>
				<HugeiconsIcon icon={AudioWave01Icon} size={13} />
				Visualizer
			</button>
			<button
				class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all {activeTab === 'lyrics'
					? 'bg-primary text-primary-foreground shadow-md shadow-primary/30 scale-100'
					: 'text-muted-foreground hover:text-foreground'}"
				onclick={() => (activeTab = 'lyrics')}
			>
				<HugeiconsIcon icon={Mic01Icon} size={13} />
				Lyrics
			</button>
			<button
				class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all {activeTab === 'story'
					? 'bg-primary text-primary-foreground shadow-md shadow-primary/30 scale-100'
					: 'text-muted-foreground hover:text-foreground'}"
				onclick={() => (activeTab = 'story')}
			>
				<HugeiconsIcon icon={SparklesIcon} size={13} />
				Story
			</button>
			<button
				class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all {activeTab === 'queue'
					? 'bg-primary text-primary-foreground shadow-md shadow-primary/30 scale-100'
					: 'text-muted-foreground hover:text-foreground'}"
				onclick={() => (activeTab = 'queue')}
			>
				<HugeiconsIcon icon={Queue01Icon} size={13} />
				Queue
			</button>
		</div>
	</div>

	<!-- Main Content Area based on Tab -->
	{#if activeTab === 'player'}
		<div class="relative z-10 flex min-h-0 flex-1 flex-col justify-center px-6 py-2">
			<!-- Artwork Card & Vinyl LP Mode Container -->
			<div class="flex flex-1 items-center justify-center py-2 relative">
				<!-- Ambient Aura Glow Ring behind art when playing -->
				{#if !playback.paused}
					<div class="pointer-events-none absolute w-60 h-60 rounded-full bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-cyan-400/20 blur-2xl opacity-75"></div>
				{/if}

				<!-- Vinyl Mode Floating Badge Toggle -->
				<button
					type="button"
					onclick={() => (vinylMode = !vinylMode)}
					aria-label={vinylMode ? 'Switch to Cover' : 'Switch to Vinyl'}
					class="absolute top-3 right-4 z-20 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold backdrop-blur-md transition-all border shadow-lg active:scale-90 {vinylMode
						? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-pink-400/50 shadow-pink-500/30'
						: 'bg-black/60 text-white/80 border-white/10'}"
				>
					<HugeiconsIcon icon={CdIcon} class="h-3 w-3 {vinylMode ? 'animate-spin-vinyl text-white' : 'text-pink-400'}" />
					<span>{vinylMode ? 'Vinyl' : 'Disc'}</span>
				</button>

				<div
					class="relative aspect-square w-full max-w-[320px] max-h-[320px] transition-all duration-300 touch-pan-y {vinylMode ? 'rounded-full' : 'overflow-hidden rounded-3xl shadow-2xl'} {playback.paused
						? 'scale-95 shadow-black/40 opacity-90'
						: 'scale-100 shadow-[0_20px_60px_-15px_var(--primary)]'}"
					ontouchstart={handleArtTouchStart}
					ontouchmove={handleArtTouchMove}
					ontouchend={handleArtTouchEnd}
				>
					{#if vinylMode}
						<!-- Realistic Audiophile Spinning 12-inch Vinyl LP Record on Mobile -->
						<div class="relative w-full h-full rounded-full bg-[#0a0a0f] shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_0_0_2px_rgba(255,255,255,0.12)] flex items-center justify-center overflow-hidden {!playback.paused ? 'animate-spin-vinyl' : 'animate-spin-vinyl-paused'}">
							<!-- Concentric Vinyl Grooves -->
							<div class="absolute inset-2 rounded-full border border-white/[0.04] shadow-[inset_0_0_15px_rgba(0,0,0,0.9)]"></div>
							<div class="absolute inset-5 rounded-full border border-white/[0.05]"></div>
							<div class="absolute inset-9 rounded-full border border-white/[0.04]"></div>
							<div class="absolute inset-13 rounded-full border border-white/[0.06]"></div>
							<div class="absolute inset-17 rounded-full border border-white/[0.04]"></div>
							<!-- Holographic Light Reflections -->
							<div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.09] to-transparent pointer-events-none"></div>
							<div class="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.06] to-transparent pointer-events-none"></div>
							<!-- Center Artwork Label -->
							<div class="relative w-[38%] h-[38%] rounded-full overflow-hidden border-2 border-white/25 shadow-2xl ring-2 ring-black/80">
								{#if playback.now?.thumbnail}
									<img
										src={thumb(playback.now.thumbnail, 400, playback.now?.title || 'Aura', 'song')}
										alt=""
										class="w-full h-full object-cover"
										onerror={(e) => {
											const target = e.currentTarget as HTMLImageElement;
											target.src = generateAvatarSvg(playback.now?.title || 'Aura', 'song');
										}}
									/>
								{:else}
									<img
										src={generateAvatarSvg(playback.now?.title || 'Aura', 'song')}
										alt=""
										class="w-full h-full object-cover"
									/>
								{/if}
								<!-- Spindle Center Hole -->
								<div class="absolute inset-0 m-auto w-3.5 h-3.5 rounded-full bg-[#070709] border-2 border-white/40 shadow-inner"></div>
							</div>
						</div>
					{:else}
						{#if playback.now?.thumbnail}
							<img
								src={thumb(playback.now.thumbnail, 720, playback.now?.title || 'Aura', 'song')}
								alt=""
								class="h-full w-full object-cover rounded-3xl"
								onerror={(e) => {
									const target = e.currentTarget as HTMLImageElement;
									target.src = generateAvatarSvg(playback.now?.title || 'Aura', 'song');
								}}
							/>
						{:else}
							<img
								src={generateAvatarSvg(playback.now?.title || 'Aura', 'song')}
								alt=""
								class="h-full w-full object-cover rounded-3xl"
							/>
						{/if}
					{/if}
				</div>
			</div>

			<!-- Track Details (Title + Artist + Like + Share) -->
			<div class="mt-2 flex shrink-0 items-center justify-between gap-4">
				<div class="min-w-0 flex-1">
					<Marquee
						text={playback.now?.title ?? t('player.not_playing')}
						class="text-xl font-bold tracking-tight text-foreground"
					/>
					<div class="mt-1 flex items-center gap-2">
						<ArtistLine
							runs={playback.now?.artistRuns}
							text={playback.now?.artists ?? ''}
							marquee
							class="min-w-0 flex-1 text-sm font-medium text-muted-foreground"
						/>
						{#if playback.now}
							{@const id = playback.now.videoId || ''}
							{@const isCloud = id.startsWith('gdrive:')}
							{@const isLive = playback.now.duration === 'LIVE' || id.startsWith('fmhy:')}
							<span
								class="shrink-0 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase {isCloud
									? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
									: isLive
										? 'bg-red-500/20 text-red-400 border border-red-500/30'
										: 'bg-primary/15 text-primary border border-primary/25'}"
							>
								{isCloud ? 'Google Drive' : isLive ? 'Live' : 'Lossless'}
							</span>
						{/if}
					</div>
				</div>

				<div class="flex items-center gap-1.5">
					<button
						class="flex size-11 items-center justify-center rounded-full bg-white/5 text-muted-foreground transition hover:bg-white/10 active:scale-90"
						onclick={toggleLike}
						aria-label="Like"
					>
						<span class:animate-heart-pop={justLiked} onanimationend={() => (justLiked = false)}>
							<HugeiconsIcon
								icon={FavouriteIcon}
								size={22}
								class={playback.rating === 'like' ? 'fill-current text-primary' : ''}
							/>
						</span>
					</button>

					{#if playback.now}
						<button
							class="flex size-11 items-center justify-center rounded-full bg-white/5 text-muted-foreground transition hover:bg-white/10 active:scale-90"
							onclick={() => {
								const now = playback.now!;
								openAddToPlaylist({
									video_id: now.videoId,
									title: now.title,
									artists: now.artists,
									artist_id: now.artistId,
									thumbnail: now.thumbnail,
									duration: now.duration
								});
							}}
							aria-label="Add to playlist"
						>
							<HugeiconsIcon icon={Add01Icon} size={22} />
						</button>
					{/if}
				</div>
			</div>

			<!-- Scrubber Slider -->
			<div class="mt-4 shrink-0 flex flex-col gap-1.5">
				<input
					type="range"
					class="range h-2 w-full cursor-pointer accent-primary"
					style="--pct:{playback.duration ? (shownPosition / playback.duration) * 100 : 0}%"
					min="0"
					max={playback.duration || 0}
					value={shownPosition}
					oninput={onSeekInput}
					onchange={onSeekCommit}
					aria-label="Seek"
				/>
				<div class="flex items-center justify-between text-xs font-medium tabular-nums text-muted-foreground">
					<span>{fmt(shownPosition)}</span>
					<span>{fmtRemaining(shownPosition)}</span>
				</div>
			</div>

			<!-- Hero Playback Transport Controls -->
			<div class="mt-4 shrink-0 flex items-center justify-between px-2">
				<button
					class="flex size-11 items-center justify-center rounded-full text-muted-foreground transition hover:text-foreground active:scale-90 {shuffleOn
						? 'text-primary'
						: ''}"
					onclick={() => api.toggleShuffle()}
					aria-label="Shuffle"
				>
					<HugeiconsIcon icon={ShuffleIcon} size={22} strokeWidth={shuffleOn ? 2.4 : 1.8} />
				</button>

				<button
					class="flex size-12 items-center justify-center rounded-full text-foreground transition hover:scale-110 active:scale-90"
					onclick={() => api.prevTrack()}
					aria-label="Previous"
				>
					<HugeiconsIcon icon={PreviousIcon} size={28} />
				</button>

				<button
					class="flex size-18 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_35px_var(--primary)] transition-all duration-200 active:scale-90 hover:scale-105"
					onclick={() => api.togglePause()}
					aria-label={playback.paused ? 'Play' : 'Pause'}
				>
					<HugeiconsIcon
						icon={PauseIcon}
						altIcon={PlayIcon}
						showAlt={playback.paused}
						size={34}
						fill="currentColor"
					/>
				</button>

				<button
					class="flex size-12 items-center justify-center rounded-full text-foreground transition hover:scale-110 active:scale-90"
					onclick={() => api.nextTrack()}
					aria-label="Next"
				>
					<HugeiconsIcon icon={NextIcon} size={28} />
				</button>

				<button
					class="flex size-11 items-center justify-center rounded-full text-muted-foreground transition hover:text-foreground active:scale-90 {repeat !==
					'off'
						? 'text-primary'
						: ''}"
					onclick={cycleRepeat}
					aria-label="Repeat"
				>
					<HugeiconsIcon
						icon={RepeatIcon}
						altIcon={RepeatOne01Icon}
						showAlt={repeat === 'one'}
						size={22}
						strokeWidth={repeat !== 'off' ? 2.4 : 1.8}
					/>
				</button>
			</div>

			<!-- Mobile Native Touch Volume Slider -->
			<div class="mt-3.5 shrink-0 flex items-center gap-2.5 px-2">
				<button
					class="flex size-7 items-center justify-center rounded-full text-muted-foreground/70 hover:text-foreground transition active:scale-90 cursor-pointer"
					onclick={() => toggleMute()}
					aria-label={playback.volume === 0 ? 'Unmute' : 'Mute'}
				>
					<HugeiconsIcon
						icon={playback.volume === 0 ? VolumeMute02Icon : VolumeHighIcon}
						size={16}
						class={playback.volume === 0 ? 'text-rose-400' : ''}
					/>
				</button>
				<input
					type="range"
					min="0"
					max="100"
					step="1"
					value={playback.volume}
					oninput={(e) => dragVolume(parseFloat((e.currentTarget as HTMLInputElement).value))}
					onchange={(e) => commitVolume(parseFloat((e.currentTarget as HTMLInputElement).value))}
					class="range h-1.5 flex-1 cursor-pointer accent-primary"
					style="--pct:{playback.volume}%"
					aria-label="Volume"
				/>
				<span class="text-[10px] font-mono font-semibold tabular-nums text-muted-foreground/80 w-7 text-right">
					{Math.round(playback.volume)}%
				</span>
			</div>

			<!-- Quick Utilities Bar (Speed, Sleep Timer, EQ & Audio FX, Share) -->
			<div class="mt-3.5 shrink-0 flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-2.5 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] text-xs text-muted-foreground">
				<!-- Sleep Timer -->
				<button
					class="flex items-center gap-1.5 rounded-full bg-black/5 dark:bg-white/5 px-2.5 py-1.5 transition hover:bg-black/10 dark:hover:bg-white/10 hover:text-foreground {sleepTimer.active
						? 'text-primary border border-primary/40 bg-primary/10'
						: ''}"
					onclick={() => (sleepModalOpen = true)}
				>
					<HugeiconsIcon icon={Moon02Icon} size={14} />
					<span>
						{#if sleepTimer.active}
							{sleepTimer.endOfSong ? 'End' : `${Math.ceil(sleepTimer.remainingSecs / 60)}m`}
						{:else}
							Timer
						{/if}
					</span>
				</button>

				<!-- Audio FX / Equalizer / Gapless / DJ Crossfade -->
				<button
					class="flex items-center gap-1.5 rounded-full bg-black/5 dark:bg-white/5 px-2.5 py-1.5 transition hover:bg-black/10 dark:hover:bg-white/10 hover:text-foreground {playback.crossfading
						? 'border-pink-500/50 bg-pink-500/20 text-pink-300 animate-pulse'
						: audioFx.playbackMode !== 'normal'
							? 'text-primary border border-primary/40 bg-primary/10'
							: ''}"
					onclick={() => (eqModalOpen = true)}
				>
					<HugeiconsIcon icon={AudioWave01Icon} size={14} />
					<span>
						{#if playback.crossfading}
							DJ Fade
						{:else if audioFx.playbackMode === 'crossfade'}
							{audioFx.crossfadeDuration}s Fade
						{:else if audioFx.playbackMode === 'gapless'}
							Gapless
						{:else}
							Audio FX
						{/if}
					</span>
				</button>

				<!-- Playback Speed -->
				<div class="relative">
					<button
						class="flex items-center gap-1.5 rounded-full bg-black/5 dark:bg-white/5 px-2.5 py-1.5 transition hover:bg-black/10 dark:hover:bg-white/10 hover:text-foreground {playback.speed !== 1
							? 'text-primary border border-primary/40 bg-primary/10'
							: ''}"
						onclick={() => (speedMenuOpen = !speedMenuOpen)}
					>
						<HugeiconsIcon icon={DashboardSpeed01Icon} size={14} />
						<span>{playback.speed}x</span>
					</button>

					{#if speedMenuOpen}
						<div
							class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-1 rounded-2xl border border-black/10 dark:border-white/10 bg-card/95 p-2 shadow-2xl backdrop-blur-xl"
							transition:scale={{ start: 0.9, duration: 150 }}
						>
							{#each speeds as sp}
								<button
									class="rounded-lg px-3 py-1.5 text-xs font-semibold transition {playback.speed === sp
										? 'bg-primary text-primary-foreground'
										: 'hover:bg-muted text-foreground'}"
									onclick={() => {
										setPlaybackSpeed(sp);
										speedMenuOpen = false;
									}}
								>
									{sp}x
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Share Button -->
				{#if playback.now}
					<button
						class="flex items-center gap-1.5 rounded-full bg-black/5 dark:bg-white/5 px-2.5 py-1.5 transition hover:bg-black/10 dark:hover:bg-white/10 hover:text-foreground"
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
					>
						<HugeiconsIcon icon={Share01Icon} size={14} />
						<span>Share</span>
					</button>
				{/if}
			</div>
		</div>
	{:else}
		<!-- Fullscreen Edge-to-Edge Container for Lyrics, AI Story, & Queue with Bottom Transport HUD -->
		<div class="relative z-10 flex min-h-0 flex-1 flex-col justify-between overflow-hidden">
			<!-- Scrollable Active View -->
			<div class="relative min-h-0 flex-1 overflow-hidden {activeTab === 'lyrics' ? 'p-0' : 'p-3'}">
				{#if activeTab === 'visualizer'}
					<div class="h-full flex flex-col justify-between overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-black/60 shadow-2xl p-1 relative">
						<VisualizerStudio inline />
					</div>
				{:else if activeTab === 'lyrics'}
					<LyricsView expanded />
				{:else if activeTab === 'story'}
					<div class="h-full overflow-y-auto rounded-2xl bg-card/40 p-3 backdrop-blur-md">
						<AiSongStory />
					</div>
				{:else if activeTab === 'queue'}
					<div class="h-full overflow-hidden rounded-2xl bg-card/40 p-2 backdrop-blur-md">
						<QueueList />
					</div>
				{/if}
			</div>

			<!-- Sleek Bottom Glass Transport HUD (Play/Pause, Scrubber, Next/Prev, Track Info) -->
			<div class="shrink-0 border-t border-black/5 dark:border-white/10 bg-background/90 dark:bg-background/85 px-4 pt-2.5 pb-[calc(env(safe-area-inset-bottom,0px)+0.6rem)] shadow-2xl backdrop-blur-2xl">
				<!-- Mini Scrubber Bar -->
				<div class="mb-2 flex items-center gap-2">
					<span class="text-[10px] font-semibold tabular-nums text-muted-foreground w-8 text-right">
						{fmt(shownPosition)}
					</span>
					<input
						type="range"
						class="range h-1.5 flex-1 cursor-pointer accent-primary"
						style="--pct:{playback.duration ? (shownPosition / playback.duration) * 100 : 0}%"
						min="0"
						max={playback.duration || 0}
						value={shownPosition}
						oninput={onSeekInput}
						onchange={onSeekCommit}
						aria-label="Seek"
					/>
					<span class="text-[10px] font-semibold tabular-nums text-muted-foreground w-8">
						{fmtRemaining(shownPosition)}
					</span>
				</div>

				<!-- Transport Controls Row -->
				<div class="flex items-center justify-between gap-2">
					<!-- Mini Song Info (Tap to switch back to Track tab) -->
					<button
						type="button"
						onclick={() => (activeTab = 'player')}
						class="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer group active:scale-95 transition-transform"
					>
						{#if playback.now?.thumbnail}
							<img
								src={thumb(playback.now.thumbnail, 120, playback.now?.title || 'Aura', 'song')}
								alt=""
								onerror={(e) => {
									(e.currentTarget as HTMLImageElement).src = '/default_cover.jpg';
								}}
								class="size-10 rounded-lg object-cover shadow shrink-0"
							/>
						{:else}
							<img
								src="/default_cover.jpg"
								alt=""
								class="size-10 rounded-lg object-cover shadow shrink-0"
							/>
						{/if}
						<div class="min-w-0 flex-1">
							<p class="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
								{playback.now?.title ?? 'Not Playing'}
							</p>
							<p class="text-[11px] text-muted-foreground truncate">
								{playback.now?.artists ?? ''}
							</p>
						</div>
					</button>

					<!-- Buttons: Prev, Play/Pause, Next, Like -->
					<div class="flex items-center gap-1.5 shrink-0">
						<button
							class="flex size-9 items-center justify-center rounded-full text-foreground transition hover:bg-white/10 active:scale-90"
							onclick={() => api.prevTrack()}
							aria-label="Previous"
						>
							<HugeiconsIcon icon={PreviousIcon} size={20} />
						</button>

						<button
							class="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all active:scale-90 hover:scale-105"
							onclick={() => api.togglePause()}
							aria-label={playback.paused ? 'Play' : 'Pause'}
						>
							<HugeiconsIcon
								icon={PauseIcon}
								altIcon={PlayIcon}
								showAlt={playback.paused}
								size={22}
								fill="currentColor"
							/>
						</button>

						<button
							class="flex size-9 items-center justify-center rounded-full text-foreground transition hover:bg-white/10 active:scale-90"
							onclick={() => api.nextTrack()}
							aria-label="Next"
						>
							<HugeiconsIcon icon={NextIcon} size={20} />
						</button>

						<button
							class="flex size-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-white/10 active:scale-90"
							onclick={toggleLike}
							aria-label="Like"
						>
							<HugeiconsIcon
								icon={FavouriteIcon}
								size={18}
								class={playback.rating === 'like' ? 'fill-current text-primary' : ''}
							/>
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<SleepTimerModal bind:open={sleepModalOpen} />
<EqualizerDialog bind:open={eqModalOpen} />
