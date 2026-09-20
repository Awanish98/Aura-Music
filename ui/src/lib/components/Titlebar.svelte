<script lang="ts">
	// Custom titlebar for Echo Music (Clean, Modern, Uncluttered).
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { getCurrentWindow } from '@tauri-apps/api/window';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		ArrowLeft01Icon,
		ArrowRight01Icon,
		Refresh03Icon,
		MinusSignIcon,
		SquareIcon,
		Cancel01Icon,
		MinimizeScreenIcon,
		CameraVideoIcon,
		CheckmarkCircle01Icon,
		Loading03Icon,
		HotspotOfflineIcon,
		UserGroup02Icon,
		Link04Icon,
		MoreHorizontalIcon
	} from '@hugeicons/core-free-icons';
	import LastFmIcon from './LastFmIcon.svelte';
	import DiscordIcon from './DiscordIcon.svelte';
	import AccountMenu from './AccountMenu.svelte';
	import { appIcon } from '$lib/appicon.svelte';
	import * as api from '$lib/api';
	import { openMiniPlayer, playback, prefs, refreshView, toast, ui } from '$lib/player.svelte';
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

	onMount(() => {
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
		return () => sub.then((u) => u());
	});

	async function onScrobblerClick(e: MouseEvent) {
		if (connecting) {
			api.lastfmDisconnect().catch(() => {});
			return;
		}
		if (connected) {
			openMenu(e);
			return;
		}
		connecting = true;
		try {
			await api.lastfmConnect();
			toast(t('integrations.lastfm_approve_in_browser'));
		} catch (err) {
			connecting = false;
			toast.error(String(err));
		}
	}

	function openMenu(e: MouseEvent) {
		anchor = anchorMenu(e, { align: 'right' });
		menuOpen = true;
	}

	function openToolsMenu(e: MouseEvent) {
		toolsAnchor = anchorMenu(e, { align: 'right' });
		toolsMenuOpen = !toolsMenuOpen;
	}

	function disconnect() {
		menuOpen = false;
		api.lastfmDisconnect().catch((e) => toast.error(String(e)));
	}

	const scrobblerTitle = $derived(
		connecting
			? t('integrations.lastfm_connecting')
			: connected
				? t('integrations.lastfm_scrobbling_as', { user: username ?? '' })
				: t('integrations.lastfm_scrobble_to')
	);
</script>

<header
	data-tauri-drag-region
	class="relative {ui.theaterOpen ? 'z-0' : 'z-50'} flex h-9 shrink-0 select-none items-center justify-between border-b border-border/40 bg-background/95 backdrop-blur-md px-1"
>
	<!-- App Title in Center -->
	<span
		class="pointer-events-none absolute inset-x-0 text-center text-xs font-semibold tracking-wider text-muted-foreground/80 uppercase"
	>
		Echo Music
	</span>

	<!-- Left: Navigation controls -->
	<div class="flex h-full items-center gap-0.5 {win.chrome === 'overlay' ? 'pl-[70px]' : ''}">
		<img src={appIcon.src} alt="" class="pointer-events-none ml-2 mr-1.5 h-4 w-4 rounded" />
		
		<button
			class="flex h-7 w-7 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-muted/80 hover:text-foreground disabled:pointer-events-none disabled:opacity-20"
			onclick={() => history.back()}
			disabled={depth === 0}
			title={t('common.back')}
			aria-label={t('common.back')}
		>
			<HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2.2} class="h-4 w-4" />
		</button>
		
		<button
			class="flex h-7 w-7 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-muted/80 hover:text-foreground disabled:pointer-events-none disabled:opacity-20"
			onclick={() => history.forward()}
			disabled={depth === deepest}
			title={t('common.forward')}
			aria-label={t('common.forward')}
		>
			<HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2.2} class="h-4 w-4" />
		</button>
		
		<button
			class="flex h-7 w-7 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-muted/80 hover:text-foreground"
			onclick={refreshView}
			title={t('common.refresh')}
			aria-label={t('common.refresh')}
		>
			<HugeiconsIcon icon={Refresh03Icon} strokeWidth={2.2} class="h-3.5 w-3.5" />
		</button>
	</div>

	<!-- Right: Tools, Account & Window controls -->
	<div class="flex h-full items-center gap-1">
		<!-- Account Menu -->
		<AccountMenu />

		<!-- Subtle Neutral Divider -->
		<div class="mx-1 h-3.5 w-px bg-border/40"></div>

		<!-- Quick Tools Dropdown Button -->
		<button
			class="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
			onclick={openToolsMenu}
			title="Integrations & Tools"
			aria-label="Integrations & Tools"
		>
			<HugeiconsIcon icon={MoreHorizontalIcon} class="h-4 w-4" />
		</button>

		<!-- Theater Mode (Only when playback is active) -->
		{#if playback.now}
			<button
				class="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
				onclick={() => (ui.theaterOpen = true)}
				title={t('player.theater_mode')}
				aria-label={t('player.theater_mode')}
			>
				<HugeiconsIcon icon={CameraVideoIcon} class="h-3.5 w-3.5" />
			</button>
		{/if}

		<!-- Mini Player -->
		<button
			class="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
			onclick={openMiniPlayer}
			title={t('a11y.toggle_mini')}
			aria-label={t('a11y.toggle_mini')}
		>
			<HugeiconsIcon icon={MinimizeScreenIcon} class="h-3.5 w-3.5" />
		</button>

		<!-- Native/Custom Window Controls -->
		{#if win.chrome === 'off'}
			<div class="mx-1 h-3.5 w-px bg-border/40"></div>

			<div class="flex items-center">
				<button
					class="flex h-7 w-8 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					onclick={() => w?.minimize()}
					aria-label={t('common.minimize')}
				>
					<HugeiconsIcon icon={MinusSignIcon} class="h-3.5 w-3.5" />
				</button>
				<button
					class="flex h-7 w-8 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					onclick={() => w?.toggleMaximize()}
					aria-label={t('common.maximize')}
				>
					<HugeiconsIcon icon={SquareIcon} class="h-3 w-3" />
				</button>
				<button
					class="flex h-7 w-8 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-red-500/80 hover:text-white"
					onclick={() => w?.close()}
					aria-label={t('common.close')}
				>
					<HugeiconsIcon icon={Cancel01Icon} class="h-3.5 w-3.5" />
				</button>
			</div>
		{:else}
			<div class="w-2"></div>
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
		class="fixed z-50 w-56 animate-in rounded-xl border border-border/60 bg-popover/95 p-1.5 text-popover-foreground shadow-2xl backdrop-blur-xl duration-150 fade-in-0 zoom-in-95"
		style={toolsAnchor.style}
		{@attach fitMenu(toolsAnchor)}
	>
		<!-- Open URL link -->
		<button
			class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors hover:bg-muted"
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
			class="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors hover:bg-muted"
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
			class="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors hover:bg-muted"
			onclick={toggleDiscord}
		>
			<div class="flex items-center gap-2.5">
				<DiscordIcon class="h-4 w-4 text-muted-foreground" />
				<span>Discord RPC</span>
			</div>
			<span class="rounded-full px-1.5 py-0.5 text-[10px] font-semibold {discordOn ? 'bg-emerald-500/20 text-emerald-500' : 'bg-muted text-muted-foreground'}">
				{discordOn ? 'On' : 'Off'}
			</span>
		</button>

		<!-- Last.fm Scrobbler -->
		<button
			class="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors hover:bg-muted"
			onclick={(e) => {
				toolsMenuOpen = false;
				onScrobblerClick(e);
			}}
		>
			<div class="flex items-center gap-2.5">
				<LastFmIcon class="h-4 w-4 text-muted-foreground" />
				<span>Last.fm</span>
			</div>
			<span class="rounded-full px-1.5 py-0.5 text-[10px] font-semibold {connected ? 'bg-emerald-500/20 text-emerald-500' : 'bg-muted text-muted-foreground'}">
				{connected ? 'Connected' : 'Connect'}
			</span>
		</button>
	</div>
{/if}

<!-- Last.fm Disconnect Menu -->
{#if menuOpen}
	<button
		class="fixed inset-0 z-40 cursor-default"
		onclick={() => (menuOpen = false)}
		aria-label={t('common.close')}
	></button>
	<div
		class="fixed z-50 min-w-52 animate-in rounded-xl border border-border/60 bg-popover/95 p-1.5 text-popover-foreground shadow-2xl backdrop-blur-xl duration-150 fade-in-0 zoom-in-95"
		style={anchor.style}
		{@attach fitMenu(anchor)}
	>
		<div class="flex items-center gap-2.5 px-2.5 py-2">
			<LastFmIcon class="h-4 w-4 shrink-0 text-primary" />
			<div class="min-w-0">
				<div class="text-xs font-semibold leading-tight">Last.fm</div>
				<div class="truncate text-[11px] text-muted-foreground">
					{t('integrations.lastfm_scrobbling_as', { user: username ?? '' })}
				</div>
			</div>
		</div>
		<div class="mx-1 my-1 h-px bg-border/40"></div>
		<button
			class="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
			onclick={disconnect}
		>
			<HugeiconsIcon icon={HotspotOfflineIcon} class="h-3.5 w-3.5" /> {t('integrations.disconnect')}
		</button>
	</div>
{/if}
