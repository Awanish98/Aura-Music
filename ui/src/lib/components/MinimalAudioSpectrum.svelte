<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { playback, audioFx } from '$lib/player.svelte';
	import { webPlayer } from '$lib/webplayer';

	let { height = 120, barsCount = 24, class: className = '' }: { height?: number; barsCount?: number; class?: string } = $props();

	let canvasEl: HTMLCanvasElement | null = $state(null);
	let animId: number | null = null;

	onMount(() => {
		if (!canvasEl) return;
		const ctx = canvasEl.getContext('2d', { alpha: true });
		if (!ctx) return;

		const count = barsCount || 24;
		const smoothedHeights: number[] = new Array(count).fill(0);
		const peakHeights: number[] = new Array(count).fill(0);
		const peakVels: number[] = new Array(count).fill(0);

		let lastW = 0;
		let lastH = 0;

		const resize = () => {
			if (!canvasEl) return;
			const rect = canvasEl.getBoundingClientRect();
			const dpr = Math.min(2, window.devicePixelRatio || 1);
			const w = Math.floor(rect.width);
			const h = Math.floor(rect.height);

			if (w !== lastW || h !== lastH) {
				lastW = w;
				lastH = h;
				canvasEl.width = w * dpr;
				canvasEl.height = h * dpr;
				ctx.scale(dpr, dpr);
			}
		};

		resize();
		window.addEventListener('resize', resize);

		function render() {
			if (!canvasEl || !ctx) return;
			const dpr = Math.min(2, window.devicePixelRatio || 1);
			const w = canvasEl.width / dpr;
			const h = canvasEl.height / dpr;

			ctx.clearRect(0, 0, w, h);

			const isPlaying = !playback.paused && !!playback.now;
			const metrics = isPlaying ? webPlayer.getAudioMetrics() : {
				bass: 0, mid: 0, treble: 0, energy: 0, beat: false,
				freqData: new Uint8Array(64),
				timeData: new Uint8Array(64)
			};

			const freq = metrics.freqData;
			const totalBars = count;
			const barWidth = Math.max(3, Math.floor((w - (totalBars - 1) * 3) / totalBars));
			const totalWidth = totalBars * barWidth + (totalBars - 1) * 3;
			const startX = Math.max(0, (w - totalWidth) / 2);
			const baseY = h * 0.76;
			const maxH = h * 0.65;

			// Base glow line
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(startX - 6, baseY);
			ctx.lineTo(startX + totalWidth + 6, baseY);
			ctx.stroke();

			for (let i = 0; i < totalBars; i++) {
				const x = startX + i * (barWidth + 3);
				const bin = Math.min(63, Math.floor(Math.pow(i / totalBars, 1.3) * 44));
				const val = isPlaying ? (freq[bin] || 0) / 255 : 0.04;
				const targetH = Math.max(3, val * maxH * (audioFx.visualizerSensitivity || 1.1));

				// Smooth spring interpolation
				smoothedHeights[i] += (targetH - smoothedHeights[i]) * 0.28;
				const curH = smoothedHeights[i];

				// Peak indicator physics
				if (curH >= peakHeights[i]) {
					peakHeights[i] = curH;
					peakVels[i] = 0;
				} else {
					peakVels[i] += 0.28;
					peakHeights[i] = Math.max(3, peakHeights[i] - peakVels[i]);
				}

				// Bar Gradient
				const grad = ctx.createLinearGradient(x, baseY, x, baseY - curH);
				grad.addColorStop(0, 'rgba(139, 92, 246, 0.7)'); // Violet
				grad.addColorStop(0.5, 'rgba(255, 10, 120, 0.9)'); // Neon Pink
				grad.addColorStop(1, 'rgba(34, 211, 238, 1)'); // Cyan

				ctx.fillStyle = grad;
				ctx.beginPath();
				ctx.roundRect(x, baseY - curH, barWidth, curH, [2, 2, 0.5, 0.5]);
				ctx.fill();

				// Floating Peak Cap
				ctx.fillStyle = '#ffffff';
				ctx.beginPath();
				ctx.roundRect(x, baseY - peakHeights[i] - 3, barWidth, 1.5, [1, 1, 1, 1]);
				ctx.fill();

				// Floor Reflection
				const refGrad = ctx.createLinearGradient(x, baseY, x, baseY + curH * 0.28);
				refGrad.addColorStop(0, 'rgba(255, 10, 120, 0.25)');
				refGrad.addColorStop(1, 'transparent');
				ctx.fillStyle = refGrad;
				ctx.beginPath();
				ctx.roundRect(x, baseY + 1, barWidth, curH * 0.25, [0.5, 0.5, 2, 2]);
				ctx.fill();
			}

			animId = requestAnimationFrame(render);
		}

		animId = requestAnimationFrame(render);

		return () => {
			if (animId) cancelAnimationFrame(animId);
			window.removeEventListener('resize', resize);
		};
	});

	onDestroy(() => {
		if (animId) cancelAnimationFrame(animId);
	});
</script>

<div class="relative w-full overflow-hidden {className}" style="height: {height}px;">
	<canvas bind:this={canvasEl} class="absolute inset-0 h-full w-full object-cover touch-none"></canvas>
</div>
