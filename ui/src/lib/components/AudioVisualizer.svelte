<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { playback, audioFx } from '$lib/player.svelte';
	import { webPlayer } from '$lib/webplayer';

	let { barsCount = 6, height = 16, class: className = '' }: { barsCount?: number; height?: number; class?: string } = $props();

	let containerEl: HTMLDivElement | null = $state(null);
	let animId: number | null = null;
	let lastTime = 0;

	function tick(now: number) {
		// Throttle visualizer to ~30 FPS to keep CPU usage at 0%
		if (now - lastTime > 32) {
			lastTime = now;
			if (containerEl && !playback.paused && playback.now && audioFx.visualizerEnabled) {
				const data = webPlayer.getVisualizerData();
				const count = barsCount || 6;
				const step = Math.max(1, Math.floor(data.length / count));
				const children = containerEl.children;
				for (let i = 0; i < count && i < children.length; i++) {
					const val = data[i * step] || 0;
					const pct = Math.max(15, Math.min(100, Math.floor((val / 255) * 100)));
					const bar = children[i] as HTMLElement;
					if (bar) {
						bar.style.height = `${pct}%`;
						bar.style.opacity = `${0.4 + (pct / 100) * 0.6}`;
					}
				}
			} else if (containerEl) {
				const children = containerEl.children;
				for (let i = 0; i < children.length; i++) {
					const bar = children[i] as HTMLElement;
					if (bar) {
						bar.style.height = '15%';
						bar.style.opacity = '0.4';
					}
				}
			}
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

<div bind:this={containerEl} class="flex items-end gap-[2px] {className}" style="height: {height}px;" aria-hidden="true">
	{#each Array(barsCount || 6) as _, i (i)}
		<div
			class="w-[3px] rounded-full bg-primary transition-all duration-100 ease-out"
			style="height: 15%; opacity: 0.4;"
		></div>
	{/each}
</div>
