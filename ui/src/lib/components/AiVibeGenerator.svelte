<script lang="ts">
	import { fade } from 'svelte/transition';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		AiMagicIcon,
		PlayIcon,
		SparklesIcon,
		Loading03Icon,
		FlashIcon,
		MusicNote01Icon
	} from '@hugeicons/core-free-icons';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
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
		{ label: '🌟 90s Bollywood Gold', prompt: 'Classic evergreen 90s Bollywood romantic hits by Kumar Sanu, Alka Yagnik, Udit Narayan' },
		{ label: '🌙 Late Night Deep Focus', prompt: 'Calm ambient electronic and peaceful downtempo for deep work and coding' }
	];

	async function handleGenerate(vibeText: string) {
		const prompt = vibeText.trim();
		if (!prompt || generating) return;

		generating = true;
		activeVibeName = prompt;
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

<div class="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-card/90 via-primary/10 to-purple-900/20 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
	<!-- Ambient Background Glow -->
	<div class="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl"></div>
	<div class="pointer-events-none absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl"></div>

	<div class="relative z-10 space-y-4">
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
			<div class="flex items-center gap-3">
				<div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-purple-500 text-primary-foreground shadow-lg shadow-primary/25">
					<HugeiconsIcon icon={AiMagicIcon} class="h-5 w-5" />
				</div>
				<div>
					<div class="flex items-center gap-2">
						<h2 class="text-base sm:text-lg font-bold tracking-tight text-foreground">Aura AI Vibe Station</h2>
						<span class="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/25">
							<HugeiconsIcon icon={SparklesIcon} class="h-3 w-3" /> Smart DJ
						</span>
					</div>
					<p class="text-xs text-muted-foreground">Type any mood or choose a preset to generate and play a custom AI mix</p>
				</div>
			</div>
		</div>

		<!-- Quick Vibe Presets -->
		<div class="flex flex-wrap gap-2 pt-1">
			{#each vibePresets as v}
				<button
					onclick={() => handleGenerate(v.prompt)}
					disabled={generating}
					class="shrink-0 rounded-xl border border-border/60 bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-200 hover:border-primary/50 hover:bg-primary/10 hover:text-foreground active:scale-95 disabled:opacity-50 {activeVibeName === v.prompt ? 'border-primary bg-primary/20 text-primary font-semibold' : ''}"
				>
					{v.label}
				</button>
			{/each}
		</div>

		<!-- Custom Prompt Input -->
		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleGenerate(customVibe);
			}}
			class="flex items-center gap-2 pt-1"
		>
			<div class="relative flex-1">
				<Input
					bind:value={customVibe}
					placeholder="Enter your own vibe (e.g. 'Chill Hindi acoustic indie for coding', 'Cyberpunk workout')..."
					disabled={generating}
					class="h-10 rounded-xl bg-background/70 text-xs sm:text-sm border-border/60 focus-visible:ring-primary pl-3 pr-8"
				/>
			</div>
			<Button
				type="submit"
				disabled={generating || !customVibe.trim()}
				size="sm"
				class="h-10 gap-1.5 rounded-xl font-medium shadow-md shrink-0 px-4"
			>
				{#if generating}
					<HugeiconsIcon icon={Loading03Icon} class="h-4 w-4 animate-spin" />
					<span>Generating...</span>
				{:else}
					<HugeiconsIcon icon={FlashIcon} class="h-4 w-4 fill-current" />
					<span>Generate & Play</span>
				{/if}
			</Button>
		</form>
	</div>
</div>
