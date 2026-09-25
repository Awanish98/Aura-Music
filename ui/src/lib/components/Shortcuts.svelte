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
		Radio02Icon,
		SparklesIcon
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
			id: 'on_repeat_default',
			title: 'On Repeat',
			subtitle: 'Your most played',
			kind: 'playlist',
			thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&auto=format&fit=crop&q=80',
			gradient: 'from-pink-500/15 via-rose-500/10 to-pink-500/5 dark:from-pink-600/90 dark:via-rose-600/80 dark:to-pink-900/60',
			border: 'border-pink-300/50 dark:border-pink-400/40 hover:border-pink-400/80',
			icon: ListRestartIcon,
			iconColor: 'text-pink-500 dark:text-pink-300',
			iconBg: 'bg-pink-500/15 dark:bg-pink-500/20'
		},
		{
			id: 'aidj_default',
			title: 'AI DJ',
			subtitle: 'Personalized radio',
			kind: 'playlist',
			thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80',
			gradient: 'from-indigo-500/15 via-purple-500/10 to-indigo-500/5 dark:from-indigo-600/90 dark:via-purple-600/80 dark:to-indigo-900/60',
			border: 'border-indigo-300/50 dark:border-indigo-400/40 hover:border-indigo-400/80',
			icon: SparklesIcon,
			iconColor: 'text-indigo-500 dark:text-indigo-300',
			iconBg: 'bg-indigo-500/15 dark:bg-indigo-500/20'
		},
		{
			id: 'VLLM',
			title: 'Liked Songs',
			subtitle: 'Saved tracks',
			kind: 'playlist',
			thumbnail: '/default_cover.jpg',
			gradient: 'from-rose-500/15 via-red-500/10 to-rose-500/5 dark:from-rose-600/90 dark:via-red-600/80 dark:to-rose-900/60',
			border: 'border-rose-300/50 dark:border-rose-400/40 hover:border-rose-400/80',
			icon: FavouriteIcon,
			iconColor: 'text-rose-500 dark:text-rose-300',
			iconBg: 'bg-rose-500/15 dark:bg-rose-500/20'
		},
		{
			id: 'recently_played_default',
			title: 'Recently Played',
			subtitle: 'Pick up where you left',
			kind: 'playlist',
			thumbnail: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=200&auto=format&fit=crop&q=80',
			gradient: 'from-sky-500/15 via-blue-500/10 to-indigo-500/5 dark:from-sky-500/90 dark:via-blue-600/80 dark:to-indigo-900/60',
			border: 'border-sky-300/50 dark:border-sky-400/40 hover:border-sky-400/80',
			icon: AudioWave02Icon,
			iconColor: 'text-sky-500 dark:text-sky-300',
			iconBg: 'bg-sky-500/15 dark:bg-sky-500/20'
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
					class="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200/90 dark:border-white/10 bg-white/70 dark:bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-muted-foreground transition-colors hover:border-pink-500/40 hover:text-foreground"
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

	<!-- 4 Liquid Glass Gradient Shortcut Cards Grid matching reference UI -->
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
			class="grid grid-cols-2 lg:grid-cols-4 gap-3"
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
						class="flex flex-col justify-between h-28 cursor-pointer rounded-2xl border bg-white dark:bg-[#060814]/90 border-slate-200/90 dark:border-white/10 p-4 backdrop-blur-2xl shadow-sm dark:shadow-[0_8px_30px_rgba(0,0,0,0.8)] transition-all duration-300 hover:shadow-md dark:hover:shadow-[0_12px_40px_rgba(255,42,122,0.15)] hover:border-pink-400/60 hover:scale-[1.02]"
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
						<!-- Top: Glowing Icon Badge + Quick Play Button on hover -->
						<div class="flex items-center justify-between">
							<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl {iconBg} {iconColor} border border-border/40 shadow-sm transition-transform duration-300 group-hover/pick:scale-110">
								<HugeiconsIcon icon={iconComp} size={20} />
							</div>

							<!-- Hover Play Action Button -->
							<button
								class="flex size-7 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-md opacity-0 transition-all duration-200 hover:scale-110 active:scale-95 group-hover/pick:opacity-100"
								class:animate-pulse={busy === item.id}
								disabled={busy === item.id}
								aria-label={t('a11y.play_item', { title: item.title })}
								onclick={(e) => {
									e.stopPropagation();
									play(item);
								}}
							>
								<HugeiconsIcon icon={PlayIcon} size={13} fill="currentColor" class="ml-0.5" />
							</button>
						</div>

						<!-- Bottom: Title and Subtitle -->
						<div class="min-w-0">
							<h3 class="truncate text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white group-hover/pick:text-primary transition-colors">
								{item.title}
							</h3>
							<p class="truncate text-[11px] text-slate-500 dark:text-white/60 mt-0.5 font-medium">
								{item.subtitle || 'Music Mix'}
							</p>
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
