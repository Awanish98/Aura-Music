<script lang="ts">
	import { goto } from '$app/navigation';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { PlayIcon, SparklesIcon } from '@hugeicons/core-free-icons';
	import { FMHY_GENRES_AND_MOODS, type FmhyMood } from '$lib/fmhy';
	import { webPlayer } from '$lib/webplayer';
	import * as api from '$lib/api';

	async function playMood(mood: FmhyMood) {
		try {
			const res = await api.search(mood.searchQuery);
			const songs = Array.isArray(res) ? res : (res as any)?.songs || [];
			if (songs.length > 0) {
				webPlayer.playPlaylist(songs, 0, `${mood.title} Mix`);
			} else {
				goto(`/search?q=${encodeURIComponent(mood.searchQuery)}`);
			}
		} catch (err) {
			goto(`/search?q=${encodeURIComponent(mood.searchQuery)}`);
		}
	}
</script>

<section class="space-y-3.5">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
				<span>✨ Moods & Audio Categories</span>
				<span class="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground font-medium">
					Curated
				</span>
			</h2>
			<p class="text-xs text-muted-foreground mt-0.5">
				Tap any vibe to launch an instant curated queue of romantic, high-energy, or chill tracks.
			</p>
		</div>
	</div>

	<!-- Moods Grid -->
	<div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
		{#each FMHY_GENRES_AND_MOODS as mood (mood.id)}
			<div
				class="group relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-gradient-to-br {mood.gradient} text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer border border-white/10"
				onclick={() => playMood(mood)}
				role="button"
				tabindex="0"
				aria-label="Play {mood.title} mood music"
				onkeydown={(e) => e.key === 'Enter' && playMood(mood)}
			>
				<!-- Background Subtle Graphic / Icon -->
				<div class="absolute -right-2 -bottom-2 text-5xl sm:text-6xl opacity-20 transition-transform duration-300 group-hover:scale-110 group-hover:opacity-30 select-none">
					{mood.icon}
				</div>

				<!-- Content -->
				<div class="relative z-10 flex flex-col justify-between h-24 sm:h-28">
					<div>
						<div class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/80">
							<span>{mood.icon}</span>
							<span>Vibe</span>
						</div>
						<h3 class="text-base sm:text-lg font-bold font-heading mt-1 leading-tight text-white drop-shadow-sm">
							{mood.title}
						</h3>
						<p class="text-[11px] text-white/75 line-clamp-1 mt-0.5">
							{mood.subtitle}
						</p>
					</div>

					<!-- Play Button -->
					<div class="flex items-center justify-between">
						<span class="text-[10px] font-medium bg-black/25 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
							Instant Mix
						</span>
						<div class="flex size-8 items-center justify-center rounded-full bg-white text-black shadow-md opacity-90 transition-transform group-hover:scale-110 group-hover:opacity-100">
							<HugeiconsIcon icon={PlayIcon} size={16} fill="currentColor" class="translate-x-0.5" />
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>
