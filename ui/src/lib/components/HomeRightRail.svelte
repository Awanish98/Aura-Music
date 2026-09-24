<script lang="ts">
	import { goto } from '$app/navigation';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		ArrowRight01Icon,
		AudioWave02Icon,
		SparklesIcon,
		PlayIcon
	} from '@hugeicons/core-free-icons';
	import * as api from '$lib/api';
	import { webPlayer } from '$lib/webplayer';
	import { toast } from '$lib/player.svelte';

	let currentMood = $state({
		title: 'Chill Evening',
		subtitle: 'Relax and let the music flow',
		query: 'Chill Evening Hindi acoustic indie songs relax'
	});

	const moodsList = [
		{ title: 'Chill Evening', subtitle: 'Relax and let the music flow', query: 'Chill Evening Hindi acoustic indie songs relax' },
		{ title: 'Late Night Focus', subtitle: 'Deep flow & coding soundscapes', query: 'Late night lofi deep focus coding beats' },
		{ title: 'Workout Hype', subtitle: 'High energy bass & phonk pump', query: 'Gym workout energy phonk electronic hits' },
		{ title: 'Romantic Sunset', subtitle: 'Soulful Bollywood & Indie love', query: 'Romantic sunset Bollywood songs love ballads' },
		{ title: 'Cozy Coffeehouse', subtitle: 'Warm acoustics and mellow jazz', query: 'Cozy coffeehouse acoustic guitar jazz relax' }
	];

	let moodIdx = $state(0);

	function changeMood() {
		moodIdx = (moodIdx + 1) % moodsList.length;
		currentMood = moodsList[moodIdx];
		toast.success(`Mood switched to: ${currentMood.title}`);
	}

	async function playMood() {
		toast(`Loading ${currentMood.title} mix...`);
		try {
			const res = await api.search(currentMood.query);
			const songs = Array.isArray(res) ? res : (res as any)?.songs || [];
			if (songs.length > 0) {
				webPlayer.playPlaylist(songs, 0, currentMood.title);
				toast.success(`Playing ${currentMood.title}!`);
			} else {
				goto(`/search?q=${encodeURIComponent(currentMood.query)}`);
			}
		} catch (err) {
			goto(`/search?q=${encodeURIComponent(currentMood.query)}`);
		}
	}

	const topGenres = [
		{
			id: 'bollywood',
			name: 'Bollywood',
			query: 'Bollywood Superhits Top Songs',
			thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=160&h=160&fit=crop&q=80'
		},
		{
			id: 'punjabi',
			name: 'Punjabi',
			query: 'Punjabi Top 50 Hits',
			thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=160&h=160&fit=crop&q=80'
		},
		{
			id: 'global_pop',
			name: 'Global Pop',
			query: 'Today Global Hits Top 50',
			thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop&q=80'
		},
		{
			id: 'indie',
			name: 'Indie',
			query: 'Indian Indie Acoustic Melodies',
			thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=160&h=160&fit=crop&q=80'
		},
		{
			id: 'lofi',
			name: 'Lo-Fi',
			query: 'Chill Lo-Fi Hip Hop Study Beats',
			thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=160&h=160&fit=crop&q=80'
		},
		{
			id: 'edm',
			name: 'EDM',
			query: 'Top EDM Festival Dance Hits',
			thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=160&h=160&fit=crop&q=80'
		},
		{
			id: 'hiphop',
			name: 'Hip Hop',
			query: 'Top Hip Hop Rap Hits',
			thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=160&h=160&fit=crop&q=80'
		},
		{
			id: 'rock',
			name: 'Rock',
			query: 'Classic and Modern Rock Hits',
			thumbnail: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=160&h=160&fit=crop&q=80'
		}
	];
</script>

<aside class="space-y-6 w-full select-none">
	<!-- Now Mood Card Widget -->
	<div class="space-y-2.5">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
				<span>Now Mood</span>
				<HugeiconsIcon icon={AudioWave02Icon} size={14} class="text-primary animate-pulse" />
			</div>
			<button
				onclick={changeMood}
				class="text-xs font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
			>
				Change
			</button>
		</div>

		<!-- Card with Cozy Night Cityscape Window -->
		<div
			onclick={playMood}
			role="button"
			tabindex="0"
			onkeydown={(e) => e.key === 'Enter' && playMood()}
			class="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 p-3.5 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-primary/40 hover:shadow-primary/10 cursor-pointer"
		>
			<!-- Background Image -->
			<div class="relative h-28 w-full overflow-hidden rounded-xl bg-muted">
				<img
					src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&auto=format&fit=crop&q=80"
					alt="Now Mood"
					class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
				/>
				<div class="absolute inset-0 bg-gradient-to-t from-[#07090e] via-black/40 to-transparent"></div>
				
				<!-- Play Overlay -->
				<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
						<HugeiconsIcon icon={PlayIcon} size={18} fill="currentColor" class="ml-0.5" />
					</div>
				</div>
			</div>

			<!-- Mood Text Details -->
			<div class="mt-2.5">
				<h4 class="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
					{currentMood.title}
				</h4>
				<p class="text-xs text-muted-foreground mt-0.5">
					{currentMood.subtitle}
				</p>
			</div>
		</div>
	</div>

	<!-- Top Genres Section -->
	<div class="space-y-3">
		<div class="flex items-center justify-between">
			<h3 class="text-xs font-bold uppercase tracking-wider text-foreground">
				Top Genres
			</h3>
			<button
				onclick={() => goto('/discover')}
				class="text-xs font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
			>
				View All &gt;
			</button>
		</div>

		<!-- Vertical List of Genres with Mini Avatars and Chevrons -->
		<div class="flex flex-col gap-1 rounded-2xl border border-white/10 bg-card/40 p-2 backdrop-blur-xl">
			{#each topGenres as genre}
				<button
					onclick={() => goto(`/search?q=${encodeURIComponent(genre.query)}`)}
					class="group flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left transition-all duration-200 hover:bg-white/5 cursor-pointer"
				>
					<div class="flex items-center gap-3 min-w-0">
						<img
							src={genre.thumbnail}
							alt={genre.name}
							class="h-7 w-7 rounded-full object-cover ring-1 ring-white/10 transition-transform group-hover:scale-105"
							loading="lazy"
						/>
						<span class="text-xs font-semibold text-foreground/90 group-hover:text-primary transition-colors truncate">
							{genre.name}
						</span>
					</div>
					<HugeiconsIcon
						icon={ArrowRight01Icon}
						size={14}
						class="text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
					/>
				</button>
			{/each}
		</div>
	</div>
</aside>
