<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { ArrowUpBigIcon, MusicNote01Icon } from '@hugeicons/core-free-icons';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Button } from '$lib/components/ui/button';
	import MediaCardSkeleton from '$lib/components/MediaCardSkeleton.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import HomeHero from '$lib/components/HomeHero.svelte';
	import Shortcuts from '$lib/components/Shortcuts.svelte';
	import AiVibeGenerator from '$lib/components/AiVibeGenerator.svelte';
	import FeaturedForYou from '$lib/components/FeaturedForYou.svelte';
	import RecentRail from '$lib/components/RecentRail.svelte';
	import Shelf from '$lib/components/Shelf.svelte';
	import ForgottenFavourites from '$lib/components/ForgottenFavourites.svelte';
	import FamiliarArtists from '$lib/components/FamiliarArtists.svelte';
	import HomeLayoutDialog from '$lib/components/HomeLayoutDialog.svelte';
	import TrackRowSkeleton from '$lib/components/TrackRowSkeleton.svelte';
	import FeaturedArtistsRail from '$lib/components/FeaturedArtistsRail.svelte';
	import LiveRadiosShelf from '$lib/components/LiveRadiosShelf.svelte';
	import MoodsGrid from '$lib/components/MoodsGrid.svelte';
	import HomeRightRail from '$lib/components/HomeRightRail.svelte';
	import { getFmhyHomeSections } from '$lib/fmhy';
	import * as api from '$lib/api';
	import type { BrowseItem, HomeChip, HomePage, HomeSection } from '$lib/api';
	import {
		auth,
		library,
		noteHomeSections,
		personal,
		playback,
		seedOnRepeatPick,
		toast
	} from '$lib/player.svelte';
	import { t } from '$lib/i18n.svelte';
	import {
		arrangeSections,
		freshen,
		hiddenSections,
		interleave,
		recentItems,
		topArtists
	} from '$lib/personal';
	import { getCached, putCached } from '$lib/pagecache';

	const FORGOTTEN_KEY = 'home:forgotten';

	let home = $state<HomePage | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let chips = $state<HomeChip[]>([]);
	let selected = $state<string | null>(null);
	let loadingMore = $state(false);
	let moreError = $state(false);

	const fmhySections = $derived(getFmhyHomeSections());

	const pinned = $derived(new Set(personal.picks.map((p) => p.id)));
	const recent = $derived(
		recentItems(personal, 100)
			.filter((r) => !pinned.has(r.id))
			.slice(0, 9)
			.map((r) => freshen(r, library.items))
	);

	const isForgotten = (s: HomeSection) =>
		/forgotten/i.test(s.title) && s.items.some((i) => i.kind === 'song');
	let forgotten = $state<HomeSection | null>(null);
	let seeking = $state(false);
	const feed = $derived(home?.sections.filter((s) => !isForgotten(s)) ?? []);

	const RECENT = '@recent';
	const FAMILIAR = '@familiar';
	const FORGOTTEN = '@forgotten';

	type Block =
		| { id: string; key: string; title: string; shelf?: undefined }
		| { id: string; key: string; title: string; shelf: HomeSection };
	let editing = $state(false);
	const hidden = $derived(hiddenSections(personal));

	const blocks = $derived.by(() => {
		const local: Block[] = selected
			? []
			: [
					{ id: RECENT, key: RECENT, title: t('home.jump_back_in') },
					{ id: FAMILIAR, key: FAMILIAR, title: t('home.familiar_artists') },
					{ id: FORGOTTEN, key: FORGOTTEN, title: t('home.forgotten_favourites') }
				];
		const shelves = feed.map((s, i) => ({
			id: `${i}:${s.title}`,
			key: s.title,
			title: s.title,
			shelf: s
		}));
		return arrangeSections([...local, ...shelves], personal);
	});
	const visible = $derived(blocks.filter((b) => !hidden.has(b.key)));

	const known = $derived.by(() => {
		if (selected) return blocks;
		const have = new Set(blocks.map((b) => b.key));
		const unloaded: Block[] = personal.home.seen
			.filter((t) => !have.has(t))
			.map((t) => ({ id: `seen:${t}`, key: t, title: t }));
		return unloaded.length ? arrangeSections([...blocks, ...unloaded], personal) : blocks;
	});

	$effect(() => {
		if (selected) return;
		const titles = feed.map((s) => s.title);
		if (titles.length) noteHomeSections(titles);
	});

	function noteForgotten() {
		const found = home?.sections.find(isForgotten);
		if (found) {
			forgotten = found;
			putCached(FORGOTTEN_KEY, found);
		}
		return !!found;
	}

	const wantForgotten = () => !forgotten && !hidden.has(FORGOTTEN);

	function missingRanked() {
		const order = personal.home.order;
		if (!order.length) return false;
		const rank = new Map(order.map((k, i) => [k, i]));
		const here = new Set([RECENT, FAMILIAR, FORGOTTEN, ...feed.map((s) => s.title)]);
		let deepest = -1;
		for (const [k, r] of rank) if (here.has(k) && r > deepest) deepest = r;
		for (const [k, r] of rank) if (r < deepest && !here.has(k) && !hidden.has(k)) return true;
		return false;
	}

	async function seekForgotten(params: string | null) {
		if (params) return;
		seeking = true;
		try {
			for (let i = 0; i < 6; i++) {
				if (moreError || loadingMore) return;
				if (!wantForgotten() && !missingRanked()) return;
				if (selected !== params || !home?.continuation) return;
				await loadMore();
			}
		} finally {
			seeking = false;
		}
	}

	function showMore(section: { title: string; moreBrowseId?: string; moreParams?: string }) {
		const q = new URLSearchParams({ id: section.moreBrowseId!, title: section.title });
		if (section.moreParams) q.set('params', section.moreParams);
		goto(`/list?${q.toString()}`);
	}

	async function load(params: string | null = selected) {
		selected = params;
		const key = params ? `home:${params}` : 'home';
		const hit = getCached<HomePage>(key);
		forgotten = params ? null : getCached<HomeSection>(FORGOTTEN_KEY);
		if (hit) {
			home = hit;
			loading = false;
			noteForgotten();
			cater(hit, params);
		} else {
			loading = true;
		}
		error = null;
		try {
			const fresh = await api.getHome(params ?? undefined);
			if (selected !== params) return;
			home = fresh;
			putCached(key, fresh);
			noteForgotten();
			cater(fresh, params);
			seekForgotten(params);
		} catch (e) {
			if (!hit) error = String(e);
		} finally {
			loading = false;
		}
	}

	async function loadMore() {
		const token = home?.continuation;
		if (!token || loadingMore) return;
		loadingMore = true;
		moreError = false;
		const params = selected;
		try {
			const more = await api.getHomeMore(token);
			if (selected !== params || home?.continuation !== token) return;
			home = {
				...home!,
				sections: [...home!.sections, ...more.sections],
				continuation: more.sections.length ? more.continuation : undefined
			};
			noteForgotten();
		} catch (e) {
			moreError = true;
			toast.error(t('toasts.could_not_load_more'));
		} finally {
			loadingMore = false;
		}
	}

	let scroller = $state<HTMLElement | null>(null);
	let scrolled = $state(false);
	function watchScroll(node: HTMLElement) {
		const el = node.closest('main');
		if (!el) return;
		scroller = el;
		const onScroll = () => (scrolled = el.scrollTop > 400);
		el.addEventListener('scroll', onScroll, { passive: true });
		return () => el.removeEventListener('scroll', onScroll);
	}

	function sentinel(node: HTMLElement) {
		const io = new IntersectionObserver(([e]) => e.isIntersecting && loadMore(), {
			rootMargin: '400px 0px'
		});
		io.observe(node);
		return () => io.disconnect();
	}

	async function cater(page: HomePage, params: string | null) {
		if (params) return;
		if (!page.sections.some((s) => /community/i.test(s.title))) return;
		const artists = topArtists(personal, 3);
		if (!artists.length) return;
		const key = `community:${artists.join('|')}`;
		let items = getCached<BrowseItem[]>(key);
		if (!items) {
			const lists = await Promise.all(
				artists.map((a) => api.searchCards(a, 'playlists').catch(() => [] as BrowseItem[]))
			);
			items = interleave(lists, 20);
			if (!items.length) return;
			putCached(key, items);
		}
		if (selected !== params) return;
		const idx = home?.sections.findIndex((s) => /community/i.test(s.title)) ?? -1;
		if (idx < 0) return;
		home = { ...home!, sections: home!.sections.map((s, i) => (i === idx ? { ...s, items } : s)) };
	}

	$effect(() => {
		if (home?.chips?.length) chips = home.chips.filter((c) => c.title !== 'Podcasts');
	});

	onMount(() => load(null));

	$effect(() => {
		playback.now?.videoId;
		seedOnRepeatPick();
	});
</script>

<div {@attach watchScroll} class="p-4 sm:p-6 pb-12">
	<h1 class="sr-only">Aura Music — Free High-Fidelity Music Streaming</h1>

	<!-- Main Multi-Column Layout for Desktop (Hero + Left Column Feed & Right Widget Rail) -->
	<div class="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
		<!-- Main Center / Left Content Stream (Span 12 on mobile/tablet, Span 9 on xl+) -->
		<div class="xl:col-span-9 space-y-8 min-w-0">
			<!-- Home Hero Section with Greeting, Cosmic Headphones Banner & Mood Pills -->
			<HomeHero
				activeMood={selected}
				onSelectMood={(mood) => {
					if (!mood) {
						load(null);
					} else {
						const chip = chips.find((c) => c.title.toLowerCase().includes(mood));
						load(chip?.params ?? null);
					}
				}}
			/>

			{#if !selected}
				<!-- Shortcuts 4 Gradient Liquid Glass Cards -->
				<Shortcuts onEdit={() => (editing = true)} />

				<!-- Aura AI Vibe Station Card on Mobile/Tablet (< xl) -->
				<div class="xl:hidden">
					<AiVibeGenerator />
				</div>

				<!-- Featured For You Mix Cards (Matches Reference UI) -->
				<FeaturedForYou />

				<!-- Popular Artists & Vocalists (Top 20 with Neon Rings) -->
				<FeaturedArtistsRail />

				<!-- Categorized Moods & Genres Grid -->
				<MoodsGrid />

				<!-- 24/7 Live Internet Radios -->
				<LiveRadiosShelf />
			{/if}

			{#snippet shelfSkeletons(n: number)}
				{#each Array(n) as _, s (s)}
					<section aria-hidden="true" class="space-y-3">
						<Skeleton class="h-6 w-40 rounded" />
						<div class="flex gap-3 overflow-hidden pb-2">
							{#each Array(6) as _, i (i)}
								<div class="w-40 shrink-0"><MediaCardSkeleton /></div>
							{/each}
						</div>
					</section>
				{/each}
			{/snippet}

			<!-- Shelves & Dynamic Feeds -->
			<div class="content-in flex flex-col gap-10">
				{#each visible as block, i (block.id + ':' + i)}
					{#if block.shelf}
						<Shelf
							title={block.shelf.title}
							items={block.shelf.items}
							queueAll={false}
							community={/community/i.test(block.shelf.title)}
							onMore={block.shelf.moreBrowseId ? () => showMore(block.shelf!) : undefined}
						/>
					{:else if block.key === RECENT}
						{#if recent.length}<RecentRail items={recent} />{/if}
					{:else if block.key === FAMILIAR}
						<FamiliarArtists />
					{:else if forgotten}
						<ForgottenFavourites
							section={forgotten}
							onMore={forgotten.moreBrowseId ? () => showMore(forgotten!) : undefined}
						/>
					{:else if seeking}
						<div aria-hidden="true" class="space-y-3">
							<Skeleton class="h-6 w-48 rounded" />
							<div class="columns-1 gap-x-6 md:columns-2 xl:columns-3">
								{#each Array(15) as _, i (i)}
									<div class="break-inside-avoid"><TrackRowSkeleton /></div>
								{/each}
							</div>
						</div>
					{/if}
				{/each}

				{#if loading}
					{@render shelfSkeletons(3)}
				{:else if error}
					<ErrorState message={error} onRetry={() => load(selected)} />
				{:else if !home?.sections.length}
					<!-- FMHY Curated Shelves fallback when signed out or empty feed -->
					<div class="space-y-10">
						{#each fmhySections as sec}
							<Shelf title={sec.title} items={sec.items} queueAll={false} />
						{/each}
					</div>
					{#if !auth.account?.signedIn}
						<div class="flex flex-col items-center gap-3 py-10 text-center border-t border-white/10 mt-6">
							<HugeiconsIcon icon={MusicNote01Icon} class="h-8 w-8 text-muted-foreground/40" />
							<p class="max-w-sm text-sm text-muted-foreground">
								{t('home.signed_out_hint')}
							</p>
							<Button size="sm" onclick={() => api.loginWebview()}>{t('common.sign_in_google')}</Button>
						</div>
					{/if}
				{:else if home.continuation}
					{#if moreError}
						<div class="p-3 text-center">
							<Button variant="outline" size="sm" onclick={loadMore} disabled={loadingMore}>
								{loadingMore ? t('common.loading') : t('common.try_again')}
							</Button>
						</div>
					{:else}
						<div class="flex flex-col gap-10" aria-busy={loadingMore}>
							<div {@attach sentinel}></div>
							{#if loadingMore}{@render shelfSkeletons(2)}{/if}
						</div>
					{/if}
				{/if}
			</div>

			<!-- SEO & GEO: Why Choose Aura Music Section -->
			<section class="mt-12 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-gradient-to-br from-white/90 via-purple-50/40 to-white/95 dark:from-black/40 dark:via-purple-950/20 dark:to-black/50 p-6 sm:p-8 backdrop-blur-2xl shadow-sm dark:shadow-xl space-y-6">
				<div class="space-y-1.5 text-center sm:text-left">
					<h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
						Why Choose Aura Music?
					</h2>
					<p class="text-xs sm:text-sm text-slate-600 dark:text-muted-foreground max-w-2xl">
						Aura Music is engineered for audiophiles, daily listeners, and music creators who demand lossless sound quality, smart AI music discovery, and zero intrusive ads.
					</p>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<div class="rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-white/5 p-4 space-y-2 backdrop-blur-xl shadow-xs">
						<span class="text-2xl">🎧</span>
						<h3 class="text-sm font-bold text-slate-900 dark:text-white">Lossless 320kbps Audio</h3>
						<p class="text-xs text-slate-600 dark:text-muted-foreground leading-relaxed">
							Stream high-fidelity music with crystal clarity, hardware-accelerated sound decoding, and a 10-band equalizer.
						</p>
					</div>

					<div class="rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-white/5 p-4 space-y-2 backdrop-blur-xl shadow-xs">
						<span class="text-2xl">🎤</span>
						<h3 class="text-sm font-bold text-slate-900 dark:text-white">Real-Time Synced Lyrics</h3>
						<p class="text-xs text-slate-600 dark:text-muted-foreground leading-relaxed">
							Sing along with millisecond-synchronized karaoke lyrics, romanized translations, and full-screen visualizer mode.
						</p>
					</div>

					<div class="rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-white/5 p-4 space-y-2 backdrop-blur-xl shadow-xs">
						<span class="text-2xl">⚡</span>
						<h3 class="text-sm font-bold text-slate-900 dark:text-white">AI-Powered Curation</h3>
						<p class="text-xs text-slate-600 dark:text-muted-foreground leading-relaxed">
							Describe any mood or moment to Aura AI DJ to automatically generate customized vibe mixes and discover songs.
						</p>
					</div>

					<div class="rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-white/5 p-4 space-y-2 backdrop-blur-xl shadow-xs">
						<span class="text-2xl">🚀</span>
						<h3 class="text-sm font-bold text-slate-900 dark:text-white">100% Free & Open</h3>
						<p class="text-xs text-slate-600 dark:text-muted-foreground leading-relaxed">
							Enjoy uninterrupted music streaming without subscription paywalls, audio advertisements, or privacy trackers.
						</p>
					</div>
				</div>
			</section>

			<!-- SEO & GEO: Frequently Asked Questions -->
			<section class="mt-8 rounded-3xl border border-white/10 bg-black/40 p-6 sm:p-8 backdrop-blur-2xl shadow-xl space-y-5">
				<div class="space-y-1">
					<h2 class="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
						Frequently Asked Questions
					</h2>
					<p class="text-xs sm:text-sm text-muted-foreground">
						Everything you need to know about streaming music, syncing playlists, and using Aura Music.
					</p>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
					<div class="rounded-2xl border border-white/8 bg-white/[0.03] p-4 space-y-1.5">
						<h3 class="text-sm font-bold text-pink-300">What is Aura Music?</h3>
						<p class="text-xs text-muted-foreground leading-relaxed">
							Aura Music is a modern online music streaming and AI discovery platform offering 320kbps high-fidelity audio, synchronized lyrics, custom playlists, and live radio.
						</p>
					</div>

					<div class="rounded-2xl border border-white/8 bg-white/[0.03] p-4 space-y-1.5">
						<h3 class="text-sm font-bold text-pink-300">How does Aura Music work?</h3>
						<p class="text-xs text-muted-foreground leading-relaxed">
							Aura Music connects high-definition audio sources, YouTube Music metadata, and synchronized lyrics databases into a sleek, unified online player with hardware acceleration.
						</p>
					</div>

					<div class="rounded-2xl border border-white/8 bg-white/[0.03] p-4 space-y-1.5">
						<h3 class="text-sm font-bold text-pink-300">Does Aura Music support real-time lyrics?</h3>
						<p class="text-xs text-muted-foreground leading-relaxed">
							Yes! Every track with available lyrics includes real-time millisecond-synchronized karaoke playback powered by LRCLIB.
						</p>
					</div>

					<div class="rounded-2xl border border-white/8 bg-white/[0.03] p-4 space-y-1.5">
						<h3 class="text-sm font-bold text-pink-300">What is Aura AI DJ?</h3>
						<p class="text-xs text-muted-foreground leading-relaxed">
							Aura AI DJ is an intelligent curation system that generates tailored playlists based on natural language prompts such as "Monsoon acoustic Hindi" or "Cyberpunk workout phonk".
						</p>
					</div>

					<div class="rounded-2xl border border-white/8 bg-white/[0.03] p-4 space-y-1.5">
						<h3 class="text-sm font-bold text-pink-300">Can I sync YouTube playlists and Google Drive?</h3>
						<p class="text-xs text-muted-foreground leading-relaxed">
							Yes, you can easily connect your Google account to automatically import, sync, and stream your personal YouTube music playlists and Google Drive audio collections.
						</p>
					</div>

					<div class="rounded-2xl border border-white/8 bg-white/[0.03] p-4 space-y-1.5">
						<h3 class="text-sm font-bold text-pink-300">Is Aura Music free to stream?</h3>
						<p class="text-xs text-muted-foreground leading-relaxed">
							Yes, Aura Music is 100% free and open, providing unlimited high-fidelity music streaming with zero advertising banners.
						</p>
					</div>
				</div>
			</section>
		</div>

		<!-- Right Side Widget Rail (Visible on >= xl screens, matches Reference UI) -->
		<div class="hidden xl:block xl:col-span-3 sticky top-6">
			<HomeRightRail />
		</div>
	</div>

	<!-- Modern Footer -->
	<footer class="mt-16 border-t border-white/8 pt-8 pb-24 text-center md:pb-12">
		<div class="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
			<a href="/about" class="transition-colors hover:text-white">About Aura</a>
			<span class="text-white/20">•</span>
			<a href="/privacy" class="transition-colors hover:text-white">Privacy Policy</a>
			<span class="text-white/20">•</span>
			<a href="/terms" class="transition-colors hover:text-white">Terms of Service</a>
			<span class="text-white/20">•</span>
			<a href="/contact" class="transition-colors hover:text-white">Contact & Support</a>
			<span class="text-white/20">•</span>
			<a href="https://github.com/Awanish98/Aura-Music" target="_blank" rel="noopener noreferrer" class="transition-colors hover:text-white">GitHub</a>
		</div>
		<p class="mt-4 text-[11px] text-muted-foreground/60">
			© 2026 Aura Music. High-fidelity audio streaming, real-time lyrics & AI music discovery.
		</p>
	</footer>
</div>

{#if scrolled}
	<button
		transition:fade={{ duration: 150 }}
		onclick={() => scroller?.scrollTo({ top: 0, behavior: 'smooth' })}
		aria-label={t('a11y.back_to_top')}
		class="fixed right-6 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl transition-transform hover:scale-110 {playback.now
			? 'bottom-24'
			: 'bottom-6'}"
	>
		<HugeiconsIcon icon={ArrowUpBigIcon} class="h-5 w-5" />
	</button>
{/if}

<HomeLayoutDialog bind:open={editing} sections={known} />
