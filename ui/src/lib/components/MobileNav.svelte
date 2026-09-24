<script lang="ts">
	import { page } from '$app/state';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		Home01Icon,
		Compass01Icon,
		SparklesIcon,
		LibraryIcon,
		Radio02Icon
	} from '@hugeicons/core-free-icons';
	import { ui } from '$lib/player.svelte';

	const navItems = [
		{ href: '/', label: 'Home', icon: Home01Icon },
		{ href: '/discover', label: 'Explore', icon: Compass01Icon },
		{ action: () => (ui.aiDjOpen = true), label: 'AI DJ', icon: SparklesIcon, isCenter: true },
		{ href: '/library', label: 'Library', icon: LibraryIcon },
		{ href: '/discover?cat=radio', label: 'Radio', icon: Radio02Icon }
	];

	const isActive = (href?: string) => {
		if (!href) return false;
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	};
</script>

<nav
	class="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around bg-[#07090e]/95 backdrop-blur-3xl border-t border-white/10 px-3 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.6rem)] select-none md:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.8)]"
	aria-label="Mobile Navigation"
>
	{#each navItems as item}
		{#if item.isCenter}
			<!-- Elevated Center Glowing AI DJ Orb Button -->
			<button
				onclick={item.action}
				aria-label="Aura AI DJ"
				class="relative -top-3 flex flex-col items-center justify-center transition-transform active:scale-90 cursor-pointer"
			>
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 text-white shadow-lg shadow-pink-500/40 border-2 border-white/20">
					<HugeiconsIcon icon={SparklesIcon} size={22} class="animate-pulse" />
				</div>
				<span class="text-[10px] font-bold text-pink-400 mt-0.5 tracking-tight">AI DJ</span>
			</button>
		{:else}
			{@const active = isActive(item.href)}
			<a
				href={item.href}
				aria-label={item.label}
				class="relative flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-all duration-150 select-none {active
					? 'text-primary scale-105 font-bold'
					: 'text-muted-foreground hover:text-foreground active:scale-90'}"
			>
				{#if active}
					<div
						class="absolute -top-2 h-1 w-8 rounded-full bg-primary shadow-[0_0_12px_#ff2a7a] animate-pulse"
					></div>
				{/if}
				<HugeiconsIcon icon={item.icon} size={20} strokeWidth={active ? 2.4 : 1.7} />
				<span class="text-[10px] tracking-tight {active ? 'font-bold text-primary' : 'font-medium'}">
					{item.label}
				</span>
			</a>
		{/if}
	{/each}
</nav>
