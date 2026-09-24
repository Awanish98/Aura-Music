<script lang="ts">
	import { page } from '$app/state';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		Home01Icon,
		Search01Icon,
		Compass01Icon,
		SparklesIcon,
		LibraryIcon
	} from '@hugeicons/core-free-icons';
	import { ui } from '$lib/player.svelte';

	const navItems = [
		{ href: '/', label: 'Home', icon: Home01Icon },
		{ href: '/search', label: 'Search', icon: Search01Icon },
		{ action: () => (ui.aiDjOpen = true), label: 'AI DJ', icon: SparklesIcon, isCenter: true },
		{ href: '/discover', label: 'Explore', icon: Compass01Icon },
		{ href: '/library', label: 'Library', icon: LibraryIcon }
	];

	const isActive = (href?: string) => {
		if (!href) return false;
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	};
</script>

<nav
	class="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around bg-[#04060f]/90 dark:bg-[#04060f]/90 backdrop-blur-3xl border-t border-white/[0.08] text-foreground px-2 pt-1.5 pb-[max(env(safe-area-inset-bottom,0px),6px)] select-none md:hidden shadow-[0_-10px_35px_rgba(0,0,0,0.85)] touch-manipulation"
	aria-label="Mobile Navigation"
>
	{#each navItems as item}
		{#if item.isCenter}
			<!-- Elevated Center Glowing AI DJ Orb Button -->
			<button
				onclick={item.action}
				aria-label="Aura AI DJ"
				class="relative -top-3.5 flex flex-col items-center justify-center transition-transform active:scale-90 cursor-pointer group"
			>
				<div class="relative flex size-12 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-violet-600 text-white shadow-[0_4px_20px_rgba(255,10,120,0.5)] border-2 border-white/25">
					<span class="absolute inset-0 rounded-full bg-pink-500/30 animate-ping pointer-events-none"></span>
					<HugeiconsIcon icon={SparklesIcon} size={22} class="animate-pulse" />
				</div>
				<span class="text-[10px] font-black text-pink-400 mt-0.5 tracking-tight uppercase">AI DJ</span>
			</button>
		{:else}
			{@const active = isActive(item.href)}
			<a
				href={item.href}
				aria-label={item.label}
				class="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-all duration-150 select-none {active
					? 'text-primary scale-105 font-bold'
					: 'text-muted-foreground/80 hover:text-foreground active:scale-90'}"
			>
				{#if active}
					<div
						class="absolute -top-1.5 h-1 w-6 rounded-full bg-gradient-to-r from-pink-500 to-cyan-400 shadow-[0_0_10px_#ff0a78]"
					></div>
				{/if}
				<HugeiconsIcon icon={item.icon} size={21} strokeWidth={active ? 2.5 : 1.7} />
				<span class="text-[10px] tracking-tight {active ? 'font-black text-primary' : 'font-medium'}">
					{item.label}
				</span>
			</a>
		{/if}
	{/each}
</nav>
