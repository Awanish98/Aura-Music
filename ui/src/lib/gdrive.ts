// Google Drive Cloud Sync & Music Streamer Engine for Echo Music
import type { SongItem } from './api';
import { toast } from './player.svelte';

export const GDRIVE_CONFIG = {
	get clientId() {
		return (
			(typeof window !== 'undefined' && localStorage.getItem('gdrive_client_id')) ||
			(import.meta.env?.VITE_GDRIVE_CLIENT_ID ?? '')
		);
	},
	set clientId(val: string) {
		if (typeof window !== 'undefined') {
			localStorage.setItem('gdrive_client_id', val);
		}
	},
	scopes: [
		'https://www.googleapis.com/auth/drive.file',
		'https://www.googleapis.com/auth/drive.readonly',
		'https://www.googleapis.com/auth/userinfo.profile',
		'https://www.googleapis.com/auth/userinfo.email'
	]
};

export interface GDriveUser {
	id: string;
	name: string;
	email: string;
	picture?: string;
	storageLimit?: number;
	storageUsage?: number;
}

export interface GDriveBackup {
	id: string;
	name: string;
	createdTime: string;
	size?: number;
	songCount?: number;
	playlistCount?: number;
}

export interface GDriveAudioFile {
	id: string;
	name: string;
	mimeType: string;
	size?: number;
	createdTime?: string;
	duration?: string;
	artist?: string;
	album?: string;
	thumbnail?: string;
	streamUrl?: string;
}

export interface GDriveAuthState {
	accessToken: string | null;
	tokenType: string | null;
	expiresAt: number;
	user: GDriveUser | null;
	connected: boolean;
	lastSyncTime: string | null;
}

const STORAGE_KEY = 'echo_gdrive_auth';

class GoogleDriveManager {
	private state: GDriveAuthState = {
		accessToken: null,
		tokenType: null,
		expiresAt: 0,
		user: null,
		connected: false,
		lastSyncTime: null
	};

	private listeners = new Set<(s: GDriveAuthState) => void>();

	constructor() {
		this.loadFromStorage();
	}

	public subscribe(fn: (s: GDriveAuthState) => void) {
		this.listeners.add(fn);
		fn(this.getState());
		return () => this.listeners.delete(fn);
	}

	public getState(): GDriveAuthState {
		return { ...this.state };
	}

	private notify() {
		const s = this.getState();
		this.saveToStorage();
		for (const fn of this.listeners) {
			try {
				fn(s);
			} catch (e) {
				console.error('[GDrive listener error]', e);
			}
		}
	}

	private loadFromStorage() {
		if (typeof window === 'undefined') return;
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const data = JSON.parse(raw);
				this.state = {
					...this.state,
					...data,
					connected: !!data.accessToken && Date.now() < (data.expiresAt || 0)
				};
				if (this.state.connected && this.state.accessToken) {
					// Refresh user quota in background
					this.fetchAccountInfo().catch(() => {});
				}
			}
		} catch (e) {
			console.warn('[GDrive load error]', e);
		}
	}

	private saveToStorage() {
		if (typeof window === 'undefined') return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
		} catch (e) {
			console.warn('[GDrive save error]', e);
		}
	}

	public isConnected(): boolean {
		return this.state.connected && !!this.state.accessToken && Date.now() < this.state.expiresAt;
	}

	public getAccessToken(): string | null {
		if (!this.isConnected()) return null;
		return this.state.accessToken;
	}

	/**
	 * Initiate Google OAuth 2.0 Auth flow
	 */
	public login(): Promise<GDriveAuthState> {
		return new Promise((resolve, reject) => {
			const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/oauth/callback` : 'http://localhost:5183/oauth/callback';
			
			const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
			authUrl.searchParams.set('client_id', GDRIVE_CONFIG.clientId);
			authUrl.searchParams.set('redirect_uri', typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5183');
			authUrl.searchParams.set('response_type', 'token');
			authUrl.searchParams.set('scope', GDRIVE_CONFIG.scopes.join(' '));
			authUrl.searchParams.set('include_granted_scopes', 'true');
			authUrl.searchParams.set('prompt', 'consent select_account');
			authUrl.searchParams.set('state', 'echo_gdrive_auth');

			const width = 600;
			const height = 700;
			const left = Math.max(0, (window.innerWidth - width) / 2 + window.screenX);
			const top = Math.max(0, (window.innerHeight - height) / 2 + window.screenY);

			const popup = window.open(
				authUrl.toString(),
				'Google Drive Authorization',
				`width=${width},height=${height},top=${top},left=${left},status=no,menubar=no,toolbar=no`
			);

			if (!popup) {
				const err = 'Popup blocked. Please allow popups for Echo Music.';
				toast.error(err);
				reject(new Error(err));
				return;
			}

			// Polling popup URL hash for access_token
			const interval = setInterval(async () => {
				try {
					if (!popup || popup.closed) {
						clearInterval(interval);
						if (!this.state.connected) {
							reject(new Error('Sign-in window was closed before completing.'));
						}
						return;
					}

					let popupHref = '';
					try {
						popupHref = popup.location.href;
					} catch {
						// Cross-origin restriction until redirect back to origin
						return;
					}

					if (popupHref.includes('access_token=')) {
						clearInterval(interval);
						const hash = popup.location.hash.substring(1);
						const params = new URLSearchParams(hash);
						const token = params.get('access_token');
						const tokenType = params.get('token_type') || 'Bearer';
						const expiresIn = parseInt(params.get('expires_in') || '3600', 10);

						popup.close();

						if (token) {
							this.state.accessToken = token;
							this.state.tokenType = tokenType;
							this.state.expiresAt = Date.now() + expiresIn * 1000;
							this.state.connected = true;

							await this.fetchAccountInfo();
							this.notify();
							toast.success(`Google Drive connected: ${this.state.user?.email || 'Authenticated'}`);
							resolve(this.getState());
						} else {
							reject(new Error('No access token returned from Google.'));
						}
					} else if (popupHref.includes('error=')) {
						clearInterval(interval);
						popup.close();
						const hash = popup.location.search || popup.location.hash;
						const params = new URLSearchParams(hash.replace(/^[#?]/, ''));
						const err = params.get('error') || 'Google authentication error';
						reject(new Error(err));
					}
				} catch (err) {
					// Ignore cross-origin security errors while redirecting
				}
			}, 500);
		});
	}

	/**
	 * Disconnect and clear Google Drive tokens
	 */
	public logout() {
		this.state = {
			accessToken: null,
			tokenType: null,
			expiresAt: 0,
			user: null,
			connected: false,
			lastSyncTime: null
		};
		this.notify();
		toast.success('Google Drive disconnected.');
	}

	/**
	 * Fetch User Profile and Drive Quota
	 */
	public async fetchAccountInfo(): Promise<GDriveUser | null> {
		const token = this.state.accessToken;
		if (!token) return null;

		try {
			// User info
			const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!userRes.ok) throw new Error('Failed to fetch user info');
			const userData = await userRes.json();

			// Storage quota
			let limit = 0;
			let usage = 0;
			try {
				const aboutRes = await fetch('https://www.googleapis.com/drive/v3/about?fields=storageQuota', {
					headers: { Authorization: `Bearer ${token}` }
				});
				if (aboutRes.ok) {
					const aboutData = await aboutRes.json();
					limit = parseInt(aboutData.storageQuota?.limit || '0', 10);
					usage = parseInt(aboutData.storageQuota?.usage || '0', 10);
				}
			} catch {}

			const user: GDriveUser = {
				id: userData.id,
				name: userData.name || 'Google User',
				email: userData.email || '',
				picture: userData.picture,
				storageLimit: limit,
				storageUsage: usage
			};

			this.state.user = user;
			this.notify();
			return user;
		} catch (e) {
			console.warn('[GDrive fetchAccountInfo error]', e);
			return null;
		}
	}

	/**
	 * Helper to create or find a folder in Google Drive
	 */
	public async getOrCreateFolder(folderName: string, parentId?: string): Promise<string> {
		const token = this.state.accessToken;
		if (!token) throw new Error('Not connected to Google Drive');

		let query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
		if (parentId) {
			query += ` and '${parentId}' in parents`;
		}

		const listRes = await fetch(
			`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
			{ headers: { Authorization: `Bearer ${token}` } }
		);

		if (listRes.ok) {
			const listData = await listRes.json();
			if (listData.files && listData.files.length > 0) {
				return listData.files[0].id;
			}
		}

		// Create folder
		const meta: any = {
			name: folderName,
			mimeType: 'application/vnd.google-apps.folder'
		};
		if (parentId) meta.parents = [parentId];

		const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(meta)
		});

		if (!createRes.ok) throw new Error(`Failed to create Google Drive folder: ${folderName}`);
		const createData = await createRes.json();
		return createData.id;
	}

	/**
	 * Backup complete Echo Music library to Google Drive
	 */
	public async backupLibrary(data: {
		playlists: any[];
		likedSongs: SongItem[];
		history: SongItem[];
		settings?: any;
		theme?: any;
	}): Promise<{ fileId: string; fileName: string }> {
		const token = this.state.accessToken;
		if (!token) throw new Error('Not connected to Google Drive');

		const appFolderId = await this.getOrCreateFolder('Echo Music');
		const backupFolderId = await this.getOrCreateFolder('Backups', appFolderId);

		const now = new Date();
		const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
		const fileName = `echo_backup_${dateStr}.json`;

		const payload = {
			appName: 'Echo Music',
			version: '1.0.0',
			createdAt: now.toISOString(),
			playlists: data.playlists || [],
			likedSongs: data.likedSongs || [],
			history: data.history || [],
			settings: data.settings || {},
			theme: data.theme || {},
			stats: {
				playlistCount: (data.playlists || []).length,
				likedCount: (data.likedSongs || []).length,
				historyCount: (data.history || []).length
			}
		};

		const boundary = '-------314159265358979323846';
		const delimiter = `\r\n--${boundary}\r\n`;
		const closeDelimiter = `\r\n--${boundary}--`;

		const metadata = {
			name: fileName,
			parents: [backupFolderId],
			mimeType: 'application/json',
			description: `Echo Music Cloud Backup (${payload.stats.likedCount} liked songs, ${payload.stats.playlistCount} playlists)`
		};

		const multipartBody =
			delimiter +
			'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
			JSON.stringify(metadata) +
			delimiter +
			'Content-Type: application/json\r\n\r\n' +
			JSON.stringify(payload, null, 2) +
			closeDelimiter;

		const uploadRes = await fetch(
			'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': `multipart/related; boundary=${boundary}`
				},
				body: multipartBody
			}
		);

		if (!uploadRes.ok) {
			const errText = await uploadRes.text();
			throw new Error(`Upload failed: ${errText}`);
		}

		const resData = await uploadRes.json();
		this.state.lastSyncTime = new Date().toLocaleString();
		this.notify();

		toast.success(`Library backed up to Google Drive (${payload.stats.playlistCount} playlists, ${payload.stats.likedCount} songs)`);
		return { fileId: resData.id, fileName };
	}

	/**
	 * List all saved library backups on Google Drive
	 */
	public async listBackups(): Promise<GDriveBackup[]> {
		const token = this.state.accessToken;
		if (!token) return [];

		try {
			const appFolderId = await this.getOrCreateFolder('Echo Music');
			const backupFolderId = await this.getOrCreateFolder('Backups', appFolderId);

			const query = `'${backupFolderId}' in parents and name contains 'echo_backup_' and trashed=false`;
			const res = await fetch(
				`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&orderBy=createdTime desc&fields=files(id,name,createdTime,size,description)`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);

			if (!res.ok) return [];
			const data = await res.json();

			return (data.files || []).map((f: any) => ({
				id: f.id,
				name: f.name,
				createdTime: f.createdTime,
				size: parseInt(f.size || '0', 10)
			}));
		} catch (e) {
			console.warn('[GDrive listBackups error]', e);
			return [];
		}
	}

	/**
	 * Download and parse a backup file from Google Drive
	 */
	public async restoreBackup(fileId: string): Promise<any> {
		const token = this.state.accessToken;
		if (!token) throw new Error('Not connected to Google Drive');

		const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
			headers: { Authorization: `Bearer ${token}` }
		});

		if (!res.ok) throw new Error('Failed to download backup file');
		const backup = await res.json();
		return backup;
	}

	/**
	 * Scan Google Drive for all personal audio files
	 */
	public async scanAudioFiles(): Promise<SongItem[]> {
		const token = this.state.accessToken;
		if (!token) return [];

		try {
			const query =
				"mimeType contains 'audio/' or fileExtension = 'mp3' or fileExtension = 'flac' or fileExtension = 'm4a' or fileExtension = 'wav' or fileExtension = 'ogg' or fileExtension = 'aac' or fileExtension = 'opus' and trashed=false";

			const res = await fetch(
				`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&orderBy=name&pageSize=100&fields=files(id,name,mimeType,size,createdTime,thumbnailLink,webContentLink)`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);

			if (!res.ok) return [];
			const data = await res.json();

			const items: SongItem[] = (data.files || []).map((f: any) => {
				// Parse clean name & artist if named "Artist - Title.mp3"
				let title = f.name.replace(/\.[^/.]+$/, '');
				let artist = 'Google Drive Audio';

				if (title.includes(' - ')) {
					const parts = title.split(' - ');
					artist = parts[0].trim();
					title = parts.slice(1).join(' - ').trim();
				}

				return {
					video_id: `gdrive:${f.id}`,
					title,
					artists: artist,
					artist_runs: [{ text: artist }],
					album: 'Google Drive Music',
					duration: '3:30',
					thumbnail:
						f.thumbnailLink ||
						'https://ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_audio_x128.png',
					is_video: false,
					is_upload: true,
					explicit: false
				};
			});

			return items;
		} catch (e) {
			console.warn('[GDrive scanAudioFiles error]', e);
			return [];
		}
	}

	/**
	 * Export Playlist as M3U or JSON to Google Drive
	 */
	public async exportPlaylist(playlist: { title: string; items: SongItem[] }, format: 'm3u' | 'json' = 'm3u') {
		const token = this.state.accessToken;
		if (!token) throw new Error('Not connected to Google Drive');

		const appFolderId = await this.getOrCreateFolder('Echo Music');
		const plFolderId = await this.getOrCreateFolder('Playlists', appFolderId);

		const cleanName = playlist.title.replace(/[^a-zA-Z0-9_-]/g, '_');
		const fileName = `${cleanName}.${format}`;

		let content = '';
		let mimeType = 'text/plain';

		if (format === 'm3u') {
			content = '#EXTM3U\n';
			for (const item of playlist.items) {
				content += `#EXTINF:-1,${item.artists} - ${item.title}\n`;
				content += `https://music.youtube.com/watch?v=${item.video_id}\n`;
			}
		} else {
			mimeType = 'application/json';
			content = JSON.stringify(playlist, null, 2);
		}

		const boundary = '-------314159265358979323846';
		const delimiter = `\r\n--${boundary}\r\n`;
		const closeDelimiter = `\r\n--${boundary}--`;

		const metadata = {
			name: fileName,
			parents: [plFolderId],
			mimeType
		};

		const multipartBody =
			delimiter +
			'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
			JSON.stringify(metadata) +
			delimiter +
			`Content-Type: ${mimeType}\r\n\r\n` +
			content +
			closeDelimiter;

		const uploadRes = await fetch(
			'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': `multipart/related; boundary=${boundary}`
				},
				body: multipartBody
			}
		);

		if (!uploadRes.ok) throw new Error('Failed to export playlist to Google Drive');
		toast.success(`Exported "${playlist.title}" to Google Drive`);
	}

	/**
	 * Save Synced Lyrics (.lrc) to Google Drive
	 */
	public async saveLyrics(title: string, artist: string, lrcText: string) {
		const token = this.state.accessToken;
		if (!token) throw new Error('Not connected to Google Drive');

		const appFolderId = await this.getOrCreateFolder('Echo Music');
		const lyricsFolderId = await this.getOrCreateFolder('Lyrics', appFolderId);

		const fileName = `${artist} - ${title}.lrc`.replace(/[^a-zA-Z0-9_. -]/g, '_');

		const boundary = '-------314159265358979323846';
		const delimiter = `\r\n--${boundary}\r\n`;
		const closeDelimiter = `\r\n--${boundary}--`;

		const metadata = {
			name: fileName,
			parents: [lyricsFolderId],
			mimeType: 'text/plain'
		};

		const multipartBody =
			delimiter +
			'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
			JSON.stringify(metadata) +
			delimiter +
			'Content-Type: text/plain; charset=UTF-8\r\n\r\n' +
			lrcText +
			closeDelimiter;

		const uploadRes = await fetch(
			'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': `multipart/related; boundary=${boundary}`
				},
				body: multipartBody
			}
		);

		if (!uploadRes.ok) throw new Error('Failed to save lyrics to Google Drive');
		toast.success(`Saved lyrics for "${title}" to Google Drive`);
	}
}

export const gdrive = new GoogleDriveManager();
