<script lang="ts">
	// 21st.dev Inspired Cyber Time & Date HUD with Interactive Sleep Timer & World Matrix
	import { onMount } from 'svelte';
	import { fade, scale, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		Clock01Icon,
		Calendar03Icon,
		Globe02Icon,
		Moon02Icon,
		Sun01Icon,
		SparklesIcon,
		HourglassIcon,
		Cancel01Icon,
		CheckmarkCircle02Icon
	} from '@hugeicons/core-free-icons';
	import { playback, sleepTimer, setSleepTimer } from '$lib/player.svelte';
	import { browser } from '$app/environment';

	let open = $state(false);
	let is24Hour = $state(false);

	let hoursStr = $state('12');
	let minutesStr = $state('00');
	let secondsNum = $state(0);
	let ampmStr = $state('PM');
	let dayOfWeek = $state('THU');
	let dayNum = $state('24');
	let monthStr = $state('SEP');
	let yearStr = $state('2026');
	let greeting = $state('Peak Vibes');
	let moodIcon = $state('⚡');
	let isNight = $state(false);

	// Session Timer
	let sessionSeconds = $state(0);

	function updateTime() {
		const now = new Date();
		const hours = now.getHours();
		const minutes = now.getMinutes();
		secondsNum = now.getSeconds();

		isNight = hours < 6 || hours >= 20;

		if (is24Hour) {
			hoursStr = hours.toString().padStart(2, '0');
			ampmStr = '24H';
		} else {
			const h12 = hours % 12 || 12;
			hoursStr = h12.toString().padStart(2, '0');
			ampmStr = hours >= 12 ? 'PM' : 'AM';
		}
		minutesStr = minutes.toString().padStart(2, '0');

		const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
		const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
		dayOfWeek = days[now.getDay()];
		dayNum = now.getDate().toString().padStart(2, '0');
		monthStr = months[now.getMonth()];
		yearStr = now.getFullYear().toString();

		// Dynamic Vibe & Greeting
		if (hours >= 5 && hours < 12) {
			greeting = 'Morning Aura';
			moodIcon = '⚡';
		} else if (hours >= 12 && hours < 17) {
			greeting = 'Peak Vibes';
			moodIcon = '✨';
		} else if (hours >= 17 && hours < 21) {
			greeting = 'Sunset Beats';
			moodIcon = '🌇';
		} else {
			greeting = 'Midnight Cyber';
			moodIcon = '🌙';
		}
	}

	function getWorldTime(timeZone: string): string {
		try {
			return new Intl.DateTimeFormat('en-US', {
				timeZone,
				hour: is24Hour ? '2-digit' : 'numeric',
				minute: '2-digit',
				hour12: !is24Hour
			}).format(new Date());
		} catch {
			return '--:--';
		}
	}

	function formatSessionUptime(secs: number): string {
		const h = Math.floor(secs / 3600);
		const m = Math.floor((secs % 3600) / 60);
		const s = secs % 60;
		if (h > 0) return `${h}h ${m}m ${s}s`;
		if (m > 0) return `${m}m ${s}s`;
		return `${s}s`;
	}

	function formatSleepRemaining(secs: number): string {
		const m = Math.floor(secs / 60);
		const s = secs % 60;
		return `${m}:${s.toString().padStart(2, '0')}`;
	}

	onMount(() => {
		if (browser) {
			const saved = localStorage.getItem('aura_clock_24h');
			if (saved) is24Hour = saved === 'true';
		}

		updateTime();
		const timer = setInterval(() => {
			updateTime();
			sessionSeconds += 1;
		}, 1000);

		return () => clearInterval(timer);
	});

	function toggleHourFormat() {
		is24Hour = !is24Hour;
		if (browser) localStorage.setItem('aura_clock_24h', String(is24Hour));
		updateTime();
	}
</script>

<div class="relative inline-flex items-center">
	<!-- 21st.dev Main Futuristic HUD Capsule Button -->
	<button
		type="button"
		onclick={() => (open = !open)}
		class="cyber-hud-glass group relative flex items-center gap-2.5 rounded-full px-3.5 py-1.5 text-left transition-all active:scale-95 cursor-pointer select-none"
		title="Click for Cyber Time HUD & Timers"
		aria-label="Open Cyber Time Matrix"
	>
		<!-- Live Digital Clock Core with Animated Colon -->
		<div class="flex items-center font-heading font-black tracking-tight text-white text-xs sm:text-sm">
			<span class="tabular-nums drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">{hoursStr}</span>
			<span class="animate-neon-colon text-primary px-0.5 font-bold">:</span>
			<span class="tabular-nums drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">{minutesStr}</span>
			
			<span class="ml-1 text-[9px] font-mono font-bold tracking-wider uppercase text-primary/90 bg-primary/10 border border-primary/20 px-1 py-0.2 rounded-md">
				{ampmStr}
			</span>
		</div>

		<!-- Subtle Divider -->
		<div class="h-3.5 w-px bg-white/15"></div>

		<!-- Cyber Date & Mood Badge -->
		<div class="hidden xl:flex items-center gap-1.5 text-[11px] font-medium text-white/80">
			<span class="font-mono font-bold text-[10px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.2 rounded-md">
				{dayOfWeek}
			</span>
			<span class="tracking-wide text-white/70 font-sans">{dayNum} {monthStr}</span>
			<span class="text-xs">{moodIcon}</span>
		</div>

		<!-- Live Audio Playing Indicator (Dancing 4-bar Equalizer) -->
		{#if !playback.paused && playback.now}
			<div class="flex items-center gap-0.5 ml-0.5 h-3">
				<span class="h-full w-0.5 rounded-full bg-primary animate-eq-1"></span>
				<span class="h-full w-0.5 rounded-full bg-accent animate-eq-2"></span>
				<span class="h-full w-0.5 rounded-full bg-cyan-400 animate-eq-3"></span>
			</div>
		{/if}

		<!-- Active Sleep Timer Badge (if running) -->
		{#if sleepTimer.active}
			<div class="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded-full animate-pulse">
				<HugeiconsIcon icon={HourglassIcon} size={11} />
				<span>{formatSleepRemaining(sleepTimer.remainingSecs)}</span>
			</div>
		{/if}
	</button>

	<!-- 21st.dev Popover HUD Modal Matrix -->
	{#if open}
		<!-- Backdrop click handler -->
		<button
			class="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs cursor-default"
			onclick={() => (open = false)}
			aria-label="Close Time HUD"
		></button>

		<div
			class="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-white/15 bg-[#090c14]/95 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-3xl"
			transition:scale={{ start: 0.95, duration: 200, easing: cubicOut }}
		>
			<!-- Top HUD Header -->
			<div class="flex items-center justify-between border-b border-white/10 pb-3.5">
				<div class="flex items-center gap-2">
					<div class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/30">
						<HugeiconsIcon icon={Clock01Icon} size={16} />
					</div>
					<div>
						<h3 class="font-heading text-sm font-black tracking-wide text-white uppercase flex items-center gap-1.5">
							CYBER <span class="text-primary">TIME HUD</span>
						</h3>
						<p class="text-[10px] text-white/50 font-mono">Aura Quantum Sync • 21st UI</p>
					</div>
				</div>

				<div class="flex items-center gap-1.5">
					<button
						onclick={toggleHourFormat}
						class="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-mono font-bold text-white/80 transition-all hover:bg-white/15 hover:text-white active:scale-95 cursor-pointer"
					>
						{is24Hour ? '24-HOUR' : '12-HOUR'}
					</button>
					<button
						onclick={() => (open = false)}
						class="flex h-7 w-7 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
						aria-label="Close"
					>
						<HugeiconsIcon icon={Cancel01Icon} size={14} />
					</button>
				</div>
			</div>

			<!-- Main Live Display Card -->
			<div class="my-4 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent p-4 relative overflow-hidden">
				<div class="flex items-center justify-between">
					<div>
						<div class="flex items-baseline gap-1 font-heading font-black text-3xl sm:text-4xl tracking-tight text-white">
							<span>{hoursStr}</span>
							<span class="animate-neon-colon text-primary">:</span>
							<span>{minutesStr}</span>
							<span class="text-base font-mono font-bold text-cyan-400 ml-1.5">:{secondsNum.toString().padStart(2, '0')}</span>
							<span class="text-xs font-mono font-bold text-primary ml-1">{ampmStr}</span>
						</div>
						<div class="mt-1 flex items-center gap-2 text-xs font-medium text-white/70">
							<span class="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-cyan-300 border border-cyan-400/20">
								{dayOfWeek}
							</span>
							<span>{dayNum} {monthStr} {yearStr}</span>
						</div>
					</div>

					<div class="flex flex-col items-end text-right">
						<span class="text-2xl">{moodIcon}</span>
						<span class="text-[11px] font-semibold text-primary/90 mt-1">{greeting}</span>
						<span class="text-[9px] text-white/40 font-mono">Local Synchronized</span>
					</div>
				</div>
			</div>

			<!-- World Time Matrix -->
			<div class="space-y-2 mb-4">
				<div class="flex items-center justify-between text-[11px] font-semibold text-white/60 px-1">
					<span class="flex items-center gap-1">
						<HugeiconsIcon icon={Globe02Icon} size={13} />
						World Matrix
					</span>
					<span class="font-mono text-[10px] text-white/40">Global Timezones</span>
				</div>
				<div class="grid grid-cols-2 gap-2">
					<div class="rounded-lg border border-white/8 bg-white/3 p-2 flex items-center justify-between">
						<div>
							<span class="block text-[10px] font-mono text-white/50">Mumbai / IST</span>
							<span class="text-xs font-bold text-white/90">{getWorldTime('Asia/Kolkata')}</span>
						</div>
						<span class="text-[10px] text-emerald-400 font-mono">UTC+5:30</span>
					</div>
					<div class="rounded-lg border border-white/8 bg-white/3 p-2 flex items-center justify-between">
						<div>
							<span class="block text-[10px] font-mono text-white/50">London / UTC</span>
							<span class="text-xs font-bold text-white/90">{getWorldTime('Europe/London')}</span>
						</div>
						<span class="text-[10px] text-cyan-400 font-mono">GMT</span>
					</div>
					<div class="rounded-lg border border-white/8 bg-white/3 p-2 flex items-center justify-between">
						<div>
							<span class="block text-[10px] font-mono text-white/50">New York / EST</span>
							<span class="text-xs font-bold text-white/90">{getWorldTime('America/New_York')}</span>
						</div>
						<span class="text-[10px] text-violet-400 font-mono">UTC-4</span>
					</div>
					<div class="rounded-lg border border-white/8 bg-white/3 p-2 flex items-center justify-between">
						<div>
							<span class="block text-[10px] font-mono text-white/50">Tokyo / JST</span>
							<span class="text-xs font-bold text-white/90">{getWorldTime('Asia/Tokyo')}</span>
						</div>
						<span class="text-[10px] text-rose-400 font-mono">UTC+9</span>
					</div>
				</div>
			</div>

			<!-- Sleep & Focus Timer Integration -->
			<div class="border-t border-white/10 pt-3.5 space-y-2">
				<div class="flex items-center justify-between text-[11px] font-semibold text-white/60 px-1">
					<span class="flex items-center gap-1.5">
						<HugeiconsIcon icon={HourglassIcon} size={13} class="text-primary" />
						Auto Sleep Timer
					</span>
					{#if sleepTimer.active}
						<button
							onclick={() => setSleepTimer(null)}
							class="text-[10px] font-mono text-rose-400 hover:underline cursor-pointer"
						>
							Turn Off ({formatSleepRemaining(sleepTimer.remainingSecs)})
						</button>
					{:else}
						<span class="text-[10px] font-mono text-white/40">Off</span>
					{/if}
				</div>

				<div class="grid grid-cols-4 gap-1.5">
					<button
						onclick={() => setSleepTimer(15)}
						class="rounded-lg border border-white/10 bg-white/5 py-1.5 text-center text-xs font-semibold text-white/80 transition-all hover:border-primary/50 hover:bg-primary/20 hover:text-white active:scale-95 cursor-pointer"
					>
						15m
					</button>
					<button
						onclick={() => setSleepTimer(30)}
						class="rounded-lg border border-white/10 bg-white/5 py-1.5 text-center text-xs font-semibold text-white/80 transition-all hover:border-primary/50 hover:bg-primary/20 hover:text-white active:scale-95 cursor-pointer"
					>
						30m
					</button>
					<button
						onclick={() => setSleepTimer(60)}
						class="rounded-lg border border-white/10 bg-white/5 py-1.5 text-center text-xs font-semibold text-white/80 transition-all hover:border-primary/50 hover:bg-primary/20 hover:text-white active:scale-95 cursor-pointer"
					>
						60m
					</button>
					<button
						onclick={() => setSleepTimer('end')}
						class="rounded-lg border border-white/10 bg-white/5 py-1.5 text-center text-[10px] font-semibold text-white/80 transition-all hover:border-primary/50 hover:bg-primary/20 hover:text-white active:scale-95 cursor-pointer"
					>
						End Song
					</button>
				</div>
			</div>

			<!-- Footer Session Stats -->
			<div class="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/50 px-1">
				<span>Session Listening Uptime:</span>
				<span class="text-white/90 font-bold">{formatSessionUptime(sessionSeconds)}</span>
			</div>
		</div>
	{/if}
</div>
