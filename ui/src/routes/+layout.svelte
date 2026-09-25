<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher, mode } from 'mode-watcher';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		CheckmarkCircle02Icon,
		AlertCircleIcon,
		InformationCircleIcon
	} from '@hugeicons/core-free-icons';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { getCurrentWindow } from '@tauri-apps/api/window';
	import { isTauri } from '$lib/api';
	import { analytics } from '$lib/analytics';
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import {
		appearance,
		applyArtworkAccent,
		prewarmArtworkAccent,
		refreshArtworkAccent,
		initTheme
	} from '$lib/theme.svelte';
	import { loadAppIcon } from '$lib/appicon.svelte';
	import { thumb } from '$lib/thumb';
	import { t } from '$lib/i18n.svelte';
	import { blockForeignDrag, dragScroll } from '$lib/dnd';
	import { suppressNative } from '$lib/menu';
	import { webPlayer } from '$lib/webplayer';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Titlebar from '$lib/components/Titlebar.svelte';
	import ResizeBorders from '$lib/components/ResizeBorders.svelte';
	import PlayerBar from '$lib/components/PlayerBar.svelte';
	import QueuePanel from '$lib/components/QueuePanel.svelte';
	import LyricsPanel from '$lib/components/LyricsPanel.svelte';
	import AddToPlaylist from '$lib/components/AddToPlaylist.svelte';
	import SettingsDialog from '$lib/components/SettingsDialog.svelte';
	import AiDjDialog from '$lib/components/AiDjDialog.svelte';
	import SongIdentifierModal from '$lib/components/SongIdentifierModal.svelte';
	import ShareDialog from '$lib/components/ShareDialog.svelte';
	import ChannelPicker from '$lib/components/ChannelPicker.svelte';
	import ListenTogether from '$lib/components/ListenTogether.svelte';
	import LinkDialog from '$lib/components/LinkDialog.svelte';
	import MiniPlayer from '$lib/components/MiniPlayer.svelte';
	import NowPlaying from '$lib/components/NowPlaying.svelte';
	import MobileNowPlaying from '$lib/components/MobileNowPlaying.svelte';
	import VisualizerStudio from '$lib/components/VisualizerStudio.svelte';
	import MobileNav from '$lib/components/MobileNav.svelte';
	import TheaterMode from '$lib/components/TheaterMode.svelte';
	import FloatingVideoPlayer from '$lib/components/FloatingVideoPlayer.svelte';
	import VideoSurface from '$lib/components/VideoSurface.svelte';
	import CommandPalette from '$lib/components/CommandPalette.svelte';
	import KeyboardShortcuts from '$lib/components/KeyboardShortcuts.svelte';
	import LegalDialog from '$lib/components/LegalDialog.svelte';
	import CookieConsent from '$lib/components/CookieConsent.svelte';
	import GlassFilter from '$lib/components/ui/GlassFilter.svelte';
	import AuraAmbientBackground from '$lib/components/AuraAmbientBackground.svelte';
	import PwaInstallBanner from '$lib/components/PwaInstallBanner.svelte';
	import { Button } from '$lib/components/ui/button';
	import { auth, initApp, np, playback, ui, audioFx } from '$lib/player.svelte';
	import { win, initWin } from '$lib/win.svelte';
	import { initZoom } from '$lib/zoom.svelte';
	import { initShortcuts } from '$lib/shortcuts';
	import { initErrorLog } from '$lib/errlog';
	import {
		updateState,
		installUpdate,
		openDownloadPage,
		checkForUpdatesQuiet,
		QUIET_INTERVAL_MS
	} from '$lib/updater.svelte';

	let { children } = $props();

	// ── Splash / Loading screen ──────────────────────────────────────────────
	let splashDone = $state(false);
	let splashOut = $state(false); // trigger the exit animation first
	// Queue and lyrics toggle independently and both float over the page rather than docking into
	// it — two docked columns squeezed the content down to an unusable strip. At lg+ they sit side
	// by side over the content; narrower, they stack (see QueuePanel / LyricsPanel).
	let queueOpen = $state(false);
	let lyricsOpen = $state(false);
	// Two ways the now-playing view and these panels can divide the same two buttons, picked in
	// settings (#62). Tabbed (the default): the view carries queue and lyrics itself, so the panels
	// step aside for it and the bar's buttons switch its tabs. Off: these are the only owner, the
	// buttons always mean the panels, and the panels float over that view like they float over a
	// page, so opening it costs you nothing you had open.
	const tabbed = $derived(np.open && appearance.tabbedPlayer);
	$effect(() => {
		if (tabbed) queueOpen = lyricsOpen = false;
	});

	// "Adapt colors to artwork": re-run on every track change and on the toggle itself. The 120px
	// cover is the one the player bar has already loaded, so this costs no extra request.
	$effect(() => {
		applyArtworkAccent(
			appearance.artworkAccent ? thumb(playback.now?.thumbnail, 120) : null
		);
	});
	// The accent is banded against the active theme (a cover's colour that reads on a light page is
	// mud on a dark one, #137), so flipping light/dark has to re-derive it from the same cover.
	$effect(() => {
		mode.current;
		refreshArtworkAccent();
	});
	// Same colour, one track early. Reading it off the queue instead of the track change means the
	// palette starts moving on the frame the artwork swaps, not after a fetch and a decode.
	$effect(() => {
		if (!appearance.artworkAccent) return;
		const q = playback.queue;
		prewarmArtworkAccent(thumb(q.items[q.currentIndex + 1]?.thumbnail, 120));
	});

	// The mini player runs this same SPA in a second window (Rust `mini.rs`), so the window label is
	// what tells the two apart: `mini` gets the widget instead of the app chrome, and none of the
	// routes below it are ever rendered. Constant for the window's lifetime.
	const isMini = browser && isTauri() && getCurrentWindow().label === 'mini';

	// Apply the saved accent color before the first paint (ssr=false → nothing renders until now).
	if (browser) initTheme();
	// The custom app icon (#173) is a file on disk, so the titlebar has to ask Rust for it.
	if (browser) loadAppIcon();

	// Wire the Tauri event bridge once for the whole app; teardown on destroy. Check for an update
	// on every app open (silent unless one exists).
	onMount(() => {
		// Before the mini-window bail-out: both windows run this SPA and both can throw.
		initErrorLog();
		if (isMini) {
			// The widget gets the transport keys too. No zoom: it is a fixed-size card.
			const teardownMiniApp = initApp(true);
			const teardownMiniKeys = initShortcuts(true);
			return () => {
				teardownMiniApp();
				teardownMiniKeys();
			};
		}
		// First: it reveals the window (see initWin).
		const teardownWin = initWin();
		if (!isTauri()) {
			webPlayer.init();
			analytics.init();
			if ('serviceWorker' in navigator && import.meta.env.PROD) {
				navigator.serviceWorker.register('/sw.js').catch(() => {});
			}
		}
		checkForUpdatesQuiet();
		// Repeat while the app stays open: ✕ hides to tray by default, so this component can stay
		// mounted for days and a mount-only check would never see a release published in between.
		const updateTimer = setInterval(checkForUpdatesQuiet, QUIET_INTERVAL_MS);
		const teardownApp = initApp();
		const teardownZoom = initZoom();
		const teardownShortcuts = initShortcuts();
		return () => {
			clearInterval(updateTimer);
			teardownApp();
			teardownWin();
			teardownZoom();
			teardownShortcuts();
		};
	});

	// Hide the splash after app init (min 2.2 s so the animation plays fully)
	$effect(() => {
		const minTimer = setTimeout(() => {
			splashOut = true;
			setTimeout(() => (splashDone = true), 600); // wait for fade-out transition
		}, 2200);
		return () => clearTimeout(minTimer);
	});

	afterNavigate((nav) => {
		if (browser && !isTauri()) {
			analytics.trackPageView(nav.to?.url?.pathname || (typeof window !== 'undefined' ? window.location.pathname : '/'));
		}
	});
</script>

<!-- oncontextmenu: the app's own menus handle their right-click and stop the event, so anything
     that reaches the window is a place where WebKit would have offered back / reload / inspect.
     Text fields and selections keep the native menu (see `suppressNative`). -->
<svelte:window
	ondragover={blockForeignDrag}
	ondrop={blockForeignDrag}
	oncontextmenu={suppressNative}
/>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<ModeWatcher />

<!-- ═══════════════════════════════════════════════════════════
     Aura Music — Animated Splash / Loading Screen
     Shows for 2.2 s then fades out. The logo pulses with a
     neon glow ring and three music-wave bars animate in rhythm.
     ═══════════════════════════════════════════════════════════ -->
{#if !splashDone}
	<!-- svelte-ignore a11y_aria_hidden_focus -->
	<div
		aria-hidden="true"
		class="aura-splash"
		class:aura-splash--out={splashOut}
	>
		<!-- Ambient gradient blobs (same palette as the logo) -->
		<div class="aura-splash__blob aura-splash__blob--1"></div>
		<div class="aura-splash__blob aura-splash__blob--2"></div>
		<div class="aura-splash__blob aura-splash__blob--3"></div>

		<!-- Logo + brand -->
		<div class="aura-splash__center">
			<!-- Logo image with neon glow ring -->
			<div class="aura-splash__logo-wrap">
				<div class="aura-splash__glow-ring"></div>
				<img
					src="/aura-logo.jpg"
					alt="Aura Music"
					class="aura-splash__logo"
					decoding="async"
				/>
			</div>

			<!-- Brand text -->
			<div class="aura-splash__brand">
				<span class="aura-splash__brand-aura">AURA</span>
				<span class="aura-splash__brand-music">MUSIC</span>
			</div>

			<!-- Music wave bars -->
			<div class="aura-splash__waves" aria-hidden="true">
				{#each [1,2,3,4,5] as i}
					<div class="aura-splash__bar" style="--i:{i}"></div>
				{/each}
			</div>

			<!-- Loading label -->
			<p class="aura-splash__label">Loading your music…</p>

			<!-- Progress track -->
			<div class="aura-splash__track">
				<div class="aura-splash__fill"></div>
			</div>
		</div>
	</div>
{/if}

<style>
	/* ── Splash container ─────────────────────────────────────── */
	.aura-splash {
		position: fixed;
		inset: 0;
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #05020f;
		overflow: hidden;
		transition: opacity 0.6s ease, transform 0.6s ease;
	}
	.aura-splash--out {
		opacity: 0;
		transform: scale(1.04);
		pointer-events: none;
	}

	/* ── Ambient blobs ────────────────────────────────────────── */
	.aura-splash__blob {
		position: absolute;
		border-radius: 50%;
		filter: blur(80px);
		opacity: 0.35;
		animation: blobDrift 6s ease-in-out infinite alternate;
	}
	.aura-splash__blob--1 {
		width: 500px; height: 500px;
		background: radial-gradient(circle, #ff0a78, transparent 70%);
		top: -120px; left: -80px;
		animation-delay: 0s;
	}
	.aura-splash__blob--2 {
		width: 420px; height: 420px;
		background: radial-gradient(circle, #8b5cf6, transparent 70%);
		bottom: -100px; right: -60px;
		animation-delay: -2s;
	}
	.aura-splash__blob--3 {
		width: 300px; height: 300px;
		background: radial-gradient(circle, #06b6d4, transparent 70%);
		top: 40%; left: 55%;
		animation-delay: -4s;
	}
	@keyframes blobDrift {
		from { transform: translate(0, 0) scale(1); }
		to   { transform: translate(30px, -25px) scale(1.12); }
	}

	/* ── Center stack ─────────────────────────────────────────── */
	.aura-splash__center {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.25rem;
		animation: centerFadeIn 0.7s cubic-bezier(0.34,1.56,0.64,1) both;
	}
	@keyframes centerFadeIn {
		from { opacity: 0; transform: translateY(24px) scale(0.94); }
		to   { opacity: 1; transform: translateY(0) scale(1); }
	}

	/* ── Logo ─────────────────────────────────────────────────── */
	.aura-splash__logo-wrap {
		position: relative;
		width: 130px;
		height: 130px;
	}
	.aura-splash__glow-ring {
		position: absolute;
		inset: -10px;
		border-radius: 50%;
		background: conic-gradient(
			from 0deg,
			#ff0a78, #8b5cf6, #06b6d4, #ec4899, #ff0a78
		);
		animation: ringRotate 2.8s linear infinite;
		filter: blur(6px);
		opacity: 0.8;
	}
	@keyframes ringRotate {
		to { transform: rotate(360deg); }
	}
	.aura-splash__logo {
		position: relative;
		width: 130px;
		height: 130px;
		border-radius: 28px;
		object-fit: cover;
		box-shadow: 0 0 40px rgba(255, 10, 120, 0.5), 0 0 80px rgba(139, 92, 246, 0.3);
		animation: logoPulse 2s ease-in-out infinite;
	}
	@keyframes logoPulse {
		0%, 100% { box-shadow: 0 0 30px rgba(255,10,120,0.45), 0 0 60px rgba(139,92,246,0.25); }
		50%       { box-shadow: 0 0 55px rgba(255,10,120,0.75), 0 0 100px rgba(139,92,246,0.45); }
	}

	/* ── Brand text ───────────────────────────────────────────── */
	.aura-splash__brand {
		display: flex;
		flex-direction: column;
		align-items: center;
		line-height: 1;
		gap: 2px;
	}
	.aura-splash__brand-aura {
		font-family: 'Syne', 'Outfit', sans-serif;
		font-size: 2.5rem;
		font-weight: 900;
		letter-spacing: 0.18em;
		background: linear-gradient(135deg, #ff0a78 0%, #c084fc 45%, #38bdf8 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		animation: textShimmer 2.5s ease-in-out infinite;
		background-size: 200% 100%;
	}
	@keyframes textShimmer {
		0%   { background-position: 0% 50%; }
		50%  { background-position: 100% 50%; }
		100% { background-position: 0% 50%; }
	}
	.aura-splash__brand-music {
		font-family: 'Outfit', sans-serif;
		font-size: 0.7rem;
		font-weight: 500;
		letter-spacing: 0.55em;
		color: rgba(255,255,255,0.45);
		padding-left: 0.55em; /* compensate letter-spacing for centering */
	}

	/* ── Wave bars ────────────────────────────────────────────── */
	.aura-splash__waves {
		display: flex;
		align-items: flex-end;
		gap: 5px;
		height: 32px;
	}
	.aura-splash__bar {
		width: 4px;
		border-radius: 999px;
		background: linear-gradient(to top, #ff0a78, #8b5cf6);
		animation: waveBounce 0.9s ease-in-out infinite alternate;
		animation-delay: calc((var(--i) - 1) * 0.13s);
	}
	.aura-splash__bar:nth-child(1) { height: 14px; }
	.aura-splash__bar:nth-child(2) { height: 24px; }
	.aura-splash__bar:nth-child(3) { height: 32px; }
	.aura-splash__bar:nth-child(4) { height: 20px; }
	.aura-splash__bar:nth-child(5) { height: 10px; }
	@keyframes waveBounce {
		from { transform: scaleY(0.35); opacity: 0.5; }
		to   { transform: scaleY(1);    opacity: 1; }
	}

	/* ── Loading label ────────────────────────────────────────── */
	.aura-splash__label {
		font-family: 'Outfit', sans-serif;
		font-size: 0.75rem;
		font-weight: 500;
		color: rgba(255,255,255,0.35);
		letter-spacing: 0.05em;
		margin: 0;
	}

	/* ── Progress bar ─────────────────────────────────────────── */
	.aura-splash__track {
		width: 160px;
		height: 3px;
		border-radius: 999px;
		background: rgba(255,255,255,0.08);
		overflow: hidden;
	}
	.aura-splash__fill {
		height: 100%;
		border-radius: 999px;
		background: linear-gradient(90deg, #ff0a78, #8b5cf6, #06b6d4);
		animation: progressFill 2.1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
	}
	@keyframes progressFill {
		from { width: 0%; }
		to   { width: 100%; }
	}
</style>

<!-- The mini player is the whole window when it is the window: no titlebar, no sidebar, no routes,
     and no toasts (a banner would cover most of a 560x180 widget). -->
{#if isMini}
	<MiniPlayer />
{:else}
	<!-- The window itself is transparent; this root paints the background and, when not maximized,
	     rounds the corners (the compositor can't round an undecorated window for us). Theater mode
	     counts as maximized here: it is fullscreen, and rounding it clips the corners of a view that
	     is meant to reach every edge (#139). With a system frame (win.chrome) the compositor rounds
	     for us, so ours would only fight it.
	     12px, not `rounded-lg`: that resolves to --radius, which every theme sets differently, so
	     the window corner used to change with the theme. This is the GNOME/Adwaita value (#65). -->
	<div
		class="relative flex h-screen flex-col overflow-hidden bg-background text-foreground {win.maximized ||
		ui.theaterOpen ||
		win.chrome !== 'off'
			? ''
			: 'rounded-[12px]'}"
	>
		<!-- Premium Centralized Aura Ambient Animated Fluid Gradient System -->
		<AuraAmbientBackground variant="auto" intensity="medium" reactiveToArtwork={true} interactive={true} />

		<ResizeBorders />
		<Titlebar />
		<!-- relative: the queue and lyrics panels are absolute overlays inside it (see QueuePanel). -->
		<div class="relative flex min-h-0 flex-1">
			<Sidebar />
			<!-- dragScroll: dragging a card up to home's Shortcuts grid has to be possible from anywhere in
			     the feed, so aiming at the top edge scrolls this container while the drag is in flight. -->
			<main id="main-content" aria-label="Main Content" class="min-w-0 flex-1 overflow-y-auto pb-[calc(env(safe-area-inset-bottom,0px)+8.5rem)] md:pb-28" {@attach dragScroll}>
				<!-- Remount the current page on sign-in/out so it refetches with the new account, and on
				     a refresh (titlebar button / F5), which drops the browse cache first. -->
				{#key `${auth.epoch}:${ui.epoch}`}
					{@render children()}
				{/key}
			</main>
			<!-- Always mounted, unlike the player view below it: it owns the one <video> element, which
			     has to keep playing while the view is closed. It renders nothing but a zero-sized
			     parking container until the view borrows the picture. -->
			<VideoSurface />
			{#if np.open && playback.now}
				<div class="hidden md:contents">
					<NowPlaying {queueOpen} {lyricsOpen} />
				</div>
			{/if}
			<!-- Lyrics before queue: side by side over the page, lyrics on the left, queue on the right. -->
			{#if lyricsOpen}<LyricsPanel onClose={() => (lyricsOpen = false)} {queueOpen} />{/if}
			{#if queueOpen}<QueuePanel onClose={() => (queueOpen = false)} />{/if}
		</div>
		<!-- Persistent Player Bar (floating macOS liquid glass dock) -->
		{#if playback.now && !np.open}
			<div
				class="fixed md:absolute bottom-[calc(env(safe-area-inset-bottom,0px)+3.85rem)] md:bottom-3.5 inset-x-0 z-20 px-2.5 sm:px-3 md:px-6 pointer-events-none"
				in:fly={{ y: 64, duration: 250, easing: cubicOut }}
			>
				<div class="pointer-events-auto max-w-lg md:max-w-7xl mx-auto w-full">
					<PlayerBar
						onToggleQueue={() => (tabbed ? (np.tab = 'queue') : (queueOpen = !queueOpen))}
						queueOpen={tabbed ? np.tab === 'queue' : queueOpen}
						onToggleLyrics={() => (tabbed ? (np.tab = 'lyrics') : (lyricsOpen = !lyricsOpen))}
						lyricsOpen={tabbed ? np.tab === 'lyrics' : lyricsOpen}
					/>
				</div>
			</div>
		{:else if !np.open}
			<div class="hidden md:block absolute bottom-3.5 inset-x-0 z-20 px-6 pointer-events-none">
				<div class="pointer-events-auto max-w-7xl mx-auto w-full">
					<PlayerBar
						onToggleQueue={() => (tabbed ? (np.tab = 'queue') : (queueOpen = !queueOpen))}
						queueOpen={tabbed ? np.tab === 'queue' : queueOpen}
						onToggleLyrics={() => (tabbed ? (np.tab = 'lyrics') : (lyricsOpen = !lyricsOpen))}
						lyricsOpen={tabbed ? np.tab === 'lyrics' : lyricsOpen}
					/>
				</div>
			</div>
		{/if}
		<!-- Mobile Bottom Navigation Bar (< md) -->
		<MobileNav />
	</div>

	<!-- Fullscreen Mobile Now Playing Screen (< md) -->
	{#if np.open && playback.now}
		<MobileNowPlaying />
	{/if}

	<!-- Fullscreen 60FPS Audio Visualizer Studio (vizz.fm Style) -->
	{#if audioFx.visualizerModalOpen && playback.now}
		<VisualizerStudio onClose={() => (audioFx.visualizerModalOpen = false)} />
	{/if}

	<!-- Theater mode covers everything, titlebar included, and puts the window in fullscreen for as
	     long as it is mounted. Nothing playing means nothing to show, and that guard is also what
	     closes it (and leaves fullscreen) when the queue runs out. -->
	{#if ui.theaterOpen && playback.now}<TheaterMode />{/if}
	{#if !ui.theaterOpen && playback.now}<FloatingVideoPlayer />{/if}

	<CommandPalette />
	<KeyboardShortcuts />
	<AddToPlaylist />
	<ShareDialog />
	<SettingsDialog />
	<AiDjDialog bind:open={ui.aiDjOpen} />
	<SongIdentifierModal />
	<ChannelPicker />
	<ListenTogether />
	<LinkDialog />
	<CookieConsent />
	<LegalDialog />
	<GlassFilter />
	<PwaInstallBanner />

	<!-- The two notification banners below run at z-[100]. Dialogs and menus sit at z-50 and portal to
	     <body>, so a z-50 banner loses the tie on DOM order and hides behind an open modal. -->
	{#if updateState.available}
		<div
			transition:fly={{ y: 16, duration: 220, easing: cubicOut }}
			class="fixed bottom-24 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-3 rounded-lg border bg-card px-4 py-2 text-sm shadow-lg"
		>
			<span>{t('settings.about.update_available', { version: updateState.available.version })}</span>
			{#if updateState.canInstall}
				<Button size="sm" onclick={installUpdate} disabled={updateState.installing}>
					{updateState.installing ? t('common.loading') : t('settings.about.install_update')}
				</Button>
			{:else}
				<!-- Packaged build (.rpm, AUR): the updater can only rewrite an AppImage, so send them
				     to the releases page and let their package manager do it. -->
				<Button size="sm" onclick={openDownloadPage}>{t('settings.about.download_page')}</Button>
			{/if}
			{#if !updateState.installing}
				<button
					class="text-muted-foreground hover:text-foreground"
					aria-label={t('common.close')}
					onclick={() => (updateState.available = null)}>✕</button
				>
			{/if}
		</div>
	{/if}

	{#if ui.toast}
		{@const t = ui.toast}
		<div
			transition:fly={{ y: 16, duration: 220, easing: cubicOut }}
			class="fixed bottom-40 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm shadow-lg"
		>
			<!-- Three branches instead of a ternary on `icon`: HugeiconsIcon freezes `icon` at mount, so a
			     new toast replacing a visible one would keep the old glyph. -->
			{#if t.kind === 'success'}
				<HugeiconsIcon icon={CheckmarkCircle02Icon} class="h-4 w-4 shrink-0 text-primary" />
			{:else if t.kind === 'error'}
				<HugeiconsIcon icon={AlertCircleIcon} class="h-4 w-4 shrink-0 text-destructive" />
			{:else}
				<HugeiconsIcon
					icon={InformationCircleIcon}
					class="h-4 w-4 shrink-0 text-muted-foreground"
				/>
			{/if}
			{t.msg}
		</div>
	{/if}
{/if}
