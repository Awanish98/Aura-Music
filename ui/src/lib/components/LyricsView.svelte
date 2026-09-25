<script lang="ts">
	import { fade, scale, fly, slide } from 'svelte/transition';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		Mic01Icon,
		SparklesIcon,
		MusicNote01Icon,
		DashboardSpeed01Icon,
		InformationCircleIcon,
		AudioWave01Icon
	} from '@hugeicons/core-free-icons';
	import * as api from '$lib/api';
	import { playback } from '$lib/player.svelte';
	import { t } from '$lib/i18n.svelte';
	import { romanizeText, hasNonLatin, translateLyricLine } from '$lib/romanizer';

	let { expanded = false, compact = false }: { expanded?: boolean; compact?: boolean } =
		$props();

	function durationSecs(d?: string): number | undefined {
		if (!d) return undefined;
		const parts = d.split(':').map(Number);
		if (!parts.length || parts.some(Number.isNaN)) return undefined;
		return parts.reduce((a, b) => a * 60 + b, 0);
	}

	import { lyricsService } from '$lib/lyrics.svelte';

	const lyrics = $derived(lyricsService.current);
	const loading = $derived(lyricsService.loading);
	let scroller: HTMLElement | undefined = $state();

	// Better Lyrics customization & controls
	let fontScale = $state(1.0);
	let showRomanization = $state(true);
	let showTranslation = $state(false);
	let syncOffset = $state(0.0); // Offset in seconds (-2.0s to +2.0s)
	let showControls = $state(false);
	let showOffsetPicker = $state(false);

	// Line-by-line translation dictionary { lineIndex: translatedText }
	let translations = $state<Record<number, string>>({});
	let isTranslating = $state(false);

	// Load stored user preferences on mount
	$effect(() => {
		try {
			const savedScale = localStorage.getItem('aura_lyrics_scale');
			if (savedScale) fontScale = parseFloat(savedScale);

			const savedRom = localStorage.getItem('aura_lyrics_romaji');
			if (savedRom !== null) showRomanization = savedRom === 'true';

			const savedTrans = localStorage.getItem('aura_lyrics_trans');
			if (savedTrans !== null) showTranslation = savedTrans === 'true';

			const savedOff = localStorage.getItem('aura_lyrics_offset');
			if (savedOff) syncOffset = parseFloat(savedOff);
		} catch {}
	});

	function updateScale(delta: number) {
		const next = Math.min(1.4, Math.max(0.75, Math.round((fontScale + delta) * 100) / 100));
		fontScale = next;
		try {
			localStorage.setItem('aura_lyrics_scale', String(next));
		} catch {}
	}

	function toggleRomanization() {
		showRomanization = !showRomanization;
		try {
			localStorage.setItem('aura_lyrics_romaji', String(showRomanization));
		} catch {}
	}

	function toggleTranslation() {
		showTranslation = !showTranslation;
		try {
			localStorage.setItem('aura_lyrics_trans', String(showTranslation));
		} catch {}
		if (showTranslation && lyrics?.lines?.length) {
			loadTranslations();
		}
	}

	function setSyncOffset(val: number) {
		syncOffset = Math.round(val * 10) / 10;
		try {
			localStorage.setItem('aura_lyrics_offset', String(syncOffset));
		} catch {}
	}

	function adjustSyncOffset(delta: number) {
		setSyncOffset(syncOffset + delta);
	}

	// Fetch/Load lyrics from central persistent store when track changes
	$effect(() => {
		const trackId = playback.now?.videoId;
		if (trackId) {
			lyricsService.loadLyrics();
		}
	});

	// Auto-scroll when lyrics arrive or update
	$effect(() => {
		if (lyrics?.lines?.length) {
			hasScrolled = false;
			userScrolled = false;
			setTimeout(() => scrollToActive(false), 80);
			if (showTranslation) {
				loadTranslations();
			}
		}
	});

	// Precompute Romanized Lines for fast zero-lag render
	const romanizedLines = $derived.by(() => {
		if (!lyrics?.lines) return [];
		return lyrics.lines.map((line) => {
			if (!line.text) return '';
			if (hasNonLatin(line.text)) {
				const r = romanizeText(line.text);
				return r !== line.text ? r : '';
			}
			return '';
		});
	});

	// Check if the current song contains non-Latin scripts (Korean/Japanese/Hindi/Chinese)
	const songHasNonLatin = $derived.by(() => {
		if (!lyrics?.lines) return false;
		return lyrics.lines.some((l) => hasNonLatin(l.text || ''));
	});

	// Asynchronously load line translations
	async function loadTranslations() {
		if (!lyrics?.lines?.length || isTranslating) return;
		isTranslating = true;
		const currentLines = lyrics.lines;
		const nextTranslations: Record<number, string> = { ...translations };

		try {
			// Process in concurrent chunks of 5 lines to avoid browser throttling
			for (let i = 0; i < currentLines.length; i += 5) {
				const chunk = currentLines.slice(i, i + 5);
				await Promise.all(
					chunk.map(async (line, cIdx) => {
						const lineIdx = i + cIdx;
						if (line.translation) {
							nextTranslations[lineIdx] = line.translation;
							return;
						}
						if (!line.text || !line.text.trim()) return;
						const tr = await translateLyricLine(line.text);
						if (tr) {
							nextTranslations[lineIdx] = tr;
						}
					})
				);
				translations = { ...nextTranslations };
			}
		} catch {} finally {
			isTranslating = false;
		}
	}

	// 60-120fps high-precision frame clock for Better Lyrics word-by-word sweeping
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

	// Effective position in milliseconds including manual user sync offset
	const effectivePosMs = $derived((interpolatedPosSecs + syncOffset) * 1000);

	// Active line index based on current playback timestamp & calibration offset
	const activeIndex = $derived.by(() => {
		if (!lyrics?.synced) return -1;
		const currentMs = effectivePosMs;
		let i = -1;
		for (let j = 0; j < lyrics.lines.length; j++) {
			const t = lyrics.lines[j].time_ms;
			if (t === undefined) continue;
			if (t > currentMs) break;
			i = j;
		}
		return i;
	});

	// Determine if we are in an instrumental interlude / prelude with remaining countdown
	const instrumentalInfo = $derived.by(() => {
		if (!lyrics?.synced || !lyrics.lines.length) return null;
		const currentMs = effectivePosMs;

		// Intro prelude before first line
		if (activeIndex === -1 && lyrics.lines[0]?.time_ms && lyrics.lines[0].time_ms > 3500) {
			if (currentMs < lyrics.lines[0].time_ms - 800) {
				const remSecs = Math.max(1, Math.ceil((lyrics.lines[0].time_ms - currentMs) / 1000));
				return { isIntro: true, remainingSecs: remSecs };
			}
		}

		// Mid-song instrumental gap
		if (activeIndex >= 0 && activeIndex < lyrics.lines.length - 1) {
			const curLine = lyrics.lines[activeIndex];
			const nextLine = lyrics.lines[activeIndex + 1];
			const curEnd = curLine.end_time_ms || (curLine.time_ms ? curLine.time_ms + 4000 : currentMs);
			if (nextLine.time_ms && nextLine.time_ms - curEnd > 4000) {
				if (currentMs > curEnd + 400 && currentMs < nextLine.time_ms - 800) {
					const remSecs = Math.max(1, Math.ceil((nextLine.time_ms - currentMs) / 1000));
					return { isIntro: false, remainingSecs: remSecs };
				}
			}
		}
		return null;
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
		}, 2800);
	}

	function scrollToActive(smooth = true) {
		if (!scroller || activeIndex < 0) return;
		const line = scroller.querySelector(`[data-line="${activeIndex}"]`) as HTMLElement | null;
		if (!line) return;

		const lineRect = line.getBoundingClientRect();
		const boxRect = scroller.getBoundingClientRect();

		// Position active line smoothly at ~36% from top of visible viewport
		const targetTop = scroller.scrollTop + (lineRect.top - boxRect.top) - boxRect.height * 0.36;

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

	let lastScrolledIndex = -1;

	$effect(() => {
		const i = activeIndex;
		if (expanded !== wasExpanded) {
			wasExpanded = expanded;
			userScrolled = false;
			hasScrolled = false;
			lastScrolledIndex = -1;
		}
		if (i >= 0 && i !== lastScrolledIndex && scroller && !userScrolled) {
			lastScrolledIndex = i;
			scrollToActive(hasScrolled);
			hasScrolled = true;
		}
	});

	function seekTo(line: api.LyricLine) {
		if (line.time_ms === undefined) return;
		const targetMs = Math.max(0, line.time_ms - syncOffset * 1000);
		const secs = targetMs / 1000;
		playback.position = secs;
		playback.positionAt = performance.now();
		userScrolled = false;
		if (userScrollTimeout) clearTimeout(userScrollTimeout);
		api.seek(secs);
		setTimeout(() => scrollToActive(true), 60);
	}

	function getWordProgress(word: api.LyricWord, currentMs: number): number {
		if (currentMs <= word.start_ms) return 0;
		if (currentMs >= word.end_ms) return 1;
		const dur = word.end_ms - word.start_ms;
		if (dur <= 0) return 1;
		return (currentMs - word.start_ms) / dur;
	}

	function formatTimeMs(ms?: number): string {
		if (ms === undefined) return '';
		const totalSec = Math.floor(ms / 1000);
		const m = Math.floor(totalSec / 60);
		const s = totalSec % 60;
		return `${m}:${s.toString().padStart(2, '0')}`;
	}
</script>

<div class="relative flex h-full w-full flex-col overflow-hidden select-none font-sans">
	<!-- Better Lyrics Toolbar Header (Expanded / Studio View) -->
	{#if !compact && lyrics}
		<header
			class="relative z-20 flex shrink-0 items-center justify-between gap-2 {expanded ? 'bg-transparent border-none' : 'border-b border-white/[0.08] bg-black/25 backdrop-blur-xl'} px-4 py-2 transition-all"
		>
			<!-- Left: Provider & Word-Sync Status -->
			<div class="flex items-center gap-2 overflow-hidden">
				<span
					class="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[11px] font-semibold text-white/80 border border-white/10"
				>
					<HugeiconsIcon icon={SparklesIcon} size={11} class="text-primary" />
					<span class="truncate max-w-[120px] sm:max-w-[200px]"
						>{lyrics.source.replace(/^Source:\s*/i, '')}</span
					>
				</span>

				{#if lyrics.synced}
					<span
						class="hidden items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-400 sm:inline-flex"
					>
						<span class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
						WORD-SYNC
					</span>
				{/if}
			</div>

			<!-- Right: Better Lyrics 3-Tier Controls (Romaji, Translation, Font Scale, Offset) -->
			<div class="flex items-center gap-1 sm:gap-1.5">
				<!-- Romanization / Romaji Toggle -->
				<button
					onclick={toggleRomanization}
					title={showRomanization ? 'Hide Romanization' : 'Show Romanization (Romaji / Latin)'}
					class="relative flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-bold transition-all {showRomanization
						? 'bg-primary/25 text-primary border border-primary/40 shadow-sm'
						: 'bg-white/[0.05] text-white/60 hover:bg-white/10 hover:text-white border border-transparent'}"
				>
					<span>🔤</span>
					<span class="hidden sm:inline">Romaji</span>
					{#if songHasNonLatin}
						<span class="h-1.5 w-1.5 rounded-full bg-primary animate-ping"></span>
					{/if}
				</button>

				<!-- Translation Toggle -->
				<button
					onclick={toggleTranslation}
					title={showTranslation ? 'Hide Translation' : 'Show Live Translation (English)'}
					class="flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-bold transition-all {showTranslation
						? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-sm'
						: 'bg-white/[0.05] text-white/60 hover:bg-white/10 hover:text-white border border-transparent'}"
				>
					{#if isTranslating}
						<span
							class="h-3 w-3 animate-spin rounded-full border-2 border-amber-300 border-t-transparent"
						></span>
					{:else}
						<span>🌐</span>
					{/if}
					<span class="hidden sm:inline">Translate</span>
				</button>

				<!-- Font Size Adjuster (A- / A+) -->
				<div
					class="flex h-7 items-center rounded-lg bg-white/[0.05] p-0.5 border border-white/10 text-[11px]"
				>
					<button
						onclick={() => updateScale(-0.1)}
						title="Decrease Lyric Font Size"
						class="flex h-6 w-6 items-center justify-center rounded text-white/70 hover:bg-white/15 hover:text-white transition-colors"
					>
						A-
					</button>
					<span class="px-1 text-[10px] font-bold text-white/50">{Math.round(fontScale * 100)}%</span>
					<button
						onclick={() => updateScale(0.1)}
						title="Increase Lyric Font Size"
						class="flex h-6 w-6 items-center justify-center rounded text-white/70 hover:bg-white/15 hover:text-white transition-colors"
					>
						A+
					</button>
				</div>

				<!-- Sync Calibration Offset Stepper -->
				{#if lyrics?.synced}
					<div class="relative">
						<button
							onclick={() => (showOffsetPicker = !showOffsetPicker)}
							title="Calibrate Lyric Timing Offset"
							class="flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-bold transition-all {syncOffset !==
							0
								? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40'
								: 'bg-white/[0.05] text-white/60 hover:bg-white/10 hover:text-white border border-transparent'}"
						>
							<span>⏱️</span>
							<span class="hidden sm:inline"
								>{syncOffset === 0 ? 'Sync' : `${syncOffset > 0 ? '+' : ''}${syncOffset.toFixed(1)}s`}</span
							>
						</button>

						{#if showOffsetPicker}
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								class="absolute right-0 top-9 z-50 flex flex-col gap-2 rounded-xl border border-white/15 bg-black/80 p-3 shadow-2xl backdrop-blur-2xl w-48"
								transition:scale={{ duration: 150, start: 0.95 }}
							>
								<div class="flex items-center justify-between text-[11px] font-bold text-white/80">
									<span>Timing Offset</span>
									<span class="text-cyan-400">{syncOffset > 0 ? '+' : ''}{syncOffset.toFixed(1)}s</span>
								</div>

								<div class="grid grid-cols-4 gap-1">
									<button
										onclick={() => adjustSyncOffset(-0.5)}
										class="rounded bg-white/10 py-1 text-[10px] font-bold hover:bg-white/20 text-white"
										>-0.5s</button
									>
									<button
										onclick={() => adjustSyncOffset(-0.1)}
										class="rounded bg-white/10 py-1 text-[10px] font-bold hover:bg-white/20 text-white"
										>-0.1s</button
									>
									<button
										onclick={() => adjustSyncOffset(0.1)}
										class="rounded bg-white/10 py-1 text-[10px] font-bold hover:bg-white/20 text-white"
										>+0.1s</button
									>
									<button
										onclick={() => adjustSyncOffset(0.5)}
										class="rounded bg-white/10 py-1 text-[10px] font-bold hover:bg-white/20 text-white"
										>+0.5s</button
									>
								</div>

								{#if syncOffset !== 0}
									<button
										onclick={() => setSyncOffset(0)}
										class="w-full rounded-md bg-white/10 py-1 text-[10px] font-semibold text-white/70 hover:bg-white/20 hover:text-white"
									>
										Reset to Default (0.0s)
									</button>
								{/if}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</header>
	{/if}

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={scroller}
		onwheel={onUserScroll}
		ontouchmove={onUserScroll}
		style="--lyric-scale: {fontScale};"
		class="relative min-h-0 flex-1 overflow-y-auto selection:bg-white/20 {compact
			? 'px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
			: expanded
				? 'px-6 py-6 md:px-16 lg:px-24 [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]'
				: 'px-5 py-4 [mask-image:linear-gradient(to_bottom,transparent_0%,black_8%,black_92%,transparent_100%)]'}"
	>
		<!-- Apple Music Ambient Glowing Glow Backdrop -->
		{#if playback.now?.thumbnail && !compact}
			<div
				class="pointer-events-none absolute -inset-10 z-0 opacity-20 blur-3xl transition-opacity duration-1000"
				style="background-image: url('{playback.now.thumbnail}'); background-size: cover; background-position: center;"
			></div>
		{/if}

		{#if loading}
			<div class="relative z-10 space-y-4 py-12 {expanded ? 'mx-auto max-w-3xl' : ''}">
				{#each { length: 8 } as _, i (i)}
					<div
						class="h-8 animate-pulse rounded-xl bg-white/[0.08]"
						style="width:{45 + ((i * 19) % 45)}%; animation-delay: {i * 120}ms"
					></div>
				{/each}
			</div>
		{:else if lyrics?.instrumental}
			<div class="relative z-10 flex flex-col items-center justify-center py-28 text-center">
				<div class="mb-4 flex space-x-2">
					<span class="h-3.5 w-3.5 animate-bounce rounded-full bg-primary/70 [animation-delay:-0.3s]"></span>
					<span class="h-3.5 w-3.5 animate-bounce rounded-full bg-primary/70 [animation-delay:-0.15s]"></span>
					<span class="h-3.5 w-3.5 animate-bounce rounded-full bg-primary/70"></span>
				</div>
				<p class="text-2xl font-bold tracking-wider text-foreground/80">{t('lyrics.instrumental')} ♪</p>
				<p class="mt-2 text-xs text-muted-foreground uppercase tracking-widest">No Vocals in this track</p>
			</div>
		{:else if lyrics && lyrics.synced}
			<div class="relative z-10 pt-[30vh] pb-[55vh] {expanded ? 'mx-auto max-w-4xl' : ''}">
				<!-- Better Lyrics Instrumental Interlude / Prelude Glowing Capsule -->
				{#if instrumentalInfo}
					<div
						class="my-8 flex items-center justify-center"
						transition:scale={{ duration: 250, start: 0.9 }}
					>
						<div
							class="flex items-center gap-3 rounded-full border border-primary/40 bg-primary/15 px-5 py-2.5 shadow-xl backdrop-blur-2xl"
						>
							<div class="flex space-x-1">
								<span class="h-2 w-2 animate-ping rounded-full bg-primary"></span>
								<span
									class="h-2 w-2 animate-ping rounded-full bg-primary [animation-delay:-0.2s]"
								></span>
							</div>
							<span class="text-xs font-extrabold uppercase tracking-widest text-primary">
								{instrumentalInfo.isIntro ? 'Intro Prelude' : 'Musical Interlude'}
							</span>
							<span
								class="rounded-full bg-primary/25 px-2 py-0.5 text-[11px] font-bold text-primary"
							>
								{instrumentalInfo.remainingSecs}s
							</span>
						</div>
					</div>
				{/if}

				{#each lyrics.lines as line, i (i)}
					{@const isActive = i === activeIndex}
					{@const dist = Math.abs(i - activeIndex)}
					{@const isPast = i < activeIndex}
					{@const romText = romanizedLines[i]}
					{@const transText = translations[i]}

					{#if line.text && line.text.trim()}
						<button
							data-line={i}
							onclick={() => seekTo(line)}
							class="group relative block w-full origin-left cursor-pointer rounded-2xl text-left font-heading font-black tracking-tight transition-all duration-300 ease-out hover:opacity-100 hover:scale-[1.015]
								{expanded
								? 'my-5 py-3 text-3xl sm:text-4xl md:text-5xl leading-tight'
								: compact
									? 'my-1.5 py-1 text-base leading-snug'
									: 'my-3 py-2 text-2xl sm:text-3xl leading-snug'}
								{isActive
								? 'scale-[1.03] text-[#fef3c7] opacity-100 drop-shadow-[0_0_32px_rgba(245,158,11,0.55)]'
								: isPast
									? 'opacity-35 hover:opacity-80 text-white/80'
									: dist <= 2
										? 'opacity-60 hover:opacity-95 text-white/90'
										: 'opacity-30 hover:opacity-75 text-white/70'}"
							style="font-size: calc({expanded ? '2.5rem' : compact ? '1rem' : '1.65rem'} * var(--lyric-scale, 1));"
						>
							<!-- Mini Audio Wave Equalizer Indicator directly above active lyrics (reference image match) -->
							{#if isActive}
								<div class="mb-2 flex items-center gap-1.5 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.85)]">
									<HugeiconsIcon icon={AudioWave01Icon} size={expanded ? 24 : 18} class="animate-pulse" />
								</div>
							{/if}

							<!-- TIER 1: Main Original Lyrics (with Word-by-Word Sweep) -->
							<div class="relative">
								{#if line.words && line.words.length > 0}
									<!-- Apple Music / Better Lyrics 120fps Word-to-Word Sweep -->
									<span class="inline-flex flex-wrap items-baseline">
										{#each line.words as word, wIdx (wIdx)}
											{@const isWordEnd = word.text.endsWith(' ')}
											{@const cleanText = word.text.trimEnd()}
											{#if isActive}
												{@const progress = getWordProgress(word, effectivePosMs)}
												{@const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100)}
												{@const isCurrentWord = progress > 0 && progress < 1}
												{@const isSung = progress >= 1}

												<span
													class="inline-block transition-transform duration-100 ease-out {isWordEnd
														? 'mr-[0.28em]'
														: ''} {isCurrentWord ? 'scale-[1.06]' : ''}"
													style={isSung
														? 'color: #fffbeb; text-shadow: 0 0 20px rgba(254,240,138,0.7);'
														: isCurrentWord
															? `background-image: linear-gradient(90deg, #fef08a ${pct}%, rgba(255,255,255,0.3) ${pct}%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 24px rgba(245,158,11,0.8);`
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
									<span class={isActive ? 'text-[#fffbeb] drop-shadow-[0_0_24px_rgba(245,158,11,0.7)]' : ''}>{line.text}</span>
								{/if}
							</div>

							<!-- TIER 2: Romanization / Romaji (Transliteration) -->
							{#if showRomanization && romText}
								<p
									class="mt-1 font-sans font-medium tracking-normal text-white/70 italic transition-all duration-200"
									style="font-size: calc(0.48em * var(--lyric-scale, 1));"
								>
									{romText}
								</p>
							{/if}

							<!-- TIER 3: Live Translation (English / Selected) -->
							{#if showTranslation && transText}
								<p
									class="mt-1 font-sans font-normal tracking-wide text-amber-300/85 transition-all duration-200"
									style="font-size: calc(0.44em * var(--lyric-scale, 1));"
								>
									{transText}
								</p>
							{/if}
						</button>
					{:else}
						<div class="h-4"></div>
					{/if}
				{/each}
			</div>
		{:else if lyrics}
			<!-- Plain / Unsynced Lyrics Display with Romanization & Translation -->
			<div
				class="relative z-10 space-y-4 py-8 leading-relaxed text-foreground opacity-90 {expanded
					? 'mx-auto max-w-3xl text-2xl'
					: compact
						? 'text-sm'
						: 'text-lg'}"
				style="font-size: calc({expanded ? '1.5rem' : compact ? '0.875rem' : '1.125rem'} * var(--lyric-scale, 1));"
			>
				{#each lyrics.lines as line, i (i)}
					{@const romText = romanizedLines[i]}
					{@const transText = translations[i]}

					{#if line.text}
						<div class="rounded-xl p-2 transition-colors hover:bg-white/[0.04]">
							<p class="font-bold text-white/95">{line.text}</p>
							{#if showRomanization && romText}
								<p class="mt-0.5 text-xs text-white/60 italic">{romText}</p>
							{/if}
							{#if showTranslation && transText}
								<p class="mt-0.5 text-xs text-amber-300/80">{transText}</p>
							{/if}
						</div>
					{:else}
						<div class="h-4"></div>
					{/if}
				{/each}
			</div>
		{:else if loading}
			<div class="relative z-10 flex flex-col items-center justify-center py-24 text-center animate-pulse">
				<div class="relative mb-4 flex size-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/10 text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
					<HugeiconsIcon icon={Mic01Icon} size={26} class="animate-bounce" />
				</div>
				<p class="text-base font-semibold text-white/90">Searching synchronized lyrics...</p>
				<p class="mt-1 text-xs text-white/40 font-mono">Querying LRCLIB & NetEase Cloud</p>
			</div>
		{:else}
			<div class="relative z-10 flex flex-col items-center justify-center py-24 text-center">
				<div class="mb-3 flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/30">
					<HugeiconsIcon icon={Mic01Icon} size={24} />
				</div>
				<p class="text-base font-medium text-white/80">{t('lyrics.none_found')}</p>
				<p class="mt-1 text-xs text-white/40">No synced lyrics available for this release</p>
				<button
					type="button"
					onclick={() => lyricsService.loadLyrics(true)}
					class="mt-4 flex cursor-pointer items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/15 px-4 py-1.5 text-xs font-semibold text-amber-200 transition-all hover:scale-105 hover:bg-amber-500/25 hover:border-amber-400/70 active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
				>
					<HugeiconsIcon icon={SparklesIcon} size={13} class="text-amber-300" />
					<span>Search Again</span>
				</button>
			</div>
		{/if}
	</div>

	<!-- Floating Sync Pill when user has manually scrolled away from singing verse -->
	{#if userScrolled && lyrics?.synced && activeIndex >= 0}
		<div class="pointer-events-none absolute bottom-14 left-0 right-0 z-30 flex justify-center">
			<button
				onclick={syncToActive}
				class="pointer-events-auto flex items-center gap-2 rounded-full bg-primary/95 px-5 py-2.5 text-xs font-extrabold text-primary-foreground shadow-2xl shadow-primary/50 backdrop-blur-xl transition-all active:scale-95 animate-bounce hover:bg-primary"
				transition:scale={{ duration: 180 }}
			>
				<HugeiconsIcon icon={Mic01Icon} size={14} />
				<span>Sync to Verse</span>
			</button>
		</div>
	{/if}
</div>
