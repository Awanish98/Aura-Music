<script module lang="ts">
	// Survives remounts (module scope), so coming back to /search — from a result you clicked, or
	// from the sidebar — shows the last search instead of a blank page. The results themselves come
	// back from the page cache, so the rerun paints instantly and just revalidates.
	let lastQuery = '';
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { fade, scale } from 'svelte/transition';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		Search01Icon,
		SparklesIcon,
		PlayIcon,
		MusicNote01Icon,
		FavouriteIcon,
		Mic01Icon,
		FireIcon,
		Clock01Icon,
		UserIcon,
		Cancel01Icon
	} from '@hugeicons/core-free-icons';
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import MediaCardSkeleton from '$lib/components/MediaCardSkeleton.svelte';
	import SearchSuggest from '$lib/components/SearchSuggest.svelte';
	import TrackRow from '$lib/components/TrackRow.svelte';
	import TrackSelectionBar from '$lib/components/TrackSelectionBar.svelte';
	import TrackSelectButton from '$lib/components/TrackSelectButton.svelte';
	import { trackSelection } from '$lib/selection.svelte';
	import TrackRowSkeleton from '$lib/components/TrackRowSkeleton.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import Shelf from '$lib/components/Shelf.svelte';
	import * as api from '$lib/api';
	import type { SearchResults, SongItem, BrowseItem } from '$lib/api';
	import { getCached, putCached } from '$lib/pagecache';
	import { auth, openAddToPlaylist, playSong, ui } from '$lib/player.svelte';
	import { asSong } from '$lib/browse';
	import { thumb, generateAvatarSvg } from '$lib/thumb';
	import { t } from '$lib/i18n.svelte';
	import {
		TRENDING_SEARCHES,
		AI_MOOD_TAGS,
		getRecentSearches,
		getPersonalizedAiSuggestions,
		saveRecentSearch,
		removeRecentSearch,
		clearRecentSearches,
		type SmartSuggestion
	} from '$lib/searchAi';

	type Cached = { res: SearchResults; songs: SongItem[] };
	type SearchTab = 'all' | 'songs' | 'versions' | 'albums' | 'artists' | 'playlists';

	let query = $state(lastQuery);
	let res = $state<SearchResults | null>(null);
	let recentSearches = $state<string[]>([]);
	let personalAi = $state<SmartSuggestion[]>([]);
	let songs = $state<SongItem[]>([]);
	let searched = $state('');
	let searching = $state(false);
	let error = $state<string | null>(null);
	let activeTab = $state<SearchTab>('all');
	let showAllSongs = $state(false);

	// The query of the most recent runSearch call, so an older in-flight one can't clobber it.
	let latest = '';

	function refreshDiscovery() {
		recentSearches = getRecentSearches();
		personalAi = getPersonalizedAiSuggestions();
	}

	function triggerSearch(q: string) {
		query = q;
		saveRecentSearch(q);
		refreshDiscovery();
		runSearch();
	}

	function handleRemoveRecent(q: string, e: MouseEvent) {
		e.stopPropagation();
		removeRecentSearch(q);
		recentSearches = getRecentSearches();
	}

	function handleClearAllRecents(e: MouseEvent) {
		e.stopPropagation();
		clearRecentSearches();
		recentSearches = [];
	}

	async function runSearch() {
		if (!query.trim()) return;
		const q = query.trim();
		latest = q;
		lastQuery = q;
		saveRecentSearch(q);
		refreshDiscovery();
		const key = `search:${q}`;
		const hit = getCached<Cached>(key);
		if (hit) {
			res = hit.res;
			songs = hit.songs;
			searched = q;
			searching = false;
		} else {
			searching = true;
		}
		error = null;
		try {
			const [fresh, freshSongs] = await Promise.all([
				api.searchAll(q, true),
				api.search(q, true).catch(() => [] as SongItem[])
			]);
			if (latest !== q) return; // a newer search superseded this one
			res = fresh;
			songs = freshSongs;
			searched = q;
			putCached(key, { res: fresh, songs: freshSongs });
		} catch (e) {
			if (latest !== q) return;
			if (!hit) error = String(e);
		} finally {
			if (latest === q) searching = false;
		}
	}

	function showMore(cat: 'songs' | 'albums' | 'artists' | 'playlists') {
		goto(`/search-more?${new URLSearchParams({ q: searched, cat }).toString()}`);
	}

	const urlQuery = $derived(page.url.searchParams.get('q') ?? '');
	let lastUrlQuery = '';
	$effect(() => {
		if (urlQuery && urlQuery !== lastUrlQuery) {
			lastUrlQuery = urlQuery;
			query = urlQuery;
			runSearch();
		}
	});

	onMount(() => {
		refreshDiscovery();
		if (!urlQuery && query) runSearch();
	});

	// Deduplicated list of song rows from both JioSaavn Lossless + YouTube Music
	const songRows = $derived.by(() => {
		const combined: SongItem[] = [];
		const seen = new Set<string>();

		// 1. Prioritize direct lossless songs
		for (const s of songs) {
			if (!seen.has(s.video_id)) {
				seen.add(s.video_id);
				combined.push(s);
			}
		}

		// 2. Add parsed YouTube search results
		if (res?.songs) {
			for (const item of res.songs) {
				if (!seen.has(item.id)) {
					seen.add(item.id);
					combined.push(asSong(item));
				}
			}
		}

		return combined;
	});

	// Extracted versions (Acoustic, Lofi, Remix, Live, Cover)
	const versionRows = $derived.by(() => {
		if (res?.versions && res.versions.length > 0) {
			return res.versions.map(asSong);
		}
		const VERSION_KEYWORDS = [
			'remix', 'acoustic', 'unplugged', 'lofi', 'lo-fi', 'slowed', 'reverb',
			'live', 'cover', 'mashup', 'female', 'male', 'duet', 'reprise',
			'instrumental', 'orchestral', '8d', 'club mix', 'edm'
		];
		return songRows.filter((s) => {
			const str = `${s.title} ${s.artists} ${s.album || ''}`.toLowerCase();
			return VERSION_KEYWORDS.some((kw) => str.includes(kw));
		});
	});

	// Displayed songs based on active tab and expansion state
	const visibleSongRows = $derived.by(() => {
		if (activeTab === 'versions') return versionRows;
		if (showAllSongs || activeTab === 'songs') return songRows;
		return songRows.slice(0, 10);
	});

	const selection = trackSelection(
		() => visibleSongRows,
		() => visibleSongRows,
		() => `${auth.epoch}:${searched}:${activeTab}:${showAllSongs}`
	);

	// Hero top result item
	const topResult = $derived<BrowseItem | null>(
		res?.top?.[0] ||
			(songRows[0]
				? {
						kind: 'song',
						id: songRows[0].video_id,
						title: songRows[0].title,
						subtitle: songRows[0].artists,
						thumbnail: songRows[0].thumbnail,
						duration: songRows[0].duration,
						artistRuns: songRows[0].artist_runs
					}
				: null)
	);

	const tabs: { id: SearchTab; label: string; count?: number }[] = $derived([
		{ id: 'all', label: 'All Results' },
		{ id: 'songs', label: 'Songs', count: songRows.length },
		{ id: 'versions', label: 'Versions & Remixes', count: versionRows.length },
		{ id: 'albums', label: 'Albums', count: res?.albums?.length },
		{ id: 'artists', label: 'Artists', count: res?.artists?.length },
		{ id: 'playlists', label: 'Playlists', count: res?.playlists?.length }
	]);
</script>

<div class="flex h-full flex-col">
	<!-- Sticky Search & Shazam Header -->
	<div class="sticky top-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur-2xl p-4 sm:p-6">
		<div class="flex items-center justify-between gap-3 mb-3">
			<h1 class="font-heading text-xl sm:text-2xl font-bold tracking-tight">
				{t('common.search')}
			</h1>

			<!-- Aura Shazam Audio Identifier Button -->
			<button
				type="button"
				onclick={() => (ui.shazamOpen = true)}
				class="group flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold text-primary bg-primary/10 border border-primary/25 hover:bg-primary/20 transition-all active:scale-95 shadow-sm"
				title="Identify playing song or humming (Shazam)"
			>
				<HugeiconsIcon icon={SparklesIcon} size={15} class="text-primary animate-pulse" />
				<span class="hidden sm:inline">Song Identifier (Shazam)</span>
				<span class="sm:hidden">Shazam</span>
			</button>
		</div>

		<!-- Search Bar with Instant Mic Trigger -->
		<form
			class="flex max-w-2xl items-center gap-2"
			onsubmit={(e) => {
				e.preventDefault();
				runSearch();
			}}
		>
			<div class="relative flex-1">
				<SearchSuggest
					bind:value={query}
					placeholder="Search songs, multiple versions, artists, albums, lyrics..."
					onpick={() => {
						lastQuery = query;
						runSearch();
					}}
				/>
			</div>

			<!-- Mic / Shazam Quick Trigger -->
			<Button
				type="button"
				variant="outline"
				size="icon"
				class="h-10 w-10 shrink-0 rounded-xl border-border/40 bg-card/60 hover:bg-card hover:text-primary active:scale-95 cursor-pointer"
				onclick={() => (ui.shazamOpen = true)}
				title="Identify Song / Voice Search"
			>
				<HugeiconsIcon icon={Mic01Icon} size={18} />
			</Button>

			<!-- Search Submit Button -->
			<Button type="submit" class="gap-2 shrink-0 rounded-xl px-4 h-10 cursor-pointer" disabled={searching}>
				<HugeiconsIcon icon={Search01Icon} class="h-4 w-4" />
				<span class="hidden sm:inline">{searching ? t('common.searching') : t('common.search')}</span>
			</Button>
		</form>

		<!-- Category Filter Pills -->
		{#if res && !searching}
			<div class="mt-4 flex flex-wrap items-center gap-2" in:fade>
				{#each tabs as tab}
					{#if tab.id === 'all' || (tab.count !== undefined && tab.count > 0)}
						<button
							type="button"
							onclick={() => {
								activeTab = tab.id;
								showAllSongs = tab.id === 'songs';
							}}
							class="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer {activeTab ===
							tab.id
								? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]'
								: 'liquid-glass-fx text-muted-foreground hover:text-foreground'}"
						>
							<span>{tab.label}</span>
							{#if tab.count !== undefined && tab.count > 0}
								<span class="rounded-full bg-black/20 px-1.5 py-0.2 text-[10px] opacity-85">
									{tab.count}
								</span>
							{/if}
						</button>
					{/if}
				{/each}
			</div>
		{/if}

		{#if error}<div class="mt-2"><ErrorState message={error} onRetry={runSearch} /></div>{/if}
	</div>

	<!-- Main Results Container -->
	<div class="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
		{#if searching}
			<div class="flex flex-col gap-10">
				<!-- Top Result Skeleton -->
				<section>
					<Skeleton class="mb-3 h-6 w-40 rounded" />
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div class="h-44 rounded-2xl bg-muted/40 animate-pulse"></div>
						<div class="md:col-span-2 flex flex-col gap-2">
							{#each Array(4) as _, i (i)}
								<TrackRowSkeleton />
							{/each}
						</div>
					</div>
				</section>
				<section>
					<Skeleton class="mb-3 h-6 w-32 rounded" />
					<div class="flex gap-2 overflow-hidden pb-2">
						{#each Array(5) as _, i (i)}
							<div class="w-40 shrink-0"><MediaCardSkeleton /></div>
						{/each}
					</div>
				</section>
			</div>
		{:else if !res}
			<!-- Rich AI-Powered Suggestions & Discovery Grid (Mobile & Desktop) -->
			<div class="flex flex-col gap-8 max-w-6xl pb-12" in:fade>
				<!-- Personalized "Mere Anusar AI" Suggestions -->
				{#if personalAi.length > 0}
					<section>
						<div class="flex items-center justify-between mb-3">
							<h2 class="font-heading text-lg font-bold flex items-center gap-2 text-foreground">
								<HugeiconsIcon icon={SparklesIcon} size={18} class="text-primary animate-pulse" />
								<span>Recommended For You (AI Personalised)</span>
							</h2>
							<span class="text-xs text-muted-foreground font-medium">Based on your taste & history</span>
						</div>
						<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
							{#each personalAi as p}
								<button
									type="button"
									onclick={() => triggerSearch(p.query)}
									class="flex items-center justify-between p-3.5 rounded-2xl bg-card/60 hover:bg-card border border-border/40 hover:border-primary/50 transition-all text-left group cursor-pointer active:scale-98 shadow-md apple-spring-hover"
								>
									<div class="flex items-center gap-3 min-w-0">
										<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary group-hover:scale-105 transition-transform">
											<HugeiconsIcon icon={SparklesIcon} size={18} />
										</div>
										<div class="min-w-0 flex-1">
											<div class="font-semibold text-sm truncate text-foreground group-hover:text-primary transition-colors">
												{p.title}
											</div>
											<div class="text-xs text-muted-foreground truncate mt-0.5 font-medium">
												{p.subtitle}
											</div>
										</div>
									</div>
									<span class="rounded-full bg-primary/10 border border-primary/25 px-2 py-0.5 text-[10px] font-bold text-primary shrink-0 ml-2">
										{p.badge || 'AI Vibe'}
									</span>
								</button>
							{/each}
						</div>
					</section>
				{/if}

				<!-- Recent Searches -->
				{#if recentSearches.length > 0}
					<section>
						<div class="flex items-center justify-between mb-3">
							<h2 class="font-heading text-lg font-bold flex items-center gap-2 text-foreground">
								<HugeiconsIcon icon={Clock01Icon} size={18} class="text-muted-foreground" />
								<span>Recent Searches</span>
							</h2>
							<button
								type="button"
								onclick={handleClearAllRecents}
								class="text-xs font-semibold text-muted-foreground hover:text-rose-400 transition-colors cursor-pointer"
							>
								Clear All
							</button>
						</div>
						<div class="flex flex-wrap gap-2">
							{#each recentSearches as r}
								<div
									class="group flex items-center gap-2 rounded-full bg-muted/50 hover:bg-muted border border-border/40 px-3.5 py-1.5 text-xs font-medium text-foreground transition-all cursor-pointer active:scale-95"
								>
									<button
										type="button"
										onclick={() => triggerSearch(r)}
										class="flex items-center gap-1.5 truncate text-left cursor-pointer"
									>
										<HugeiconsIcon icon={Clock01Icon} size={13} class="text-muted-foreground" />
										<span class="truncate">{r}</span>
									</button>
									<button
										type="button"
										onclick={(e) => handleRemoveRecent(r, e)}
										class="opacity-60 hover:opacity-100 p-0.5 hover:text-rose-400 transition-colors cursor-pointer"
										title="Remove"
									>
										<HugeiconsIcon icon={Cancel01Icon} size={12} />
									</button>
								</div>
							{/each}
						</div>
					</section>
				{/if}

				<!-- AI Moods & Vibes -->
				<section>
					<div class="flex items-center justify-between mb-3">
						<h2 class="font-heading text-lg font-bold flex items-center gap-2 text-foreground">
							<span>Explore Moods & Genres</span>
						</h2>
					</div>
					<div class="flex flex-wrap gap-2">
						{#each AI_MOOD_TAGS as tag}
							<button
								type="button"
								onclick={() => triggerSearch(tag.query)}
								class="rounded-full liquid-glass-fx hover:border-primary/50 px-3.5 py-1.5 text-xs font-semibold text-foreground hover:text-primary transition-all active:scale-95 shadow-sm cursor-pointer"
							>
								{tag.label}
							</button>
						{/each}
					</div>
				</section>

				<!-- Trending Indian & Global Hits -->
				<section>
					<div class="flex items-center justify-between mb-3">
						<h2 class="font-heading text-lg font-bold flex items-center gap-2 text-foreground">
							<HugeiconsIcon icon={FireIcon} size={18} class="text-amber-400" />
							<span>Trending Hits & Superhits</span>
						</h2>
					</div>
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
						{#each TRENDING_SEARCHES as t}
							<button
								type="button"
								onclick={() => triggerSearch(t.query)}
								class="flex items-center justify-between p-3.5 rounded-2xl bg-card/60 hover:bg-card border border-white/10 hover:border-amber-400/40 transition-all text-left group cursor-pointer active:scale-98 shadow-md"
							>
								<div class="flex items-center gap-3 min-w-0">
									<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 group-hover:scale-105 transition-transform">
										<HugeiconsIcon icon={FireIcon} size={16} />
									</div>
									<div class="min-w-0 flex-1">
										<div class="font-semibold text-sm truncate text-foreground group-hover:text-amber-300 transition-colors">
											{t.label}
										</div>
										<div class="text-xs text-muted-foreground truncate mt-0.5">
											{t.category}
										</div>
									</div>
								</div>
								<HugeiconsIcon icon={PlayIcon} size={15} class="text-muted-foreground group-hover:text-primary shrink-0 ml-2" />
							</button>
						{/each}
					</div>
				</section>
			</div>
		{:else if !songRows.length && !res.albums?.length && !res.artists?.length && !res.playlists?.length}
			<div class="py-12 text-center text-sm text-muted-foreground">
				{t('common.no_results', { query: searched })}
			</div>
		{:else}
			<div class="content-in flex flex-col gap-8">
				<!-- Hero Top Result Card + Quick Songs Block (When in 'all' tab) -->
				{#if activeTab === 'all' && topResult}
					<section class="grid grid-cols-1 lg:grid-cols-12 gap-6">
						<!-- Top Result Hero Box (Left 5 Cols) -->
						<div class="lg:col-span-5">
							<h2 class="mb-3 font-heading text-lg font-bold">Top Result</h2>
							<div
								role="button"
								tabindex="0"
								onclick={() => {
									if (topResult.kind === 'song') {
										playSong(asSong(topResult));
									} else {
										goto(`/${topResult.kind}/${encodeURIComponent(topResult.id)}`);
									}
								}}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										if (topResult.kind === 'song') {
											playSong(asSong(topResult));
										} else {
											goto(`/${topResult.kind}/${encodeURIComponent(topResult.id)}`);
										}
									}
								}}
								class="group relative flex flex-col justify-between overflow-hidden rounded-3xl apple-glass-card p-6 cursor-pointer shadow-xl transition-all duration-300"
							>
								<!-- Ambient Artwork Glow -->
								<div class="flex items-start gap-4">
									<div class="relative size-24 sm:size-28 shrink-0 overflow-hidden rounded-2xl shadow-lg ring-1 ring-white/15">
										{#if topResult.thumbnail}
											<img
												src={thumb(topResult.thumbnail, 400)}
												alt={topResult.title}
												class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
											/>
										{:else}
											<img
												src={generateAvatarSvg(topResult.title, topResult.kind)}
												alt={topResult.title}
												class="h-full w-full object-cover"
											/>
										{/if}
									</div>

									<div class="min-w-0 flex-1">
										<span class="inline-block text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
											{topResult.kind === 'song' ? '320kbps Lossless' : topResult.kind}
										</span>
										<h3 class="truncate font-heading text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
											{topResult.title}
										</h3>
										<p class="truncate text-sm text-muted-foreground mt-0.5">
											{topResult.subtitle || 'Artist'}
										</p>
										{#if topResult.duration}
											<span class="text-xs text-muted-foreground/80 mt-1 block">
												{topResult.duration}
											</span>
										{/if}
									</div>
								</div>

								<!-- Floating Quick Play Button -->
								<div class="mt-6 flex items-center justify-between">
									<div class="flex items-center gap-2">
										<span class="rounded-full bg-primary/15 border border-primary/25 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
											Best Match
										</span>
									</div>
									<div
										class="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 group-hover:scale-110 active:scale-95 transition-transform"
									>
										<HugeiconsIcon icon={PlayIcon} size={20} fill="currentColor" class="ml-0.5" />
									</div>
								</div>
							</div>
						</div>

						<!-- Parallel Songs Preview (Right 7 Cols) -->
						<div class="lg:col-span-7">
							<div class="mb-3 flex items-center justify-between">
								<h2 class="font-heading text-lg font-bold">Songs ({songRows.length})</h2>
								<TrackSelectButton {selection} />
							</div>
							<TrackSelectionBar {selection} />
							<div class="flex flex-col divide-y divide-border/20">
								{#each songRows.slice(0, 5) as song, i (JSON.stringify([song.video_id, i]))}
									<TrackRow
										{song}
										{selection}
										selectionKey={selection.visibleKeys[i]}
										showPlayCount
										onplay={() => playSong(song)}
										onAdd={() => openAddToPlaylist(song)}
									/>
								{/each}
							</div>
						</div>
					</section>
				{/if}

				<!-- Dedicated "Alternative Versions, Lofi & Remixes" Shelf -->
				{#if (activeTab === 'all' || activeTab === 'versions') && versionRows.length > 0}
					<section>
						<div class="mb-3 flex items-center justify-between">
							<div>
								<h2 class="font-heading text-xl font-bold flex items-center gap-2">
									<span>Different Versions & Remixes</span>
									<span class="rounded-full bg-primary/20 text-primary px-2 py-0.5 text-xs font-semibold">
										{versionRows.length} options
									</span>
								</h2>
								<p class="text-xs text-muted-foreground">Acoustic, Lofi, Live, Remixes & Covers</p>
							</div>
						</div>

						<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
							{#each versionRows.slice(0, 8) as vSong}
								<div
									role="button"
									tabindex="0"
									onclick={() => playSong(vSong)}
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											playSong(vSong);
										}
									}}
									class="flex items-center gap-3 rounded-2xl apple-glass-card p-3 cursor-pointer group hover:border-primary/40 transition-all"
								>
									<img
										src={thumb(vSong.thumbnail, 120)}
										alt={vSong.title}
										class="size-14 rounded-xl object-cover shrink-0 shadow-sm"
									/>
									<div class="min-w-0 flex-1">
										<h4 class="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
											{vSong.title}
										</h4>
										<p class="truncate text-xs text-muted-foreground">
											{vSong.artists}
										</p>
										<span class="text-[10px] font-bold text-primary">
											{vSong.duration || '3:00'}
										</span>
									</div>
									<button
										class="flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 active:scale-95"
										aria-label="Play version"
										onclick={(e) => {
											e.stopPropagation();
											playSong(vSong);
										}}
									>
										<HugeiconsIcon icon={PlayIcon} size={16} fill="currentColor" class="ml-0.5" />
									</button>
								</div>
							{/each}
						</div>
					</section>
				{/if}

				<!-- Full Songs List (When in 'songs' or 'all' tab) -->
				{#if activeTab === 'all' || activeTab === 'songs'}
					<section>
						<div class="mb-3 flex items-center justify-between">
							<h2 class="font-heading text-xl font-bold">
								All Matching Songs ({songRows.length})
							</h2>
							<div class="flex items-center gap-2">
								<TrackSelectButton {selection} />
								{#if songRows.length > 10 && activeTab === 'all'}
									<button
										type="button"
										class="cursor-pointer text-xs font-semibold uppercase text-primary hover:underline"
										onclick={() => (showAllSongs = !showAllSongs)}
									>
										{showAllSongs ? 'Show Less' : `Show All (${songRows.length})`}
									</button>
								{/if}
							</div>
						</div>

						<TrackSelectionBar {selection} />
						<div class="flex flex-col divide-y divide-border/20">
							{#each visibleSongRows as song, i (JSON.stringify([song.video_id, i]))}
								<TrackRow
									{song}
									{selection}
									selectionKey={selection.visibleKeys[i]}
									showPlayCount
									onplay={() => playSong(song)}
									onAdd={() => openAddToPlaylist(song)}
								/>
							{/each}
						</div>
					</section>
				{/if}

				<!-- Albums Shelf -->
				{#if (activeTab === 'all' || activeTab === 'albums') && res.albums && res.albums.length > 0}
					<section>
						<div class="mb-3 flex items-center justify-between">
							<h2 class="font-heading text-xl font-bold">{t('common.albums')}</h2>
							<button
								class="cursor-pointer text-xs font-semibold uppercase text-muted-foreground hover:text-foreground"
								onclick={() => showMore('albums')}
							>
								{t('common.show_more')}
							</button>
						</div>
						<Shelf items={res.albums} />
					</section>
				{/if}

				<!-- Artists Shelf -->
				{#if (activeTab === 'all' || activeTab === 'artists') && res.artists && res.artists.length > 0}
					<section>
						<div class="mb-3 flex items-center justify-between">
							<h2 class="font-heading text-xl font-bold">{t('common.artists')}</h2>
							<button
								class="cursor-pointer text-xs font-semibold uppercase text-muted-foreground hover:text-foreground"
								onclick={() => showMore('artists')}
							>
								{t('common.show_more')}
							</button>
						</div>
						<Shelf items={res.artists} />
					</section>
				{/if}

				<!-- Playlists Shelf -->
				{#if (activeTab === 'all' || activeTab === 'playlists') && res.playlists && res.playlists.length > 0}
					<section>
						<div class="mb-3 flex items-center justify-between">
							<h2 class="font-heading text-xl font-bold">{t('common.playlists')}</h2>
							<button
								class="cursor-pointer text-xs font-semibold uppercase text-muted-foreground hover:text-foreground"
								onclick={() => showMore('playlists')}
							>
								{t('common.show_more')}
							</button>
						</div>
						<Shelf items={res.playlists} />
					</section>
				{/if}
			</div>
		{/if}
	</div>
</div>
