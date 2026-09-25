<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { SparklesIcon } from '@hugeicons/core-free-icons';
	import heroGirl from '$lib/assets/aura_hero_girl.jpg';
	import { auth, playback, ui } from '$lib/player.svelte';
	import { webPlayer } from '$lib/webplayer';
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

	let heroCanvas: HTMLCanvasElement | null = $state(null);

	onMount(() => {
		if (!heroCanvas) return;
		const ctx = heroCanvas.getContext('2d');
		if (!ctx) return;

		let animId: number;
		let w = (heroCanvas.width = heroCanvas.parentElement?.clientWidth || 800);
		let h = (heroCanvas.height = heroCanvas.parentElement?.clientHeight || 320);

		const resize = () => {
			if (!heroCanvas || !heroCanvas.parentElement) return;
			w = heroCanvas.width = heroCanvas.parentElement.clientWidth;
			h = heroCanvas.height = heroCanvas.parentElement.clientHeight;
		};
		window.addEventListener('resize', resize);

		const particles: {
			x: number;
			y: number;
			size: number;
			color: string;
			alpha: number;
			speedX: number;
			speedY: number;
			twinkle: number;
		}[] = [];

		const colors = ['#ff0a78', '#f43f5e', '#a855f7', '#00f5ff', '#ffffff', '#fef08a'];

		for (let i = 0; i < 45; i++) {
			particles.push({
				x: Math.random() * w,
				y: Math.random() * h,
				size: Math.random() * 2.2 + 0.8,
				color: colors[Math.floor(Math.random() * colors.length)],
				alpha: Math.random() * 0.7 + 0.2,
				speedX: (Math.random() - 0.5) * 0.4 + 0.2,
				speedY: -Math.random() * 0.45 - 0.1,
				twinkle: Math.random() * 0.04 + 0.02
			});
		}

		let tick = 0;
		const render = () => {
			tick++;
			ctx.clearRect(0, 0, w, h);

			const isPlaying = !playback.paused && !!playback.now;
			const metrics = webPlayer.getAudioMetrics();
			const boost = isPlaying ? 1 + (metrics.bass / 255) * 0.5 : 1;

			for (const p of particles) {
				p.x += p.speedX * boost;
				p.y += p.speedY * boost;

				if (p.y < 0) {
					p.y = h;
					p.x = Math.random() * w;
				}
				if (p.x > w) p.x = 0;
				if (p.x < 0) p.x = w;

				const curAlpha = Math.max(0.1, Math.min(1, p.alpha + Math.sin(tick * p.twinkle) * 0.35));

				ctx.fillStyle = p.color;
				ctx.globalAlpha = curAlpha;
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.size * (isPlaying ? 1.15 : 1), 0, Math.PI * 2);
				ctx.fill();

				// Neon glow
				if (p.size > 1.6) {
					ctx.strokeStyle = p.color;
					ctx.lineWidth = 0.5;
					ctx.beginPath();
					ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
					ctx.stroke();
				}
			}
			ctx.globalAlpha = 1.0;

			animId = requestAnimationFrame(render);
		};
		render();

		return () => {
			cancelAnimationFrame(animId);
			window.removeEventListener('resize', resize);
		};
	});
</script>

<div class="relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-gradient-to-r from-white via-pink-50/60 to-purple-50/70 dark:from-[#000000] dark:via-[#080812] dark:to-[#0f0818] p-6 sm:p-8 shadow-sm dark:shadow-[0_20px_50px_rgba(0,0,0,0.9)] mb-8 select-none backdrop-blur-3xl group">
	<!-- Dynamic Canvas Particles Layer Inside Hero Banner -->
	<canvas bind:this={heroCanvas} class="pointer-events-none absolute inset-0 z-0 h-full w-full"></canvas>

	<!-- Cosmic Nebula Background Ambient Glow -->
	<div class="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-pink-500/10 dark:bg-pink-500/20 blur-3xl animate-pulse"></div>
	<div class="pointer-events-none absolute -left-16 -bottom-16 h-80 w-80 rounded-full bg-purple-500/10 dark:bg-purple-600/15 blur-3xl"></div>
	<div class="pointer-events-none absolute left-1/3 top-1/4 h-64 w-64 rounded-full bg-cyan-500/10 dark:bg-cyan-500/10 blur-3xl"></div>

	<!-- Seamless Hero Girl Artwork Background Overlay -->
	<div class="pointer-events-none absolute right-0 top-0 bottom-0 w-full sm:w-3/5 lg:w-1/2 overflow-hidden opacity-25 dark:opacity-85 mix-blend-multiply dark:mix-blend-screen transition-transform duration-1000 group-hover:scale-102">
		<img
			src={heroGirl}
			alt="Aura Girl with Headphones"
			class="h-full w-full object-cover object-right"
		/>
		<div class="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-[#000000] dark:via-[#000000]/70 dark:to-transparent"></div>
		<div class="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent dark:from-[#000000]/90 dark:via-transparent dark:to-transparent"></div>
	</div>

	<div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
		<!-- Left: Big Greeting + Subtitle -->
		<div class="flex-1 space-y-2 max-w-lg">
			<div class="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs font-bold text-pink-600 dark:text-pink-400 backdrop-blur-md shadow-[0_0_12px_rgba(255,42,122,0.2)]">
				<span class="flex h-2 w-2 relative">
					<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
					<span class="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
				</span>
				<span class="tracking-wide uppercase text-[10px]">Aura Studio • 320kbps Lossless Audio</span>
			</div>
			<h2 class="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white dark:drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
				{prefix} <span class="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 dark:from-pink-400 dark:via-fuchsia-400 dark:to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,42,122,0.4)]">{part}</span>
			</h2>
			<p class="text-sm sm:text-base text-slate-600 dark:text-white/80 font-medium tracking-wide">
				What's your vibe today? Stream high-fidelity music, sing along with synchronized lyrics, and explore AI curated mixes.
			</p>
		</div>

		<!-- Right: Floating Script Quote -->
		<div class="relative hidden sm:flex items-center gap-3 shrink-0 pr-4">
			<p class="font-serif italic text-base sm:text-lg lg:text-xl text-pink-600 dark:text-pink-300 drop-shadow-[0_0_12px_rgba(255,42,122,0.4)] leading-tight font-semibold tracking-wide">
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
					: 'bg-white/80 dark:bg-white/6 border border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-white/85 hover:text-pink-600 dark:hover:text-white hover:border-pink-500/40 hover:bg-pink-50/60 dark:hover:bg-pink-500/15 shadow-sm active:scale-95'}"
			>
				<span class="text-sm">{chip.icon}</span>
				<span class="font-medium tracking-wide">{chip.label}</span>
			</button>
		{/each}
	</div>
</div>
