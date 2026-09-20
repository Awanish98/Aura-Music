<script lang="ts">
	import { goto } from '$app/navigation';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		PlayIcon,
		CheckmarkBadge01Icon,
		UserGroupIcon,
		ArrowRight01Icon
	} from '@hugeicons/core-free-icons';
	import { FMHY_TOP_ARTISTS, type FmhyArtist } from '$lib/fmhy';
	import { generateAvatarSvg } from '$lib/thumb';
	import { webPlayer } from '$lib/webplayer';
	import * as api from '$lib/api';

	let scrollContainer: HTMLElement | null = $state(null);

	function exploreArtist(artist: FmhyArtist) {
		goto(`/search?q=${encodeURIComponent(artist.name)}`);
	}

	async function playArtistTopTracks(e: MouseEvent, artist: FmhyArtist) {
		e.stopPropagation();
		try {
			const res = await api.search(artist.searchQuery);
			if (res.songs && res.songs.length > 0) {
				webPlayer.playPlaylist(res.songs, 0, `${artist.name} Hits`);
			} else {
				exploreArtist(artist);
			}
		} catch (err) {
			exploreArtist(artist);
		}
	}
</script>

<section class="space-y-3.5">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
				<span>⭐ Popular Artists & Vocalists</span>
				<span class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
					Top 20
				</span>
			</h2>
			<p class="text-xs text-muted-foreground mt-0.5">
				Bollywood, Punjabi, Global Pop & Indie legends. Tap to explore discography or play top hits.
			</p>
		</div>
		<button
			onclick={() => goto('/search?q=top+artists')}
			class="hidden sm:flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
		>
			<span>View All</span>
			<HugeiconsIcon icon={ArrowRight01Icon} size={14} />
		</button>
	</div>

	<!-- Horizontal Scrollable Artists Rail -->
	<div
		bind:this={scrollContainer}
		class="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none scroll-smooth snap-x"
	>
		{#each FMHY_TOP_ARTISTS as artist, i (artist.id)}
			<div
				class="group flex flex-col items-center text-center shrink-0 w-28 sm:w-32 cursor-pointer snap-start transition-all duration-200 hover:-translate-y-1"
				onclick={() => exploreArtist(artist)}
				role="button"
				tabindex="0"
				onkeydown={(e) => e.key === 'Enter' && exploreArtist(artist)}
			>
				<!-- Avatar Container -->
				<div class="relative mb-2.5 size-24 sm:size-28">
					<!-- Glow Ring -->
					<div
						class="absolute -inset-1 rounded-full bg-gradient-to-tr from-primary/40 to-accent/40 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100"
					></div>
					
					<!-- Image -->
					<img
						src={artist.thumbnail}
						alt={artist.name}
						class="relative size-full rounded-full object-cover shadow-md border-2 border-border/60 transition-transform duration-300 group-hover:scale-105 group-hover:border-primary"
						loading="lazy"
						decoding="async"
						onerror={(e) => {
							const target = e.currentTarget as HTMLImageElement;
							target.src = generateAvatarSvg(artist.name, 'artist');
						}}
					/>

					<!-- Verified Badge -->
					<div
						class="absolute bottom-0 right-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-2 ring-background"
						title="Verified Artist"
					>
						<HugeiconsIcon icon={CheckmarkBadge01Icon} size={12} />
					</div>

					<!-- Hover Quick Play Button -->
					<button
						onclick={(e) => playArtistTopTracks(e, artist)}
						class="absolute inset-0 m-auto flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl opacity-0 scale-75 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 hover:scale-110 active:scale-95"
						title="Play {artist.name} Top Hits"
						aria-label="Play {artist.name} Top Hits"
					>
						<HugeiconsIcon icon={PlayIcon} size={20} fill="currentColor" class="translate-x-0.5" />
					</button>
				</div>

				<!-- Artist Details -->
				<h3 class="w-full truncate text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
					{artist.name}
				</h3>
				<span class="text-[11px] text-muted-foreground/80 truncate w-full mt-0.5">
					{artist.genre}
				</span>
				<span class="text-[10px] text-muted-foreground/60 font-mono mt-0.5">
					{artist.followers}
				</span>
			</div>
		{/each}
	</div>
</section>
