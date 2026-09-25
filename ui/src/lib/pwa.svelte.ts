// PWA Installation Manager for Aura Music
import { browser } from '$app/environment';

export const pwa = $state({
	canInstall: false,
	isInstalled: false,
	isIos: false,
	deferredPrompt: null as any,
	showIosGuide: false,
	bannerDismissed: false
});

if (browser) {
	// Register service worker for fast caching, offline playback fallback, and PWA prompt readiness
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('/sw.js').catch((err) => {
			console.warn('[SW Registration Note]', err);
		});
	}

	// Check if already running as standalone PWA
	const isStandalone =
		window.matchMedia('(display-mode: standalone)').matches ||
		(window.navigator as any).standalone === true ||
		document.referrer.includes('android-app://');

	pwa.isInstalled = isStandalone;

	// Check if iOS device
	const userAgent = window.navigator.userAgent.toLowerCase();
	pwa.isIos = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;

	// Check if banner was dismissed in current session
	const dismissed = localStorage.getItem('aura_pwa_dismissed');
	if (dismissed && Date.now() - Number(dismissed) < 86400000 * 3) {
		pwa.bannerDismissed = true;
	}

	window.addEventListener('beforeinstallprompt', (e: Event) => {
		e.preventDefault();
		pwa.deferredPrompt = e;
		pwa.canInstall = true;
	});

	window.addEventListener('appinstalled', () => {
		pwa.isInstalled = true;
		pwa.canInstall = false;
		pwa.deferredPrompt = null;
	});
}

export async function promptInstallApp(): Promise<boolean> {
	if (pwa.isInstalled) return true;

	if (pwa.deferredPrompt) {
		try {
			pwa.deferredPrompt.prompt();
			const choice = await pwa.deferredPrompt.userChoice;
			if (choice.outcome === 'accepted') {
				pwa.isInstalled = true;
				pwa.canInstall = false;
				pwa.deferredPrompt = null;
				return true;
			}
		} catch (err) {
			console.warn('[PWA prompt error]', err);
		}
	} else if (pwa.isIos) {
		pwa.showIosGuide = true;
	}
	return false;
}

export function dismissInstallBanner() {
	pwa.bannerDismissed = true;
	if (browser) {
		localStorage.setItem('aura_pwa_dismissed', String(Date.now()));
	}
}
