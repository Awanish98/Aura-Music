<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
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
		SparklesIcon,
		AudioWave01Icon,
		FavouriteIcon
	} from '@hugeicons/core-free-icons';
	import {
		playback,
		audioFx,
		cycleRepeat,
		toggleNowPlayingRating,
		setVisualizerPreset,
		setVisualizerTheme,
		type VisualizerPreset,
		type VisualizerColorTheme
	} from '$lib/player.svelte';
	import * as api from '$lib/api';
	import { webPlayer } from '$lib/webplayer';
	import { thumb } from '$lib/thumb';
	import Marquee from './Marquee.svelte';
	import ArtistLine from './ArtistLine.svelte';

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

	// Presets list inspired by vizz.fm
	const presets: { id: VisualizerPreset; label: string; icon: string; desc: string }[] = [
		{ id: 'mesh_grid', label: 'Cyber Grid', icon: '🌐', desc: '3D retro perspective wireframe terrain' },
		{ id: 'cosmic_galaxy', label: 'Cosmic Galaxy', icon: '🌌', desc: '3D particle vortex & hyper-speed trails' },
		{ id: 'radial_ring', label: 'Radial Ring', icon: '🌀', desc: 'Hypnotic liquid spectrum pulsar' },
		{ id: 'neon_bars', label: 'Neon Bars', icon: '⚡', desc: '3D glass equalizer columns with reflections' },
		{ id: 'aurora_wave', label: 'Aurora Wave', icon: '🌊', desc: 'Fluid rainbow plasma silk ribbons' },
		{ id: 'quantum_sphere', label: 'Quantum Core', icon: '🔮', desc: 'Audio reactive holographic 3D sphere' }
	];

	// Color themes
	const themes: { id: VisualizerColorTheme; label: string; primary: string; secondary: string }[] = [
		{ id: 'cyberpunk', label: 'Cyberpunk', primary: '#ff007f', secondary: '#00f2fe' },
		{ id: 'sunset', label: 'Sunset Flare', primary: '#ff5e3a', secondary: '#ff2a7a' },
		{ id: 'emerald', label: 'Matrix Neon', primary: '#00f260', secondary: '#0575e6' },
		{ id: 'violet', label: 'Deep Violet', primary: '#8a2387', secondary: '#e94057' },
		{ id: 'rainbow', label: 'Electric Rainbow', primary: '#00c6ff', secondary: '#0072ff' },
		{ id: 'artwork', label: 'Album Sync', primary: 'var(--primary, #ff2a7a)', secondary: '#a855f7' }
	];

	// Particle pool for Cosmic Galaxy
	interface StarParticle {
		x: number;
		y: number;
		z: number;
		size: number;
		color: string;
		angle: number;
		speed: number;
		orbitRadius: number;
	}
	let particles: StarParticle[] = [];

	// Equalizer peak tracking for Neon Bars
	let peakHeights: number[] = new Array(48).fill(0);
	let peakDropSpeeds: number[] = new Array(48).fill(0);

	// Rotation state for 3D sphere and grid
	let rotationX = 0;
	let rotationY = 0;
	let gridOffsetZ = 0;

	function resetParticles(w: number, h: number) {
		particles = [];
		const count = Math.min(380, Math.floor((w * h) / 3200));
		for (let i = 0; i < count; i++) {
			particles.push({
				x: (Math.random() - 0.5) * w * 1.5,
				y: (Math.random() - 0.5) * h * 1.5,
				z: Math.random() * 1000 + 50,
				size: Math.random() * 2.5 + 0.8,
				color: Math.random() > 0.5 ? '#ff2a7a' : '#00f2fe',
				angle: Math.random() * Math.PI * 2,
				speed: Math.random() * 2 + 1,
				orbitRadius: Math.random() * Math.min(w, h) * 0.45 + 30
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

	// Format seconds
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
		const ctx = canvasEl.getContext('2d');
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

		// Main Visualizer Animation Loop (60 FPS Ultra Smooth)
		function render(now: number) {
			if (!canvasEl || !ctx) return;
			const dt = Math.min(0.1, (now - prevTime) / 1000);
			prevTime = now;

			const width = canvasEl.width / (Math.min(2, window.devicePixelRatio || 1));
			const height = canvasEl.height / (Math.min(2, window.devicePixelRatio || 1));
			const cx = width / 2;
			const cy = height / 2;

			// Get live audio metrics from webplayer
			const metrics = webPlayer.getAudioMetrics();
			const sens = audioFx.visualizerSensitivity || 1.2;
			const bass = metrics.bass * sens;
			const mid = metrics.mid * sens;
			const treble = metrics.treble * sens;
			const energy = metrics.energy * sens;
			const beat = metrics.beat;
			const freq = metrics.freqData;
			const time = now / 1000;

			// Theme colors
			let c1 = '#ff007f';
			let c2 = '#00f2fe';
			const curTheme = audioFx.visualizerTheme;

			if (curTheme === 'cyberpunk') {
				c1 = '#ff007f';
				c2 = '#00f2fe';
			} else if (curTheme === 'sunset') {
				c1 = '#ff5e3a';
				c2 = '#ff2a7a';
			} else if (curTheme === 'emerald') {
				c1 = '#00f260';
				c2 = '#0575e6';
			} else if (curTheme === 'violet') {
				c1 = '#b92b27';
				c2 = '#8a2387';
			} else if (curTheme === 'rainbow') {
				const hue = (time * 30) % 360;
				c1 = `hsl(${hue}, 100%, 60%)`;
				c2 = `hsl(${(hue + 60) % 360}, 100%, 65%)`;
			} else {
				c1 = '#ff2a7a';
				c2 = '#00f2fe';
			}

			// Clear background with soft motion blur
			ctx.save();
			ctx.fillStyle = audioFx.visualizerPreset === 'mesh_grid' ? '#070712' : '#05070e';
			ctx.fillRect(0, 0, width, height);

			if (audioFx.visualizerGlow) {
				ctx.shadowBlur = 12 + bass * 18;
				ctx.shadowColor = c1;
			}

			const preset = audioFx.visualizerPreset;

			// -------------------------------------------------------------
			// PRESET 1: MESH GRID (3D Retro Horizon & Terrain Waves)
			// -------------------------------------------------------------
			if (preset === 'mesh_grid') {
				const horizonY = cy - height * 0.08;
				gridOffsetZ = (gridOffsetZ + (2 + bass * 6)) % 40;

				// Deep horizon glow
				const sunGrad = ctx.createRadialGradient(cx, horizonY, 10, cx, horizonY, Math.min(width, height) * 0.4);
				sunGrad.addColorStop(0, `${c1}bb`);
				sunGrad.addColorStop(0.35, `${c2}55`);
				sunGrad.addColorStop(1, 'transparent');
				ctx.fillStyle = sunGrad;
				ctx.fillRect(0, 0, width, horizonY + 20);

				// Glowing Sun
				const sunRadius = Math.min(width, height) * 0.16 * (1 + bass * 0.15);
				const sunDisc = ctx.createLinearGradient(cx, horizonY - sunRadius, cx, horizonY + sunRadius);
				sunDisc.addColorStop(0, '#fff');
				sunDisc.addColorStop(0.4, c1);
				sunDisc.addColorStop(1, c2);
				ctx.fillStyle = sunDisc;
				ctx.beginPath();
				ctx.arc(cx, horizonY, sunRadius, Math.PI, 0, false);
				ctx.fill();

				// Sun horizontal scanlines
				ctx.strokeStyle = '#070712';
				ctx.lineWidth = 2.5;
				for (let s = horizonY - sunRadius + 12; s < horizonY; s += 8) {
					ctx.beginPath();
					ctx.moveTo(cx - sunRadius, s);
					ctx.lineTo(cx + sunRadius, s);
					ctx.stroke();
				}

				// Perspective grid lines (Z depth)
				const cols = 22;
				const rows = 16;
				const gridDepth = height - horizonY;

				ctx.lineWidth = 1.6;
				ctx.strokeStyle = c2;
				ctx.beginPath();

				// Vertical perspective beams
				for (let i = -cols / 2; i <= cols / 2; i++) {
					const xBottom = cx + i * (width / cols) * 2.6;
					ctx.moveTo(cx, horizonY);
					ctx.lineTo(xBottom, height);
				}
				ctx.stroke();

				// Horizontal audio terrain wave rows
				for (let r = 1; r <= rows; r++) {
					const p = (r * (rows / 10) + gridOffsetZ / 40) / rows;
					const rowY = horizonY + Math.pow(p, 2.2) * gridDepth;
					const rowAlpha = Math.min(1, p * 1.5);
					const binIdx = Math.floor(Math.abs(r) % 16);
					const rowFreq = (freq[binIdx] || 0) / 255;

					ctx.strokeStyle = r % 2 === 0 ? c1 : c2;
					ctx.globalAlpha = rowAlpha;
					ctx.beginPath();

					for (let c = 0; c <= cols; c++) {
						const colX = cx + (c - cols / 2) * (width / cols) * (1 + p * 2.2);
						const distFromCenter = Math.abs(c - cols / 2) / (cols / 2);
						const hillHeight = Math.sin(c * 0.8 + time * 4) * rowFreq * 45 * (1 - distFromCenter * 0.5) * p;
						const ptY = rowY - hillHeight;

						if (c === 0) ctx.moveTo(colX, ptY);
						else ctx.lineTo(colX, ptY);
					}
					ctx.stroke();
				}
				ctx.globalAlpha = 1;
			}

			// -------------------------------------------------------------
			// PRESET 2: COSMIC GALAXY (3D Particle Vortex & Hyper Trails)
			// -------------------------------------------------------------
			else if (preset === 'cosmic_galaxy') {
				rotationX += 0.003 + bass * 0.01;
				rotationY += 0.005 + mid * 0.008;

				// Central glowing pulsar core
				const coreRadius = (35 + bass * 45) * (beat ? 1.25 : 1.0);
				const coreGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, coreRadius * 2);
				coreGrad.addColorStop(0, '#ffffff');
				coreGrad.addColorStop(0.3, c1);
				coreGrad.addColorStop(0.7, `${c2}66`);
				coreGrad.addColorStop(1, 'transparent');
				ctx.fillStyle = coreGrad;
				ctx.beginPath();
				ctx.arc(cx, cy, coreRadius * 2, 0, Math.PI * 2);
				ctx.fill();

				// Orbiting galaxy particles
				for (let i = 0; i < particles.length; i++) {
					const p = particles[i];
					p.z -= (p.speed * 4 + bass * 25);
					p.angle += (0.01 + (p.speed / 100) * (1 + bass * 2));

					if (p.z <= 10) {
						p.z = 1000;
						p.x = (Math.random() - 0.5) * width * 1.5;
						p.y = (Math.random() - 0.5) * height * 1.5;
					}

					const scaleFactor = 350 / p.z;
					const px = cx + (p.x * Math.cos(p.angle) - p.y * Math.sin(p.angle)) * scaleFactor;
					const py = cy + (p.x * Math.sin(p.angle) + p.y * Math.cos(p.angle)) * scaleFactor;
					const pSize = Math.max(0.5, p.size * scaleFactor * (1 + bass * 1.2));

					if (px >= 0 && px <= width && py >= 0 && py <= height) {
						const freqIdx = i % 32;
						const pAlpha = Math.min(1, Math.max(0.2, (1 - p.z / 1000) * (0.5 + (freq[freqIdx] / 255) * 0.8)));

						ctx.fillStyle = i % 2 === 0 ? c1 : c2;
						ctx.globalAlpha = pAlpha;
						ctx.beginPath();
						ctx.arc(px, py, pSize, 0, Math.PI * 2);
						ctx.fill();

						// Warp trail on bass hits
						if (bass > 0.45) {
							ctx.strokeStyle = i % 2 === 0 ? c1 : c2;
							ctx.lineWidth = pSize * 0.6;
							ctx.beginPath();
							ctx.moveTo(px, py);
							ctx.lineTo(px - (px - cx) * 0.08 * bass, py - (py - cy) * 0.08 * bass);
							ctx.stroke();
						}
					}
				}
				ctx.globalAlpha = 1;
			}

			// -------------------------------------------------------------
			// PRESET 3: RADIAL RING (Hypnotic Liquid Spectrum Pulsar)
			// -------------------------------------------------------------
			else if (preset === 'radial_ring') {
				const baseRadius = Math.min(width, height) * 0.22 * (1 + bass * 0.18);
				const barCount = 64;

				// Inner Pulsing Core
				const innerGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, baseRadius);
				innerGrad.addColorStop(0, '#ffffff44');
				innerGrad.addColorStop(0.5, `${c1}33`);
				innerGrad.addColorStop(1, `${c2}11`);
				ctx.fillStyle = innerGrad;
				ctx.beginPath();
				ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
				ctx.fill();

				// Radiating Frequency Bars
				for (let i = 0; i < barCount; i++) {
					const angle = (i / barCount) * Math.PI * 2 + time * 0.2;
					const bin = Math.floor((i < barCount / 2 ? i : barCount - i) * (32 / (barCount / 2)));
					const val = (freq[bin] || 0) / 255;
					const barLen = Math.max(8, val * Math.min(width, height) * 0.28 * sens);

					const x1 = cx + Math.cos(angle) * (baseRadius + 6);
					const y1 = cy + Math.sin(angle) * (baseRadius + 6);
					const x2 = cx + Math.cos(angle) * (baseRadius + 6 + barLen);
					const y2 = cy + Math.sin(angle) * (baseRadius + 6 + barLen);

					const barGrad = ctx.createLinearGradient(x1, y1, x2, y2);
					barGrad.addColorStop(0, c1);
					barGrad.addColorStop(1, c2);

					ctx.strokeStyle = barGrad;
					ctx.lineWidth = Math.max(2, (Math.PI * 2 * baseRadius) / barCount * 0.65);
					ctx.lineCap = 'round';
					ctx.beginPath();
					ctx.moveTo(x1, y1);
					ctx.lineTo(x2, y2);
					ctx.stroke();
				}

				// Inner mirror waveform circle
				ctx.strokeStyle = '#fff';
				ctx.lineWidth = 2;
				ctx.beginPath();
				for (let i = 0; i <= barCount; i++) {
					const angle = (i / barCount) * Math.PI * 2;
					const timeVal = (metrics.timeData[i % 32] - 128) / 128;
					const r = baseRadius * 0.82 + timeVal * 16 * bass;
					const x = cx + Math.cos(angle) * r;
					const y = cy + Math.sin(angle) * r;
					if (i === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				}
				ctx.closePath();
				ctx.stroke();
			}

			// -------------------------------------------------------------
			// PRESET 4: NEON BARS (3D Cyberpunk Equalizer Columns)
			// -------------------------------------------------------------
			else if (preset === 'neon_bars') {
				const barCount = 40;
				const barWidth = Math.max(4, (width * 0.85) / barCount - 3);
				const startX = cx - (barCount * (barWidth + 3)) / 2;
				const baseY = cy + height * 0.18;
				const maxBarHeight = height * 0.5;

				// Glossy floor line
				ctx.strokeStyle = `${c2}44`;
				ctx.lineWidth = 1.5;
				ctx.beginPath();
				ctx.moveTo(startX - 20, baseY);
				ctx.lineTo(startX + barCount * (barWidth + 3) + 20, baseY);
				ctx.stroke();

				for (let i = 0; i < barCount; i++) {
					const x = startX + i * (barWidth + 3);
					// Symmetric spectrum distribution (bass in center)
					const distFromCenter = Math.abs(i - barCount / 2) / (barCount / 2);
					const bin = Math.min(48, Math.floor(distFromCenter * 32));
					const val = (freq[bin] || 0) / 255;
					const targetH = Math.max(6, val * maxBarHeight * sens);

					// Peak caps with gravity drop
					if (targetH > peakHeights[i]) {
						peakHeights[i] = targetH;
						peakDropSpeeds[i] = 0;
					} else {
						peakDropSpeeds[i] += 0.35;
						peakHeights[i] = Math.max(0, peakHeights[i] - peakDropSpeeds[i]);
					}

					// Main column
					const grad = ctx.createLinearGradient(x, baseY, x, baseY - targetH);
					grad.addColorStop(0, `${c1}88`);
					grad.addColorStop(0.6, c1);
					grad.addColorStop(1, c2);

					ctx.fillStyle = grad;
					ctx.beginPath();
					ctx.roundRect(x, baseY - targetH, barWidth, targetH, [4, 4, 0, 0]);
					ctx.fill();

					// Floating peak cap
					ctx.fillStyle = '#ffffff';
					ctx.fillRect(x, baseY - peakHeights[i] - 4, barWidth, 2.5);

					// Floor glossy reflection
					const refGrad = ctx.createLinearGradient(x, baseY, x, baseY + targetH * 0.4);
					refGrad.addColorStop(0, `${c1}44`);
					refGrad.addColorStop(1, 'transparent');
					ctx.fillStyle = refGrad;
					ctx.beginPath();
					ctx.roundRect(x, baseY + 2, barWidth, targetH * 0.35, [0, 0, 4, 4]);
					ctx.fill();
				}
			}

			// -------------------------------------------------------------
			// PRESET 5: AURORA WAVE (Fluid Rainbow Plasma Silk Ribbons)
			// -------------------------------------------------------------
			else if (preset === 'aurora_wave') {
				const waveCount = 4;
				const points = 36;
				const step = width / (points - 1);

				for (let w = 0; w < waveCount; w++) {
					const waveAmp = (40 + w * 25) * (1 + bass * 1.1);
					const speedOffset = time * (1.2 + w * 0.4);
					const yOffset = cy + (w - waveCount / 2) * 35;

					const waveGrad = ctx.createLinearGradient(0, yOffset - waveAmp, width, yOffset + waveAmp);
					waveGrad.addColorStop(0, `${c1}77`);
					waveGrad.addColorStop(0.5, `${c2}99`);
					waveGrad.addColorStop(1, `${c1}77`);

					ctx.fillStyle = waveGrad;
					ctx.strokeStyle = w === 0 ? '#fff' : c2;
					ctx.lineWidth = 2;
					ctx.beginPath();
					ctx.moveTo(0, height);

					for (let i = 0; i < points; i++) {
						const x = i * step;
						const bin = Math.floor((i / points) * 24);
						const fVal = (freq[bin] || 0) / 255;
						const sinY = Math.sin(i * 0.35 + speedOffset) * waveAmp * (0.4 + fVal * 0.8);
						const cosY = Math.cos(i * 0.2 - speedOffset * 0.8) * (waveAmp * 0.4);
						const y = yOffset + sinY + cosY;
						ctx.lineTo(x, y);
					}

					ctx.lineTo(width, height);
					ctx.closePath();
					ctx.fill();
					ctx.stroke();
				}
			}

			// -------------------------------------------------------------
			// PRESET 6: QUANTUM SPHERE (3D Audio Reactive Hologram Sphere)
			// -------------------------------------------------------------
			else if (preset === 'quantum_sphere') {
				rotationX += 0.012 + mid * 0.02;
				rotationY += 0.016 + bass * 0.03;

				const sphereRadius = Math.min(width, height) * 0.22 * (1 + bass * 0.25);
				const rings = 12;
				const segments = 24;

				// Inner glowing core
				const coreGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, sphereRadius * 0.9);
				coreGrad.addColorStop(0, '#ffffff');
				coreGrad.addColorStop(0.4, `${c1}88`);
				coreGrad.addColorStop(1, 'transparent');
				ctx.fillStyle = coreGrad;
				ctx.beginPath();
				ctx.arc(cx, cy, sphereRadius * 0.9, 0, Math.PI * 2);
				ctx.fill();

				// 3D Spherical wireframe mesh
				ctx.lineWidth = 1.4;
				for (let r = 0; r < rings; r++) {
					const phi = (r / (rings - 1)) * Math.PI - Math.PI / 2;
					const ringR = Math.cos(phi) * sphereRadius;
					const ringY = Math.sin(phi) * sphereRadius;
					const bin = (r * 2) % 32;
					const deform = 1 + ((freq[bin] || 0) / 255) * 0.35;

					ctx.strokeStyle = r % 2 === 0 ? c1 : c2;
					ctx.beginPath();

					for (let s = 0; s <= segments; s++) {
						const theta = (s / segments) * Math.PI * 2;
						// 3D Rotation
						let x3 = ringR * Math.cos(theta) * deform;
						let y3 = ringY * deform;
						let z3 = ringR * Math.sin(theta) * deform;

						// Apply rotation matrix
						const xRot = x3 * Math.cos(rotationY) - z3 * Math.sin(rotationY);
						const zRot = x3 * Math.sin(rotationY) + z3 * Math.cos(rotationY);
						const yRot = y3 * Math.cos(rotationX) - zRot * Math.sin(rotationX);
						const zFinal = y3 * Math.sin(rotationX) + zRot * Math.cos(rotationX);

						const persp = 500 / (500 + zFinal);
						const px = cx + xRot * persp;
						const py = cy + yRot * persp;

						if (s === 0) ctx.moveTo(px, py);
						else ctx.lineTo(px, py);
					}
					ctx.stroke();
				}
			}

			ctx.restore();
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

<!-- Full-screen / Inline Studio Container -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={studioContainer}
	class="{inline
		? 'relative h-full w-full rounded-2xl overflow-hidden'
		: 'fixed inset-0 z-[70] flex flex-col justify-between bg-black text-white select-none overflow-hidden backdrop-blur-3xl'}"
	transition:fade={{ duration: 250 }}
	onmousemove={handleActivity}
	ontouchstart={handleActivity}
>
	<!-- Audio Reactive 60FPS Canvas -->
	<canvas bind:this={canvasEl} class="absolute inset-0 h-full w-full object-cover touch-none"></canvas>

	<!-- Top Glass HUD Header (Preset Selectors & Quick Settings) -->
	<div
		class="relative z-10 flex flex-col gap-2 p-3 sm:p-4 transition-opacity duration-300 {showControls
			? 'opacity-100 pointer-events-auto'
			: 'opacity-0 pointer-events-none'}"
	>
		<div class="flex items-center justify-between gap-2">
			<!-- Visualizer Badge & Current Preset -->
			<div class="flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-xl border border-white/10 shadow-lg">
				<HugeiconsIcon icon={AudioWave01Icon} size={18} class="text-primary animate-pulse" />
				<span class="text-xs font-bold tracking-wider text-white uppercase">Aura Visualizer Studio</span>
				<span class="text-[10px] text-muted-foreground">• 60 FPS</span>
			</div>

			<!-- Preset Selector Switcher (Pills) -->
			<div class="hidden md:flex items-center gap-1.5 rounded-full bg-black/50 p-1 border border-white/10 backdrop-blur-xl shadow-2xl">
				{#each presets as p}
					<button
						class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all {audioFx.visualizerPreset ===
						p.id
							? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/40 scale-100'
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
			<div class="flex items-center gap-1.5">
				<!-- Color Theme Picker Pills -->
				<div class="flex items-center gap-1 rounded-full bg-black/40 p-1 border border-white/10 backdrop-blur-xl">
					{#each themes as th}
						<button
							class="size-6 rounded-full border transition-transform hover:scale-110 {audioFx.visualizerTheme ===
							th.id
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
					class="shrink-0 flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold backdrop-blur-xl transition-all {audioFx.visualizerPreset ===
					p.id
						? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/30'
						: 'bg-black/40 text-muted-foreground border border-white/10 hover:text-white'}"
					onclick={() => setVisualizerPreset(p.id)}
				>
					<span>{p.icon}</span>
					<span>{p.label}</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- Center Dynamic Floating Track Badge (When Controls Visible) -->
	{#if showControls && playback.now}
		<div
			class="relative z-10 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-white/15 bg-black/45 p-2.5 px-4 backdrop-blur-2xl shadow-2xl transition-all pointer-events-auto"
			transition:scale={{ start: 0.95, duration: 200 }}
		>
			{#if playback.now?.thumbnail}
				<img
					src={thumb(playback.now.thumbnail, 120, playback.now?.title || 'Aura', 'song')}
					alt=""
					class="size-11 rounded-xl object-cover shadow-md ring-1 ring-white/20 shrink-0"
				/>
			{/if}
			<div class="min-w-0 flex-1">
				<Marquee text={playback.now?.title ?? ''} class="text-sm font-bold text-white tracking-tight" />
				<div class="truncate text-xs font-medium text-muted-foreground mt-0.5">
					{playback.now?.artists ?? ''}
				</div>
			</div>
			<span class="rounded-md bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/30 uppercase tracking-widest shrink-0">
				Live
			</span>
		</div>
	{/if}

	<!-- Bottom Transport HUD Controls -->
	<div
		class="relative z-10 flex flex-col gap-2.5 p-4 sm:px-8 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] transition-opacity duration-300 {showControls
			? 'opacity-100 pointer-events-auto'
			: 'opacity-0 pointer-events-none'}"
	>
		<!-- Scrubber Timeline -->
		<div class="mx-auto flex w-full max-w-2xl items-center gap-3">
			<span class="text-xs font-semibold tabular-nums text-white/70 w-10 text-right">
				{fmt(shownPosition)}
			</span>
			<input
				type="range"
				class="range h-2 flex-1 cursor-pointer accent-primary"
				style="--pct:{playback.duration ? (shownPosition / playback.duration) * 100 : 0}%"
				min="0"
				max={playback.duration || 0}
				value={shownPosition}
				oninput={onSeekInput}
				onchange={onSeekCommit}
				aria-label="Seek"
			/>
			<span class="text-xs font-semibold tabular-nums text-white/70 w-10">
				{playback.now?.duration === 'LIVE' ? 'LIVE' : fmt(playback.duration || 0)}
			</span>
		</div>

		<!-- Transport Buttons Row -->
		<div class="mx-auto flex w-full max-w-md items-center justify-between px-4">
			<button
				class="flex size-10 items-center justify-center rounded-full text-white/70 hover:text-white transition active:scale-90"
				onclick={() => api.toggleShuffle()}
				aria-label="Shuffle"
			>
				<HugeiconsIcon icon={ShuffleIcon} size={20} class={playback.queue.shuffle ? 'text-primary' : ''} />
			</button>

			<button
				class="flex size-11 items-center justify-center rounded-full text-white hover:scale-110 active:scale-90 transition"
				onclick={() => api.prevTrack()}
				aria-label="Previous"
			>
				<HugeiconsIcon icon={PreviousIcon} size={24} />
			</button>

			<button
				class="flex size-14 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-[0_0_30px_#ff2a7a] transition-all hover:scale-105 active:scale-95 cursor-pointer"
				onclick={() => api.togglePause()}
				aria-label={playback.paused ? 'Play' : 'Pause'}
			>
				<HugeiconsIcon
					icon={PauseIcon}
					altIcon={PlayIcon}
					showAlt={playback.paused}
					size={28}
					fill="currentColor"
				/>
			</button>

			<button
				class="flex size-11 items-center justify-center rounded-full text-white hover:scale-110 active:scale-90 transition"
				onclick={() => api.nextTrack()}
				aria-label="Next"
			>
				<HugeiconsIcon icon={NextIcon} size={24} />
			</button>

			<button
				class="flex size-10 items-center justify-center rounded-full text-white/70 hover:text-white transition active:scale-90"
				onclick={cycleRepeat}
				aria-label="Repeat"
			>
				<HugeiconsIcon
					icon={RepeatIcon}
					altIcon={RepeatOne01Icon}
					showAlt={playback.queue.repeat === 'one'}
					size={20}
					class={playback.queue.repeat !== 'off' ? 'text-primary' : ''}
				/>
			</button>
		</div>
	</div>
</div>
