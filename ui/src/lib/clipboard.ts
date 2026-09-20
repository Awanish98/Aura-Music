import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { isTauri } from '$lib/api';

/**
 * Copy plain text to the system clipboard, from Rust or browser.
 */
export async function copyText(text: string): Promise<void> {
	if (isTauri()) {
		await writeText(text);
	} else if (navigator?.clipboard?.writeText) {
		await navigator.clipboard.writeText(text);
	}
}
