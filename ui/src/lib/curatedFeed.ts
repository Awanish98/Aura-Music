// Spotify & YouTube Music-Grade Rich Home Feed Engine
import type { BrowseItem, HomeChip, HomePage, HomeSection, SongItem } from './api';
import { fetchSaavnTrendingDirect, searchSaavnDirect } from './saavn';

export const CURATED_CHIPS: HomeChip[] = [
	{ title: 'Relax', params: 'relax' },
	{ title: 'Workout', params: 'workout' },
	{ title: 'Focus', params: 'focus' },
	{ title: 'Energize', params: 'energize' },
	{ title: 'Commute', params: 'commute' },
	{ title: 'Romance', params: 'romance' },
	{ title: 'Party', params: 'party' },
	{ title: 'Sad', params: 'sad' },
	{ title: 'Sleep', params: 'sleep' }
];

// Pre-curated Spotify-style Daily Mixes with high-res artwork
export const CURATED_DAILY_MIXES: BrowseItem[] = [
	{
		kind: 'playlist',
		id: 'daily_mix_01',
		title: 'Daily Mix 01',
		subtitle: 'Arijit Singh, Pritam, Mohit Chauhan',
		thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80',
		artistRuns: [{ text: 'Arijit Singh' }, { text: 'Pritam' }],
		isUpload: false,
		explicit: false
	},
	{
		kind: 'playlist',
		id: 'daily_mix_02',
		title: 'Daily Mix 02',
		subtitle: 'Diljit Dosanjh, Karan Aujla, Shubh',
		thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80',
		artistRuns: [{ text: 'Diljit Dosanjh' }, { text: 'Karan Aujla' }],
		isUpload: false,
		explicit: false
	},
	{
		kind: 'playlist',
		id: 'daily_mix_03',
		title: 'Daily Mix 03',
		subtitle: 'The Weeknd, Taylor Swift, Ed Sheeran',
		thumbnail: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&auto=format&fit=crop&q=80',
		artistRuns: [{ text: 'The Weeknd' }, { text: 'Taylor Swift' }],
		isUpload: false,
		explicit: false
	},
	{
		kind: 'playlist',
		id: 'daily_mix_04',
		title: 'Daily Mix 04',
		subtitle: 'Kishore Kumar, Lata Mangeshkar, R.D. Burman',
		thumbnail: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300&auto=format&fit=crop&q=80',
		artistRuns: [{ text: 'Kishore Kumar' }, { text: 'R.D. Burman' }],
		isUpload: false,
		explicit: false
	},
	{
		kind: 'playlist',
		id: 'daily_mix_05',
		title: 'Daily Mix 05',
		subtitle: 'Lofi Chill, Ambient Beats, Midnight Study',
		thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80',
		artistRuns: [{ text: 'Lofi Girl' }, { text: 'Chillhop' }],
		isUpload: false,
		explicit: false
	}
];

// Pre-curated Artist Radios with colored vinyl portraits
export const CURATED_ARTIST_RADIOS: BrowseItem[] = [
	{
		kind: 'artist',
		id: 'artist_arijit_singh',
		title: 'Arijit Singh Radio',
		subtitle: 'Artist Radio • Romantic & Melodic',
		thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80',
		artistRuns: [{ text: 'Arijit Singh' }],
		isUpload: false,
		explicit: false
	},
	{
		kind: 'artist',
		id: 'artist_diljit_dosanjh',
		title: 'Diljit Dosanjh Radio',
		subtitle: 'Artist Radio • Punjabi & Pop',
		thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&auto=format&fit=crop&q=80',
		artistRuns: [{ text: 'Diljit Dosanjh' }],
		isUpload: false,
		explicit: false
	},
	{
		kind: 'artist',
		id: 'artist_shreya_ghoshal',
		title: 'Shreya Ghoshal Radio',
		subtitle: 'Artist Radio • Soulful Hits',
		thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
		artistRuns: [{ text: 'Shreya Ghoshal' }],
		isUpload: false,
		explicit: false
	},
	{
		kind: 'artist',
		id: 'artist_pritam',
		title: 'Pritam Radio',
		subtitle: 'Artist Radio • Chartbuster Hits',
		thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80',
		artistRuns: [{ text: 'Pritam' }],
		isUpload: false,
		explicit: false
	},
	{
		kind: 'artist',
		id: 'artist_kk',
		title: 'KK Evergreen Radio',
		subtitle: 'Artist Radio • Nostalgic 2000s',
		thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
		artistRuns: [{ text: 'KK' }],
		isUpload: false,
		explicit: false
	},
	{
		kind: 'artist',
		id: 'artist_atif_aslam',
		title: 'Atif Aslam Radio',
		subtitle: 'Artist Radio • Romantic Ballads',
		thumbnail: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
		artistRuns: [{ text: 'Atif Aslam' }],
		isUpload: false,
		explicit: false
	}
];

// Pre-curated Trending Chart Playlists with 300x300 covers
export const CURATED_TOP_CHARTS: BrowseItem[] = [
	{
		kind: 'playlist',
		id: 'saavn_1134543272',
		title: 'Hindi: India Superhits Top 50',
		subtitle: '50 Songs • Bollywood Top 50',
		thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80',
		artistRuns: [{ text: 'JioSaavn' }],
		isUpload: false,
		explicit: false
	},
	{
		kind: 'playlist',
		id: 'saavn_1074543290',
		title: 'Punjabi Top 50',
		subtitle: '50 Songs • Hottest Punjabi Tracks',
		thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&auto=format&fit=crop&q=80',
		artistRuns: [{ text: 'JioSaavn' }],
		isUpload: false,
		explicit: false
	},
	{
		kind: 'playlist',
		id: 'saavn_1084543288',
		title: "Today's Top Global Hits",
		subtitle: '50 Songs • Billboard Hot 100',
		thumbnail: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&auto=format&fit=crop&q=80',
		artistRuns: [{ text: 'Billboard' }],
		isUpload: false,
		explicit: false
	},
	{
		kind: 'playlist',
		id: 'saavn_1094543277',
		title: 'Romantic Rewind 2026',
		subtitle: '50 Songs • Pure Love & Heart',
		thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80',
		artistRuns: [{ text: 'JioSaavn' }],
		isUpload: false,
		explicit: false
	},
	{
		kind: 'playlist',
		id: 'saavn_1104543266',
		title: 'Bollywood Dance & Party Hits',
		subtitle: '50 Songs • High Energy Party',
		thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80',
		artistRuns: [{ text: 'JioSaavn' }],
		isUpload: false,
		explicit: false
	}
];

// Pre-curated Top Trending Songs with 320kbps streams
export const CURATED_TOP_SONGS: SongItem[] = [
	{
		video_id: 'saavn_ishq_de_fanniyar',
		title: 'Ishq de Fanniyar (Female Version)',
		artists: 'Jyotica Tangri, Shaarib Toshi',
		artist_runs: [{ text: 'Jyotica Tangri' }, { text: 'Shaarib Toshi' }],
		album: 'Fukrey Returns',
		thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80',
		duration: '4:15',
		is_video: false,
		is_upload: false,
		explicit: false
	},
	{
		video_id: 'saavn_kesariya',
		title: 'Kesariya',
		artists: 'Arijit Singh, Pritam, Amitabh Bhattacharya',
		artist_runs: [{ text: 'Arijit Singh' }, { text: 'Pritam' }],
		album: 'Brahmāstra',
		thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
		duration: '4:28',
		is_video: false,
		is_upload: false,
		explicit: false
	},
	{
		video_id: 'saavn_dil_ye_bekarar',
		title: 'Dil Ye Bekarar Kyun Hai',
		artists: 'Mohit Chauhan, Shreya Ghoshal, Pritam',
		artist_runs: [{ text: 'Mohit Chauhan' }, { text: 'Shreya Ghoshal' }],
		album: 'Players',
		thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80',
		duration: '4:36',
		is_video: false,
		is_upload: false,
		explicit: false
	},
	{
		video_id: 'saavn_tauba_tauba',
		title: 'Tauba Tauba',
		artists: 'Karan Aujla',
		artist_runs: [{ text: 'Karan Aujla' }],
		album: 'Bad Newz',
		thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&auto=format&fit=crop&q=80',
		duration: '3:27',
		is_video: false,
		is_upload: false,
		explicit: false
	},
	{
		video_id: 'saavn_o_maahi',
		title: 'O Maahi',
		artists: 'Arijit Singh, Pritam',
		artist_runs: [{ text: 'Arijit Singh' }, { text: 'Pritam' }],
		album: 'Dunki',
		thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80',
		duration: '3:53',
		is_video: false,
		is_upload: false,
		explicit: false
	},
	{
		video_id: 'saavn_ve_kamleya',
		title: 'Ve Kamleya',
		artists: 'Arijit Singh, Shreya Ghoshal, Pritam',
		artist_runs: [{ text: 'Arijit Singh' }, { text: 'Shreya Ghoshal' }],
		album: 'Rocky Aur Rani Kii Prem Kahaani',
		thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
		duration: '4:07',
		is_video: false,
		is_upload: false,
		explicit: false
	},
	{
		video_id: 'saavn_blinding_lights',
		title: 'Blinding Lights',
		artists: 'The Weeknd',
		artist_runs: [{ text: 'The Weeknd' }],
		album: 'After Hours',
		thumbnail: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg',
		duration: '3:20',
		is_video: false,
		is_upload: false,
		explicit: false
	},
	{
		video_id: 'saavn_starboy',
		title: 'Starboy (feat. Daft Punk)',
		artists: 'The Weeknd, Daft Punk',
		artist_runs: [{ text: 'The Weeknd' }, { text: 'Daft Punk' }],
		album: 'Starboy',
		thumbnail: 'https://i.ytimg.com/vi/34Na4j8AVgA/hqdefault.jpg',
		duration: '3:50',
		is_video: false,
		is_upload: false,
		explicit: false
	}
];

// Build Complete Rich Home Feed
export async function getRichCuratedHome(filterParam?: string): Promise<HomePage> {
	let liveCharts: BrowseItem[] = [];
	let liveFeatured: BrowseItem[] = [];
	let liveSongs: SongItem[] = [];

	// Fetch fresh trending charts and songs from JioSaavn in parallel
	try {
		const [trendData, songsData] = await Promise.all([
			fetchSaavnTrendingDirect().catch(() => ({ charts: [], featured: [] })),
			searchSaavnDirect(filterParam ? `top ${filterParam} hindi` : 'trending hindi top songs', 1, 20).catch(() => [])
		]);

		if (trendData.charts.length > 0) liveCharts = trendData.charts;
		if (trendData.featured.length > 0) liveFeatured = trendData.featured;
		if (songsData.length > 0) liveSongs = songsData;
	} catch (e) {
		console.warn('[Curated Feed Live Fetch Error]', e);
	}

	const charts = liveCharts.length > 0 ? liveCharts : CURATED_TOP_CHARTS;
	const featured = liveFeatured.length > 0 ? liveFeatured : CURATED_DAILY_MIXES;
	const songs = liveSongs.length > 0 ? liveSongs : CURATED_TOP_SONGS;

	const songBrowseItems: BrowseItem[] = songs.map((s) => ({
		kind: 'song',
		id: s.video_id,
		title: s.title,
		subtitle: s.artists,
		thumbnail: s.thumbnail,
		duration: s.duration,
		artistRuns: s.artist_runs,
		streamUrl: s.streamUrl
	}));

	const sections: HomeSection[] = [
		{
			title: '🔥 Trending & Top Charts',
			items: charts
		},
		{
			title: '🎧 Made For You • Daily Mixes',
			items: featured
		},
		{
			title: '✨ Quick Picks & Top Songs',
			items: songBrowseItems
		},
		{
			title: '📻 Recommended Artist Stations',
			items: CURATED_ARTIST_RADIOS
		}
	];

	return {
		chips: CURATED_CHIPS,
		sections
	};
}

export interface CuratedPlaylistDetails {
	title: string;
	subtitle: string;
	thumbnail: string;
	description: string;
	owned: boolean;
	collaborative: boolean;
	items: SongItem[];
}

// Resolve any curated chart, Daily Mix, or Artist station into a full tracklist
export async function getCuratedPlaylist(playlistId: string): Promise<CuratedPlaylistDetails | null> {
	if (!playlistId) return null;

	// 1. JioSaavn Chart
	if (playlistId.startsWith('saavn_')) {
		const { fetchSaavnPlaylistDetailsDirect } = await import('./saavn');
		const details = await fetchSaavnPlaylistDetailsDirect(playlistId);
		if (details && details.songs && details.songs.length > 0) {
			return {
				title: details.title,
				subtitle: details.subtitle,
				thumbnail: details.thumbnail,
				description: details.description,
				owned: false,
				collaborative: false,
				items: details.songs
			};
		}
	}

	// 2. Daily Mixes
	if (playlistId.startsWith('daily_mix_')) {
		const mix = CURATED_DAILY_MIXES.find((m) => m.id === playlistId);
		const mixNum = playlistId.replace('daily_mix_', '');
		const queryMap: Record<string, { query: string; title: string; subtitle: string; thumb: string; desc: string }> = {
			'01': {
				query: 'Arijit Singh Pritam Mohit Chauhan',
				title: 'Daily Mix 01',
				subtitle: 'Arijit Singh, Pritam, Mohit Chauhan',
				thumb: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80',
				desc: 'A personalized mix of heartfelt Hindi romantic songs and soulful melodies.'
			},
			'02': {
				query: 'Diljit Dosanjh Karan Aujla Shubh',
				title: 'Daily Mix 02',
				subtitle: 'Diljit Dosanjh, Karan Aujla, Shubh',
				thumb: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80',
				desc: 'High energy Punjabi beats, chart toppers, and modern anthems.'
			},
			'03': {
				query: 'The Weeknd Taylor Swift Ed Sheeran',
				title: 'Daily Mix 03',
				subtitle: 'The Weeknd, Taylor Swift, Ed Sheeran',
				thumb: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&auto=format&fit=crop&q=80',
				desc: 'Global chartbusters, synthwave pop, and billboard record-breakers.'
			},
			'04': {
				query: 'Kishore Kumar RD Burman Lata Mangeshkar',
				title: 'Daily Mix 04',
				subtitle: 'Kishore Kumar, Lata Mangeshkar, R.D. Burman',
				thumb: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300&auto=format&fit=crop&q=80',
				desc: 'Golden era Bollywood classics remastered in high fidelity.'
			},
			'05': {
				query: 'Lofi Chillhop Study Beats Relax',
				title: 'Daily Mix 05',
				subtitle: 'Lofi Chill, Ambient Beats, Midnight Study',
				thumb: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80',
				desc: 'Mellow beats, relaxing study vibes, and ambient chillhop.'
			}
		};

		const meta = queryMap[mixNum] || {
			query: 'Arijit Singh Top Songs',
			title: mix?.title || 'Daily Mix',
			subtitle: mix?.subtitle || 'Daily Mix',
			thumb: mix?.thumbnail || CURATED_TOP_SONGS[0].thumbnail || '',
			desc: 'A personalized playlist curated just for you.'
		};

		let songs: SongItem[] = [];
		try {
			songs = await searchSaavnDirect(meta.query, 1, 30);
		} catch {}

		if (songs.length === 0) {
			songs = CURATED_TOP_SONGS;
		}

		return {
			title: meta.title,
			subtitle: meta.subtitle,
			thumbnail: meta.thumb,
			description: meta.desc,
			owned: false,
			collaborative: false,
			items: songs
		};
	}

	// 3. Artist Radios
	if (playlistId.startsWith('artist_')) {
		const artistName = playlistId
			.replace('artist_', '')
			.split('_')
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(' ');

		const radioItem = CURATED_ARTIST_RADIOS.find((r) => r.id === playlistId);
		let songs: SongItem[] = [];
		try {
			songs = await searchSaavnDirect(`${artistName} top songs`, 1, 30);
		} catch {}

		if (songs.length === 0) {
			songs = CURATED_TOP_SONGS.filter((s) => s.artists.toLowerCase().includes(artistName.toLowerCase()));
			if (songs.length === 0) songs = CURATED_TOP_SONGS;
		}

		return {
			title: `${artistName} Radio`,
			subtitle: `Artist Station • ${songs.length} songs`,
			thumbnail: radioItem?.thumbnail || songs[0]?.thumbnail || '',
			description: `Non-stop artist radio featuring top tracks and similar hits from ${artistName}.`,
			owned: false,
			collaborative: false,
			items: songs
		};
	}

	// 4. Curated Top Charts
	if (playlistId.startsWith('curated_chart_')) {
		const chartItem = CURATED_TOP_CHARTS.find((c) => c.id === playlistId);
		const queryMap: Record<string, string> = {
			curated_chart_hindi_50: 'trending hindi top 50 songs',
			curated_chart_punjabi_50: 'punjabi top 50 songs hits',
			curated_chart_global_50: 'global top hits pop english',
			curated_chart_romantic_50: 'romantic hindi arijit singh shreya',
			curated_chart_dance_50: 'bollywood dance party hits'
		};

		const query = queryMap[playlistId] || 'trending top songs';
		let songs: SongItem[] = [];
		try {
			songs = await searchSaavnDirect(query, 1, 30);
		} catch {}

		if (songs.length === 0) {
			songs = CURATED_TOP_SONGS;
		}

		return {
			title: chartItem?.title || 'Top 50 Chart',
			subtitle: chartItem?.subtitle || `Top Chart • ${songs.length} songs`,
			thumbnail: chartItem?.thumbnail || songs[0]?.thumbnail || '',
			description: 'The most played and trending tracks updated daily in high-fidelity audio.',
			owned: false,
			collaborative: false,
			items: songs
		};
	}

	return null;
}

