<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
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
		AudioWave01Icon
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
	import { artworkAccent } from '$lib/artcolor';
	import { hexToHsv, hsvToHex } from '$lib/color';

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
	let dynamicAccent = $state('#f59e0b');
	let dynamicSecondary = $state('#ef4444');

	// Minimalist Ultra-Premium Cosmic & Stardust Presets
	const presets: { id: VisualizerPreset; label: string; icon: string; desc: string }[] = [
		{ id: 'cosmic_aura', label: 'Stardust Nebula', icon: '✨', desc: 'Ambient breathing cosmos with reacting starfield & beat shockwaves' },
		{ id: 'cosmic_galaxy', label: 'Cosmic Vortex', icon: '🌌', desc: 'Accretion disk with dual spiral arms of glowing stardust' },
		{ id: 'aurora_wave', label: 'Northern Aurora', icon: '🌊', desc: 'Silky fluid ribbons & rising embers with harmonic luminescence' },
		{ id: 'radial_halo', label: 'Celestial Ring', icon: '🪐', desc: 'Pulsing solar orb with audio-reactive prominence flares' },
		{ id: 'quantum_sphere', label: 'Supernova Core', icon: '⚡', desc: 'Quantum energy sphere with radiant lightning filaments' },
		{ id: 'mesh_grid', label: 'Stellar Constellation', icon: '💫', desc: 'Interconnected 3D star web with reactive energy pulses' }
	];

	// Luxury Color Themes (Album Sync is First & Default)
	const themes = $derived<{ id: VisualizerColorTheme; label: string; primary: string; secondary: string }[]>([
		{ id: 'artwork', label: 'Album Sync (Auto)', primary: dynamicAccent, secondary: dynamicSecondary },
		{ id: 'sunset', label: 'Sunset Gold', primary: '#f59e0b', secondary: '#ef4444' },
		{ id: 'emerald', label: 'Aurora Emerald', primary: '#10b981', secondary: '#06b6d4' },
		{ id: 'cyberpunk', label: 'Aura Neon', primary: '#ff0a78', secondary: '#00f5ff' },
		{ id: 'violet', label: 'Cyber Violet', primary: '#a855f7', secondary: '#3b82f6' },
		{ id: 'rainbow', label: 'Liquid Platinum', primary: '#ffffff', secondary: '#94a3b8' }
	]);

	// Extract album accent color when track changes and calculate complementary harmonic secondary
	$effect(() => {
		const imgUrl = thumb(playback.now?.thumbnail, 120);
		if (imgUrl) {
			artworkAccent(imgUrl).then((hex: string | null) => {
				if (hex) {
					dynamicAccent = hex;
					const hsv = hexToHsv(hex);
					if (hsv) {
						dynamicSecondary = hsvToHex({
							h: (hsv.h + 40) % 360,
							s: Math.min(0.9, Math.max(0.4, hsv.s)),
							v: Math.min(1, hsv.v + 0.1)
						});
					}
				}
			}).catch(() => {});
		}
	});

	// Dynamic Particle & Cosmic Starfield System
	interface CosmicStar {
		x: number;
		y: number;
		size: number;
		angle: number;
		distance: number;
		baseDistance: number;
		angularSpeed: number;
		radialSpeed: number;
		opacity: number;
		baseAlpha: number;
		pulsePhase: number;
		armIndex: number; // 0 or 1 for spiral galaxies
		freqBin: number;
		colorType: number; // 0: primary, 1: secondary, 2: white-star
		z: number; // 0.1 to 1.0 depth factor
	}
	let particles: CosmicStar[] = [];

	// Dynamic expanding beat shockwaves
	interface Shockwave {
		x: number;
		y: number;
		radius: number;
		maxRadius: number;
		alpha: number;
		speed: number;
		color: string;
	}
	let shockwaves: Shockwave[] = [];

	// Constellation nodes for 3D star web
	interface ConstellationNode {
		x: number;
		y: number;
		vx: number;
		vy: number;
		size: number;
		freqBin: number;
		alpha: number;
	}
	let constellationNodes: ConstellationNode[] = [];

	// Smoothing for audio physics & ballistics
	let smoothedBass = 0;
	let smoothedEnergy = 0;
	let smoothedTreble = 0;
	let wavePhase = 0;
	let haloAngle = 0;
	let vortexAngle = 0;
	let lastBeatTime = 0;

	function resetParticles(w: number, h: number) {
		particles = [];
		shockwaves = [];
		const count = Math.min(150, Math.floor((w * h) / 7500));
		const cx = w / 2;
		const cy = h / 2;
		const maxDim = Math.min(w, h);

		for (let i = 0; i < count; i++) {
			const dist = Math.random() * maxDim * 0.46 + 10;
			const ang = Math.random() * Math.PI * 2;
			const z = Math.random() * 0.8 + 0.2;
			particles.push({
				x: cx + Math.cos(ang) * dist,
				y: cy + Math.sin(ang) * dist,
				size: (Math.random() * 2.2 + 0.6) * z,
				angle: ang,
				distance: dist,
				baseDistance: dist,
				angularSpeed: (Math.random() - 0.5) * 0.008 * (1.2 - z * 0.4),
				radialSpeed: (Math.random() - 0.5) * 0.2,
				opacity: Math.random() * 0.7 + 0.3,
				baseAlpha: Math.random() * 0.6 + 0.25,
				pulsePhase: Math.random() * Math.PI * 2,
				armIndex: i % 2,
				freqBin: Math.floor(Math.random() * 48),
				colorType: i % 5 === 0 ? 2 : i % 2 === 0 ? 0 : 1,
				z
			});
		}

		// Initialize constellation nodes
		const nodeCount = 36;
		constellationNodes = [];
		for (let i = 0; i < nodeCount; i++) {
			const dist = (Math.random() * 0.38 + 0.05) * maxDim;
			const ang = (i / nodeCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
			constellationNodes.push({
				x: cx + Math.cos(ang) * dist,
				y: cy + Math.sin(ang) * dist,
				vx: (Math.random() - 0.5) * 0.4,
				vy: (Math.random() - 0.5) * 0.4,
				size: Math.random() * 2.5 + 2,
				freqBin: i % 48,
				alpha: Math.random() * 0.5 + 0.5
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
			if (!playback.paused) {
				showControls = false;
			}
		}, 3500);
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
		const ctx = canvasEl.getContext('2d', { alpha: true });
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

		// Ultra-Fluid Audio Reactive 60-120FPS Canvas Engine
		function render(nowTime: number) {
			if (!canvasEl || !ctx) return;
			const dt = Math.min(0.05, (nowTime - prevTime) / 1000);
			prevTime = nowTime;

			const dpr = Math.min(2, window.devicePixelRatio || 1);
			const width = canvasEl.width / dpr;
			const height = canvasEl.height / dpr;
			const cx = width / 2;
			const cy = height / 2;
			const maxDim = Math.min(width, height);

			// Metrics from high-precision audio engine
			const isPlaying = !playback.paused && !!playback.now;
			const rawMetrics = isPlaying
				? webPlayer.getAudioMetrics()
				: {
						bass: 0,
						mid: 0,
						treble: 0,
						energy: 0,
						beat: false,
						freqData: new Uint8Array(64),
						timeData: new Uint8Array(64).fill(128)
					};

			const sens = audioFx.visualizerSensitivity || 1.1;
			const targetBass = rawMetrics.bass * sens;
			const targetEnergy = rawMetrics.energy * sens;
			const targetTreble = rawMetrics.treble * sens;

			// Ballistics interpolation
			smoothedBass += (targetBass - smoothedBass) * 0.16;
			smoothedEnergy += (targetEnergy - smoothedEnergy) * 0.14;
			smoothedTreble += (targetTreble - smoothedTreble) * 0.18;
			wavePhase += dt * (0.85 + smoothedBass * 1.6);
			haloAngle += dt * (0.2 + smoothedEnergy * 0.45);
			vortexAngle += dt * (0.35 + smoothedBass * 0.9);

			const freq = rawMetrics.freqData;
			const time = nowTime / 1000;

			// Trigger glowing beat shockwave rings on audio transients
			if (isPlaying && (rawMetrics.beat || (smoothedBass > 0.68 && nowTime - lastBeatTime > 400))) {
				lastBeatTime = nowTime;
				shockwaves.push({
					x: cx,
					y: cy,
					radius: maxDim * 0.08,
					maxRadius: maxDim * 0.55,
					alpha: 0.75,
					speed: 160 + smoothedBass * 220,
					color: dynamicAccent || '#f59e0b'
				});
			}

			// Dynamic Color Palettes derived from Album Art by Default
			let c1 = dynamicAccent || '#f59e0b';
			let c2 = dynamicSecondary || '#ef4444';
			const curTheme = audioFx.visualizerTheme || 'artwork';

			if (curTheme === 'artwork') {
				c1 = dynamicAccent || '#f59e0b';
				c2 = dynamicSecondary || '#ef4444';
			} else if (curTheme === 'sunset') {
				c1 = '#f59e0b';
				c2 = '#ef4444';
			} else if (curTheme === 'emerald') {
				c1 = '#10b981';
				c2 = '#06b6d4';
			} else if (curTheme === 'cyberpunk') {
				c1 = '#ff0a78';
				c2 = '#00f5ff';
			} else if (curTheme === 'violet') {
				c1 = '#a855f7';
				c2 = '#3b82f6';
			} else if (curTheme === 'rainbow') {
				c1 = '#ffffff';
				c2 = '#94a3b8';
			}

			// Clean Space-Dark Backdrop (Transparent when inline for seamless theater blend)
			if (inline) {
				ctx.clearRect(0, 0, width, height);
			} else {
				ctx.fillStyle = '#04060d';
				ctx.fillRect(0, 0, width, height);
			}

			// 🌌 Soft Ambient Cosmic Aura Glow in Background
			const bgGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, maxDim * 0.72);
			bgGlow.addColorStop(0, `${c1}24`);
			bgGlow.addColorStop(0.45, `${c2}10`);
			bgGlow.addColorStop(1, 'transparent');
			ctx.fillStyle = bgGlow;
			ctx.fillRect(0, 0, width, height);

			const preset = audioFx.visualizerPreset || 'cosmic_aura';

			// -------------------------------------------------------------
			// 1. ✨ STARDUST NEBULA (Ambient Breathing Cosmos & Starfield)
			// -------------------------------------------------------------
			if (preset === 'cosmic_aura') {
				// 1. Triple Volumetric Nebula Breathing Cloud
				const nebR1 = maxDim * (0.32 + smoothedEnergy * 0.18 + smoothedBass * 0.12);
				const nebGrad1 = ctx.createRadialGradient(cx, cy, 5, cx, cy, nebR1);
				nebGrad1.addColorStop(0, `${c1}55`);
				nebGrad1.addColorStop(0.35, `${c2}28`);
				nebGrad1.addColorStop(0.75, `${c1}10`);
				nebGrad1.addColorStop(1, 'transparent');
				ctx.fillStyle = nebGrad1;
				ctx.beginPath();
				ctx.arc(cx, cy, nebR1, 0, Math.PI * 2);
				ctx.fill();

				// 2. Swirling Stardust Particles with Deep Music Reactivity
				const activeDistances: { x: number; y: number; alpha: number }[] = [];
				for (let i = 0; i < particles.length; i++) {
					const p = particles[i];
					const binVal = isPlaying ? ((freq[p.freqBin] || 0) / 255) : 0.05;

					// Accelerate orbital velocity with bass beats
					p.angle += p.angularSpeed * (1 + smoothedBass * 3.5);
					// Dynamic radial vibration reacting to assigned frequency band
					p.distance = p.baseDistance + Math.sin(time * 1.5 + i) * 12 + binVal * (maxDim * 0.08 * sens);
					p.pulsePhase += 0.05 + binVal * 0.1;

					p.x = cx + Math.cos(p.angle) * p.distance;
					p.y = cy + Math.sin(p.angle) * p.distance;

					const alpha = Math.max(0.1, Math.min(1, p.baseAlpha + Math.sin(p.pulsePhase) * 0.25 + binVal * 0.45 + smoothedEnergy * 0.25));
					const pSize = p.size * (1 + binVal * 0.8 + smoothedBass * 0.4);

					const starColor = p.colorType === 2 ? '#ffffff' : p.colorType === 0 ? c1 : c2;
					ctx.fillStyle = starColor;
					ctx.globalAlpha = alpha;
					ctx.beginPath();
					ctx.arc(p.x, p.y, pSize, 0, Math.PI * 2);
					ctx.fill();

					// Twinkle cross on bright stars
					if (alpha > 0.7 && p.size > 1.4) {
						ctx.strokeStyle = `${starColor}70`;
						ctx.lineWidth = 0.8;
						ctx.beginPath();
						ctx.moveTo(p.x - pSize * 2.2, p.y);
						ctx.lineTo(p.x + pSize * 2.2, p.y);
						ctx.moveTo(p.x, p.y - pSize * 2.2);
						ctx.lineTo(p.x, p.y + pSize * 2.2);
						ctx.stroke();
					}

					activeDistances.push({ x: p.x, y: p.y, alpha });
				}

				// 3. Constellation Filament Threads between Nearby Stars on Energy Peaks
				if (smoothedEnergy > 0.25) {
					ctx.strokeStyle = `${c1}35`;
					ctx.lineWidth = 0.8;
					for (let i = 0; i < activeDistances.length; i += 2) {
						for (let j = i + 1; j < Math.min(activeDistances.length, i + 8); j++) {
							const dx = activeDistances[i].x - activeDistances[j].x;
							const dy = activeDistances[i].y - activeDistances[j].y;
							const d2 = dx * dx + dy * dy;
							if (d2 < 4200) {
								const lineAlpha = (1 - Math.sqrt(d2) / 65) * smoothedEnergy * 0.45;
								ctx.globalAlpha = lineAlpha;
								ctx.beginPath();
								ctx.moveTo(activeDistances[i].x, activeDistances[i].y);
								ctx.lineTo(activeDistances[j].x, activeDistances[j].y);
								ctx.stroke();
							}
						}
					}
				}
				ctx.globalAlpha = 1;
			}

			// -------------------------------------------------------------
			// 2. 🌌 COSMIC VORTEX (Accretion Disk & Event Horizon Singularity)
			// -------------------------------------------------------------
			else if (preset === 'cosmic_galaxy') {
				// Central Gravitational Singularity Core
				const coreR = maxDim * (0.12 + smoothedBass * 0.08);
				const coreGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, coreR * 1.8);
				coreGrad.addColorStop(0, '#ffffff');
				coreGrad.addColorStop(0.2, c1);
				coreGrad.addColorStop(0.6, `${c2}40`);
				coreGrad.addColorStop(1, 'transparent');
				ctx.fillStyle = coreGrad;
				ctx.beginPath();
				ctx.arc(cx, cy, coreR * 1.8, 0, Math.PI * 2);
				ctx.fill();

				// Relativistic High-Energy Jet Beams
				if (smoothedTreble > 0.2) {
					const jetH = height * 0.42 * smoothedTreble;
					const jetGrad = ctx.createLinearGradient(cx, cy - jetH, cx, cy + jetH);
					jetGrad.addColorStop(0, 'transparent');
					jetGrad.addColorStop(0.48, `${c1}80`);
					jetGrad.addColorStop(0.5, '#ffffff');
					jetGrad.addColorStop(0.52, `${c1}80`);
					jetGrad.addColorStop(1, 'transparent');
					ctx.fillStyle = jetGrad;
					ctx.fillRect(cx - 2.5, cy - jetH, 5, jetH * 2);
				}

				// Dual Spiral Arm Accretion Disk Particles
				for (let i = 0; i < particles.length; i++) {
					const p = particles[i];
					const armOffset = p.armIndex * Math.PI;
					const spin = vortexAngle * (1.2 + (p.armIndex === 0 ? 0.2 : 0));
					const binVal = isPlaying ? ((freq[p.freqBin] || 0) / 255) : 0.06;

					// Logarithmic spiral geometry
					const theta = p.angle + spin + armOffset;
					const spiralR = (Math.pow(i / particles.length, 0.7) * maxDim * 0.44 + coreR) * (1 + binVal * 0.3);

					p.x = cx + Math.cos(theta) * spiralR;
					p.y = cy + Math.sin(theta) * spiralR * 0.65; // 3D tilted galactic disc

					const alpha = Math.max(0.15, Math.min(1, p.baseAlpha + binVal * 0.5 + smoothedEnergy * 0.3));
					const pSize = (p.size + binVal * 2.2) * (1 + smoothedBass * 0.3);

					ctx.fillStyle = p.armIndex === 0 ? c1 : c2;
					ctx.globalAlpha = alpha;
					ctx.beginPath();
					ctx.arc(p.x, p.y, pSize, 0, Math.PI * 2);
					ctx.fill();
				}
				ctx.globalAlpha = 1;
			}

			// -------------------------------------------------------------
			// 3. 🌊 NORTHERN AURORA (Silky Fluid Ribbons & Rising Embers)
			// -------------------------------------------------------------
			else if (preset === 'aurora_wave' || preset === 'silk_waves') {
				const waveCount = 4;
				const baseCenterY = cy + height * 0.06;

				// Vertical Auroral Curtain Light Rays
				for (let ray = 0; ray < 18; ray++) {
					const rx = (ray / 17) * width;
					const bin = Math.min(63, Math.floor((ray / 18) * 48));
					const binVal = isPlaying ? (freq[bin] || 0) / 255 : 0.05;
					if (binVal > 0.15) {
						const rayH = height * 0.55 * binVal * sens;
						const rayGrad = ctx.createLinearGradient(rx, baseCenterY - rayH, rx, baseCenterY);
						rayGrad.addColorStop(0, 'transparent');
						rayGrad.addColorStop(0.5, ray % 2 === 0 ? `${c1}25` : `${c2}20`);
						rayGrad.addColorStop(1, 'transparent');
						ctx.fillStyle = rayGrad;
						ctx.fillRect(rx - 12, baseCenterY - rayH, 24, rayH);
					}
				}

				// 4 Multi-Layered Silky Fluid Luminescent Ribbons
				for (let w = waveCount - 1; w >= 0; w--) {
					const amp = (height * 0.12 + w * 20) * (0.35 + smoothedBass * 0.85);
					const freqMod = 0.0032 + w * 0.0012;
					const speed = wavePhase * (0.75 + w * 0.32);

					ctx.save();
					ctx.beginPath();
					ctx.moveTo(0, height);

					const step = Math.max(6, Math.floor(width / 75));
					for (let x = 0; x <= width + step; x += step) {
						const binIdx = Math.min(63, Math.floor((x / width) * 36));
						const binVal = isPlaying ? ((freq[binIdx] || 0) / 255) : 0.06;

						const s1 = Math.sin(x * freqMod + speed) * amp;
						const s2 = Math.sin(x * freqMod * 2.2 - speed * 0.7) * (amp * 0.35);
						const s3 = Math.cos(x * 0.006 + speed * 1.2) * (binVal * 42);

						const y = baseCenterY + s1 + s2 + s3;
						if (x === 0) ctx.lineTo(x, y);
						else ctx.lineTo(x, y);
					}

					ctx.lineTo(width, height);
					ctx.closePath();

					const grad = ctx.createLinearGradient(0, baseCenterY - amp, width, height);
					grad.addColorStop(0, w === 0 ? `${c1}45` : w === 1 ? `${c2}30` : w === 2 ? `${c1}18` : `${c2}10`);
					grad.addColorStop(0.7, `${c2}0e`);
					grad.addColorStop(1, 'transparent');
					ctx.fillStyle = grad;
					ctx.fill();

					// Radiant Luminous Ribbon Crest
					ctx.strokeStyle = w === 0 ? c1 : w === 1 ? c2 : w === 2 ? '#ffffff90' : `${c1}60`;
					ctx.lineWidth = w === 0 ? 2.5 : 1.4;
					if (audioFx.visualizerGlow && (w === 0 || w === 1)) {
						ctx.shadowColor = w === 0 ? c1 : c2;
						ctx.shadowBlur = 15 + smoothedBass * 18;
					}
					ctx.stroke();
					ctx.restore();
				}

				// Rising Stardust Embers floating up from the Aurora horizon
				for (let i = 0; i < 40; i++) {
					const p = particles[i];
					p.y -= (0.4 + smoothedTreble * 1.5);
					if (p.y < height * 0.1) p.y = height * 0.85;
					p.x += Math.sin(time + i) * 0.5;

					const alpha = Math.max(0.1, Math.min(0.9, p.baseAlpha + smoothedEnergy * 0.4));
					ctx.fillStyle = i % 2 === 0 ? c1 : '#ffffff';
					ctx.globalAlpha = alpha;
					ctx.beginPath();
					ctx.arc(p.x, p.y, p.size * (1 + smoothedBass * 0.3), 0, Math.PI * 2);
					ctx.fill();
				}
				ctx.globalAlpha = 1;
			}

			// -------------------------------------------------------------
			// 4. 🪐 CELESTIAL SOLAR RING (Orb & Reactive Prominence Flares)
			// -------------------------------------------------------------
			else if (preset === 'radial_halo' || preset === 'radial_ring') {
				const baseRadius = maxDim * (0.2 + smoothedBass * 0.12);
				const ringPoints = 72;

				// Center Glowing Sun Orb
				const coreGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, baseRadius * 0.95);
				coreGrad.addColorStop(0, '#ffffff');
				coreGrad.addColorStop(0.3, `${c1}60`);
				coreGrad.addColorStop(0.8, `${c2}25`);
				coreGrad.addColorStop(1, 'transparent');
				ctx.fillStyle = coreGrad;
				ctx.beginPath();
				ctx.arc(cx, cy, baseRadius * 0.95, 0, Math.PI * 2);
				ctx.fill();

				// Inner delicate laser ring
				ctx.strokeStyle = '#ffffff80';
				ctx.lineWidth = 1.2;
				ctx.beginPath();
				ctx.arc(cx, cy, baseRadius * 0.85, 0, Math.PI * 2);
				ctx.stroke();

				// 72 Audio Reactive Prominence Flares
				ctx.save();
				if (audioFx.visualizerGlow) {
					ctx.shadowColor = c1;
					ctx.shadowBlur = 18 + smoothedBass * 20;
				}

				ctx.beginPath();
				for (let i = 0; i <= ringPoints; i++) {
					const angle = (i / ringPoints) * Math.PI * 2 + haloAngle;
					const normIdx = i < ringPoints / 2 ? i : ringPoints - i;
					const bin = Math.min(63, Math.floor((normIdx / (ringPoints / 2)) * 48));
					const val = isPlaying ? (freq[bin] || 0) / 255 : 0.08;
					const waveOffset = Math.sin(angle * 6 + wavePhase * 1.5) * (baseRadius * 0.06);
					const r = baseRadius + val * (maxDim * 0.22 * sens) + waveOffset;

					const x = cx + Math.cos(angle) * r;
					const y = cy + Math.sin(angle) * r;

					if (i === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				}
				ctx.closePath();

				const ringGrad = ctx.createRadialGradient(cx, cy, baseRadius, cx, cy, baseRadius * 1.8);
				ringGrad.addColorStop(0, `${c1}50`);
				ringGrad.addColorStop(0.7, `${c2}25`);
				ringGrad.addColorStop(1, 'transparent');
				ctx.fillStyle = ringGrad;
				ctx.fill();

				ctx.strokeStyle = c1;
				ctx.lineWidth = 2.4;
				ctx.stroke();
				ctx.restore();

				// Orbiting Micro-Stardust Ring (Counter-Rotating)
				for (let i = 0; i < 50; i++) {
					const ang = (i / 50) * Math.PI * 2 - haloAngle * 1.4;
					const r = baseRadius * 1.35 + Math.sin(time * 2 + i) * 8;
					const px = cx + Math.cos(ang) * r;
					const py = cy + Math.sin(ang) * r;

					ctx.fillStyle = i % 2 === 0 ? c2 : '#ffffff';
					ctx.globalAlpha = 0.7;
					ctx.beginPath();
					ctx.arc(px, py, 1.4 * (1 + smoothedBass * 0.5), 0, Math.PI * 2);
					ctx.fill();
				}
				ctx.globalAlpha = 1;
			}

			// -------------------------------------------------------------
			// 5. ⚡ SUPERNOVA QUANTUM CORE (Geodesic Pulsing Orb & Filaments)
			// -------------------------------------------------------------
			else if (preset === 'quantum_sphere') {
				const coreR = maxDim * (0.16 + smoothedBass * 0.16);
				const nodeCount = 24;

				// Luminous Multi-Layer Quantum Nucleus
				const nucGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, coreR * 1.6);
				nucGrad.addColorStop(0, '#ffffff');
				nucGrad.addColorStop(0.25, `${c1}80`);
				nucGrad.addColorStop(0.7, `${c2}30`);
				nucGrad.addColorStop(1, 'transparent');
				ctx.fillStyle = nucGrad;
				ctx.beginPath();
				ctx.arc(cx, cy, coreR * 1.6, 0, Math.PI * 2);
				ctx.fill();

				// Geodesic Energy Nodes & Lightning Filaments
				const nodes: { x: number; y: number; val: number }[] = [];
				for (let i = 0; i < nodeCount; i++) {
					const ang = (i / nodeCount) * Math.PI * 2 + haloAngle * (i % 2 === 0 ? 1 : -1);
					const bin = Math.min(63, Math.floor((i / nodeCount) * 48));
					const val = isPlaying ? (freq[bin] || 0) / 255 : 0.08;
					const r = coreR + val * (maxDim * 0.2 * sens);
					const x = cx + Math.cos(ang) * r;
					const y = cy + Math.sin(ang) * r;
					nodes.push({ x, y, val });
				}

				// Connect geodesic arcs
				ctx.strokeStyle = `${c1}70`;
				ctx.lineWidth = 1.4;
				ctx.beginPath();
				for (let i = 0; i < nodes.length; i++) {
					const next = (i + 1) % nodes.length;
					ctx.moveTo(nodes[i].x, nodes[i].y);
					ctx.lineTo(nodes[next].x, nodes[next].y);

					// Radial energy spokes to center
					if (nodes[i].val > 0.25) {
						ctx.moveTo(cx, cy);
						ctx.lineTo(nodes[i].x, nodes[i].y);
					}
				}
				ctx.stroke();

				// Nodes glow dots
				for (let i = 0; i < nodes.length; i++) {
					ctx.fillStyle = nodes[i].val > 0.4 ? '#ffffff' : c2;
					ctx.beginPath();
					ctx.arc(nodes[i].x, nodes[i].y, 2.5 + nodes[i].val * 3, 0, Math.PI * 2);
					ctx.fill();
				}
			}

			// -------------------------------------------------------------
			// 6. 💫 STELLAR CONSTELLATION WEB (Interconnected 3D Star Map)
			// -------------------------------------------------------------
			else if (preset === 'mesh_grid' || preset === 'minimal_bars' || preset === 'laser_scope') {
				// Update constellation node physics
				for (let i = 0; i < constellationNodes.length; i++) {
					const n = constellationNodes[i];
					n.x += n.vx * (1 + smoothedBass * 1.5);
					n.y += n.vy * (1 + smoothedBass * 1.5);

					// Gentle bouncing within bounds
					if (n.x < width * 0.1 || n.x > width * 0.9) n.vx *= -1;
					if (n.y < height * 0.1 || n.y > height * 0.9) n.vy *= -1;

					const binVal = isPlaying ? (freq[n.freqBin] || 0) / 255 : 0.08;
					const nSize = n.size * (1 + binVal * 1.2 + smoothedBass * 0.4);

					ctx.fillStyle = binVal > 0.4 ? '#ffffff' : (i % 2 === 0 ? c1 : c2);
					ctx.globalAlpha = Math.min(1, n.alpha + binVal * 0.5);
					ctx.beginPath();
					ctx.arc(n.x, n.y, nSize, 0, Math.PI * 2);
					ctx.fill();
				}

				// Draw glowing constellation edges
				ctx.lineWidth = 0.9;
				for (let i = 0; i < constellationNodes.length; i++) {
					for (let j = i + 1; j < constellationNodes.length; j++) {
						const dx = constellationNodes[i].x - constellationNodes[j].x;
						const dy = constellationNodes[i].y - constellationNodes[j].y;
						const d2 = dx * dx + dy * dy;
						if (d2 < 14000) {
							const dist = Math.sqrt(d2);
							const edgeAlpha = (1 - dist / 118) * (0.3 + smoothedEnergy * 0.45);
							ctx.strokeStyle = (i + j) % 2 === 0 ? `${c1}80` : `${c2}80`;
							ctx.globalAlpha = edgeAlpha;
							ctx.beginPath();
							ctx.moveTo(constellationNodes[i].x, constellationNodes[i].y);
							ctx.lineTo(constellationNodes[j].x, constellationNodes[j].y);
							ctx.stroke();
						}
					}
				}
				ctx.globalAlpha = 1;
			}

			// -------------------------------------------------------------
			// 💥 DYNAMIC BEAT SHOCKWAVE RINGS (Rippling outward on drum hits)
			// -------------------------------------------------------------
			for (let i = shockwaves.length - 1; i >= 0; i--) {
				const sw = shockwaves[i];
				sw.radius += sw.speed * dt;
				sw.alpha -= dt * 1.1;

				if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
					shockwaves.splice(i, 1);
					continue;
				}

				ctx.save();
				ctx.strokeStyle = sw.color;
				ctx.lineWidth = Math.max(1, 3 * sw.alpha);
				ctx.globalAlpha = sw.alpha * 0.8;
				ctx.beginPath();
				ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
				ctx.stroke();
				ctx.restore();
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

<!-- Visualizer Stage Container -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={studioContainer}
	class="{inline
		? 'relative h-full w-full overflow-hidden select-none'
		: 'fixed inset-0 z-[70] flex flex-col justify-between bg-[#04060d] text-white select-none overflow-hidden'}"
	transition:fade={{ duration: 250 }}
	onmousemove={handleActivity}
	ontouchstart={handleActivity}
>
	<!-- High-DPI Reactive Canvas -->
	<canvas bind:this={canvasEl} class="absolute inset-0 h-full w-full object-cover touch-none"></canvas>

	{#if inline}
		<!-- 🎛️ INLINE THEATER MODE: Sleek Floating Glass Capsule Dock (Centered with Auto-Fade & Scroll Protection) -->
		<div
			class="absolute top-2.5 sm:top-4 left-1/2 -translate-x-1/2 z-20 flex max-w-[calc(100%-1rem)] items-center gap-1.5 sm:gap-2 rounded-full border border-white/20 bg-black/80 p-1 sm:p-1.5 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.6)] transition-all duration-300 {showControls
				? 'opacity-100 scale-100 pointer-events-auto'
				: 'opacity-30 hover:opacity-100 scale-95 hover:scale-100 pointer-events-auto'}"
		>
			<!-- Preset Switcher Capsule Pills (Smooth Scrollable without ugly scrollbar) -->
			<div class="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 px-0.5 max-w-full touch-pan-x">
				{#each presets as p}
					<button
						class="flex items-center gap-1.5 rounded-full px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer {audioFx.visualizerPreset === p.id
							? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/30 font-bold scale-[1.02]'
							: 'text-white/70 hover:text-white hover:bg-white/15'}"
						onclick={(e) => {
							setVisualizerPreset(p.id);
							e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
						}}
						title={p.desc}
					>
						<span>{p.icon}</span>
						<span class="{audioFx.visualizerPreset === p.id ? 'inline' : 'hidden sm:inline'}">{p.label}</span>
					</button>
				{/each}
			</div>

			<!-- Divider -->
			<div class="h-4 w-px bg-white/25 shrink-0"></div>

			<!-- Color Theme Dots -->
			<div class="flex items-center gap-1 shrink-0 pr-1 pl-0.5">
				{#each themes as th}
					<button
						class="size-4.5 sm:size-5 rounded-full border transition-transform hover:scale-125 cursor-pointer {audioFx.visualizerTheme === th.id
							? 'ring-2 ring-white scale-110 border-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'
							: 'border-white/30 opacity-70 hover:opacity-100'}"
						style="background: linear-gradient(135deg, {th.primary}, {th.secondary});"
						onclick={() => setVisualizerTheme(th.id)}
						title={th.label}
						aria-label={th.label}
					></button>
				{/each}
			</div>
		</div>
	{:else}
		<!-- 🎛️ FULLSCREEN MODAL: Comprehensive Studio Interface with Auto-Hiding Controls -->
		<!-- Top Glass Header -->
		<header
			class="relative z-10 flex flex-col gap-2 p-3 sm:p-6 transition-opacity duration-300 {showControls
				? 'opacity-100 pointer-events-auto'
				: 'opacity-0 pointer-events-none'}"
		>
			<div class="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
				<!-- Minimalist Studio Badge -->
				<div class="flex items-center gap-2 rounded-full bg-white/[0.08] border border-white/15 px-3 py-1.5 backdrop-blur-xl shadow-lg shrink-0">
					<HugeiconsIcon icon={AudioWave01Icon} size={15} class="text-primary animate-pulse" />
					<span class="text-xs font-bold tracking-wider text-white uppercase">Aura Studio</span>
					<span class="hidden sm:inline text-[10px] text-white/60">• High-Fidelity</span>
				</div>

				<!-- Preset Switcher Pills (Smooth Scrollable for all screen widths) -->
				<div class="order-3 lg:order-2 flex items-center gap-1 rounded-full bg-black/75 p-1 border border-white/15 backdrop-blur-xl shadow-2xl overflow-x-auto scrollbar-none max-w-full touch-pan-x">
					{#each presets as p}
						<button
							class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer {audioFx.visualizerPreset === p.id
								? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/30 font-bold'
								: 'text-white/70 hover:text-white hover:bg-white/15'}"
							onclick={(e) => {
								setVisualizerPreset(p.id);
								e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
							}}
							title={p.desc}
						>
							<span>{p.icon}</span>
							<span>{p.label}</span>
						</button>
					{/each}
				</div>

				<!-- Right Actions: Color Theme, Fullscreen, Close -->
				<div class="order-2 lg:order-3 flex items-center gap-2 shrink-0 ml-auto">
					<div class="flex items-center gap-1 rounded-full bg-black/75 p-1 border border-white/15 backdrop-blur-xl">
						{#each themes as th}
							<button
								class="size-5 sm:size-5.5 rounded-full border transition-transform hover:scale-125 cursor-pointer {audioFx.visualizerTheme === th.id
									? 'ring-2 ring-white scale-110 border-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'
									: 'border-white/30 opacity-70 hover:opacity-100'}"
								style="background: linear-gradient(135deg, {th.primary}, {th.secondary});"
								onclick={() => setVisualizerTheme(th.id)}
								title={th.label}
								aria-label={th.label}
							></button>
						{/each}
					</div>

					<button
						class="flex size-8 sm:size-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xl transition hover:bg-white/20 active:scale-90 cursor-pointer"
						onclick={toggleFullscreen}
						aria-label="Toggle Fullscreen"
					>
						<HugeiconsIcon icon={isFullscreen ? Minimize01Icon : Maximize01Icon} size={17} />
					</button>

					<button
						class="flex size-8 sm:size-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xl transition hover:bg-red-500/80 active:scale-90 cursor-pointer"
						onclick={onClose}
						aria-label="Close Visualizer"
					>
						<HugeiconsIcon icon={Cancel01Icon} size={17} />
					</button>
				</div>
			</div>
		</header>

		<!-- Bottom Transport HUD Controls -->
		<footer
			class="relative z-10 flex flex-col gap-3 p-4 sm:px-8 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] transition-opacity duration-300 {showControls
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
					class="flex size-9 items-center justify-center rounded-full text-white/70 hover:text-white transition active:scale-90 cursor-pointer"
					onclick={() => api.toggleShuffle()}
					aria-label="Shuffle"
				>
					<HugeiconsIcon icon={ShuffleIcon} size={18} class={playback.queue.shuffle ? 'text-primary' : ''} />
				</button>

				<button
					class="flex size-10 items-center justify-center rounded-full text-white hover:scale-110 active:scale-90 transition cursor-pointer"
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
					class="flex size-10 items-center justify-center rounded-full text-white hover:scale-110 active:scale-90 transition cursor-pointer"
					onclick={() => api.nextTrack()}
					aria-label="Next"
				>
					<HugeiconsIcon icon={NextIcon} size={20} />
				</button>

				<button
					class="flex size-9 items-center justify-center rounded-full text-white/70 hover:text-white transition active:scale-90 cursor-pointer"
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
	{/if}
</div>
