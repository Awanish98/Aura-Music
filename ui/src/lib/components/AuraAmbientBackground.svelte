<script lang="ts">
	// Centralized GPU-Accelerated Aura Ambient Background System
	// Implements dynamic route-reactive palettes, album-art-reactive ambient lighting,
	// pointer-reactive aura tracking (desktop only), and prefers-reduced-motion compatibility.
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';
	import { playback } from '$lib/player.svelte';
	import { custom, appearance } from '$lib/theme.svelte';
	import { artworkAccent } from '$lib/artcolor';
	import { thumb } from '$lib/thumb';
	import { hexToHsv, hsvToHex } from '$lib/color';

	let {
		variant = 'auto',
		intensity = 'subtle',
		interactive = true,
		reactiveToArtwork = true
	}: {
		variant?: 'home' | 'discover' | 'aidj' | 'radio' | 'library' | 'nowplaying' | 'settings' | 'auto';
		intensity?: 'subtle' | 'medium' | 'cinematic';
		interactive?: boolean;
		reactiveToArtwork?: boolean;
	} = $props();

	// Color Palette Tokens
	const AURA_COLORS = {
		bg0: '#03040A',
		bg1: '#050711',
		bg2: '#080914',
		primary: '#FF0A78',
		purple: '#8B5CF6',
		blue: '#3B82F6',
		cyan: '#22D3EE',
		deepViolet: '#6D28D9'
	};

	let mouseX = $state(50);
	let mouseY = $state(40);
	let targetX = 50;
	let targetY = 40;
	let isTouch = $state(false);
	let reducedMotion = $state(false);
	let animFrame: number | null = null;
	let extractedAccent = $state<string | null>(null);

	// Extract artwork accent whenever playing track changes
	$effect(() => {
		const trackThumb = playback.now?.thumbnail;
		if (reactiveToArtwork && trackThumb) {
			const url = thumb(trackThumb, 120);
			artworkAccent(url).then((hex) => {
				extractedAccent = hex;
			}).catch(() => {
				extractedAccent = null;
			});
		} else if (!trackThumb) {
			extractedAccent = null;
		}
	});

	// Route-aware active palette computation
	const activeRoute = $derived(page?.url?.pathname || '/');

	const palette = $derived.by(() => {
		const targetVariant = variant === 'auto'
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

		// If artwork accent or custom accent is available
		if (reactiveToArtwork && activeAccent) {
			const hsv = hexToHsv(activeAccent);
			const complementary = hsv ? hsvToHex({ h: (hsv.h + 60) % 360, s: Math.min(0.7, hsv.s), v: 0.85 }) : AURA_COLORS.purple;
			const tertiary = hsv ? hsvToHex({ h: (hsv.h + 180) % 360, s: Math.min(0.6, hsv.s), v: 0.9 }) : AURA_COLORS.cyan;

			return {
				c1: activeAccent,
				c2: complementary,
				c3: tertiary,
				c4: AURA_COLORS.deepViolet,
				opacity: intensity === 'cinematic' ? 0.45 : intensity === 'medium' ? 0.32 : 0.22
			};
		}

		switch (targetVariant) {
			case 'discover':
				return {
					c1: AURA_COLORS.blue,
					c2: AURA_COLORS.purple,
					c3: '#6366F1',
					c4: AURA_COLORS.deepViolet,
					opacity: 0.25
				};
			case 'aidj':
				return {
					c1: AURA_COLORS.primary,
					c2: AURA_COLORS.deepViolet,
					c3: AURA_COLORS.cyan,
					c4: AURA_COLORS.purple,
					opacity: 0.38
				};
			case 'radio':
				return {
					c1: AURA_COLORS.blue,
					c2: AURA_COLORS.cyan,
					c3: '#0284C7',
					c4: AURA_COLORS.purple,
					opacity: 0.28
				};
			case 'library':
				return {
					c1: AURA_COLORS.deepViolet,
					c2: AURA_COLORS.blue,
					c3: AURA_COLORS.purple,
					c4: '#1E1B4B',
					opacity: 0.22
				};
			case 'settings':
				return {
					c1: '#1E1B4B',
					c2: '#0F172A',
					c3: AURA_COLORS.deepViolet,
					c4: '#03040A',
					opacity: 0.12
				};
			case 'nowplaying':
				return {
					c1: AURA_COLORS.primary,
					c2: AURA_COLORS.purple,
					c3: AURA_COLORS.cyan,
					c4: AURA_COLORS.deepViolet,
					opacity: 0.40
				};
			case 'home':
			default:
				return {
					c1: AURA_COLORS.primary,
					c2: AURA_COLORS.purple,
					c3: AURA_COLORS.blue,
					c4: AURA_COLORS.deepViolet,
					opacity: intensity === 'cinematic' ? 0.40 : intensity === 'medium' ? 0.28 : 0.20
				};
		}
	});

	function handleMouseMove(e: MouseEvent) {
		if (isTouch || reducedMotion || !interactive) return;
		targetX = (e.clientX / window.innerWidth) * 100;
		targetY = (e.clientY / window.innerHeight) * 100;
	}

	function updateLerp() {
		if (!reducedMotion && !isTouch && interactive) {
			mouseX += (targetX - mouseX) * 0.04;
			mouseY += (targetY - mouseY) * 0.04;
		}
		animFrame = requestAnimationFrame(updateLerp);
	}

	onMount(() => {
		isTouch = window.matchMedia('(pointer: coarse)').matches;
		const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
		reducedMotion = mql.matches;

		const motionListener = (e: MediaQueryListEvent) => {
			reducedMotion = e.matches;
		};
		mql.addEventListener('change', motionListener);

		if (!reducedMotion && !isTouch && interactive) {
			window.addEventListener('mousemove', handleMouseMove, { passive: true });
			animFrame = requestAnimationFrame(updateLerp);
		}

		return () => {
			mql.removeEventListener('change', motionListener);
			window.removeEventListener('mousemove', handleMouseMove);
			if (animFrame) cancelAnimationFrame(animFrame);
		};
	});

	onDestroy(() => {
		if (animFrame) cancelAnimationFrame(animFrame);
	});
</script>

<div
	class="aura-ambient-container pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
	aria-hidden="true"
	style="--c1: {palette.c1}; --c2: {palette.c2}; --c3: {palette.c3}; --c4: {palette.c4}; --aura-opacity: {palette.opacity};"
>
	<!-- Deep Studio Black Base Layer -->
	<div class="absolute inset-0 bg-[#03040A]"></div>

	<!-- Primary Moving Atmospheric Gradient Orb 1 -->
	<div
		class="aura-orb aura-orb-1"
		class:aura-reduced={reducedMotion}
		style="left: {mouseX * 0.7 + 10}%; top: {mouseY * 0.6 + 5}%;"
	></div>

	<!-- Secondary Counter-Moving Gradient Orb 2 -->
	<div
		class="aura-orb aura-orb-2"
		class:aura-reduced={reducedMotion}
		style="right: {100 - (mouseX * 0.6 + 20)}%; top: {mouseY * 0.5 + 40}%;"
	></div>

	<!-- Accent Cyan / Electric Violet Core Orb 3 -->
	<div
		class="aura-orb aura-orb-3"
		class:aura-reduced={reducedMotion}
		style="left: {mouseX * 0.5 + 25}%; bottom: {100 - (mouseY * 0.7 + 15)}%;"
	></div>

	<!-- Atmospheric Ambient Grain & Specular Vignette -->
	<div class="aura-vignette absolute inset-0"></div>
	<div class="aura-mesh-layer absolute inset-0"></div>
</div>

<style>
	.aura-ambient-container {
		perspective: 1000px;
		transform: translateZ(0);
		contain: strict;
	}

	.aura-orb {
		position: absolute;
		border-radius: 50%;
		filter: blur(90px);
		mix-blend-mode: screen;
		opacity: var(--aura-opacity, 0.25);
		transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 1.5s ease;
		will-change: transform, left, top;
		transform: translate(-50%, -50%);
		pointer-events: none;
	}

	.aura-orb-1 {
		width: clamp(380px, 48vw, 750px);
		height: clamp(380px, 48vw, 750px);
		background: radial-gradient(circle, var(--c1) 0%, rgba(255, 10, 120, 0) 70%);
		animation: auraPulse 18s ease-in-out infinite alternate;
	}

	.aura-orb-2 {
		width: clamp(420px, 52vw, 820px);
		height: clamp(420px, 52vw, 820px);
		background: radial-gradient(circle, var(--c2) 0%, rgba(139, 92, 246, 0) 70%);
		animation: auraFloat 24s ease-in-out infinite alternate;
	}

	.aura-orb-3 {
		width: clamp(320px, 40vw, 650px);
		height: clamp(320px, 40vw, 650px);
		background: radial-gradient(circle, var(--c3) 0%, rgba(34, 211, 238, 0) 70%);
		animation: auraDrift 28s ease-in-out infinite alternate;
	}

	.aura-reduced {
		animation: none !important;
		filter: blur(120px) !important;
	}

	@keyframes auraPulse {
		0% {
			transform: translate(-50%, -50%) scale(1) rotate(0deg);
		}
		50% {
			transform: translate(-45%, -52%) scale(1.18) rotate(90deg);
		}
		100% {
			transform: translate(-52%, -48%) scale(0.92) rotate(180deg);
		}
	}

	@keyframes auraFloat {
		0% {
			transform: translate(-50%, -50%) scale(1.1) rotate(0deg);
		}
		50% {
			transform: translate(-55%, -45%) scale(0.95) rotate(-120deg);
		}
		100% {
			transform: translate(-48%, -54%) scale(1.15) rotate(-240deg);
		}
	}

	@keyframes auraDrift {
		0% {
			transform: translate(-50%, -50%) scale(0.9) rotate(0deg);
		}
		50% {
			transform: translate(-46%, -53%) scale(1.12) rotate(60deg);
		}
		100% {
			transform: translate(-54%, -47%) scale(1) rotate(120deg);
		}
	}

	.aura-vignette {
		background: radial-gradient(ellipse at 50% 50%, rgba(3, 4, 10, 0) 0%, rgba(3, 4, 10, 0.65) 75%, rgba(3, 4, 10, 0.95) 100%);
		pointer-events: none;
	}

	.aura-mesh-layer {
		background-image: radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px);
		background-size: 32px 32px;
		opacity: 0.35;
		pointer-events: none;
	}
</style>
