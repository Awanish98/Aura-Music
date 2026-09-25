<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { PlayIcon, MusicNote01Icon, ListRestartIcon } from '@hugeicons/core-free-icons';
	import { ON_REPEAT_ID } from '$lib/api';
	import type { BrowseItem } from '$lib/api';
	import { thumb, generateAvatarSvg } from '$lib/thumb';
	import { setDragItem } from '$lib/dnd';
	import { openItem, playItem } from '$lib/browse';
	import PlaylistMenu from './PlaylistMenu.svelte';
	import { t } from '$lib/i18n.svelte';

	let { item }: { item: BrowseItem } = $props();

	const onRepeat = $derived(item.id === ON_REPEAT_ID);

	let attempt = $state(0);
	$effect(() => {
		item.thumbnail;
		attempt = 0;
	});
	const sized = $derived(thumb(item.thumbnail, 400, item.title, 'playlist'));
	const src = $derived(attempt === 0 ? sized : item.thumbnail);
	const imgFailed = () => (attempt = attempt === 0 && sized !== item.thumbnail ? 1 : 2);
	const hasArt = $derived(!!item.thumbnail && attempt < 2 && !onRepeat);

	let busy = $state(false);
	async function play() {
		if (busy) return;
		busy = true;
		try {
			await playItem(item);
		} finally {
			busy = false;
		}
	}
</script>

<div class="group relative w-full" data-ctx>
	<div
		class="cursor-pointer"
		role="button"
		tabindex="0"
		draggable="true"
		aria-label={item.subtitle ? `${item.title}, ${item.subtitle}` : item.title}
		ondragstart={(e) => setDragItem(e, item)}
		onclick={() => openItem(item)}
		onkeydown={(e) => {
			if (e.target !== e.currentTarget) return;
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				openItem(item);
			}
		}}
		title={item.subtitle ? `${item.title} — ${item.subtitle}` : item.title}
	>
		<div class="relative aspect-square w-full">
			<!-- Subtle ambient glowing backdrop on hover without any overlapping top boxes -->
			<div
				class="pointer-events-none absolute -inset-1 rounded-2xl bg-primary/20 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100"
			></div>

			<div class="relative h-full w-full overflow-hidden rounded-xl bg-muted ring-1 ring-white/10 shadow-md transition-all duration-300 group-hover:shadow-xl">
				{#if hasArt}
					<img
						{src}
						alt={item.title}
						class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
						loading="lazy"
						draggable="false"
						onerror={imgFailed}
					/>
				{:else}
					<img
						src={generateAvatarSvg(item.title, 'playlist')}
						alt={item.title}
						class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
						loading="lazy"
						draggable="false"
						onerror={(e) => {
							(e.currentTarget as HTMLImageElement).src = '/default_cover.jpg';
						}}
					/>
				{/if}
				<button
					class="absolute bottom-2.5 right-2.5 flex h-10 w-10 translate-y-2 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-xl transition-all duration-200 ease-out focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-105 active:scale-95"
					class:animate-pulse={busy}
					disabled={busy}
					aria-label={t('a11y.play_item', { title: item.title })}
					onclick={(e) => {
						e.stopPropagation();
						play();
					}}
				>
					<HugeiconsIcon icon={PlayIcon} class="h-4 w-4 fill-current" />
				</button>
			</div>
		</div>
		<div class="mt-2.5 min-w-0">
			<div class="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{item.title}</div>
			{#if item.subtitle}
				<div class="truncate text-xs font-medium text-muted-foreground">{item.subtitle}</div>
			{/if}
		</div>
	</div>
	<PlaylistMenu
		{item}
		triggerClass="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow-md transition hover:bg-background focus-visible:opacity-100 group-hover:opacity-100 cursor-pointer z-10"
	/>
</div>

