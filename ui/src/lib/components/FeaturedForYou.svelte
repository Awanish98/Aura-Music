<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		DashboardSquare02Icon,
		PlayIcon,
		ArrowRight01Icon
	} from '@hugeicons/core-free-icons';
	import { goto } from '$app/navigation';
	import * as api from '$lib/api';
	import { webPlayer } from '$lib/webplayer';
	import { playback, toast } from '$lib/player.svelte';

	const featuredItems = [
		{
			id: 'chill_mix',
			title: 'Chill Mix',
			subtitle: 'Relax & Unwind',
			thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
			query: 'Chill Hindi acoustic indie relaxing vibes'
		},
		{
			id: 'focus_flow',
			title: 'Focus Flow',
			subtitle: 'Deep Work',
			thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&fit=crop&q=80',
			query: 'Deep Focus Coding Ambient Study Lofi Beats'
		},
		{
			id: 'bollywood_vibes',
			title: 'Bollywood Vibes',
			subtitle: 'Trending Hits',
			thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
			query: 'Bollywood Superhits Trending Latest'
		},
		{
			id: 'night_drive',
			title: 'Night Drive',
			subtitle: 'Late Night Energy',
			thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
			query: 'Late Night Neon Drive Synthwave Retro Phonk'
		},
		{
			id: 'lofi_vibes',
			title: 'LoFi Vibes',
			subtitle: 'Study & Chill',
			thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
			query: 'Lofi Hip Hop Chill Study Sleep Beats'
		}
	];

	let playingId = $state<string | null>(null);

	async function playFeatured(item: typeof featuredItems[0]) {
		playingId = item.id;
		toast(`Loading ${item.title}...`);
		try {
			const res = await api.search(item.query);
			const songs = Array.isArray(res) ? res : (res as any)?.songs || [];
			if (songs.length > 0) {
				webPlayer.playPlaylist(songs, 0, item.title);
				toast.success(`Playing ${item.title}!`);
			} else {
				goto(`/search?q=${encodeURIComponent(item.query)}`);
			}
		} catch {
			goto(`/search?q=${encodeURIComponent(item.query)}`);
		} finally {
			playingId = null;
		}
	}
</script>

<section class="space-y-3.5">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<HugeiconsIcon icon={DashboardSquare02Icon} size={18} class="text-primary" />
			<h2 class="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Featured For You</h2>
		</div>
		<button
			onclick={() => goto('/discover')}
			class="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-muted-foreground hover:text-primary transition-colors cursor-pointer"
		>
			<span>View All</span>
			<HugeiconsIcon icon={ArrowRight01Icon} size={13} />
		</button>
	</div>

	<!-- 5 Grid Cards -->
	<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
		{#each featuredItems as item}
			<div
				role="button"
				tabindex="0"
				onclick={() => playFeatured(item)}
				onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && playFeatured(item)}
				class="group relative flex flex-col gap-2 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#101322]/85 p-2.5 backdrop-blur-2xl shadow-sm dark:shadow-xl transition-all duration-300 hover:shadow-md dark:hover:shadow-2xl hover:border-pink-500/50 hover:scale-[1.02] cursor-pointer"
			>
				<!-- Card Image with Hover Overlay and Pink Play Button in Bottom-Right -->
				<div class="relative aspect-video sm:aspect-square w-full overflow-hidden rounded-xl bg-muted shadow-md ring-1 ring-border/40">
					<img
						src={item.thumbnail}
						alt={item.title}
						class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
						loading="lazy"
						decoding="async"
					/>
					<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

					<!-- Pink Play Button Overlay -->
					<div class="absolute bottom-2 right-2">
						<button
							aria-label="Play {item.title}"
							class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-[0_4px_14px_rgba(255,42,122,0.6)] transition-transform duration-200 group-hover:scale-110 active:scale-95 cursor-pointer"
						>
							<HugeiconsIcon icon={PlayIcon} size={15} fill="currentColor" class="ml-0.5" />
						</button>
					</div>
				</div>

				<!-- Title and Subtitle -->
				<div class="min-w-0 px-0.5 pb-0.5">
					<h3 class="truncate text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
						{item.title}
					</h3>
					<p class="truncate text-[11px] text-slate-500 dark:text-white/60 mt-0.5 font-medium">
						{item.subtitle}
					</p>
				</div>
			</div>
		{/each}
	</div>
</section>
