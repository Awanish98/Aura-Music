<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { InformationCircleIcon, ArrowLeft02Icon, SparklesIcon, MusicNote01Icon, Mic01Icon, Radio02Icon } from '@hugeicons/core-free-icons';
	import TelegramIcon from '$lib/components/TelegramIcon.svelte';
</script>

<svelte:head>
	<title>About – Aura Music Platform</title>
	<meta name="description" content="Discover Aura Music: an open-source, next-generation music streaming experience with lossless 320kbps audio, synced lyrics, and AI DJ curation." />
</svelte:head>

<div class="mx-auto max-w-4xl px-4 sm:px-6 py-8 md:py-12 space-y-8 text-foreground">
	<div class="flex items-center gap-3">
		<a href="/" class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
			<HugeiconsIcon icon={ArrowLeft02Icon} size={16} /> Back to Music
		</a>
	</div>

	<div class="space-y-2 border-b border-border/60 pb-6">
		<div class="inline-flex items-center gap-2 text-primary font-semibold text-sm">
			<HugeiconsIcon icon={SparklesIcon} size={20} /> Next-Gen Audio Experience
		</div>
		<h1 class="text-3xl font-heading font-extrabold tracking-tight">About Aura Music</h1>
		<p class="text-sm text-muted-foreground">Studio Quality 320kbps Lossless Audio • Word-Synced Karaoke Lyrics • AI DJ Intelligence</p>
	</div>

	<div class="space-y-6 text-sm text-foreground/90 leading-relaxed">
		<div class="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card/60 to-transparent p-6 space-y-3">
			<h2 class="text-xl font-bold text-foreground">Our Mission</h2>
			<p class="text-muted-foreground leading-relaxed">
				Aura Music was designed to combine the clean, premium UI of Apple Music and Spotify with high-fidelity lossless streaming, real-time synced lyrics, and zero intrusive ads or tracking.
			</p>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<div class="rounded-2xl border border-white/10 bg-card/50 p-5 space-y-2">
				<div class="flex items-center gap-2 font-bold text-primary text-base">
					<HugeiconsIcon icon={MusicNote01Icon} size={18} /> Studio Audio Quality
				</div>
				<p class="text-xs text-muted-foreground leading-relaxed">
					Direct access to 320kbps and 160kbps audio streams with high dynamic range and hardware equalizer support.
				</p>
			</div>

			<div class="rounded-2xl border border-white/10 bg-card/50 p-5 space-y-2">
				<div class="flex items-center gap-2 font-bold text-primary text-base">
					<HugeiconsIcon icon={Mic01Icon} size={18} /> Millisecond-Synced Lyrics
				</div>
				<p class="text-xs text-muted-foreground leading-relaxed">
					Real-time LRCLIB synced karaoke lyrics with active line highlighting and Apple Music-style word sweeps.
				</p>
			</div>

			<div class="rounded-2xl border border-white/10 bg-card/50 p-5 space-y-2">
				<div class="flex items-center gap-2 font-bold text-primary text-base">
					<HugeiconsIcon icon={Radio02Icon} size={18} /> FMHY Live Radio
				</div>
				<p class="text-xs text-muted-foreground leading-relaxed">
					24/7 global broadcast genre radio stations for uninterrupted ambient focus, lofi beats, and synthwave vibes.
				</p>
			</div>

			<div class="rounded-2xl border border-white/10 bg-card/50 p-5 space-y-2">
				<div class="flex items-center gap-2 font-bold text-primary text-base">
					<HugeiconsIcon icon={SparklesIcon} size={18} /> Smart AI DJ Agent
				</div>
				<p class="text-xs text-muted-foreground leading-relaxed">
					Contextual playlist generator and vibe builder tailored to your mood, current track, and listening habits.
				</p>
			</div>
		</div>

		<!-- Telegram Bot Banner Card -->
		<div class="rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-transparent p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
			<div class="space-y-1">
				<div class="flex items-center gap-2 text-sky-400 font-bold text-base">
					<TelegramIcon class="size-5 text-sky-400" />
					<span>Official Telegram Bot (@Aura36bot)</span>
				</div>
				<p class="text-xs text-muted-foreground max-w-xl">
					Search, stream, and download 320kbps audio files directly in Telegram or launch the full Aura Music Mini App right inside your chats.
				</p>
			</div>
			<a
				href="https://t.me/Aura36bot"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs px-4 py-2.5 shadow-lg shadow-sky-500/25 transition-all hover:scale-105 active:scale-95 shrink-0"
			>
				<TelegramIcon class="size-4" />
				<span>Open @Aura36bot</span>
			</a>
		</div>
	</div>
</div>
