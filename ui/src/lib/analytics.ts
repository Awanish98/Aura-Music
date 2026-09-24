// Privacy-Conscious, Zero-Cookie, Lightweight Analytics for Aura Music
// Compliant with GDPR, CCPA & Respects Do-Not-Track (DNT) headers

interface AnalyticsEvent {
	name: 'page_view' | 'search' | 'play' | 'playlist_create' | 'ai_dj_generate' | 'radio_play' | 'like_song';
	properties?: Record<string, string | number | boolean>;
	timestamp?: number;
}

class PrivacyAnalytics {
	private enabled = true;
	private initialized = false;

	init() {
		if (typeof window === 'undefined' || this.initialized) return;
		this.initialized = true;

		// Respect Do Not Track
		if (navigator.doNotTrack === '1' || (window as any).doNotTrack === '1') {
			this.enabled = false;
			return;
		}

		// Check local storage consent preference if set
		try {
			const pref = localStorage.getItem('aura_analytics_enabled');
			if (pref !== null) {
				this.enabled = pref === 'true';
			}
		} catch {
			// localStorage unavailable
		}
	}

	track(event: AnalyticsEvent['name'], properties?: Record<string, string | number | boolean>) {
		if (!this.enabled || typeof window === 'undefined') return;

		const payload: AnalyticsEvent = {
			name: event,
			properties: {
				...properties,
				path: window.location.pathname,
				referrer: document.referrer ? new URL(document.referrer).hostname : 'direct'
			},
			timestamp: Date.now()
		};

		// Dispatch custom DOM event for custom integrations / telemetry sinks
		window.dispatchEvent(new CustomEvent('aura:telemetry', { detail: payload }));

		// Console debug in development
		if (import.meta.env.DEV) {
			console.debug('[Aura Analytics]', payload.name, payload.properties);
		}
	}

	trackPageView(path?: string) {
		this.track('page_view', { path: path || (typeof window !== 'undefined' ? window.location.pathname : '/') });
	}

	trackSearch(query: string) {
		this.track('search', { query });
	}

	trackPlay(title?: string, artist?: string, id?: string) {
		this.track('play', { title: title || '', artist: artist || '', id: id || '' });
	}

	trackAiDj(prompt: string) {
		this.track('ai_dj_generate', { prompt });
	}

	trackPlaylistCreate(name: string) {
		this.track('playlist_create', { name });
	}

	trackRadioPlay(stationName: string) {
		this.track('radio_play', { station: stationName });
	}

	setEnabled(enabled: boolean) {
		this.enabled = enabled;
		try {
			localStorage.setItem('aura_analytics_enabled', String(enabled));
		} catch {}
	}

	isEnabled() {
		return this.enabled;
	}
}

export const analytics = new PrivacyAnalytics();
