<script lang="ts">
	import { onMount } from 'svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		CloudIcon,
		PlayIcon,
		ShuffleIcon,
		Refresh03Icon,
		MusicNote01Icon,
		Search01Icon,
		Loading03Icon,
		CheckmarkCircle01Icon,
		Add01Icon,
		CloudUploadIcon
	} from '@hugeicons/core-free-icons';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { gdrive, type GDriveAuthState } from '$lib/gdrive';
	import { getWebStorage, setWebStorage, type SongItem } from '$lib/api';
	import { playback, personal, library, toast } from '$lib/player.svelte';
	import * as api from '$lib/api';
	import { t } from '$lib/i18n.svelte';

	let authState = $state<GDriveAuthState>(gdrive.getState());
	let songs = $state<SongItem[]>([]);
	let loading = $state(false);
	let scanning = $state(false);
	let backingUp = $state(false);
	let searchQuery = $state('');

	onMount(() => {
		const unsub = gdrive.subscribe((s) => {
			authState = s;
		});

		songs = getWebStorage<SongItem[]>('gdrive_songs', []);
		if (songs.length === 0 && authState.connected) {
			scanDrive();
		}

		return () => unsub();
	});

	async function handleConnect() {
		loading = true;
		try {
			await gdrive.login();
			await scanDrive();
		} catch (e: any) {
			toast.error(e?.message || 'Login failed');
		} finally {
			loading = false;
		}
	}

	async function scanDrive() {
		if (!authState.connected || scanning) return;
		scanning = true;
		try {
			const scanned = await gdrive.scanAudioFiles();
			songs = scanned;
			setWebStorage('gdrive_songs', scanned);
			toast.success(`Discovered ${scanned.length} personal songs from Google Drive!`);
		} catch (e: any) {
			toast.error(e?.message || 'Failed to scan Google Drive');
		} finally {
			scanning = false;
		}
	}

	async function handleBackup() {
		if (!authState.connected || backingUp) return;
		backingUp = true;
		try {
			await gdrive.backupLibrary({
				playlists: library.items.filter((i) => i.kind === 'playlist'),
				likedSongs: [],
				history: []
			});
		} catch (e: any) {
			toast.error(e?.message || 'Failed to backup library to Google Drive');
		} finally {
			backingUp = false;
		}
	}

	const filteredSongs = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return songs;
		return songs.filter(
			(s) =>
				s.title.toLowerCase().includes(q) ||
				s.artists.toLowerCase().includes(q) ||
				(s.album && s.album.toLowerCase().includes(q))
		);
	});

	function playSong(song: SongItem) {
		api.play(song);
	}

	function playAll(shuffle = false) {
		if (filteredSongs.length === 0) return;
		const items = shuffle ? [...filteredSongs].sort(() => Math.random() - 0.5) : [...filteredSongs];
		api.playPlaylist(items, 0, undefined, 'Google Drive Cloud', shuffle);
	}

	function addToQueue(song: SongItem) {
		api.addToQueue([song]);
		toast.success(`Added "${song.title}" to queue`);
	}
</script>

<div class="space-y-6">
	<!-- Hero Banner -->
	<div class="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/70 to-primary/10 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
		<div class="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
			<div class="flex items-center gap-5">
				<div class="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-xl shadow-blue-500/25 shrink-0">
					<HugeiconsIcon icon={CloudIcon} class="h-8 w-8 md:h-10 md:w-10" />
				</div>
				<div>
					<div class="flex items-center gap-2">
						<h2 class="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Google Drive Cloud</h2>
						{#if authState.connected}
							<span class="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-500 border border-emerald-500/20">
								<HugeiconsIcon icon={CheckmarkCircle01Icon} class="h-3.5 w-3.5" /> Connected
							</span>
						{/if}
					</div>
					<p class="mt-1 text-xs md:text-sm text-muted-foreground">
						{authState.connected
							? `Connected as ${authState.user?.name || authState.user?.email} • ${songs.length} cloud tracks ready to stream`
							: 'Stream personal MP3, FLAC, M4A, and WAV songs directly from your Google Drive storage with zero ads and lossless quality.'}
					</p>
				</div>
			</div>

			<!-- Action Buttons -->
			<div class="flex flex-wrap items-center gap-2.5">
				{#if !authState.connected}
					<Button
						variant="default"
						size="default"
						onclick={handleConnect}
						disabled={loading}
						class="gap-2 shadow-xl shadow-primary/25 rounded-xl font-medium"
					>
						<HugeiconsIcon icon={CloudIcon} class="h-4 w-4" />
						Connect Drive
					</Button>
				{:else}
					<Button
						variant="default"
						size="sm"
						onclick={() => playAll(false)}
						disabled={songs.length === 0}
						class="gap-2 rounded-xl font-medium shadow-lg shadow-primary/20"
					>
						<HugeiconsIcon icon={PlayIcon} class="h-4 w-4 fill-current" />
						Play All
					</Button>

					<Button
						variant="secondary"
						size="sm"
						onclick={() => playAll(true)}
						disabled={songs.length === 0}
						class="gap-2 rounded-xl font-medium"
					>
						<HugeiconsIcon icon={ShuffleIcon} class="h-4 w-4" />
						Shuffle
					</Button>

					<Button
						variant="outline"
						size="sm"
						onclick={scanDrive}
						disabled={scanning}
						class="gap-2 rounded-xl font-medium"
					>
						{#if scanning}
							<HugeiconsIcon icon={Loading03Icon} class="h-4 w-4 animate-spin" />
							Scanning...
						{:else}
							<HugeiconsIcon icon={Refresh03Icon} class="h-4 w-4" />
							Scan Drive
						{/if}
					</Button>

					<Button
						variant="outline"
						size="sm"
						onclick={handleBackup}
						disabled={backingUp}
						class="gap-2 rounded-xl font-medium hidden sm:inline-flex"
						title="Backup playlists and library to Google Drive"
					>
						{#if backingUp}
							<HugeiconsIcon icon={Loading03Icon} class="h-4 w-4 animate-spin" />
							Backing up...
						{:else}
							<HugeiconsIcon icon={CloudUploadIcon} class="h-4 w-4" />
							Backup Library
						{/if}
					</Button>
				{/if}
			</div>
		</div>
	</div>

	<!-- Content Section -->
	{#if !authState.connected}
		<div class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-12 text-center backdrop-blur-md">
			<div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
				<HugeiconsIcon icon={CloudIcon} class="h-8 w-8" />
			</div>
			<h3 class="text-base font-semibold text-foreground">Google Drive Not Connected</h3>
			<p class="mt-1 max-w-md text-xs text-muted-foreground">
				Connect your Google account to automatically scan and stream your MP3, FLAC, M4A, and WAV songs directly with synced lyrics and rich metadata.
			</p>
			<Button
				variant="default"
				onclick={handleConnect}
				disabled={loading}
				class="mt-5 gap-2 rounded-xl"
			>
				<HugeiconsIcon icon={CloudIcon} class="h-4 w-4" />
				{loading ? 'Connecting...' : 'Connect Google Drive'}
			</Button>
		</div>
	{:else if songs.length === 0}
		<div class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-12 text-center backdrop-blur-md">
			<div class="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10 text-purple-500 mb-4">
				<HugeiconsIcon icon={MusicNote01Icon} class="h-8 w-8" />
			</div>
			<h3 class="text-base font-semibold text-foreground">No Audio Files Discovered</h3>
			<p class="mt-1 max-w-md text-xs text-muted-foreground">
				We couldn't find any audio files in your Google Drive yet. Upload .mp3 or .flac files to your Google Drive and click "Scan Drive".
			</p>
			<Button
				variant="outline"
				onclick={scanDrive}
				disabled={scanning}
				class="mt-5 gap-2 rounded-xl"
			>
				{#if scanning}
					<HugeiconsIcon icon={Loading03Icon} class="h-4 w-4 animate-spin" />
					Scanning Drive...
				{:else}
					<HugeiconsIcon icon={Refresh03Icon} class="h-4 w-4" />
					Scan Drive Now
				{/if}
			</Button>
		</div>
	{:else}
		<!-- Search & Song List -->
		<div class="space-y-4">
			<div class="flex items-center justify-between gap-4">
				<div class="relative flex-1 max-w-sm">
					<HugeiconsIcon
						icon={Search01Icon}
						class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
					/>
					<Input
						type="text"
						placeholder="Search Drive songs or artists..."
						bind:value={searchQuery}
						class="pl-9 h-9 rounded-xl bg-card/60 backdrop-blur-md text-xs"
					/>
				</div>
				<span class="text-xs text-muted-foreground font-medium">
					Showing {filteredSongs.length} of {songs.length} tracks
				</span>
			</div>

			<!-- Songs Table -->
			<div class="overflow-hidden rounded-2xl border border-border/60 bg-card/50 backdrop-blur-md shadow-lg">
				<div class="divide-y divide-border/30">
					{#each filteredSongs as song, idx (song.video_id)}
						<div
							role="button"
							tabindex="0"
							onclick={() => playSong(song)}
							onkeydown={(e) => e.key === 'Enter' && playSong(song)}
							class="group flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/60 cursor-pointer"
						>
							<div class="flex items-center gap-3.5 min-w-0 flex-1">
								<span class="w-5 text-center text-xs font-semibold text-muted-foreground group-hover:hidden">
									{idx + 1}
								</span>
								<div class="hidden w-5 text-center text-primary group-hover:block">
									<HugeiconsIcon icon={PlayIcon} class="h-4 w-4 fill-current mx-auto" />
								</div>

								<img
									src={song.thumbnail}
									alt=""
									class="h-10 w-10 shrink-0 rounded-lg object-cover shadow-sm ring-1 ring-border/50"
								/>

								<div class="min-w-0 flex-1">
									<div class="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
										{song.title}
									</div>
									<div class="truncate text-xs text-muted-foreground">
										{song.artists} • {song.album || 'Google Drive'}
									</div>
								</div>
							</div>

							<div class="flex items-center gap-3 shrink-0 ml-4">
								<span class="text-xs text-muted-foreground font-mono">
									{song.duration}
								</span>
								<Button
									variant="ghost"
									size="icon"
									class="h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
									onclick={(e) => {
										e.stopPropagation();
										addToQueue(song);
									}}
									title="Add to queue"
									aria-label="Add to queue"
								>
									<HugeiconsIcon icon={Add01Icon} class="h-4 w-4" />
								</Button>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>
