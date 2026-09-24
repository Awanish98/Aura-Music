// Aura Music Smart AI Search, Personalized Suggestion Engine & Autocomplete
import * as api from './api';
import type { SongItem, BrowseItem } from './api';
import { playback } from './player.svelte';
import { getApiUrl } from './apiBase';

export interface SmartSuggestion {
	id: string;
	query: string;
	title: string;
	subtitle?: string;
	type: 'history' | 'ai_vibe' | 'trending' | 'suggest' | 'artist' | 'song' | 'version';
	badge?: string;
	item?: BrowseItem | SongItem;
}

const STORAGE_RECENT_KEY = 'aura_recent_searches';

// Default Curated & Trending Indian / Global Queries
export const TRENDING_SEARCHES = [
	{ query: 'Despacito', label: 'Despacito (Original & Remixes)', category: 'Global Hits' },
	{ query: 'Arijit Singh Best Songs', label: 'Arijit Singh Soulful Melodies', category: 'Bollywood' },
	{ query: 'Diljit Dosanjh Punjabi Hits', label: 'Diljit Dosanjh Chartbusters', category: 'Punjabi' },
	{ query: 'Slowed and Reverb Hindi Songs', label: 'Late Night Slowed & Reverb', category: 'Vibes' },
	{ query: 'AP Dhillon Superhits', label: 'AP Dhillon & Gurinder Gill', category: 'Punjabi' },
	{ query: 'Sidhu Moose Wala All Hits', label: 'Sidhu Moose Wala Classics', category: 'Legends' },
	{ query: 'Lofi Chill Beats Hindi', label: 'Lofi Midnight Study & Chill', category: 'Lofi' },
	{ query: 'Gym Phonk High Energy', label: 'Gym Workout & Phonk Bass', category: 'Energy' },
	{ query: 'Taylor Swift Top Tracks', label: 'Taylor Swift Essentials', category: 'Pop' },
	{ query: 'Karan Aujla New Songs', label: 'Karan Aujla Latest Releases', category: 'Punjabi' },
	{ query: 'Old Hindi 90s Romantic Songs', label: '90s Romantic Golden Hits', category: 'Retro' },
	{ query: 'Coke Studio Pakistan Hits', label: 'Coke Studio Gems (Pasoori, Tu Jhoom)', category: 'Sufi' }
];

export const AI_MOOD_TAGS = [
	{ label: '🔥 Trending Now', query: 'Trending Indian Hits 2026' },
	{ label: '✨ AI Personalized Vibe', query: 'AI Recommended Songs' },
	{ label: '🌙 Late Night Lofi', query: 'Late Night Lofi Slowed' },
	{ label: '⚡ Gym & Phonk', query: 'Gym Workout Bass Phonk' },
	{ label: '💫 Bollywood Love', query: 'Bollywood Romantic Melodies' },
	{ label: '🚗 Highway Long Drive', query: 'Night Drive Acoustic Pop' },
	{ label: '🌧️ Monsoon Melancholy', query: 'Sad Soulful Hindi Acoustic' },
	{ label: '🎉 Party & Dance', query: 'Punjabi Wedding Party Dance Hits' }
];

// --- Recent Search History Management ---
export function getRecentSearches(): string[] {
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem(STORAGE_RECENT_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.slice(0, 10) : [];
	} catch {
		return [];
	}
}

export function saveRecentSearch(query: string): void {
	if (typeof window === 'undefined' || !query || !query.trim()) return;
	const clean = query.trim();
	try {
		const existing = getRecentSearches();
		const updated = [clean, ...existing.filter((q) => q.toLowerCase() !== clean.toLowerCase())].slice(0, 10);
		localStorage.setItem(STORAGE_RECENT_KEY, JSON.stringify(updated));
	} catch {}
}

export function removeRecentSearch(query: string): string[] {
	if (typeof window === 'undefined') return [];
	try {
		const existing = getRecentSearches();
		const updated = existing.filter((q) => q.toLowerCase() !== query.toLowerCase());
		localStorage.setItem(STORAGE_RECENT_KEY, JSON.stringify(updated));
		return updated;
	} catch {
		return [];
	}
}

export function clearRecentSearches(): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.removeItem(STORAGE_RECENT_KEY);
	} catch {}
}

// --- Taste Analysis ("Mere Anusar") ---
export function getPersonalizedAiSuggestions(): SmartSuggestion[] {
	const suggestions: SmartSuggestion[] = [];

	if (typeof window === 'undefined') return suggestions;

	// 1. Check currently playing track context
	const current = playback.now;
	if (current && current.title) {
		const mainArtist = current.artists?.split(/[,&]/)[0]?.trim() || '';
		suggestions.push({
			id: `ai_current_artist_${Date.now()}_1`,
			query: `${mainArtist || current.title} Acoustic & Lofi`,
			title: `More like "${current.title}"`,
			subtitle: `Based on what's playing right now`,
			type: 'ai_vibe',
			badge: 'Current Vibe'
		});
		if (mainArtist) {
			suggestions.push({
				id: `ai_current_artist_${Date.now()}_2`,
				query: `${mainArtist} Best Songs`,
				title: `${mainArtist} Top Releases`,
				subtitle: `Explore artist discography`,
				type: 'artist',
				badge: 'Artist'
			});
		}
	}

	// 2. Extract top artists and songs from user's history
	try {
		const histRaw = localStorage.getItem('history');
		if (histRaw) {
			const hist: SongItem[] = JSON.parse(histRaw);
			if (Array.isArray(hist) && hist.length > 0) {
				const artistCounts = new Map<string, number>();
				for (const s of hist.slice(0, 30)) {
					const arts = (s.artists || '').split(/[,&/]/).map((a) => a.trim()).filter(Boolean);
					for (const a of arts) {
						artistCounts.set(a, (artistCounts.get(a) || 0) + 1);
					}
				}

				const sortedArtists = Array.from(artistCounts.entries())
					.sort((a, b) => b[1] - a[1])
					.map((x) => x[0]);

				if (sortedArtists.length > 0) {
					const topA = sortedArtists[0];
					suggestions.push({
						id: `ai_fav_artist_${topA}`,
						query: `${topA} Live & Unplugged`,
						title: `${topA} • Live & Unplugged`,
						subtitle: `Your most played artist`,
						type: 'ai_vibe',
						badge: 'For You'
					});
				}
				if (sortedArtists.length > 1) {
					const secondA = sortedArtists[1];
					suggestions.push({
						id: `ai_fav_artist_${secondA}`,
						query: `${secondA} Remix & Mashup`,
						title: `${secondA} • Remixes & Mashups`,
						subtitle: `Based on your listening history`,
						type: 'version',
						badge: 'Remix'
					});
				}
			}
		}
	} catch {}

	return suggestions;
}

// --- Real-time AI Query Suggestions & Autocomplete ---
export async function fetchSmartSuggestions(query: string): Promise<SmartSuggestion[]> {
	const clean = (query || '').trim();
	const results: SmartSuggestion[] = [];
	const seenQueries = new Set<string>();

	if (!clean) {
		// 1. Show user's recent searches first
		const recent = getRecentSearches();
		for (const r of recent) {
			if (!seenQueries.has(r.toLowerCase())) {
				seenQueries.add(r.toLowerCase());
				results.push({
					id: `history_${r}`,
					query: r,
					title: r,
					subtitle: 'Recent Search',
					type: 'history'
				});
			}
		}

		// 2. Add personalized "Mere Anusar" AI suggestions
		const personal = getPersonalizedAiSuggestions();
		for (const p of personal) {
			if (!seenQueries.has(p.query.toLowerCase())) {
				seenQueries.add(p.query.toLowerCase());
				results.push(p);
			}
		}

		// 3. Add Top Curated & Trending suggestions
		for (const t of TRENDING_SEARCHES.slice(0, 6)) {
			if (!seenQueries.has(t.query.toLowerCase())) {
				seenQueries.add(t.query.toLowerCase());
				results.push({
					id: `trending_${t.query}`,
					query: t.query,
					title: t.label,
					subtitle: `${t.category} • Trending`,
					type: 'trending',
					badge: 'Trending'
				});
			}
		}

		return results;
	}

	// When user is typing a query:
	// A. AI Smart Query Expansions (e.g. Lofi, Remix, Acoustic, Slowed)
	const smartVariations = [
		{ suffix: 'Lofi Remix', badge: 'Lofi', type: 'version' as const },
		{ suffix: 'Slowed + Reverb', badge: 'Slowed', type: 'version' as const },
		{ suffix: 'Acoustic Cover', badge: 'Acoustic', type: 'version' as const },
		{ suffix: 'Live Concert', badge: 'Live', type: 'ai_vibe' as const }
	];

	// B. Query YouTube Music / Invidious search suggestions
	try {
		const ytmSuggestions = await api.searchSuggest(clean).catch(() => [] as string[]);
		if (Array.isArray(ytmSuggestions)) {
			for (const s of ytmSuggestions.slice(0, 6)) {
				if (s && !seenQueries.has(s.toLowerCase())) {
					seenQueries.add(s.toLowerCase());
					results.push({
						id: `suggest_${s}`,
						query: s,
						title: s,
						subtitle: 'Suggested Search',
						type: 'suggest'
					});
				}
			}
		}
	} catch {}

	// C. Add direct AI query smart expansion variations
	for (const v of smartVariations) {
		const expandedQuery = `${clean} ${v.suffix}`;
		if (!seenQueries.has(expandedQuery.toLowerCase())) {
			seenQueries.add(expandedQuery.toLowerCase());
			results.push({
				id: `ai_exp_${v.suffix}_${clean}`,
				query: expandedQuery,
				title: expandedQuery,
				subtitle: `AI Version Suggestion`,
				type: v.type,
				badge: v.badge
			});
		}
	}

	// D. Fetch quick direct preview match for instant 1-tap playback
	try {
		const previewRes = await api.searchAll(clean).catch(() => null);
		if (previewRes) {
			// Top artist match
			if (previewRes.artists && previewRes.artists.length > 0) {
				const artist = previewRes.artists[0];
				results.unshift({
					id: `artist_match_${artist.id}`,
					query: artist.title,
					title: artist.title,
					subtitle: `Artist • ${artist.subtitle || 'Verified'}`,
					type: 'artist',
					badge: 'Artist',
					item: artist
				});
			}

			// Top song match for 1-tap play
			if (previewRes.songs && previewRes.songs.length > 0) {
				const song = previewRes.songs[0];
				results.unshift({
					id: `song_match_${song.id}`,
					query: song.title,
					title: song.title,
					subtitle: `${song.subtitle || 'Song'} • Direct Match`,
					type: 'song',
					badge: 'Top Match',
					item: song
				});
			}
		}
	} catch {}

	return results.slice(0, 10);
}
