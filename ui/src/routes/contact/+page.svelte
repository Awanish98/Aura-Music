<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Mail01Icon, ArrowLeft02Icon, HelpCircleIcon, GithubIcon } from '@hugeicons/core-free-icons';
</script>

<svelte:head>
	<title>Contact & Support – Aura Music</title>
	<meta name="description" content="Get in touch with the Aura Music development team. Report bugs, submit music requests, or reach out for technical support." />
</svelte:head>

<div class="mx-auto max-w-4xl px-4 sm:px-6 py-8 md:py-12 space-y-8 text-foreground">
	<div class="flex items-center gap-3">
		<a href="/" class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
			<HugeiconsIcon icon={ArrowLeft02Icon} size={16} /> Back to Music
		</a>
	</div>

	<div class="space-y-2 border-b border-border/60 pb-6">
		<div class="inline-flex items-center gap-2 text-primary font-semibold text-sm">
			<HugeiconsIcon icon={HelpCircleIcon} size={20} /> Community & Support
		</div>
		<h1 class="text-3xl font-heading font-extrabold tracking-tight">Contact Us</h1>
		<p class="text-sm text-muted-foreground">Have questions, feedback, or feature requests? We'd love to hear from you.</p>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
		<div class="rounded-2xl border border-white/10 bg-card/50 p-6 space-y-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
				<HugeiconsIcon icon={Mail01Icon} size={20} />
			</div>
			<h2 class="text-base font-bold text-foreground">Email Support</h2>
			<p class="text-xs text-muted-foreground leading-relaxed">
				For direct queries, privacy assistance, or general help, drop us an email anytime:
			</p>
			<a
				href="mailto:support@auramusic.io"
				class="inline-block font-semibold text-primary hover:underline text-sm"
			>
				support@auramusic.io
			</a>
		</div>

		<div class="rounded-2xl border border-white/10 bg-card/50 p-6 space-y-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
				<HugeiconsIcon icon={GithubIcon} size={20} />
			</div>
			<h2 class="text-base font-bold text-foreground">GitHub Open Source</h2>
			<p class="text-xs text-muted-foreground leading-relaxed">
				Found a bug or want to contribute code? Check out our active open source repository:
			</p>
			<a
				href="https://github.com/Awanish98/Aura-Music"
				target="_blank"
				rel="noreferrer"
				class="inline-block font-semibold text-primary hover:underline text-sm"
			>
				github.com/Awanish98/Aura-Music
			</a>
		</div>
	</div>
</div>
