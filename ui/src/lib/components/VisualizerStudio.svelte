<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		PlayIcon,
		PauseIcon,
		PreviousIcon,
		NextIcon,
		ShuffleIcon,
		RepeatIcon,
		RepeatOne01Icon,
		Maximize01Icon,
		Minimize01Icon,
		Cancel01Icon,
		AudioWave01Icon,
		Settings01Icon
	} from '@hugeicons/core-free-icons';
	import {
		playback,
		audioFx,
		cycleRepeat,
		setVisualizerPreset,
		setVisualizerTheme,
		type VisualizerPreset,
		type VisualizerColorTheme
	} from '$lib/player.svelte';
	import * as api from '$lib/api';
	import { webPlayer } from '$lib/webplayer';
	import { thumb } from '$lib/thumb';
	import Marquee from './Marquee.svelte';

	let {
		inline = false,
		onClose = () => (audioFx.visualizerModalOpen = false)
	}: {
		inline?: boolean;
		onClose?: () => void;
	} = $props();

	let canvasEl: HTMLCanvasElement | null = $state(null);
	let animId: number | null = null;
	let showControls = $state(true);
	let hideTimer: ReturnType<typeof setTimeout> | null = null;
	let isFullscreen = $state(false);
	let studioContainer: HTMLDivElement | null = $state(null);

	// Minimalist Ultra-Premium Presets
	const presets: { id: VisualizerPreset; label: string; icon: string; desc: string }[] = [
		{ id: 'silk_waves', label: 'Silk Waves', icon: '🌊', desc: 'Fluid harmonic silk curves with soft gradient glow' },
		{ id: 'minimal_bars', label: 'Studio Glass', icon: '📊', desc: 'Precision rounded equalizer bars with floating peak caps' },
		{ id: 'radial_halo', label: 'Radial Halo', icon: '🪐', desc: 'Sleek circular spectrum with pulsing orbital glow' },
		{ id: 'laser_scope', label: 'Laser Scope', icon: '⚡', desc: 'High-precision 1.5px laser oscilloscope waveform' },
		{ id: 'cosmic_aura', label: 'Stardust Aura', icon: '✨', desc: 'Ambient breathing nebula with gentle floating motes' }
	];

	// Minimalist Luxury Color Themes
	const themes: { id: VisualizerColorTheme; label: string; primary: string; secondary: string }[] = [
		{ id: 'cyberpunk', label: 'Aura Neon', primary: '#ff0a78', secondary: '#22d3ee' },
		{ id: 'violet', label: 'Cyber Violet', primary: '#8b5cf6', secondary: '#3b82f6' },
		{ id: 'sunset', label: 'Sunset Flare', primary: '#ff7a45', secondary: '#ff2a7a' },
		{ id: 'emerald', label: 'Emerald Glow', primary: '#10b981', secondary: '#06b6d4' },
		{ id: 'rainbow', label: 'Platinum White', primary: '#ffffff', secondary: '#a5b4fc' },
		{ id: 'artwork', label: 'Album Sync', primary: 'var(--primary, #ff0a78)', secondary: '#8b5cf6' }
	];

	// Star particles for Cosmic Aura
	interface AmbientParticle {
		x: number;
		y: number;
		size: number;
		speedY: number;
		speedX: number;
		opacity: number;
		baseAlpha: number;
		pulsePhase: number;
	}
	let particles: AmbientParticle[] = [];

	// Equalizer smoothed bars and peaks
	const BAR_COUNT = 32;
	let smoothedHeights: number[] = new Array(BAR_COUNT).fill(0);
	let peakHeights: number[] = new Array(BAR_COUNT).fill(0);
	let peakVelocities: number[] = new Array(BAR_COUNT).fill(0);

	// Smoothing for waves
	let smoothedBass = 0;
	let smoothedEnergy = 0;
	let wavePhase = 0;
	let haloAngle = 0;

	function resetParticles(w: number, h: number) {
		particles = [];
		const count = Math.min(80, Math.floor((w * h) / 12000));
		for (let i = 0; i < count; i++) {
			particles.push({
				x: Math.random() * w,
				y: Math.random() * h,
				size: Math.random() * 2 + 0.8,
				speedY: Math.random() * 0.4 + 0.15,
				speedX: (Math.random() - 0.5) * 0.25,
				opacity: Math.random() * 0.6 + 0.2,
				baseAlpha: Math.random() * 0.5 + 0.2,
				pulsePhase: Math.random() * Math.PI * 2
			});
		}
	}

	function toggleFullscreen() {
		if (!document.fullscreenElement) {
			studioContainer?.requestFullscreen?.().catch(() => {});
			isFullscreen = true;
		} else {
			document.exitFullscreen?.().catch(() => {});
			isFullscreen = false;
		}
	}

	function handleActivity() {
		showControls = true;
		if (hideTimer) clearTimeout(hideTimer);
		hideTimer = setTimeout(() => {
			if (!inline && !playback.paused) {
				showControls = false;
			}
		}, 4000);
	}

	const fmt = (secs: number) => {
		if (!secs || secs < 0 || !isFinite(secs) || isNaN(secs)) return '0:00';
		const t = Math.floor(secs);
		const m = Math.floor((t % 3600) / 60);
		const s = t % 60;
		return `${m}:${s.toString().padStart(2, '0')}`;
	};

	let isDragging = $state(false);
	let dragPosition = $state(0);
	const shownPosition = $derived(isDragging ? dragPosition : playback.position);

	function onSeekInput(e: Event) {
		isDragging = true;
		dragPosition = parseFloat((e.currentTarget as HTMLInputElement).value);
	}

	function onSeekCommit(e: Event) {
		isDragging = false;
		const val = parseFloat((e.currentTarget as HTMLInputElement).value);
		playback.position = val;
		playback.positionAt = performance.now();
		api.seek(val);
	}

	onMount(() => {
		if (!canvasEl) return;
		const ctx = canvasEl.getContext('2d', { alpha: false });
		if (!ctx) return;

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
				resetParticles(w, h);
			}
		};

		resize();
		window.addEventListener('resize', resize);

		let prevTime = performance.now();

		// 60FPS Minimalist Visualizer Render Engine
		function render(now: number) {
			if (!canvasEl || !ctx) return;
			const dt = Math.min(0.1, (now - prevTime) / 1000);
			prevTime = now;

			const dpr = Math.min(2, window.devicePixelRatio || 1);
			const width = canvasEl.width / dpr;
			const height = canvasEl.height / dpr;
			const cx = width / 2;
			const cy = height / 2;

			// Live metrics from audio engine
			const isPlaying = !playback.paused && !!playback.now;
			const rawMetrics = isPlaying ? webPlayer.getAudioMetrics() : {
				bass: 0, mid: 0, treble: 0, energy: 0, beat: false,
				freqData: new Uint8Array(64),
				timeData: new Uint8Array(64).fill(128)
			};

			const sens = audioFx.visualizerSensitivity || 1.1;
			const targetBass = rawMetrics.bass * sens;
			const targetEnergy = rawMetrics.energy * sens;

			// Smooth exponential interpolation
			smoothedBass += (targetBass - smoothedBass) * 0.18;
			smoothedEnergy += (targetEnergy - smoothedEnergy) * 0.15;
			wavePhase += dt * (0.8 + smoothedBass * 1.5);
			haloAngle += dt * (0.2 + smoothedEnergy * 0.4);

			const freq = rawMetrics.freqData;
			const time = now / 1000;

			// Theme colors
			let c1 = '#ff0a78';
			let c2 = '#22d3ee';
			const curTheme = audioFx.visualizerTheme;

			if (curTheme === 'cyberpunk') {
				c1 = '#ff0a78';
				c2 = '#22d3ee';
			} else if (curTheme === 'violet') {
				c1 = '#8b5cf6';
				c2 = '#3b82f6';
			} else if (curTheme === 'sunset') {
				c1 = '#ff7a45';
				c2 = '#ff2a7a';
			} else if (curTheme === 'emerald') {
				c1 = '#10b981';
				c2 = '#06b6d4';
			} else if (curTheme === 'rainbow') {
				c1 = '#ffffff';
				c2 = '#818cf8';
			} else {
				c1 = '#ff0a78';
				c2 = '#8b5cf6';
			}

			// Background: Deep velvet space dark #03040a
			ctx.fillStyle = '#03040a';
			ctx.fillRect(0, 0, width, height);

			const preset = audioFx.visualizerPreset;

			// -------------------------------------------------------------
			// PRESET 1: SILK WAVES (Minimalist Fluid Silk Ribbons)
			// -------------------------------------------------------------
			if (preset === 'silk_waves' || preset === 'aurora_wave' || preset === 'mesh_grid') {
				const waveCount = 3;
				const baseCenterY = cy + height * 0.08;

				// Ambient soft background glow
				const ambientGrad = ctx.createRadialGradient(cx, baseCenterY, 20, cx, baseCenterY, Math.min(width, height) * 0.55);
				ambientGrad.addColorStop(0, `${c1}20`);
				ambientGrad.addColorStop(0.5, `${c2}10`);
				ambientGrad.addColorStop(1, 'transparent');
				ctx.fillStyle = ambientGrad;
				ctx.fillRect(0, 0, width, height);

				for (let w = waveCount - 1; w >= 0; w--) {
					const layerRatio = (w + 1) / waveCount;
					const amp = (height * 0.12 + w * 28) * (0.4 + smoothedBass * 0.9);
					const freqMod = 0.0035 + w * 0.0015;
					const speed = wavePhase * (0.9 + w * 0.4);

					ctx.save();
					ctx.beginPath();
					ctx.moveTo(0, height);

					for (let x = 0; x <= width; x += 12) {
						// Multi-frequency harmonic superposition
						const binIdx = Math.floor((x / width) * 24);
						const binVal = ((freq[binIdx] || 0) / 255) * (isPlaying ? 1 : 0.05);

						const s1 = Math.sin(x * freqMod + speed) * amp;
						const s2 = Math.sin(x * freqMod * 2.2 - speed * 0.6) * (amp * 0.35);
						const s3 = Math.cos(x * 0.008 + speed * 1.2) * (binVal * 45);

						const y = baseCenterY + s1 + s2 + s3;
						if (x === 0) ctx.lineTo(x, y);
						else ctx.lineTo(x, y);
					}

					ctx.lineTo(width, height);
					ctx.closePath();

					// Smooth translucent gradient fill
					const grad = ctx.createLinearGradient(0, baseCenterY - amp, width, height);
					grad.addColorStop(0, w === 0 ? `${c1}40` : w === 1 ? `${c2}28` : `${c1}18`);
					grad.addColorStop(0.6, `${c2}15`);
					grad.addColorStop(1, 'transparent');
					ctx.fillStyle = grad;
					ctx.fill();

					// Glowing top crest line
					ctx.strokeStyle = w === 0 ? c1 : w === 1 ? c2 : '#ffffff55';
					ctx.lineWidth = w === 0 ? 2 : 1.2;
					if (audioFx.visualizerGlow && w === 0) {
						ctx.shadowColor = c1;
						ctx.shadowBlur = 14 + smoothedBass * 16;
					}
					ctx.stroke();
					ctx.restore();
				}
			}

			// -------------------------------------------------------------
			// PRESET 2: STUDIO GLASS EQUALIZER (Minimalist Pill Bars)
			// -------------------------------------------------------------
			else if (preset === 'minimal_bars' || preset === 'neon_bars') {
				const barWidth = Math.max(4, Math.min(14, (width * 0.7) / BAR_COUNT - 4));
				const totalWidth = BAR_COUNT * (barWidth + 4);
				const startX = cx - totalWidth / 2;
				const baseY = cy + height * 0.16;
				const maxBarHeight = height * 0.42;

				// Sleek baseline
				ctx.strokeStyle = `${c2}25`;
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(startX - 24, baseY);
				ctx.lineTo(startX + totalWidth + 24, baseY);
				ctx.stroke();

				for (let i = 0; i < BAR_COUNT; i++) {
					const x = startX + i * (barWidth + 4);
					// Logarithmic frequency distribution
					const bin = Math.min(63, Math.floor(Math.pow(i / BAR_COUNT, 1.4) * 48));
					const val = isPlaying ? (freq[bin] || 0) / 255 : 0.05;

					const targetH = Math.max(4, val * maxBarHeight * sens);
					// Smooth height easing
					smoothedHeights[i] += (targetH - smoothedHeights[i]) * 0.25;
					const curH = smoothedHeights[i];

					// Peak cap gravity physics
					if (curH >= peakHeights[i]) {
						peakHeights[i] = curH;
						peakVelocities[i] = 0;
					} else {
						peakVelocities[i] += 0.35;
						peakHeights[i] = Math.max(4, peakHeights[i] - peakVelocities[i]);
					}

					// Bar vertical gradient
					const grad = ctx.createLinearGradient(x, baseY, x, baseY - curH);
					grad.addColorStop(0, `${c1}80`);
					grad.addColorStop(0.7, c1);
					grad.addColorStop(1, c2);

					ctx.fillStyle = grad;
					ctx.beginPath();
					ctx.roundRect(x, baseY - curH, barWidth, curH, [3, 3, 1, 1]);
					ctx.fill();

					// Floating peak dot
					ctx.fillStyle = '#ffffff';
					ctx.beginPath();
					ctx.roundRect(x, baseY - peakHeights[i] - 5, barWidth, 2, [1, 1, 1, 1]);
					ctx.fill();

					// Subtle floor reflection
					const refGrad = ctx.createLinearGradient(x, baseY, x, baseY + curH * 0.35);
					refGrad.addColorStop(0, `${c1}25`);
					refGrad.addColorStop(1, 'transparent');
					ctx.fillStyle = refGrad;
					ctx.beginPath();
					ctx.roundRect(x, baseY + 2, barWidth, curH * 0.3, [1, 1, 3, 3]);
					ctx.fill();
				}

				// Minimalist Frequency Scale Markers
				ctx.fillStyle = '#ffffff40';
				ctx.font = '9px monospace';
				ctx.textAlign = 'center';
				ctx.fillText('32Hz', startX + 10, baseY + 18);
				ctx.fillText('500Hz', cx, baseY + 18);
				ctx.fillText('16kHz', startX + totalWidth - 10, baseY + 18);
			}

			// -------------------------------------------------------------
			// PRESET 3: RADIAL HALO (Minimalist Circular Spectrum)
			// -------------------------------------------------------------
			else if (preset === 'radial_halo' || preset === 'radial_ring' || preset === 'quantum_sphere') {
				const baseRadius = Math.min(width, height) * 0.2 * (1 + smoothedBass * 0.15);
				const ringBars = 48;

				// Center Breathing Orb
				const coreGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, baseRadius);
				coreGrad.addColorStop(0, '#ffffff35');
				coreGrad.addColorStop(0.4, `${c1}25`);
				coreGrad.addColorStop(0.9, `${c2}08`);
				coreGrad.addColorStop(1, 'transparent');
				ctx.fillStyle = coreGrad;
				ctx.beginPath();
				ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
				ctx.fill();

				// Radiating spectrum pill bars
				for (let i = 0; i < ringBars; i++) {
					const angle = (i / ringBars) * Math.PI * 2 + haloAngle;
					// Mirror symmetry for balanced look
					const normIdx = i < ringBars / 2 ? i : ringBars - i;
					const bin = Math.min(48, Math.floor((normIdx / (ringBars / 2)) * 36));
					const val = isPlaying ? (freq[bin] || 0) / 255 : 0.05;
					const barLen = Math.max(6, val * Math.min(width, height) * 0.22 * sens);

					const x1 = cx + Math.cos(angle) * (baseRadius + 6);
					const y1 = cy + Math.sin(angle) * (baseRadius + 6);
					const x2 = cx + Math.cos(angle) * (baseRadius + 6 + barLen);
					const y2 = cy + Math.sin(angle) * (baseRadius + 6 + barLen);

					const barGrad = ctx.createLinearGradient(x1, y1, x2, y2);
					barGrad.addColorStop(0, c1);
					barGrad.addColorStop(1, c2);

					ctx.strokeStyle = barGrad;
					ctx.lineWidth = Math.max(2, (Math.PI * 2 * baseRadius) / ringBars * 0.5);
					ctx.lineCap = 'round';
					ctx.beginPath();
					ctx.moveTo(x1, y1);
					ctx.lineTo(x2, y2);
					ctx.stroke();
				}

				// Inner delicate laser ring
				ctx.strokeStyle = '#ffffff70';
				ctx.lineWidth = 1.2;
				ctx.beginPath();
				ctx.arc(cx, cy, baseRadius * 0.85, 0, Math.PI * 2);
				ctx.stroke();
			}

			// -------------------------------------------------------------
			// PRESET 4: LASER SCOPE (1.5px Laser Oscilloscope Waveform)
			// -------------------------------------------------------------
			else if (preset === 'laser_scope') {
				const timeData = rawMetrics.timeData;
				const sliceW = width / (timeData.length - 1);

				// Subtle reference dB lines
				ctx.strokeStyle = '#ffffff10';
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(0, cy - height * 0.15);
				ctx.lineTo(width, cy - height * 0.15);
				ctx.moveTo(0, cy);
				ctx.lineTo(width, cy);
				ctx.moveTo(0, cy + height * 0.15);
				ctx.lineTo(width, cy + height * 0.15);
				ctx.stroke();

				// Laser glow waveform
				ctx.save();
				if (audioFx.visualizerGlow) {
					ctx.shadowColor = c1;
					ctx.shadowBlur = 16 + smoothedBass * 18;
				}

				// Outer colored bloom line
				ctx.strokeStyle = c1;
				ctx.lineWidth = 3;
				ctx.beginPath();
				for (let i = 0; i < timeData.length; i++) {
					const v = (timeData[i] - 128) / 128;
					const x = i * sliceW;
					const y = cy + v * height * 0.25 * sens;
					if (i === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				}
				ctx.stroke();

				// Inner crisp white laser core
				ctx.shadowBlur = 0;
				ctx.strokeStyle = '#ffffff';
				ctx.lineWidth = 1.2;
				ctx.stroke();
				ctx.restore();
			}

			// -------------------------------------------------------------
			// PRESET 5: COSMIC AURA (Ambient Stardust & Breathing Nebula)
			// -------------------------------------------------------------
			else if (preset === 'cosmic_aura' || preset === 'cosmic_galaxy') {
				// Breathing Nebula Center
				const nebulaR = Math.min(width, height) * 0.35 * (1 + smoothedEnergy * 0.25);
				const nebGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, nebulaR);
				nebGrad.addColorStop(0, `${c1}35`);
				nebGrad.addColorStop(0.5, `${c2}18`);
				nebGrad.addColorStop(1, 'transparent');
				ctx.fillStyle = nebGrad;
				ctx.beginPath();
				ctx.arc(cx, cy, nebulaR, 0, Math.PI * 2);
				ctx.fill();

				// Gently floating stardust motes
				for (let i = 0; i < particles.length; i++) {
					const p = particles[i];
					p.y -= p.speedY * (1 + smoothedBass * 1.5);
					p.x += p.speedX;
					p.pulsePhase += 0.03;

					if (p.y < 0) {
						p.y = height;
						p.x = Math.random() * width;
					}
					if (p.x < 0) p.x = width;
					if (p.x > width) p.x = 0;

					const alpha = Math.max(0.1, Math.min(1, p.baseAlpha + Math.sin(p.pulsePhase) * 0.2 + (smoothedEnergy * 0.3)));
					const pSize = p.size * (1 + smoothedBass * 0.4);

					ctx.fillStyle = i % 2 === 0 ? c1 : c2;
					ctx.globalAlpha = alpha;
					ctx.beginPath();
					ctx.arc(p.x, p.y, pSize, 0, Math.PI * 2);
					ctx.fill();
				}
				ctx.globalAlpha = 1;
			}

			animId = requestAnimationFrame(render);
		}

		animId = requestAnimationFrame(render);

		return () => {
			if (animId) cancelAnimationFrame(animId);
			window.removeEventListener('resize', resize);
			if (hideTimer) clearTimeout(hideTimer);
		};
	});

	onDestroy(() => {
		if (animId) cancelAnimationFrame(animId);
	});
</script>

<!-- Minimalist Studio Container -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={studioContainer}
	class="{inline
		? 'relative h-full w-full rounded-2xl overflow-hidden'
		: 'fixed inset-0 z-[70] flex flex-col justify-between bg-[#03040a] text-white select-none overflow-hidden'}"
	transition:fade={{ duration: 250 }}
	onmousemove={handleActivity}
	ontouchstart={handleActivity}
>
	<!-- Audio Reactive 60FPS Canvas -->
	<canvas bind:this={canvasEl} class="absolute inset-0 h-full w-full object-cover touch-none"></canvas>

	<!-- Top Glass HUD Header (Minimalist Toolbar) -->
	<header
		class="relative z-10 flex flex-col gap-2 p-3 sm:p-5 transition-opacity duration-300 {showControls
			? 'opacity-100 pointer-events-auto'
			: 'opacity-0 pointer-events-none'}"
	>
		<div class="flex items-center justify-between gap-3">
			<!-- Minimalist Studio Badge -->
			<div class="flex items-center gap-2 rounded-full bg-white/[0.06] border border-white/10 px-3.5 py-1.5 backdrop-blur-xl shadow-lg">
				<HugeiconsIcon icon={AudioWave01Icon} size={16} class="text-primary animate-pulse" />
				<span class="text-xs font-bold tracking-wider text-white uppercase">Aura Studio</span>
				<span class="text-[10px] text-muted-foreground">• 60 FPS</span>
			</div>

			<!-- Preset Selector Switcher (Desktop Pills) -->
			<div class="hidden md:flex items-center gap-1 rounded-full bg-black/60 p-1 border border-white/10 backdrop-blur-xl shadow-2xl">
				{#each presets as p}
					<button
						class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all {audioFx.visualizerPreset === p.id
							? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/30'
							: 'text-muted-foreground hover:text-white hover:bg-white/10'}"
						onclick={() => setVisualizerPreset(p.id)}
						title={p.desc}
					>
						<span>{p.icon}</span>
						<span>{p.label}</span>
					</button>
				{/each}
			</div>

			<!-- Right Actions: Color Theme, Fullscreen, Close -->
			<div class="flex items-center gap-2">
				<!-- Color Theme Picker Pills -->
				<div class="flex items-center gap-1 rounded-full bg-black/60 p-1 border border-white/10 backdrop-blur-xl">
					{#each themes as th}
						<button
							class="size-5.5 rounded-full border transition-transform hover:scale-110 {audioFx.visualizerTheme === th.id
								? 'ring-2 ring-white scale-110 border-white'
								: 'border-white/20 opacity-70 hover:opacity-100'}"
							style="background: linear-gradient(135deg, {th.primary}, {th.secondary});"
							onclick={() => setVisualizerTheme(th.id)}
							title={th.label}
							aria-label={th.label}
						></button>
					{/each}
				</div>

				{#if !inline}
					<button
						class="flex size-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xl transition hover:bg-white/20 active:scale-90 cursor-pointer"
						onclick={toggleFullscreen}
						aria-label="Toggle Fullscreen"
					>
						<HugeiconsIcon icon={isFullscreen ? Minimize01Icon : Maximize01Icon} size={18} />
					</button>

					<button
						class="flex size-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xl transition hover:bg-red-500/80 active:scale-90 cursor-pointer"
						onclick={onClose}
						aria-label="Close Visualizer"
					>
						<HugeiconsIcon icon={Cancel01Icon} size={18} />
					</button>
				{/if}
			</div>
		</div>

		<!-- Mobile Horizontal Scrollable Preset Strip (< md) -->
		<div class="flex md:hidden items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
			{#each presets as p}
				<button
					class="shrink-0 flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold backdrop-blur-xl transition-all {audioFx.visualizerPreset === p.id
						? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/30'
						: 'bg-black/50 text-muted-foreground border border-white/10 hover:text-white'}"
					onclick={() => setVisualizerPreset(p.id)}
				>
					<span>{p.icon}</span>
					<span>{p.label}</span>
				</button>
			{/each}
		</div>
	</header>

	<!-- Center Minimalist Floating Track Badge -->
	{#if showControls && playback.now}
		<div
			class="relative z-10 mx-auto flex max-w-sm items-center gap-3 rounded-2xl border border-white/15 bg-black/50 p-2 px-3.5 backdrop-blur-2xl shadow-2xl transition-all pointer-events-auto"
			transition:scale={{ start: 0.95, duration: 200 }}
		>
			{#if playback.now?.thumbnail}
				<img
					src={thumb(playback.now.thumbnail, 120, playback.now?.title || 'Aura', 'song')}
					alt=""
					class="size-10 rounded-xl object-cover shadow-md ring-1 ring-white/20 shrink-0"
				/>
			{/if}
			<div class="min-w-0 flex-1">
				<Marquee text={playback.now?.title ?? ''} class="text-xs font-bold text-white tracking-tight" />
				<div class="truncate text-[11px] font-medium text-muted-foreground mt-0.5">
					{playback.now?.artists ?? ''}
				</div>
			</div>
			<span class="rounded-md bg-primary/20 px-2 py-0.5 text-[9px] font-bold text-primary border border-primary/30 uppercase tracking-widest shrink-0">
				Live
			</span>
		</div>
	{/if}

	<!-- Bottom Transport Minimalist HUD Controls -->
	<footer
		class="relative z-10 flex flex-col gap-2 p-4 sm:px-8 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] transition-opacity duration-300 {showControls
			? 'opacity-100 pointer-events-auto'
			: 'opacity-0 pointer-events-none'}"
	>
		<!-- Scrubber Timeline -->
		<div class="mx-auto flex w-full max-w-xl items-center gap-3">
			<span class="text-[11px] font-semibold tabular-nums text-white/70 w-10 text-right">
				{fmt(shownPosition)}
			</span>
			<input
				type="range"
				class="range h-1.5 flex-1 cursor-pointer accent-primary"
				style="--pct:{playback.duration ? (shownPosition / playback.duration) * 100 : 0}%"
				min="0"
				max={playback.duration || 0}
				value={shownPosition}
				oninput={onSeekInput}
				onchange={onSeekCommit}
				aria-label="Seek"
			/>
			<span class="text-[11px] font-semibold tabular-nums text-white/70 w-10">
				{playback.now?.duration === 'LIVE' ? 'LIVE' : fmt(playback.duration || 0)}
			</span>
		</div>

		<!-- Transport Buttons Row -->
		<div class="mx-auto flex w-full max-w-xs items-center justify-between px-4">
			<button
				class="flex size-9 items-center justify-center rounded-full text-white/70 hover:text-white transition active:scale-90"
				onclick={() => api.toggleShuffle()}
				aria-label="Shuffle"
			>
				<HugeiconsIcon icon={ShuffleIcon} size={18} class={playback.queue.shuffle ? 'text-primary' : ''} />
			</button>

			<button
				class="flex size-10 items-center justify-center rounded-full text-white hover:scale-110 active:scale-90 transition"
				onclick={() => api.prevTrack()}
				aria-label="Previous"
			>
				<HugeiconsIcon icon={PreviousIcon} size={20} />
			</button>

			<button
				class="flex size-12 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-[0_0_25px_#ff0a78] transition-all hover:scale-105 active:scale-95 cursor-pointer"
				onclick={() => api.togglePause()}
				aria-label={playback.paused ? 'Play' : 'Pause'}
			>
				<HugeiconsIcon
					icon={PauseIcon}
					altIcon={PlayIcon}
					showAlt={playback.paused}
					size={24}
					fill="currentColor"
				/>
			</button>

			<button
				class="flex size-10 items-center justify-center rounded-full text-white hover:scale-110 active:scale-90 transition"
				onclick={() => api.nextTrack()}
				aria-label="Next"
			>
				<HugeiconsIcon icon={NextIcon} size={20} />
			</button>

			<button
				class="flex size-9 items-center justify-center rounded-full text-white/70 hover:text-white transition active:scale-90"
				onclick={cycleRepeat}
				aria-label="Repeat"
			>
				<HugeiconsIcon
					icon={RepeatIcon}
					altIcon={RepeatOne01Icon}
					showAlt={playback.queue.repeat === 'one'}
					size={18}
					class={playback.queue.repeat !== 'off' ? 'text-primary' : ''}
				/>
			</button>
		</div>
	</footer>
</div>
