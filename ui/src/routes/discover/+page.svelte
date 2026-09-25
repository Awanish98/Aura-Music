<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { page } from '$app/state';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		PlayIcon,
		Search01Icon,
		MusicNote01Icon,
		VolumeHighIcon,
		InfinityIcon,
		FavouriteIcon,
		Compass01Icon,
		SparklesIcon,
		Mic01Icon
	} from '@hugeicons/core-free-icons';
	import { Button } from '$lib/components/ui/button';
	import {
		ALL_FMHY_ITEMS,
		convertFmhyToSongItem,
		type FmhyItem
	} from '$lib/fmhy';
	import { webPlayer } from '$lib/webplayer';
	import { playback, toast } from '$lib/player.svelte';
	import { t } from '$lib/i18n.svelte';

	let activeCategory = $state<'all' | 'radio' | 'podcast' | 'ambient' | 'soundtrack' | 'chart' | 'tool'>('all');
	let searchQuery = $state('');
	let selectedTag = $state<string | null>(null);

	onMount(() => {
		const cat = page.url.searchParams.get('cat');
		if (cat && ['all', 'radio', 'podcast', 'ambient', 'soundtrack', 'chart', 'tool'].includes(cat)) {
			activeCategory = cat as any;
		}
	});

	const categories = [
		{ id: 'all', label: 'All Explore', icon: Compass01Icon },
		{ id: 'radio', label: '24/7 Live Radio', icon: VolumeHighIcon },
		{ id: 'podcast', label: 'Podcasts', icon: Mic01Icon },
		{ id: 'ambient', label: 'Ambient & Sleep', icon: InfinityIcon },
		{ id: 'soundtrack', label: 'Game OSTs', icon: MusicNote01Icon },
		{ id: 'chart', label: 'Top Charts', icon: FavouriteIcon }
	];

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
	<title>Explore Music, Radio & Podcasts • Aura Music</title>
</svelte:head>

<div class="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8 select-none">
	<!-- Hero Banner -->
	<div
		class="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-pink-950/30 to-black/50 p-6 sm:p-10 shadow-2xl backdrop-blur-3xl"
	>
		<div class="relative z-10 flex flex-col gap-3">
			<div class="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/15 px-3 py-1 text-xs font-bold text-pink-400 w-fit">
				<HugeiconsIcon icon={SparklesIcon} size={14} class="animate-pulse" />
				<span>Curated Discovery & 24/7 Streams</span>
			</div>
			<h1 class="font-heading text-3xl font-extrabold tracking-tight md:text-5xl text-white">
				Explore & Radios
			</h1>
			<p class="max-w-2xl text-xs sm:text-sm text-muted-foreground/90 leading-relaxed">
				Stream commercial-free 24/7 internet radio, cyber & science podcasts, deep focus ambient soundscapes, video game soundtracks, and global charts.
			</p>
		</div>
		<div
			class="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-pink-600/25 blur-3xl"
		></div>
	</div>

	<!-- Search & Filter Controls -->
	<div class="flex flex-col gap-4">
		<!-- Search Input -->
		<div class="relative w-full max-w-md">
			<div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
				<HugeiconsIcon icon={Search01Icon} size={17} />
			</div>
			<input
				type="search"
				placeholder="Search stations, podcasts, soundscapes..."
				bind:value={searchQuery}
				class="w-full h-11 pl-10 pr-4 rounded-full bg-white/6 border border-white/10 text-xs sm:text-sm text-white placeholder:text-muted-foreground/70 focus:outline-none focus:border-pink-500/60 focus:bg-white/10 transition-all shadow-inner"
			/>
		</div>

		<!-- Category Tabs -->
		<div class="flex overflow-x-auto no-scrollbar flex-nowrap sm:flex-wrap items-center gap-2 pb-1">
			{#each categories as cat}
				<button
					type="button"
					onclick={() => {
						activeCategory = cat.id as any;
						selectedTag = null;
					}}
					class="shrink-0 flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer {activeCategory ===
					cat.id
						? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/30 scale-[1.02]'
						: 'border border-white/10 bg-white/6 text-muted-foreground hover:bg-white/12 hover:text-white'}"
				>
					<HugeiconsIcon icon={cat.icon} size={16} />
					<span>{cat.label}</span>
				</button>
			{/each}
		</div>

		<!-- Tags Filter Chips -->
		<div class="flex overflow-x-auto no-scrollbar flex-nowrap sm:flex-wrap items-center gap-1.5 pt-1 pb-1">
			<span class="shrink-0 text-xs font-bold uppercase tracking-wider text-muted-foreground/70 mr-1">
				Filter tags:
			</span>
			{#each allTags.slice(0, 16) as tag}
				<button
					type="button"
					onclick={() => {
						selectedTag = selectedTag === tag ? null : tag;
					}}
					class="rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer {selectedTag ===
					tag
						? 'border-pink-500 bg-pink-500/25 text-pink-300 font-bold shadow-sm'
						: 'border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'}"
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
				class="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-white/10 bg-card/50 p-3.5 shadow-xl backdrop-blur-2xl transition-all duration-300 hover:border-pink-500/40 hover:shadow-2xl hover:scale-[1.015] {isCurrentlyPlaying(
					item
				)
					? 'border-pink-500 ring-2 ring-pink-500/50 bg-pink-500/10'
					: ''}"
			>
				<!-- Thumbnail Container -->
				<div class="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted ring-1 ring-white/10">
					<img
						src={item.thumbnail}
						alt={item.title}
						loading="lazy"
						decoding="async"
						onerror={(e) => {
							(e.currentTarget as HTMLImageElement).src = '/default_cover.jpg';
						}}
						class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
					/>

					<!-- Live Badge -->
					{#if item.duration === 'LIVE'}
						<div
							class="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-red-600/95 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-white shadow-md backdrop-blur-md border border-red-400/40"
						>
							<span class="h-1.5 w-1.5 animate-ping rounded-full bg-white"></span>
							<span>LIVE</span>
						</div>
					{/if}

					<!-- Category Pill -->
					<div
						class="absolute right-2.5 top-2.5 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/90 backdrop-blur-md border border-white/10"
					>
						{item.category}
					</div>

					<!-- Hover Play Overlay -->
					<div
						class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-all duration-200 group-hover:opacity-100"
					>
						<div
							class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 text-white shadow-2xl shadow-pink-500/50 transition-transform group-hover:scale-110 active:scale-95"
						>
							<HugeiconsIcon icon={PlayIcon} size={24} fill="currentColor" class="translate-x-0.5" />
						</div>
					</div>
				</div>

				<!-- Details -->
				<div class="mt-3.5 flex flex-1 flex-col justify-between gap-2 min-w-0">
					<div class="flex flex-col min-w-0">
						<h2 class="line-clamp-1 font-heading text-sm font-bold text-white group-hover:text-primary transition-colors">
							{item.title}
						</h2>
						<p class="mt-0.5 line-clamp-1 text-xs text-muted-foreground/80">
							{item.subtitle}
						</p>
					</div>

					<!-- Card Footer (Tags & Action) -->
					<div class="flex items-center justify-between pt-2 border-t border-white/8 mt-1">
						<div class="flex flex-wrap gap-1">
							{#each item.tags.slice(0, 2) as tag}
								<span class="rounded-md bg-white/6 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
									{tag}
								</span>
							{/each}
						</div>

						{#if item.category !== 'tool' && item.category !== 'chart'}
							<button
								type="button"
								title="Add to queue"
								onclick={(e) => queueFmhyItem(item, e)}
								class="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
							>
								<HugeiconsIcon icon={MusicNote01Icon} size={15} />
							</button>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
