import { convertFileSrc } from '$lib/api';

const PALETTES: [string, string][] = [
	['#8b5cf6', '#ec4899'], // Violet to Pink
	['#3b82f6', '#06b6d4'], // Blue to Cyan
	['#10b981', '#3b82f6'], // Emerald to Blue
	['#f59e0b', '#ef4444'], // Amber to Red
	['#6366f1', '#a855f7'], // Indigo to Purple
	['#ec4899', '#f43f5e'], // Pink to Rose
	['#14b8a6', '#0ea5e9'], // Teal to Sky
	['#84cc16', '#10b981'], // Lime to Emerald
	['#f97316', '#e11d48'] // Orange to Rose
];

export function getGradientColors(seed: string): [string, string] {
	if (!seed) return PALETTES[0];
	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		hash = (hash << 5) - hash + seed.charCodeAt(i);
		hash |= 0;
	}
	const idx = Math.abs(hash) % PALETTES.length;
	return PALETTES[idx];
}

export function getInitials(name: string): string {
	if (!name) return '♪';
	const clean = name.replace(/[^\w\s]/gi, '').trim();
	const parts = clean.split(/\s+/).filter(Boolean);
	if (parts.length === 0) return '♪';
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function generateAvatarSvg(title: string = 'Aura', kind: string = 'song'): string {
	const [c1, c2] = getGradientColors(title || 'Aura');
	const text = kind === 'artist' ? getInitials(title) : '♪';
	const rx = kind === 'artist' ? '100' : '28';
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
		<defs>
			<linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stop-color="${c1}" />
				<stop offset="100%" stop-color="${c2}" />
			</linearGradient>
			<radialGradient id="glow" cx="50%" cy="50%" r="50%">
				<stop offset="0%" stop-color="#ffffff" stop-opacity="0.28" />
				<stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
			</radialGradient>
		</defs>
		<rect width="200" height="200" rx="${rx}" fill="url(#g)" />
		<circle cx="100" cy="100" r="85" fill="url(#glow)" />
		<text x="50%" y="54%" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="${kind === 'artist' ? '64' : '72'}" font-weight="800" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" opacity="0.95">${text}</text>
	</svg>`;
	return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Rewrite a Google, YouTube, or JioSaavn image URL to the optimal pixel size, with instant SVG fallback.
export function thumb(url: string | undefined | null, px: number = 400, title: string = '', kind: string = 'song'): string {
	if (!url) {
		return generateAvatarSvg(title || 'Aura Music', kind);
	}
	// Local library artwork
	if (url.startsWith('/') || /^[A-Za-z]:[\\/]/.test(url)) return convertFileSrc(url);

	// YouTube CDN high-res image upgrades (i.ytimg.com / ytimg.com)
	if (url.includes('ytimg.com/vi/')) {
		if (px >= 400) {
			// Upgrade standard / default thumbnails to maxresdefault or hq720
			if (url.includes('hqdefault.jpg') || url.includes('mqdefault.jpg') || url.includes('default.jpg') || url.includes('sddefault.jpg')) {
				return url.replace(/\/(hqdefault|mqdefault|default|sddefault)\.jpg/, '/hq720.jpg');
			}
		}
	}

	// Google & YouTube Image resizing (googleusercontent, ggpht, yt3)
	if (/=w\d+-h\d+/.test(url)) {
		return url.replace(/=w\d+-h\d+(-[a-zA-Z0-9_-]+)?/, `=w${px}-h${px}-l90-rj`);
	}
	if (/=s\d+/.test(url)) {
		return url.replace(/=s\d+(-[a-zA-Z0-9_-]+)?/, `=s${px}-l90-rj`);
	}

	// JioSaavn CDN resizing
	if (url.includes('saavncdn.com')) {
		if (px <= 150) return url.replace(/500x500\.jpg/g, '150x150.jpg');
		if (px >= 400) return url.replace(/150x150\.jpg/g, '500x500.jpg');
	}

	return url;
}

