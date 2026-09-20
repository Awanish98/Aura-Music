<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		Moon02Icon,
		CheckmarkCircle01Icon,
		Cancel01Icon,
		Time02Icon
	} from '@hugeicons/core-free-icons';
	import { Button } from '$lib/components/ui/button';
	import { sleepTimer, setSleepTimer } from '$lib/player.svelte';

	let { open = $bindable(false) }: { open: boolean } = $props();

	const options: { label: string; value: number | 'end' | null }[] = [
		{ label: 'Off', value: null },
		{ label: 'End of Track', value: 'end' },
		{ label: '15 Minutes', value: 15 },
		{ label: '30 Minutes', value: 30 },
		{ label: '45 Minutes', value: 45 },
		{ label: '1 Hour', value: 60 }
	];

	function formatRemaining(secs: number) {
		const m = Math.floor(secs / 60);
		const s = secs % 60;
		return `${m}:${s.toString().padStart(2, '0')}`;
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		transition:fade={{ duration: 150 }}
	>
		<!-- Backdrop -->
		<button
			class="absolute inset-0 bg-black/60 backdrop-blur-md"
			onclick={() => (open = false)}
			aria-label="Close"
		></button>

		<!-- Dialog card -->
		<div
			class="relative w-full max-w-sm rounded-2xl border border-white/10 bg-card/95 p-5 text-card-foreground shadow-2xl backdrop-blur-2xl"
			transition:scale={{ start: 0.92, duration: 200, easing: cubicOut }}
		>
			<div class="flex items-center justify-between pb-3 border-b border-border/40">
				<div class="flex items-center gap-2">
					<div class="flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary">
						<HugeiconsIcon icon={Moon02Icon} size={18} />
					</div>
					<div>
						<h3 class="font-heading text-sm font-semibold">Sleep Timer</h3>
						<p class="text-xs text-muted-foreground">
							{#if sleepTimer.active}
								{#if sleepTimer.endOfSong}
									Stops at the end of this song
								{:else}
									Stops in <span class="font-semibold text-primary">{formatRemaining(sleepTimer.remainingSecs)}</span>
								{/if}
							{:else}
								Automatically stop playback
							{/if}
						</p>
					</div>
				</div>
				<button
					class="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
					onclick={() => (open = false)}
				>
					<HugeiconsIcon icon={Cancel01Icon} size={18} />
				</button>
			</div>

			<div class="mt-4 flex flex-col gap-1.5">
				{#each options as opt}
					{@const isSelected =
						opt.value === null
							? !sleepTimer.active
							: opt.value === 'end'
								? sleepTimer.active && sleepTimer.endOfSong
								: sleepTimer.active &&
									!sleepTimer.endOfSong &&
									Math.round(sleepTimer.remainingSecs / 60) === opt.value}
					<button
						class="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 {isSelected
							? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
							: 'hover:bg-muted/70 text-foreground'}"
						onclick={() => {
							setSleepTimer(opt.value);
							open = false;
						}}
					>
						<span class="flex items-center gap-2.5">
							<HugeiconsIcon icon={Time02Icon} size={16} />
							{opt.label}
						</span>
						{#if isSelected}
							<HugeiconsIcon icon={CheckmarkCircle01Icon} size={18} />
						{/if}
					</button>
				{/each}
			</div>
		</div>
	</div>
{/if}
