<script lang="ts">
	import { goto } from '$app/navigation';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		PlayIcon,
		ArrowRight01Icon
	} from '@hugeicons/core-free-icons';
	import { FMHY_TOP_ARTISTS, type FmhyArtist } from '$lib/fmhy';
	import { generateAvatarSvg } from '$lib/thumb';
	import { webPlayer } from '$lib/webplayer';
	import * as api from '$lib/api';

	const neonRings = [
		'artist-ring-gold',
		'artist-ring-pink',
		'artist-ring-rose',
		'artist-ring-amber',
		'artist-ring-cyan',
		'artist-ring-blue',
		'artist-ring-violet'
	];

	function exploreArtist(artist: FmhyArtist) {
		goto(`/search?q=${encodeURIComponent(artist.name)}`);
	}

	async function playArtistTopTracks(e: MouseEvent, artist: FmhyArtist) {
		e.stopPropagation();
		try {
			const res = await api.search(artist.searchQuery);
			const songs = Array.isArray(res) ? res : (res as any)?.songs || [];
			if (songs.length > 0) {
				webPlayer.playPlaylist(songs, 0, `${artist.name} Hits`);
			} else {
				exploreArtist(artist);
			}
		} catch (err) {
			exploreArtist(artist);
		}
	}
</script>

<section class="space-y-4 select-none">
	<div class="flex items-center justify-between">
		<div>
			<div class="flex items-center gap-2">
				<span class="text-amber-400 text-lg">⭐</span>
				<h2 class="text-xl font-bold tracking-tight text-white">Popular Artists & Vocalists</h2>
				<span class="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/15 text-pink-400 border border-pink-500/30 font-bold">
					Top 20
				</span>
			</div>
			<p class="text-xs text-muted-foreground/80 mt-0.5">
				Bollywood, Punjabi, Global Pop & Indie legends. Tap to explore discography or play top hits.
			</p>
		</div>
		<button
			onclick={() => goto('/search?q=top+artists')}
			class="hidden sm:flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
		>
			<span>View All</span>
			<HugeiconsIcon icon={ArrowRight01Icon} size={14} />
		</button>
	</div>

	<!-- Horizontal Scrollable Artists Rail with Glowing Neon Rings -->
	<div class="flex gap-5 sm:gap-6 overflow-x-auto pb-4 pt-2 no-scrollbar scroll-smooth">
		{#each FMHY_TOP_ARTISTS as artist, i (artist.id)}
			{@const ringClass = neonRings[i % neonRings.length]}
			<div
				class="group flex flex-col items-center text-center shrink-0 w-24 sm:w-28 cursor-pointer transition-all duration-300 hover:-translate-y-1.5"
				onclick={() => exploreArtist(artist)}
				role="button"
				tabindex="0"
				aria-label="Explore {artist.name}"
				onkeydown={(e) => e.key === 'Enter' && exploreArtist(artist)}
			>
				<!-- Avatar Container with Glowing Neon Ring -->
				<div class="relative mb-2.5 size-20 sm:size-24 rounded-full">
					<img
						src={artist.thumbnail}
						alt={artist.name}
						class="relative size-full rounded-full object-cover shadow-2xl {ringClass} transition-transform duration-300 group-hover:scale-105"
						loading="lazy"
						decoding="async"
						onerror={(e) => {
							const target = e.currentTarget as HTMLImageElement;
							target.src = generateAvatarSvg(artist.name, 'artist');
						}}
					/>

					<!-- Hover Quick Play Button -->
					<button
						onclick={(e) => playArtistTopTracks(e, artist)}
						class="absolute inset-0 m-auto flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl opacity-0 scale-75 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 hover:scale-110 active:scale-95"
						title="Play {artist.name} Top Hits"
						aria-label="Play {artist.name} Top Hits"
					>
						<HugeiconsIcon icon={PlayIcon} size={20} fill="currentColor" class="translate-x-0.5" />
					</button>
				</div>

				<!-- Artist Details -->
				<h3 class="w-full truncate text-xs sm:text-sm font-bold text-white group-hover:text-primary transition-colors">
					{artist.name}
				</h3>
				<span class="text-[11px] text-muted-foreground/70 truncate w-full mt-0.5">
					{artist.genre}
				</span>
			</div>
		{/each}
	</div>
</section>
