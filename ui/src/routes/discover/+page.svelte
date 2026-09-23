<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		PlayIcon,
		Search01Icon,
		MusicNote01Icon,
		Mic01Icon,
		VolumeHighIcon,
		InfinityIcon,
		FavouriteIcon,
		ShuffleIcon
	} from '@hugeicons/core-free-icons';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import {
		ALL_FMHY_ITEMS,
		FMHY_RADIO_STATIONS,
		FMHY_PODCASTS,
		FMHY_SOUNDSCAPES,
		FMHY_GAME_SOUNDTRACKS,
		FMHY_CHARTS,
		FMHY_DISCOVERY_TOOLS,
		convertFmhyToSongItem,
		type FmhyItem
	} from '$lib/fmhy';
	import { webPlayer } from '$lib/webplayer';
	import { playback, toast } from '$lib/player.svelte';
	import { t } from '$lib/i18n.svelte';

	let activeCategory = $state<'all' | 'radio' | 'podcast' | 'ambient' | 'soundtrack' | 'chart' | 'tool'>('all');
	let searchQuery = $state('');
	let selectedTag = $state<string | null>(null);

	// Use FavouriteIcon or Sparkles equivalent
	const SparklesIconFixed = FavouriteIcon;

	const categories = [
		{ id: 'all', label: 'All Items', icon: SparklesIconFixed },
		{ id: 'radio', label: '24/7 Live Radio', icon: VolumeHighIcon },
		{ id: 'podcast', label: 'Podcasts', icon: Mic01Icon },
		{ id: 'ambient', label: 'Ambient & Sleep', icon: InfinityIcon },
		{ id: 'soundtrack', label: 'Game Soundtracks', icon: MusicNote01Icon },
		{ id: 'chart', label: 'Top Charts', icon: FavouriteIcon },
		{ id: 'tool', label: 'Audio Tools', icon: Search01Icon }
	];

	// Extract unique tags
	const allTags = Array.from(
		new Set(ALL_FMHY_ITEMS.flatMap((item) => item.tags))
	).sort();

	const filteredItems = $derived.by(() => {
		return ALL_FMHY_ITEMS.filter((item) => {
			if (activeCategory !== 'all' && item.category !== activeCategory) {
				return false;
			}
			if (selectedTag && !item.tags.includes(selectedTag)) {
				return false;
			}
			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase().trim();
				const matchTitle = item.title.toLowerCase().includes(q);
				const matchSub = item.subtitle.toLowerCase().includes(q);
				const matchDesc = item.description?.toLowerCase().includes(q);
				const matchTag = item.tags.some((t) => t.toLowerCase().includes(q));
				if (!matchTitle && !matchSub && !matchDesc && !matchTag) return false;
			}
			return true;
		});
	});

	function playFmhyItem(item: FmhyItem) {
		if (item.category === 'tool' && item.link) {
			window.open(item.link, '_blank');
			return;
		}

		if (item.category === 'chart' && item.link) {
			window.location.href = `/playlist/${encodeURIComponent(item.link)}`;
			return;
		}

		const song = convertFmhyToSongItem(item);
		webPlayer.play(song);
		toast.success(`Playing ${item.title}`);
	}

	function queueFmhyItem(item: FmhyItem, e: MouseEvent) {
		e.stopPropagation();
		if (item.category === 'tool' || item.category === 'chart') return;
		const song = convertFmhyToSongItem(item);
		playback.queue.items = [...playback.queue.items, song];
		toast.success(t('toasts.added_to_queue_one'));
	}

	const isCurrentlyPlaying = (item: FmhyItem) => {
		if (!playback.now) return false;
		return (
			playback.now.videoId === item.id ||
			playback.now.videoId === item.videoId ||
			playback.now.title === item.title
		);
	};
</script>

<svelte:head>
	<title>Discover FMHY Audio • Echo Music</title>
</svelte:head>

<div class="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">
	<!-- Hero Banner -->
	<div
		class="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-background to-secondary/15 p-6 md:p-10 shadow-lg"
	>
		<div class="relative z-10 flex flex-col gap-3">
			<div class="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
				<HugeiconsIcon icon={SparklesIconFixed} class="h-3.5 w-3.5" />
				<span>Curated from FreeMediaHeckYeah</span>
			</div>
			<h1 class="font-heading text-3xl font-extrabold tracking-tight md:text-5xl">
				Discover Music, Radios & Podcasts
			</h1>
			<p class="max-w-2xl text-sm text-muted-foreground md:text-base">
				Stream 24/7 commercial-free live internet radio, top-tier tech and story podcasts, deep sleep soundscapes, retro video game soundtracks, and global charts.
			</p>
		</div>
		<div
			class="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
		></div>
	</div>

	<!-- Search & Filter Controls -->
	<div class="flex flex-col gap-4">
		<!-- Search Input -->
		<div class="relative w-full max-w-md">
			<HugeiconsIcon
				icon={Search01Icon}
				class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
			/>
			<Input
				type="search"
				placeholder="Search FMHY stations, podcasts, soundscapes..."
				bind:value={searchQuery}
				class="pl-10"
			/>
		</div>

		<!-- Category Tabs -->
		<div class="flex flex-wrap items-center gap-2">
			{#each categories as cat}
				<button
					type="button"
					onclick={() => {
						activeCategory = cat.id as any;
						selectedTag = null;
					}}
					class="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all {activeCategory ===
					cat.id
						? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]'
						: 'apple-glass-pill text-muted-foreground hover:text-foreground'}"
				>
					<HugeiconsIcon icon={cat.icon} class="h-4 w-4" />
					<span>{cat.label}</span>
				</button>
			{/each}
		</div>

		<!-- Tags Chips -->
		<div class="flex flex-wrap items-center gap-1.5 pt-1">
			<span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mr-1">
				Filter tags:
			</span>
			{#each allTags.slice(0, 16) as tag}
				<button
					type="button"
					onclick={() => {
						selectedTag = selectedTag === tag ? null : tag;
					}}
					class="rounded-md border px-2.5 py-1 text-xs font-medium transition-colors {selectedTag ===
					tag
						? 'border-primary bg-primary/20 text-primary'
						: 'border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/70 hover:text-foreground'}"
				>
					#{tag}
				</button>
			{/each}
		</div>
	</div>

	<!-- Results Grid -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each filteredItems as item (item.id)}
			<div
				tabindex="0"
				role="button"
				onclick={() => playFmhyItem(item)}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						playFmhyItem(item);
					}
				}}
				class="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl apple-glass-card p-3 shadow-md transition-all duration-300 {isCurrentlyPlaying(
					item
				)
					? 'border-primary ring-2 ring-primary/60 bg-primary/10'
					: ''}"
			>
				<!-- Ambient Glow on Hover -->
				<div
					class="pointer-events-none absolute -inset-1 rounded-2xl bg-primary/20 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100"
				></div>

				<!-- Thumbnail Container -->
				<div class="relative aspect-square w-full overflow-hidden rounded-xl bg-muted ring-1 ring-white/10">
					<img
						src={item.thumbnail}
						alt={item.title}
						loading="lazy"
						decoding="async"
						class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
					/>

					<!-- Live Badge -->
					{#if item.duration === 'LIVE'}
						<div
							class="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-red-600/90 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-white shadow-md backdrop-blur-md border border-red-500/40"
						>
							<span class="h-1.5 w-1.5 animate-ping rounded-full bg-white"></span>
							<span>LIVE</span>
						</div>
					{/if}

					<!-- Category Pill -->
					<div
						class="absolute right-2.5 top-2.5 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur-md border border-white/10"
					>
						{item.category}
					</div>

					<!-- Hover Play Overlay -->
					<div
						class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-all duration-200 group-hover:opacity-100"
					>
						<div
							class="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/50 transition-transform group-hover:scale-110 active:scale-95"
						>
							<HugeiconsIcon icon={PlayIcon} class="h-6 w-6 fill-current translate-x-0.5" />
						</div>
					</div>
				</div>

				<!-- Details -->
				<div class="mt-3 flex flex-1 flex-col justify-between gap-2 min-w-0">
					<div class="flex flex-col min-w-0">
						<h2 class="line-clamp-1 font-heading text-base font-bold leading-tight text-foreground group-hover:text-primary transition-colors">
							{item.title}
						</h2>
						<p class="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
							{item.subtitle}
						</p>
						{#if item.description}
							<p class="mt-1 line-clamp-2 text-xs text-muted-foreground/80 leading-relaxed">
								{item.description}
							</p>
						{/if}
					</div>

					<!-- Card Footer (Tags & Action) -->
					<div class="flex items-center justify-between pt-2 border-t border-border/40 mt-1">
						<div class="flex flex-wrap gap-1">
							{#each item.tags.slice(0, 2) as tag}
								<span class="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
									{tag}
								</span>
							{/each}
						</div>

						{#if item.category !== 'tool' && item.category !== 'chart'}
							<Button
								variant="ghost"
								size="icon-xs"
								title="Add to queue"
								onclick={(e) => queueFmhyItem(item, e)}
								class="opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity"
							>
								<HugeiconsIcon icon={MusicNote01Icon} class="h-3.5 w-3.5" />
							</Button>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>

	{#if filteredItems.length === 0}
		<div class="flex flex-col items-center justify-center gap-3 py-16 text-center">
			<HugeiconsIcon icon={Search01Icon} class="h-10 w-10 text-muted-foreground" />
			<h2 class="font-heading text-lg font-semibold">No items matched your search</h2>
			<p class="text-sm text-muted-foreground">
				Try clearing filters or searching for something else.
			</p>
			<Button
				variant="outline"
				size="sm"
				onclick={() => {
					searchQuery = '';
					activeCategory = 'all';
					selectedTag = null;
				}}
			>
				Reset Filters
			</Button>
		</div>
	{/if}
</div>
