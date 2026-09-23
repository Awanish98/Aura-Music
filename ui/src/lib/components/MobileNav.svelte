<script lang="ts">
	import { page } from '$app/state';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		Home01Icon,
		Search01Icon,
		LibraryIcon,
		CloudIcon,
		Compass01Icon
	} from '@hugeicons/core-free-icons';
	import { t } from '$lib/i18n.svelte';

	const navItems = $derived([
		{ href: '/', label: t('nav.home') || 'Home', icon: Home01Icon },
		{ href: '/discover', label: t('nav.discover') || 'Discover', icon: Compass01Icon },
		{ href: '/search', label: t('nav.search') || 'Search', icon: Search01Icon },
		{ href: '/library', label: t('nav.library') || 'Library', icon: LibraryIcon },
		{ href: '/drive', label: 'Cloud Drive', icon: CloudIcon }
	]);

	const isActive = (href: string) => {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	};
</script>

<nav
	class="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around apple-glass-dock px-2 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] select-none md:hidden"
	aria-label="Mobile Navigation"
>
	{#each navItems as item}
		{@const active = isActive(item.href)}
		<a
			href={item.href}
			aria-label={item.label}
			class="relative flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-all duration-150 select-none {active
				? 'text-primary scale-105 font-medium'
				: 'text-muted-foreground hover:text-foreground active:scale-90'}"
		>
			{#if active}
				<div
					class="absolute -top-2 h-1 w-9 rounded-full bg-primary shadow-[0_0_12px_var(--primary)] animate-pulse"
				></div>
			{/if}
			<div class="relative">
				<HugeiconsIcon icon={item.icon} size={22} strokeWidth={active ? 2.4 : 1.7} />
			</div>
			<span class="text-[10.5px] tracking-tight {active ? 'font-bold text-primary' : 'font-medium'}">
				{item.label}
			</span>
		</a>
	{/each}
</nav>
