<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		AudioWave02Icon,
		Cancel01Icon,
		CheckmarkCircle01Icon,
		Moon02Icon,
		SparklesIcon,
		VolumeHighIcon
	} from '@hugeicons/core-free-icons';
	import {
		audioFx,
		setEqPreset,
		setEqBands,
		setAudioQuality,
		setPlaybackMode,
		setCrossfadeDuration,
		EQ_PRESETS,
		type EqPreset,
		type PlaybackMode,
		playback
	} from '$lib/player.svelte';
	import SleepTimerModal from './SleepTimerModal.svelte';

	let { open = $bindable(false) }: { open: boolean } = $props();

	let showSleepTimer = $state(false);

	const qualityOptions: { id: '320k' | '160k' | '128k' | '64k'; label: string; sub: string }[] = [
		{ id: '320k', label: '320 kbps', sub: 'Ultra Lossless / Hi-Fi' },
		{ id: '160k', label: '160 kbps', sub: 'High Quality (Balanced)' },
		{ id: '128k', label: '128 kbps', sub: 'Standard Quality' },
		{ id: '64k', label: '64 kbps', sub: 'Data Saver' }
	];

	function onPresetSelect(key: EqPreset) {
		setEqPreset(key);
	}

	function onSliderChange() {
		setEqBands(audioFx.bass, audioFx.mid, audioFx.treble);
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 select-none"
		transition:fade={{ duration: 150 }}
	>
		<!-- Backdrop -->
		<button
			class="absolute inset-0 bg-black/60 backdrop-blur-md"
			onclick={() => (open = false)}
			aria-label="Close"
		></button>

		<!-- Dialog Card -->
		<div
			class="relative w-full max-w-lg rounded-2xl border border-white/10 bg-card/95 p-6 text-card-foreground shadow-2xl backdrop-blur-2xl max-h-[90vh] overflow-y-auto"
			transition:scale={{ start: 0.92, duration: 200, easing: cubicOut }}
		>
			<!-- Header -->
			<div class="flex items-center justify-between pb-4 border-b border-border/40">
				<div class="flex items-center gap-3">
					<div class="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
						<HugeiconsIcon icon={AudioWave02Icon} size={22} />
					</div>
					<div>
						<h3 class="font-heading text-base font-bold flex items-center gap-2">
							<span>Sound Equalizer & Audio FX</span>
							<span class="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20 font-mono uppercase">
								Pro FX
							</span>
						</h3>
						<p class="text-xs text-muted-foreground">
							Customize sound stage, bass response, and stream fidelity.
						</p>
					</div>
				</div>
				<button
					class="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
					onclick={() => (open = false)}
				>
					<HugeiconsIcon icon={Cancel01Icon} size={18} />
				</button>
			</div>

			<div class="mt-5 space-y-6">
				<!-- Section: Playback Mode (Normal, Gapless, DJ Crossfade) -->
				<div class="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-4">
					<div class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-between">
						<span class="flex items-center gap-1.5 text-foreground">
							<HugeiconsIcon icon={SparklesIcon} size={14} class="text-primary" />
							<span>Smart Transitions</span>
						</span>
						{#if playback.crossfading}
							<span class="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30 animate-pulse font-bold">
								<span class="size-1.5 rounded-full bg-pink-400 animate-ping"></span>
								DJ Fading
							</span>
						{:else if playback.preloading}
							<span class="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold">
								Buffered
							</span>
						{:else}
							<span class="text-[10px] font-mono text-primary font-bold uppercase px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
								{audioFx.playbackMode}
							</span>
						{/if}
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
						<!-- Normal -->
						<button
							class="flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer {audioFx.playbackMode === 'normal'
								? 'border-primary bg-primary/15 text-primary shadow-lg shadow-primary/10 ring-1 ring-primary'
								: 'border-border/60 bg-muted/20 hover:border-foreground/30 text-foreground hover:bg-muted/40'}"
							onclick={() => setPlaybackMode('normal')}
						>
							<div class="flex items-center justify-between w-full">
								<span class="text-xs font-bold flex items-center gap-1">
									<span>Standard</span>
								</span>
								{#if audioFx.playbackMode === 'normal'}
									<HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} class="text-primary" />
								{/if}
							</div>
							<span class="text-[10px] text-muted-foreground mt-1 leading-tight">Plays track to track normally</span>
						</button>

						<!-- Gapless -->
						<button
							class="flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer {audioFx.playbackMode === 'gapless'
								? 'border-cyan-500 bg-cyan-500/15 text-cyan-400 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500'
								: 'border-border/60 bg-muted/20 hover:border-foreground/30 text-foreground hover:bg-muted/40'}"
							onclick={() => setPlaybackMode('gapless')}
						>
							<div class="flex items-center justify-between w-full">
								<span class="text-xs font-bold flex items-center gap-1">
									<span>Gapless</span>
								</span>
								{#if audioFx.playbackMode === 'gapless'}
									<HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} class="text-cyan-400" />
								{/if}
							</div>
							<span class="text-[10px] text-muted-foreground mt-1 leading-tight">Preload next & zero-gap handoff</span>
						</button>

						<!-- Crossfade -->
						<button
							class="flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer {audioFx.playbackMode === 'crossfade'
								? 'border-pink-500 bg-pink-500/15 text-pink-400 shadow-lg shadow-pink-500/10 ring-1 ring-pink-500'
								: 'border-border/60 bg-muted/20 hover:border-foreground/30 text-foreground hover:bg-muted/40'}"
							onclick={() => setPlaybackMode('crossfade')}
						>
							<div class="flex items-center justify-between w-full">
								<span class="text-xs font-bold flex items-center gap-1">
									<span>DJ Crossfade</span>
								</span>
								{#if audioFx.playbackMode === 'crossfade'}
									<HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} class="text-pink-400" />
								{/if}
							</div>
							<span class="text-[10px] text-muted-foreground mt-1 leading-tight">Seamless Equal-Power overlap</span>
						</button>
					</div>

					<!-- Crossfade Duration Controls & Presets -->
					{#if audioFx.playbackMode === 'crossfade'}
						<div class="mt-3 rounded-xl border border-pink-500/30 bg-gradient-to-r from-pink-500/10 via-purple-500/5 to-transparent p-3.5 flex flex-col gap-3">
							<div class="flex items-center justify-between text-xs">
								<div class="flex items-center gap-1.5 font-bold text-foreground">
									<span>Overlap Duration</span>
									<span class="text-[10px] font-normal text-muted-foreground">(Equal-Power Curve)</span>
								</div>
								<span class="font-mono font-bold text-pink-400 px-2.5 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30">
									{audioFx.crossfadeDuration} seconds
								</span>
							</div>

							<!-- Duration Presets (3s, 5s, 8s, 12s) -->
							<div class="grid grid-cols-4 gap-1.5">
								{#each [3, 5, 8, 12] as sec}
									<button
										class="py-1 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer border {audioFx.crossfadeDuration === sec
											? 'bg-pink-500 text-white border-pink-400 shadow-sm shadow-pink-500/30'
											: 'bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:bg-white/10'}"
										onclick={() => setCrossfadeDuration(sec)}
									>
										{sec === 3 ? '3s Quick' : sec === 5 ? '5s Smooth' : sec === 8 ? '8s DJ' : '12s Ambient'}
									</button>
								{/each}
							</div>

							<!-- Slider -->
							<div class="flex items-center gap-2 pt-1">
								<span class="text-[10px] text-muted-foreground font-mono font-bold">3s</span>
								<input
									type="range"
									min="3"
									max="12"
									step="1"
									value={audioFx.crossfadeDuration}
									oninput={(e) => setCrossfadeDuration(Number(e.currentTarget.value))}
									class="w-full accent-pink-500 h-1.5 cursor-pointer bg-muted rounded-lg"
								/>
								<span class="text-[10px] text-muted-foreground font-mono font-bold">12s</span>
							</div>
						</div>
					{/if}
				</div>

				<!-- Section 1: Presets -->
				<div>
					<div class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 block">
						Sound Preset
					</div>
					<div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
						{#each Object.entries(EQ_PRESETS) as [key, val]}
							{@const isSelected = audioFx.eqPreset === key}
							<button
								class="flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer {isSelected
									? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20 font-semibold'
									: 'border-border/60 bg-muted/30 hover:border-foreground/30 text-foreground'}"
								onclick={() => onPresetSelect(key as EqPreset)}
							>
								<span class="text-xs font-semibold truncate w-full">{val.name}</span>
								<span class="text-[10px] opacity-75 truncate w-full mt-0.5">
									{val.bass > 0 ? `+${val.bass}` : val.bass}dB / {val.treble > 0 ? `+${val.treble}` : val.treble}dB
								</span>
							</button>
						{/each}
					</div>
				</div>

				<!-- Section 2: 3-Band Sliders -->
				<div class="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-4">
					<div class="flex items-center justify-between text-xs font-semibold text-foreground">
						<span>Parametric Tuning</span>
						<span class="text-[11px] text-muted-foreground font-mono">
							Bass {audioFx.bass > 0 ? `+${audioFx.bass}` : audioFx.bass}dB • Mid {audioFx.mid > 0 ? `+${audioFx.mid}` : audioFx.mid}dB • Treble {audioFx.treble > 0 ? `+${audioFx.treble}` : audioFx.treble}dB
						</span>
					</div>

					<!-- Bass Slider (80Hz) -->
					<div class="space-y-1">
						<div class="flex justify-between text-xs text-muted-foreground">
							<span>Bass (Sub 80Hz)</span>
							<span class="font-mono text-primary">{audioFx.bass > 0 ? `+${audioFx.bass}` : audioFx.bass} dB</span>
						</div>
						<input
							type="range"
							min="-12"
							max="12"
							step="1"
							bind:value={audioFx.bass}
							oninput={onSliderChange}
							class="range w-full"
							style="--pct:{((audioFx.bass + 12) / 24) * 100}%"
						/>
					</div>

					<!-- Mid Slider (1000Hz) -->
					<div class="space-y-1">
						<div class="flex justify-between text-xs text-muted-foreground">
							<span>Mid / Vocals (1 kHz)</span>
							<span class="font-mono text-primary">{audioFx.mid > 0 ? `+${audioFx.mid}` : audioFx.mid} dB</span>
						</div>
						<input
							type="range"
							min="-12"
							max="12"
							step="1"
							bind:value={audioFx.mid}
							oninput={onSliderChange}
							class="range w-full"
							style="--pct:{((audioFx.mid + 12) / 24) * 100}%"
						/>
					</div>

					<!-- Treble Slider (4000Hz) -->
					<div class="space-y-1">
						<div class="flex justify-between text-xs text-muted-foreground">
							<span>Treble / Highs (4 kHz)</span>
							<span class="font-mono text-primary">{audioFx.treble > 0 ? `+${audioFx.treble}` : audioFx.treble} dB</span>
						</div>
						<input
							type="range"
							min="-12"
							max="12"
							step="1"
							bind:value={audioFx.treble}
							oninput={onSliderChange}
							class="range w-full"
							style="--pct:{((audioFx.treble + 12) / 24) * 100}%"
						/>
					</div>
				</div>

				<!-- Section 3: Streaming Quality -->
				<div>
					<div class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 block">
						Audio Streaming Quality
					</div>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
						{#each qualityOptions as opt}
							{@const isSelected = audioFx.audioQuality === opt.id}
							<button
								class="flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer {isSelected
									? 'border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary'
									: 'border-border/60 bg-muted/20 hover:border-foreground/30 text-foreground'}"
								onclick={() => setAudioQuality(opt.id)}
							>
								<div>
									<div class="text-xs font-bold">{opt.label}</div>
									<div class="text-[10px] text-muted-foreground">{opt.sub}</div>
								</div>
								{#if isSelected}
									<HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} class="text-primary" />
								{/if}
							</button>
						{/each}
					</div>
				</div>

				<!-- Section 4: Quick Action Buttons (Sleep Timer) -->
				<div class="flex items-center justify-between pt-2 border-t border-border/40">
					<button
						onclick={() => (showSleepTimer = true)}
						class="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
					>
						<HugeiconsIcon icon={Moon02Icon} size={16} />
						<span>Open Sleep Timer</span>
					</button>

					<button
						onclick={() => (open = false)}
						class="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:opacity-90 transition-opacity cursor-pointer"
					>
						Done
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<SleepTimerModal bind:open={showSleepTimer} />
