<script lang="ts">
	// State-of-the-Art Apple Music & Spotify Live Canvas Motion Engine
	// With Real-Time Music Video Canvas support: plays the current track's
	// music video as a vibrant, muted looping background with audio-reactive
	// particle stardust & chromatic ambient mesh on top.
	import { onMount, onDestroy } from 'svelte';
	import { playback, audioFx } from '$lib/player.svelte';
	import { webPlayer, cleanSearchQuery } from '$lib/webplayer';
	import { fetchSearch } from '$lib/ytmusic';
	import { thumb } from '$lib/thumb';
	import { artworkAccent } from '$lib/artcolor';
	import { hexToHsv, hsvToHex } from '$lib/color';

	let {
		class: className = '',
		fit = 'cover',
		videoMode = true,
		interactive = true
	}: {
		class?: string;
		fit?: 'cover' | 'contain';
		videoMode?: boolean;
		interactive?: boolean;
	} = $props();

	let canvasEl: HTMLCanvasElement | null = $state(null);
	let videoEl: HTMLIFrameElement | null = $state(null);
	let animId: number | null = null;

	// Dynamic colors from album art
	let c1 = $state('#ff0a78');
	let c2 = $state('#8b5cf6');
	let c3 = $state('#06b6d4');
	let c4 = $state('#ec4899');

	// Resolved 11-char YouTube Video ID
	let resolvedYtId = $state<string | null>(null);

	// Resolve the real YouTube video ID for any track (even if played from JioSaavn or custom source)
	$effect(() => {
		const current = playback.now;
		if (!current) {
			resolvedYtId = null;
			return;
		}

		const rawId = current.videoId;
		// If already a valid 11-character YouTube video ID
		if (rawId && rawId.length === 11 && !rawId.includes('_') && !rawId.includes(':') && !rawId.includes('/')) {
			resolvedYtId = rawId;
			return;
		}

		// Otherwise, resolve via YouTube Music search by title + artist
		const q = cleanSearchQuery(current.title, current.artists);
		if (q) {
			fetchSearch(q)
				.then((res) => {
					const bestMatch = res.songs?.[0]?.id || res.top?.[0]?.id;
					if (bestMatch && bestMatch.length === 11) {
						resolvedYtId = bestMatch;
					}
				})
				.catch((err) => {
					console.warn('[LiveSongCanvas] YT search fallback error:', err);
				});
		}
	});

	// YouTube embed URL — autoplay, mute, loop, hide controls
	const ytSrc = $derived.by(() => {
		if (!videoMode || !resolvedYtId) return null;
		const params = new URLSearchParams({
			autoplay: '1',
			mute: '1',
			loop: '1',
			playlist: resolvedYtId,
			controls: '0',
			disablekb: '1',
			fs: '0',
			iv_load_policy: '3',
			modestbranding: '1',
			playsinline: '1',
			rel: '0',
			enablejsapi: '1'
		});
		return `https://www.youtube-nocookie.com/embed/${resolvedYtId}?${params.toString()}`;
	});

	// Synchronize play/pause with YouTube iframe via postMessage
	$effect(() => {
		const isPaused = playback.paused;
		if (videoEl && videoEl.contentWindow) {
			try {
				videoEl.contentWindow.postMessage(
					JSON.stringify({
						event: 'command',
						func: isPaused ? 'pauseVideo' : 'playVideo',
						args: []
					}),
					'*'
				);
			} catch {}
		}
	});

	// Extract dynamic colors from album art whenever track changes
	$effect(() => {
		const trackThumb = playback.now?.thumbnail;
		if (trackThumb) {
			const url = thumb(trackThumb, 120);
			artworkAccent(url)
				.then((hex) => {
					if (hex) {
						c1 = hex;
						const hsv = hexToHsv(hex);
						if (hsv) {
							c2 = hsvToHex({ h: (hsv.h + 45) % 360, s: Math.min(0.85, Math.max(0.45, hsv.s)), v: 0.92 });
							c3 = hsvToHex({ h: (hsv.h + 175) % 360, s: Math.min(0.75, Math.max(0.35, hsv.s)), v: 0.95 });
							c4 = hsvToHex({ h: (hsv.h + 295) % 360, s: Math.min(0.8, Math.max(0.4, hsv.s)), v: 0.88 });
						}
					}
				})
				.catch(() => {});
		}
	});

	onMount(() => {
		if (!canvasEl) return;
		const ctx = canvasEl.getContext('2d', { alpha: true });
		if (!ctx) return;

		let isVisible = true;
		let lastFrameTime = 0;
		let tick = 0;
		let w = 0;
		let h = 0;

		const isMobile = window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches;
		const dpr = Math.min(isMobile ? 1.25 : 1.75, window.devicePixelRatio || 1);

		const resize = () => {
			if (!canvasEl) return;
			const rect = canvasEl.getBoundingClientRect();
			w = Math.max(10, Math.floor(rect.width));
			h = Math.max(10, Math.floor(rect.height));
			canvasEl.width = w * dpr;
			canvasEl.height = h * dpr;
			ctx.scale(dpr, dpr);
		};
		resize();
		window.addEventListener('resize', resize, { passive: true });

		const observer = new IntersectionObserver((entries) => {
			isVisible = entries[0]?.isIntersecting ?? true;
		});
		if (canvasEl.parentElement) observer.observe(canvasEl.parentElement);

		// Stardust particles
		const particleCount = isMobile ? 22 : 45;
		const particles: {
			x: number; y: number; size: number; alpha: number;
			baseAlpha: number; speedY: number; speedX: number;
			phase: number; color: string;
		}[] = [];

		for (let i = 0; i < particleCount; i++) {
			particles.push({
				x: Math.random() * (w || 400),
				y: Math.random() * (h || 600),
				size: Math.random() * 2.2 + 0.6,
				alpha: Math.random() * 0.6 + 0.2,
				baseAlpha: Math.random() * 0.5 + 0.2,
				speedY: -Math.random() * 0.45 - 0.1,
				speedX: (Math.random() - 0.5) * 0.3,
				phase: Math.random() * Math.PI * 2,
				color: i % 3 === 0 ? '#ffffff' : i % 2 === 0 ? c1 : c3
			});
		}

		// Floating organic fluid blobs for Apple Music style
		const fluidBlobs = [
			{ x: 0.25, y: 0.3, radius: 0.45, speedX: 0.0006, speedY: 0.0008, phase: 0 },
			{ x: 0.75, y: 0.4, radius: 0.5, speedX: 0.0007, speedY: 0.0005, phase: Math.PI / 2 },
			{ x: 0.4, y: 0.75, radius: 0.48, speedX: 0.0005, speedY: 0.0007, phase: Math.PI },
			{ x: 0.8, y: 0.8, radius: 0.42, speedX: 0.0008, speedY: 0.0006, phase: Math.PI * 1.5 }
		];

		let smoothedBass = 0;
		let smoothedEnergy = 0;

		function render(now: number) {
			if (!canvasEl || !ctx) return;

			if (typeof document !== 'undefined' && document.hidden) {
				animId = requestAnimationFrame(render);
				return;
			}
			if (!isVisible) {
				animId = requestAnimationFrame(render);
				return;
			}
			// Throttle to ~35fps
			if (now - lastFrameTime < 28) {
				animId = requestAnimationFrame(render);
				return;
			}
			lastFrameTime = now;
			tick++;

			ctx.clearRect(0, 0, w, h);

			const isPlaying = !playback.paused && !!playback.now;
			const metrics = isPlaying ? webPlayer.getAudioMetrics() : { bass: 0, energy: 0 };
			const targetB = (metrics.bass || 0) / 255;
			const targetE = (metrics.energy || 0) / 255;

			smoothedBass += (targetB - smoothedBass) * 0.12;
			smoothedEnergy += (targetE - smoothedEnergy) * 0.10;

			const boost = isPlaying ? 1 + smoothedBass * 0.35 : 1;
			const pulse = isPlaying ? 1 + smoothedEnergy * 0.25 : 1;

			// In video mode, canvas is semi-transparent overlay — lighter blobs
			const hasVideo = !!(videoMode && ytSrc);
			const blobAlpha = hasVideo ? 0.38 : 0.95;

			// 1. Apple Music Living Fluid Chromatic Gradients
			ctx.save();
			ctx.globalCompositeOperation = hasVideo ? 'screen' : 'screen';
			ctx.globalAlpha = blobAlpha;

			const colors = [c1, c2, c3, c4];
			for (let i = 0; i < fluidBlobs.length; i++) {
				const blob = fluidBlobs[i];
				const currentX = (blob.x + Math.sin(tick * blob.speedX * 30 + blob.phase) * 0.12) * w;
				const currentY = (blob.y + Math.cos(tick * blob.speedY * 30 + blob.phase) * 0.12) * h;
				const currentRadius = Math.min(w, h) * blob.radius * boost;

				const grad = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, currentRadius);
				const color = colors[i % colors.length];
				grad.addColorStop(0, color);
				grad.addColorStop(0.45, `${color}88`);
				grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

				ctx.fillStyle = grad;
				ctx.beginPath();
				ctx.arc(currentX, currentY, currentRadius, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.restore();

			// 2. Spotify Style Wave Ribbons
			ctx.save();
			ctx.globalAlpha = hasVideo ? 0.25 : 0.75;
			ctx.lineWidth = 1.4;
			const waveCount = 3;
			for (let wv = 0; wv < waveCount; wv++) {
				const waveY = h * (0.35 + wv * 0.22);
				const waveColor = wv === 0 ? c1 : wv === 1 ? c2 : c3;
				ctx.strokeStyle = `${waveColor}45`;
				ctx.beginPath();
				for (let x = 0; x <= w; x += 12) {
					const angle = (x / w) * Math.PI * 3 + tick * 0.02 + wv;
					const y = waveY + Math.sin(angle) * (18 * pulse + (wv * 8));
					if (x === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				}
				ctx.stroke();
			}
			ctx.restore();

			// 3. Stardust particles
			ctx.save();
			for (const p of particles) {
				p.y += p.speedY * boost;
				p.x += p.speedX + Math.sin(tick * 0.02 + p.phase) * 0.2;

				if (p.y < 0) { p.y = h; p.x = Math.random() * w; }
				if (p.x < 0) p.x = w;
				if (p.x > w) p.x = 0;

				const curAlpha = Math.max(0.1, Math.min(1, (p.baseAlpha + Math.sin(tick * 0.03 + p.phase) * 0.25) * pulse));
				ctx.fillStyle = p.color;
				ctx.globalAlpha = curAlpha * (hasVideo ? 0.5 : 0.75);
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.size * (isPlaying ? 1.15 : 1), 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.restore();

			animId = requestAnimationFrame(render);
		}

		animId = requestAnimationFrame(render);

		return () => {
			if (animId) cancelAnimationFrame(animId);
			observer.disconnect();
			window.removeEventListener('resize', resize);
		};
	});

	onDestroy(() => {
		if (animId) cancelAnimationFrame(animId);
	});
</script>

<div class="h-full w-full overflow-hidden select-none {className.includes('absolute') || className.includes('fixed') ? '' : 'relative'} {className}" aria-hidden="true">

	{#if videoMode && ytSrc}
		<!-- 🎬 YouTube Video Background (Apple Music & Spotify Live Canvas Style) -->
		<div class="pointer-events-none absolute inset-0 z-0 overflow-hidden">
			<iframe
				bind:this={videoEl}
				src={ytSrc}
				title="Music Video Canvas"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				class="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[125%] w-[125%] min-h-full min-w-full"
				style="
					border: none;
					transform: translate(-50%, -50%) scale(1.35);
					filter: brightness(0.68) saturate(1.25) contrast(1.05);
				"
				referrerpolicy="no-referrer"
			></iframe>

			<!-- Dark overlay so canvas gradients & UI blend cleanly over video -->
			<div class="pointer-events-none absolute inset-0 bg-black/40"></div>
		</div>
	{/if}

	<!-- Canvas gradient + particle layer (always rendered on top) -->
	<canvas bind:this={canvasEl} class="relative z-10 h-full w-full object-{fit}"></canvas>

	<!-- Vignette & AMOLED Contrast Mask -->
	<div class="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/85 via-transparent to-black/50"></div>
	<div class="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.55)_100%)]"></div>
</div>
