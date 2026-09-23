<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { ShieldCheckIcon, CheckmarkCircle02Icon, ArrowLeft02Icon } from '@hugeicons/core-free-icons';
</script>

<svelte:head>
	<title>Privacy Policy – Aura Music</title>
	<meta name="description" content="Aura Music Privacy Policy. We do not track, collect personal information, or sell your data. Learn how we handle Google OAuth read-only tokens." />
</svelte:head>

<div class="mx-auto max-w-4xl px-4 sm:px-6 py-8 md:py-12 space-y-8 text-foreground">
	<div class="flex items-center gap-3">
		<a href="/" class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
			<HugeiconsIcon icon={ArrowLeft02Icon} size={16} /> Back to Music
		</a>
	</div>

	<div class="space-y-2 border-b border-border/60 pb-6">
		<div class="inline-flex items-center gap-2 text-primary font-semibold text-sm">
			<HugeiconsIcon icon={ShieldCheckIcon} size={20} /> Trust & Privacy
		</div>
		<h1 class="text-3xl font-heading font-extrabold tracking-tight">Privacy Policy</h1>
		<p class="text-xs text-muted-foreground">Last updated: September 2026</p>
	</div>

	<div class="space-y-6 text-sm text-foreground/90 leading-relaxed">
		<section class="space-y-3 rounded-2xl border border-white/10 bg-card/50 p-5">
			<h2 class="text-lg font-bold text-foreground flex items-center gap-2">
				<HugeiconsIcon icon={CheckmarkCircle02Icon} class="h-5 w-5 text-primary" />
				1. Zero Third-Party Tracking & Data Selling
			</h2>
			<p class="text-muted-foreground leading-relaxed">
				Aura Music is built with privacy-first principles. We do not sell, monetize, or trade your personal listening history, metadata, or activity to advertising networks or third-party data brokers.
			</p>
		</section>

		<section class="space-y-3 rounded-2xl border border-white/10 bg-card/50 p-5">
			<h2 class="text-lg font-bold text-foreground flex items-center gap-2">
				<HugeiconsIcon icon={CheckmarkCircle02Icon} class="h-5 w-5 text-primary" />
				2. Google OAuth & YouTube Playlist Access
			</h2>
			<p class="text-muted-foreground leading-relaxed">
				When you choose to sign in with your Google Account, Aura Music requests strictly read-only scopes (<code>youtube.readonly</code> and Drive audio file metadata). Tokens are stored locally on your device in your browser's private storage and are never transmitted to external third-party analytics servers.
			</p>
		</section>

		<section class="space-y-3 rounded-2xl border border-white/10 bg-card/50 p-5">
			<h2 class="text-lg font-bold text-foreground flex items-center gap-2">
				<HugeiconsIcon icon={CheckmarkCircle02Icon} class="h-5 w-5 text-primary" />
				3. Local Storage & Preferences
			</h2>
			<p class="text-muted-foreground leading-relaxed">
				All your personal settings, volume preferences, custom themes, queue order, and favorites are stored directly on your client browser using standard HTML5 LocalStorage and IndexedDB APIs.
			</p>
		</section>

		<section class="space-y-3 rounded-2xl border border-white/10 bg-card/50 p-5">
			<h2 class="text-lg font-bold text-foreground flex items-center gap-2">
				<HugeiconsIcon icon={CheckmarkCircle02Icon} class="h-5 w-5 text-primary" />
				4. Contact & Compliance
			</h2>
			<p class="text-muted-foreground leading-relaxed">
				For questions regarding privacy, GDPR, or CCPA compliance, please contact our maintainers at <a href="mailto:support@auramusic.io" class="text-primary underline">support@auramusic.io</a> or file an issue on our <a href="https://github.com/Awanish98/Aura-Music" target="_blank" rel="noreferrer" class="text-primary underline">GitHub Repository</a>.
			</p>
		</section>
	</div>
</div>
