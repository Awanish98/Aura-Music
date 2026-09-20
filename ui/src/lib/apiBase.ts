/**
 * Returns the appropriate API base URL based on runtime environment:
 * - Native Android APK (Capacitor) -> https://aura-music-1no9.onrender.com
 * - GitHub Pages -> https://aura-music-1no9.onrender.com
 * - Render / Netlify / Vite Dev -> relative URL with proxy support
 */
export function getApiUrl(path: string): string {
	const cleanPath = path.startsWith('/') ? path : `/${path}`;
	if (typeof window === 'undefined') return cleanPath;

	const isCapacitor =
		!!(window as any).Capacitor ||
		window.location.protocol === 'capacitor:' ||
		window.location.protocol === 'http:' && window.location.hostname === 'localhost' && window.location.port === '' ||
		window.location.protocol === 'file:';

	const isGitHubPages = window.location.hostname.includes('github.io');

	if (isCapacitor || isGitHubPages) {
		return `https://aura-music-1no9.onrender.com${cleanPath}`;
	}

	return cleanPath;
}
