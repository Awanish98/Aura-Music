<script lang="ts">
	import { goto } from '$app/navigation';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { SparklesIcon } from '@hugeicons/core-free-icons';
	import { auth, playback, ui } from '$lib/player.svelte';
	import { t } from '$lib/i18n.svelte';

	let { onSelectMood, activeMood }: { onSelectMood?: (mood: string | null) => void; activeMood?: string | null } = $props();

	// Dynamic Daypart Greeting
	const hour = new Date().getHours();
	const daypart =
		hour < 5
			? 'Good night'
			: hour < 12
				? 'Good morning'
				: hour < 18
					? 'Good afternoon'
					: 'Good evening';

	const moodChips = [
		{ id: null, label: 'All', icon: '✨' },
		{ id: 'relax', label: 'Relax', icon: '☕', query: 'Relaxing Acoustic Hindi Indie Calm' },
		{ id: 'workout', label: 'Workout', icon: '⚡', query: 'Gym Workout Energy Phonk Electronic' },
		{ id: 'focus', label: 'Focus', icon: '🎯', query: 'Deep Focus Coding Ambient Lofi' },
		{ id: 'energize', label: 'Energize', icon: '⚡', query: 'High Energy Bollywood Party EDM' },
		{ id: 'commute', label: 'Commute', icon: '🚗', query: 'Road Trip Drive Hits Acoustic' },
		{ id: 'romance', label: 'Romance', icon: '💖', query: 'Romantic Bollywood Love Melodies' },
		{ id: 'party', label: 'Party', icon: '🎉', query: 'Top Party Anthems Dance Punjabi' },
		{ id: 'sad', label: 'Sad', icon: '☁️', query: 'Heartbreak Soulful Sad Melodies' },
		{ id: 'sleep', label: 'Sleep', icon: '🌙', query: 'Deep Sleep Ambient Soundscapes' }
	];

	function handleMoodClick(chip: typeof moodChips[0]) {
		if (onSelectMood) {
			onSelectMood(chip.id);
		} else if (chip.query) {
			goto(`/search?q=${encodeURIComponent(chip.query)}`);
		}
	}
</script>

<div class="relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-r from-[#0d101d] via-[#16122a] to-[#250d24] p-5 sm:p-8 shadow-2xl mb-8 select-none">
	<!-- Cosmic Nebula Background Ambient Glow -->
	<div class="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-pink-600/25 blur-3xl"></div>
	<div class="pointer-events-none absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-purple-600/25 blur-3xl"></div>
	<div class="pointer-events-none absolute left-1/3 top-1/4 h-56 w-56 rounded-full bg-blue-600/15 blur-3xl"></div>

	<div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
		<!-- Left: Big Greeting + Subtitle -->
		<div class="flex-1 space-y-1">
			<h1 class="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
				{daypart}
			</h1>
			<p class="text-sm sm:text-base text-muted-foreground font-medium">
				What's your vibe today?
			</p>
		</div>

		<!-- Right: Cosmic Headphones Artwork with Cursive Quote -->
		<div class="relative hidden sm:flex items-center gap-4 shrink-0 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl shadow-lg">
			<div class="relative h-20 w-28 overflow-hidden rounded-xl bg-purple-950">
				<img
					src="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80"
					alt="Cosmic Music"
					class="h-full w-full object-cover opacity-85"
				/>
				<div class="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/20 to-purple-900/60"></div>
			</div>
			<div class="pr-2">
				<p class="font-serif italic text-sm sm:text-base text-pink-200/90 leading-tight">
					"Music heals<br />what words can't."
				</p>
			</div>
		</div>
	</div>

	<!-- Horizontal Mood Filter Chips -->
	<div class="relative z-10 mt-6 flex gap-2 overflow-x-auto no-scrollbar pb-1 pt-1">
		{#each moodChips as chip}
			{@const active = (activeMood === null && chip.id === null) || activeMood === chip.id}
			<button
				type="button"
				onclick={() => handleMoodClick(chip)}
				class="shrink-0 flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer {active
					? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/30 border border-pink-400/50 scale-[1.02]'
					: 'border border-white/10 bg-white/6 text-muted-foreground hover:bg-white/12 hover:text-foreground hover:border-white/20 active:scale-95'}"
			>
				<span>{chip.icon}</span>
				<span>{chip.label}</span>
			</button>
		{/each}
	</div>
</div>
