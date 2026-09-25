<script lang="ts">
	// High-Resolution Trending YouTube Music Videos & New Releases Shelf with Direct 1-Tap Playback
	import { goto } from '$app/navigation';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		PlayIcon,
		Maximize01Icon,
		Video01Icon,
		SparklesIcon,
		VolumeHighIcon,
		ArrowRight01Icon
	} from '@hugeicons/core-free-icons';
	import * as api from '$lib/api';
	import { webPlayer } from '$lib/webplayer';
	import { playback, toast, ui } from '$lib/player.svelte';
	import { video } from '$lib/video.svelte';

	const trendingVideos = [
		{
			id: 'LK7-_x-4T20',
			videoId: 'LK7-_x-4T20',
			title: 'Tauba Tauba (Official 4K)',
			artists: 'Karan Aujla, Vicky Kaushal',
			tag: '🔥 Trending #1',
			quality: '4K UHD',
			duration: '3:28',
			views: '195M views',
			thumbnail: 'https://i.ytimg.com/vi/LK7-_x-4T20/hqdefault.jpg',
			query: 'Tauba Tauba Bad Newz Karan Aujla Vicky Kaushal Official Music Video'
		},
		{
			id: 'hOHKltAiKXQ',
			videoId: 'hOHKltAiKXQ',
			title: 'Big Dawgs (Official Video)',
			artists: 'Hanumankind, Kalmi',
			tag: '💎 Global Phenomenon',
			quality: '4K 60FPS',
			duration: '3:54',
			views: '150M views',
			thumbnail: 'https://i.ytimg.com/vi/hOHKltAiKXQ/hqdefault.jpg',
			query: 'Hanumankind Big Dawgs Kalmi Official Music Video'
		},
		{
			id: 'VAdGW7QDJUI',
			videoId: 'VAdGW7QDJUI',
			title: 'Chaleya (Jawan)',
			artists: 'Arijit Singh, Shilpa Rao, SRK',
			tag: '✨ Bollywood Gold',
			quality: '1080p HD',
			duration: '3:20',
			views: '235M views',
			thumbnail: 'https://i.ytimg.com/vi/VAdGW7QDJUI/hqdefault.jpg',
			query: 'Chaleya Jawan Arijit Singh Shah Rukh Khan Official Video'
		},
		{
			id: 'XO8wew38VM8',
			videoId: 'XO8wew38VM8',
			title: 'Millionaire (Glory)',
			artists: 'Yo Yo Honey Singh',
			tag: '🚀 New Release',
			quality: '4K UHD',
			duration: '3:18',
			views: '110M views',
			thumbnail: 'https://i.ytimg.com/vi/XO8wew38VM8/hqdefault.jpg',
			query: 'Yo Yo Honey Singh Millionaire Glory Official Music Video'
		},
		{
			id: 'tOM-nWPcR4U',
			videoId: 'tOM-nWPcR4U',
			title: 'Illuminati (Aavesham)',
			artists: 'Sushin Shyam, Dabzee',
			tag: '⚡ Viral Banger',
			quality: '1080p HD',
			duration: '3:12',
			views: '175M views',
			thumbnail: 'https://i.ytimg.com/vi/tOM-nWPcR4U/hqdefault.jpg',
			query: 'Illuminati Aavesham Sushin Shyam Dabzee Official Video'
		},
		{
			id: 'eVli-tstM5E',
			videoId: 'eVli-tstM5E',
			title: 'Espresso (Official Video)',
			artists: 'Sabrina Carpenter',
			tag: '👑 Global #1',
			quality: '4K UHD',
			duration: '2:55',
			views: '320M views',
			thumbnail: 'https://i.ytimg.com/vi/eVli-tstM5E/hqdefault.jpg',
			query: 'Sabrina Carpenter Espresso Official Music Video'
		}
	];

	async function playVideoDirect(item: typeof trendingVideos[0], expanded = false) {
		toast(`🎬 Playing HD Music Video: ${item.title}`);
		const track = {
			video_id: item.videoId,
			title: item.title,
			artists: item.artists,
			thumbnail: item.thumbnail,
			duration: item.duration,
			is_video: true
		};
		video.want = true;
		ui.videoOpen = true;
		ui.videoMode = expanded ? 'expanded' : 'docked';
		webPlayer.play(track as any);
		toast.success(`Playing YouTube Video: ${item.title}!`);
	}
</script>

<section class="space-y-3.5">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
				<span class="text-red-500">🎬</span>
				<span>Trending YouTube Music Videos & New Releases</span>
				<span class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
					<span class="size-1.5 rounded-full bg-red-500 animate-pulse"></span>
					DIRECT VIDEO PLAY
				</span>
			</h2>
			<p class="text-xs text-muted-foreground mt-0.5">
				Watch official HD & 4K music videos right inside Aura Music with synchronized lossless audio.
			</p>
		</div>
		<button
			onclick={() => goto('/discover')}
			class="text-xs font-semibold text-muted-foreground hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
		>
			<span>Explore More</span>
			<HugeiconsIcon icon={ArrowRight01Icon} size={14} />
		</button>
	</div>

	<!-- 16:9 Cinematic Video Grid -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each trendingVideos as item (item.id)}
			{@const isPlayingThis = playback.now?.title?.toLowerCase().includes(item.title.toLowerCase().split(' ')[0])}
			<div
				class="group relative flex flex-col rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-card/60 p-3 transition-all duration-300 hover:border-red-400 dark:hover:border-red-500/50 hover:bg-white dark:hover:bg-card shadow-sm hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-red-500/10 hover:-translate-y-1 {isPlayingThis ? 'ring-2 ring-red-500 bg-red-500/5' : ''}"
			>
				<!-- 16:9 Video Thumbnail Banner -->
				<div
					onclick={() => playVideoDirect(item, false)}
					role="button"
					tabindex="0"
					onkeydown={(e) => e.key === 'Enter' && playVideoDirect(item, false)}
					class="relative aspect-video w-full rounded-xl overflow-hidden bg-black/60 shadow-md cursor-pointer"
				>
					<img
						src={item.thumbnail}
						alt={item.title}
						class="size-full object-cover transition-transform duration-500 group-hover:scale-105"
						loading="lazy"
					/>
					<div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>

					<!-- Quality & Tag Badges -->
					<div class="absolute top-2.5 left-2.5 flex items-center gap-1.5">
						<span class="rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-black text-white shadow-sm flex items-center gap-1">
							<span>▶</span> YouTube
						</span>
						<span class="rounded-md bg-black/70 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-500/30">
							{item.quality}
						</span>
					</div>

					<div class="absolute top-2.5 right-2.5">
						<span class="rounded-md bg-black/75 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-mono text-white/90">
							{item.duration}
						</span>
					</div>

					<!-- Big Glowing Center Play Overlay -->
					<div class="absolute inset-0 flex items-center justify-center opacity-85 group-hover:opacity-100 transition-opacity">
						<div class="flex size-12 items-center justify-center rounded-full bg-gradient-to-tr from-red-600 via-rose-600 to-pink-500 text-white shadow-xl shadow-red-500/40 transition-transform group-hover:scale-110">
							{#if isPlayingThis && !playback.paused}
								<HugeiconsIcon icon={VolumeHighIcon} size={22} class="animate-pulse" />
							{:else}
								<HugeiconsIcon icon={PlayIcon} size={22} fill="currentColor" class="ml-0.5" />
							{/if}
						</div>
					</div>

					<!-- Bottom Tag and Views -->
					<div class="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px]">
						<span class="font-bold text-red-300 drop-shadow">
							{item.tag}
						</span>
						<span class="text-white/80 font-mono text-[10px] drop-shadow">
							{item.views}
						</span>
					</div>
				</div>

				<!-- Details & Direct Actions Footer -->
				<div class="mt-3 flex items-center justify-between gap-2">
					<div class="min-w-0 flex-1">
						<h3 class="truncate text-sm font-bold text-slate-900 dark:text-foreground group-hover:text-red-500 transition-colors">
							{item.title}
						</h3>
						<p class="truncate text-xs text-slate-500 dark:text-muted-foreground mt-0.5">
							{item.artists}
						</p>
					</div>

					<!-- Direct 1-Tap Action Buttons -->
					<div class="flex items-center gap-1.5 shrink-0">
						<button
							onclick={() => playVideoDirect(item, true)}
							class="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100/90 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-white border border-slate-200/60 dark:border-transparent transition-colors cursor-pointer"
							title="Theater Expanded 4K"
							aria-label="Theater Expanded 4K"
						>
							<HugeiconsIcon icon={Maximize01Icon} size={15} />
						</button>
						<button
							onclick={() => playVideoDirect(item, false)}
							class="flex items-center gap-1 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 px-3 py-1.5 text-xs font-black text-white shadow-md shadow-red-500/30 transition-all cursor-pointer hover:scale-105"
						>
							<span>▶ Play Video</span>
						</button>
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>
