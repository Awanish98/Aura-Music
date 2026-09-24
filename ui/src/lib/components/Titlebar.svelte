<script lang="ts">
	// Premium Futuristic Titlebar & Top Header for Aura Music
	import { onMount } from 'svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import { getCurrentWindow } from '@tauri-apps/api/window';
	import { toggleMode } from 'mode-watcher';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		ArrowLeft01Icon,
		ArrowRight01Icon,
		Refresh03Icon,
		Search01Icon,
		Notification03Icon,
		Sun01Icon,
		Moon02Icon,
		MinusSignIcon,
		SquareIcon,
		Cancel01Icon,
		SparklesIcon,
		MoreHorizontalIcon,
		Link04Icon,
		UserGroup02Icon,
		HotspotOfflineIcon,
		Mic01Icon
	} from '@hugeicons/core-free-icons';
	import auraLogo from '$lib/assets/aura_logo.svg';
	import LastFmIcon from './LastFmIcon.svelte';
	import DiscordIcon from './DiscordIcon.svelte';
	import AccountMenu from './AccountMenu.svelte';
	import * as api from '$lib/api';
	import { auth, playback, prefs, refreshView, toast, ui } from '$lib/player.svelte';
	import { win } from '$lib/win.svelte';
	import { lt } from '$lib/lt.svelte';
	import { anchorMenu, fitMenu, NO_ANCHOR } from '$lib/menu';
	import { t } from '$lib/i18n.svelte';
	import { isTauri } from '$lib/api';

	const w = isTauri() ? getCurrentWindow() : null;

	let depth = $state(0);
	let deepest = $state(0);
	afterNavigate((nav) => {
		if (nav.type === 'enter') depth = deepest = 0;
		else if (nav.delta !== undefined) depth = Math.max(0, depth + nav.delta);
		else deepest = depth += 1;
	});

	let connected = $state(false);
	let username = $state<string | null>(null);
	let connecting = $state(false);
	let menuOpen = $state(false);
	let toolsMenuOpen = $state(false);
	let anchor = $state(NO_ANCHOR);
	let toolsAnchor = $state(NO_ANCHOR);

	let searchQuery = $state('');

	// Real-time live date & time clock
	let timeStr = $state('');
	let dateStr = $state('');
	let isDaytime = $state(true);

	function updateLiveClock() {
		const now = new Date();
		const hours24 = now.getHours();
		isDaytime = hours24 >= 6 && hours24 < 18;

		// 12-hour formatted time: e.g. "09:41 PM"
		const hours12 = hours24 % 12 || 12;
		const minutes = now.getMinutes().toString().padStart(2, '0');
		const ampm = hours24 >= 12 ? 'PM' : 'AM';
		timeStr = `${hours12.toString().padStart(2, '0')}:${minutes} ${ampm}`;

		// Date formatted: e.g. "Thu, 24 Sep"
		const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		dateStr = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;
	}

	onMount(() => {
		updateLiveClock();
		const clockInterval = setInterval(updateLiveClock, 1000);

		api.lastfmStatus()
			.then((s) => {
				connected = s.connected;
				username = s.username ?? null;
			})
			.catch(() => {});
		const sub = api.onLastfmState((s) => {
			const wasConnecting = connecting;
			connecting = false;
			connected = s.connected;
			username = s.username ?? null;
			if (s.error) toast.error(s.error);
			else if (s.connected) toast.success(t('integrations.lastfm_scrobbling_as', { user: s.username ?? '' }));
			else if (!wasConnecting) toast.success(t('integrations.lastfm_disconnected'));
		});
		return () => {
			clearInterval(clockInterval);
			sub.then((u) => u());
		};
	});

	function handleSearchSubmit() {
		if (!searchQuery.trim()) return;
		goto(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
	}

	const discordOn = $derived(prefs.discordRpc);
	async function toggleDiscord() {
		const next = !discordOn;
		prefs.discordRpc = next;
		try {
			await api.setSetting('discord_rpc', next ? 'true' : 'false');
			toast.success(next ? t('integrations.discord_on') : t('integrations.discord_off'));
		} catch (e) {
			prefs.discordRpc = !next;
			toast.error(String(e));
		}
	}

	function openToolsMenu(e: MouseEvent) {
		toolsAnchor = anchorMenu(e, { align: 'right' });
		toolsMenuOpen = !toolsMenuOpen;
	}

	function disconnectLastfm() {
		menuOpen = false;
		api.lastfmDisconnect().catch((e) => toast.error(String(e)));
	}
</script>

<header
	data-tauri-drag-region
	class="relative {ui.theaterOpen ? 'z-0' : 'z-50'} flex h-16 shrink-0 select-none items-center justify-between border-b border-white/8 bg-[#07090e]/90 backdrop-blur-3xl px-4 sm:px-6 transition-all"
>
	<!-- Left: Brand Logo & History Navigation -->
	<div class="flex items-center gap-3">
		<!-- Aura Music Logo Monogram -->
		<a href="/" class="flex items-center gap-2.5 transition-transform hover:scale-105 active:scale-95 group">
			<img src={auraLogo} alt="Aura Logo" class="h-8 w-8 drop-shadow-[0_0_12px_rgba(255,42,122,0.6)]" />
			<span class="hidden sm:inline font-heading text-lg font-black tracking-wider text-white uppercase group-hover:text-primary transition-colors">
				AURA <span class="text-primary">MUSIC</span>
			</span>
		</a>

		<!-- Back / Forward / Refresh controls -->
		<div class="hidden md:flex items-center gap-1 ml-2 pl-3 border-l border-white/10">
			<button
				class="flex h-8 w-8 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-white/10 hover:text-foreground disabled:pointer-events-none disabled:opacity-20"
				onclick={() => history.back()}
				disabled={depth === 0}
				title={t('common.back')}
				aria-label={t('common.back')}
			>
				<HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2.2} class="h-4 w-4" />
			</button>
			<button
				class="flex h-8 w-8 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-white/10 hover:text-foreground disabled:pointer-events-none disabled:opacity-20"
				onclick={() => history.forward()}
				disabled={depth === deepest}
				title={t('common.forward')}
				aria-label={t('common.forward')}
			>
				<HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2.2} class="h-4 w-4" />
			</button>
			<button
				class="flex h-8 w-8 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-white/10 hover:text-foreground"
				onclick={refreshView}
				title={t('common.refresh')}
				aria-label={t('common.refresh')}
			>
				<HugeiconsIcon icon={Refresh03Icon} strokeWidth={2.2} class="h-3.5 w-3.5" />
			</button>
		</div>
	</div>

	<!-- Center: Rounded Frosted Glass Search Bar with Ctrl+K Pill -->
	<div class="flex-1 max-w-xl mx-4 hidden md:block">
		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleSearchSubmit();
			}}
			class="relative flex items-center w-full"
		>
			<div class="absolute left-3.5 flex items-center pointer-events-none text-muted-foreground">
				<HugeiconsIcon icon={Search01Icon} size={17} />
			</div>
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search songs, artists, albums, moods..."
				class="w-full h-10 pl-10 pr-24 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary/60 focus:bg-white/8 transition-all shadow-inner"
			/>
			<div class="absolute right-2.5 flex items-center gap-1.5 pointer-events-none">
				<kbd class="hidden lg:inline-flex items-center gap-0.5 rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-mono text-muted-foreground font-semibold">
					Ctrl K
				</kbd>
			</div>
		</form>
	</div>

	<!-- Right: Live Clock & Quote Widget + Action Buttons + Profile -->
	<div class="flex items-center gap-3">
		<!-- Live Date/Time & Mood Quote Widget (Desktop) -->
		<div class="hidden xl:flex flex-col items-end text-right pr-2">
			<div class="flex items-center gap-2">
				<span class="text-[11px] font-medium text-muted-foreground/80">{dateStr}</span>
				<span class="text-xs font-bold text-foreground flex items-center gap-1">
					{timeStr}
					<span>{isDaytime ? '☀️' : '🌙'}</span>
				</span>
			</div>
			<span class="text-[10px] italic text-muted-foreground/60 font-serif leading-tight">
				"The right song can change your whole mood."
			</span>
		</div>

		<!-- Search Button (Mobile Only) -->
		<a
			href="/search"
			class="md:hidden flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-foreground/80 transition-all hover:bg-white/10 hover:text-primary active:scale-95 shadow-sm"
			title="Search Music"
			aria-label="Search Music"
		>
			<HugeiconsIcon icon={Search01Icon} size={17} />
		</a>

		<!-- Notification Bell with Glowing Alert Dot -->
		<button
			class="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-foreground/80 transition-all hover:bg-white/10 hover:text-primary active:scale-95 shadow-sm"
			title="Notifications"
			aria-label="Notifications"
			onclick={() => toast('No new notifications')}
		>
			<HugeiconsIcon icon={Notification03Icon} size={17} />
			<span class="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse"></span>
		</button>

		<!-- Dark / Light Theme Toggle -->
		<button
			class="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-foreground/80 transition-all hover:bg-white/10 hover:text-primary active:scale-95 shadow-sm"
			onclick={toggleMode}
			title={t('a11y.toggle_theme')}
			aria-label={t('a11y.toggle_theme')}
		>
			<HugeiconsIcon icon={Sun01Icon} size={17} class="dark:hidden" />
			<HugeiconsIcon icon={Moon02Icon} size={17} class="hidden dark:block" />
		</button>

		<!-- Song Identifier / Shazam Audio Quick Button -->
		<button
			class="hidden sm:flex h-9 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 text-xs font-semibold text-primary transition-all hover:bg-primary/20 active:scale-95 shadow-sm"
			onclick={() => (ui.shazamOpen = true)}
			title="Identify Playing Song (Shazam)"
			aria-label="Identify Playing Song"
		>
			<HugeiconsIcon icon={SparklesIcon} size={14} class="animate-pulse" />
			<span class="hidden lg:inline">Shazam</span>
		</button>

		<!-- User Account Profile Avatar -->
		<div class="relative">
			<AccountMenu />
		</div>

		<!-- Quick Tools Dropdown Button -->
		<button
			class="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
			onclick={openToolsMenu}
			title="Integrations & Tools"
			aria-label="Integrations & Tools"
		>
			<HugeiconsIcon icon={MoreHorizontalIcon} size={17} />
		</button>

		<!-- Window Controls (Tauri on Windows/Linux) -->
		{#if isTauri() && win.chrome === 'off'}
			<div class="mx-0.5 h-4 w-px bg-white/10"></div>
			<div class="flex items-center">
				<button
					class="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
					onclick={() => w?.minimize()}
					aria-label={t('common.minimize')}
				>
					<HugeiconsIcon icon={MinusSignIcon} class="h-3.5 w-3.5" />
				</button>
				<button
					class="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
					onclick={() => w?.toggleMaximize()}
					aria-label={t('common.maximize')}
				>
					<HugeiconsIcon icon={SquareIcon} class="h-3 w-3" />
				</button>
				<button
					class="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-rose-600 hover:text-white transition-colors"
					onclick={() => w?.close()}
					aria-label={t('common.close')}
				>
					<HugeiconsIcon icon={Cancel01Icon} class="h-3.5 w-3.5" />
				</button>
			</div>
		{/if}
	</div>
</header>

<!-- Tools Dropdown Menu -->
{#if toolsMenuOpen}
	<button
		class="fixed inset-0 z-40 cursor-default"
		onclick={() => (toolsMenuOpen = false)}
		aria-label={t('common.close')}
	></button>
	<div
		class="fixed z-50 w-56 animate-in rounded-2xl border border-white/12 bg-[#0d101b]/95 p-2 text-popover-foreground shadow-2xl backdrop-blur-2xl duration-150 fade-in-0 zoom-in-95"
		style={toolsAnchor.style}
		{@attach fitMenu(toolsAnchor)}
	>
		<!-- Open URL link -->
		<button
			class="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-white/8 cursor-pointer"
			onclick={() => {
				toolsMenuOpen = false;
				ui.linkOpen = true;
			}}
		>
			<HugeiconsIcon icon={Link04Icon} class="h-4 w-4 text-muted-foreground" />
			<span>{t('dialogs.link.title')}</span>
		</button>

		<!-- Listen Together -->
		<button
			class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-white/8 cursor-pointer"
			onclick={() => {
				toolsMenuOpen = false;
				ui.ltOpen = true;
			}}
		>
			<div class="flex items-center gap-2.5">
				<HugeiconsIcon icon={UserGroup02Icon} class="h-4 w-4 text-muted-foreground" />
				<span>{t('nav.listen_together')}</span>
			</div>
			{#if lt.role !== 'none'}
				<span class="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-500">Active</span>
			{/if}
		</button>

		<!-- Discord Rich Presence Toggle -->
		<button
			class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-white/8 cursor-pointer"
			onclick={toggleDiscord}
		>
			<div class="flex items-center gap-2.5">
				<DiscordIcon class="h-4 w-4 text-muted-foreground" />
				<span>Discord RPC</span>
			</div>
			<span class="rounded-full px-2 py-0.5 text-[10px] font-semibold {discordOn ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-muted-foreground'}">
				{discordOn ? 'On' : 'Off'}
			</span>
		</button>
	</div>
{/if}
