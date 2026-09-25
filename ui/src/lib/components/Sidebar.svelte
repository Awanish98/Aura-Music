<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		Home01Icon,
		Search01Icon,
		Compass01Icon,
		LibraryIcon,
		SparklesIcon,
		Radio02Icon,
		Playlist02Icon,
		FavouriteIcon,
		Download04Icon,
		Add01Icon,
		SquareArrowLeft01Icon,
		SquareArrowRight01Icon,
		PinIcon,
		CrownIcon
	} from '@hugeicons/core-free-icons';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Dialog from '$lib/components/ui/dialog';
	import PlaylistMenu from './PlaylistMenu.svelte';
	import {
		auth,
		library,
		personal,
		ui,
		createLibraryPlaylist,
		toggleSidebar,
		toast
	} from '$lib/player.svelte';
	import { mergeSaved, orderLibrary } from '$lib/personal';
	import { thumb } from '$lib/thumb';
	import { t } from '$lib/i18n.svelte';

	const navItems = $derived([
		{ href: '/', label: 'Home', icon: Home01Icon },
		{ href: '/search', label: 'Search', icon: Search01Icon },
		{ href: '/discover', label: 'Explore', icon: Compass01Icon },
		{ href: '/library', label: 'Library', icon: LibraryIcon },
		{ action: () => (ui.aiDjOpen = true), label: 'AI DJ', icon: SparklesIcon, isSpecial: true },
		{ href: '/discover', label: 'Radio', icon: Radio02Icon },
		{ href: '/library?tab=local', label: 'Downloads', icon: Download04Icon },
		{ href: '/library?tab=songs', label: 'Favorites', icon: FavouriteIcon },
		{ href: '/library?tab=playlists', label: 'Playlists', icon: Playlist02Icon }
	]);

	const curatedPlaylists = [
		{ id: 'liked', title: 'Liked Songs', icon: '❤️', query: 'Liked Songs' },
		{ id: 'chill', title: 'Chill Vibes', icon: '🌊', query: 'Chill Vibes Lofi Acoustic Indie' },
		{ id: 'workout', title: 'Workout Mix', icon: '⚡', query: 'Gym Workout Energy Phonk' },
		{ id: 'latenight', title: 'Late Night', icon: '🌙', query: 'Late Night Acoustic Soulful Songs' },
		{ id: 'focus', title: 'Focus Mode', icon: '🎯', query: 'Focus Deep Work Coding Lofi' },
		{ id: 'bollywood', title: 'Bollywood Hits', icon: '🎵', query: 'Bollywood Superhits Top 50' }
	];

	const isActive = (href?: string) => {
		if (!href) return false;
		if (href === '/') return page.url.pathname === '/' && !page.url.search;
		return page.url.pathname.startsWith(href);
	};

	const playlists = $derived(
		orderLibrary(mergeSaved(personal, library.items, 'playlist'), personal)
	);

	let dialogOpen = $state(false);
	let newTitle = $state('');
	let creating = $state(false);

	async function createNew() {
		const title = newTitle.trim();
		if (!title || creating) return;
		creating = true;
		try {
			await createLibraryPlaylist(title);
			toast.success(t('toasts.playlist_created', { title }));
			newTitle = '';
			dialogOpen = false;
		} catch (e) {
			toast.error(String(e));
		} finally {
			creating = false;
		}
	}

	const collapsed = $derived(ui.sidebarCollapsed);
	const wide = (cls: string) => (collapsed ? '' : cls);
</script>

<aside
	class="hidden md:flex h-full w-16 shrink-0 flex-col border-r border-slate-200/80 dark:border-white/8 bg-white/70 dark:bg-black/90 backdrop-blur-3xl p-3 text-sidebar-foreground transition-all duration-300 {wide(
		'lg:w-64'
	)} select-none"
>
	<!-- Sidebar Header Collapse Toggle -->
	<div class="flex items-center justify-between px-2 pb-2">
		<span class="hidden font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground/70 {wide('lg:block')}">
			Menu
		</span>
		<Button
			variant="ghost"
			size="icon-xs"
			class="hidden hover:text-primary lg:inline-flex text-muted-foreground apple-spring-hover apple-spring-tap"
			onclick={toggleSidebar}
			aria-label={collapsed ? t('a11y.expand_sidebar') : t('a11y.collapse_sidebar')}
		>
			<HugeiconsIcon
				icon={SquareArrowLeft01Icon}
				altIcon={SquareArrowRight01Icon}
				showAlt={collapsed}
				size={16}
			/>
		</Button>
	</div>

	<!-- Main Navigation Links -->
	<nav class="flex flex-col gap-1.5" aria-label="Main Navigation">
		{#each navItems as n}
			{@const active = n.href ? isActive(n.href) : false}
			{#if n.href}
				<a
					href={n.href}
					title={n.label}
					aria-label={n.label}
					class="group relative flex items-center justify-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 apple-spring-tap {wide(
						'lg:justify-start'
					)} {active
						? 'apple-liquid-glass bg-gradient-to-r from-pink-500/20 via-purple-600/15 to-transparent text-primary font-bold border-pink-500/40 shadow-lg shadow-pink-500/20'
						: 'text-muted-foreground hover:bg-muted/60 hover:text-foreground hover:translate-x-0.5'}"
				>
					{#if active}
						<span class="absolute left-0 top-1/2 h-5 w-1.5 -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_12px_#ff2a7a]"></span>
					{/if}
					<HugeiconsIcon
						icon={n.icon}
						size={19}
						class="shrink-0 transition-transform duration-300 group-hover:scale-115 group-hover:rotate-[-4deg] {active ? 'text-primary drop-shadow-[0_0_8px_#ff2a7a]' : ''}"
					/>
					<span class="hidden {wide('lg:inline')}">{n.label}</span>
				</a>
			{:else}
				<button
					type="button"
					onclick={n.action}
					title={n.label}
					aria-label={n.label}
					class="group relative flex items-center justify-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer apple-spring-tap {wide(
						'lg:justify-start'
					)} {n.isSpecial
						? 'text-primary hover:bg-primary/15 hover:border hover:border-primary/30'
						: 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}"
				>
					<HugeiconsIcon
						icon={n.icon}
						size={19}
						class="shrink-0 transition-transform duration-300 group-hover:scale-120 group-hover:rotate-[12deg] text-primary animate-pulse"
					/>
					<span class="hidden {wide('lg:inline')}">{n.label}</span>
				</button>
			{/if}
		{/each}
	</nav>

	<!-- Playlists Section -->
	<div class="mt-4 hidden min-h-0 flex-1 flex-col border-t border-border/40 pt-3 {wide('lg:flex')}">
		<div class="flex items-center justify-between px-2 mb-2">
			<span class="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
				Playlists
			</span>
			<button
				onclick={() => (dialogOpen = true)}
				class="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/60 hover:text-primary transition-colors cursor-pointer"
				title="Create Playlist"
			>
				<HugeiconsIcon icon={Add01Icon} size={15} />
			</button>
		</div>

		<!-- Scrollable Playlists List -->
		<div class="min-h-0 flex-1 overflow-y-auto space-y-0.5 pr-1">
			<!-- Curated Instant Mood Playlists -->
			{#each curatedPlaylists as pl}
				<button
					onclick={() => goto(`/search?q=${encodeURIComponent(pl.query)}`)}
					class="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-muted-foreground transition-all duration-150 hover:bg-muted/60 hover:text-foreground cursor-pointer"
				>
					<span class="text-sm shrink-0">{pl.icon}</span>
					<span class="truncate">{pl.title}</span>
				</button>
			{/each}

			<!-- Custom User Playlists -->
			{#each playlists as pl}
				<div class="group/row relative" data-ctx>
					<a
						href={`/playlist/${encodeURIComponent(pl.id)}`}
						title={pl.title}
						class="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-muted-foreground transition-all duration-150 hover:bg-muted/60 hover:text-foreground pr-8"
					>
						<span class="text-sm shrink-0">🎵</span>
						<span class="truncate">{pl.title}</span>
					</a>
					<PlaylistMenu item={pl} />
				</div>
			{/each}

			<!-- Add Playlist Action Button -->
			<button
				onclick={() => (dialogOpen = true)}
				class="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-primary/80 transition-colors hover:bg-primary/10 hover:text-primary cursor-pointer mt-1"
			>
				<HugeiconsIcon icon={Add01Icon} size={14} />
				<span>Create Playlist</span>
			</button>
		</div>

		<!-- Upgrade to Aura Pro Card at Bottom -->
		<div class="mt-auto pt-3 border-t border-border/40">
			<div class="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-pink-50/90 via-purple-50/80 to-white/90 dark:from-[#15102a] dark:via-[#1c0e2a] dark:to-[#0f0c1e] p-3.5 shadow-sm dark:shadow-xl backdrop-blur-xl">
				<div class="flex items-center gap-2">
					<div class="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30">
						<HugeiconsIcon icon={CrownIcon} size={15} />
					</div>
					<div>
						<div class="text-xs font-extrabold text-slate-900 dark:text-white">Aura Pro</div>
					</div>
				</div>
				<p class="text-[11px] text-slate-600 dark:text-white/70 mt-1.5 leading-snug font-medium">
					Unlock ad-free music, high quality audio and more.
				</p>
				<button
					onclick={() => toast.success('Aura Pro: Unlimited Lossless Audio & Offline Listening Active!')}
					class="mt-2.5 w-full rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 py-1.5 text-center text-xs font-bold text-white shadow-md shadow-pink-500/30 hover:scale-[1.02] active:scale-95 transition-transform cursor-pointer"
				>
					Upgrade
				</button>
			</div>
		</div>
	</div>

	<!-- Dialog for New Playlist -->
	<Dialog.Root bind:open={dialogOpen}>
		<Dialog.Content class="sm:max-w-md">
			<Dialog.Header>
				<Dialog.Title>{t('dialogs.edit_playlist.new_title')}</Dialog.Title>
				<Dialog.Description>{t('dialogs.edit_playlist.desc_placeholder')}</Dialog.Description>
			</Dialog.Header>
			<form
				class="flex flex-col gap-4"
				onsubmit={(e) => {
					e.preventDefault();
					createNew();
				}}
			>
				<Input bind:value={newTitle} placeholder={t('dialogs.edit_playlist.name_placeholder')} autofocus />
				<Dialog.Footer>
					<Button type="button" variant="outline" onclick={() => (dialogOpen = false)}>{t('common.cancel')}</Button>
					<Button type="submit" disabled={creating || !newTitle.trim()}>
						{creating ? t('common.loading') : t('common.create')}
					</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</aside>
