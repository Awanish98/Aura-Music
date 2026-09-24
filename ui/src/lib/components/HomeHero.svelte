<script lang="ts">
	import { goto } from '$app/navigation';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { SparklesIcon } from '@hugeicons/core-free-icons';
	import heroGirl from '$lib/assets/aura_hero_girl.jpg';
	import { auth, playback, ui } from '$lib/player.svelte';
	import { t } from '$lib/i18n.svelte';

	let { onSelectMood, activeMood }: { onSelectMood?: (mood: string | null) => void; activeMood?: string | null } = $props();

	// Dynamic Daypart Greeting
	const hour = new Date().getHours();
	const prefix = 'Good';
	const part =
		hour < 5
			? 'night'
			: hour < 12
				? 'morning'
				: hour < 18
					? 'afternoon'
					: 'evening';

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

<div class="relative overflow-hidden rounded-3xl border border-white/10 dark:border-purple-500/30 bg-gradient-to-r from-[#0c0e1e]/95 via-[#151028]/90 to-[#220d2c]/85 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-8 select-none backdrop-blur-3xl">
	<!-- Cosmic Nebula Background Ambient Glow -->
	<div class="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-pink-500/25 blur-3xl animate-pulse"></div>
	<div class="pointer-events-none absolute -left-16 -bottom-16 h-80 w-80 rounded-full bg-purple-600/20 blur-3xl"></div>
	<div class="pointer-events-none absolute left-1/3 top-1/4 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl"></div>

	<!-- Seamless Hero Girl Artwork Background Overlay -->
	<div class="pointer-events-none absolute right-0 top-0 bottom-0 w-full sm:w-3/5 lg:w-1/2 overflow-hidden opacity-40 dark:opacity-85 mix-blend-screen">
		<img
			src={heroGirl}
			alt="Aura Girl with Headphones"
			class="h-full w-full object-cover object-right"
		/>
		<div class="absolute inset-0 bg-gradient-to-r from-[#0c0e1e] via-[#0c0e1e]/60 to-transparent"></div>
		<div class="absolute inset-0 bg-gradient-to-t from-[#0c0e1e]/80 via-transparent to-transparent"></div>
	</div>

	<div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
		<!-- Left: Big Greeting + Subtitle -->
		<div class="flex-1 space-y-1.5 max-w-lg">
			<h2 class="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
				{prefix} <span class="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,42,122,0.6)]">{part}</span>
			</h2>
			<p class="text-sm sm:text-base text-purple-200/90 font-medium tracking-wide">
				What's your vibe today? Stream high-fidelity music and explore curated charts.
			</p>
		</div>

		<!-- Right: Floating Script Quote -->
		<div class="relative hidden sm:flex items-center gap-3 shrink-0 pr-4">
			<p class="font-serif italic text-base sm:text-lg lg:text-xl text-pink-300 drop-shadow-[0_0_12px_rgba(255,42,122,0.8)] leading-tight font-semibold tracking-wide">
				"Music heals<br /><span class="ml-4">what words can't."</span>
			</p>
		</div>
	</div>

	<!-- Horizontal Mood Filter Chips with Liquid Glass Effect -->
	<div class="relative z-10 mt-7 flex gap-2.5 overflow-x-auto no-scrollbar pb-1 pt-1">
		{#each moodChips as chip}
			{@const active = (activeMood === null && chip.id === null) || activeMood === chip.id}
			<button
				type="button"
				onclick={() => handleMoodClick(chip)}
				class="shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer apple-spring-tap {active
					? 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white shadow-xl shadow-pink-500/40 border border-pink-400/60 scale-[1.03] drop-shadow-[0_0_10px_rgba(255,42,122,0.6)]'
					: 'liquid-glass-fx text-foreground/85 hover:text-white hover:border-pink-500/40 hover:bg-pink-500/10 apple-spring-hover active:scale-95'}"
			>
				<span class="text-sm">{chip.icon}</span>
				<span class="font-medium tracking-wide">{chip.label}</span>
			</button>
		{/each}
	</div>
</div>
