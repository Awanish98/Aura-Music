<script lang="ts">
	// State-of-the-Art 60FPS Interactive Cosmic Nebula, Twinkling Constellations & Audio-Reactive Atmosphere
	import { onMount } from 'svelte';
	import { playback } from '$lib/player.svelte';
	import { webPlayer } from '$lib/webplayer';

	let canvasEl: HTMLCanvasElement | null = null;

	interface Star {
		x: number;
		y: number;
		size: number;
		baseAlpha: number;
		alpha: number;
		twinkleSpeed: number;
		twinkleOffset: number;
		vx: number;
		vy: number;
		baseVx: number;
		baseVy: number;
		color: string;
	}

	interface NebulaOrb {
		x: number;
		y: number;
		radius: number;
		color: string;
		baseX: number;
		baseY: number;
		speedX: number;
		speedY: number;
		phase: number;
		pulseAmp: number;
	}

	interface Comet {
		x: number;
		y: number;
		length: number;
		speed: number;
		angle: number;
		alpha: number;
		color: string;
		active: boolean;
	}

	onMount(() => {
		if (!canvasEl) return;
		const canvas = canvasEl;
		const ctx = canvas.getContext('2d', { alpha: true });
		if (!ctx) return;

		let animId: number;
		let width = 0;
		let height = 0;
		let mouseX = -1000;
		let mouseY = -1000;
		let targetMouseX = 0;
		let targetMouseY = 0;

		const stars: Star[] = [];
		const STAR_COUNT = 120;
		const starColors = ['#ffffff', '#ff70a6', '#c084fc', '#38bdf8', '#f472b6', '#a855f7', '#fef08a'];

		function resize() {
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			width = window.innerWidth;
			height = window.innerHeight;
			canvas.width = width * dpr;
			canvas.height = height * dpr;
			ctx?.scale(dpr, dpr);
		}

		function initStars() {
			stars.length = 0;
			for (let i = 0; i < STAR_COUNT; i++) {
				const vx = (Math.random() - 0.5) * 0.35;
				const vy = -Math.random() * 0.3 - 0.08;
				stars.push({
					x: Math.random() * width,
					y: Math.random() * height,
					size: Math.random() * 2.2 + 0.6,
					baseAlpha: Math.random() * 0.65 + 0.25,
					alpha: Math.random() * 0.8 + 0.2,
					twinkleSpeed: Math.random() * 0.03 + 0.01,
					twinkleOffset: Math.random() * Math.PI * 2,
					vx,
					vy,
					baseVx: vx,
					baseVy: vy,
					color: starColors[Math.floor(Math.random() * starColors.length)]
				});
			}
		}

		// Floating Multi-Chromatic Aurora Nebula Plasma Orbs
		const nebulae: NebulaOrb[] = [
			{ x: 0, y: 0, baseX: 0.85, baseY: 0.18, radius: 540, color: 'rgba(255, 42, 122, 0.26)', speedX: 0.0005, speedY: 0.0007, phase: 0, pulseAmp: 50 },
			{ x: 0, y: 0, baseX: 0.15, baseY: 0.28, radius: 560, color: 'rgba(139, 92, 246, 0.24)', speedX: 0.0006, speedY: 0.0004, phase: Math.PI / 3, pulseAmp: 55 },
			{ x: 0, y: 0, baseX: 0.65, baseY: 0.68, radius: 600, color: 'rgba(6, 182, 212, 0.20)', speedX: 0.0004, speedY: 0.0006, phase: Math.PI, pulseAmp: 65 },
			{ x: 0, y: 0, baseX: 0.35, baseY: 0.85, radius: 500, color: 'rgba(244, 63, 94, 0.22)', speedX: 0.0007, speedY: 0.0005, phase: Math.PI * 1.5, pulseAmp: 45 },
			{ x: 0, y: 0, baseX: 0.92, baseY: 0.75, radius: 460, color: 'rgba(99, 102, 241, 0.20)', speedX: 0.0005, speedY: 0.0008, phase: Math.PI * 0.8, pulseAmp: 50 },
			{ x: 0, y: 0, baseX: 0.5, baseY: 0.35, radius: 440, color: 'rgba(217, 70, 239, 0.18)', speedX: 0.0003, speedY: 0.0005, phase: Math.PI * 1.2, pulseAmp: 40 }
		];

		const comets: Comet[] = [
			{ x: 0, y: 0, length: 150, speed: 14, angle: Math.PI / 4, alpha: 0, color: '#ff2a7a', active: false },
			{ x: 0, y: 0, length: 130, speed: 12, angle: Math.PI / 3.8, alpha: 0, color: '#38bdf8', active: false }
		];

		function triggerComet(c: Comet) {
			c.x = Math.random() * (width * 0.7);
			c.y = Math.random() * (height * 0.25);
			c.length = Math.random() * 80 + 130;
			c.speed = Math.random() * 8 + 12;
			c.alpha = 1;
			c.active = true;
		}

		let lastCometTime = Date.now();

		function onMouseMove(e: MouseEvent) {
			targetMouseX = e.clientX;
			targetMouseY = e.clientY;
		}

		window.addEventListener('resize', () => {
			resize();
			initStars();
		});
		window.addEventListener('mousemove', onMouseMove, { passive: true });

		resize();
		initStars();

		let time = 0;

		function render() {
			if (!ctx) return;
			time += 1;

			// Smooth mouse damping
			mouseX += (targetMouseX - mouseX) * 0.08;
			mouseY += (targetMouseY - mouseY) * 0.08;

			const metrics = webPlayer.getAudioMetrics();
			const isPlaying = !playback.paused && !!playback.now;
			const bassRatio = isPlaying ? metrics.bass / 255 : 0;
			const energyRatio = isPlaying ? metrics.energy / 255 : 0;
			const musicPulse = isPlaying ? 1 + bassRatio * 0.45 : 1;

			ctx.clearRect(0, 0, width, height);

			// 1. Draw Organic Swirling Nebula Clouds with Additive Blend
			ctx.save();
			ctx.globalCompositeOperation = 'screen';
			for (const neb of nebulae) {
				const currentX = (neb.baseX * width) + Math.sin(time * neb.speedX + neb.phase) * (neb.pulseAmp * musicPulse) + (mouseX / width - 0.5) * 35;
				const currentY = (neb.baseY * height) + Math.cos(time * neb.speedY + neb.phase) * (neb.pulseAmp * musicPulse) + (mouseY / height - 0.5) * 35;
				const currentRadius = neb.radius * (isPlaying ? 1 + bassRatio * 0.15 : 1);
				
				const grad = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, currentRadius);
				grad.addColorStop(0, neb.color);
				grad.addColorStop(0.45, neb.color.replace(/[\d.]+\)$/, '0.09)'));
				grad.addColorStop(1, 'rgba(0,0,0,0)');
				ctx.fillStyle = grad;
				ctx.beginPath();
				ctx.arc(currentX, currentY, currentRadius, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.restore();

			// 2. Draw Constellation Laser Connections between Close Stars
			ctx.save();
			ctx.lineWidth = 0.7;
			const maxDist = 105;
			for (let i = 0; i < stars.length; i++) {
				for (let j = i + 1; j < stars.length; j++) {
					const dx = stars[i].x - stars[j].x;
					const dy = stars[i].y - stars[j].y;
					const dist = Math.sqrt(dx * dx + dy * dy);
					if (dist < maxDist) {
						const lineAlpha = (1 - dist / maxDist) * 0.28 * (isPlaying ? 1 + energyRatio * 0.5 : 1);
						ctx.strokeStyle = `rgba(255, 110, 180, ${lineAlpha})`;
						ctx.beginPath();
						ctx.moveTo(stars[i].x, stars[i].y);
						ctx.lineTo(stars[j].x, stars[j].y);
						ctx.stroke();
					}
				}
			}
			ctx.restore();

			// 3. Update & Draw Twinkling Stars + Mouse Gravity Interaction
			for (const star of stars) {
				// Gentle mouse gravity reaction
				const dx = mouseX - star.x;
				const dy = mouseY - star.y;
				const dist = Math.sqrt(dx * dx + dy * dy);
				if (dist < 180 && dist > 1) {
					const force = (180 - dist) / 180 * 0.6;
					star.vx += (dx / dist) * force * 0.12;
					star.vy += (dy / dist) * force * 0.12;
				}

				star.vx += (star.baseVx - star.vx) * 0.05;
				star.vy += (star.baseVy - star.vy) * 0.05;

				star.y += star.vy * (1 + energyRatio * 0.4);
				star.x += star.vx;

				if (star.y < 0) {
					star.y = height;
					star.x = Math.random() * width;
				}
				if (star.x < 0) star.x = width;
				if (star.x > width) star.x = 0;

				const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
				const alpha = Math.max(0.15, Math.min(1, (star.baseAlpha + twinkle * 0.45) * (1 + bassRatio * 0.4)));

				ctx.fillStyle = star.color;
				ctx.globalAlpha = alpha;
				ctx.beginPath();
				ctx.arc(star.x, star.y, star.size * (1 + bassRatio * 0.2), 0, Math.PI * 2);
				ctx.fill();

				// Sparkle cross diffraction spike for bright stars
				if (star.size > 1.8 && alpha > 0.65) {
					ctx.strokeStyle = star.color;
					ctx.lineWidth = 0.6;
					ctx.beginPath();
					ctx.moveTo(star.x - star.size * 2.5, star.y);
					ctx.lineTo(star.x + star.size * 2.5, star.y);
					ctx.moveTo(star.x, star.y - star.size * 2.5);
					ctx.lineTo(star.x, star.y + star.size * 2.5);
					ctx.stroke();
				}
			}
			ctx.globalAlpha = 1.0;

			// 4. Periodic Multi-Color Shooting Star Comets
			if (Date.now() - lastCometTime > 4500 && Math.random() < 0.04) {
				const availableComet = comets.find((c) => !c.active);
				if (availableComet) {
					triggerComet(availableComet);
					lastCometTime = Date.now();
				}
			}

			for (const comet of comets) {
				if (comet.active) {
					comet.x += Math.cos(comet.angle) * comet.speed;
					comet.y += Math.sin(comet.angle) * comet.speed;
					comet.alpha -= 0.011;

					if (comet.alpha <= 0 || comet.x > width || comet.y > height) {
						comet.active = false;
					} else {
						ctx.save();
						ctx.globalCompositeOperation = 'screen';
						const tailX = comet.x - Math.cos(comet.angle) * comet.length;
						const tailY = comet.y - Math.sin(comet.angle) * comet.length;
						const cometGrad = ctx.createLinearGradient(comet.x, comet.y, tailX, tailY);
						cometGrad.addColorStop(0, `rgba(255, 255, 255, ${comet.alpha * 0.95})`);
						cometGrad.addColorStop(0.25, comet.color);
						cometGrad.addColorStop(1, 'rgba(121, 40, 202, 0)');

						ctx.strokeStyle = cometGrad;
						ctx.lineWidth = 2.2;
						ctx.beginPath();
						ctx.moveTo(comet.x, comet.y);
						ctx.lineTo(tailX, tailY);
						ctx.stroke();

						// Glowing comet head
						ctx.fillStyle = '#ffffff';
						ctx.shadowColor = comet.color;
						ctx.shadowBlur = 12;
						ctx.beginPath();
						ctx.arc(comet.x, comet.y, 2, 0, Math.PI * 2);
						ctx.fill();

						ctx.restore();
					}
				}
			}

			animId = requestAnimationFrame(render);
		}

		animId = requestAnimationFrame(render);

		return () => {
			cancelAnimationFrame(animId);
			window.removeEventListener('mousemove', onMouseMove);
		};
	});
</script>

<canvas
	bind:this={canvasEl}
	class="fixed inset-0 pointer-events-none z-0 h-full w-full opacity-90 transition-opacity duration-1000"
	aria-hidden="true"
></canvas>
