<script lang="ts">
	import { flip } from 'svelte/animate';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		Cancel01Icon,
		Add01Icon,
		DashboardSquare02Icon,
		Edit01Icon,
		PlayIcon,
		FavouriteIcon,
		AudioWave02Icon,
		ListRestartIcon,
		CrownIcon,
		Globe02Icon,
		Radio02Icon
	} from '@hugeicons/core-free-icons';
	import SectionHeading from './SectionHeading.svelte';
	import ShortcutPicker from './ShortcutPicker.svelte';
	import { ON_REPEAT_ID } from '$lib/api';
	import type { BrowseItem } from '$lib/api';
	import { thumb, generateAvatarSvg } from '$lib/thumb';
	import { openItem, playItem } from '$lib/browse';
	import { library, personal, placePick, removePick } from '$lib/player.svelte';
	import { freshen, MAX_PICKS } from '$lib/personal';
	import { getDragItem, isDragItem, setDragItem } from '$lib/dnd';
	import { t } from '$lib/i18n.svelte';
	import ItemMenu from './ItemMenu.svelte';

	let { onEdit }: { onEdit?: () => void } = $props();

	interface ShortcutConfig {
		id: string;
		title: string;
		subtitle: string;
		kind: 'playlist' | 'artist' | 'song';
		thumbnail: string;
		gradient: string;
		border: string;
		icon: any;
		iconColor: string;
		iconBg: string;
	}

	const DEFAULT_SHORTCUTS: ShortcutConfig[] = [
		{
			id: 'VLLM',
			title: 'Liked Songs',
			subtitle: 'Auto-playlist • Favorites',
			kind: 'playlist',
			thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80',
			gradient: 'from-rose-500/20 via-pink-600/10 to-transparent',
			border: 'border-rose-500/30 hover:border-rose-500/60',
			icon: FavouriteIcon,
			iconColor: 'text-rose-400',
			iconBg: 'bg-rose-500/20'
		},
		{
			id: 'curated_chart_hindi_50',
			title: 'Hindi Superhits Top 50',
			subtitle: 'Top Bollywood Charts',
			kind: 'playlist',
			thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&auto=format&fit=crop&q=80',
			gradient: 'from-cyan-500/20 via-blue-600/10 to-transparent',
			border: 'border-cyan-500/30 hover:border-cyan-500/60',
			icon: AudioWave02Icon,
			iconColor: 'text-cyan-400',
			iconBg: 'bg-cyan-500/20'
		},
		{
			id: 'daily_mix_01',
			title: 'Daily Mix 01',
			subtitle: 'Arijit Singh, Pritam',
			kind: 'playlist',
			thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80',
			gradient: 'from-purple-500/20 via-indigo-600/10 to-transparent',
			border: 'border-purple-500/30 hover:border-purple-500/60',
			icon: ListRestartIcon,
			iconColor: 'text-purple-400',
			iconBg: 'bg-purple-500/20'
		},
		{
			id: 'curated_chart_punjabi_50',
			title: 'Punjabi Top 50',
			subtitle: 'Diljit, Karan Aujla, Shubh',
			kind: 'playlist',
			thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&auto=format&fit=crop&q=80',
			gradient: 'from-amber-500/20 via-yellow-600/10 to-transparent',
			border: 'border-amber-500/30 hover:border-amber-500/60',
			icon: CrownIcon,
			iconColor: 'text-amber-400',
			iconBg: 'bg-amber-500/20'
		},
		{
			id: 'curated_chart_global_50',
			title: "Today's Global Hits",
			subtitle: 'Top 50 International',
			kind: 'playlist',
			thumbnail: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=200&auto=format&fit=crop&q=80',
			gradient: 'from-blue-600/20 via-sky-600/10 to-transparent',
			border: 'border-blue-500/30 hover:border-blue-500/60',
			icon: Globe02Icon,
			iconColor: 'text-blue-400',
			iconBg: 'bg-blue-500/20'
		},
		{
			id: 'artist_diljit_dosanjh',
			title: 'Diljit Dosanjh Radio',
			subtitle: 'Artist Station • Punjabi Pop',
			kind: 'artist',
			thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&auto=format&fit=crop&q=80',
			gradient: 'from-pink-600/20 via-rose-700/10 to-transparent',
			border: 'border-pink-500/30 hover:border-pink-500/60',
			icon: Radio02Icon,
			iconColor: 'text-pink-400',
			iconBg: 'bg-pink-500/20'
		}
	];

	const defaultItemMap = new Map(DEFAULT_SHORTCUTS.map((s) => [s.id, s]));

	const picks = $derived.by(() => {
		const userPicks = personal.picks.map((p) => freshen(p, library.items));
		if (userPicks.length === 0) {
			return DEFAULT_SHORTCUTS.map((s) => ({
				id: s.id,
				title: s.title,
				subtitle: s.subtitle,
				kind: s.kind,
				thumbnail: s.thumbnail
			}));
		}
		return userPicks;
	});

	let picking = $state(false);
	let before = $state<string | null | undefined>(undefined);
	let busy = $state<string | null>(null);
	let failed = $state<Record<string, boolean>>({});

	function targetId(e: DragEvent): string | null {
		const el = e.target as HTMLElement | null;
		const tile = el?.closest('[data-pick]');
		if (tile) return tile.getAttribute('data-pick');
		return el?.closest('[data-grid]') ? (before ?? null) : null;
	}

	function over(e: DragEvent) {
		if (!isDragItem(e)) return;
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
		before = targetId(e);
	}

	function drop(e: DragEvent) {
		const beforeId = before ?? targetId(e);
		before = undefined;
		const item = getDragItem(e);
		if (!item) return;
		e.preventDefault();
		placePick(item, beforeId);
	}

	async function play(item: BrowseItem) {
		if (busy) return;
		busy = item.id;
		try {
			await playItem(item);
		} finally {
			busy = null;
		}
	}
</script>

<svelte:window ondragend={() => (before = undefined)} />

<section class="space-y-3.5">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<HugeiconsIcon icon={DashboardSquare02Icon} size={18} class="text-primary" />
			<h2 class="text-xl font-bold tracking-tight text-foreground">Shortcuts</h2>
		</div>
		<div class="flex items-center gap-2">
			{#if onEdit}
				<button
					onclick={onEdit}
					title={t('home.edit_home')}
					class="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-white/20 hover:bg-white/5 hover:text-foreground"
				>
					<HugeiconsIcon icon={Edit01Icon} size={13} />
					<span>{t('home.edit_home')}</span>
				</button>
			{/if}
			{#if picks.length && picks.length < MAX_PICKS}
				<button
					onclick={() => (picking = true)}
					class="flex shrink-0 cursor-pointer items-center gap-1 text-xs font-semibold text-primary hover:underline"
				>
					<HugeiconsIcon icon={Add01Icon} size={14} />
					<span>+ Add</span>
				</button>
			{/if}
		</div>
	</div>

	<!-- 6 Liquid Glass Gradient Shortcut Cards Grid (swipe-friendly on mobile) -->
	<div
		role="group"
		aria-label={t('home.shortcuts')}
		ondragover={over}
		ondrop={drop}
		ondragleave={(e) => {
			const r = e.currentTarget.getBoundingClientRect();
			if (e.clientX < r.left || e.clientX >= r.right || e.clientY < r.top || e.clientY >= r.bottom)
				before = undefined;
		}}
	>
		<div
			data-grid
			class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 overflow-x-auto no-scrollbar"
		>
			{#each picks as item (item.id)}
				{@const meta = defaultItemMap.get(item.id)}
				{@const gradient = meta?.gradient || 'from-white/10 via-white/5 to-transparent'}
				{@const border = meta?.border || 'border-white/10 hover:border-primary/50'}
				{@const iconComp = meta?.icon || FavouriteIcon}
				{@const iconColor = meta?.iconColor || 'text-primary'}
				{@const iconBg = meta?.iconBg || 'bg-primary/20'}

				<div
					class="group/pick relative select-none"
					data-ctx
					data-pick={item.id}
					animate:flip={{ duration: 200 }}
				>
					{#if before === item.id}
						<div class="absolute -left-1 bottom-0 top-0 z-20 w-1 rounded-full bg-primary shadow-[0_0_8px_#ff2a7a]"></div>
					{/if}

					<div
						class="flex h-20 cursor-pointer items-center justify-between gap-3 overflow-hidden rounded-2xl border bg-gradient-to-r {gradient} {border} p-2.5 backdrop-blur-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.015]"
						role="button"
						tabindex="0"
						draggable="true"
						aria-label={item.subtitle ? `${item.title}, ${item.subtitle}` : item.title}
						ondragstart={(e) => setDragItem(e, item)}
						onclick={() => openItem(item)}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								openItem(item);
							}
						}}
					>
						<!-- Left Icon + Details -->
						<div class="flex items-center gap-3 min-w-0 flex-1">
							<!-- Frosted Glow Icon Badge -->
							<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl {iconBg} {iconColor} border border-white/10 shadow-sm">
								<HugeiconsIcon icon={iconComp} size={19} />
							</div>

							<!-- Title and Subtitle -->
							<div class="min-w-0 flex-1">
								<h3 class="truncate text-xs sm:text-sm font-bold tracking-tight text-white group-hover/pick:text-primary transition-colors">
									{item.title}
								</h3>
								<p class="truncate text-[11px] text-muted-foreground/80 mt-0.5">
									{item.subtitle || 'Music Mix'}
								</p>
							</div>
						</div>

						<!-- Right Artwork with Hover Play Overlay -->
						<div class="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-xl bg-muted shadow-md ring-1 ring-white/10">
							<img
								src={thumb(item.thumbnail, 200)}
								alt={item.title}
								class="h-full w-full object-cover transition-transform duration-300 group-hover/pick:scale-105"
								loading="lazy"
								decoding="async"
								draggable="false"
								onerror={() => (failed = { ...failed, [item.thumbnail!]: true })}
							/>

							<!-- Hover Center Play Button Overlay -->
							<button
								class="absolute inset-0 m-auto flex size-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg opacity-0 transition-all duration-200 hover:scale-110 active:scale-95 group-hover/pick:opacity-100"
								class:animate-pulse={busy === item.id}
								disabled={busy === item.id}
								aria-label={t('a11y.play_item', { title: item.title })}
								onclick={(e) => {
									e.stopPropagation();
									play(item);
								}}
							>
								<HugeiconsIcon icon={PlayIcon} size={15} fill="currentColor" class="ml-0.5" />
							</button>
						</div>
					</div>

					<ItemMenu
						{item}
						triggerClass="absolute right-2 top-2 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-muted-foreground opacity-0 transition hover:bg-white/10 hover:text-foreground group-hover/pick:opacity-100"
					/>
				</div>
			{/each}
		</div>
	</div>
</section>

{#if picking}
	<ShortcutPicker onclose={() => (picking = false)} />
{/if}
