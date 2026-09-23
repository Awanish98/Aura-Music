<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Tabs from '$lib/components/ui/tabs';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		ShieldCheckIcon,
		FileValidationIcon,
		InformationCircleIcon,
		Mail01Icon,
		CheckmarkCircle02Icon
	} from '@hugeicons/core-free-icons';
	import { ui } from '$lib/player.svelte';
</script>

<Dialog.Root bind:open={ui.legalOpen}>
	<Dialog.Content class="max-w-2xl max-h-[85vh] overflow-y-auto border border-white/15 bg-background/95 backdrop-blur-2xl p-6 shadow-2xl rounded-3xl">
		<Dialog.Header>
			<Dialog.Title class="text-xl font-heading font-bold tracking-tight flex items-center gap-2.5">
				<HugeiconsIcon icon={ShieldCheckIcon} class="h-6 w-6 text-primary" />
				Aura Music • Trust & Transparency Center
			</Dialog.Title>
			<Dialog.Description class="text-sm text-muted-foreground">
				Learn about our privacy commitments, open audio architecture, and terms of service.
			</Dialog.Description>
		</Dialog.Header>

		<Tabs.Root value={ui.legalTab || 'privacy'} onValueChange={(v) => (ui.legalTab = v as any)} class="mt-4">
			<Tabs.List class="grid grid-cols-4 w-full bg-card/60 p-1 border border-white/10 rounded-xl">
				<Tabs.Trigger value="privacy" class="text-xs gap-1.5">
					<HugeiconsIcon icon={ShieldCheckIcon} class="h-3.5 w-3.5" /> Privacy
				</Tabs.Trigger>
				<Tabs.Trigger value="terms" class="text-xs gap-1.5">
					<HugeiconsIcon icon={FileValidationIcon} class="h-3.5 w-3.5" /> Terms
				</Tabs.Trigger>
				<Tabs.Trigger value="about" class="text-xs gap-1.5">
					<HugeiconsIcon icon={InformationCircleIcon} class="h-3.5 w-3.5" /> About
				</Tabs.Trigger>
				<Tabs.Trigger value="contact" class="text-xs gap-1.5">
					<HugeiconsIcon icon={Mail01Icon} class="h-3.5 w-3.5" /> Contact
				</Tabs.Trigger>
			</Tabs.List>

			<!-- Privacy Policy Tab -->
			<Tabs.Content value="privacy" class="mt-4 space-y-4 text-xs sm:text-sm text-foreground/90 leading-relaxed">
				<div class="rounded-2xl border border-white/10 bg-card/40 p-4 space-y-3">
					<h4 class="font-semibold text-primary flex items-center gap-2">
						<HugeiconsIcon icon={CheckmarkCircle02Icon} class="h-4 w-4" /> 1. Zero Third-Party Tracking & Advertising
					</h4>
					<p class="text-muted-foreground text-xs leading-relaxed">
						Aura Music does NOT sell, rent, or trade your personal data. We do not use third-party analytics trackers, invasive advertising SDKs, or pixel trackers.
					</p>
				</div>

				<div class="rounded-2xl border border-white/10 bg-card/40 p-4 space-y-3">
					<h4 class="font-semibold text-primary flex items-center gap-2">
						<HugeiconsIcon icon={CheckmarkCircle02Icon} class="h-4 w-4" /> 2. Google OAuth & YouTube Playlist Access
					</h4>
					<p class="text-muted-foreground text-xs leading-relaxed">
						When you connect your Google Account, we only request read-only access (<code>youtube.readonly</code> and personal Drive audio metadata) to fetch your public/private music playlists and saved tracks. OAuth tokens are stored locally on your device and are never sent to external third parties.
					</p>
				</div>

				<div class="rounded-2xl border border-white/10 bg-card/40 p-4 space-y-3">
					<h4 class="font-semibold text-primary flex items-center gap-2">
						<HugeiconsIcon icon={CheckmarkCircle02Icon} class="h-4 w-4" /> 3. Local Storage & Client Data
					</h4>
					<p class="text-muted-foreground text-xs leading-relaxed">
						Your playback history, volume preference, theme selection, and pin configurations are stored strictly within your browser's local storage (<code>localStorage</code> / IndexedDB) on your own device.
					</p>
				</div>
			</Tabs.Content>

			<!-- Terms of Service Tab -->
			<Tabs.Content value="terms" class="mt-4 space-y-4 text-xs sm:text-sm text-foreground/90 leading-relaxed">
				<div class="rounded-2xl border border-white/10 bg-card/40 p-4 space-y-2">
					<h4 class="font-semibold text-foreground">1. Personal & Non-Commercial Use</h4>
					<p class="text-muted-foreground text-xs leading-relaxed">
						Aura Music is provided as an open, high-fidelity personal media aggregator. The application is intended strictly for personal, non-commercial entertainment and listening enjoyment.
					</p>
				</div>

				<div class="rounded-2xl border border-white/10 bg-card/40 p-4 space-y-2">
					<h4 class="font-semibold text-foreground">2. Audio Streams & Intellectual Property</h4>
					<p class="text-muted-foreground text-xs leading-relaxed">
						All music tracks, album artworks, metadata, and artist names are copyrighted and owned by their respective record labels, artists, and publishers (including YouTube, JioSaavn, and LRCLIB). Aura Music functions as a client frontend interface.
					</p>
				</div>

				<div class="rounded-2xl border border-white/10 bg-card/40 p-4 space-y-2">
					<h4 class="font-semibold text-foreground">3. Service Availability</h4>
					<p class="text-muted-foreground text-xs leading-relaxed">
						The service is provided on an "as-is" and "as-available" basis without warranties of any kind.
					</p>
				</div>
			</Tabs.Content>

			<!-- About Aura Music Tab -->
			<Tabs.Content value="about" class="mt-4 space-y-4 text-xs sm:text-sm text-foreground/90 leading-relaxed">
				<div class="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2">
					<h4 class="font-bold text-foreground text-base">Aura Music v1.2.0</h4>
					<p class="text-muted-foreground text-xs leading-relaxed">
						A modern, next-generation streaming platform combining lossless 320kbps audio, Spotify & Apple Music-grade interface design, real-time karaoke synced lyrics, and Google Drive & YouTube cloud integration.
					</p>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
					<div class="rounded-xl border border-white/10 bg-card/50 p-3">
						<span class="font-semibold text-primary block">Lossless JioSaavn 320kbps</span>
						<span class="text-muted-foreground">Studio audio quality stream extraction</span>
					</div>
					<div class="rounded-xl border border-white/10 bg-card/50 p-3">
						<span class="font-semibold text-primary block">LRCLIB Real-time Synced Lyrics</span>
						<span class="text-muted-foreground">Millisecond-precise karaoke word sweep</span>
					</div>
					<div class="rounded-xl border border-white/10 bg-card/50 p-3">
						<span class="font-semibold text-primary block">FMHY 24/7 Live Radio</span>
						<span class="text-muted-foreground">Curated global genre broadcast stations</span>
					</div>
					<div class="rounded-xl border border-white/10 bg-card/50 p-3">
						<span class="font-semibold text-primary block">Aura AI DJ</span>
						<span class="text-muted-foreground">Smart contextual music curation & vibes</span>
					</div>
				</div>
			</Tabs.Content>

			<!-- Contact Support Tab -->
			<Tabs.Content value="contact" class="mt-4 space-y-4 text-xs sm:text-sm text-foreground/90 leading-relaxed">
				<div class="rounded-2xl border border-white/10 bg-card/40 p-4 space-y-3">
					<h4 class="font-semibold text-foreground">Need help or want to suggest a feature?</h4>
					<p class="text-muted-foreground text-xs leading-relaxed">
						We'd love to hear your feedback, bug reports, and music suggestions!
					</p>
					<div class="space-y-2 pt-2 text-xs">
						<div class="flex items-center gap-2">
							<span class="text-muted-foreground font-medium">Developer / Maintainer:</span>
							<span class="font-semibold text-foreground">Awanish & Aura Music Team</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="text-muted-foreground font-medium">GitHub Repository:</span>
							<a
								href="https://github.com/Awanish98/Aura-Music"
								target="_blank"
								rel="noreferrer"
								class="text-primary hover:underline"
							>
								github.com/Awanish98/Aura-Music
							</a>
						</div>
						<div class="flex items-center gap-2">
							<span class="text-muted-foreground font-medium">Email Support:</span>
							<a
								href="mailto:support@auramusic.io"
								class="text-primary hover:underline"
							>
								support@auramusic.io
							</a>
						</div>
					</div>
				</div>
			</Tabs.Content>
		</Tabs.Root>

		<Dialog.Footer class="mt-5 border-t border-white/10 pt-4 flex justify-end">
			<Dialog.Close class="cursor-pointer px-4 py-2 text-xs font-semibold rounded-xl bg-card hover:bg-card/80 border border-white/10 transition-colors">
				Close
			</Dialog.Close>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
