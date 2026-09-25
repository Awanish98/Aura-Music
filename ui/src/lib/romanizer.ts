/**
 * Better Lyrics Romanization & Translation Engine
 * Provides instant transliteration for Japanese (Romaji), Korean (Romaja),
 * Hindi/Devanagari (Latin), and on-demand multilingual translations.
 */

// Korean Hangul Syllable Decomposition
const HANGUL_CHO = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
const HANGUL_JUNG = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
const HANGUL_JONG = ['', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't'];

export function romanizeKorean(text: string): string {
	let out = '';
	for (let i = 0; i < text.length; i++) {
		const code = text.charCodeAt(i);
		if (code >= 0xac00 && code <= 0xd7a3) {
			const syl = code - 0xac00;
			const c = Math.floor(syl / 588);
			const j = Math.floor((syl % 588) / 28);
			const f = syl % 28;
			out += HANGUL_CHO[c] + HANGUL_JUNG[j] + HANGUL_JONG[f];
		} else {
			out += text[i];
		}
	}
	return out;
}

// Japanese Kana to Romaji Map
const KANA_MAP: Record<string, string> = {
	'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
	'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
	'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
	'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
	'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
	'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
	'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
	'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
	'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
	'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
	'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo',
	'キャ': 'kya', 'キュ': 'kyu', 'キョ': 'kyo',
	'シャ': 'sha', 'シュ': 'shu', 'ショ': 'sho',
	'チャ': 'cha', 'チュ': 'chu', 'チョ': 'cho',
	'ニャ': 'nya', 'ニュ': 'nyu', 'ニョ': 'nyo',
	'ヒャ': 'hya', 'ヒュ': 'hyu', 'ヒョ': 'hyo',
	'ミャ': 'mya', 'ミュ': 'myu', 'ミョ': 'myo',
	'リャ': 'rya', 'リュ': 'ryu', 'リョ': 'ryo',
	'ギャ': 'gya', 'ギュ': 'gyu', 'ギョ': 'gyo',
	'ジャ': 'ja', 'ジュ': 'ju', 'ジョ': 'jo',
	'ビャ': 'bya', 'ビュ': 'byu', 'ビョ': 'byo',
	'ピャ': 'pya', 'ピュ': 'pyu', 'ピョ': 'pyo',
	'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
	'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
	'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
	'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
	'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
	'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
	'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
	'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
	'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
	'わ': 'wa', 'を': 'o', 'ん': 'n',
	'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
	'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
	'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
	'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
	'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
	'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
	'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
	'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
	'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
	'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
	'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
	'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
	'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
	'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
	'ワ': 'wa', 'ヲ': 'o', 'ン': 'n',
	'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go',
	'ザ': 'za', 'ジ': 'ji', 'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo',
	'ダ': 'da', 'ヂ': 'ji', 'ヅ': 'zu', 'デ': 'de', 'ド': 'do',
	'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',
	'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po',
	'っ': 't', 'ッ': 't', 'ー': '-'
};

export function romanizeJapanese(text: string): string {
	let out = '';
	let i = 0;
	while (i < text.length) {
		const two = text.slice(i, i + 2);
		if (KANA_MAP[two]) {
			out += KANA_MAP[two];
			i += 2;
			continue;
		}
		const one = text[i];
		if (KANA_MAP[one]) {
			out += KANA_MAP[one];
			i++;
			continue;
		}
		out += one;
		i++;
	}
	return out;
}

// Hindi Devanagari to Latin Map
const DEVANAGARI_MAP: Record<string, string> = {
	'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
	'क': 'ka', 'ख': 'kha', 'ग': 'ga', 'घ': 'gha', 'ङ': 'nga',
	'च': 'cha', 'छ': 'chha', 'ज': 'ja', 'झ': 'jha', 'ञ': 'nya',
	'ट': 'ta', 'ठ': 'tha', 'ड': 'da', 'ढ': 'dha', 'ण': 'na',
	'त': 'ta', 'थ': 'tha', 'द': 'da', 'ध': 'dha', 'न': 'na',
	'प': 'pa', 'फ': 'fa', 'ब': 'ba', 'भ': 'bha', 'म': 'ma',
	'य': 'ya', 'र': 'ra', 'ल': 'la', 'व': 'va',
	'श': 'sha', 'ष': 'sha', 'स': 'sa', 'ह': 'ha',
	'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
	'ं': 'n', 'ँ': 'n', '्': ''
};

export function romanizeDevanagari(text: string): string {
	let out = '';
	for (let i = 0; i < text.length; i++) {
		const char = text[i];
		if (DEVANAGARI_MAP[char]) {
			out += DEVANAGARI_MAP[char];
		} else {
			out += char;
		}
	}
	return out;
}

/**
 * Checks if a string contains non-Latin scripts (Korean, Japanese, Chinese, Devanagari)
 */
export function hasNonLatin(text: string): boolean {
	if (!text) return false;
	// Korean: 0xAC00-0xD7AF, Japanese/Chinese: 0x3040-0x30FF, 0x4E00-0x9FFF, Devanagari: 0x0900-0x097F
	return /[\uAC00-\uD7AF\u3040-\u30FF\u4E00-\u9FFF\u0900-\u097F]/.test(text);
}

/**
 * Unified Romanization for any non-Latin text line
 */
export function romanizeText(text: string): string {
	if (!text || !hasNonLatin(text)) return text;
	let res = text;
	// 1. Korean
	if (/[\uAC00-\uD7AF]/.test(res)) {
		res = romanizeKorean(res);
	}
	// 2. Japanese Kana
	if (/[\u3040-\u30FF]/.test(res)) {
		res = romanizeJapanese(res);
	}
	// 3. Devanagari
	if (/[\u0900-\u097F]/.test(res)) {
		res = romanizeDevanagari(res);
	}
	return res;
}

// Memory cache for translations to prevent repeated network requests
const translationCache = new Map<string, string>();

/**
 * Fetches English translation for a given lyric line using Google's translate endpoint
 */
export async function translateLyricLine(text: string, targetLang: string = 'en'): Promise<string> {
	if (!text || !text.trim()) return '';
	const cacheKey = `${targetLang}:${text.trim()}`;
	if (translationCache.has(cacheKey)) {
		return translationCache.get(cacheKey)!;
	}

	try {
		const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text.trim())}`;
		const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
		if (res.ok) {
			const json = await res.json();
			if (Array.isArray(json) && Array.isArray(json[0])) {
				const translated = json[0].map((chunk: any) => chunk[0] || '').join('');
				if (translated && translated.trim() !== text.trim()) {
					translationCache.set(cacheKey, translated);
					return translated;
				}
			}
		}
	} catch {}

	return '';
}
