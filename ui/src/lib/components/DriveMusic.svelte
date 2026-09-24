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
		CloudUploadIcon,
		Settings02Icon,
		InformationCircleIcon
	} from '@hugeicons/core-free-icons';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { gdrive, GDRIVE_CONFIG, type GDriveAuthState } from '$lib/gdrive';
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
	let showConfig = $state(false);
	let clientIdInput = $state(GDRIVE_CONFIG.clientId);

	onMount(() => {
		const unsub = gdrive.subscribe((s) => {
			authState = s;
		});

		clientIdInput = GDRIVE_CONFIG.clientId;
		songs = getWebStorage<SongItem[]>('gdrive_songs', []);
		if (songs.length === 0 && authState.connected) {
			scanDrive();
		}

		return () => unsub();
	});

	function saveClientId() {
		const trimmed = clientIdInput.trim();
		if (!trimmed) {
			toast.error('Client ID cannot be empty');
			return;
		}
		GDRIVE_CONFIG.clientId = trimmed;
		toast.success('Google OAuth Client ID saved!');
	}

	function resetClientId() {
		localStorage.removeItem('gdrive_client_id');
		clientIdInput = GDRIVE_CONFIG.clientId;
		toast.success('Reset to default Client ID');
	}

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
						{#if loading}
							<HugeiconsIcon icon={Loading03Icon} class="h-4 w-4 animate-spin" />
							Connecting...
						{:else}
							<HugeiconsIcon icon={CloudIcon} class="h-4 w-4" />
							Connect Drive
						{/if}
					</Button>

					<Button
						variant="outline"
						size="default"
						onclick={() => (showConfig = !showConfig)}
						class="gap-2 rounded-xl text-xs font-medium border-border/70"
						title="Configure custom Google OAuth Client ID"
					>
						<HugeiconsIcon icon={Settings02Icon} class="h-4 w-4" />
						{showConfig ? 'Hide Config' : 'OAuth Config'}
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

	<!-- Google OAuth Credentials & Configuration Box -->
	{#if showConfig || !authState.connected}
		<div class="rounded-2xl border border-border/80 bg-card/60 p-5 backdrop-blur-md space-y-3">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2.5">
					<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
						<HugeiconsIcon icon={Settings02Icon} class="h-4 w-4" />
					</div>
					<div>
						<h4 class="text-sm font-semibold text-foreground flex items-center gap-2">
							<span>Google OAuth 2.0 Client ID</span>
							<span class="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono">Customizable</span>
						</h4>
						<p class="text-[11px] text-muted-foreground">If you see <code class="font-mono text-amber-500">Error 401: deleted_client</code>, paste your new Client ID here</p>
					</div>
				</div>
			</div>

			<div class="border-t border-border/40 pt-3 space-y-3">
				<div class="flex flex-col sm:flex-row gap-2">
					<Input
						bind:value={clientIdInput}
						placeholder="e.g. 123456789-xxxx.apps.googleusercontent.com"
						class="font-mono text-xs flex-1"
					/>
					<div class="flex gap-2">
						<Button size="sm" onclick={saveClientId} class="text-xs">Save ID</Button>
						<Button size="sm" variant="outline" onclick={resetClientId} class="text-xs">Reset</Button>
					</div>
				</div>
				<div class="rounded-lg bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground space-y-1.5 border border-border/40">
					<div class="font-semibold text-foreground flex items-center gap-1.5">
						<HugeiconsIcon icon={InformationCircleIcon} class="h-3.5 w-3.5 text-primary" />
						<span>Setup Instructions:</span>
					</div>
					<p>1. Open your downloaded <code class="font-mono text-foreground">client_secret.json</code> and copy the <code class="font-mono text-primary">client_id</code>.</p>
					<p>2. In Google Cloud Console → <strong>Credentials → Authorized JavaScript Origins</strong>, ensure both <code class="font-mono text-foreground">https://aura-music-1no9.onrender.com</code> and <code class="font-mono text-foreground">http://localhost:5183</code> are added.</p>
					<p>3. Paste the Client ID above, click <strong>Save ID</strong>, then click <strong>Connect Drive</strong>.</p>
				</div>
			</div>
		</div>
	{/if}

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
									class="h-8 w-8 text-muted-foreground hover:text-foreground opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
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
