<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		Home01Icon,
		Search01Icon,
		Compass01Icon,
		AudioWave02Icon
	} from '@hugeicons/core-free-icons';
	import auraLogo from '$lib/assets/aura_logo.svg';
</script>

<svelte:head>
	<title>404 Page Not Found – Aura Music</title>
	<meta name="robots" content="noindex, follow" />
</svelte:head>

<div class="flex min-h-[75vh] flex-col items-center justify-center p-6 text-center select-none">
	<!-- Glowing 404 Visualizer Hologram -->
	<div class="relative mb-6 flex items-center justify-center">
		<div class="absolute h-48 w-48 rounded-full bg-pink-500/20 blur-3xl animate-pulse"></div>
		<div class="absolute h-48 w-48 rounded-full bg-purple-600/20 blur-3xl"></div>

		<div class="relative flex flex-col items-center">
			<img src={auraLogo} alt="Aura Logo" class="h-16 w-16 mb-2 drop-shadow-[0_0_16px_rgba(255,42,122,0.6)]" />
			<span class="font-heading text-7xl sm:text-8xl font-black tracking-tighter bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,42,122,0.4)]">
				404
			</span>
		</div>
	</div>

	<!-- Heading & Subtitle -->
	<h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
		Lost in the Sound
	</h1>
	<p class="mt-2.5 max-w-md text-sm text-purple-200/80 font-medium leading-relaxed">
		The track, artist, or page you were looking for doesn't exist or has vanished into the cosmic void.
	</p>

	<!-- Action Navigation Buttons -->
	<div class="mt-8 flex flex-wrap items-center justify-center gap-3">
		<a
			href="/"
			class="flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-xl shadow-pink-500/30 transition-all hover:scale-105 active:scale-95"
		>
			<HugeiconsIcon icon={Home01Icon} size={16} />
			<span>Return Home</span>
		</a>

		<a
			href="/search"
			class="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-xs sm:text-sm font-semibold text-white backdrop-blur-xl transition-all hover:bg-white/20 active:scale-95"
		>
			<HugeiconsIcon icon={Search01Icon} size={16} />
			<span>Search Music</span>
		</a>

		<a
			href="/discover"
			class="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-xs sm:text-sm font-semibold text-white backdrop-blur-xl transition-all hover:bg-white/20 active:scale-95"
		>
			<HugeiconsIcon icon={Compass01Icon} size={16} />
			<span>Discover Charts</span>
		</a>
	</div>
</div>
