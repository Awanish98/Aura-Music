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
		MusicNote01Icon,
		ArrowUp01Icon,
		ArrowDown01Icon,
		AudioWave02Icon
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

	// Pop the heart once when the user favourites (not when un-favouriting). Reset on animation end
	// so the next like can replay it.
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

	// The current track was appended by autoplay → show the subtle ∞ badge next to the title.
	// Matched against the now-playing videoId so a transient queue/now-playing mismatch (mid
	// gapless advance) can't flash the badge on the wrong song.
	const autoplayTrack = $derived.by(() => {
		const cur = playback.queue.items[playback.queue.currentIndex];
		return !!cur?.autoplay && cur.video_id === playback.now?.videoId;
	});

	// The ⋮ menu needs the full SongItem — NowPlaying carries no album_id. Take it from the queue
	// row, matched on videoId so a mid-advance mismatch can't point the menu at the wrong song.
	const currentSong = $derived.by(() => {
		const cur = playback.queue.items[playback.queue.currentIndex];
		return cur?.video_id === playback.now?.videoId ? cur : null;
	});

	// The title links to the song's album (there is no per-song page). Local files carry no
	// album_id, so their title stays plain text.
	const albumId = $derived(
		currentSong && !api.isLocalId(currentSong.video_id) ? currentSong.album_id : undefined
	);

	// Seek: while dragging, hold a local value so incoming mpv position ticks can't yank the thumb
	// back under the pointer; only invoke the (expensive) seek on release.
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

	// Dragging a slider past its end and releasing outside it retargets the click at the bar (the
	// click lands on the common ancestor of press and release), which used to toggle the view.
	// So judge by where the press started, not where the release happened.
	let pressedControl = false;

	// Anywhere on the bar that isn't a control opens (or closes) the now-playing view: the bar is
	// what's left of it once it's minimised, so it's the way back in. Deliberately no pointer
	// cursor, because this is the whole bar, not a button, and every real button keeps its own click.
	function onBarClick(e: MouseEvent) {
		if (pressedControl || isControl(e.target)) return;
		np.open = !np.open;
	}
</script>

<!-- The chevron button below is the keyboard equivalent of clicking the bar, so the bar itself
     stays a plain region rather than becoming a focusable control wrapping every other control. -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions, a11y_no_noninteractive_element_interactions -->
<footer
	onpointerdown={(e) => (pressedControl = isControl(e.target))}
	onclick={onBarClick}
	class="relative border-t bg-card/95 backdrop-blur-xl transition-all select-none {np.open ? 'hidden md:flex' : 'flex'}"
>
	<!-- Mobile Mini Player Bar (< md) -->
	<div class="flex md:hidden w-full items-center justify-between gap-3 px-3 py-2.5 relative">
		<!-- Top Mini Progress Line -->
		<div class="absolute inset-x-0 top-0 h-[2.5px] bg-primary/20 overflow-hidden">
			<div
				class="h-full bg-primary transition-all duration-150"
				style="width: {playback.duration ? (shownPosition / playback.duration) * 100 : 0}%"
			></div>
		</div>

		<!-- Left Info (Artwork + Marquee Title + Artist) -->
		<div class="flex min-w-0 flex-1 items-center gap-2.5 cursor-pointer" onclick={() => (np.open = true)}>
			{#key playback.now?.videoId}
				{#if playback.now?.thumbnail}
					<img
						src={thumb(playback.now.thumbnail, 120, playback.now?.title || 'Aura', 'song')}
						alt=""
						style="max-width:none"
						class="h-10 w-10 shrink-0 rounded-lg object-cover shadow-md"
						in:fade={{ duration: 250 }}
						decoding="async"
						onerror={(e) => {
							const target = e.currentTarget as HTMLImageElement;
							target.src = generateAvatarSvg(playback.now?.title || 'Aura', 'song');
						}}
					/>
				{:else}
					<img
						src={generateAvatarSvg(playback.now?.title || 'Aura', 'song')}
						alt=""
						style="max-width:none"
						class="h-10 w-10 shrink-0 rounded-lg object-cover shadow-md"
						in:fade={{ duration: 250 }}
						decoding="async"
					/>
				{/if}
			{/key}
			<div class="min-w-0 flex-1">
				<Marquee text={playback.now?.title ?? t('player.not_playing')} class="text-xs font-semibold text-foreground" />
				<div class="truncate text-[11px] text-muted-foreground">
					{playback.now?.artists ?? ''}
				</div>
			</div>
		</div>

		<!-- Right Mobile Quick Actions -->
		<div class="flex items-center gap-1 shrink-0" onclick={(e) => e.stopPropagation()}>
			<Button
				variant="ghost"
				size="icon-sm"
				class="text-muted-foreground hover:text-foreground"
				onclick={toggleLike}
				aria-label={t('common.like')}
			>
				<span class:animate-heart-pop={justLiked} onanimationend={() => (justLiked = false)}>
					<HugeiconsIcon
						icon={FavouriteIcon}
						class="h-4 w-4 {playback.rating === 'like' ? 'fill-current text-primary' : ''}"
					/>
				</span>
			</Button>
			<Button
				variant="default"
				size="icon-sm"
				class="rounded-full shadow-md bg-primary text-primary-foreground"
				onclick={() => api.togglePause()}
				aria-label={playback.paused ? t('player.play') : t('player.pause')}
			>
				<HugeiconsIcon
					icon={PauseIcon}
					altIcon={PlayIcon}
					showAlt={playback.paused}
					class="h-4 w-4"
					fill="currentColor"
				/>
			</Button>
			<Button
				variant="ghost"
				size="icon-sm"
				class="text-muted-foreground hover:text-foreground"
				onclick={() => api.nextTrack()}
				aria-label={t('player.next')}
			>
				<HugeiconsIcon icon={NextIcon} class="h-4 w-4" />
			</Button>
		</div>
	</div>

	<!-- Desktop Player Bar (>= md) -->
	<div class="hidden md:flex w-full items-center gap-2 px-2 py-2.5 sm:gap-4 sm:px-4 sm:py-3">
		<!-- Now playing -->
		<div class="flex min-w-0 flex-1 items-center gap-3" data-ctx>
			{#key playback.now?.videoId}
				{#if playback.now?.thumbnail}
					<img
						src={thumb(playback.now.thumbnail, 120, playback.now?.title || 'Aura', 'song')}
						alt=""
						style="max-width:none"
						class="h-12 w-12 shrink-0 rounded-lg object-cover shadow-sm"
						in:fade={{ duration: 250 }}
						decoding="async"
						onerror={(e) => {
							const target = e.currentTarget as HTMLImageElement;
							target.src = generateAvatarSvg(playback.now?.title || 'Aura', 'song');
						}}
					/>
				{:else}
					<img
						src={generateAvatarSvg(playback.now?.title || 'Aura', 'song')}
						alt=""
						style="max-width:none"
						class="h-12 w-12 shrink-0 rounded-lg object-cover shadow-sm"
						in:fade={{ duration: 250 }}
						decoding="async"
					/>
				{/if}
			{/key}
			<div class="min-w-0">
				<div class="flex items-center gap-1.5">
					{#snippet title()}
						<Marquee
							text={playback.now?.title ?? t('player.not_playing')}
							class="text-sm font-medium"
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
						<span
							class="shrink-0 text-muted-foreground"
							title={t('player.autoplay_notice')}
							in:fade={{ duration: 200 }}
						>
							<HugeiconsIcon icon={InfinityIcon} class="h-3.5 w-3.5" />
						</span>
					{/if}
				</div>
				<div class="flex items-center gap-2">
					<ArtistLine
						runs={playback.now?.artistRuns}
						text={playback.now?.artists ?? ''}
						marquee
						class="block max-w-full text-xs text-muted-foreground"
					/>
					{#if playback.now}
						{@const id = playback.now.videoId || ''}
						{@const isCloud = id.startsWith('gdrive:')}
						{@const isLive = playback.now.duration === 'LIVE' || id.startsWith('fmhy:')}
						<span
							class="hidden xl:inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.2 text-[9px] font-bold tracking-wider uppercase {isCloud
								? 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
								: isLive
									? 'bg-red-500/15 text-red-400 border border-red-500/25'
									: 'bg-primary/15 text-primary border border-primary/25'}"
						>
							{isCloud ? 'Cloud' : isLive ? 'Live' : 'Lossless'}
						</span>
						<AudioVisualizer height={14} barsCount={6} class="hidden 2xl:flex ml-1 text-primary" />
					{/if}
				</div>
			</div>
			{#if playback.now}
				<div class="flex items-center">
					{#if !api.isLocalId(playback.now.videoId)}
						<Button
							variant="ghost"
							size="icon-sm"
							class="hidden lg:inline-flex"
							onclick={toggleLike}
							aria-label={t('common.like')}
						>
							<span
								class="inline-flex"
								class:animate-heart-pop={justLiked}
								onanimationend={() => (justLiked = false)}
							>
								<HugeiconsIcon
									icon={FavouriteIcon}
									class="h-4 w-4 {playback.rating === 'like' ? 'fill-current text-primary' : 'text-muted-foreground'}"
								/>
							</span>
						</Button>
						<Button
							variant="ghost"
							size="icon-sm"
							class="hidden lg:inline-flex"
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
							aria-label={t('player.save_to_playlist')}
						>
							<HugeiconsIcon icon={Add01Icon} class="h-4 w-4 text-muted-foreground" />
						</Button>
					{/if}
					{#if currentSong}
						<TrackMenu
							song={currentSong}
							linksOnly
							onAdd={() => openAddToPlaylist(currentSong!)}
							triggerClass="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
						/>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Transport -->
		<div class="flex flex-[1.5] flex-col items-center gap-1">
			<div class="flex items-center gap-1">
				<Button
					variant="ghost"
					size="icon-sm"
					onclick={() => api.toggleShuffle()}
					aria-label={t('player.shuffle')}
					aria-pressed={shuffleOn}
				>
					<HugeiconsIcon
						icon={ShuffleIcon}
						class="h-4 w-4 {shuffleOn ? 'text-primary' : 'text-muted-foreground'}"
					/>
				</Button>
				<Button variant="ghost" size="icon-sm" onclick={() => api.prevTrack()} aria-label={t('player.previous')}>
					<HugeiconsIcon icon={PreviousIcon} class="h-5 w-5" />
				</Button>
				<Button
					variant="default"
					size="icon"
					class="rounded-full shadow-lg"
					onclick={() => api.togglePause()}
					aria-label={playback.paused ? t('player.play') : t('player.pause')}
				>
					<HugeiconsIcon
						icon={PauseIcon}
						altIcon={PlayIcon}
						showAlt={playback.paused}
						class="h-5 w-5"
						fill="currentColor"
					/>
				</Button>
				<Button variant="ghost" size="icon-sm" onclick={() => api.nextTrack()} aria-label={t('player.next')}>
					<HugeiconsIcon icon={NextIcon} class="h-5 w-5" />
				</Button>
				<Button
					variant="ghost"
					size="icon-sm"
					onclick={cycleRepeat}
					aria-label={t('player.repeat_state', {
						state: repeat === 'off' ? t('player.repeat_off') : repeat === 'one' ? t('player.repeat_one') : t('player.repeat_all')
					})}
					aria-pressed={repeat !== 'off'}
				>
					<HugeiconsIcon
						icon={RepeatIcon}
						altIcon={RepeatOne01Icon}
						showAlt={repeat === 'one'}
						class="h-4 w-4 {repeat !== 'off' ? 'text-primary' : 'text-muted-foreground'}"
					/>
				</Button>
			</div>
			<div class="flex w-full max-w-md items-center gap-2 text-xs text-muted-foreground">
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
				{#if playback.now?.duration === 'LIVE' || !playback.duration}
					<span class="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">LIVE</span>
				{:else}
					<span class="tabular-nums">{fmt(playback.duration)}</span>
				{/if}
			</div>
		</div>

		<!-- Volume + queue -->
		<div class="flex flex-1 items-center justify-end gap-2">
			<div class="hidden items-center gap-1 md:flex">
				<Button
					variant="ghost"
					size="icon-sm"
					class="text-muted-foreground"
					onclick={toggleMute}
					aria-label={playback.volume === 0 ? t('player.unmute') : t('player.mute')}
				>
					<HugeiconsIcon
						icon={VolumeHighIcon}
						altIcon={VolumeMute02Icon}
						showAlt={playback.volume === 0}
						class="h-4 w-4"
					/>
				</Button>
				<input
					type="range"
					class="range w-24"
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
			<div class="flex items-center gap-0.5">
				<Button variant="ghost" size="icon-sm" onclick={openMiniPlayer} aria-label={t('player.mini_player')}>
					<HugeiconsIcon icon={MinimizeScreenIcon} class="h-5 w-5" />
				</Button>
				<Button
					variant={ui.videoMode !== 'hidden' ? 'secondary' : 'ghost'}
					size="icon-sm"
					onclick={() => {
						if (ui.videoMode === 'hidden') {
							ui.videoMode = 'docked';
						} else if (ui.videoMode === 'docked') {
							ui.videoMode = 'expanded';
						} else {
							ui.videoMode = 'docked';
						}
					}}
					aria-label="Video Player (Mini / Fullscreen)"
					title="Video Player (Mini / Fullscreen)"
				>
					<HugeiconsIcon icon={MaximizeScreenIcon} class="h-5 w-5 {ui.videoMode !== 'hidden' ? 'text-primary' : ''}" />
				</Button>
				<Button
					variant={showEq ? 'secondary' : 'ghost'}
					size="icon-sm"
					onclick={() => (showEq = !showEq)}
					aria-label="Sound Equalizer & Audio FX"
					title="Sound Equalizer & Audio FX"
				>
					<HugeiconsIcon icon={AudioWave02Icon} class="h-5 w-5 {audioFx.eqPreset !== 'flat' ? 'text-primary' : ''}" />
				</Button>

				<Button
					variant={lyricsOpen ? 'secondary' : 'ghost'}
					size="icon-sm"
					onclick={onToggleLyrics}
					aria-label={t('player.lyrics')}
				>
					<HugeiconsIcon icon={Mic01Icon} class="h-5 w-5" />
				</Button>

				<Button
					variant={queueOpen ? 'secondary' : 'ghost'}
					size="icon-sm"
					onclick={onToggleQueue}
					aria-label={t('player.queue')}
				>
					<HugeiconsIcon icon={Queue01Icon} class="h-5 w-5" />
				</Button>
				<Button
					variant="ghost"
					size="icon-sm"
					onclick={() => (np.open = !np.open)}
					aria-label={np.open ? t('player.minimize_player') : t('player.open_player')}
					aria-expanded={np.open}
				>
					<HugeiconsIcon
						icon={ArrowUp01Icon}
						altIcon={ArrowDown01Icon}
						showAlt={np.open}
						class="h-5 w-5"
					/>
				</Button>
			</div>
		</div>
	</div>
</footer>

<EqualizerDialog bind:open={showEq} />

