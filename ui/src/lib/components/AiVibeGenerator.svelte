<script lang="ts">
	import { fade } from 'svelte/transition';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		SparklesIcon,
		Loading03Icon,
		FlashIcon,
		AudioWave02Icon
	} from '@hugeicons/core-free-icons';
	import aiMascot from '$lib/assets/ai_mascot.svg';
	import { Button } from '$lib/components/ui/button';
	import { aiAgent } from '$lib/aiAgent';
	import { playback, toast } from '$lib/player.svelte';
	import * as api from '$lib/api';
	import type { SongItem } from '$lib/api';

	let customVibe = $state('');
	let generating = $state(false);
	let generatedMix = $state<SongItem[]>([]);
	let activeVibeName = $state('');

	const vibePresets = [
		{ label: '🌧️ Monsoon Hindi Acoustic', prompt: 'Monsoon rainy day Hindi acoustic & soulful Bollywood melodies' },
		{ label: '🚗 Midnight Neon Drive', prompt: 'Synthwave, retro electro, and chill phonk for a late night neon drive' },
		{ label: '☕ Cozy Coffeehouse Lofi', prompt: 'Warm relaxing lofi hip hop and acoustic coffeehouse instrumentals' },
		{ label: '🔥 Gym Energy Phonk', prompt: 'Aggressive workout gym phonk, high BPM electronic and hype tracks' },
		{ label: '☀️ 90s Bollywood Gold', prompt: 'Classic evergreen 90s Bollywood romantic hits by Kumar Sanu, Alka Yagnik, Udit Narayan' },
		{ label: '🌙 Late Night Deep Focus', prompt: 'Calm ambient electronic and peaceful downtempo for deep work and coding' }
	];

	async function handleGenerate(vibeText: string) {
		const prompt = vibeText.trim();
		if (!prompt || generating) return;

		generating = true;
		activeVibeName = prompt;
		toast(`Aura AI DJ: Crafting "${prompt.slice(0, 24)}..." mix`);
		try {
			const tracks = await aiAgent.generateVibeMix(prompt);
			if (tracks.length > 0) {
				generatedMix = tracks;
				api.playPlaylist(tracks, 0, undefined, `Aura AI: ${prompt.slice(0, 30)}`, false);
				toast.success(`Playing AI Vibe Mix (${tracks.length} songs)!`);
			} else {
				toast.error('Could not find matching tracks. Please try another vibe prompt.');
			}
		} catch (e: any) {
			toast.error(e?.message || 'Failed to generate AI vibe mix');
		} finally {
			generating = false;
		}
	}
</script>

<div class="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-violet-900/25 to-pink-950/30 p-6 sm:p-7 backdrop-blur-3xl shadow-2xl select-none">
	<!-- Holographic Glow Lights -->
	<div class="pointer-events-none absolute -right-12 -top-12 h-60 w-60 rounded-full bg-purple-500/25 blur-3xl"></div>
	<div class="pointer-events-none absolute -left-12 -bottom-12 h-60 w-60 rounded-full bg-pink-500/25 blur-3xl"></div>

	<div class="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
		<!-- Left: Heading + Mascot + Description + Presets + Input -->
		<div class="flex-1 space-y-4 w-full">
			<!-- Station Header -->
			<div class="flex items-center gap-3">
				<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30">
					<HugeiconsIcon icon={SparklesIcon} size={20} class="animate-pulse" />
				</div>
				<div>
					<div class="flex items-center gap-2">
						<h2 class="text-lg sm:text-xl font-extrabold tracking-tight text-white">Aura AI Vibe Station</h2>
						<span class="inline-flex items-center gap-1 rounded-full bg-pink-500/20 px-2.5 py-0.5 text-[10px] font-bold text-pink-400 border border-pink-500/30 shadow-sm">
							⚡ Smart DJ
						</span>
					</div>
					<p class="text-xs text-muted-foreground mt-0.5">
						Type any mood or choose a preset to generate and play a custom AI mix
					</p>
				</div>
			</div>

			<!-- Preset Mood Pills -->
			<div class="flex flex-wrap gap-2 pt-1">
				{#each vibePresets as v}
					<button
						onclick={() => handleGenerate(v.prompt)}
						disabled={generating}
						class="shrink-0 rounded-full border border-white/10 bg-white/6 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition-all duration-200 hover:border-pink-500/50 hover:bg-pink-500/15 hover:text-white active:scale-95 disabled:opacity-50 {activeVibeName === v.prompt ? 'border-pink-500 bg-pink-500/25 text-pink-300 font-bold shadow-md' : ''}"
					>
						{v.label}
					</button>
				{/each}
			</div>

			<!-- Prompt Input Bar with Generate Button -->
			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleGenerate(customVibe);
				}}
				class="flex flex-col sm:flex-row items-center gap-2 pt-1"
			>
				<div class="relative w-full flex-1">
					<input
						type="text"
						bind:value={customVibe}
						placeholder="Enter your own vibe (e.g: 'Chill Hindi acoustic indie', 'Cyberpunk workout')..."
						disabled={generating}
						class="w-full h-11 rounded-full bg-black/40 border border-white/12 px-4 text-xs sm:text-sm text-white placeholder:text-muted-foreground/70 focus:outline-none focus:border-pink-500/60 focus:bg-black/60 transition-all shadow-inner"
					/>
				</div>
				<button
					type="submit"
					disabled={generating || !customVibe.trim()}
					class="w-full sm:w-auto h-11 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 px-6 text-xs sm:text-sm font-bold text-white shadow-lg shadow-pink-500/30 hover:scale-[1.03] active:scale-95 transition-all cursor-pointer disabled:opacity-50 shrink-0"
				>
					{#if generating}
						<HugeiconsIcon icon={Loading03Icon} size={17} class="animate-spin" />
						<span>Generating...</span>
					{:else}
						<HugeiconsIcon icon={FlashIcon} size={17} fill="currentColor" />
						<span>Generate & Play</span>
					{/if}
				</button>
			</form>
		</div>

		<!-- Right: 3D Cute AI Robot Mascot with Neon Headphones + Wave graphic -->
		<div class="hidden lg:flex items-center justify-center shrink-0 pr-4">
			<div class="relative flex items-center justify-center">
				<!-- Audio Wave Graphic Graphic -->
				<div class="absolute -left-20 top-1/2 -translate-y-1/2 opacity-40 text-pink-400">
					<svg width="80" height="40" viewBox="0 0 80 40" fill="none">
						<path d="M0 20 Q 20 5, 40 20 T 80 20" stroke="currentColor" stroke-width="2" fill="none" class="animate-pulse" />
					</svg>
				</div>

				<!-- Mascot Avatar -->
				<div class="relative h-32 w-32 drop-shadow-[0_0_24px_rgba(255,42,122,0.4)] transition-transform duration-500 hover:scale-105">
					<img src={aiMascot} alt="Aura AI Mascot" class="h-full w-full object-contain" />
				</div>
			</div>
		</div>
	</div>
</div>
