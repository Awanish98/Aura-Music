<script lang="ts">
	// State-of-the-Art Minimalist Live Audio-Reactive Fluid Gradient Aura System
	// Implements dynamic route palettes, album-art-reactive ambient chromatic lighting,
	// pointer-reactive aura tracking with spring inertia, and live audio-frequency ballistics.
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';
	import { playback } from '$lib/player.svelte';
	import { custom } from '$lib/theme.svelte';
	import { artworkAccent } from '$lib/artcolor';
	import { thumb } from '$lib/thumb';
	import { hexToHsv, hsvToHex } from '$lib/color';
	import { webPlayer } from '$lib/webplayer';

	let {
		variant = 'auto',
		intensity = 'medium',
		interactive = true,
		reactiveToArtwork = true
	}: {
		variant?: 'home' | 'discover' | 'aidj' | 'radio' | 'library' | 'nowplaying' | 'settings' | 'auto';
		intensity?: 'subtle' | 'medium' | 'cinematic';
		interactive?: boolean;
		reactiveToArtwork?: boolean;
	} = $props();

	// Curated Palette Tokens
	const AURA_COLORS = {
		bg: '#04050a',
		primary: '#FF0A78',
		pink: '#EC4899',
		purple: '#8B5CF6',
		violet: '#6D28D9',
		indigo: '#4F46E5',
		blue: '#3B82F6',
		cyan: '#06B6D4',
		emerald: '#10B981',
		amber: '#F59E0B'
	};

	let mouseX = $state(50);
	let mouseY = $state(40);
	let targetX = 50;
	let targetY = 40;
	let isTouch = $state(false);
	let reducedMotion = $state(false);
	let animFrame: number | null = null;
	let extractedAccent = $state<string | null>(null);

	// Audio Reactive Ballistics (Live Bass & Energy Pulse)
	let liveBass = $state(0);
	let liveEnergy = $state(0);
	let liveTreble = $state(0);

	let canvasEl: HTMLCanvasElement | null = $state(null);

	// Extract artwork accent whenever playing track changes
	$effect(() => {
		const trackThumb = playback.now?.thumbnail;
		if (reactiveToArtwork && trackThumb) {
			const url = thumb(trackThumb, 120);
			artworkAccent(url)
				.then((hex) => {
					extractedAccent = hex;
				})
				.catch(() => {
					extractedAccent = null;
				});
		} else if (!trackThumb) {
			extractedAccent = null;
		}
	});

	// Route-aware active palette computation
	const activeRoute = $derived(page?.url?.pathname || '/');

	const palette = $derived.by(() => {
		const targetVariant =
			variant === 'auto'
				? activeRoute === '/'
					? 'home'
					: activeRoute.startsWith('/discover') || activeRoute.startsWith('/search')
						? 'discover'
						: activeRoute.startsWith('/radio')
							? 'radio'
							: activeRoute.startsWith('/library')
								? 'library'
								: activeRoute.startsWith('/settings')
									? 'settings'
									: 'home'
				: variant;

		const activeAccent = extractedAccent || custom.accent;

		// When artwork accent is active, derive dynamic harmonious chromatic hues
		if (reactiveToArtwork && activeAccent) {
			const hsv = hexToHsv(activeAccent);
			const complementary = hsv
				? hsvToHex({ h: (hsv.h + 45) % 360, s: Math.min(0.75, Math.max(0.4, hsv.s)), v: 0.88 })
				: AURA_COLORS.purple;
			const tertiary = hsv
				? hsvToHex({ h: (hsv.h + 170) % 360, s: Math.min(0.65, Math.max(0.35, hsv.s)), v: 0.92 })
				: AURA_COLORS.cyan;
			const fourth = hsv
				? hsvToHex({ h: (hsv.h + 290) % 360, s: Math.min(0.7, Math.max(0.4, hsv.s)), v: 0.82 })
				: AURA_COLORS.violet;

			return {
				c1: activeAccent,
				c2: complementary,
				c3: tertiary,
				c4: fourth,
				opacity: intensity === 'cinematic' ? 0.46 : intensity === 'medium' ? 0.36 : 0.26
			};
		}

		switch (targetVariant) {
			case 'discover':
				return {
					c1: AURA_COLORS.blue,
					c2: AURA_COLORS.purple,
					c3: AURA_COLORS.cyan,
					c4: AURA_COLORS.violet,
					opacity: 0.32
				};
			case 'aidj':
				return {
					c1: AURA_COLORS.primary,
					c2: AURA_COLORS.violet,
					c3: AURA_COLORS.cyan,
					c4: AURA_COLORS.purple,
					opacity: 0.42
				};
			case 'radio':
				return {
					c1: AURA_COLORS.cyan,
					c2: AURA_COLORS.blue,
					c3: AURA_COLORS.emerald,
					c4: AURA_COLORS.violet,
					opacity: 0.34
				};
			case 'library':
				return {
					c1: AURA_COLORS.violet,
					c2: AURA_COLORS.indigo,
					c3: AURA_COLORS.blue,
					c4: '#1E1B4B',
					opacity: 0.28
				};
			case 'settings':
				return {
					c1: '#1E1B4B',
					c2: '#0F172A',
					c3: AURA_COLORS.violet,
					c4: '#03040A',
					opacity: 0.18
				};
			case 'nowplaying':
				return {
					c1: AURA_COLORS.primary,
					c2: AURA_COLORS.purple,
					c3: AURA_COLORS.cyan,
					c4: AURA_COLORS.violet,
					opacity: 0.45
				};
			case 'home':
			default:
				return {
					c1: AURA_COLORS.primary,
					c2: AURA_COLORS.purple,
					c3: AURA_COLORS.blue,
					c4: AURA_COLORS.violet,
					opacity: intensity === 'cinematic' ? 0.44 : intensity === 'medium' ? 0.34 : 0.25
				};
		}
	});

	function handleMouseMove(e: MouseEvent) {
		if (isTouch || reducedMotion || !interactive) return;
		targetX = (e.clientX / window.innerWidth) * 100;
		targetY = (e.clientY / window.innerHeight) * 100;
	}

	// Clean Energy & Mobile Low-Power Detection
	let isMobile = $state(false);

	onMount(() => {
		const checkMobile = () => {
			isMobile = window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches;
			isTouch = window.matchMedia('(pointer: coarse)').matches;
		};
		checkMobile();

		const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
		reducedMotion = mql.matches;

		const motionListener = (e: MediaQueryListEvent) => {
			reducedMotion = e.matches;
		};
		mql.addEventListener('change', motionListener);

		const resizeListener = () => {
			checkMobile();
		};
		window.addEventListener('resize', resizeListener, { passive: true });

		if (!reducedMotion && !isMobile && interactive) {
			window.addEventListener('mousemove', handleMouseMove, { passive: true });
		}

		// Only initialize Canvas & Animation Loop on Non-Mobile Desktop when motion is enabled
		let ctx: CanvasRenderingContext2D | null = null;
		let w = 0;
		let h = 0;
		const dustParticles: { x: number; y: number; size: number; alpha: number; speedY: number; twinkle: number }[] = [];

		if (!isMobile && !reducedMotion && canvasEl) {
			ctx = canvasEl.getContext('2d', { alpha: true });
			w = canvasEl.width = window.innerWidth;
			h = canvasEl.height = window.innerHeight;

			const resizeCanvas = () => {
				if (!canvasEl) return;
				w = canvasEl.width = window.innerWidth;
				h = canvasEl.height = window.innerHeight;
			};
			window.addEventListener('resize', resizeCanvas, { passive: true });

			for (let i = 0; i < 20; i++) {
				dustParticles.push({
					x: Math.random() * w,
					y: Math.random() * h,
					size: Math.random() * 1.2 + 0.4,
					alpha: Math.random() * 0.35 + 0.1,
					speedY: Math.random() * 0.15 + 0.03,
					twinkle: Math.random() * 0.02 + 0.01
				});
			}
		}

		let tick = 0;
		let lastFrameTime = 0;

		function updateLoop(now: number) {
			// Tab visibility check: freeze completely if tab is hidden (phone locked / app minimized)
			if (typeof document !== 'undefined' && document.hidden) {
				animFrame = requestAnimationFrame(updateLoop);
				return;
			}

			// Throttle background particle frame rate to ~30fps for ultra-low CPU/battery consumption
			if (now - lastFrameTime < 30) {
				animFrame = requestAnimationFrame(updateLoop);
				return;
			}
			lastFrameTime = now;
			tick++;

			if (!reducedMotion && !isMobile && interactive) {
				mouseX += (targetX - mouseX) * 0.03;
				mouseY += (targetY - mouseY) * 0.03;
			}

			// Read live audio ballistics only if playing
			if (!playback.paused && playback.now) {
				const metrics = webPlayer.getAudioMetrics();
				const targetB = metrics.bass / 255;
				const targetE = metrics.energy / 255;
				liveBass += (targetB - liveBass) * 0.1;
				liveEnergy += (targetE - liveEnergy) * 0.08;
			} else {
				liveBass *= 0.90;
				liveEnergy *= 0.90;
			}

			// Render subtle micro-stardust on desktop
			if (ctx && canvasEl && !isMobile && !reducedMotion) {
				ctx.clearRect(0, 0, w, h);
				const isPlaying = !playback.paused && !!playback.now;
				const boost = isPlaying ? 1 + liveBass * 0.25 : 1;

				for (const p of dustParticles) {
					p.y -= p.speedY * boost;
					if (p.y < 0) {
						p.y = h;
						p.x = Math.random() * w;
					}
					const curAlpha = p.alpha * (0.7 + Math.sin(tick * p.twinkle) * 0.3) * (isPlaying ? 1 + liveEnergy * 0.2 : 1);
					ctx.fillStyle = `rgba(255, 255, 255, ${curAlpha})`;
					ctx.beginPath();
					ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
					ctx.fill();
				}
			}

			animFrame = requestAnimationFrame(updateLoop);
		}

		if (!isMobile && !reducedMotion) {
			animFrame = requestAnimationFrame(updateLoop);
		}

		const handleVisibility = () => {
			if (!document.hidden && !isMobile && !reducedMotion && !animFrame) {
				animFrame = requestAnimationFrame(updateLoop);
			}
		};
		document.addEventListener('visibilitychange', handleVisibility);

		return () => {
			mql.removeEventListener('change', motionListener);
			window.removeEventListener('resize', resizeListener);
			window.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('visibilitychange', handleVisibility);
			if (animFrame) cancelAnimationFrame(animFrame);
		};
	});

	onDestroy(() => {
		if (animFrame) cancelAnimationFrame(animFrame);
	});
</script>

<!-- Root GPU Fluid Gradient Container -->
<div
	class="aura-ambient-root pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
	aria-hidden="true"
	style="
		--c1: {palette.c1};
		--c2: {palette.c2};
		--c3: {palette.c3};
		--c4: {palette.c4};
		--aura-opacity: {palette.opacity * (1 + liveEnergy * 0.2)};
	"
>
	<!-- Pure Clean Luminous Canvas in Day Mode, Deep True AMOLED Black in Night Mode -->
	<div class="absolute inset-0 bg-[#f8fafc] dark:bg-[#000000] dark:bg-none transition-colors duration-500"></div>

	{#if isMobile || reducedMotion}
		<!-- ⚡ ZERO-CPU / ZERO-GPU OVERHEATING MOBILE STATIC MESH -->
		<!-- Uses pure hardware-composited static CSS radial gradients with smooth color transitions -->
		<div class="aura-mobile-mesh absolute inset-0 transition-all duration-1000 ease-out"></div>
	{:else}
		<!-- Desktop Rich Fluid Mesh Blobs -->
		<div
			class="fluid-blob blob-1"
			style="
				left: {mouseX * 0.5 + 10}%;
				top: {mouseY * 0.45 + 5}%;
				transform: translate(-50%, -50%) scale({1 + liveBass * 0.18});
			"
		></div>

		<div
			class="fluid-blob blob-2"
			style="
				right: {100 - (mouseX * 0.45 + 20)}%;
				top: {mouseY * 0.4 + 35}%;
				transform: translate(-50%, -50%) scale({1 + liveEnergy * 0.15});
			"
		></div>

		<div
			class="fluid-blob blob-3"
			style="
				left: {mouseX * 0.4 + 25}%;
				bottom: {100 - (mouseY * 0.55 + 20)}%;
				transform: translate(-50%, -50%) scale({1 + liveBass * 0.12});
			"
		></div>

		<div
			class="fluid-blob blob-4"
			style="
				left: 50%;
				top: 50%;
				transform: translate(-50%, -50%) scale({0.95 + liveEnergy * 0.2});
			"
		></div>

		<!-- Ultra-Fine Minimalist Floating Sparkles Canvas (Desktop Only) -->
		<canvas bind:this={canvasEl} class="absolute inset-0 h-full w-full pointer-events-none z-10 opacity-50"></canvas>
	{/if}

	<!-- Atmospheric Edge Vignette Mask for Pure AMOLED Contrast -->
	<div class="aura-vignette absolute inset-0 z-20 pointer-events-none"></div>
</div>

<style>
	.aura-ambient-root {
		perspective: 1200px;
		transform: translateZ(0);
		contain: strict;
		background-color: transparent;
	}

	:global(.dark) .aura-ambient-root {
		background-color: #000000;
	}

	/* Ultra-Efficient Mobile Mesh Gradient (0% CPU / 0% continuous GPU load) */
	.aura-mobile-mesh {
		opacity: calc(var(--aura-opacity, 0.32) * 0.6);
		background-image: 
			radial-gradient(circle at 15% 15%, var(--c1) 0%, transparent 45%),
			radial-gradient(circle at 85% 25%, var(--c2) 0%, transparent 50%),
			radial-gradient(circle at 50% 85%, var(--c3) 0%, transparent 45%),
			radial-gradient(circle at 80% 80%, var(--c4) 0%, transparent 40%);
		background-size: 100% 100%;
		pointer-events: none;
	}

	:global(.dark) .aura-mobile-mesh {
		opacity: calc(var(--aura-opacity, 0.38) * 0.9);
		background-image: 
			radial-gradient(circle at 20% 15%, var(--c1) 0%, transparent 55%),
			radial-gradient(circle at 80% 30%, var(--c2) 0%, transparent 55%),
			radial-gradient(circle at 35% 85%, var(--c3) 0%, transparent 50%),
			radial-gradient(circle at 85% 85%, var(--c4) 0%, transparent 45%);
	}

	.fluid-blob {
		position: absolute;
		border-radius: 50%;
		filter: blur(120px);
		mix-blend-mode: normal;
		opacity: calc(var(--aura-opacity, 0.32) * 0.2);
		transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), background 1.6s ease;
		will-change: transform, left, top;
		pointer-events: none;
	}

	:global(.dark) .fluid-blob {
		mix-blend-mode: screen;
		opacity: calc(var(--aura-opacity, 0.38) * 0.85);
		filter: blur(140px);
	}

	.blob-1 {
		width: clamp(450px, 52vw, 900px);
		height: clamp(450px, 52vw, 900px);
		background: radial-gradient(circle, var(--c1) 0%, rgba(255, 42, 122, 0.2) 40%, rgba(0, 0, 0, 0) 70%);
		animation: fluidMorph1 24s ease-in-out infinite alternate;
	}

	.blob-2 {
		width: clamp(480px, 56vw, 950px);
		height: clamp(480px, 56vw, 950px);
		background: radial-gradient(circle, var(--c2) 0%, rgba(139, 92, 246, 0.2) 40%, rgba(0, 0, 0, 0) 70%);
		animation: fluidMorph2 28s ease-in-out infinite alternate;
	}

	.blob-3 {
		width: clamp(380px, 46vw, 780px);
		height: clamp(380px, 46vw, 780px);
		background: radial-gradient(circle, var(--c3) 0%, rgba(6, 182, 212, 0.18) 40%, rgba(0, 0, 0, 0) 70%);
		animation: fluidMorph3 32s ease-in-out infinite alternate;
	}

	.blob-4 {
		width: clamp(500px, 60vw, 1000px);
		height: clamp(500px, 60vw, 1000px);
		background: radial-gradient(circle, var(--c4) 0%, rgba(217, 70, 239, 0.18) 40%, rgba(0, 0, 0, 0) 70%);
		animation: fluidMorph4 36s ease-in-out infinite alternate;
	}

	@keyframes fluidMorph1 {
		0% {
			transform: translate(-50%, -50%) scale(1) rotate(0deg);
		}
		50% {
			transform: translate(-46%, -53%) scale(1.15) rotate(90deg);
		}
		100% {
			transform: translate(-53%, -47%) scale(0.94) rotate(180deg);
		}
	}

	@keyframes fluidMorph2 {
		0% {
			transform: translate(-50%, -50%) scale(1.08) rotate(0deg);
		}
		50% {
			transform: translate(-54%, -46%) scale(0.92) rotate(-110deg);
		}
		100% {
			transform: translate(-47%, -54%) scale(1.14) rotate(-220deg);
		}
	}

	@keyframes fluidMorph3 {
		0% {
			transform: translate(-50%, -50%) scale(0.92) rotate(0deg);
		}
		50% {
			transform: translate(-47%, -52%) scale(1.12) rotate(75deg);
		}
		100% {
			transform: translate(-52%, -48%) scale(1.02) rotate(150deg);
		}
	}

	@keyframes fluidMorph4 {
		0% {
			transform: translate(-50%, -50%) scale(1) rotate(0deg);
		}
		50% {
			transform: translate(-51%, -49%) scale(1.1) rotate(-60deg);
		}
		100% {
			transform: translate(-49%, -51%) scale(0.96) rotate(-130deg);
		}
	}

	.aura-vignette {
		background: radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.35) 75%, rgba(248, 250, 252, 0.75) 100%);
		pointer-events: none;
	}

	:global(.dark) .aura-vignette {
		background: radial-gradient(ellipse at 50% 50%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 65%, #000000 100%);
	}
</style>
