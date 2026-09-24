<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		PreviousIcon,
		NextIcon,
		PlayIcon,
		PauseIcon,
		ShuffleIcon,
		RepeatIcon,
		RepeatOne01Icon,
		Queue01Icon,
		Mic01Icon,
		VolumeHighIcon,
		VolumeMute02Icon,
		FavouriteIcon,
		Add01Icon,
		InfinityIcon,
		MinimizeScreenIcon,
		MaximizeScreenIcon,
		AudioWave02Icon,
		SparklesIcon
	} from '@hugeicons/core-free-icons';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import * as api from '$lib/api';
	import {
		np,
		playback,
		ui,
		audioFx,
		commitVolume,
		cycleRepeat,
		dragVolume,
		openAddToPlaylist,
		openMiniPlayer,
		toggleMute,
		toggleNowPlayingRating,
		wheelVolume
	} from '$lib/player.svelte';
	import { thumb, generateAvatarSvg } from '$lib/thumb';
	import ArtistLine from './ArtistLine.svelte';
	import Marquee from './Marquee.svelte';
	import TrackMenu from './TrackMenu.svelte';
	import EqualizerDialog from './EqualizerDialog.svelte';
	import AudioVisualizer from './AudioVisualizer.svelte';
	import { t } from '$lib/i18n.svelte';

	let showEq = $state(false);

	let {
		onToggleQueue,
		queueOpen,
		onToggleLyrics,
		lyricsOpen
	}: {
		onToggleQueue: () => void;
		queueOpen: boolean;
		onToggleLyrics: () => void;
		lyricsOpen: boolean;
	} = $props();

	let justLiked = $state(false);

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

	const shuffleOn = $derived(playback.queue.shuffle ?? false);
	const repeat = $derived(playback.queue.repeat ?? 'off');

	const autoplayTrack = $derived.by(() => {
		const cur = playback.queue.items[playback.queue.currentIndex];
		return !!cur?.autoplay && cur.video_id === playback.now?.videoId;
	});

	const currentSong = $derived.by(() => {
		const cur = playback.queue.items[playback.queue.currentIndex];
		return cur?.video_id === playback.now?.videoId ? cur : null;
	});

	const albumId = $derived(
		currentSong && !api.isLocalId(currentSong.video_id) ? currentSong.album_id : undefined
	);

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

	const isControl = (t: EventTarget | null) =>
		!!(t as HTMLElement | null)?.closest?.('button, a, input, [role="button"]');

	let pressedControl = false;

	function onBarClick(e: MouseEvent) {
		if (pressedControl || isControl(e.target)) return;
		if (typeof window !== 'undefined' && window.innerWidth < 768) {
			np.open = true;
		} else {
			np.open = !np.open;
		}
	}

	let miniTouchStartX = 0;
	let miniTouchStartY = 0;

	function onMiniTouchStart(e: TouchEvent) {
		miniTouchStartX = e.touches[0].clientX;
		miniTouchStartY = e.touches[0].clientY;
	}

	function onMiniTouchEnd(e: TouchEvent) {
		const dx = e.changedTouches[0].clientX - miniTouchStartX;
		const dy = e.changedTouches[0].clientY - miniTouchStartY;
		if (Math.abs(dx) > 50 && Math.abs(dy) < 40) {
			if (dx < 0) {
				api.nextTrack();
			} else {
				api.prevTrack();
			}
		}
		miniTouchStartX = 0;
		miniTouchStartY = 0;
	}
</script>

<!-- Footer Dock -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions, a11y_no_noninteractive_element_interactions -->
<footer
	onpointerdown={(e) => (pressedControl = isControl(e.target))}
	onclick={onBarClick}
	class="relative md:border-t rounded-2xl md:rounded-none bg-[#0a0d17]/95 backdrop-blur-3xl border border-white/10 md:border-t-white/12 md:border-x-0 md:border-b-0 shadow-2xl shadow-black/80 transition-all select-none overflow-hidden {np.open ? 'hidden md:flex' : 'flex'}"
>
	<!-- Mobile Floating Mini Player (< md) -->
	<div
		class="flex md:hidden w-full items-center justify-between gap-3 px-3.5 py-2.5 relative cursor-pointer"
		ontouchstart={onMiniTouchStart}
		ontouchend={onMiniTouchEnd}
		onclick={(e) => {
			if (isControl(e.target)) return;
			e.stopPropagation();
			np.open = true;
		}}
	>
		<!-- Top Micro Progress Line -->
		<div class="absolute inset-x-0 top-0 h-[2.5px] bg-white/10 overflow-hidden pointer-events-none">
			<div
				class="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-150 shadow-[0_0_8px_#ff2a7a]"
				style="width: {playback.duration ? (shownPosition / playback.duration) * 100 : 0}%"
			></div>
		</div>

		<!-- Left Info -->
		<div
			class="flex min-w-0 flex-1 items-center gap-2.5 cursor-pointer"
			onclick={(e) => {
				e.stopPropagation();
				np.open = true;
			}}
		>
			{#key playback.now?.videoId}
				{#if playback.now?.thumbnail}
					<img
						src={thumb(playback.now.thumbnail, 120, playback.now?.title || 'Aura', 'song')}
						alt=""
						style="max-width:none"
						class="h-10 w-10 shrink-0 rounded-xl object-cover shadow-md ring-1 ring-white/15"
						in:fade={{ duration: 250 }}
						decoding="async"
					/>
				{:else}
					<img
						src="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=120&auto=format&fit=crop&q=80"
						alt="Aura Music"
						style="max-width:none"
						class="h-10 w-10 shrink-0 rounded-xl object-cover shadow-md ring-1 ring-white/15"
					/>
				{/if}
			{/key}
			<div class="min-w-0 flex-1 pr-1">
				<Marquee text={playback.now?.title ?? 'Aura Music • Ready'} class="text-xs font-bold text-white" />
				<div class="truncate text-[11px] font-medium text-muted-foreground">
					{playback.now?.artists ?? 'Tap to browse songs'}
				</div>
			</div>
		</div>

		<!-- Right Mobile Actions -->
		<div class="flex items-center gap-1.5 shrink-0" onclick={(e) => e.stopPropagation()}>
			<button
				class="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-white active:scale-90 transition-transform"
				onclick={(e) => {
					e.stopPropagation();
					toggleLike();
				}}
				aria-label={t('common.like')}
			>
				<span class:animate-heart-pop={justLiked} onanimationend={() => (justLiked = false)}>
					<HugeiconsIcon
						icon={FavouriteIcon}
						size={18}
						class={playback.rating === 'like' ? 'fill-current text-primary' : ''}
					/>
				</span>
			</button>
			<button
				class="flex h-10 w-10 items-center justify-center rounded-full shadow-lg bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-pink-500/30 active:scale-90 transition-transform"
				onclick={(e) => {
					e.stopPropagation();
					api.togglePause();
				}}
				aria-label={playback.paused ? t('player.play') : t('player.pause')}
			>
				<HugeiconsIcon
					icon={PauseIcon}
					altIcon={PlayIcon}
					showAlt={playback.paused}
					size={18}
					fill="currentColor"
				/>
			</button>
			<button
				class="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-white active:scale-90 transition-transform"
				onclick={(e) => {
					e.stopPropagation();
					api.nextTrack();
				}}
				aria-label={t('player.next')}
			>
				<HugeiconsIcon icon={NextIcon} size={18} />
			</button>
		</div>
	</div>

	<!-- Desktop Player Dock (>= md) -->
	<div class="hidden md:flex w-full items-center justify-between gap-4 px-6 py-3">
		<!-- Left: Track Info -->
		<div class="flex min-w-0 w-1/4 max-w-sm items-center gap-3.5" data-ctx>
			{#key playback.now?.videoId || 'idle'}
				{#if playback.now?.thumbnail}
					<img
						src={thumb(playback.now.thumbnail, 120, playback.now?.title || 'Aura', 'song')}
						alt=""
						style="max-width:none"
						class="h-13 w-13 shrink-0 rounded-xl object-cover shadow-lg ring-1 ring-white/15"
						in:fade={{ duration: 250 }}
						decoding="async"
					/>
				{:else}
					<img
						src="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=120&auto=format&fit=crop&q=80"
						alt="Aura Music"
						style="max-width:none"
						class="h-13 w-13 shrink-0 rounded-xl object-cover shadow-lg ring-1 ring-white/15"
					/>
				{/if}
			{/key}
			<div class="min-w-0 flex-1">
				<div class="flex items-center gap-1.5">
					{#snippet title()}
						<Marquee
							text={playback.now?.title ?? 'Aura Music • Ready'}
							class="text-sm font-bold text-white tracking-tight"
						/>
					{/snippet}
					{#if albumId}
						<button
							class="min-w-0 cursor-pointer text-left hover:[&_span]:underline"
							onclick={() => goto(`/album/${encodeURIComponent(albumId)}`)}
						>
							{@render title()}
						</button>
					{:else}
						{@render title()}
					{/if}
					{#if autoplayTrack}
						<span class="shrink-0 text-muted-foreground" title={t('player.autoplay_notice')}>
							<HugeiconsIcon icon={InfinityIcon} size={14} />
						</span>
					{/if}
				</div>
				<div class="flex items-center gap-2 mt-0.5">
					<ArtistLine
						runs={playback.now?.artistRuns}
						text={playback.now?.artists ?? 'Select any song to start playback'}
						marquee
						class="block max-w-full text-xs text-muted-foreground/80 font-medium"
					/>
				</div>
			</div>

			<!-- Like & Menu Actions -->
			<div class="flex items-center gap-1">
				<button
					class="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-white transition-colors cursor-pointer"
					onclick={toggleLike}
					aria-label={t('common.like')}
				>
					<HugeiconsIcon
						icon={FavouriteIcon}
						size={17}
						class={playback.rating === 'like' ? 'fill-current text-primary' : ''}
					/>
				</button>
				{#if currentSong}
					<TrackMenu
						song={currentSong}
						linksOnly
						onAdd={() => openAddToPlaylist(currentSong!)}
						triggerClass="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-white/10 hover:text-white transition-colors"
					/>
				{/if}
			</div>
		</div>

		<!-- Center: Transport & Sleek Progress Bar -->
		<div class="flex flex-1 max-w-xl flex-col items-center gap-1.5">
			<!-- Controls Buttons Row -->
			<div class="flex items-center gap-3">
				<button
					onclick={() => api.toggleShuffle()}
					aria-label={t('player.shuffle')}
					class="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-white transition-colors cursor-pointer"
				>
					<HugeiconsIcon
						icon={ShuffleIcon}
						size={16}
						class={shuffleOn ? 'text-primary' : ''}
					/>
				</button>
				<button
					onclick={() => api.prevTrack()}
					aria-label={t('player.previous')}
					class="flex h-8 w-8 items-center justify-center rounded-full text-foreground/80 hover:text-white transition-colors cursor-pointer"
				>
					<HugeiconsIcon icon={PreviousIcon} size={20} />
				</button>

				<!-- Center Glowing Neon Pink Play Button -->
				<button
					onclick={() => {
						if (!playback.now && playback.queue.items.length === 0) {
							import('$lib/curatedFeed').then(({ CURATED_TOP_SONGS }) => {
								if (CURATED_TOP_SONGS.length > 0) {
									api.play(CURATED_TOP_SONGS[0]);
								}
							});
						} else {
							api.togglePause();
						}
					}}
					aria-label={playback.paused ? t('player.play') : t('player.pause')}
					class="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-pink-600 via-rose-500 to-pink-500 text-white shadow-xl shadow-pink-500/40 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
				>
					<HugeiconsIcon
						icon={PauseIcon}
						altIcon={PlayIcon}
						showAlt={!playback.now || playback.paused}
						size={22}
						fill="currentColor"
						class={!playback.now || playback.paused ? 'ml-0.5' : ''}
					/>
				</button>

				<button
					onclick={() => api.nextTrack()}
					aria-label={t('player.next')}
					class="flex h-8 w-8 items-center justify-center rounded-full text-foreground/80 hover:text-white transition-colors cursor-pointer"
				>
					<HugeiconsIcon icon={NextIcon} size={20} />
				</button>
				<button
					onclick={cycleRepeat}
					aria-label={t('player.repeat_state', {
						state: repeat === 'off' ? t('player.repeat_off') : repeat === 'one' ? t('player.repeat_one') : t('player.repeat_all')
					})}
					class="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-white transition-colors cursor-pointer"
				>
					<HugeiconsIcon
						icon={RepeatIcon}
						altIcon={RepeatOne01Icon}
						showAlt={repeat === 'one'}
						size={16}
						class={repeat !== 'off' ? 'text-primary' : ''}
					/>
				</button>
			</div>

			<!-- Seek Progress Bar -->
			<div class="flex w-full items-center gap-2.5 text-[11px] font-medium text-muted-foreground/80">
				<span class="tabular-nums">{fmt(shownPosition)}</span>
				<input
					type="range"
					class="range flex-1"
					style="--pct:{playback.duration ? (shownPosition / playback.duration) * 100 : 0}%"
					min="0"
					max={playback.duration || 0}
					value={shownPosition}
					oninput={onSeekInput}
					onchange={onSeekCommit}
					aria-label={t('player.seek')}
				/>
				<span class="tabular-nums">{fmt(playback.duration)}</span>
			</div>
		</div>

		<!-- Right: Lyrics Pill + Volume + Tools -->
		<div class="flex w-1/4 max-w-xs items-center justify-end gap-2">
			<!-- Lyrics Frosted Pill Button -->
			<button
				onclick={onToggleLyrics}
				class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border border-white/10 bg-white/5 hover:bg-white/12 text-foreground transition-all cursor-pointer {lyricsOpen ? 'border-primary bg-primary/20 text-primary' : ''}"
				title="Toggle Lyrics"
			>
				<HugeiconsIcon icon={Mic01Icon} size={14} />
				<span>Lyrics</span>
			</button>

			<!-- Volume Controls -->
			<div class="hidden xl:flex items-center gap-1.5 pl-2">
				<button
					onclick={toggleMute}
					class="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-white transition-colors cursor-pointer"
					aria-label={playback.volume === 0 ? t('player.unmute') : t('player.mute')}
				>
					<HugeiconsIcon
						icon={VolumeHighIcon}
						altIcon={VolumeMute02Icon}
						showAlt={playback.volume === 0}
						size={17}
					/>
				</button>
				<input
					type="range"
					class="range w-20"
					style="--pct:{playback.volume}%"
					min="0"
					max="100"
					value={playback.volume}
					oninput={onVolume}
					onchange={onVolumeCommit}
					onwheel={wheelVolume}
					aria-label={t('player.volume')}
				/>
			</div>

			<!-- Audio Visualizer / EQ / Playback Mode -->
			{#if playback.crossfading}
				<button
					onclick={() => (showEq = true)}
					class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-pink-500/25 text-pink-300 border border-pink-500/40 shadow-[0_0_12px_rgba(236,72,153,0.5)] animate-pulse cursor-pointer"
					title="DJ Crossfade Active"
				>
					<span class="size-1.5 rounded-full bg-pink-400 animate-ping"></span>
					<span>DJ Fade</span>
				</button>
			{:else if playback.preloading}
				<span
					class="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
					title="Preloading Next Track"
				>
					<span class="size-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
					<span>Buffering</span>
				</span>
			{/if}

			<!-- 60FPS Audio Visualizer Studio (vizz.fm) -->
			<button
				onclick={() => (audioFx.visualizerModalOpen = !audioFx.visualizerModalOpen)}
				class="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-white/10 hover:text-white transition-colors cursor-pointer relative {audioFx.visualizerModalOpen ? 'bg-pink-500/20 text-pink-400' : ''}"
				title="60FPS Audio Visualizer Studio (vizz.fm)"
				aria-label="Audio Visualizer Studio"
			>
				<HugeiconsIcon icon={AudioWave02Icon} size={17} class={audioFx.visualizerModalOpen ? 'text-pink-400 animate-pulse' : ''} />
			</button>

			<button
				onclick={() => (showEq = !showEq)}
				class="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-white/10 hover:text-white transition-colors cursor-pointer relative"
				title="Equalizer, Gapless & DJ Crossfade"
			>
				<HugeiconsIcon icon={SparklesIcon} size={17} class={audioFx.playbackMode !== 'normal' || audioFx.eqPreset !== 'flat' ? 'text-primary' : ''} />
				{#if audioFx.playbackMode === 'crossfade'}
					<span class="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-pink-500 shadow-[0_0_6px_#ec4899]"></span>
				{:else if audioFx.playbackMode === 'gapless'}
					<span class="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]"></span>
				{/if}
			</button>

			<!-- Queue -->
			<button
				onclick={onToggleQueue}
				class="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-white/10 hover:text-white transition-colors cursor-pointer {queueOpen ? 'text-primary' : ''}"
				title="Queue"
			>
				<HugeiconsIcon icon={Queue01Icon} size={17} />
			</button>

			<!-- Theater Fullscreen -->
			<button
				onclick={() => (ui.theaterOpen = true)}
				class="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
				title="Fullscreen Mode"
			>
				<HugeiconsIcon icon={MaximizeScreenIcon} size={17} />
			</button>
		</div>
	</div>
</footer>

<EqualizerDialog bind:open={showEq} />
