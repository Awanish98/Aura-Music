// YouTube Music Web API client & parser for Echo Music web mode.
import type {
	AlbumPage,
	ArtistCarousel,
	ArtistPage,
	ArtistRun,
	BrowseItem,
	HomeChip,
	HomePage,
	HomeSection,
	LyricLine,
	Lyrics,
	PlaylistContinuation,
	PlaylistPage,
	SearchResults,
	SongItem
} from './api';

async function post(endpoint: string, body: Record<string, unknown> = {}): Promise<any> {
	const res = await fetch(`/api/yt-music/${endpoint}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) {
		throw new Error(`YouTube API request failed: ${res.status} ${res.statusText}`);
	}
	return res.json();
}

function getText(node: any): string | undefined {
	if (!node) return undefined;
	if (typeof node === 'string') return node;
	if (Array.isArray(node.runs)) {
		return node.runs.map((r: any) => r.text).join('');
	}
	if (node.simpleText) return node.simpleText;
	return undefined;
}

function getThumb(node: any): string | undefined {
	const thumbs = node?.thumbnails || node?.thumbnail?.thumbnails;
	if (Array.isArray(thumbs) && thumbs.length) {
		return thumbs[thumbs.length - 1].url;
	}
	return undefined;
}

function parseArtistRuns(runs: any[] | undefined): ArtistRun[] {
	if (!Array.isArray(runs)) return [];
	return runs
		.filter((r) => r.text && r.text !== ' • ' && r.text !== ' & ' && r.text !== ', ')
		.map((r) => ({
			text: r.text,
			id: r.navigationEndpoint?.browseEndpoint?.browseId
		}));
}

function parseCard(node: any): BrowseItem | null {
	const r = node.musicTwoRowItemRenderer;
	if (!r) return null;
	const title = getText(r.title);
	if (!title) return null;
	const subtitle = getText(r.subtitle);
	const thumbnail = getThumb(r.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail);
	const nav = r.navigationEndpoint || r.title?.runs?.[0]?.navigationEndpoint;
	const browseId = nav?.browseEndpoint?.browseId;
	const videoId = nav?.watchEndpoint?.videoId || nav?.watchPlaylistEndpoint?.videoId;

	let kind: 'song' | 'playlist' | 'album' | 'artist' = 'playlist';
	let id = browseId || videoId || '';

	if (browseId) {
		if (browseId.startsWith('MPRE') || browseId.startsWith('FEmusic_album')) {
			kind = 'album';
		} else if (browseId.startsWith('UC')) {
			kind = 'artist';
		} else {
			kind = 'playlist';
		}
	} else if (videoId) {
		kind = 'song';
		id = videoId;
	}

	const artistRuns = parseArtistRuns(r.subtitle?.runs);

	return {
		kind,
		id,
		title,
		subtitle,
		thumbnail,
		artistRuns,
		isUpload: false,
		explicit: false
	};
}

function parseListItem(node: any): SongItem | null {
	const r = node.musicResponsiveListItemRenderer;
	if (!r) return null;

	const flexCols = r.flexColumns || [];
	const titleRun = flexCols[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0];
	const title = titleRun?.text || getText(flexCols[0]?.musicResponsiveListItemFlexColumnRenderer?.text);
	if (!title) return null;

	const nav =
		titleRun?.navigationEndpoint ||
		r.navigationEndpoint ||
		r.playNavigationEndpoint ||
		r.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint;

	const videoId =
		nav?.watchEndpoint?.videoId ||
		nav?.watchPlaylistEndpoint?.videoId ||
		r.playlistItemData?.videoId ||
		'';

	if (!videoId) return null;

	const subRuns = flexCols[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || [];
	const artistRuns = parseArtistRuns(subRuns);
	const artists = artistRuns.map((a) => a.text).join(', ') || 'Unknown Artist';
	const primaryArtist = artistRuns[0];

	// Find album if present
	let album: string | undefined;
	let albumId: string | undefined;
	for (const run of subRuns) {
		const bid = run.navigationEndpoint?.browseEndpoint?.browseId;
		if (bid && (bid.startsWith('MPRE') || bid.startsWith('FEmusic_album'))) {
			album = run.text;
			albumId = bid;
		}
	}

	// Duration from last flex column or fixed column
	let duration: string | undefined;
	const fixedCol = r.fixedColumns?.[0]?.musicResponsiveListItemFixedColumnRenderer?.text;
	if (fixedCol) {
		duration = getText(fixedCol);
	} else if (subRuns.length > 0) {
		const lastRun = subRuns[subRuns.length - 1]?.text;
		if (/^\d+:\d+$/.test(lastRun)) {
			duration = lastRun;
		}
	}

	const thumbnail = getThumb(r.thumbnail?.musicThumbnailRenderer?.thumbnail);

	return {
		video_id: videoId,
		title,
		artists,
		artist_id: primaryArtist?.id,
		artist_runs: artistRuns,
		album,
		album_id: albumId,
		duration,
		thumbnail,
		is_video: false,
		is_upload: false,
		explicit: false
	};
}

export async function fetchHome(params?: string): Promise<HomePage> {
	const body: Record<string, unknown> = { browseId: 'FEmusic_home' };
	if (params) body.params = params;

	const data = await post('browse', body);
	const secList =
		data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content
			?.sectionListRenderer;

	const rawChips = secList?.header?.chipCloudRenderer?.chips || [];
	const chips: HomeChip[] = rawChips
		.map((c: any) => {
			const chip = c.chipCloudChipRenderer;
			return {
				title: getText(chip?.text) || '',
				params: chip?.navigationEndpoint?.browseEndpoint?.params || ''
			};
		})
		.filter((c: HomeChip) => c.title && c.params);

	const sections: HomeSection[] = [];
	const rawSections = secList?.contents || [];

	for (const sec of rawSections) {
		const shelf = sec.musicCarouselShelfRenderer || sec.musicImmersiveCarouselShelfRenderer;
		if (!shelf) continue;

		const title = getText(shelf.header?.musicCarouselShelfBasicHeaderRenderer?.title);
		if (!title) continue;

		const items: BrowseItem[] = [];
		const contents = shelf.contents || [];

		for (const item of contents) {
			if (item.musicTwoRowItemRenderer) {
				const card = parseCard(item);
				if (card) items.push(card);
			} else if (item.musicResponsiveListItemRenderer) {
				const song = parseListItem(item);
				if (song) {
					items.push({
						kind: 'song',
						id: song.video_id,
						title: song.title,
						subtitle: song.artists,
						thumbnail: song.thumbnail,
						duration: song.duration,
						artistRuns: song.artist_runs,
						isUpload: false,
						explicit: false
					});
				}
			}
		}

		if (items.length) {
			const moreBrowse = shelf.header?.musicCarouselShelfBasicHeaderRenderer?.moreContentButton;
			const moreBrowseId = moreBrowse?.buttonRenderer?.navigationEndpoint?.browseEndpoint?.browseId;
			const moreParams = moreBrowse?.buttonRenderer?.navigationEndpoint?.browseEndpoint?.params;

			sections.push({
				title,
				items,
				moreBrowseId,
				moreParams
			});
		}
	}

	const continuation =
		secList?.continuations?.[0]?.nextContinuationData?.continuation ||
		secList?.continuations?.[0]?.reloadContinuationData?.continuation;

	// FMHY Curated Sections (Live Radios, Podcasts, Soundscapes, Game Soundtracks, Top Charts)
	try {
		const { getFmhyHomeSections } = await import('./fmhy');
		const fmhySections = getFmhyHomeSections();
		sections.unshift(...fmhySections);
	} catch (e) {
		console.warn('[FMHY Sections load error]', e);
	}

	return { chips, sections, continuation };
}

export async function fetchHomeMore(continuation: string): Promise<HomePage> {
	const data = await post('browse', { continuation });
	const secList = data.continuationContents?.sectionListContinuation;
	const sections: HomeSection[] = [];
	const rawSections = secList?.contents || [];

	for (const sec of rawSections) {
		const shelf = sec.musicCarouselShelfRenderer;
		if (!shelf) continue;
		const title = getText(shelf.header?.musicCarouselShelfBasicHeaderRenderer?.title);
		if (!title) continue;
		const items: BrowseItem[] = [];
		for (const item of shelf.contents || []) {
			if (item.musicTwoRowItemRenderer) {
				const card = parseCard(item);
				if (card) items.push(card);
			} else if (item.musicResponsiveListItemRenderer) {
				const song = parseListItem(item);
				if (song) {
					items.push({
						kind: 'song',
						id: song.video_id,
						title: song.title,
						subtitle: song.artists,
						thumbnail: song.thumbnail,
						duration: song.duration,
						artistRuns: song.artist_runs,
						isUpload: false,
						explicit: false
					});
				}
			}
		}
		if (items.length) {
			sections.push({ title, items });
		}
	}

	const nextCont = secList?.continuations?.[0]?.nextContinuationData?.continuation;
	return { chips: [], sections, continuation: nextCont };
}

export async function fetchSearch(query: string): Promise<SearchResults> {
	// Spotify URL Interceptor from FMHY Spotify tools
	if (query.includes('open.spotify.com/') || query.startsWith('spotify:')) {
		try {
			let cleanUrl = query.trim();
			if (cleanUrl.startsWith('spotify:track:')) {
				cleanUrl = `https://open.spotify.com/track/${cleanUrl.replace('spotify:track:', '')}`;
			} else if (cleanUrl.startsWith('spotify:playlist:')) {
				cleanUrl = `https://open.spotify.com/playlist/${cleanUrl.replace('spotify:playlist:', '')}`;
			} else if (cleanUrl.startsWith('spotify:album:')) {
				cleanUrl = `https://open.spotify.com/album/${cleanUrl.replace('spotify:album:', '')}`;
			}

			const spRes = await fetch(`/api/spotify/resolve?url=${encodeURIComponent(cleanUrl)}`);
			if (spRes.ok) {
				const spData = await spRes.json();
				const entity = spData.entity;
				if (entity) {
					if (entity.type === 'track' || (!entity.trackList && entity.name)) {
						const trackName = entity.name || entity.title;
						const artistName = entity.artists?.[0]?.name || '';
						// Search YT Music for matched song
						const ytResults = await fetchSearch(`${trackName} ${artistName}`);
						if (ytResults.songs.length || ytResults.top.length) {
							return ytResults;
						}
					} else if (entity.trackList) {
						const playlistItem: BrowseItem = {
							kind: 'playlist',
							id: cleanUrl,
							title: entity.name || 'Spotify Playlist',
							subtitle: `Spotify • ${entity.trackList.length} Tracks`,
							thumbnail: entity.visualIdentity?.image?.[0]?.url || entity.images?.[0]?.url,
							artistRuns: [{ text: 'Spotify' }],
							isUpload: false,
							explicit: false
						};
						return {
							top: [playlistItem],
							songs: [],
							albums: [],
							artists: [],
							playlists: [playlistItem]
						};
					}
				}
			}
		} catch (err) {
			console.warn('[Spotify Search Interceptor Error]', err);
		}
	}

	const data = await post('search', { query });
	const tab = data.contents?.tabbedSearchResultsRenderer?.tabs?.[0]?.tabRenderer;
	const secList = tab?.content?.sectionListRenderer?.contents || [];

	const songs: BrowseItem[] = [];
	const albums: BrowseItem[] = [];
	const artists: BrowseItem[] = [];
	const playlists: BrowseItem[] = [];
	const top: BrowseItem[] = [];

	const processItem = (c: any) => {
		const item = c.musicResponsiveListItemRenderer;
		if (!item) return;

		const song = parseListItem(c);
		const flexCols = item.flexColumns || [];
		const nav =
			flexCols[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]
				?.navigationEndpoint;
		const bid = nav?.browseEndpoint?.browseId;

		if (bid) {
			const title = getText(flexCols[0]?.musicResponsiveListItemFlexColumnRenderer?.text) || '';
			const subtitle =
				getText(flexCols[1]?.musicResponsiveListItemFlexColumnRenderer?.text) || '';
			const thumbnail = getThumb(item.thumbnail?.musicThumbnailRenderer?.thumbnail);

			if (bid.startsWith('UC')) {
				if (!artists.some((a) => a.id === bid)) {
					artists.push({
						kind: 'artist',
						id: bid,
						title,
						subtitle,
						thumbnail,
						artistRuns: [],
						isUpload: false,
						explicit: false
					});
				}
			} else if (bid.startsWith('MPRE') || bid.startsWith('FEmusic_album')) {
				if (!albums.some((a) => a.id === bid)) {
					albums.push({
						kind: 'album',
						id: bid,
						title,
						subtitle,
						thumbnail,
						artistRuns: [],
						isUpload: false,
						explicit: false
					});
				}
			} else {
				if (!playlists.some((p) => p.id === bid)) {
					playlists.push({
						kind: 'playlist',
						id: bid,
						title,
						subtitle,
						thumbnail,
						artistRuns: [],
						isUpload: false,
						explicit: false
					});
				}
			}
		}

		if (song && song.video_id) {
			if (!songs.some((s) => s.id === song.video_id)) {
				songs.push({
					kind: 'song',
					id: song.video_id,
					title: song.title,
					subtitle: song.artists,
					thumbnail: song.thumbnail,
					duration: song.duration,
					artistRuns: song.artist_runs,
					isUpload: false,
					explicit: false
				});
			}
		}
	};

	for (const sec of secList) {
		// 1. Top result card shelf
		const card = sec.musicCardShelfRenderer;
		if (card) {
			const title = getText(card.title);
			const subtitle = getText(card.subtitle);
			const thumbnail = getThumb(card.thumbnail?.musicThumbnailRenderer?.thumbnail);
			const nav = card.title?.runs?.[0]?.navigationEndpoint;
			const browseId = nav?.browseEndpoint?.browseId;
			const videoId = nav?.watchEndpoint?.videoId;

			let kind: 'song' | 'playlist' | 'album' | 'artist' = 'song';
			let id = videoId || browseId || '';

			if (browseId) {
				if (browseId.startsWith('UC')) kind = 'artist';
				else if (browseId.startsWith('MPRE') || browseId.startsWith('FEmusic_album')) kind = 'album';
				else kind = 'playlist';
			}

			if (title) {
				top.push({
					kind,
					id,
					title,
					subtitle,
					thumbnail,
					artistRuns: [],
					isUpload: false,
					explicit: false
				});
			}

			for (const c of card.contents || []) {
				processItem(c);
			}
		}

		// 2. Standard Music Shelf
		const shelf = sec.musicShelfRenderer;
		if (shelf) {
			for (const c of shelf.contents || []) {
				processItem(c);
			}
		}

		// 3. Item Section Renderer (Modern Search Format)
		const isr = sec.itemSectionRenderer;
		if (isr) {
			for (const c of isr.contents || []) {
				processItem(c);
			}
		}
	}

	// If top result is empty, use the first song or artist
	if (!top.length && songs.length) {
		top.push(songs[0]);
	}

	return { top, songs, albums, artists, playlists };
}

export async function fetchSearchAll(query: string): Promise<SearchResults> {
	return fetchSearch(query);
}

export async function fetchSearchCards(
	query: string,
	category: 'albums' | 'artists' | 'playlists'
): Promise<BrowseItem[]> {
	const res = await fetchSearch(query);
	return res[category] || [];
}

export async function fetchSearchSuggest(query: string): Promise<string[]> {
	if (!query.trim()) return [];
	const data = await post('music/get_search_suggestions', { input: query });
	const list = data.contents?.[0]?.searchSuggestionsSectionRenderer?.contents || [];
	return list
		.map((c: any) => c.searchSuggestionRenderer?.suggestion?.runs?.map((r: any) => r.text).join(''))
		.filter(Boolean);
}

export async function fetchArtist(id: string): Promise<ArtistPage> {
	try {
		const data = await post('browse', { browseId: id });
		const header = data.header?.musicImmersiveHeaderRenderer || data.header?.musicVisualHeaderRenderer;
		const name = getText(header?.title) || 'Artist';
		const description = getText(header?.description);
		const subscribers = getText(header?.subscriptionButton?.subscribeButtonRenderer?.subscriberCountText);
		const thumbnail = getThumb(header?.thumbnail?.musicThumbnailRenderer?.thumbnail);

		const secList =
			data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content
				?.sectionListRenderer?.contents || [];

		const topSongs: SongItem[] = [];
		let topSongsId: string | undefined;
		const sections: ArtistCarousel[] = [];

		for (const sec of secList) {
			const shelf = sec.musicShelfRenderer;
			if (shelf) {
				const title = getText(shelf.title);
				if (title?.toLowerCase().includes('song')) {
					topSongsId = shelf.bottomEndpoint?.browseEndpoint?.browseId;
					for (const c of shelf.contents || []) {
						const s = parseListItem(c);
						if (s) topSongs.push(s);
					}
				}
			}

			const carousel = sec.musicCarouselShelfRenderer;
			if (carousel) {
				const title = getText(carousel.header?.musicCarouselShelfBasicHeaderRenderer?.title) || '';
				const items: BrowseItem[] = [];
				for (const c of carousel.contents || []) {
					if (c.musicTwoRowItemRenderer) {
						const card = parseCard(c);
						if (card) items.push(card);
					}
				}
				if (items.length) {
					sections.push({
						title,
						items,
						moreBrowseId:
							carousel.header?.musicCarouselShelfBasicHeaderRenderer?.moreContentButton
								?.buttonRenderer?.navigationEndpoint?.browseEndpoint?.browseId
					});
				}
			}
		}

		return {
			name,
			thumbnail,
			description,
			subscribers,
			channelId: id,
			subscribed: false,
			topSongs,
			topSongsId,
			sections
		};
	} catch (e) {
		console.warn('[ytmusic fetchArtist warning]', e);
		return {
			name: 'Artist',
			thumbnail: undefined,
			description: undefined,
			subscribers: undefined,
			channelId: id,
			subscribed: false,
			topSongs: [],
			topSongsId: undefined,
			sections: []
		};
	}
}

export async function fetchAlbum(id: string): Promise<AlbumPage> {
	try {
		const data = await post('browse', { browseId: id });
		const header =
			data.header?.musicDetailHeaderRenderer || data.header?.musicResponsiveHeaderRenderer;
		const title = getText(header?.title) || 'Album';
		const subtitle = getText(header?.subtitle);
		const secondSubtitle = getText(header?.secondSubtitle);
		const description = getText(header?.description);
		const thumbnail = getThumb(
			header?.thumbnail?.croppedSquareThumbnailRenderer?.thumbnail ||
				header?.thumbnail?.musicThumbnailRenderer?.thumbnail
		);

		const artistRun = header?.subtitle?.runs?.find(
			(r: any) => r.navigationEndpoint?.browseEndpoint?.browseId?.startsWith('UC')
		);
		const artist = artistRun?.text || 'Various Artists';
		const artistId = artistRun?.navigationEndpoint?.browseEndpoint?.browseId;

		const items: SongItem[] = [];
		const secList =
			data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content
				?.sectionListRenderer?.contents ||
			data.contents?.twoColumnBrowseResultsRenderer?.secondaryContents?.sectionListRenderer
				?.contents ||
			[];

		for (const sec of secList) {
			const shelf = sec.musicShelfRenderer || sec.musicPlaylistShelfRenderer;
			if (shelf) {
				for (const c of shelf.contents || []) {
					const s = parseListItem(c);
					if (s) {
						if (!s.album) s.album = title;
						if (!s.album_id) s.album_id = id;
						if (!s.thumbnail) s.thumbnail = thumbnail;
						items.push(s);
					}
				}
			}
		}

		return {
			title,
			artist,
			artistId,
			artistRuns: artistRun ? [{ text: artist, id: artistId }] : [],
			subtitle,
			secondSubtitle,
			description,
			thumbnail,
			items,
			explicit: false,
			inLibrary: false,
			sections: []
		};
	} catch (e) {
		console.warn('[ytmusic fetchAlbum warning]', e);
		return {
			title: 'Album',
			artist: 'Various Artists',
			artistId: undefined,
			artistRuns: [],
			subtitle: undefined,
			secondSubtitle: undefined,
			description: undefined,
			thumbnail: undefined,
			items: [],
			explicit: false,
			inLibrary: false,
			sections: []
		};
	}
}

export async function fetchPlaylist(id: string): Promise<PlaylistPage> {
	// Support Spotify Playlists & Albums
	if (id.startsWith('spotify:') || id.includes('open.spotify.com/')) {
		let cleanUrl = id;
		if (cleanUrl.startsWith('spotify:playlist:')) {
			cleanUrl = `https://open.spotify.com/playlist/${cleanUrl.replace('spotify:playlist:', '')}`;
		} else if (cleanUrl.startsWith('spotify:album:')) {
			cleanUrl = `https://open.spotify.com/album/${cleanUrl.replace('spotify:album:', '')}`;
		}

		try {
			const res = await fetch(`/api/spotify/resolve?url=${encodeURIComponent(cleanUrl)}`);
			if (res.ok) {
				const data = await res.json();
				const entity = data.entity;
				if (entity) {
					const title = entity.name || 'Spotify Playlist';
					const subtitle = entity.type ? `Spotify • ${entity.type}` : 'Spotify';
					const description = entity.description || '';
					const thumbnail =
						entity.visualIdentity?.image?.[0]?.url ||
						entity.images?.[0]?.url ||
						'https://open.spotifycdn.com/cdn/images/favicon32.8e66b099.png';

					const items: SongItem[] = (entity.trackList || []).map((t: any) => {
						const durSec = t.duration ? Math.round(t.duration / 1000) : 0;
						const mins = Math.floor(durSec / 60);
						const secs = durSec % 60;
						const durationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

						return {
							video_id: `sp:${t.title}---${t.subtitle || ''}`,
							title: t.title,
							artists: t.subtitle || 'Unknown Artist',
							artist_runs: t.subtitle ? [{ text: t.subtitle }] : [],
							album: title,
							duration: durationStr,
							thumbnail,
							is_video: false,
							is_upload: false,
							explicit: !!t.isExplicit
						};
					});

					return {
						title,
						subtitle,
						thumbnail,
						description,
						items,
						owned: false,
						collaborative: false
					};
				}
			}
		} catch (err) {
			console.warn('[Spotify Playlist Resolver Error]', err);
		}
	}

	// Support FMHY items & soundtracks
	if (id.startsWith('fmhy_') || id.startsWith('radio_')) {
		try {
			const { findFmhyItem, convertFmhyToSongItem } = await import('./fmhy');
			const item = findFmhyItem(id);
			if (item) {
				const singleSong = convertFmhyToSongItem(item);
				let searchItems: SongItem[] = [singleSong];

				if (item.searchQuery) {
					try {
						const searchRes = await fetchSearch(item.searchQuery);
						if (searchRes.songs?.length) {
							searchItems = searchRes.songs.map((s) => ({
								video_id: s.id,
								title: s.title,
								artists: s.subtitle || item.subtitle,
								artist_runs: s.artistRuns,
								album: item.title,
								duration: s.duration || '3:30',
								thumbnail: s.thumbnail || item.thumbnail,
								is_video: false,
								is_upload: false,
								explicit: false
							}));
						}
					} catch {}
				}

				return {
					title: item.title,
					subtitle: item.subtitle,
					thumbnail: item.thumbnail,
					description: item.description || 'Curated from FMHY Audio Guide',
					items: searchItems,
					owned: false,
					collaborative: false
				};
			}
		} catch (e) {
			console.warn('[FMHY Playlist fetch error]', e);
		}
	}

	try {
		const data = await post('browse', { browseId: id });
		const header =
			data.header?.musicDetailHeaderRenderer || data.header?.musicResponsiveHeaderRenderer;
		const title = getText(header?.title) || 'Playlist';
		const subtitle = getText(header?.subtitle);
		const description = getText(header?.description);
		const thumbnail = getThumb(
			header?.thumbnail?.croppedSquareThumbnailRenderer?.thumbnail ||
				header?.thumbnail?.musicThumbnailRenderer?.thumbnail
		);

		const items: SongItem[] = [];
		const secList =
			data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content
				?.sectionListRenderer?.contents ||
			data.contents?.twoColumnBrowseResultsRenderer?.secondaryContents?.sectionListRenderer
				?.contents ||
			[];

		for (const sec of secList) {
			const shelf = sec.musicPlaylistShelfRenderer || sec.musicShelfRenderer;
			if (shelf) {
				for (const c of shelf.contents || []) {
					const s = parseListItem(c);
					if (s) items.push(s);
				}
			}
		}

		return {
			title,
			subtitle,
			thumbnail,
			description,
			items,
			owned: false,
			collaborative: false
		};
	} catch (e) {
		console.warn('[ytmusic fetchPlaylist warning]', e);
		return {
			title: 'Playlist',
			subtitle: undefined,
			thumbnail: undefined,
			description: undefined,
			items: [],
			owned: false,
			collaborative: false
		};
	}
}

export async function fetchLyrics(
	title: string,
	artist?: string,
	album?: string,
	duration?: number,
	videoId?: string
): Promise<Lyrics | null> {
	if (!title) return null;

	// Clean track title (strip "Official Music Video", "(feat. ...)", "[Audio]", etc. for better matching)
	const cleanTitle = title
		.replace(/(\(|\[)(Official|Lyric|Audio|Video|Visualizer|HD|4K|Remastered|feat\.?|ft\.?).*?(\)|\])/gi, '')
		.trim();

	// Clean artist string
	const cleanArtist = (artist || '').split(',')[0].split('&')[0].trim();

	// 1. Try Boidu API for word-level karaoke timings if duration available
	if (duration && duration > 0) {
		try {
			const boiduUrl = `https://lyrics-api.boidu.dev/lyrics?title=${encodeURIComponent(cleanTitle)}&artist=${encodeURIComponent(cleanArtist)}&duration=${Math.round(duration)}`;
			const bRes = await fetch(boiduUrl, { headers: { 'User-Agent': 'EchoMusic/1.0' } });
			if (bRes.ok) {
				const bData = await bRes.json();
				if (bData && Array.isArray(bData.lines) && bData.lines.length > 0) {
					const lines: LyricLine[] = bData.lines.map((l: any) => ({
						time_ms: l.time_ms ?? l.time ?? (l.start ? Math.round(l.start * 1000) : undefined),
						end_time_ms: l.end_time_ms ?? (l.end ? Math.round(l.end * 1000) : undefined),
						text: l.text || '',
						words: l.words?.map((w: any) => ({
							text: w.text,
							start_ms: w.start_ms ?? Math.round(w.start * 1000),
							end_ms: w.end_ms ?? Math.round(w.end * 1000)
						}))
					}));

					return {
						source: 'Boidu',
						synced: true,
						instrumental: false,
						lines
					};
				}
			}
		} catch {
			// Fallback to LRCLIB
		}
	}

	// 2. Try LRCLIB Exact Match
	try {
		const getParams = new URLSearchParams({ track_name: cleanTitle || title });
		if (cleanArtist) getParams.set('artist_name', cleanArtist);
		if (album) getParams.set('album_name', album);
		if (duration && duration > 0) getParams.set('duration', Math.round(duration).toString());

		let res = await fetch(`https://lrclib.net/api/get?${getParams.toString()}`, {
			headers: { 'User-Agent': 'EchoMusic/1.0' }
		}).catch(() => null);

		// Fallback to internal proxy if direct fails
		if (!res || !res.ok) {
			res = await fetch(`/api/lyrics?${getParams.toString()}`).catch(() => null);
		}

		let data = res && res.ok ? await res.json() : null;

		// 3. Try LRCLIB Search if Exact Match not found
		if (!data || (!data.syncedLyrics && !data.plainLyrics)) {
			const q = `${cleanTitle} ${cleanArtist}`.trim();
			const searchRes = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(q)}`, {
				headers: { 'User-Agent': 'EchoMusic/1.0' }
			}).catch(() => null);

			if (searchRes && searchRes.ok) {
				const searchItems = await searchRes.json();
				if (Array.isArray(searchItems) && searchItems.length > 0) {
					// Choose best matching item by duration or first item
					if (duration && duration > 0) {
						data = searchItems.reduce((prev: any, curr: any) => {
							const prevDiff = Math.abs((prev.duration || 0) - duration);
							const currDiff = Math.abs((curr.duration || 0) - duration);
							return currDiff < prevDiff ? curr : prev;
						}, searchItems[0]);
					} else {
						data = searchItems[0];
					}
				}
			}
		}

		if (data) {
			const lines: LyricLine[] = [];
			let isSynced = false;

			if (data.syncedLyrics) {
				isSynced = true;
				for (const line of data.syncedLyrics.split('\n')) {
					const match = line.match(/^\[(\d+):(\d+\.\d+)\]\s*(.*)$/);
					if (match) {
						const min = parseInt(match[1], 10);
						const sec = parseFloat(match[2]);
						lines.push({
							time_ms: Math.round((min * 60 + sec) * 1000),
							text: match[3] || ''
						});
					}
				}
			} else if (data.plainLyrics) {
				for (const line of data.plainLyrics.split('\n')) {
					lines.push({ text: line });
				}
			}

			if (lines.length > 0) {
				return {
					source: 'LRCLIB',
					synced: isSynced,
					instrumental: !!data.instrumental,
					lines
				};
			}
		}
	} catch (e) {
		console.warn('[LRCLIB fetch error]', e);
	}

	// 4. Try YouTube Music timed lyrics browse if videoId available
	if (videoId && !videoId.startsWith('sp:') && !videoId.startsWith('gdrive:') && !videoId.startsWith('fmhy_')) {
		try {
			const nextData = await post('next', { videoId });
			const tabs = nextData?.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer?.watchNextTabbedResultsRenderer?.tabs;
			const lyricsTab = tabs?.find((t: any) => t.tabRenderer?.title?.runs?.[0]?.text?.toLowerCase().includes('lyric'));
			const browseId = lyricsTab?.tabRenderer?.endpoint?.browseEndpoint?.browseId;

			if (browseId) {
				const browseData = await post('browse', { browseId });
				const lyricsRenderer = browseData?.contents?.sectionListRenderer?.contents?.[0]?.musicDescriptionShelfRenderer;
				const timedRenderer = browseData?.contents?.elementRenderer?.newElement?.type?.componentType?.model?.timedLyricsModel?.timedLyricsData;

				if (Array.isArray(timedRenderer) && timedRenderer.length > 0) {
					const lines: LyricLine[] = timedRenderer.map((l: any) => ({
						time_ms: parseInt(l.cueRange?.startTimeMilliseconds || '0', 10),
						end_time_ms: parseInt(l.cueRange?.endTimeMilliseconds || '0', 10),
						text: l.lyricLine || ''
					}));

					return {
						source: 'YouTube Music',
						synced: true,
						instrumental: false,
						lines
					};
				} else if (lyricsRenderer?.description?.runs) {
					const plainText = lyricsRenderer.description.runs.map((r: any) => r.text).join('');
					const lines: LyricLine[] = plainText.split('\n').map((text: string) => ({ text }));
					return {
						source: 'YouTube Music',
						synced: false,
						instrumental: false,
						lines
					};
				}
			}
		} catch (err) {
			console.warn('[YTM timed lyrics fallback error]', err);
		}
	}

	return null;
}
