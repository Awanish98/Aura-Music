<script lang="ts">
	import { goto } from '$app/navigation';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		PlayIcon,
		ArrowRight01Icon,
		CheckmarkCircle02Icon
	} from '@hugeicons/core-free-icons';
	import { generateAvatarSvg } from '$lib/thumb';
	import { webPlayer } from '$lib/webplayer';
	import * as api from '$lib/api';

	const topArtists = [
		{
			id: 'artist_arijit_singh',
			name: 'Arijit Singh',
			genre: 'Bollywood',
			ring: 'ring-2 ring-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.6)]',
			thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=240&h=240&fit=crop&q=80',
			searchQuery: 'Arijit Singh Top Hits'
		},
		{
			id: 'artist_diljit_dosanjh',
			name: 'Diljit Dosanjh',
			genre: 'Punjabi Pop',
			ring: 'ring-2 ring-pink-500 shadow-[0_0_16px_rgba(255,42,122,0.6)]',
			thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=240&h=240&fit=crop&q=80',
			searchQuery: 'Diljit Dosanjh Top Hits'
		},
		{
			id: 'artist_taylor_swift',
			name: 'Taylor Swift',
			genre: 'Global Pop',
			ring: 'ring-2 ring-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.6)]',
			thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&h=240&fit=crop&q=80',
			searchQuery: 'Taylor Swift Best Songs'
		},
		{
			id: 'artist_ed_sheeran',
			name: 'Ed Sheeran',
			genre: 'Pop / Acoustic',
			ring: 'ring-2 ring-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.6)]',
			thumbnail: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&h=240&fit=crop&q=80',
			searchQuery: 'Ed Sheeran Top Songs'
		},
		{
			id: 'artist_ap_dhillon',
			name: 'AP Dhillon',
			genre: 'Punjabi Wave',
			ring: 'ring-2 ring-blue-500 shadow-[0_0_16px_rgba(59,130,246,0.6)]',
			thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=240&h=240&fit=crop&q=80',
			searchQuery: 'AP Dhillon All Songs'
		},
		{
			id: 'artist_shubh',
			name: 'Shubh',
			genre: 'Hip-Hop',
			ring: 'ring-2 ring-purple-500 shadow-[0_0_16px_rgba(168,85,247,0.6)]',
			thumbnail: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=240&h=240&fit=crop&q=80',
			searchQuery: 'Shubh Latest Songs'
		},
		{
			id: 'artist_jubin_nautiyal',
			name: 'Jubin Nautiyal',
			genre: 'Bollywood',
			ring: 'ring-2 ring-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.6)]',
			thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=240&h=240&fit=crop&q=80',
			searchQuery: 'Jubin Nautiyal Best Songs'
		}
	];

	function exploreArtist(artist: typeof topArtists[0]) {
		goto(`/search?q=${encodeURIComponent(artist.name)}`);
	}

	async function playArtistTopTracks(e: MouseEvent, artist: typeof topArtists[0]) {
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
		</div>
		<button
			onclick={() => goto('/search?q=top+artists')}
			class="hidden sm:flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
		>
			<span>View All</span>
			<HugeiconsIcon icon={ArrowRight01Icon} size={14} />
		</button>
	</div>

	<!-- Horizontal Scrollable Artists Rail with Glowing Neon Rings & Verified Badges -->
	<div class="flex gap-5 sm:gap-6 overflow-x-auto pb-4 pt-2 no-scrollbar scroll-smooth">
		{#each topArtists as artist (artist.id)}
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
						class="relative size-full rounded-full object-cover shadow-2xl {artist.ring} transition-transform duration-300 group-hover:scale-105"
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
						class="absolute inset-0 m-auto flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl opacity-0 scale-75 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 hover:scale-110 active:scale-95 cursor-pointer"
						title="Play {artist.name} Top Hits"
						aria-label="Play {artist.name} Top Hits"
					>
						<HugeiconsIcon icon={PlayIcon} size={20} fill="currentColor" class="translate-x-0.5" />
					</button>
				</div>

				<!-- Artist Details with Verified Blue Checkmark -->
				<div class="flex items-center justify-center gap-1 w-full">
					<h3 class="truncate text-xs sm:text-sm font-bold text-white group-hover:text-primary transition-colors">
						{artist.name}
					</h3>
					<span class="text-sky-400 shrink-0" title="Verified Artist">
						<svg class="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
							<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
						</svg>
					</span>
				</div>
			</div>
		{/each}
	</div>
</section>
