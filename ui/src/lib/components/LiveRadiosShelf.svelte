<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { PlayIcon, Radio02Icon, VolumeHighIcon, Wifi01Icon } from '@hugeicons/core-free-icons';
	import { FMHY_RADIO_STATIONS, convertFmhyToSongItem, type FmhyItem } from '$lib/fmhy';
	import { generateAvatarSvg } from '$lib/thumb';
	import { webPlayer } from '$lib/webplayer';
	import { playback } from '$lib/player.svelte';

	function playRadio(station: FmhyItem) {
		const song = convertFmhyToSongItem(station);
		webPlayer.play(song);
	}
</script>

<section class="space-y-3.5">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
				<span>📻 24/7 Live Internet Radios & Lo-Fi</span>
				<span class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
					<span class="size-1.5 rounded-full bg-red-500 animate-ping"></span>
					LIVE STREAMS
				</span>
			</h2>
			<p class="text-xs text-muted-foreground mt-0.5">
				Commercial-free high-bitrate radio stations & 24/7 Lo-Fi beats from FreeMediaHeckYeah.
			</p>
		</div>
	</div>

	<!-- Radios Grid -->
	<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
		{#each FMHY_RADIO_STATIONS as station (station.id)}
			{@const isPlayingThis = playback.now?.videoId === station.id || playback.now?.title === station.title}
			<div
				class="group relative flex flex-col rounded-xl border border-border/50 bg-card/60 p-3 transition-all duration-200 hover:border-primary/50 hover:bg-card hover:shadow-xl hover:-translate-y-1 cursor-pointer {isPlayingThis ? 'ring-2 ring-primary bg-primary/5' : ''}"
				onclick={() => playRadio(station)}
				role="button"
				tabindex="0"
				aria-label="Play {station.title} Live Radio"
				onkeydown={(e) => e.key === 'Enter' && playRadio(station)}
			>
				<!-- Thumbnail Container -->
				<div class="relative aspect-square w-full rounded-lg overflow-hidden bg-muted/40 shadow-sm">
					<img
						src={station.thumbnail}
						alt={station.title}
						class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
						loading="lazy"
						decoding="async"
						onerror={(e) => {
							const target = e.currentTarget as HTMLImageElement;
							target.src = generateAvatarSvg(station.title, 'radio');
						}}
					/>

					<!-- Live Badge -->
					<div class="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-black/70 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-bold text-red-400 border border-red-500/30">
						<span class="size-1.5 rounded-full bg-red-500 animate-pulse"></span>
						LIVE
					</div>

					<!-- Hover / Playing Overlay Button -->
					<div class="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100 {isPlayingThis ? '!opacity-100' : ''}">
						<div class="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform transform group-hover:scale-105">
							{#if isPlayingThis && !playback.paused}
								<HugeiconsIcon icon={VolumeHighIcon} size={20} class="animate-pulse" />
							{:else}
								<HugeiconsIcon icon={PlayIcon} size={22} fill="currentColor" class="translate-x-0.5" />
							{/if}
						</div>
					</div>
				</div>

				<!-- Details -->
				<div class="mt-2.5 flex-1 min-w-0">
					<h3 class="truncate text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
						{station.title}
					</h3>
					<p class="truncate text-[11px] text-muted-foreground mt-0.5">
						{station.subtitle}
					</p>

					<!-- Tag Badges -->
					<div class="mt-2 flex flex-wrap gap-1 overflow-hidden h-4">
						{#each station.tags.slice(0, 2) as tag}
							<span class="text-[9px] font-medium px-1.5 py-0.2 rounded bg-muted/70 text-muted-foreground">
								{tag}
							</span>
						{/each}
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>
