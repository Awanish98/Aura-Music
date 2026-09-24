<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { playback, audioFx } from '$lib/player.svelte';
	import { webPlayer } from '$lib/webplayer';

	let { barsCount = 6, height = 16, class: className = '' }: { barsCount?: number; height?: number; class?: string } = $props();

	let containerEl: HTMLDivElement | null = $state(null);
	let animId: number | null = null;
	let lastTime = 0;

	function tick(now: number) {
		if (now - lastTime > 32) {
			lastTime = now;
			if (containerEl && !playback.paused && playback.now && audioFx.visualizerEnabled) {
				const data = webPlayer.getVisualizerData();
				const count = barsCount || 6;
				const step = Math.max(1, Math.floor(data.length / count));
				const children = containerEl.children;
				for (let i = 0; i < count && i < children.length; i++) {
					const val = data[i * step] || 0;
					const pct = Math.max(18, Math.min(100, Math.floor((val / 255) * 100)));
					const bar = children[i] as HTMLElement;
					if (bar) {
						bar.style.height = `${pct}%`;
						bar.style.opacity = `${0.5 + (pct / 100) * 0.5}`;
					}
				}
			} else if (containerEl) {
				const children = containerEl.children;
				for (let i = 0; i < children.length; i++) {
					const bar = children[i] as HTMLElement;
					if (bar) {
						bar.style.height = '18%';
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
			class="w-[2.5px] rounded-full bg-gradient-to-t from-pink-500 to-cyan-400 transition-all duration-100 ease-out"
			style="height: 18%; opacity: 0.4;"
		></div>
	{/each}
</div>
