<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { FileValidationIcon, ArrowLeft02Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
</script>

<svelte:head>
	<title>Terms & Conditions – Aura Music</title>
	<meta name="description" content="Aura Music Terms and Conditions of Service. Fair use, non-commercial personal listening, and media provider agreements." />
</svelte:head>

<div class="mx-auto max-w-4xl px-4 sm:px-6 py-8 md:py-12 space-y-8 text-foreground">
	<div class="flex items-center gap-3">
		<a href="/" class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
			<HugeiconsIcon icon={ArrowLeft02Icon} size={16} /> Back to Music
		</a>
	</div>

	<div class="space-y-2 border-b border-border/60 pb-6">
		<div class="inline-flex items-center gap-2 text-primary font-semibold text-sm">
			<HugeiconsIcon icon={FileValidationIcon} size={20} /> Legal Agreement
		</div>
		<h1 class="text-3xl font-heading font-extrabold tracking-tight">Terms and Conditions of Use</h1>
		<p class="text-xs text-muted-foreground">Effective Date: September 2026</p>
	</div>

	<div class="space-y-6 text-sm text-foreground/90 leading-relaxed">
		<section class="space-y-3 rounded-2xl border border-white/10 bg-card/50 p-5">
			<h2 class="text-lg font-bold text-foreground flex items-center gap-2">
				<HugeiconsIcon icon={CheckmarkCircle02Icon} class="h-5 w-5 text-primary" />
				1. Personal & Non-Commercial License
			</h2>
			<p class="text-muted-foreground leading-relaxed">
				Aura Music is provided free of charge for personal, non-commercial entertainment and media playback purposes. Users agree not to redistribute, reverse-engineer, or use the service for illegal activities.
			</p>
		</section>

		<section class="space-y-3 rounded-2xl border border-white/10 bg-card/50 p-5">
			<h2 class="text-lg font-bold text-foreground flex items-center gap-2">
				<HugeiconsIcon icon={CheckmarkCircle02Icon} class="h-5 w-5 text-primary" />
				2. Third-Party Music Services & Content Ownership
			</h2>
			<p class="text-muted-foreground leading-relaxed">
				All songs, tracks, album covers, artist names, and lyrics displayed within Aura Music remain the intellectual property of their respective copyright holders, labels, and original service providers (including YouTube, JioSaavn, and LRCLIB).
			</p>
		</section>

		<section class="space-y-3 rounded-2xl border border-white/10 bg-card/50 p-5">
			<h2 class="text-lg font-bold text-foreground flex items-center gap-2">
				<HugeiconsIcon icon={CheckmarkCircle02Icon} class="h-5 w-5 text-primary" />
				3. Warranty & Service Availability
			</h2>
			<p class="text-muted-foreground leading-relaxed">
				The software is provided on an "as-is" basis without warranties of any kind. Maintainers are not liable for any service interruptions, stream availability changes, or third-party API deprecations.
			</p>
		</section>
	</div>
</div>
