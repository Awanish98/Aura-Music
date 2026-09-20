// The UI's only door to Rust. context/11 UI contract — commands in, events out. The UI never
// touches YouTube; everything here is a Tauri command or event payload.
import { invoke as tauriInvoke, isTauri, convertFileSrc as tauriConvertFileSrc } from '@tauri-apps/api/core';
import { listen as tauriListen, type UnlistenFn } from '@tauri-apps/api/event';
import { t } from './i18n.svelte';

export { isTauri };

export const convertFileSrc = (filePath: string, protocol = 'asset') => {
	if (isTauri()) {
		try {
			return tauriConvertFileSrc(filePath, protocol);
		} catch {
			return filePath;
		}
	}
	return filePath;
};

const defaultSettings: Record<string, string> = {
	theme: 'default',
	custom_colors: 'false',
	primary_color: '#ff5d8f',
	background_color: '#1a1418',
	theme_corners: 'rounded',
	app_font: '',
	artwork_accent: 'true',
	tabbed_player: 'true',
	stream_quality: 'high',
	audio_normalization: 'true',
	volume_step: '5',
	synced_lyrics: 'true',
	word_by_word_lyrics: 'true',
	lyrics_provider: 'boidu',
	music_videos: 'true',
	discord_rpc: 'false',
	lastfm_primary_artist: 'false',
	lastfm_primary_strict: 'false',
	blocked_artists: '[]',
	autostart: 'false',
	close_to_tray: 'true',
	native_chrome: 'off',
	update_banner: 'true',
	proxy: '',
	disabled_stream_clients: '[]',
	stream_clients: '[]',
	visitor_data: ''
};

export function getWebStorage<T>(key: string, defaultValue: T): T {
	if (typeof window === 'undefined') return defaultValue;
	try {
		const val = localStorage.getItem(`echo_${key}`);
		return val ? JSON.parse(val) : defaultValue;
	} catch {
		return defaultValue;
	}
}

export function setWebStorage<T>(key: string, value: T): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(`echo_${key}`, JSON.stringify(value));
	} catch {}
}

interface WebPlaylist {
	id: string;
	title: string;
	subtitle?: string;
	description?: string;
	thumbnail?: string;
	trackCount: number;
	items: SongItem[];
	owned: boolean;
	collaborative: boolean;
}

const mockHome: HomePage = {
	chips: [
		{ title: 'Relax', params: '' },
		{ title: 'Workout', params: '' },
		{ title: 'Focus', params: '' },
		{ title: 'Energize', params: '' },
		{ title: 'Commute', params: '' }
	],
	sections: [
		{
			title: 'Welcome to Echo Music',
			items: [
				{
					kind: 'song',
					id: 'demo1',
					title: 'Starboy',
					subtitle: 'The Weeknd • Starboy',
					thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop'
				},
				{
					kind: 'song',
					id: 'demo2',
					title: 'Blinding Lights',
					subtitle: 'The Weeknd • After Hours',
					thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'
				},
				{
					kind: 'playlist',
					id: 'demo3',
					title: 'Today’s Hits',
					subtitle: 'Echo Music • 50 songs',
					thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'
				},
				{
					kind: 'album',
					id: 'demo4',
					title: 'After Hours',
					subtitle: 'The Weeknd • 2020',
					thumbnail: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=300&h=300&fit=crop'
				}
			]
		},
		{
			title: 'Quick Picks',
			items: [
				{
					kind: 'song',
					id: 'demo5',
					title: 'Save Your Tears',
					subtitle: 'The Weeknd',
					thumbnail: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop'
				},
				{
					kind: 'song',
					id: 'demo6',
					title: 'Die For You',
					subtitle: 'The Weeknd',
					thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop'
				}
			]
		}
	]
};

import * as ytmusic from './ytmusic';
import { webPlayer } from './webplayer';
import { playback } from './player.svelte';

export async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
	if (isTauri()) {
		try {
			return await tauriInvoke<T>(cmd, args);
		} catch (e) {
			console.warn(`[Tauri invoke error] ${cmd}:`, e);
			throw e;
		}
	}
	// Browser live YouTube Music API & WebPlayer integration
	if (cmd === 'get_settings') {
		const stored = getWebStorage<Record<string, string>>('settings', {});
		return { ...defaultSettings, ...stored } as unknown as T;
	}
	if (cmd === 'set_setting') {
		if (args?.key && args?.value !== undefined) {
			const stored = getWebStorage<Record<string, string>>('settings', {});
			stored[String(args.key)] = String(args.value);
			setWebStorage('settings', stored);
		}
		return undefined as unknown as T;
	}
	if (cmd === 'get_playback') {
		return {
			now: playback.now,
			paused: playback.paused,
			position: playback.position,
			duration: playback.duration,
			volume: playback.volume
		} as unknown as T;
	}
	if (cmd === 'get_home') {
		try {
			return (await ytmusic.fetchHome(args?.params as string | undefined)) as unknown as T;
		} catch (e) {
			console.warn('[ytmusic get_home fallback]', e);
			return mockHome as unknown as T;
		}
	}
	if (cmd === 'get_home_more') {
		return (await ytmusic.fetchHomeMore(args?.token as string)) as unknown as T;
	}
	if (cmd === 'search') {
		const res = await ytmusic.fetchSearch(args?.query as string);
		return (res.songs || []).map((s) => ({
			video_id: s.id,
			title: s.title,
			artists: s.subtitle || 'Unknown',
			artist_runs: s.artistRuns,
			thumbnail: s.thumbnail,
			duration: s.duration,
			explicit: s.explicit
		})) as unknown as T;
	}
	if (cmd === 'search_all') {
		return (await ytmusic.fetchSearchAll(args?.query as string)) as unknown as T;
	}
	if (cmd === 'search_cards') {
		return (await ytmusic.fetchSearchCards(
			args?.query as string,
			args?.category as 'albums' | 'artists' | 'playlists'
		)) as unknown as T;
	}
	if (cmd === 'search_suggest') {
		return (await ytmusic.fetchSearchSuggest(args?.input as string)) as unknown as T;
	}
	if (cmd === 'get_artist') {
		return (await ytmusic.fetchArtist(args?.id as string)) as unknown as T;
	}
	if (cmd === 'get_album') {
		return (await ytmusic.fetchAlbum(args?.id as string)) as unknown as T;
	}
	if (cmd === 'get_playlist') {
		const playlistId = String(args?.id || '');
		if (playlistId === 'VLLM' || playlistId === 'FEmusic_liked_videos') {
			const liked = getWebStorage<SongItem[]>('liked_songs', []);
			return {
				title: 'Liked Music',
				subtitle: `Auto-playlist • ${liked.length} songs`,
				thumbnail: liked[0]?.thumbnail,
				description: 'Your favorite liked songs',
				owned: false,
				collaborative: false,
				items: liked
			} as unknown as T;
		}
		if (playlistId === 'LIMUSIC_ON_REPEAT' || playlistId === 'ECHO_ON_REPEAT') {
			const hist = getWebStorage<SongItem[]>('history', []);
			return {
				title: 'On Repeat',
				subtitle: `Auto-playlist • ${Math.min(hist.length, 50)} songs`,
				thumbnail: hist[0]?.thumbnail,
				description: 'Songs you replay often',
				owned: false,
				collaborative: false,
				items: hist.slice(0, 50)
			} as unknown as T;
		}
		const playlists = getWebStorage<WebPlaylist[]>('playlists', []);
		const localPl = playlists.find((p) => p.id === playlistId);
		if (localPl) {
			return {
				title: localPl.title,
				subtitle: localPl.subtitle || `Playlist • ${localPl.items.length} songs`,
				thumbnail: localPl.thumbnail || localPl.items[0]?.thumbnail,
				description: localPl.description,
				owned: true,
				collaborative: false,
				items: localPl.items
			} as unknown as T;
		}
		return (await ytmusic.fetchPlaylist(playlistId)) as unknown as T;
	}
	if (cmd === 'get_lyrics') {
		return (await ytmusic.fetchLyrics(
			args?.title as string,
			(args?.artists || args?.artist) as string | undefined,
			args?.album as string | undefined,
			args?.duration as number | undefined,
			args?.videoId as string | undefined
		)) as unknown as T;
	}
	if (cmd === 'play') {
		const item = args?.item as SongItem;
		if (item) {
			webPlayer.play(item);
			// Record to history
			const hist = getWebStorage<SongItem[]>('history', []);
			const filtered = hist.filter((h) => h.video_id !== item.video_id);
			setWebStorage('history', [item, ...filtered].slice(0, 200));
		}
		return undefined as unknown as T;
	}
	if (cmd === 'play_index') {
		webPlayer.playIndex(args?.index as number);
		return undefined as unknown as T;
	}
	if (cmd === 'play_playlist') {
		webPlayer.playPlaylist(
			args?.items as SongItem[],
			args?.start as number | null,
			args?.sourceName as string | undefined,
			args?.shuffle as boolean | undefined
		);
		return undefined as unknown as T;
	}
	if (cmd === 'toggle_pause') {
		webPlayer.togglePause();
		return undefined as unknown as T;
	}
	if (cmd === 'seek') {
		webPlayer.seek(args?.position as number);
		return undefined as unknown as T;
	}
	if (cmd === 'set_volume') {
		webPlayer.setVolume(args?.volume as number);
		return undefined as unknown as T;
	}
	if (cmd === 'next_track') {
		webPlayer.next();
		return undefined as unknown as T;
	}
	if (cmd === 'prev_track') {
		webPlayer.prev();
		return undefined as unknown as T;
	}
	if (cmd === 'play_next') {
		const items = (args?.items as SongItem[]) || [];
		if (items.length) {
			const q = playback.queue;
			const idx = q.currentIndex + 1;
			q.items.splice(idx, 0, ...items);
			playback.queue = { ...q };
		}
		return undefined as unknown as T;
	}
	if (cmd === 'add_to_queue') {
		const items = (args?.items as SongItem[]) || [];
		if (items.length) {
			const q = playback.queue;
			q.items.push(...items);
			playback.queue = { ...q };
		}
		return undefined as unknown as T;
	}
	if (cmd === 'remove_from_queue') {
		const idx = args?.index as number;
		if (idx !== undefined && idx >= 0) {
			const q = playback.queue;
			q.items.splice(idx, 1);
			if (q.currentIndex >= q.items.length) {
				q.currentIndex = Math.max(0, q.items.length - 1);
			}
			playback.queue = { ...q };
		}
		return undefined as unknown as T;
	}
	if (cmd === 'move_in_queue') {
		const from = args?.from as number;
		const to = args?.to as number;
		if (from !== undefined && to !== undefined) {
			const q = playback.queue;
			const [item] = q.items.splice(from, 1);
			if (item) {
				q.items.splice(to, 0, item);
				playback.queue = { ...q };
			}
		}
		return undefined as unknown as T;
	}
	if (cmd === 'clear_queued') {
		const q = playback.queue;
		q.items = q.items.slice(0, q.currentIndex + 1);
		playback.queue = { ...q };
		return undefined as unknown as T;
	}
	if (cmd === 'toggle_shuffle') {
		const q = playback.queue;
		q.shuffle = !q.shuffle;
		playback.queue = { ...q };
		return undefined as unknown as T;
	}
	if (cmd === 'set_repeat') {
		const q = playback.queue;
		q.repeat = args?.mode as RepeatMode;
		playback.queue = { ...q };
		return undefined as unknown as T;
	}
	if (cmd === 'get_account') return { signedIn: false } as unknown as T;
	if (cmd === 'get_queue') {
		return {
			items: playback.queue.items,
			currentIndex: playback.queue.currentIndex,
			shuffle: playback.queue.shuffle,
			repeat: playback.queue.repeat,
			sourceName: playback.queue.sourceName
		} as unknown as T;
	}
	if (cmd === 'get_library') {
		const playlists = getWebStorage<WebPlaylist[]>('playlists', []);
		const liked = getWebStorage<SongItem[]>('liked_songs', []);
		const items: BrowseItem[] = [];
		if (liked.length > 0) {
			items.push({
				kind: 'playlist',
				id: 'VLLM',
				title: 'Liked Music',
				subtitle: `Auto-playlist • ${liked.length} songs`,
				thumbnail: liked[0]?.thumbnail
			});
		}
		for (const pl of playlists) {
			items.push({
				kind: 'playlist',
				id: pl.id,
				title: pl.title,
				subtitle: `Playlist • ${pl.items.length} songs`,
				thumbnail: pl.thumbnail || pl.items[0]?.thumbnail
			});
		}
		return items as unknown as T;
	}
	if (cmd === 'get_library_albums') {
		return getWebStorage<BrowseItem[]>('saved_albums', []) as unknown as T;
	}
	if (cmd === 'get_library_artists') {
		return getWebStorage<BrowseItem[]>('saved_artists', []) as unknown as T;
	}
	if (cmd === 'get_upload_albums') return [] as unknown as T;
	if (cmd === 'get_browse_grid') return [] as unknown as T;
	if (cmd === 'get_history') {
		return getWebStorage<SongItem[]>('history', []) as unknown as T;
	}
	if (cmd === 'get_saved_accounts') return [] as unknown as T;
	if (cmd === 'get_google_accounts') return [] as unknown as T;
	if (cmd === 'playlist_index') {
		const playlists = getWebStorage<WebPlaylist[]>('playlists', []);
		const map: Record<string, string[]> = {};
		for (const pl of playlists) {
			for (const tr of pl.items) {
				if (!map[tr.video_id]) map[tr.video_id] = [];
				map[tr.video_id].push(pl.id);
			}
		}
		return map as unknown as T;
	}
	if (cmd === 'sync_playlist_index') return {} as unknown as T;
	if (cmd === 'play_counts') return {} as unknown as T;
	if (cmd === 'create_playlist') {
		const id = `local_pl_${Date.now()}`;
		const title = String(args?.title || 'New Playlist');
		const desc = String(args?.description || '');
		const playlists = getWebStorage<WebPlaylist[]>('playlists', []);
		const newPl: WebPlaylist = {
			id,
			title,
			subtitle: 'Playlist • 0 songs',
			description: desc,
			trackCount: 0,
			items: [],
			owned: true,
			collaborative: false
		};
		setWebStorage('playlists', [newPl, ...playlists]);
		return id as unknown as T;
	}
	if (cmd === 'add_to_playlist') {
		const playlistId = String(args?.playlistId || args?.id || '');
		const track = (args?.item as SongItem) || (args?.items as SongItem[])?.[0];
		if (playlistId && track) {
			const playlists = getWebStorage<WebPlaylist[]>('playlists', []);
			const target = playlists.find((p) => p.id === playlistId);
			if (target) {
				target.items.push(track);
				target.trackCount = target.items.length;
				if (!target.thumbnail && track.thumbnail) target.thumbnail = track.thumbnail;
				setWebStorage('playlists', playlists);
			}
		}
		return true as unknown as T;
	}
	if (cmd === 'remove_from_playlist') {
		const playlistId = String(args?.playlistId || args?.id || '');
		const videoId = String(args?.videoId || args?.setVideoId || '');
		const index = args?.index as number | undefined;
		if (playlistId) {
			const playlists = getWebStorage<WebPlaylist[]>('playlists', []);
			const target = playlists.find((p) => p.id === playlistId);
			if (target) {
				if (index !== undefined && index >= 0) {
					target.items.splice(index, 1);
				} else if (videoId) {
					target.items = target.items.filter((t) => t.video_id !== videoId && t.set_video_id !== videoId);
				}
				target.trackCount = target.items.length;
				setWebStorage('playlists', playlists);
			}
		}
		return undefined as unknown as T;
	}
	if (cmd === 'delete_playlist') {
		const playlistId = String(args?.id || args?.playlistId || '');
		if (playlistId) {
			const playlists = getWebStorage<WebPlaylist[]>('playlists', []);
			setWebStorage(
				'playlists',
				playlists.filter((p) => p.id !== playlistId)
			);
		}
		return undefined as unknown as T;
	}
	if (cmd === 'edit_playlist_details') {
		const playlistId = String(args?.id || args?.playlistId || '');
		const title = args?.title ? String(args.title) : undefined;
		const description = args?.description !== undefined ? String(args.description) : undefined;
		if (playlistId) {
			const playlists = getWebStorage<WebPlaylist[]>('playlists', []);
			const target = playlists.find((p) => p.id === playlistId);
			if (target) {
				if (title) target.title = title;
				if (description !== undefined) target.description = description;
				setWebStorage('playlists', playlists);
			}
		}
		return undefined as unknown as T;
	}
	if (cmd === 'rate') {
		const videoId = String(args?.videoId || '');
		const rating = args?.rating as Rating;
		if (videoId) {
			const ratings = getWebStorage<Record<string, Rating>>('ratings', {});
			ratings[videoId] = rating;
			setWebStorage('ratings', ratings);

			const liked = getWebStorage<SongItem[]>('liked_songs', []);
			if (rating === 'like') {
				if (!liked.some((s) => s.video_id === videoId)) {
					const song =
						(playback.now && playback.now.videoId === videoId
							? ({
									video_id: playback.now.videoId,
									title: playback.now.title,
									artists: playback.now.artists,
									artist_id: playback.now.artistId,
									artist_runs: playback.now.artistRuns,
									thumbnail: playback.now.thumbnail,
									duration: playback.now.duration
								} as SongItem)
							: null) ||
						playback.queue.items.find((i) => i.video_id === videoId) ||
						({ video_id: videoId, title: 'Liked Track', artists: 'Unknown' } as SongItem);
					setWebStorage('liked_songs', [song, ...liked]);
				}
			} else {
				setWebStorage(
					'liked_songs',
					liked.filter((s) => s.video_id !== videoId)
				);
			}
		}
		return undefined as unknown as T;
	}
	if (cmd === 'set_song_saved') {
		const song = args?.song as SongItem;
		const saved = args?.saved as boolean;
		if (song) {
			const liked = getWebStorage<SongItem[]>('liked_songs', []);
			if (saved) {
				if (!liked.some((s) => s.video_id === song.video_id)) {
					setWebStorage('liked_songs', [song, ...liked]);
				}
			} else {
				setWebStorage(
					'liked_songs',
					liked.filter((s) => s.video_id !== song.video_id)
				);
			}
		}
		return undefined as unknown as T;
	}
	if (cmd === 'set_album_saved') {
		const album = args?.album as BrowseItem;
		const saved = args?.saved as boolean;
		if (album) {
			const albums = getWebStorage<BrowseItem[]>('saved_albums', []);
			if (saved) {
				if (!albums.some((a) => a.id === album.id)) {
					setWebStorage('saved_albums', [album, ...albums]);
				}
			} else {
				setWebStorage(
					'saved_albums',
					albums.filter((a) => a.id !== album.id)
				);
			}
		}
		return undefined as unknown as T;
	}
	if (cmd === 'subscribe') {
		const artist = args?.artist as BrowseItem;
		const subscribed = args?.subscribed as boolean;
		if (artist) {
			const artists = getWebStorage<BrowseItem[]>('saved_artists', []);
			if (subscribed) {
				if (!artists.some((a) => a.id === artist.id)) {
					setWebStorage('saved_artists', [artist, ...artists]);
				}
			} else {
				setWebStorage(
					'saved_artists',
					artists.filter((a) => a.id !== artist.id)
				);
			}
		}
		return undefined as unknown as T;
	}
	if (cmd === 'app_icon_path') return null as unknown as T;
	if (cmd === 'get_stream_clients') return [] as unknown as T;
	if (cmd === 'get_blocked_artists') {
		return getWebStorage<string[]>('blocked_artists', []) as unknown as T;
	}
	if (cmd === 'block_artist') {
		const id = String(args?.channelId || args?.artist || '');
		if (id) {
			const blocked = getWebStorage<string[]>('blocked_artists', []);
			if (!blocked.includes(id)) {
				blocked.push(id);
				setWebStorage('blocked_artists', blocked);
			}
			return blocked as unknown as T;
		}
		return [] as unknown as T;
	}
	if (cmd === 'unblock_artist') {
		const id = String(args?.channelId || args?.artist || '');
		if (id) {
			const blocked = getWebStorage<string[]>('blocked_artists', []).filter((b) => b !== id);
			setWebStorage('blocked_artists', blocked);
			return blocked as unknown as T;
		}
		return [] as unknown as T;
	}
	if (cmd === 'start_radio') return undefined as unknown as T;
	if (cmd === 'set_playlist_sort') return undefined as unknown as T;
	if (cmd === 'set_playlist_cover') return {} as unknown as T;
	if (cmd === 'add_local_folder' || cmd === 'remove_local_folder' || cmd === 'get_local_library')
		return { folders: [], albums: [], artists: [], songs: [], removed: [] } as unknown as T;
	if (cmd === 'lastfm_status') return { connected: false } as unknown as T;
	if (cmd === 'lt_get_state')
		return {
			status: 'disconnected',
			role: 'none',
			requesting: false,
			roomCode: null,
			myId: null,
			serverUrl: 'wss://sync.echomusic.local',
			users: [],
			currentTrack: null,
			queue: [],
			pendingJoins: [],
			suggestions: []
		} as unknown as T;
	if (cmd === 'can_self_update') return false as unknown as T;
	if (cmd === 'release_notes') return [] as unknown as T;
	if (cmd === 'diagnostics') return 'Echo Music Web Mode' as unknown as T;
	if (cmd === 'diagnostics_summary') return 'Echo Music Web Mode' as unknown as T;
	return undefined as unknown as T;
}

export async function listen<T>(
	event: string,
	handler: (event: { payload: T }) => void
): Promise<UnlistenFn> {
	if (isTauri()) {
		return tauriListen<T>(event, handler);
	}
	return () => {};
}

/** How the signed-in user rated a track (innertube `Rating`). The three states are mutually
 *  exclusive: liking a disliked track clears the dislike, and vice versa. */
export type Rating = 'like' | 'dislike' | 'indifferent';

/** One run of an artist line: its text, plus a channel id when that run links an artist. */
export interface ArtistRun {
	text: string;
	id?: string;
}

export interface SongItem {
	video_id: string;
	title: string;
	artists: string;
	/** Primary artist's channel browseId (`UC…`), when linked — makes the artist name navigable. */
	artist_id?: string;
	/** The artist line run by run — a collab links each name to its own page. Empty/absent when
	 * nothing is linked; render plain `artists` then. */
	artist_runs?: ArtistRun[];
	album?: string;
	/** The album's browseId (`MPRE…`), when linked — makes the album navigable. */
	album_id?: string;
	duration?: string;
	/** Play count as YouTube abbreviates it ("53M"). Album, artist and search rows. */
	play_count?: string;
	thumbnail?: string;
	/** Item id within a playlist — present only on playlist tracks; needed to remove them. */
	set_video_id?: string;
	/** Collaborative playlists only: who added this track, and their avatar. */
	added_by?: string;
	added_by_avatar?: string;
	/** The signed-in user's rating (absent when the response didn't say — same as 'indifferent'). */
	rating?: Rating;
	/** "Add to library" off the row's own menu, with a token for each direction. Absent on rows
	 *  YouTube sent no menu for, and on the ones built here (local files, On Repeat, a Listen
	 *  Together guest's queue) — the menu hides the action rather than offering a dead one.
	 *  Library ▸ Songs is not Liked Music: this is a feedback write, not a rating. */
	library?: { in_library: boolean; add_token?: string; remove_token?: string };
	/** Listen Together: name of the guest who added this queue item (session adds only). */
	queued_by?: string;
	/** Queued to play next ("Play next", or a guest's session add) — the "Next in queue" block. */
	queued?: boolean;
	/** Appended by "Add to queue" — its own block at the tail of the queue. */
	queued_end?: boolean;
	/** The album/playlist either block was added from, for its heading in the queue panel. */
	queued_from?: string;
	/** Appended by autoplay radio continuation — drives the queue's "Autoplay" divider + badge. */
	autoplay?: boolean;
	/** YouTube flags the track explicit. Browse/search rows only: `/next` carries no badge, so a
	 *  radio- or autoplay-appended track arrives without it. */
	explicit?: boolean;
	/** This row links a music video rather than the audio track. */
	is_video?: boolean;
	/** One of the user's own YouTube Music uploads. Set by Rust and passed straight back on play:
	 *  only an authenticated client can stream one, and the row is where that is known. */
	is_upload?: boolean;
}

export interface NowPlaying {
	videoId: string;
	title: string;
	artists: string;
	artistId?: string;
	/** The artist line run by run — links each artist of a collab separately. */
	artistRuns?: ArtistRun[];
	thumbnail?: string;
	duration?: string;
	streamClient: string;
	/** The user's rating of the track (null if unknown). */
	rating?: Rating | null;
	/** YouTube's `musicVideoType` says this is a video upload, not the generated audio track.
	 *  Gates the player view's music-video mode. */
	isVideo?: boolean;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface QueueState {
	items: SongItem[];
	currentIndex: number;
	/** Start of the previously-played run: `items[playedFrom..currentIndex]` has actually been
	 *  heard. Not `0..currentIndex`: a playlist opened at track 7 has six untouched tracks first. */
	playedFrom?: number;
	shuffle?: boolean;
	repeat?: RepeatMode;
	/** What seeded the queue (playlist/album title, "<song> Radio") — the "Next from" header. */
	sourceName?: string | null;
}

export interface Account {
	signedIn: boolean;
	name?: string | null;
	handle?: string | null;
	email?: string | null;
	thumbnail?: string | null;
	channelId?: string | null;
	canSwitch?: boolean;
	/** The cookie authenticated, but a multi-channel login is not complete until one is chosen. */
	selectionRequired?: boolean;
}

export interface AccountIdentity {
	/** Opaque, process-local selector. Raw delegated/data-sync ids stay in Rust. */
	selectionKey: string;
	name: string;
	handle?: string | null;
	email?: string | null;
	thumbnail?: string | null;
	channelId?: string | null;
	selected: boolean;
}

/** One saved Google account (multi-account). Display fields only — cookies stay in Rust. */
export interface SavedAccount {
	/** Opaque, process-local selector. */
	id: string;
	name?: string | null;
	handle?: string | null;
	email?: string | null;
	thumbnail?: string | null;
	/** The account whose session is currently driving requests. */
	active: boolean;
}

export interface BrowseItem {
	kind: 'song' | 'playlist' | 'album' | 'artist';
	/** videoId (song) or browseId (playlist/album/artist). */
	id: string;
	title: string;
	subtitle?: string;
	thumbnail?: string;
	/** "3:47" — song items from a list-style shelf only (card shelves don't carry one). */
	duration?: string;
	/** Song cards only: the artist line run by run, so a card that gets played keeps its links. */
	artistRuns?: ArtistRun[];
	/** Play count as YouTube abbreviates it ("2.5B") — search song rows only. */
	playCount?: string;
	/** YouTube flags this track/album explicit. */
	explicit?: boolean;
	/** Song cards only: one of the user's own uploads. Carried into the SongItem `asSong` builds,
	 *  because that flag is what picks the login-only client chain when it plays. */
	isUpload?: boolean;
}

export interface HomeSection {
	title: string;
	items: BrowseItem[];
	moreBrowseId?: string;
	moreParams?: string;
}
/** A mood/genre filter chip above the home feed; `params` re-fetches home filtered to it. */
export interface HomeChip {
	title: string;
	params: string;
}
export interface HomePage {
	chips: HomeChip[];
	sections: HomeSection[];
	continuation?: string;
}

/**
 * The On Repeat auto-playlist's synthetic browseId (mirrors `ON_REPEAT_ID` in state.rs). It routes
 * like any other playlist; the only thing the UI does differently is draw an icon cover, because
 * a playlist built from local play counts has no artwork of its own.
 */
export const ON_REPEAT_ID = 'LIMUSIC_ON_REPEAT';

/**
 * Liked Music's browseId. YouTube edits this one through the rating endpoint, not `edit_playlist`,
 * so it is never an add/remove/rename target: liking the song is the edit.
 */
export const LIKED_MUSIC_ID = 'VLLM';

/**
 * YouTube Music's own Library ▸ Songs, despite the name: the songs saved to the account's library.
 * It browses like a playlist (no header, no sort menu), so `getPlaylist` reads it and the Library
 * page's Songs tab pages through it with `getPlaylistMore`.
 */
export const LIBRARY_SONGS_ID = 'FEmusic_liked_videos';

/**
 * The tracks the signed-in user uploaded to YouTube Music themselves. Browses like the songs grid
 * above, so the same tab component reads it; the rows come back with `is_upload` set, which is what
 * sends them down the login-only fallback chain when they play (issue #71).
 */
export const LIBRARY_UPLOADS_ID = 'FEmusic_library_privately_owned_tracks';

/**
 * Local music (Rust `local.rs`). A file on disk is a song whose `video_id` is `LOCAL:<path>`, and
 * an album of them is a browseId `LOCALALBUM:<key>` — so local items ride every existing surface
 * (cards, queue, Shortcuts, the album page) and play with no network.
 */
export const LOCAL_SONG_PREFIX = 'LOCAL:';
export const LOCAL_ALBUM_PREFIX = 'LOCALALBUM:';
/** An artist on this disk. Renders through the album route: same page, no YouTube channel. */
export const LOCAL_ARTIST_PREFIX = 'LOCALARTIST:';
export const isLocalId = (id: string | undefined | null): boolean =>
	!!id &&
	(id.startsWith(LOCAL_SONG_PREFIX) ||
		id.startsWith(LOCAL_ALBUM_PREFIX) ||
		id.startsWith(LOCAL_ARTIST_PREFIX));

export interface LocalLibrary {
	/** Watched folders, as absolute paths. */
	folders: string[];
	albums: BrowseItem[];
	artists: BrowseItem[];
	songs: SongItem[];
	/** Song/album/artist ids that were in the library but are gone from disk since the last scan. */
	removed: string[];
}

/** The orders YouTube itself can put a playlist in — everything in `SortKey` but our own `plays`. */
export type ServerSort = 'default' | 'newest' | 'oldest' | 'title' | 'artist' | 'album' | 'top';

export interface SortMenu {
	/** The order YouTube has this list in right now, when it is one we have a name for. */
	selected?: ServerSort;
	/**
	 * The choice is a write, so storing it makes YouTube Music and every other client follow.
	 * Playlists you own only: elsewhere the menu is view-only (Liked Music remembers the last order
	 * asked for anyway, someone else's playlist does not).
	 */
	editable: boolean;
}

/** One day bucket of the play history: YouTube's own heading plus that day's rows. */
export interface HistoryGroup {
	title: string;
	items: SongItem[];
}

export interface PlaylistPage {
	title?: string;
	subtitle?: string;
	thumbnail?: string;
	/** The playlist's own blurb, which the edit dialog prefills its description with. */
	description?: string;
	/** `PUBLIC` / `PRIVATE` / `UNLISTED`. Only playlists you own report it. */
	privacy?: string;
	/** Custom artwork picked on this machine; falls back to `thumbnail` when unset. */
	cover?: string;
	items: SongItem[];
	continuation?: string;
	/** True only when the signed-in user owns this playlist (rename/delete allowed). */
	owned: boolean;
	/** Collaboration is on: others can add to it, and each person may remove only what they added. */
	collaborative: boolean;
	/** Absent on lists YouTube will not reorder: albums, its own radio mixes, On Repeat. */
	sortMenu?: SortMenu;
}
export interface PlaylistContinuation {
	items: SongItem[];
	continuation?: string;
}

export interface ArtistCarousel {
	title: string;
	items: BrowseItem[];
	moreBrowseId?: string;
	moreParams?: string;
}
export interface SearchResults {
	top: BrowseItem[];
	songs: BrowseItem[];
	albums: BrowseItem[];
	artists: BrowseItem[];
	playlists: BrowseItem[];
}

export interface AlbumPage {
	title?: string;
	artist?: string;
	artistId?: string;
	/** The artist line run by run — links each artist of a collaborative album separately. */
	artistRuns?: ArtistRun[];
	artistThumbnail?: string;
	subtitle?: string;
	secondSubtitle?: string;
	description?: string;
	thumbnail?: string;
	items: SongItem[];
	continuation?: string;
	/** The album itself is flagged explicit (the header wears the badge, not just some tracks). */
	explicit?: boolean;
	/** The album's audio playlist id (`OLAK5uy_…`) — autoplay's radio seed, and the save target. */
	playlistId?: string;
	/** Already saved to the signed-in user's library. */
	inLibrary: boolean;
	/** Card shelves under the tracks: other versions, more from the artist, related releases. */
	sections?: ArtistCarousel[];
}

export interface ArtistPage {
	name?: string;
	thumbnail?: string;
	description?: string;
	subscribers?: string;
	monthlyListeners?: string;
	channelId: string;
	subscribed: boolean;
	topSongs: SongItem[];
	/** `VL…` playlist of all the artist's top songs, behind the shelf's "See all". */
	topSongsId?: string;
	sections: ArtistCarousel[];
}

// --- commands (context/11) -----------------------------------------------------------------
// `recordHistory` is true only for a query the user submitted: a signed-in search is written to the
// account's YouTube search history, so a typeahead preview must stay anonymous (#203).
export const search = (query: string, recordHistory = false) =>
	invoke<SongItem[]>('search', { query, recordHistory });
/** Unfiltered search → categorized sections. */
export const searchAll = (query: string, recordHistory = false) =>
	invoke<SearchResults>('search_all', { query, recordHistory });
/** Filtered "Show more" card search for one category (albums / artists / playlists). */
export const searchCards = (query: string, category: 'albums' | 'artists' | 'playlists') =>
	invoke<BrowseItem[]>('search_cards', { query, category });
export const play = (item: SongItem) => invoke<void>('play', { item });
export const playIndex = (index: number) => invoke<void>('play_index', { index });
/** Remove an upcoming track from the queue (host/local only — guests are add-only). */
export const removeFromQueue = (index: number) => invoke<void>('remove_from_queue', { index });
/** Drag-to-reorder: move the upcoming queue item at `from` to index `to` (both past the playing
 * track — the history and the playing row don't move). */
export const moveInQueue = (from: number, to: number) =>
	invoke<void>('move_in_queue', { from, to });
/**
 * "Play next": insert tracks at the front of the "Next in queue" block, behind any earlier
 * "Play next" adds. `from` is the album/playlist they came from — it heads the block in the panel.
 */
export const playNext = (items: SongItem[], from?: string) =>
	invoke<void>('play_next', { items, from });
/**
 * "Add to queue": the tracks go at the *back* of the same block — after everything already queued
 * by hand, ahead of the playing context and anything the app generated behind it.
 * `continuation` is the source page's next-page token — the backend walks the rest of a long
 * playlist into the queue in the background.
 */
export const addToQueue = (items: SongItem[], from?: string, continuation?: string) =>
	invoke<void>('add_to_queue', { items, from, continuation });
/** Clear every upcoming manually-queued track (the "Next in queue" section). */
export const clearQueued = () => invoke<void>('clear_queued');
export const nextTrack = () => invoke<void>('next_track');
export const prevTrack = () => invoke<void>('prev_track');
export const toggleShuffle = () => invoke<void>('toggle_shuffle');
export const setRepeat = (mode: RepeatMode) => invoke<void>('set_repeat', { mode });
export const togglePause = () => invoke<void>('toggle_pause');
export const seek = (position: number) => invoke<void>('seek', { position });
export const setVolume = (volume: number) => invoke<void>('set_volume', { volume });
/** Tempo (0.25–2.0) + pitch (−12..=12 semitones). Not persisted: resets on restart. */
export const setPlaybackParams = (speed: number, semitones: number) =>
	invoke<void>('set_playback_params', { speed, semitones });
export const setSpeed = (speed: number) => setPlaybackParams(speed, 0);
export const getQueue = () => invoke<QueueState>('get_queue');
/** A `limusicvideo://` URL for the track's music video, or null when there isn't one. `maxHeight`
 *  caps the picture at what the box on screen can actually show. The bytes are proxied through
 *  Rust; the webview never sees a googlevideo URL. */
export const videoStream = (videoId: string, maxHeight: number) =>
	invoke<string | null>('video_stream', { videoId, maxHeight });

/** Drop the backend's memory of this track's video URL, after the element failed to load it. */
export const forgetVideoStream = (videoId: string) =>
	invoke<void>('forget_video_stream', { videoId });

/** What the event stream already reported, for a webview that started after it did. */
export interface PlaybackSnapshot {
	now: NowPlaying | null;
	paused: boolean;
	position: number;
	duration: number;
	/** The level restored from last run (or the one another window already set). */
	volume: number;
}
export const getPlayback = () => invoke<PlaybackSnapshot>('get_playback');

// --- settings (context/11) -----------------------------------------------------------------
export const getSettings = () => invoke<Record<string, string>>('get_settings');
export const setSetting = (key: string, value: string) =>
	invoke<void>('set_setting', { key, value });
/** Streamable client keys for the "disabled clients" setting. */
export const getStreamClients = () => invoke<string[]>('get_stream_clients');
/** Wipe both cache tiers (URL cache + mpv on-disk audio cache). */
export const clearCaches = () => invoke<void>('clear_caches');
/** Set the app icon to a PNG the user picked, or restore the bundled one with `null` (#173). */
export const setAppIcon = (path: string | null) => invoke<void>('set_app_icon', { path });
/** Path to the custom app icon, granted to the asset protocol. `null` when the bundled one is in use. */
export const appIconPath = () => invoke<string | null>('app_icon_path');

/** Grant the webview a URL for one font file the user picked, so `@font-face` can load it. */
export const allowFontFile = (path: string) => invoke<void>('allow_font_file', { path });

/** One published release: the GitHub release description, verbatim markdown. */
export interface ReleaseNote {
	version: string;
	/** `YYYY-MM-DD` */
	date: string;
	body: string;
}
/** Changelog for Settings > About, from the GitHub releases API (cached in Rust per run). */
export const releaseNotes = () => invoke<ReleaseNote[]>('release_notes');
/** False on Linux builds that aren't the AppImage (.rpm, the AUR package): they update through the
 *  package manager, so the UI offers a download link instead of an install button. */
export const canSelfUpdate = () => invoke<boolean>('can_self_update');
/** Open an http(s) link in the real browser, never in the webview itself. */
export const openExternal = (url: string) => invoke<void>('open_external', { url });

/** Environment + the redacted tail of `limusic.log`, for pasting into a bug report. */
export const diagnostics = () => invoke<string>('diagnostics');
/** Just the environment block, for prefilling the GitHub bug form. */
export const diagnosticsSummary = () => invoke<string>('diagnostics_summary');
/** The same text, written to a path the user picked in a save dialog. */
export const saveDiagnostics = (path: string) => invoke<void>('save_diagnostics', { path });

// --- auth (context/15) ---------------------------------------------------------------------
export const getAccount = () => invoke<Account>('get_account');
export const getAccountIdentities = () =>
	invoke<AccountIdentity[]>('get_account_identities');
export const switchAccount = (selectionKey: string) =>
	invoke<Account>('switch_account', { selectionKey });
export const signOut = () => invoke<void>('sign_out');
/**
 * Open the in-app Google sign-in webview (context/15 Path A). Result arrives via onAuthChanged.
 * With `addAccount`, Google's AddSession screen is used so a second account can be added even
 * while the webview already holds a Google session.
 */
export const loginWebview = (addAccount = false) => invoke<void>('login_webview', { addAccount });
/** Saved Google accounts for the account menu (display fields only). */
export const getGoogleAccounts = () => invoke<SavedAccount[]>('get_google_accounts');
/** Activate a saved account without a Google re-login. Fails if its stored session expired. */
export const switchGoogleAccount = (id: string) =>
	invoke<Account>('switch_google_account', { id });
/** Delete a saved account; removing the active one signs out. */
export const removeGoogleAccount = (id: string) => invoke<void>('remove_google_account', { id });

// --- mini player (Rust mini.rs) ---------------------------------------------------------------
/** Hide the app to the tray and open the floating widget (a second window running this same SPA). */
export const openMini = () => invoke<void>('open_mini');
/** Close the widget and bring the app back. */
export const closeMini = () => invoke<void>('close_mini');

// --- browse / library (context/08) ---------------------------------------------------------
/** `params` is a `HomeChip.params` token — omit for the unfiltered feed. */
export const getHome = (params?: string) => invoke<HomePage>('get_home', { params });
export const getHomeMore = (token: string) => invoke<HomePage>('get_home_more', { token });
/**
 * On Repeat is the app's own playlist (Rust builds it from this machine's play counts), so its
 * title and subtitle are our English rather than YouTube's, and Rust cannot translate them: the
 * UI language lives in the webview's localStorage and never reaches it. Relabelled here, on the
 * way in, because every surface that draws the tile reads it from one of these two calls.
 */
const relabelOnRepeat = (item: BrowseItem): BrowseItem =>
	item.id !== ON_REPEAT_ID
		? item
		: {
				...item,
				title: t('library.on_repeat'),
				// The count is Rust's leading number ("20 songs"); left alone if it ever isn't.
				subtitle: Number.isNaN(parseInt(item.subtitle ?? '', 10))
					? item.subtitle
					: t('library.songs_count', { count: parseInt(item.subtitle!, 10) })
			};

export const getLibrary = () =>
	invoke<BrowseItem[]>('get_library').then((items) => items.map(relabelOnRepeat));
export const getLibraryAlbums = () => invoke<BrowseItem[]>('get_library_albums');
export const getLibraryArtists = () => invoke<BrowseItem[]>('get_library_artists');
export const getUploadAlbums = () => invoke<BrowseItem[]>('get_upload_albums');
/**
 * The account's YouTube Music play history, in YouTube's own day buckets (Today, Yesterday, …).
 * Empty when signed out.
 */
export const getHistory = () => invoke<HistoryGroup[]>('get_history');
/**
 * `sort` asks YouTube to order the tracks; omit it to get whatever order the account already has
 * the list in, which is the one a fresh visit wants (it is what YouTube Music would show).
 */
export const getPlaylist = (id: string, sort?: ServerSort, desc?: boolean) =>
	invoke<PlaylistPage>('get_playlist', { id, sort, desc }).then((page) =>
		id !== ON_REPEAT_ID
			? page
			: {
					...page,
					title: t('library.on_repeat'),
					subtitle: t('library.on_repeat_subtitle', { count: page.items.length })
				}
	);
/**
 * Store a sort order on a playlist, so YouTube Music and every other client show it the same way.
 * Only for a list whose `sortMenu.editable` is true.
 */
export const setPlaylistSort = (playlistId: string, sort: ServerSort) =>
	invoke<void>('set_playlist_sort', { playlistId, sort });
export const getPlaylistMore = (token: string) =>
	invoke<PlaylistContinuation>('get_playlist_more', { token });
/**
 * videoId → the ids of the playlists you own that hold it. Read straight from local SQLite, so it
 * answers instantly and is empty until `syncPlaylistIndex` has filled it in at least once.
 */
export const playlistIndex = () => invoke<Record<string, string[]>>('playlist_index');
/**
 * Re-walk your own playlists and answer with the rebuilt map. Skips the crawl while the stored one
 * is still inside its window, so calling this on every launch is cheap.
 */
export const syncPlaylistIndex = () => invoke<Record<string, string[]>>('sync_playlist_index');
/**
 * videoId → times played, from the local listening history. Same trailing window On Repeat uses
 * (a month): the history table is pruned to it, so there is no older data. A videoId that isn't in
 * the map has not been played inside the window.
 */
export const getPlayCounts = () => invoke<Record<string, number>>('play_counts');
/**
 * `start`: the clicked track index, or `null` for "just play it" (random opener under shuffle).
 * `sourceId`: the page's playlist/album playlist id — makes autoplay continue with that
 * context's radio (omit to fall back to song radio seeded from the queue's last track).
 * `sourceName`: the page title, for the queue panel's "Next from" header.
 * `shuffle`: turn shuffle on for this queue — pass items in their real order, Rust shuffles.
 */
export const playPlaylist = (
	items: SongItem[],
	start: number | null,
	sourceId?: string,
	sourceName?: string,
	shuffle?: boolean,
	continuation?: string
) => invoke<void>('play_playlist', { items, start, sourceId, sourceName, shuffle, continuation });
/**
 * Start a radio: an endless YouTube-generated queue seeded on this item. `id` is the videoId
 * (song) or browseId/playlistId (everything else) — Rust resolves it to a radio playlist, so the
 * UI never builds one. `name` titles the queue ("<name> Radio").
 *
 * A song radio on the track that's already playing splices in behind it (no re-buffer); every
 * other case replaces the queue. Rejects when YouTube has no radio for the item.
 */
export const startRadio = (kind: 'song' | 'artist' | 'album' | 'playlist', id: string, name?: string) =>
	invoke<void>('start_radio', { kind, id, name });
export const getAlbum = (id: string) => invoke<AlbumPage>('get_album', { id });
export const getArtist = (id: string) => invoke<ArtistPage>('get_artist', { id });
export const getBrowseGrid = (id: string, params?: string) =>
	invoke<BrowseItem[]>('get_browse_grid', { id, params });

// --- local music (local.rs) ------------------------------------------------------------------
/** Rescan the watched folders. Cheap when nothing changed (one stat per file). */
export const getLocalLibrary = () => invoke<LocalLibrary>('get_local_library');
export const addLocalFolder = (path: string) => invoke<LocalLibrary>('add_local_folder', { path });
export const removeLocalFolder = (path: string) =>
	invoke<LocalLibrary>('remove_local_folder', { path });

// --- blocked artists (blocked.rs, plan 046) ---------------------------------------------------
/** One entry in the block list. `id` is the channel browseId when the blocked row linked one. */
export interface BlockedArtist {
	id?: string;
	name: string;
}
export const getBlockedArtists = () => invoke<BlockedArtist[]>('get_blocked_artists');
/** Blocks the artist and returns the new list. Rust also drops them out of the live queue. */
export const blockArtist = (id: string | undefined, name: string) =>
	invoke<BlockedArtist[]>('block_artist', { id, name });
/** `key` is the entry's channel id when it has one, else its name. */
export const unblockArtist = (key: string) => invoke<BlockedArtist[]>('unblock_artist', { key });

// --- write actions (context/01 ✎) ----------------------------------------------------------
/** Like, dislike, or clear the rating. YouTube's three states are mutually exclusive, so a dislike
 *  un-likes in the same call. */
export const rate = (videoId: string, rating: Rating) => invoke<void>('rate', { videoId, rating });
/** `false` = the playlist already had this track, so YouTube added nothing. */
export const addToPlaylist = (playlistId: string, videoId: string) =>
	invoke<boolean>('add_to_playlist', { playlistId, videoId });
export const removeFromPlaylist = (playlistId: string, videoId: string, setVideoId: string) =>
	invoke<void>('remove_from_playlist', { playlistId, videoId, setVideoId });
export const createPlaylist = (title: string) => invoke<string>('create_playlist', { title });
/** Name / description / visibility, from the "Edit playlist" dialog. Leave a field out and
 *  YouTube is never told about it, so an untouched one can't be overwritten. */
export const editPlaylistDetails = (
	playlistId: string,
	changes: { name?: string; description?: string; public?: boolean }
) => invoke<void>('edit_playlist_details', { playlistId, ...changes });
/** Custom playlist artwork. `path` is a file the user picked; `null` drops it. Answers where the
 *  local copy went, and on a removal the thumbnail YouTube rebuilt from the tracks (that one is
 *  worth waiting for: YouTube's own thumbnail is the cover being removed until it lands). */
export const setPlaylistCover = (playlistId: string, path: string | null) =>
	invoke<{ cover?: string; thumbnail?: string }>('set_playlist_cover', { playlistId, path });
export const deletePlaylist = (playlistId: string) =>
	invoke<void>('delete_playlist', { playlistId });
export const subscribe = (channelId: string, subscribed: boolean) =>
	invoke<void>('subscribe', { channelId, subscribed });
/** Add a song to Library ▸ Songs, or take it out. `token` is `SongItem.library.add_token` /
 *  `.remove_token`; YouTube mints them per row, so they come from the list the song was shown in. */
export const setSongSaved = (token: string) => invoke<void>('set_song_saved', { token });
/** Save an album to the library (or remove it). `playlistId` is `AlbumPage.playlistId`. */
export const setAlbumSaved = (playlistId: string, saved: boolean) =>
	invoke<void>('set_album_saved', { playlistId, saved });

// --- events (context/11). Each returns an unlisten fn; call it on component teardown. --------
export const onNowPlaying = (cb: (n: NowPlaying) => void): Promise<UnlistenFn> =>
	listen<NowPlaying>('now-playing', (e) => cb(e.payload));
/**
 * The backend asked YouTube what a track's rating really is and got a different answer than the
 * row we were handed (issue #93). Fires only on a change, at most once per track start.
 */
export const onRating = (cb: (videoId: string, rating: Rating) => void): Promise<UnlistenFn> =>
	listen<{ videoId: string; rating: Rating }>('rating', (e) =>
		cb(e.payload.videoId, e.payload.rating)
	);
export const onQueueChanged = (cb: (q: QueueState) => void): Promise<UnlistenFn> =>
	listen<QueueState>('queue-changed', (e) => cb(e.payload));
/**
 * The queue moved but its track list did not: only the play pointer and the flags changed.
 * Emitted instead of `queue-changed` on every advance and skip, because the full item list is
 * megabytes on a big playlist and a Tauri event delivers its payload as JavaScript *source*.
 * `current` carries the playing row so a metadata backfill (duration, artists) still lands.
 */
export interface QueueIndex {
	currentIndex: number;
	playedFrom?: number;
	shuffle?: boolean;
	repeat?: RepeatMode;
	sourceName?: string | null;
	current: SongItem | null;
}

export const onQueueIndex = (cb: (q: QueueIndex) => void): Promise<UnlistenFn> =>
	listen<QueueIndex>('queue-index', (e) => cb(e.payload));
/**
 * Autoplay topped the queue up at the tail. Carries only the new rows plus the resulting length, so
 * an endless radio session does not re-ship the whole list (which a Tauri event delivers as
 * JavaScript *source*) every twenty tracks. `len` is the resync guard: if the array we hold does
 * not reach that length once the rows are appended, an event was missed and the panel refetches.
 */
export interface QueueAppended {
	items: SongItem[];
	len: number;
	currentIndex: number;
	playedFrom?: number;
}

export const onQueueAppended = (cb: (q: QueueAppended) => void): Promise<UnlistenFn> =>
	listen<QueueAppended>('queue-appended', (e) => cb(e.payload));
/** Main window shown/hidden (close-to-tray, the mini player). WebKitGTK never tells the page. */
export const onUiVisible = (cb: (v: boolean) => void): Promise<UnlistenFn> =>
	listen<boolean>('ui-visible', (e) => cb(e.payload));
export const onPosition = (cb: (p: number) => void): Promise<UnlistenFn> =>
	listen<{ position: number }>('position', (e) => cb(e.payload.position));
export const onDuration = (cb: (d: number) => void): Promise<UnlistenFn> =>
	listen<{ duration: number }>('duration', (e) => cb(e.payload.duration));
/** Echo of every `set_volume`, so a second window's slider can't drift from what you hear. */
export const onVolume = (cb: (v: number) => void): Promise<UnlistenFn> =>
	listen<number>('volume', (e) => cb(e.payload));
export const onPlaybackState = (cb: (s: 'playing' | 'paused') => void): Promise<UnlistenFn> =>
	listen<'playing' | 'paused'>('playback-state', (e) => cb(e.payload));
export const onPlaybackError = (cb: (msg: string) => void): Promise<UnlistenFn> =>
	listen<{ message: string }>('playback-error', (e) => cb(e.payload.message));
export const onPlaybackNotice = (cb: (msg: string) => void): Promise<UnlistenFn> =>
	listen<{ message: string }>('playback-notice', (e) => cb(e.payload.message));
/** Custom playlist artwork applied here but refused by YouTube Music (it syncs in the background,
 *  so the failure lands long after the picker closed). */
export const onCoverError = (cb: (msg: string) => void): Promise<UnlistenFn> =>
	listen<{ message: string }>('cover-error', (e) => cb(e.payload.message));
export const onAuthChanged = (cb: (a: Account) => void): Promise<UnlistenFn> =>
	listen<Account>('auth-changed', (e) => cb(e.payload));
export const onAccountSelectionRequired = (cb: () => void): Promise<UnlistenFn> =>
	listen('account-selection-required', () => cb());
/**
 * Local music disappeared from disk. Fired when a play attempt finds nothing there, carrying the
 * song (and album, if that emptied it) so every view holding those ids can drop them at once.
 */
export const onLocalChanged = (cb: (removed: string[]) => void): Promise<UnlistenFn> =>
	listen<{ removed: string[] }>('local-changed', (e) => cb(e.payload.removed));
export const onLoginError = (cb: (msg: string) => void): Promise<UnlistenFn> =>
	listen<string>('login-error', (e) => cb(e.payload));
export const onLoginDone = (cb: () => void): Promise<UnlistenFn> =>
	listen('login-done', () => cb());

// --- lyrics ---------------------------------------------------------------------------------
export interface LyricWord {
	text: string;
	start_ms: number;
	end_ms: number;
}
export interface LyricLine {
	/** Start cue in milliseconds; present ⇔ the line is synced. */
	time_ms?: number;
	end_time_ms?: number;
	text: string;
	words?: LyricWord[];
	translation?: string;
}
export interface Lyrics {
	/** Attribution for the panel footer ("LRCLIB", "Source: Musixmatch", …). */
	source: string;
	synced: boolean;
	instrumental: boolean;
	lines: LyricLine[];
}
/** Cached on the Rust side (provider chain: LRCLIB → YT Music). `null` = none found. */
export const getLyrics = (args: {
	videoId: string;
	title: string;
	artists: string;
	album?: string;
	duration?: number;
}) => invoke<Lyrics | null>('get_lyrics', args);

// --- Window ------------------------------------------------------------------------------------
/** Theater mode's fullscreen. Not `getCurrentWindow().setFullscreen` (#139): Windows needs the
 *  maximized state undone first and the frame recalculated after, in that order, on the main
 *  thread. Rust also puts the maximized state back when theater closes. */
export const theaterFullscreen = (on: boolean) => invoke<void>('theater_fullscreen', { on });

// --- Last.fm scrobbling ---------------------------------------------------------------------
export interface LastfmState {
	connected: boolean;
	username?: string | null;
	/** Set when a connect attempt failed (timeout, network, rejected) — show it as a toast. */
	error?: string | null;
}
export const lastfmStatus = () => invoke<LastfmState>('lastfm_status');
/** Opens the browser auth flow; the outcome arrives via onLastfmState, not this promise. */
export const lastfmConnect = () => invoke<void>('lastfm_connect');
/** Also cancels an in-flight connect (the auth poll checks and bails). */
export const lastfmDisconnect = () => invoke<void>('lastfm_disconnect');
export const onLastfmState = (cb: (s: LastfmState) => void): Promise<UnlistenFn> =>
	listen<LastfmState>('lastfm-state', (e) => cb(e.payload));

// --- Listen Together (context/19) -----------------------------------------------------------
export interface LtUser {
	user_id: string;
	username: string;
	is_host: boolean;
	is_connected: boolean;
}
export interface LtTrack {
	id: string;
	title: string;
	artist: string;
	thumbnail?: string | null;
	duration_ms: number;
	/** Name of the guest who added this track to the session queue. */
	queued_by?: string | null;
}
export interface LtPendingJoin {
	userId: string;
	username: string;
}
export interface LtSuggestion {
	id: string;
	from_user_id: string;
	from_username: string;
	track: LtTrack;
}
export interface LtState {
	status: 'disconnected' | 'connecting' | 'connected';
	role: 'none' | 'host' | 'guest';
	/** Asked to create/join and awaiting the room (host approval) — show a waiting state. */
	requesting: boolean;
	roomCode: string | null;
	myId: string | null;
	serverUrl: string;
	users: LtUser[];
	currentTrack: LtTrack | null;
	queue: LtTrack[];
	pendingJoins: LtPendingJoin[];
	suggestions: LtSuggestion[];
}

export const ltGetState = () => invoke<LtState>('lt_get_state');
export const ltSetServerUrl = (url: string) => invoke<void>('lt_set_server_url', { url });
export const ltCreateRoom = (username: string) => invoke<void>('lt_create_room', { username });
export const ltJoinRoom = (code: string, username: string) =>
	invoke<void>('lt_join_room', { code, username });
export const ltLeave = () => invoke<void>('lt_leave');
export const ltApproveJoin = (userId: string) => invoke<void>('lt_approve_join', { userId });
export const ltRejectJoin = (userId: string) => invoke<void>('lt_reject_join', { userId });
export const ltKick = (userId: string) => invoke<void>('lt_kick', { userId });
export const ltTransferHost = (userId: string) => invoke<void>('lt_transfer_host', { userId });
export const ltApproveSuggestion = (id: string) => invoke<void>('lt_approve_suggestion', { id });
export const ltRejectSuggestion = (id: string) => invoke<void>('lt_reject_suggestion', { id });
export const ltRequestSync = () => invoke<void>('lt_request_sync');

export const onLtState = (cb: (s: LtState) => void): Promise<UnlistenFn> =>
	listen<LtState>('lt-state', (e) => cb(e.payload));
export const onLtNotice = (cb: (msg: string) => void): Promise<UnlistenFn> =>
	listen<string>('lt-notice', (e) => cb(e.payload));
