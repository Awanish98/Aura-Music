<script lang="ts">
	import { fade } from 'svelte/transition';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		AiMagicIcon,
		SparklesIcon,
		Loading03Icon,
		Refresh03Icon,
		MusicNote01Icon
	} from '@hugeicons/core-free-icons';
	import { Button } from '$lib/components/ui/button';
	import { aiAgent } from '$lib/aiAgent';
	import { playback } from '$lib/player.svelte';

	let storyText = $state<string | null>(null);
	let loading = $state(false);
	let lastLoadedSong = $state('');

	async function loadStory() {
		if (!playback.now || loading) return;
		const key = `${playback.now.title} ${playback.now.artists}`;
		if (storyText && lastLoadedSong === key) return;

		loading = true;
		lastLoadedSong = key;
		storyText = null;

		try {
			const text = await aiAgent.explainSong(playback.now.title, playback.now.artists);
			storyText = text;
		} catch (e) {
			storyText = 'Unable to generate song story right now. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="rounded-2xl border border-primary/20 bg-card/60 p-4 backdrop-blur-md shadow-lg space-y-3">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<div class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
				<HugeiconsIcon icon={AiMagicIcon} class="h-4 w-4" />
			</div>
			<span class="text-xs font-bold uppercase tracking-wider text-foreground">AI Song Story & Meaning</span>
		</div>

		<Button
			variant="ghost"
			size="xs"
			onclick={loadStory}
			disabled={loading || !playback.now}
			class="h-7 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10 rounded-lg"
		>
			{#if loading}
				<HugeiconsIcon icon={Loading03Icon} class="h-3.5 w-3.5 animate-spin" />
				<span>Analyzing...</span>
			{:else}
				<HugeiconsIcon icon={SparklesIcon} class="h-3.5 w-3.5" />
				<span>{storyText ? 'Regenerate' : 'Analyze Song'}</span>
			{/if}
		</Button>
	</div>

	{#if storyText}
		<div in:fade={{ duration: 200 }} class="rounded-xl bg-background/50 p-3 text-xs leading-relaxed text-muted-foreground border border-border/40">
			<p class="whitespace-pre-wrap">{storyText}</p>
		</div>
	{:else if !loading}
		<p class="text-[11px] text-muted-foreground/80 italic">
			Tap "Analyze Song" to generate an intelligent backstory, poetic interpretation, and musical breakdown of this track with Aura AI.
		</p>
	{/if}
</div>
