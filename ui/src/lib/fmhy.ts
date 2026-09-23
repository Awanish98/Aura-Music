// Curated Music, Podcasts, Radio & Soundscapes from FreeMediaHeckYeah (FMHY Audio Guide: https://fmhy.net/audio)
import type { BrowseItem, HomeSection, SongItem } from './api';
import { getApiUrl } from './apiBase';

export interface FmhyArtist {
	id: string;
	name: string;
	subtitle: string;
	followers: string;
	thumbnail: string;
	genre: string;
	searchQuery: string;
	tags: string[];
}

export interface FmhyMood {
	id: string;
	title: string;
	subtitle: string;
	gradient: string;
	icon: string;
	searchQuery: string;
	tags: string[];
}

export interface FmhyItem {
	id: string;
	title: string;
	subtitle: string;
	category: 'radio' | 'podcast' | 'ambient' | 'soundtrack' | 'chart' | 'tool';
	thumbnail: string;
	description?: string;
	streamUrl?: string;
	videoId?: string;
	searchQuery?: string;
	link?: string;
	tags: string[];
	duration?: string;
}

export const FMHY_TOP_ARTISTS: FmhyArtist[] = [
	{
		id: 'artist_arijit_singh',
		name: 'Arijit Singh',
		subtitle: 'King of Bollywood Romance',
		followers: '48.5M Listeners',
		thumbnail: 'https://c.saavncdn.com/artists/Arijit_Singh_002_20230323062147_500x500.jpg',
		genre: 'Bollywood / Romance',
		searchQuery: 'Arijit Singh Top Songs',
		tags: ['Bollywood', 'Romantic', 'Hindi', 'Melody']
	},
	{
		id: 'artist_shreya_ghoshal',
		name: 'Shreya Ghoshal',
		subtitle: 'Melody Queen of India',
		followers: '32.1M Listeners',
		thumbnail: 'https://c.saavncdn.com/artists/Shreya_Ghoshal_004_20230323062031_500x500.jpg',
		genre: 'Bollywood Melodies',
		searchQuery: 'Shreya Ghoshal Best Songs',
		tags: ['Bollywood', 'Melody', 'Classical', 'Hindi']
	},
	{
		id: 'artist_diljit_dosanjh',
		name: 'Diljit Dosanjh',
		subtitle: 'Global Punjabi Icon & G.O.A.T',
		followers: '28.4M Listeners',
		thumbnail: 'https://c.saavncdn.com/artists/Diljit_Dosanjh_004_20221006184542_500x500.jpg',
		genre: 'Punjabi Pop',
		searchQuery: 'Diljit Dosanjh Top Hits',
		tags: ['Punjabi', 'Bhangra', 'Pop', 'Global']
	},
	{
		id: 'artist_karan_aujla',
		name: 'Karan Aujla',
		subtitle: 'Geetan Di Machine',
		followers: '25.7M Listeners',
		thumbnail: 'https://c.saavncdn.com/artists/Karan_Aujla_002_20220909062335_500x500.jpg',
		genre: 'Punjabi Hip-Hop',
		searchQuery: 'Karan Aujla Latest Hits',
		tags: ['Punjabi', 'Hip-Hop', 'Rap', 'Urban']
	},
	{
		id: 'artist_the_weeknd',
		name: 'The Weeknd',
		subtitle: 'Starboy & Synthpop Legend',
		followers: '115M Listeners',
		thumbnail: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&h=500&fit=crop',
		genre: 'R&B / Synthpop',
		searchQuery: 'The Weeknd Top Hits',
		tags: ['R&B', 'Synthpop', 'Global', 'Pop']
	},
	{
		id: 'artist_taylor_swift',
		name: 'Taylor Swift',
		subtitle: 'The Eras Icon & Pop Queen',
		followers: '110M Listeners',
		thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=500&fit=crop',
		genre: 'Pop / Storyteller',
		searchQuery: 'Taylor Swift Best Songs',
		tags: ['Pop', 'Country', 'Hits', 'Acoustic']
	},
	{
		id: 'artist_anuv_jain',
		name: 'Anuv Jain',
		subtitle: 'Soulful Acoustic & Indie Ballads',
		followers: '14.2M Listeners',
		thumbnail: 'https://c.saavncdn.com/artists/Anuv_Jain_001_20211029141738_500x500.jpg',
		genre: 'Indie Acoustic',
		searchQuery: 'Anuv Jain All Songs',
		tags: ['Indie', 'Acoustic', 'Hindi', 'Chill']
	},
	{
		id: 'artist_atif_aslam',
		name: 'Atif Aslam',
		subtitle: 'Sufi, Rock & Romantic Legend',
		followers: '36.8M Listeners',
		thumbnail: 'https://c.saavncdn.com/artists/Atif_Aslam_002_20221006184542_500x500.jpg',
		genre: 'Romantic / Sufi',
		searchQuery: 'Atif Aslam Superhit Songs',
		tags: ['Romantic', 'Sufi', 'Bollywood', 'Rock']
	},
	{
		id: 'artist_ap_dhillon',
		name: 'AP Dhillon',
		subtitle: 'Brown Munde & Modern Wave',
		followers: '22.3M Listeners',
		thumbnail: 'https://c.saavncdn.com/artists/AP_Dhillon_003_20220909062335_500x500.jpg',
		genre: 'Punjabi Trap',
		searchQuery: 'AP Dhillon All Hits',
		tags: ['Punjabi', 'Trap', 'Party', 'Brown Munde']
	},
	{
		id: 'artist_sidhu_moose_wala',
		name: 'Sidhu Moose Wala',
		subtitle: 'Legendary Pioneer of Desi Rap',
		followers: '35.1M Listeners',
		thumbnail: 'https://c.saavncdn.com/artists/Sidhu_Moose_Wala_004_20220909062335_500x500.jpg',
		genre: 'Punjabi Hip-Hop',
		searchQuery: 'Sidhu Moose Wala Top Tracks',
		tags: ['Punjabi', 'Hip-Hop', 'Rap', 'Legend']
	},
	{
		id: 'artist_pritam',
		name: 'Pritam',
		subtitle: "Bollywood's #1 Melody Director",
		followers: '42.0M Listeners',
		thumbnail: 'https://c.saavncdn.com/artists/Pritam_003_20230323062147_500x500.jpg',
		genre: 'Bollywood Composer',
		searchQuery: 'Pritam Best Bollywood Songs',
		tags: ['Bollywood', 'Composer', 'Soundtracks', 'Hits']
	},
	{
		id: 'artist_billie_eilish',
		name: 'Billie Eilish',
		subtitle: 'Alternative Pop & Dark Melodies',
		followers: '95M Listeners',
		thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&h=500&fit=crop',
		genre: 'Alternative Pop',
		searchQuery: 'Billie Eilish Top Hits',
		tags: ['Alternative', 'Pop', 'Dark Pop', 'Global']
	},
	{
		id: 'artist_drake',
		name: 'Drake',
		subtitle: '6 God & Hip-Hop Titan',
		followers: '88M Listeners',
		thumbnail: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=500&fit=crop',
		genre: 'Hip-Hop / Rap',
		searchQuery: 'Drake Best Hits',
		tags: ['Hip-Hop', 'Rap', 'R&B', 'Global']
	},
	{
		id: 'artist_bruno_mars',
		name: 'Bruno Mars',
		subtitle: 'Funk, Retro Soul & 24K Magic',
		followers: '82M Listeners',
		thumbnail: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=500&fit=crop',
		genre: 'Funk / Pop',
		searchQuery: 'Bruno Mars Top Songs',
		tags: ['Funk', 'Pop', 'Soul', 'Retro']
	},
	{
		id: 'artist_badshah',
		name: 'Badshah',
		subtitle: 'Club & Commercial Rap King',
		followers: '26.5M Listeners',
		thumbnail: 'https://c.saavncdn.com/artists/Badshah_005_20230323062031_500x500.jpg',
		genre: 'Desi Rap',
		searchQuery: 'Badshah Party Anthems',
		tags: ['Rap', 'Party', 'Dance', 'Bollywood']
	},
	{
		id: 'artist_neha_kakkar',
		name: 'Neha Kakkar',
		subtitle: 'Bollywood Party & Dance Queen',
		followers: '30.2M Listeners',
		thumbnail: 'https://c.saavncdn.com/artists/Neha_Kakkar_006_20230323062031_500x500.jpg',
		genre: 'Bollywood Dance',
		searchQuery: 'Neha Kakkar Dance Hits',
		tags: ['Bollywood', 'Dance', 'Party', 'Pop']
	},
	{
		id: 'artist_armaan_malik',
		name: 'Armaan Malik',
		subtitle: 'Prince of Romance & Pop',
		followers: '18.7M Listeners',
		thumbnail: 'https://c.saavncdn.com/artists/Armaan_Malik_004_20230323062031_500x500.jpg',
		genre: 'Pop / Romantic',
		searchQuery: 'Armaan Malik Best Songs',
		tags: ['Romantic', 'Pop', 'Hindi', 'English']
	},
	{
		id: 'artist_darshan_raval',
		name: 'Darshan Raval',
		subtitle: 'Monsoon & Indie Romance',
		followers: '19.5M Listeners',
		thumbnail: 'https://c.saavncdn.com/artists/Darshan_Raval_005_20230323062031_500x500.jpg',
		genre: 'Indie Pop',
		searchQuery: 'Darshan Raval Hits',
		tags: ['Indie', 'Monsoon', 'Romantic', 'Hindi']
	},
	{
		id: 'artist_ed_sheeran',
		name: 'Ed Sheeran',
		subtitle: 'Acoustic Pop & Storytelling',
		followers: '90M Listeners',
		thumbnail: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&h=500&fit=crop',
		genre: 'Acoustic Pop',
		searchQuery: 'Ed Sheeran All Hits',
		tags: ['Acoustic', 'Pop', 'Singer-Songwriter', 'Global']
	},
	{
		id: 'artist_dua_lipa',
		name: 'Dua Lipa',
		subtitle: 'Future Nostalgia & Disco Pop',
		followers: '85M Listeners',
		thumbnail: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&h=500&fit=crop',
		genre: 'Dance Pop',
		searchQuery: 'Dua Lipa Best Hits',
		tags: ['Dance', 'Pop', 'Disco', 'Club']
	}
];

export const FMHY_GENRES_AND_MOODS: FmhyMood[] = [
	{
		id: 'mood_bollywood_romance',
		title: 'Bollywood Romance',
		subtitle: 'Timeless love songs & soulful ballads',
		gradient: 'from-pink-500 via-rose-600 to-red-700',
		icon: '❤️',
		searchQuery: 'Bollywood Romantic Hits All Time',
		tags: ['Romantic', 'Bollywood', 'Love', 'Hindi']
	},
	{
		id: 'mood_punjabi_hype',
		title: 'Punjabi Hype & Dhol',
		subtitle: 'Bhangra beats, high energy & swag',
		gradient: 'from-amber-500 via-orange-600 to-red-600',
		icon: '🔥',
		searchQuery: 'Top Punjabi Party Hits Bhangra',
		tags: ['Punjabi', 'Bhangra', 'Party', 'Energy']
	},
	{
		id: 'mood_chill_lofi',
		title: 'Chill Lo-Fi & Study',
		subtitle: 'Relaxing beats to code and focus',
		gradient: 'from-indigo-600 via-purple-600 to-pink-600',
		icon: '☕',
		searchQuery: 'Lofi Hip Hop Study Beats Relax',
		tags: ['Lofi', 'Study', 'Coding', 'Chill']
	},
	{
		id: 'mood_late_night',
		title: 'Late Night Acoustic',
		subtitle: 'Gentle guitar, rain & midnight vibes',
		gradient: 'from-blue-700 via-indigo-800 to-slate-900',
		icon: '🌙',
		searchQuery: 'Late Night Acoustic Soulful Songs',
		tags: ['Acoustic', 'Night', 'Calm', 'Soul']
	},
	{
		id: 'mood_gym_phonk',
		title: 'Gym & Heavy Phonk',
		subtitle: 'Aggressive workout drive & hard bass',
		gradient: 'from-red-600 via-orange-700 to-zinc-900',
		icon: '⚡',
		searchQuery: 'Gym Workout Motivation Drift Phonk',
		tags: ['Gym', 'Phonk', 'Workout', 'Bass']
	},
	{
		id: 'mood_ghazals_sufi',
		title: 'Sufi & Timeless Ghazals',
		subtitle: 'Soul-stirring poetry & classical ragas',
		gradient: 'from-emerald-700 via-teal-800 to-cyan-900',
		icon: '✨',
		searchQuery: 'Best Ghazals Sufi Music Legends',
		tags: ['Sufi', 'Ghazal', 'Classical', 'Poetry']
	},
	{
		id: 'mood_edm_festival',
		title: 'EDM & Dance Arena',
		subtitle: 'Euphoric drops & festival bangers',
		gradient: 'from-cyan-500 via-blue-600 to-indigo-700',
		icon: '🎧',
		searchQuery: 'Top EDM Festival Hits Dance',
		tags: ['EDM', 'Dance', 'Electro', 'Festival']
	},
	{
		id: 'mood_deep_sleep',
		title: 'Deep Sleep & Ambient',
		subtitle: 'Delta waves, rainstorms & peaceful rest',
		gradient: 'from-slate-800 via-zinc-900 to-black',
		icon: '🌌',
		searchQuery: 'Deep Sleep Ambient Rain Soundscape',
		tags: ['Sleep', 'Ambient', 'Relax', 'Meditation']
	}
];

export const FMHY_RADIO_STATIONS: FmhyItem[] = [
	{
		id: 'fmhy_radio_somafm_groovesalad',
		title: 'SomaFM: Groove Salad',
		subtitle: 'Downtempo & Ambient Chill • SomaFM',
		category: 'radio',
		thumbnail: 'https://somafm.com/img3/groovesalad400.jpg',
		description: 'A nicely chilled plate of ambient / downtempo beats and grooves. Commercial-free 24/7.',
		streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
		tags: ['Chill', 'Ambient', 'Downtempo', 'Electronic'],
		duration: 'LIVE'
	},
	{
		id: 'fmhy_radio_somafm_dronezone',
		title: 'SomaFM: Drone Zone',
		subtitle: 'Atmospheric Ambient Textures • SomaFM',
		category: 'radio',
		thumbnail: 'https://somafm.com/img3/dronezone400.jpg',
		description: 'Served best with headphones. Deep atmospheric ambient and drone soundscapes.',
		streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3',
		tags: ['Ambient', 'Drone', 'Sleep', 'Focus'],
		duration: 'LIVE'
	},
	{
		id: 'fmhy_radio_somafm_secretagent',
		title: 'SomaFM: Secret Agent',
		subtitle: 'Spy & Lounge Soundtracks • SomaFM',
		category: 'radio',
		thumbnail: 'https://somafm.com/img3/secretagent400.jpg',
		description: 'The soundtrack for your stylish, mysterious life. Spy music and vintage lounge.',
		streamUrl: 'https://ice1.somafm.com/secretagent-128-mp3',
		tags: ['Lounge', 'Spy', 'Vintage', 'Retro'],
		duration: 'LIVE'
	},
	{
		id: 'fmhy_radio_somafm_defcon',
		title: 'SomaFM: DEF CON Radio',
		subtitle: 'Music for Hacking • SomaFM',
		category: 'radio',
		thumbnail: 'https://somafm.com/img3/defcon400.jpg',
		description: 'Cyber electronica and glitchy beats for the Year of the Hacker.',
		streamUrl: 'https://ice1.somafm.com/defcon-128-mp3',
		tags: ['Cyber', 'Electronic', 'Glitch', 'Coding'],
		duration: 'LIVE'
	},
	{
		id: 'fmhy_radio_somafm_indiepop',
		title: 'SomaFM: Indie Pop Rocks!',
		subtitle: 'Independent Pop & Alternative • SomaFM',
		category: 'radio',
		thumbnail: 'https://somafm.com/img3/indiepop400.jpg',
		description: 'New and classic favorite indie pop tracks without commercial interruptions.',
		streamUrl: 'https://ice1.somafm.com/indiepop-128-mp3',
		tags: ['Indie', 'Pop', 'Rock', 'Alternative'],
		duration: 'LIVE'
	},
	{
		id: 'fmhy_radio_somafm_lush',
		title: 'SomaFM: Lush',
		subtitle: 'Sensuous Chill Vocals • SomaFM',
		category: 'radio',
		thumbnail: 'https://somafm.com/img3/lush400.jpg',
		description: 'Sensuous and soothing female-fronted dream pop and chillout tracks.',
		streamUrl: 'https://ice1.somafm.com/lush-128-mp3',
		tags: ['Dream Pop', 'Vocal', 'Chillout', 'Acoustic'],
		duration: 'LIVE'
	},
	{
		id: 'fmhy_radio_somafm_spacestation',
		title: 'SomaFM: Space Station Soma',
		subtitle: 'Spaced-out Electronica • SomaFM',
		category: 'radio',
		thumbnail: 'https://somafm.com/img3/spacestation400.jpg',
		description: 'Tune in, turn on, and blast off with spaced-out ambient electronica.',
		streamUrl: 'https://ice1.somafm.com/spacestation-128-mp3',
		tags: ['Space', 'Electronica', 'Ambient', 'Sci-Fi'],
		duration: 'LIVE'
	},
	{
		id: 'fmhy_radio_somafm_suburbsofgoa',
		title: 'SomaFM: Suburbs of Goa',
		subtitle: 'Desi-Influenced Chillout • SomaFM',
		category: 'radio',
		thumbnail: 'https://somafm.com/img3/suburbsofgoa400.jpg',
		description: 'Desi and Asian-influenced ambient grooves, sitar downtempo, and world chill.',
		streamUrl: 'https://ice1.somafm.com/suburbsofgoa-128-mp3',
		tags: ['Desi', 'Goa', 'World', 'Chillout'],
		duration: 'LIVE'
	},
	{
		id: 'fmhy_radio_nightwave_plaza',
		title: 'Nightwave Plaza',
		subtitle: 'Vaporwave Radio 24/7 • plaza.one',
		category: 'radio',
		thumbnail: 'https://plaza.one/img/logo.png',
		description: 'The premier freeform Vaporwave, Future Funk, and Mallsoft internet radio broadcast.',
		streamUrl: 'https://radio.plaza.one/mp3',
		tags: ['Vaporwave', 'Future Funk', 'Synth', 'Aesthetic'],
		duration: 'LIVE'
	},
	{
		id: 'fmhy_radio_lofi_girl',
		title: 'Lofi Girl - Relax & Study Beats',
		subtitle: 'Lofi Hip Hop Radio 24/7 • Lofi Girl',
		category: 'radio',
		thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/maxresdefault.jpg',
		description: 'Peaceful lofi hip hop beats to relax, study, and code to.',
		videoId: 'jfKfPfyJRdk',
		tags: ['Lofi', 'Study', 'Relax', 'Chill'],
		duration: 'LIVE'
	},
	{
		id: 'fmhy_radio_synthwave',
		title: 'Synthwave Radio - Chill / Retro Beats',
		subtitle: 'Retro Electronic & Chillwave • Lofi Girl',
		category: 'radio',
		thumbnail: 'https://i.ytimg.com/vi/4xDzrJKXOOY/maxresdefault.jpg',
		description: 'Retro synthwave and 80s chill electronic beats for deep immersion.',
		videoId: '4xDzrJKXOOY',
		tags: ['Synthwave', 'Retro', 'Cyber', 'Night Drive'],
		duration: 'LIVE'
	},
	{
		id: 'fmhy_radio_chillhop',
		title: 'Chillhop Radio - Jazzy & Lofi Beats',
		subtitle: 'Chillhop Music • 24/7 Stream',
		category: 'radio',
		thumbnail: 'https://i.ytimg.com/vi/5yx6BWlEVcY/maxresdefault.jpg',
		description: 'Cozy jazzy hip hop and soothing lofi beats by the Chillhop community.',
		videoId: '5yx6BWlEVcY',
		tags: ['Chillhop', 'Jazz', 'Beats', 'Coffee'],
		duration: 'LIVE'
	},
	{
		id: 'fmhy_radio_radioparadise_main',
		title: 'Radio Paradise: Main Mix',
		subtitle: 'Eclectic High-Res Rock • RadioParadise',
		category: 'radio',
		thumbnail: 'https://radioparadise.com/graphics/rp_logo_300.png',
		description: 'Commercial-free listener-sponsored high-fidelity eclectic mix of rock, indie, and world music.',
		streamUrl: 'https://stream.radioparadise.com/mp3-192',
		tags: ['Rock', 'Eclectic', 'Indie', 'Acoustic'],
		duration: 'LIVE'
	},
	{
		id: 'fmhy_radio_radioparadise_mellow',
		title: 'Radio Paradise: Mellow Mix',
		subtitle: 'Soft Acoustic & Chill • RadioParadise',
		category: 'radio',
		thumbnail: 'https://radioparadise.com/graphics/rp_logo_300.png',
		description: 'Gentle acoustic ballads, downtempo indie, and soothing mellow grooves.',
		streamUrl: 'https://stream.radioparadise.com/mellow-192',
		tags: ['Mellow', 'Acoustic', 'Chill', 'Relax'],
		duration: 'LIVE'
	},
	{
		id: 'fmhy_radio_radioparadise_rock',
		title: 'Radio Paradise: Rock Mix',
		subtitle: 'Classic & Modern Rock • RadioParadise',
		category: 'radio',
		thumbnail: 'https://radioparadise.com/graphics/rp_logo_300.png',
		description: 'Energizing mix of alternative, classic rock, and modern guitar anthems.',
		streamUrl: 'https://stream.radioparadise.com/rock-192',
		tags: ['Rock', 'Classic Rock', 'Alternative', 'Energy'],
		duration: 'LIVE'
	},
	{
		id: 'fmhy_radio_listen_moe_jpop',
		title: 'LISTEN.moe: J-Pop Radio',
		subtitle: 'Japanese Pop & Anime Songs • LISTEN.moe',
		category: 'radio',
		thumbnail: 'https://listen.moe/public/images/logo.png',
		description: 'Community-driven anime OST, vocaloid, and high-energy J-Pop streams.',
		streamUrl: 'https://listen.moe/stream',
		tags: ['J-Pop', 'Anime', 'Vocaloid', 'Japanese'],
		duration: 'LIVE'
	},
	{
		id: 'fmhy_radio_listen_moe_kpop',
		title: 'LISTEN.moe: K-Pop Radio',
		subtitle: 'Korean Pop Hits • LISTEN.moe',
		category: 'radio',
		thumbnail: 'https://listen.moe/public/images/logo.png',
		description: 'Non-stop Korean Pop hits, girl groups, and chart-topping K-Pop anthems.',
		streamUrl: 'https://listen.moe/kpop/stream',
		tags: ['K-Pop', 'Korean', 'Pop', 'Dance'],
		duration: 'LIVE'
	},
	{
		id: 'fmhy_radio_wqxr_classical',
		title: 'WQXR New York Classical',
		subtitle: 'Classical Masterpieces • WQXR',
		category: 'radio',
		thumbnail: 'https://media.wnyc.org/i/800/0/c/85/1/wqxr_square_logo.png',
		description: 'New York City’s classical music station broadcasting timeless orchestral performances.',
		streamUrl: 'https://stream.wqxr.org/wqxr',
		tags: ['Classical', 'Symphony', 'Piano', 'Orchestra'],
		duration: 'LIVE'
	},
	{
		id: 'fmhy_radio_ambient_sleeping_pill',
		title: 'Ambient Sleeping Pill',
		subtitle: 'Deep Sleep & Ambient Waves • Stereoscenic',
		category: 'radio',
		thumbnail: 'https://ambientsleepingpill.com/asp_logo_sq.png',
		description: 'Carefully curated sleep-inducing drone ambient music without abrupt changes or beats.',
		streamUrl: 'http://radio.stereoscenic.com/asp-h',
		tags: ['Sleep', 'Ambient', 'Drone', 'Night'],
		duration: 'LIVE'
	},
	{
		id: 'fmhy_radio_bollywood_retro',
		title: 'Bollywood 90s & 2000s Retro Radio',
		subtitle: 'Golden Era Hindi Classics 24/7',
		category: 'radio',
		thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
		description: 'Kumar Sanu, Alka Yagnik, Udit Narayan, Sonu Nigam & AR Rahman golden era hits.',
		searchQuery: '90s Hindi Romantic Songs Live Radio',
		tags: ['Bollywood', '90s', 'Retro', 'Hindi'],
		duration: 'LIVE'
	},
	{
		id: 'fmhy_radio_punjabi_hits',
		title: 'Desi Punjabi Non-Stop Radio',
		subtitle: 'Bhangra, Dhol & Urban Punjabi 24/7',
		category: 'radio',
		thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
		description: 'Continuous non-stop Punjabi hits, energetic remixes, and urban bass.',
		searchQuery: 'Punjabi Songs 24/7 Live Stream Hits',
		tags: ['Punjabi', 'Bhangra', 'Dance', 'Desi'],
		duration: 'LIVE'
	},
	{
		id: 'fmhy_radio_bbc_radio1',
		title: 'BBC Radio 1 Dance & Anthems',
		subtitle: 'UK Global Hits & Electronic • BBC',
		category: 'radio',
		thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
		description: 'The worlds biggest pop hits, club anthems, and live DJ sets from London.',
		searchQuery: 'BBC Radio 1 Dance Live Stream',
		tags: ['BBC', 'Pop', 'Dance', 'UK'],
		duration: 'LIVE'
	}
];

export const FMHY_PODCASTS: FmhyItem[] = [
	{
		id: 'fmhy_pod_darknet_diaries',
		title: 'Darknet Diaries',
		subtitle: 'Jack Rhysider • Cyber & Hacker Stories',
		category: 'podcast',
		thumbnail: 'https://darknetdiaries.com/images/darknet-diaries-logo-500.png',
		description: 'True stories from the dark side of the internet. Hackers, breaches, shadow operations, and state-sponsored espionage.',
		searchQuery: 'Darknet Diaries Jack Rhysider',
		tags: ['Cybersecurity', 'Tech', 'True Crime', 'Hacking']
	},
	{
		id: 'fmhy_pod_lex_fridman',
		title: 'Lex Fridman Podcast',
		subtitle: 'Lex Fridman • AI, Science & History',
		category: 'podcast',
		thumbnail: 'https://lexfridman.com/wordpress/wp-content/uploads/2021/04/lex_fridman_podcast_logo_large.jpg',
		description: 'Conversations about AI, science, technology, history, philosophy, and the general nature of intelligence and consciousness.',
		searchQuery: 'Lex Fridman Podcast full episode',
		tags: ['AI', 'Tech', 'Science', 'Philosophy']
	},
	{
		id: 'fmhy_pod_huberman_lab',
		title: 'Huberman Lab',
		subtitle: 'Dr. Andrew Huberman • Neuroscience & Health',
		category: 'podcast',
		thumbnail: 'https://hubermanlab.com/wp-content/uploads/2021/10/Huberman-Lab-Podcast-Artwork.jpg',
		description: 'Science-based tools for everyday life discussed by neurobiologist Dr. Andrew Huberman.',
		searchQuery: 'Huberman Lab Podcast full episode',
		tags: ['Health', 'Neuroscience', 'Biology', 'Fitness']
	},
	{
		id: 'fmhy_pod_waveform',
		title: 'Waveform: The MKBHD Podcast',
		subtitle: 'Marques Brownlee • Gadgets & Tech',
		category: 'podcast',
		thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts125/v4/bf/25/74/bf257451-b847-f542-a0b5-e659b87fcfda/mza_10825318182749767228.jpg/600x600bb.jpg',
		description: 'Deep dives into consumer technology, electric cars, smartphones, gadgets, and tech industry news with MKBHD.',
		searchQuery: 'Waveform MKBHD Podcast episode',
		tags: ['Tech', 'Gadgets', 'Smartphones', 'Reviews']
	},
	{
		id: 'fmhy_pod_song_exploder',
		title: 'Song Exploder',
		subtitle: 'Hrishikesh Hirway • Music Breakdown',
		category: 'podcast',
		thumbnail: 'https://songexploder.net/wp-content/uploads/2019/07/Song-Exploder-Square-Logo.jpg',
		description: 'Musicians take apart their songs piece by piece and tell the story of how they were made.',
		searchQuery: 'Song Exploder Podcast episode',
		tags: ['Music', 'Creation', 'Artists', 'Breakdown']
	},
	{
		id: 'fmhy_pod_hardcore_history',
		title: 'Dan Carlin’s Hardcore History',
		subtitle: 'Dan Carlin • Epic Historical Sagas',
		category: 'podcast',
		thumbnail: 'https://www.dancarlin.com/wp-content/uploads/2017/04/HH-Show-Image.jpg',
		description: 'Journalistic, cinematic explorations of the most dramatic and cataclysmic moments in human history.',
		searchQuery: 'Dan Carlin Hardcore History episode',
		tags: ['History', 'War', 'Drama', 'Storytelling']
	},
	{
		id: 'fmhy_pod_dissect',
		title: 'Dissect: Serialized Music Deep Dive',
		subtitle: 'Cole Cuchna • Album Analysis',
		category: 'podcast',
		thumbnail: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts115/v4/4a/1c/9c/4a1c9c0b-1934-58b2-5f85-3e5be156e522/mza_16698944510065969562.jpg/600x600bb.jpg',
		description: 'Meticulously breaking down classic modern albums line by line, beat by beat.',
		searchQuery: 'Dissect Podcast Cole Cuchna album',
		tags: ['Music', 'Hip Hop', 'Analysis', 'Albums']
	},
	{
		id: 'fmhy_pod_radiolab',
		title: 'Radiolab',
		subtitle: 'WNYC Studios • Science & Human Stories',
		category: 'podcast',
		thumbnail: 'https://media.wnyc.org/i/800/0/c/85/1/Radiolab_Podcast_Image.png',
		description: 'Investigating strange questions and mysteries where science, philosophy, and human experience collide.',
		searchQuery: 'Radiolab Podcast WNYC episode',
		tags: ['Science', 'Mysteries', 'Humanity', 'Documentary']
	}
];

export const FMHY_SOUNDSCAPES: FmhyItem[] = [
	{
		id: 'fmhy_sound_rainy_mood',
		title: 'Rainy Mood & Gentle Thunder',
		subtitle: 'Relaxing Rainstorm Soundscape',
		category: 'ambient',
		thumbnail: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&h=600&fit=crop',
		description: 'High-definition soothing rain on window with distant rolling thunder for calm sleep and study.',
		searchQuery: 'Rainy Mood Gentle Rain Thunderstorm 8 hours',
		tags: ['Rain', 'Sleep', 'Thunder', 'Study']
	},
	{
		id: 'fmhy_sound_deep_space',
		title: 'Cosmic Deep Space & Starship Drones',
		subtitle: 'Deep Sleep & Sci-Fi Meditation',
		category: 'ambient',
		thumbnail: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&h=600&fit=crop',
		description: 'Low-frequency celestial interstellar drones and soft spacecraft engine rumble.',
		searchQuery: 'Deep Space Drone Sleep Ambient Interstellar 8 hours',
		tags: ['Space', 'Sci-Fi', 'Drone', 'Meditation']
	},
	{
		id: 'fmhy_sound_alpha_binaural',
		title: 'Binaural 432Hz Alpha Focus Waves',
		subtitle: 'Cognitive Flow State & Coding Beats',
		category: 'ambient',
		thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=600&fit=crop',
		description: 'Pure 432Hz harmonic tuning and alpha binaural pulses designed for uninterrupted deep concentration.',
		searchQuery: '432Hz Alpha Waves Study Focus Flow State',
		tags: ['Focus', 'Coding', 'Binaural', 'Brainwaves']
	},
	{
		id: 'fmhy_sound_cozy_coffee',
		title: 'Cozy Rainy Cafe & Coffee Shop',
		subtitle: 'Background Cafe Murmur & Jazz',
		category: 'ambient',
		thumbnail: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=600&fit=crop',
		description: 'Warm cafe ambiance, gentle espresso machine clinking, raindrops against glass, and soft jazz.',
		searchQuery: 'Cozy Coffee Shop Ambiance Rain Jazz Study',
		tags: ['Cafe', 'Rain', 'Warm', 'Acoustic']
	},
	{
		id: 'fmhy_sound_night_ocean',
		title: 'Night Ocean Waves & Coastal Breeze',
		subtitle: 'Calming Shoreline Surf',
		category: 'ambient',
		thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=600&fit=crop',
		description: 'Continuous gentle ocean tide breaking softly under moonlight on a quiet beach.',
		searchQuery: 'Ocean Waves Relaxing Sleep Beach Sounds at Night',
		tags: ['Ocean', 'Waves', 'Nature', 'Sleep']
	},
	{
		id: 'fmhy_sound_fireplace_piano',
		title: 'Crackling Fireplace & Soft Solo Piano',
		subtitle: 'Peaceful Hearth Ambiance',
		category: 'ambient',
		thumbnail: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=600&fit=crop',
		description: 'Warm wood fire crackle coupled with melancholic, serene piano melodies.',
		searchQuery: 'Cozy Fireplace and Soft Piano Music for Relaxation',
		tags: ['Piano', 'Fireplace', 'Cozy', 'Acoustic']
	}
];

export const FMHY_GAME_SOUNDTRACKS: FmhyItem[] = [
	{
		id: 'fmhy_ost_persona5',
		title: 'Persona 5 Royal OST',
		subtitle: 'Shoji Meguro • Acid Jazz & Rock',
		category: 'soundtrack',
		thumbnail: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&h=600&fit=crop',
		description: 'Incomparable blend of acid jazz, funk, rock, and pop from ATLUS masterpiece Persona 5.',
		searchQuery: 'Persona 5 Royal Original Soundtrack Full OST',
		tags: ['Persona 5', 'Acid Jazz', 'Anime', 'VGM']
	},
	{
		id: 'fmhy_ost_zelda_botw',
		title: 'The Legend of Zelda: Breath of the Wild',
		subtitle: 'Manaka Kataoka • Atmospheric Piano & Folk',
		category: 'soundtrack',
		thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&h=600&fit=crop',
		description: 'Minimalist, expressive piano phrases and grandiose orchestrations of Hyrule.',
		searchQuery: 'Zelda Breath of the Wild Complete OST Full',
		tags: ['Zelda', 'Nintendo', 'Piano', 'Adventure']
	},
	{
		id: 'fmhy_ost_minecraft',
		title: 'Minecraft: Volume Alpha & Beta',
		subtitle: 'C418 • Iconic Ambient Electronic',
		category: 'soundtrack',
		thumbnail: 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=600&h=600&fit=crop',
		description: 'Nostalgic, peaceful, and sublime ambient music composed by Daniel Rosenfeld (C418).',
		searchQuery: 'Minecraft Soundtrack C418 Volume Alpha Beta Full',
		tags: ['Minecraft', 'C418', 'Nostalgia', 'Chill']
	},
	{
		id: 'fmhy_ost_cyberpunk2077',
		title: 'Cyberpunk 2077: Official Soundtrack',
		subtitle: 'Marcin Przybyłowicz • Industrial Cyber Synth',
		category: 'soundtrack',
		thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=600&fit=crop',
		description: 'Aggressive industrial synths, distortion, and Night City cybernetic electronic score.',
		searchQuery: 'Cyberpunk 2077 Official Score Full OST',
		tags: ['Cyberpunk', 'Industrial', 'Synth', 'Electronic']
	},
	{
		id: 'fmhy_ost_hollow_knight',
		title: 'Hollow Knight: Original Soundtrack',
		subtitle: 'Christopher Larkin • Haunting Orchestral',
		category: 'soundtrack',
		thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&h=600&fit=crop',
		description: 'Soul-stirring melancholy string quartets, dark piano, and brass from the ruined Hallownest.',
		searchQuery: 'Hollow Knight Original Soundtrack Christopher Larkin Full',
		tags: ['Hollow Knight', 'Orchestral', 'Indie', 'Strings']
	},
	{
		id: 'fmhy_ost_ghibli_symphony',
		title: 'Studio Ghibli Symphonic Collection',
		subtitle: 'Joe Hisaishi • Grand Symphony Orchestra',
		category: 'soundtrack',
		thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&h=600&fit=crop',
		description: 'Breathtaking orchestral arrangements from Spirited Away, Princess Mononoke, and Howl’s Moving Castle.',
		searchQuery: 'Joe Hisaishi Studio Ghibli Best Selection Symphony',
		tags: ['Ghibli', 'Joe Hisaishi', 'Anime', 'Symphony']
	},
	{
		id: 'fmhy_ost_undertale',
		title: 'Undertale Soundtrack',
		subtitle: 'Toby Fox • Chiptune & Leitmotif Masterpiece',
		category: 'soundtrack',
		thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=600&fit=crop',
		description: 'Full 101-track emotional retro chiptune and piano suite from Toby Fox.',
		searchQuery: 'Undertale Full OST Toby Fox Complete',
		tags: ['Undertale', 'Chiptune', 'Retro', 'Indie']
	},
	{
		id: 'fmhy_ost_nier_automata',
		title: 'NieR: Automata Original Soundtrack',
		subtitle: 'Keiichi Okabe • Futuristic Choral & Strings',
		category: 'soundtrack',
		thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=600&fit=crop',
		description: 'Haunting invented-language vocals, acoustic guitars, and futuristic battle orchestration.',
		searchQuery: 'NieR Automata Original Soundtrack Full OST',
		tags: ['NieR', 'Choral', 'Strings', 'Square Enix']
	}
];

export const FMHY_CHARTS: FmhyItem[] = [
	{
		id: 'fmhy_chart_spotify_tth',
		title: 'Today’s Top Hits',
		subtitle: 'Spotify • 50 Biggest Global Tracks',
		category: 'chart',
		thumbnail: 'https://i.scdn.co/image/ab67706f00000002b8d0092323a65c26b3a0e719',
		description: 'The definitive daily selection of the hottest pop, hip hop, and electronic hits worldwide.',
		link: 'spotify:playlist:37i9dQZF1DXcBWIGoYBM5M',
		tags: ['Pop', 'Top 50', 'Global', 'Hits']
	},
	{
		id: 'fmhy_chart_spotify_global50',
		title: 'Global Top 50',
		subtitle: 'Spotify Charts • Daily Most Streamed',
		category: 'chart',
		thumbnail: 'https://charts-images.scdn.co/assets/locale_en/regional/daily/region_global_default.jpg',
		description: 'Your daily update of the most played tracks right now across the planet.',
		link: 'spotify:playlist:37i9dQZEVXbMDoHDwVN2tF',
		tags: ['Charts', 'Top 50', 'Daily', 'Global']
	},
	{
		id: 'fmhy_chart_spotify_viral50',
		title: 'Viral 50 - Global',
		subtitle: 'Spotify Charts • Trending & Discovery',
		category: 'chart',
		thumbnail: 'https://charts-images.scdn.co/assets/locale_en/viral/daily/region_global_default.jpg',
		description: 'The most viral tracks spreading across social media and communities today.',
		link: 'spotify:playlist:37i9dQZEVXbLiRSasKsNU9',
		tags: ['Viral', 'Trending', 'Discover', 'Global']
	},
	{
		id: 'fmhy_chart_spotify_hindi',
		title: 'Hot Hits Hindi',
		subtitle: 'Spotify • Bollywood & Indie Pop',
		category: 'chart',
		thumbnail: 'https://i.scdn.co/image/ab67706f0000000282b0e9d0d9ab6a7a0b3f7f89',
		description: 'The biggest Bollywood chartbusters, romantic singles, and Indian pop sensations.',
		link: 'spotify:playlist:37i9dQZF1DX0XUfTFmZeeg',
		tags: ['Hindi', 'Bollywood', 'Desi', 'Pop']
	},
	{
		id: 'fmhy_chart_spotify_punjabi',
		title: 'Punjabi 101',
		subtitle: 'Spotify • Ultimate Punjabi Hits',
		category: 'chart',
		thumbnail: 'https://i.scdn.co/image/ab67706f000000026e632b0c6819eb79fa5d677d',
		description: 'The ultimate Punjabi anthems from Sidhu Moose Wala, Karan Aujla, AP Dhillon, and Diljit Dosanjh.',
		link: 'spotify:playlist:37i9dQZF1DX5cZuAhlNjGz',
		tags: ['Punjabi', 'Desi', 'Hip Hop', 'Party']
	},
	{
		id: 'fmhy_chart_spotify_billboard',
		title: 'Billboard Hot 100',
		subtitle: 'Billboard • Top 100 US Singles',
		category: 'chart',
		thumbnail: 'https://i.scdn.co/image/ab67706f000000026e479815038ec30113cfca82',
		description: 'The week’s most popular songs across all genres, ranked by radio airplay, sales, and streaming activity.',
		link: 'spotify:playlist:6UeSakyzhiEt4NB3Un6q4r',
		tags: ['Billboard', 'Hot 100', 'USA', 'Charts']
	}
];

export const FMHY_DISCOVERY_TOOLS: FmhyItem[] = [
	{
		id: 'fmhy_tool_everynoise',
		title: 'Every Noise at Once',
		subtitle: 'Map of 6,000+ Music Genres',
		category: 'tool',
		thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=600&fit=crop',
		description: 'An algorithmically-generated, readable scatter-plot map of the musical genre-space.',
		link: 'https://everynoise.com/',
		tags: ['Genres', 'Map', 'Discovery', 'Algorithm']
	},
	{
		id: 'fmhy_tool_chosic',
		title: 'Chosic Music Matcher',
		subtitle: 'Find Similar Songs & Playlists',
		category: 'tool',
		thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=600&fit=crop',
		description: 'Find similar songs by mood, tempo, energy, and acoustic attributes.',
		link: 'https://www.chosic.com/',
		tags: ['Similar Songs', 'Recommendations', 'Mood']
	},
	{
		id: 'fmhy_tool_rateyourmusic',
		title: 'RateYourMusic Charts',
		subtitle: 'Largest Community Music Database',
		category: 'tool',
		thumbnail: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=600&h=600&fit=crop',
		description: 'Discover albums and EPs rated by hundreds of thousands of passionate music critics and fans.',
		link: 'https://rateyourmusic.com/charts/',
		tags: ['Reviews', 'Ratings', 'Charts', 'Database']
	},
	{
		id: 'fmhy_tool_musicforprogramming',
		title: 'Music For Programming',
		subtitle: 'Curated 60+ Tracks for Deep Focus',
		category: 'tool',
		thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=600&fit=crop',
		description: 'A series of mixes intended for listening while coding to enhance focus and reduce distractions.',
		link: 'https://musicforprogramming.net/',
		tags: ['Coding', 'Focus', 'Electronic', 'Downtempo']
	}
];

export const ALL_FMHY_ITEMS = [
	...FMHY_RADIO_STATIONS,
	...FMHY_PODCASTS,
	...FMHY_SOUNDSCAPES,
	...FMHY_GAME_SOUNDTRACKS,
	...FMHY_CHARTS,
	...FMHY_DISCOVERY_TOOLS
];

export function findFmhyItem(id: string): FmhyItem | undefined {
	return ALL_FMHY_ITEMS.find((item) => item.id === id || item.videoId === id || item.link === id);
}

export function convertFmhyToBrowseItem(item: FmhyItem): BrowseItem {
	let kind: 'song' | 'playlist' | 'album' | 'artist' = 'song';
	let id = item.id;

	if (item.category === 'chart') {
		kind = 'playlist';
		if (item.link) id = item.link;
	} else if (item.category === 'soundtrack') {
		kind = 'playlist';
	} else if (item.category === 'podcast') {
		kind = 'song';
	}

	return {
		kind,
		id,
		title: item.title,
		subtitle: item.subtitle,
		thumbnail: item.thumbnail,
		duration: item.duration || 'FMHY',
		artistRuns: [{ text: item.category.toUpperCase() }],
		isUpload: false,
		explicit: false
	};
}

export function convertFmhyToSongItem(item: FmhyItem): SongItem {
	return {
		video_id: item.videoId || item.id,
		title: item.title,
		artists: item.subtitle,
		artist_runs: [{ text: item.category.toUpperCase() }],
		album: 'FMHY Audio',
		duration: item.duration || 'LIVE',
		thumbnail: item.thumbnail,
		is_video: !!item.videoId,
		is_upload: false,
		explicit: false,
		...(item.streamUrl ? { streamUrl: item.streamUrl } : {}),
		...(item.searchQuery ? { searchQuery: item.searchQuery } : {})
	} as SongItem;
}

import { searchSaavnDirect, fetchSaavnTrendingDirect, fetchSaavnPlaylistDirect } from './saavn';

export async function fetchSaavnSearch(query: string): Promise<SongItem[]> {
	if (!query) return [];
	try {
		const results = await searchSaavnDirect(query);
		if (results.length > 0) return results;
	} catch (e) {
		console.warn('[fetchSaavnSearch error]', e);
	}
	return [];
}

let cachedTrending: { charts: BrowseItem[]; featured: BrowseItem[] } | null = null;

export async function fetchSaavnTrending(): Promise<{ charts: BrowseItem[]; featured: BrowseItem[] }> {
	if (cachedTrending && cachedTrending.charts.length > 0) {
		return cachedTrending;
	}
	try {
		const trending = await fetchSaavnTrendingDirect();
		if (trending.charts.length > 0) {
			cachedTrending = trending;
			return cachedTrending;
		}
	} catch (e) {
		console.warn('[fetchSaavnTrending error]', e);
	}
	return { charts: [], featured: [] };
}

export async function fetchSaavnPlaylist(playlistId: string): Promise<SongItem[]> {
	try {
		const songs = await fetchSaavnPlaylistDirect(playlistId);
		if (songs.length > 0) return songs;
	} catch (e) {
		console.warn('[fetchSaavnPlaylist error]', e);
	}
	return [];
}

export function getFmhyHomeSections(): HomeSection[] {
	return [
		{
			title: '📻 FMHY Curated Live Radios',
			items: FMHY_RADIO_STATIONS.slice(0, 10).map(convertFmhyToBrowseItem)
		},
		{
			title: '🎙️ Popular FMHY Podcasts',
			items: FMHY_PODCASTS.slice(0, 8).map(convertFmhyToBrowseItem)
		},
		{
			title: '🌊 Ambient Soundscapes & Deep Sleep',
			items: FMHY_SOUNDSCAPES.slice(0, 6).map(convertFmhyToBrowseItem)
		},
		{
			title: '🎮 Legendary Game & Anime Soundtracks',
			items: FMHY_GAME_SOUNDTRACKS.slice(0, 8).map(convertFmhyToBrowseItem)
		},
		{
			title: '✨ Global Top Charts (Spotify & Billboard)',
			items: FMHY_CHARTS.slice(0, 6).map(convertFmhyToBrowseItem)
		}
	];
}

