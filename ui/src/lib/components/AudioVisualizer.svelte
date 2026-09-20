<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { playback, audioFx } from '$lib/player.svelte';
	import { webPlayer } from '$lib/webplayer';

	let { barsCount = 12, height = 24, class: className = '' }: { barsCount?: number; height?: number; class?: string } = $props();

	let levels = $state<number[]>([]);
	let animId: number | null = null;

	$effect(() => {
		levels = Array(barsCount).fill(12);
	});

	function tick() {
		if (!playback.paused && playback.now && audioFx.visualizerEnabled) {
			const data = webPlayer.getVisualizerData();
			const count = barsCount || 12;
			const step = Math.max(1, Math.floor(data.length / count));
			const newLevels: number[] = [];
			for (let i = 0; i < count; i++) {
				const val = data[i * step] || 0;
				// map 0-255 to percentage 10% - 100%
				const pct = Math.max(12, Math.min(100, Math.floor((val / 255) * 100)));
				newLevels.push(pct);
			}
			levels = newLevels;
		} else {
			levels = Array(barsCount || 12).fill(12);
		}
		animId = requestAnimationFrame(tick);
	}

	onMount(() => {
		animId = requestAnimationFrame(tick);
	});

	onDestroy(() => {
		if (animId) cancelAnimationFrame(animId);
	});
</script>

<div class="flex items-end gap-[2px] {className}" style="height: {height}px;">
	{#each levels as lvl, i (i)}
		<div
			class="w-[3px] rounded-full bg-primary transition-all duration-75"
			style="height: {lvl}%; opacity: {0.4 + (lvl / 100) * 0.6};"
		></div>
	{/each}
</div>
