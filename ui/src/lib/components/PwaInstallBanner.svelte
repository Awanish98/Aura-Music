<script lang="ts">
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		Download01Icon,
		Cancel01Icon,
		SparklesIcon,
		Share01Icon,
		CheckmarkCircle02Icon,
		SmartPhone01Icon
	} from '@hugeicons/core-free-icons';
	import auraLogo from '$lib/assets/aura_logo.svg';
	import { pwa, promptInstallApp, dismissInstallBanner } from '$lib/pwa.svelte';
	import { isTauri } from '$lib/api';

	const showBanner = $derived(
		!isTauri() &&
		!pwa.isInstalled &&
		!pwa.bannerDismissed &&
		(pwa.canInstall || pwa.isIos)
	);

	async function handleInstall() {
		await promptInstallApp();
	}
</script>

{#if showBanner}
	<!-- Mobile & Web PWA Install Prompt Banner -->
	<aside
		aria-label="Install Aura Music App"
		transition:fly={{ y: 50, duration: 300, easing: cubicOut }}
		class="fixed bottom-20 md:bottom-24 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 overflow-hidden rounded-2xl border border-pink-500/30 bg-white/90 dark:bg-[#0c0e1e]/95 p-3.5 shadow-2xl backdrop-blur-3xl select-none"
	>
		<!-- Background gradient accent -->
		<div class="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-pink-500/20 blur-2xl"></div>
		<div class="pointer-events-none absolute -left-8 -bottom-8 size-32 rounded-full bg-purple-500/20 blur-2xl"></div>

		<div class="relative z-10 flex items-center justify-between gap-3">
			<div class="flex items-center gap-3 min-w-0 flex-1">
				<img src={auraLogo} alt="Aura Logo" class="h-10 w-10 shrink-0 drop-shadow-[0_0_10px_rgba(255,42,122,0.6)]" />
				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-1.5">
						<h4 class="text-xs sm:text-sm font-black tracking-tight text-slate-900 dark:text-white truncate">
							Install Aura Music App
						</h4>
						<span class="rounded bg-pink-500/20 px-1.5 py-0.5 text-[9px] font-bold text-pink-600 dark:text-pink-400">
							Free PWA
						</span>
					</div>
					<p class="text-[11px] text-slate-600 dark:text-purple-200/80 mt-0.5 truncate font-medium">
						Ad-free listening, 320kbps audio & offline app feel
					</p>
				</div>
			</div>

			<div class="flex items-center gap-1.5 shrink-0">
				<button
					onclick={handleInstall}
					class="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-pink-500/30 transition-transform active:scale-95 cursor-pointer"
				>
					<HugeiconsIcon icon={Download01Icon} size={14} />
					<span>Install</span>
				</button>
				<button
					onclick={dismissInstallBanner}
					class="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/10 dark:text-white/60 transition-colors cursor-pointer"
					aria-label="Dismiss banner"
				>
					<HugeiconsIcon icon={Cancel01Icon} size={15} />
				</button>
			</div>
		</div>
	</aside>
{/if}

<!-- iOS Safari Manual PWA Guide Modal -->
{#if pwa.showIosGuide}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-4"
		transition:fade={{ duration: 200 }}
		onclick={() => (pwa.showIosGuide = false)}
	>
		<div
			class="w-full max-w-sm rounded-3xl border border-pink-500/30 bg-white dark:bg-[#0c0e1e] p-5 shadow-2xl text-slate-900 dark:text-white space-y-4"
			transition:scale={{ start: 0.9, duration: 200 }}
			onclick={(e) => e.stopPropagation()}
		>
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2.5">
					<img src={auraLogo} alt="Aura Logo" class="h-8 w-8" />
					<h3 class="font-heading text-base font-black">Install on iPhone / iPad</h3>
				</div>
				<button
					onclick={() => (pwa.showIosGuide = false)}
					class="flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground"
				>
					<HugeiconsIcon icon={Cancel01Icon} size={16} />
				</button>
			</div>

			<div class="space-y-3 text-xs text-slate-600 dark:text-slate-300">
				<div class="flex items-start gap-3 rounded-2xl bg-muted/40 p-3">
					<div class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">
						1
					</div>
					<p class="pt-0.5">
						Tap the <strong class="text-foreground inline-flex items-center gap-1"><HugeiconsIcon icon={Share01Icon} size={13} /> Share button</strong> in the Safari toolbar at the bottom of your screen.
					</p>
				</div>

				<div class="flex items-start gap-3 rounded-2xl bg-muted/40 p-3">
					<div class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">
						2
					</div>
					<p class="pt-0.5">
						Scroll down and tap <strong class="text-foreground">"Add to Home Screen"</strong>.
					</p>
				</div>

				<div class="flex items-start gap-3 rounded-2xl bg-muted/40 p-3">
					<div class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">
						3
					</div>
					<p class="pt-0.5">
						Tap <strong class="text-primary font-bold">"Add"</strong> in the top-right corner to enjoy fullscreen native Aura Music!
					</p>
				</div>
			</div>

			<button
				onclick={() => (pwa.showIosGuide = false)}
				class="w-full rounded-2xl bg-primary py-2.5 text-center text-xs font-bold text-white shadow-lg shadow-pink-500/30"
			>
				Got It!
			</button>
		</div>
	</div>
{/if}
