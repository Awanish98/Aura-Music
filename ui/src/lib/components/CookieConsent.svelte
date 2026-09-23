<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { CookieIcon } from '@hugeicons/core-free-icons';
	import { Button } from '$lib/components/ui/button';
	import { ui } from '$lib/player.svelte';

	let visible = $state(false);

	onMount(() => {
		try {
			const consent = localStorage.getItem('aura_cookie_consent');
			if (!consent) {
				const t = setTimeout(() => {
					visible = true;
				}, 1200);
				return () => clearTimeout(t);
			}
		} catch {}
	});

	function accept() {
		try {
			localStorage.setItem('aura_cookie_consent', 'accepted');
		} catch {}
		visible = false;
	}
</script>

{#if visible}
	<div
		transition:fly={{ y: 30, duration: 300, easing: cubicOut }}
		class="fixed bottom-24 left-4 sm:left-6 z-50 max-w-sm sm:max-w-md rounded-2xl border border-white/15 bg-background/95 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl text-foreground"
		role="region"
		aria-label="Cookie & Privacy Consent"
	>
		<div class="flex items-start gap-3.5">
			<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
				<HugeiconsIcon icon={CookieIcon} class="h-5 w-5" />
			</div>
			<div class="flex-1 space-y-1">
				<h3 class="text-sm font-semibold tracking-tight">Privacy & Cookie Choices</h3>
				<p class="text-xs leading-relaxed text-muted-foreground">
					Aura Music uses local storage and essential cookies to save your playback queue, personal playlists, and audio preferences for an uninterrupted listening experience.
				</p>
			</div>
		</div>

		<div class="mt-3.5 flex items-center justify-between gap-2 pt-2 border-t border-white/10">
			<button
				type="button"
				onclick={() => {
					ui.legalTab = 'privacy';
					ui.legalOpen = true;
				}}
				class="text-xs text-primary/90 underline-offset-4 hover:underline transition-colors cursor-pointer"
			>
				Privacy Policy & Terms
			</button>
			<div class="flex items-center gap-2">
				<Button size="sm" variant="outline" class="h-8 text-xs" onclick={accept}>
					Essential Only
				</Button>
				<Button size="sm" class="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90 shadow-md" onclick={accept}>
					Accept All
				</Button>
			</div>
		</div>
	</div>
{/if}
