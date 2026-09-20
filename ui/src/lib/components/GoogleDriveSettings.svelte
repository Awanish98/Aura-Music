<script lang="ts">
	import { onMount } from 'svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		CloudIcon,
		Refresh03Icon,
		Download04Icon,
		Folder01Icon,
		MusicNote01Icon,
		CheckmarkCircle01Icon,
		Cancel01Icon,
		Loading03Icon,
		Database02Icon,
		LinkSquare01Icon
	} from '@hugeicons/core-free-icons';
	import { Button } from '$lib/components/ui/button';
	import { Switch } from '$lib/components/ui/switch';
	import {
		gdrive,
		type GDriveAuthState,
		type GDriveBackup,
		type GDriveAudioFile
	} from '$lib/gdrive';
	import { personal, playback, prefs, toast } from '$lib/player.svelte';
	import { theme } from '$lib/theme.svelte';
	import { getWebStorage, setWebStorage, type SongItem } from '$lib/api';
	import { t } from '$lib/i18n.svelte';

	let authState = $state<GDriveAuthState>(gdrive.getState());
	let loading = $state(false);
	let backingUp = $state(false);
	let restoringId = $state<string | null>(null);
	let scanning = $state(false);
	let backups = $state<GDriveBackup[]>([]);
	let scannedSongs = $state<SongItem[]>([]);
	let autoSync = $state(true);

	onMount(() => {
		const unsub = gdrive.subscribe((s) => {
			authState = s;
			if (s.connected) {
				loadBackups();
			}
		});

		// Load local scanned songs cache if any
		scannedSongs = getWebStorage<SongItem[]>('gdrive_songs', []);

		return () => unsub();
	});

	async function handleConnect() {
		loading = true;
		try {
			await gdrive.login();
		} catch (e: any) {
			toast.error(e?.message || 'Google Drive login failed');
		} finally {
			loading = false;
		}
	}

	function handleDisconnect() {
		gdrive.logout();
		backups = [];
	}

	async function loadBackups() {
		try {
			backups = await gdrive.listBackups();
		} catch (e) {
			console.warn('[GDrive loadBackups]', e);
		}
	}

	async function handleBackup() {
		if (!authState.connected || backingUp) return;
		backingUp = true;
		try {
			const playlists = getWebStorage<any[]>('playlists', []);
			const likedSongs = getWebStorage<SongItem[]>('liked_songs', []);
			const history = getWebStorage<SongItem[]>('history', []);

			await gdrive.backupLibrary({
				playlists,
				likedSongs,
				history,
				settings: {
					discordRpc: prefs.discordRpc
				},
				theme: {
					id: theme.id
				}
			});

			await loadBackups();
		} catch (e: any) {
			toast.error(e?.message || 'Backup to Google Drive failed');
		} finally {
			backingUp = false;
		}
	}

	async function handleRestore(backup: GDriveBackup) {
		if (!authState.connected || restoringId) return;
		restoringId = backup.id;
		try {
			const data = await gdrive.restoreBackup(backup.id);
			if (data) {
				if (Array.isArray(data.playlists)) {
					setWebStorage('playlists', data.playlists);
				}
				if (Array.isArray(data.likedSongs)) {
					setWebStorage('liked_songs', data.likedSongs);
				}
				if (Array.isArray(data.history)) {
					setWebStorage('history', data.history);
				}
				toast.success(`Library restored from backup (${data.stats?.likedCount ?? 0} liked songs, ${data.stats?.playlistCount ?? 0} playlists)`);
			}
		} catch (e: any) {
			toast.error(e?.message || 'Restore failed');
		} finally {
			restoringId = null;
		}
	}

	async function handleScanAudio() {
		if (!authState.connected || scanning) return;
		scanning = true;
		try {
			const songs = await gdrive.scanAudioFiles();
			scannedSongs = songs;
			setWebStorage('gdrive_songs', songs);
			toast.success(`Found ${songs.length} audio files in Google Drive!`);
		} catch (e: any) {
			toast.error(e?.message || 'Failed to scan audio files');
		} finally {
			scanning = false;
		}
	}

	function formatBytes(bytes?: number): string {
		if (!bytes || bytes === 0) return '0 MB';
		const mb = bytes / (1024 * 1024);
		if (mb < 1024) return `${mb.toFixed(1)} MB`;
		const gb = mb / 1024;
		return `${gb.toFixed(2)} GB`;
	}

	const storagePercent = $derived.by(() => {
		if (!authState.user?.storageLimit || authState.user.storageLimit === 0) return 0;
		return Math.min(100, Math.round(((authState.user.storageUsage || 0) / authState.user.storageLimit) * 100));
	});
</script>

<div class="space-y-6">
	<!-- Top Banner / Connection Card -->
	<div class="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card/90 via-card/50 to-primary/5 p-5 backdrop-blur-xl shadow-xl">
		<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<div class="flex items-center gap-4">
				{#if authState.connected && authState.user?.picture}
					<img
						src={authState.user.picture}
						alt={authState.user.name}
						class="h-12 w-12 rounded-full border-2 border-primary/50 object-cover shadow-md"
					/>
				{:else}
					<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
						<HugeiconsIcon icon={CloudIcon} class="h-6 w-6" />
					</div>
				{/if}

				<div>
					<div class="flex items-center gap-2">
						<h3 class="text-base font-semibold tracking-tight text-foreground">
							{authState.connected ? authState.user?.name : 'Google Drive Cloud Sync'}
						</h3>
						{#if authState.connected}
							<span class="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-500 border border-emerald-500/20">
								<HugeiconsIcon icon={CheckmarkCircle01Icon} class="h-3 w-3" /> Connected
							</span>
						{/if}
					</div>
					<p class="text-xs text-muted-foreground">
						{authState.connected
							? authState.user?.email
							: 'Sync your playlists, favorites, history, and stream personal music files from Google Drive.'}
					</p>
				</div>
			</div>

			<div class="flex items-center gap-2">
				{#if authState.connected}
					<Button
						variant="outline"
						size="sm"
						onclick={handleDisconnect}
						class="text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
					>
						Disconnect
					</Button>
				{:else}
					<Button
						variant="default"
						size="sm"
						onclick={handleConnect}
						disabled={loading}
						class="gap-2 shadow-lg shadow-primary/20"
					>
						{#if loading}
							<HugeiconsIcon icon={Loading03Icon} class="h-4 w-4 animate-spin" />
							Connecting...
						{:else}
							<HugeiconsIcon icon={CloudIcon} class="h-4 w-4" />
							Connect Google Drive
						{/if}
					</Button>
				{/if}
			</div>
		</div>

		<!-- Storage Progress bar (if connected) -->
		{#if authState.connected && authState.user?.storageLimit}
			<div class="mt-5 border-t border-border/40 pt-4">
				<div class="flex items-center justify-between text-xs font-medium text-muted-foreground mb-1.5">
					<span>Drive Storage Used</span>
					<span>{formatBytes(authState.user.storageUsage)} of {formatBytes(authState.user.storageLimit)} ({storagePercent}%)</span>
				</div>
				<div class="h-2 w-full overflow-hidden rounded-full bg-muted/60">
					<div
						class="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 rounded-full"
						style="width: {storagePercent}%"
					></div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Core Actions Grid -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<!-- Backup Library Box -->
		<div class="rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-md">
			<div class="flex items-center gap-3 mb-2">
				<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
					<HugeiconsIcon icon={Folder01Icon} class="h-4 w-4" />
				</div>
				<div>
					<h4 class="text-sm font-semibold text-foreground">Cloud Library Backup</h4>
					<p class="text-[11px] text-muted-foreground">Save playlists, liked songs & settings to Google Drive</p>
				</div>
			</div>

			<div class="mt-4 flex items-center justify-between">
				<span class="text-xs text-muted-foreground">
					{authState.lastSyncTime ? `Last sync: ${authState.lastSyncTime}` : 'No recent backup'}
				</span>
				<Button
					size="sm"
					variant="outline"
					disabled={!authState.connected || backingUp}
					onclick={handleBackup}
					class="gap-1.5 text-xs"
				>
					{#if backingUp}
						<HugeiconsIcon icon={Loading03Icon} class="h-3.5 w-3.5 animate-spin" /> Backing up...
					{:else}
						<HugeiconsIcon icon={Folder01Icon} class="h-3.5 w-3.5" /> Backup Now
					{/if}
				</Button>
			</div>
		</div>

		<!-- Audio Scanner Box -->
		<div class="rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-md">
			<div class="flex items-center gap-3 mb-2">
				<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20">
					<HugeiconsIcon icon={MusicNote01Icon} class="h-4 w-4" />
				</div>
				<div>
					<h4 class="text-sm font-semibold text-foreground">Google Drive Music Streamer</h4>
					<p class="text-[11px] text-muted-foreground">Stream MP3, FLAC, M4A & WAV files from Drive</p>
				</div>
			</div>

			<div class="mt-4 flex items-center justify-between">
				<span class="text-xs text-muted-foreground">
					{scannedSongs.length > 0 ? `${scannedSongs.length} cloud songs ready` : 'Scan to discover music'}
				</span>
				<Button
					size="sm"
					variant="outline"
					disabled={!authState.connected || scanning}
					onclick={handleScanAudio}
					class="gap-1.5 text-xs"
				>
					{#if scanning}
						<HugeiconsIcon icon={Loading03Icon} class="h-3.5 w-3.5 animate-spin" /> Scanning...
					{:else}
						<HugeiconsIcon icon={Refresh03Icon} class="h-3.5 w-3.5" /> Scan My Drive
					{/if}
				</Button>
			</div>
		</div>
	</div>

	<!-- Saved Backups List -->
	{#if authState.connected}
		<div class="rounded-xl border border-border/70 bg-card/40 p-4">
			<div class="flex items-center justify-between mb-3">
				<div class="flex items-center gap-2">
					<HugeiconsIcon icon={Database02Icon} class="h-4 w-4 text-muted-foreground" />
					<h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Cloud Backups on Google Drive ({backups.length})
					</h4>
				</div>
				<button
					onclick={loadBackups}
					class="text-xs text-muted-foreground hover:text-foreground transition-colors p-1"
					title="Refresh backups"
					aria-label="Refresh backups"
				>
					<HugeiconsIcon icon={Refresh03Icon} class="h-3.5 w-3.5" />
				</button>
			</div>

			{#if backups.length === 0}
				<div class="py-6 text-center text-xs text-muted-foreground">
					No backups found in Google Drive yet. Click "Backup Now" to create your first cloud backup.
				</div>
			{:else}
				<div class="divide-y divide-border/40 overflow-hidden rounded-lg border border-border/40">
					{#each backups as b (b.id)}
						<div class="flex items-center justify-between p-3 transition-colors hover:bg-muted/40">
							<div class="min-w-0 flex-1">
								<div class="truncate text-xs font-medium text-foreground">{b.name}</div>
								<div class="text-[11px] text-muted-foreground">
									{new Date(b.createdTime).toLocaleString()} • {formatBytes(b.size)}
								</div>
							</div>
							<Button
								size="sm"
								variant="ghost"
								disabled={restoringId === b.id}
								onclick={() => handleRestore(b)}
								class="gap-1.5 text-xs text-primary hover:bg-primary/10"
							>
								{#if restoringId === b.id}
									<HugeiconsIcon icon={Loading03Icon} class="h-3.5 w-3.5 animate-spin" /> Restoring...
								{:else}
									<HugeiconsIcon icon={Download04Icon} class="h-3.5 w-3.5" /> Restore
								{/if}
							</Button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
