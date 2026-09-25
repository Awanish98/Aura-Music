<script lang="ts">
	// State-of-the-Art Animated Day & Night Sky Toggle Switch
	// Inspired by react-night-toggle and modern celestial skymorphic physics
	// Features: Sun with solar corona, cratered pearlescent Moon, drifting puffy clouds, and twinkling constellations
	import { mode, toggleMode, setMode } from 'mode-watcher';

	let {
		size = 'sm',
		class: extraClass = '',
		showLabel = false
	}: {
		size?: 'sm' | 'md' | 'lg';
		class?: string;
		showLabel?: boolean;
	} = $props();

	const isDark = $derived(mode.current === 'dark');

	function handleToggle() {
		toggleMode();
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			toggleMode();
		}
	}
</script>

<div class="inline-flex items-center gap-2 select-none {extraClass}">
	<button
		type="button"
		role="switch"
		aria-checked={isDark}
		aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
		title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
		onclick={handleToggle}
		onkeydown={handleKeyDown}
		class="night-toggle-track relative inline-flex shrink-0 cursor-pointer overflow-hidden rounded-full border transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/80 {size === 'sm'
			? 'h-7 w-[52px] border-sky-300/40 dark:border-white/15'
			: size === 'lg'
				? 'h-10 w-[74px] border-sky-300/50 dark:border-white/20'
				: 'h-8 w-[60px] border-sky-300/40 dark:border-white/15'}"
		class:dark-sky={isDark}
		class:light-sky={!isDark}
	>
		<!-- ========================================================================= -->
		<!-- SKY BACKGROUND & CELESTIAL ATMOSPHERE                                     -->
		<!-- ========================================================================= -->

		<!-- DAY SKY: Floating Puffy Clouds Layer -->
		<div class="clouds-layer absolute inset-0 pointer-events-none transition-all duration-500 {isDark ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'}">
			<!-- Cloud 1 -->
			<div class="cloud cloud-1 absolute bg-white/90 rounded-full"></div>
			<div class="cloud cloud-2 absolute bg-white/80 rounded-full"></div>
			<div class="cloud cloud-3 absolute bg-white/95 rounded-full"></div>
			<div class="cloud cloud-4 absolute bg-white/75 rounded-full"></div>
		</div>

		<!-- NIGHT SKY: Twinkling Constellations & Galaxy Stars Layer -->
		<div class="stars-layer absolute inset-0 pointer-events-none transition-all duration-500 {isDark ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}">
			<!-- Star 1 (Big Twinkle) -->
			<div class="star star-1 absolute bg-white rounded-full"></div>
			<!-- Star 2 (Medium) -->
			<div class="star star-2 absolute bg-amber-100 rounded-full"></div>
			<!-- Star 3 (Small) -->
			<div class="star star-3 absolute bg-white rounded-full"></div>
			<!-- Star 4 (Tiny) -->
			<div class="star star-4 absolute bg-cyan-100 rounded-full"></div>
			<!-- Star 5 (Cross Sparkle) -->
			<div class="star star-5 absolute">
				<div class="h-full w-full bg-white rounded-full"></div>
			</div>
			<!-- Star 6 -->
			<div class="star star-6 absolute bg-white rounded-full"></div>
		</div>

		<!-- ========================================================================= -->
		<!-- THE CELESTIAL THUMB (SUN -> MOON WITH CRATERS)                            -->
		<!-- ========================================================================= -->
		<div
			class="celestial-thumb absolute rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center justify-center {size === 'sm'
				? 'top-[2px] h-[22px] w-[22px]'
				: size === 'lg'
					? 'top-[3px] h-[32px] w-[32px]'
					: 'top-[2.5px] h-[25px] w-[25px]'}"
			style="transform: translateX({isDark ? (size === 'sm' ? '26px' : size === 'lg' ? '37px' : '30px') : (size === 'sm' ? '2px' : size === 'lg' ? '3px' : '2.5px')});"
		>
			<!-- Sun Body (Day Mode) -->
			<div
				class="sun-body absolute inset-0 rounded-full transition-all duration-500 {isDark ? 'opacity-0 scale-75 rotate-90' : 'opacity-100 scale-100 rotate-0'}"
			>
				<!-- Sun Core Gradient -->
				<div class="h-full w-full rounded-full bg-gradient-to-tr from-[#f59e0b] via-[#fbbf24] to-[#fef08a] shadow-[0_0_12px_rgba(251,191,36,0.85)] ring-1 ring-amber-300/60"></div>
				<!-- Solar Highlights -->
				<div class="absolute top-[20%] left-[20%] size-[35%] rounded-full bg-white/60 blur-[0.5px]"></div>
			</div>

			<!-- Moon Body with Realistic Lunar Craters (Night Mode) -->
			<div
				class="moon-body absolute inset-0 rounded-full transition-all duration-500 {isDark ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-90'}"
			>
				<!-- Moon Pearlescent Surface Gradient -->
				<div class="h-full w-full rounded-full bg-gradient-to-tr from-[#94a3b8] via-[#e2e8f0] to-[#ffffff] shadow-[0_0_10px_rgba(226,232,240,0.6)] ring-1 ring-white/80"></div>
				
				<!-- Lunar Crater 1 (Large) -->
				<div class="crater crater-1 absolute rounded-full bg-[#64748b]/40 shadow-inner"></div>
				<!-- Lunar Crater 2 (Medium) -->
				<div class="crater crater-2 absolute rounded-full bg-[#64748b]/35 shadow-inner"></div>
				<!-- Lunar Crater 3 (Small) -->
				<div class="crater crater-3 absolute rounded-full bg-[#64748b]/30 shadow-inner"></div>
			</div>
		</div>
	</button>

	{#if showLabel}
		<span class="text-xs font-bold text-slate-700 dark:text-slate-300">
			{isDark ? 'Night' : 'Day'}
		</span>
	{/if}
</div>

<style>
	/* Sky Gradients */
	.light-sky {
		background: linear-gradient(135deg, #38bdf8 0%, #60a5fa 50%, #93c5fd 100%);
		box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(56, 189, 248, 0.25);
	}

	.dark-sky {
		background: linear-gradient(135deg, #090d16 0%, #151a30 50%, #1e264a 100%);
		box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.6), 0 2px 10px rgba(0, 0, 0, 0.5);
	}

	/* Micro Clouds */
	.cloud-1 {
		right: 3px;
		bottom: -2px;
		width: 24px;
		height: 10px;
	}
	.cloud-2 {
		right: 12px;
		bottom: 3px;
		width: 14px;
		height: 14px;
	}
	.cloud-3 {
		right: 4px;
		bottom: 5px;
		width: 11px;
		height: 11px;
	}
	.cloud-4 {
		right: 18px;
		bottom: -2px;
		width: 16px;
		height: 8px;
	}

	/* Stars */
	.star-1 {
		left: 8px;
		top: 6px;
		width: 3px;
		height: 3px;
		animation: starTwinkle 2.4s ease-in-out infinite alternate;
	}
	.star-2 {
		left: 17px;
		top: 14px;
		width: 2px;
		height: 2px;
		animation: starTwinkle 1.8s ease-in-out infinite alternate 0.6s;
	}
	.star-3 {
		left: 13px;
		top: 18px;
		width: 1.5px;
		height: 1.5px;
		animation: starTwinkle 3s ease-in-out infinite alternate 1.2s;
	}
	.star-4 {
		left: 22px;
		top: 7px;
		width: 2px;
		height: 2px;
		animation: starTwinkle 2s ease-in-out infinite alternate 0.3s;
	}
	.star-5 {
		left: 5px;
		top: 16px;
		width: 2px;
		height: 2px;
		animation: starTwinkle 2.8s ease-in-out infinite alternate 0.9s;
	}
	.star-6 {
		left: 12px;
		top: 4px;
		width: 1.5px;
		height: 1.5px;
		animation: starTwinkle 2.2s ease-in-out infinite alternate 1.5s;
	}

	@keyframes starTwinkle {
		0% {
			opacity: 0.3;
			transform: scale(0.75);
		}
		50% {
			opacity: 1;
			transform: scale(1.2);
			filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.9));
		}
		100% {
			opacity: 0.4;
			transform: scale(0.85);
		}
	}

	/* Lunar Craters */
	.crater-1 {
		top: 25%;
		left: 45%;
		width: 30%;
		height: 30%;
	}
	.crater-2 {
		top: 55%;
		left: 22%;
		width: 24%;
		height: 24%;
	}
	.crater-3 {
		top: 60%;
		left: 58%;
		width: 16%;
		height: 16%;
	}

	/* Tactile Tap Animation */
	.night-toggle-track:active .celestial-thumb {
		width: calc(100% * 0.55);
	}
</style>
