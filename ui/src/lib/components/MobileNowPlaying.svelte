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
		SparklesIcon
	} from '@hugeicons/core-free-icons';
	import {
		np,
		playback,
		cycleRepeat,
		dragVolume,
		commitVolume,
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
	import TrackMenu from './TrackMenu.svelte';
	import AiSongStory from './AiSongStory.svelte';

	let activeTab = $state<'player' | 'lyrics' | 'story' | 'queue'>('player');
	let sleepModalOpen = $state(false);
	let speedMenuOpen = $state(false);
	let justLiked = $state(false);

	// Touch swipe down to dismiss
	let startY = 0;
	let currentY = 0;
	let startX = 0;

	function handleTouchStart(e: TouchEvent) {
		startY = e.touches[0].clientY;
		startX = e.touches[0].clientX;
	}

	function handleTouchMove(e: TouchEvent) {
		currentY = e.touches[0].clientY;
	}

	function handleTouchEnd(e: TouchEvent) {
		const diffY = currentY - startY;
		const diffX = e.changedTouches[0].clientX - startX;

		// Swipe down on top header to dismiss
		if (diffY > 120 && startY < 200) {
			np.open = false;
		}

		// Swipe left/right on artwork to skip track
		if (activeTab === 'player' && Math.abs(diffX) > 80 && Math.abs(diffY) < 60) {
			if (diffX < 0) {
				api.nextTrack();
			} else {
				api.prevTrack();
			}
		}

		startY = 0;
		currentY = 0;
		startX = 0;
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
	class="fixed inset-0 z-40 flex flex-col justify-between overflow-hidden bg-background/95 text-foreground select-none backdrop-blur-3xl md:hidden"
	transition:fly={{ y: '100%', duration: 320, easing: cubicOut }}
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
>
	<!-- Ambient Animated Artwork Backdrop -->
	{#if playback.now?.thumbnail}
		<img
			src={thumb(playback.now.thumbnail, 400)}
			alt=""
			class="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover opacity-35 blur-3xl transition-opacity duration-700 dark:opacity-45"
		/>
	{/if}
	<div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background"></div>

	<!-- Top Bar -->
	<header class="relative z-10 flex shrink-0 items-center justify-between px-4 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] pb-2">
		<button
			class="flex size-10 items-center justify-center rounded-full bg-white/5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground active:scale-95"
			onclick={() => (np.open = false)}
			aria-label="Minimize"
		>
			<HugeiconsIcon icon={ArrowDown01Icon} size={22} />
		</button>

		<div class="flex flex-col items-center text-center">
			<span class="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
				{playback.queue.sourceName || 'Now Playing'}
			</span>
			<span class="text-xs font-medium text-foreground truncate max-w-[200px]">
				{playback.now?.title ?? ''}
			</span>
		</div>

		<div class="flex items-center gap-1">
			{#if currentSong}
				<TrackMenu
					song={currentSong}
					linksOnly={false}
					onAdd={() => openAddToPlaylist(currentSong!)}
					triggerClass="flex size-10 items-center justify-center rounded-full bg-white/5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground active:scale-95"
				/>
			{:else}
				<button
					class="flex size-10 items-center justify-center rounded-full bg-white/5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
					onclick={() => (sleepModalOpen = true)}
				>
					<HugeiconsIcon icon={Moon02Icon} size={20} />
				</button>
			{/if}
		</div>
	</header>

	<!-- Tab Switcher (Player, Lyrics, Queue) -->
	<div class="relative z-10 flex shrink-0 items-center justify-center gap-1.5 px-4 py-1.5">
		<button
			class="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all {activeTab === 'player'
				? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105'
				: 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground'}"
			onclick={() => (activeTab = 'player')}
		>
			<HugeiconsIcon icon={MusicNote01Icon} size={14} />
			Track
		</button>
		<button
			class="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all {activeTab === 'lyrics'
				? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105'
				: 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground'}"
			onclick={() => (activeTab = 'lyrics')}
		>
			<HugeiconsIcon icon={Mic01Icon} size={14} />
			Lyrics
		</button>
		<button
			class="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all {activeTab === 'story'
				? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105'
				: 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground'}"
			onclick={() => (activeTab = 'story')}
		>
			<HugeiconsIcon icon={SparklesIcon} size={14} />
			AI Story
		</button>
		<button
			class="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all {activeTab === 'queue'
				? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105'
				: 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground'}"
			onclick={() => (activeTab = 'queue')}
		>
			<HugeiconsIcon icon={Queue01Icon} size={14} />
			Queue
		</button>
	</div>

	<!-- Main Content Area based on Tab -->
	<div class="relative z-10 flex min-h-0 flex-1 flex-col justify-center px-6 py-2">
		{#if activeTab === 'player'}
			<!-- Artwork Card -->
			<div class="flex flex-1 items-center justify-center py-2">
				<div
					class="relative aspect-square w-full max-w-[340px] max-h-[340px] overflow-hidden rounded-3xl shadow-2xl transition-all duration-300 {playback.paused
						? 'scale-95 shadow-black/40 opacity-90'
						: 'scale-100 shadow-[0_20px_60px_-15px_var(--primary)]'}"
				>
					{#if playback.now?.thumbnail}
						<img
							src={thumb(playback.now.thumbnail, 720, playback.now?.title || 'Aura', 'song')}
							alt=""
							class="h-full w-full object-cover"
							onerror={(e) => {
								const target = e.currentTarget as HTMLImageElement;
								target.src = generateAvatarSvg(playback.now?.title || 'Aura', 'song');
							}}
						/>
					{:else}
						<img
							src={generateAvatarSvg(playback.now?.title || 'Aura', 'song')}
							alt=""
							class="h-full w-full object-cover"
						/>
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
					class="flex size-10 items-center justify-center rounded-full text-muted-foreground transition hover:text-foreground active:scale-90 {shuffleOn
						? 'text-primary'
						: ''}"
					onclick={() => api.toggleShuffle()}
					aria-label="Shuffle"
				>
					<HugeiconsIcon icon={ShuffleIcon} size={22} strokeWidth={shuffleOn ? 2.4 : 1.8} />
				</button>

				<button
					class="flex size-12 items-center justify-center rounded-full text-foreground transition active:scale-90"
					onclick={() => api.prevTrack()}
					aria-label="Previous"
				>
					<HugeiconsIcon icon={PreviousIcon} size={28} />
				</button>

				<button
					class="flex size-18 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/40 transition-transform active:scale-90 hover:scale-105"
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
					class="flex size-12 items-center justify-center rounded-full text-foreground transition active:scale-90"
					onclick={() => api.nextTrack()}
					aria-label="Next"
				>
					<HugeiconsIcon icon={NextIcon} size={28} />
				</button>

				<button
					class="flex size-10 items-center justify-center rounded-full text-muted-foreground transition hover:text-foreground active:scale-90 {repeat !==
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

			<!-- Quick Utilities Bar (Speed, Sleep Timer, Volume) -->
			<div class="mt-4 shrink-0 flex items-center justify-between border-t border-white/5 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] text-xs text-muted-foreground">
				<!-- Sleep Timer -->
				<button
					class="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 transition hover:bg-white/10 hover:text-foreground {sleepTimer.active
						? 'text-primary border border-primary/40 bg-primary/10'
						: ''}"
					onclick={() => (sleepModalOpen = true)}
				>
					<HugeiconsIcon icon={Moon02Icon} size={15} />
					<span>
						{#if sleepTimer.active}
							{sleepTimer.endOfSong ? 'End of song' : `${Math.ceil(sleepTimer.remainingSecs / 60)}m`}
						{:else}
							Sleep Timer
						{/if}
					</span>
				</button>

				<!-- Playback Speed -->
				<div class="relative">
					<button
						class="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 transition hover:bg-white/10 hover:text-foreground {playback.speed !== 1
							? 'text-primary border border-primary/40 bg-primary/10'
							: ''}"
						onclick={() => (speedMenuOpen = !speedMenuOpen)}
					>
						<HugeiconsIcon icon={DashboardSpeed01Icon} size={15} />
						<span>{playback.speed}x</span>
					</button>

					{#if speedMenuOpen}
						<div
							class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-1 rounded-2xl border border-white/10 bg-card/95 p-2 shadow-2xl backdrop-blur-xl"
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
						class="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 transition hover:bg-white/10 hover:text-foreground"
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
						<HugeiconsIcon icon={Share01Icon} size={15} />
						<span>Share</span>
					</button>
				{/if}
			</div>
		{:else if activeTab === 'lyrics'}
			<!-- Synced Lyrics View -->
			<div class="h-full overflow-hidden rounded-2xl bg-card/40 p-2 backdrop-blur-md">
				<LyricsView />
			</div>
		{:else if activeTab === 'story'}
			<!-- Deep AI Song Meaning & Backstory View -->
			<div class="h-full overflow-y-auto rounded-2xl bg-card/40 p-3 backdrop-blur-md">
				<AiSongStory />
			</div>
		{:else if activeTab === 'queue'}
			<!-- Up Next Queue View -->
			<div class="h-full overflow-hidden rounded-2xl bg-card/40 p-2 backdrop-blur-md">
				<QueueList />
			</div>
		{/if}
	</div>
</div>

<SleepTimerModal bind:open={sleepModalOpen} />
