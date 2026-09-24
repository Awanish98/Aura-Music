<script lang="ts">
	// High-Performance 60FPS Cosmic Aurora & Starfield Background Animation
	import { onMount } from 'svelte';

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
	}

	interface Comet {
		x: number;
		y: number;
		length: number;
		speed: number;
		angle: number;
		alpha: number;
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
		let mouseX = 0;
		let mouseY = 0;
		let targetMouseX = 0;
		let targetMouseY = 0;

		const stars: Star[] = [];
		const STAR_COUNT = 90;
		const starColors = ['#ffffff', '#ff94c2', '#b388ff', '#80d8ff', '#f48fb1'];

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
				stars.push({
					x: Math.random() * width,
					y: Math.random() * height,
					size: Math.random() * 1.8 + 0.5,
					baseAlpha: Math.random() * 0.5 + 0.2,
					alpha: Math.random() * 0.7 + 0.3,
					twinkleSpeed: Math.random() * 0.02 + 0.008,
					twinkleOffset: Math.random() * Math.PI * 2,
					vx: (Math.random() - 0.5) * 0.15,
					vy: -Math.random() * 0.2 - 0.05,
					color: starColors[Math.floor(Math.random() * starColors.length)]
				});
			}
		}

		// Floating Aurora Nebula Plasma Orbs
		const nebulae: NebulaOrb[] = [
			{ x: 0, y: 0, baseX: 0.8, baseY: 0.15, radius: 450, color: 'rgba(255, 42, 122, 0.18)', speedX: 0.0004, speedY: 0.0006, phase: 0 },
			{ x: 0, y: 0, baseX: 0.2, baseY: 0.3, radius: 480, color: 'rgba(121, 40, 202, 0.16)', speedX: 0.0005, speedY: 0.0003, phase: Math.PI / 3 },
			{ x: 0, y: 0, baseX: 0.65, baseY: 0.7, radius: 520, color: 'rgba(0, 223, 216, 0.11)', speedX: 0.0003, speedY: 0.0005, phase: Math.PI },
			{ x: 0, y: 0, baseX: 0.4, baseY: 0.85, radius: 420, color: 'rgba(235, 14, 153, 0.14)', speedX: 0.0006, speedY: 0.0004, phase: Math.PI * 1.5 },
			{ x: 0, y: 0, baseX: 0.9, baseY: 0.8, radius: 380, color: 'rgba(99, 102, 241, 0.13)', speedX: 0.0004, speedY: 0.0007, phase: Math.PI * 0.8 }
		];

		const comet: Comet = {
			x: 0,
			y: 0,
			length: 120,
			speed: 12,
			angle: Math.PI / 4,
			alpha: 0,
			active: false
		};

		function triggerComet() {
			comet.x = Math.random() * (width * 0.6);
			comet.y = Math.random() * (height * 0.2);
			comet.length = Math.random() * 80 + 100;
			comet.speed = Math.random() * 6 + 10;
			comet.alpha = 1;
			comet.active = true;
		}

		let lastCometTime = Date.now();

		function onMouseMove(e: MouseEvent) {
			targetMouseX = (e.clientX / width - 0.5) * 40;
			targetMouseY = (e.clientY / height - 0.5) * 40;
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
			mouseX += (targetMouseX - mouseX) * 0.05;
			mouseY += (targetMouseY - mouseY) * 0.05;

			ctx.clearRect(0, 0, width, height);

			// 1. Draw Nebula Orbs with Additive Blending
			ctx.save();
			ctx.globalCompositeOperation = 'screen';
			for (const neb of nebulae) {
				const currentX = (neb.baseX * width) + Math.sin(time * neb.speedX + neb.phase) * 90 + mouseX * 0.6;
				const currentY = (neb.baseY * height) + Math.cos(time * neb.speedY + neb.phase) * 70 + mouseY * 0.6;
				const grad = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, neb.radius);
				grad.addColorStop(0, neb.color);
				grad.addColorStop(0.5, neb.color.replace(/[\d.]+\)$/, '0.05)'));
				grad.addColorStop(1, 'rgba(0,0,0,0)');
				ctx.fillStyle = grad;
				ctx.beginPath();
				ctx.arc(currentX, currentY, neb.radius, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.restore();

			// 2. Draw Twinkling Starfield
			for (const star of stars) {
				star.y += star.vy;
				star.x += star.vx;

				if (star.y < 0) {
					star.y = height;
					star.x = Math.random() * width;
				}
				if (star.x < 0) star.x = width;
				if (star.x > width) star.x = 0;

				const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
				const alpha = Math.max(0.1, star.baseAlpha + twinkle * 0.4);

				const drawX = star.x + mouseX * 0.2;
				const drawY = star.y + mouseY * 0.2;

				ctx.fillStyle = star.color;
				ctx.globalAlpha = alpha;
				ctx.beginPath();
				ctx.arc(drawX, drawY, star.size, 0, Math.PI * 2);
				ctx.fill();

				// Draw sparkle cross for larger stars
				if (star.size > 1.8 && alpha > 0.6) {
					ctx.strokeStyle = star.color;
					ctx.lineWidth = 0.5;
					ctx.beginPath();
					ctx.moveTo(drawX - star.size * 2, drawY);
					ctx.lineTo(drawX + star.size * 2, drawY);
					ctx.moveTo(drawX, drawY - star.size * 2);
					ctx.lineTo(drawX, drawY + star.size * 2);
					ctx.stroke();
				}
			}
			ctx.globalAlpha = 1.0;

			// 3. Periodic Shooting Star / Comet
			if (Date.now() - lastCometTime > 7000 && !comet.active && Math.random() < 0.02) {
				triggerComet();
				lastCometTime = Date.now();
			}

			if (comet.active) {
				comet.x += Math.cos(comet.angle) * comet.speed;
				comet.y += Math.sin(comet.angle) * comet.speed;
				comet.alpha -= 0.012;

				if (comet.alpha <= 0 || comet.x > width || comet.y > height) {
					comet.active = false;
				} else {
					ctx.save();
					ctx.globalCompositeOperation = 'screen';
					const tailX = comet.x - Math.cos(comet.angle) * comet.length;
					const tailY = comet.y - Math.sin(comet.angle) * comet.length;
					const cometGrad = ctx.createLinearGradient(comet.x, comet.y, tailX, tailY);
					cometGrad.addColorStop(0, `rgba(255, 255, 255, ${comet.alpha * 0.9})`);
					cometGrad.addColorStop(0.3, `rgba(255, 42, 122, ${comet.alpha * 0.7})`);
					cometGrad.addColorStop(1, 'rgba(121, 40, 202, 0)');

					ctx.strokeStyle = cometGrad;
					ctx.lineWidth = 1.8;
					ctx.beginPath();
					ctx.moveTo(comet.x, comet.y);
					ctx.lineTo(tailX, tailY);
					ctx.stroke();
					ctx.restore();
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
	class="fixed inset-0 pointer-events-none -z-20 h-full w-full opacity-90 transition-opacity duration-1000"
	aria-hidden="true"
></canvas>
