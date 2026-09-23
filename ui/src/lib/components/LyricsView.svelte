<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Mic01Icon } from '@hugeicons/core-free-icons';
	import * as api from '$lib/api';
	import { playback } from '$lib/player.svelte';
	import { t } from '$lib/i18n.svelte';

	let { expanded = false, compact = false }: { expanded?: boolean; compact?: boolean } =
		$props();

	function durationSecs(d?: string): number | undefined {
		if (!d) return undefined;
		const parts = d.split(':').map(Number);
		if (!parts.length || parts.some(Number.isNaN)) return undefined;
		return parts.reduce((a, b) => a * 60 + b, 0);
	}

	let lyrics = $state<api.Lyrics | null>(null);
	let loading = $state(true);
	let scroller: HTMLElement | undefined = $state();

	let requested = '';

	$effect(() => {
		const now = playback.now;
		if (!now) {
			requested = '';
			lyrics = null;
			loading = false;
			return;
		}
		if (now.videoId === requested) return;
		const id = (requested = now.videoId);
		loading = true;
		lyrics = null;
		const album = playback.queue.items[playback.queue.currentIndex]?.album;
		api.getLyrics({
			videoId: id,
			title: now.title,
			artists: now.artists,
			album: album ?? undefined,
			duration: durationSecs(now.duration)
		})
			.then((l) => {
				if (requested !== id) return;
				lyrics = l;
				loading = false;
				hasScrolled = false;
				userScrolled = false;
				setTimeout(() => scrollToActive(false), 80);
			})
			.catch(() => {
				if (requested !== id) return;
				loading = false;
			});
	});

	// Active line index based on current playback timestamp
	const activeIndex = $derived.by(() => {
		if (!lyrics?.synced) return -1;
		const currentMs = posMs;
		let i = -1;
		for (let j = 0; j < lyrics.lines.length; j++) {
			const t = lyrics.lines[j].time_ms;
			if (t === undefined) continue;
			if (t > currentMs) break;
			i = j;
		}
		return i;
	});

	// Determine if we are in an instrumental interlude / prelude
	const isInstrumentalGap = $derived.by(() => {
		if (!lyrics?.synced || !lyrics.lines.length) return false;
		const currentMs = posMs;
		// Intro before first line
		if (activeIndex === -1 && lyrics.lines[0]?.time_ms && lyrics.lines[0].time_ms > 3000) {
			return currentMs < lyrics.lines[0].time_ms - 800;
		}
		if (activeIndex >= 0 && activeIndex < lyrics.lines.length - 1) {
			const curLine = lyrics.lines[activeIndex];
			const nextLine = lyrics.lines[activeIndex + 1];
			const curEnd = curLine.end_time_ms || (curLine.time_ms ? curLine.time_ms + 4000 : currentMs);
			if (nextLine.time_ms && nextLine.time_ms - curEnd > 4000) {
				return currentMs > curEnd + 500 && currentMs < nextLine.time_ms - 800;
			}
		}
		return false;
	});

	let userScrolled = $state(false);
	let userScrollTimeout: ReturnType<typeof setTimeout> | undefined;
	let hasScrolled = false;
	let wasExpanded: boolean | undefined;

	function onUserScroll() {
		userScrolled = true;
		if (userScrollTimeout) clearTimeout(userScrollTimeout);
		userScrollTimeout = setTimeout(() => {
			userScrolled = false;
			scrollToActive(true);
		}, 2600);
	}

	function scrollToActive(smooth = true) {
		if (!scroller || activeIndex < 0) return;
		const line = scroller.querySelector(`[data-line="${activeIndex}"]`) as HTMLElement | null;
		if (!line) return;

		const lineRect = line.getBoundingClientRect();
		const boxRect = scroller.getBoundingClientRect();

		// Position active line smoothly at ~36% from the top of the visible viewport
		const targetTop = scroller.scrollTop + (lineRect.top - boxRect.top) - (boxRect.height * 0.36);

		scroller.scrollTo({
			top: Math.max(0, targetTop),
			behavior: smooth ? 'smooth' : 'instant'
		});
	}

	function syncToActive() {
		userScrolled = false;
		if (userScrollTimeout) clearTimeout(userScrollTimeout);
		scrollToActive(true);
	}

	$effect(() => {
		const i = activeIndex;
		if (expanded !== wasExpanded) {
			wasExpanded = expanded;
			userScrolled = false;
			hasScrolled = false;
		}
		if (i >= 0 && scroller && !userScrolled) {
			scrollToActive(hasScrolled);
			hasScrolled = true;
		}
	});

	function seekTo(line: api.LyricLine) {
		if (line.time_ms === undefined) return;
		const secs = line.time_ms / 1000;
		playback.position = secs;
		playback.positionAt = performance.now();
		userScrolled = false;
		if (userScrollTimeout) clearTimeout(userScrollTimeout);
		api.seek(secs);
		setTimeout(() => scrollToActive(true), 60);
	}

	// 60-120fps high-precision frame clock for Apple Music word-to-word sweeping
	let interpolatedPosSecs = $state(playback.position);

	const needsFrameClock = $derived(
		!!lyrics?.synced && lyrics.lines.some((l) => (l.words?.length ?? 0) > 0)
	);

	$effect(() => {
		const pos = playback.position;
		if (playback.paused || !needsFrameClock) {
			interpolatedPosSecs = pos;
			return;
		}
		const base = pos;
		const baseAt = performance.now();
		interpolatedPosSecs = pos;
		let frameId = requestAnimationFrame(function tick() {
			interpolatedPosSecs = base + (performance.now() - baseAt) / 1000;
			frameId = requestAnimationFrame(tick);
		});
		return () => cancelAnimationFrame(frameId);
	});

	const posMs = $derived(interpolatedPosSecs * 1000);

	function getWordProgress(word: api.LyricWord, currentMs: number): number {
		if (currentMs <= word.start_ms) return 0;
		if (currentMs >= word.end_ms) return 1;
		const dur = word.end_ms - word.start_ms;
		if (dur <= 0) return 1;
		return (currentMs - word.start_ms) / dur;
	}
</script>

<div class="relative flex h-full w-full flex-col overflow-hidden">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={scroller}
		onwheel={onUserScroll}
		ontouchmove={onUserScroll}
		class="relative min-h-0 flex-1 overflow-y-auto selection:bg-white/20 {compact
			? 'px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
			: expanded
				? 'px-6 py-6 md:px-16 lg:px-24'
				: 'px-5 py-4'}"
	>
		<!-- Apple Music Ambient Glowing Glow Backdrop -->
		{#if playback.now?.thumbnail && !compact}
			<div
				class="pointer-events-none absolute -inset-10 z-0 opacity-15 blur-3xl transition-opacity duration-1000"
				style="background-image: url('{playback.now.thumbnail}'); background-size: cover; background-position: center;"
			></div>
		{/if}

		{#if loading}
			<div class="relative z-10 space-y-4 py-8">
				{#each { length: 8 } as _, i (i)}
					<div
						class="h-7 animate-pulse rounded-lg bg-white/10"
						style="width:{50 + ((i * 19) % 45)}%; animation-delay: {i * 120}ms"
					></div>
				{/each}
			</div>
		{:else if lyrics?.instrumental}
			<div class="relative z-10 flex flex-col items-center justify-center py-20 text-center">
				<div class="mb-4 flex space-x-2">
					<span class="h-3 w-3 animate-bounce rounded-full bg-primary/70 [animation-delay:-0.3s]"></span>
					<span class="h-3 w-3 animate-bounce rounded-full bg-primary/70 [animation-delay:-0.15s]"></span>
					<span class="h-3 w-3 animate-bounce rounded-full bg-primary/70"></span>
				</div>
				<p class="text-xl font-bold tracking-wider text-muted-foreground">{t('lyrics.instrumental')} ♪</p>
			</div>
		{:else if lyrics && lyrics.synced}
			<div class="relative z-10 pt-[32vh] pb-[55vh] {expanded ? 'mx-auto max-w-4xl' : ''}">
				<!-- Apple Music Intro / Interlude Pulsing Dots Indicator -->
				{#if isInstrumentalGap}
					<div class="my-6 flex items-center gap-2 px-2 text-primary/80 transition-all duration-300">
						<span class="h-2.5 w-2.5 animate-ping rounded-full bg-primary"></span>
						<span class="text-xs font-semibold uppercase tracking-widest text-primary/80">Musical Interlude</span>
					</div>
				{/if}

				{#each lyrics.lines as line, i (i)}
					{@const isActive = i === activeIndex}
					{@const dist = Math.abs(i - activeIndex)}
					{@const isPast = i < activeIndex}

					{#if line.text && line.text.trim()}
						<button
							data-line={i}
							onclick={() => seekTo(line)}
							class="group relative block w-full origin-left cursor-pointer rounded-xl text-left font-heading font-extrabold tracking-tight transition-all duration-300 ease-out hover:opacity-100 hover:scale-[1.02]
								{expanded ? 'my-3 py-3 text-3xl md:text-4xl' : compact ? 'my-1 py-1.5 text-base' : 'my-2 py-2 text-2xl'}
								{isActive
								? 'scale-[1.04] text-white opacity-100 drop-shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
								: isPast
									? 'opacity-35 hover:opacity-80'
									: dist <= 2
										? 'opacity-55 hover:opacity-90'
										: 'opacity-30 hover:opacity-75'}"
							style={!isActive && dist > 1 && !compact ? `filter: blur(${Math.min(1.2, dist * 0.4)}px);` : ''}
						>
							{#if line.words && line.words.length > 0}
								<!-- Apple Music Word-to-Word Karaoke Sweep Rendering -->
								<span class="inline-flex flex-wrap items-baseline">
									{#each line.words as word, wIdx (wIdx)}
										{@const isWordEnd = word.text.endsWith(' ')}
										{@const cleanText = word.text.trimEnd()}
										{#if isActive}
											{@const progress = getWordProgress(word, posMs)}
											{@const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100)}
											{@const isCurrentWord = progress > 0 && progress < 1}
											{@const isSung = progress >= 1}

											<span
												class="inline-block transition-transform duration-100 ease-out {isWordEnd ? 'mr-[0.28em]' : ''} {isCurrentWord ? 'scale-[1.06]' : ''}"
												style={isSung
													? 'color: #ffffff; text-shadow: 0 0 16px rgba(255,255,255,0.4);'
													: isCurrentWord
														? `background-image: linear-gradient(90deg, #ffffff ${pct}%, rgba(255,255,255,0.32) ${pct}%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 20px rgba(255,255,255,0.6);`
														: 'color: rgba(255, 255, 255, 0.35);'}
											>
												{cleanText}
											</span>
										{:else}
											<span class="inline-block {isWordEnd ? 'mr-[0.28em]' : ''}">
												{cleanText}
											</span>
										{/if}
									{/each}
								</span>
							{:else}
								<span>{line.text}</span>
							{/if}

							{#if line.translation}
								<p class="mt-1 text-sm font-medium italic tracking-wide opacity-75 transition-opacity">
									{line.translation}
								</p>
							{/if}
						</button>
					{:else}
						<div class="h-4"></div>
					{/if}
				{/each}
			</div>
		{:else if lyrics}
			<div
				class="relative z-10 space-y-3 leading-relaxed text-foreground opacity-90 {expanded
					? 'mx-auto max-w-3xl text-2xl'
					: compact
						? 'text-sm'
						: 'text-lg'}"
			>
				{#each lyrics.lines as line, i (i)}
					{#if line.text}
						<div>
							<p>{line.text}</p>
							{#if line.translation}
								<p class="text-xs italic text-muted-foreground">{line.translation}</p>
							{/if}
						</div>
					{:else}
						<div class="h-4"></div>
					{/if}
				{/each}
			</div>
		{:else}
			<div class="relative z-10 flex flex-col items-center justify-center py-20 text-center">
				<p class="text-base text-muted-foreground">{t('lyrics.none_found')}</p>
			</div>
		{/if}
	</div>

	<!-- Floating Sync Pill when user has manually scrolled -->
	{#if userScrolled && lyrics?.synced && activeIndex >= 0}
		<div class="pointer-events-none absolute bottom-14 left-0 right-0 z-30 flex justify-center">
			<button
				onclick={syncToActive}
				class="pointer-events-auto flex items-center gap-2 rounded-full bg-primary/95 px-4 py-2 text-xs font-bold text-primary-foreground shadow-2xl shadow-primary/50 backdrop-blur-md transition-all active:scale-95 animate-bounce hover:bg-primary"
				transition:scale={{ duration: 180 }}
			>
				<HugeiconsIcon icon={Mic01Icon} size={14} />
				<span>Sync Lyrics</span>
			</button>
		</div>
	{/if}

	{#if lyrics && !loading && !compact}
		<div class="relative z-10 flex shrink-0 items-center justify-between border-t border-white/10 px-5 py-2 text-[11px] text-muted-foreground backdrop-blur-md">
			<span>{lyrics.source.startsWith('Source:') ? lyrics.source : `Lyrics: ${lyrics.source}`}</span>
			<span class="flex items-center gap-1.5 font-medium text-emerald-400">
				<span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span> Word-Sync Active
			</span>
		</div>
	{/if}
</div>
