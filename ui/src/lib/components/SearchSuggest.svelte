<script lang="ts">
	// High-Performance AI-Powered Search Suggestion & Predictive Autocomplete Component
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		Search01Icon,
		MusicNote01Icon,
		UserIcon,
		SparklesIcon,
		Clock01Icon,
		Cancel01Icon,
		FireIcon,
		PlayIcon,
		Mic01Icon
	} from '@hugeicons/core-free-icons';
	import { Input } from '$lib/components/ui/input';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import ExplicitIcon from './ExplicitIcon.svelte';
	import ItemMenu from './ItemMenu.svelte';
	import type { BrowseItem, SongItem } from '$lib/api';
	import { openItem, asSong } from '$lib/browse';
	import { playSong, ui } from '$lib/player.svelte';
	import { MOD } from '$lib/shortcuts';
	import { thumb } from '$lib/thumb';
	import { t } from '$lib/i18n.svelte';
	import {
		fetchSmartSuggestions,
		saveRecentSearch,
		removeRecentSearch,
		clearRecentSearches,
		AI_MOOD_TAGS,
		type SmartSuggestion
	} from '$lib/searchAi';

	let {
		value = $bindable(''),
		placeholder = 'Search songs, artists, albums, moods...',
		inputClass = '',
		panelClass = 'left-0 right-0 w-full',
		onpick
	}: {
		value?: string;
		placeholder?: string;
		inputClass?: string;
		panelClass?: string;
		onpick?: () => void;
	} = $props();

	let open = $state(false);
	let suggestions = $state<SmartSuggestion[]>([]);
	let loading = $state(false);
	let active = $state(-1);
	let loadedFor = '';
	let ctxItem = $state<BrowseItem | null>(null);
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	let inputEl = $state<HTMLInputElement | null>(null);

	onMount(() => {
		function onWindowKey(e: KeyboardEvent) {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault();
				inputEl?.focus();
				inputEl?.select();
				open = true;
				loadSuggestions(value);
			}
		}
		window.addEventListener('keydown', onWindowKey);
		return () => {
			window.removeEventListener('keydown', onWindowKey);
		};
	});

	async function loadSuggestions(q: string) {
		loadedFor = q;
		active = -1;
		loading = true;
		try {
			const res = await fetchSmartSuggestions(q);
			if (loadedFor === q) {
				suggestions = res;
			}
		} catch (e) {
			if (loadedFor === q) suggestions = [];
		} finally {
			if (loadedFor === q) loading = false;
		}
	}

	function onType(e: Event & { currentTarget: HTMLInputElement }) {
		clearTimeout(debounceTimer);
		const q = e.currentTarget.value;
		open = true;
		if (q !== loadedFor) {
			loading = true;
		}
		debounceTimer = setTimeout(() => {
			loadSuggestions(q);
		}, 100);
	}

	function onFocus() {
		open = true;
		loadSuggestions(value);
	}

	function close() {
		clearTimeout(debounceTimer);
		open = false;
		loading = false;
		active = -1;
	}

	function selectSuggestion(s: SmartSuggestion, e?: Event) {
		if (e) e.preventDefault();
		const finalQuery = (s.query || s.title || '').trim();
		if (finalQuery) saveRecentSearch(finalQuery);

		if (s.item) {
			if (s.type === 'song') {
				playSong(asSong(s.item as BrowseItem));
				close();
				onpick?.();
				return;
			}
			openItem(s.item as BrowseItem);
			close();
			onpick?.();
			return;
		}

		value = finalQuery;
		close();
		onpick?.();

		if (finalQuery) {
			goto(`/search?q=${encodeURIComponent(finalQuery)}`);
		}
	}

	function handleRemoveHistory(query: string, e: MouseEvent) {
		e.stopPropagation();
		e.preventDefault();
		removeRecentSearch(query);
		suggestions = suggestions.filter((s) => !(s.type === 'history' && s.query.toLowerCase() === query.toLowerCase()));
	}

	function handleClearAllHistory(e: MouseEvent) {
		e.stopPropagation();
		e.preventDefault();
		clearRecentSearches();
		suggestions = suggestions.filter((s) => s.type !== 'history');
	}

	function handleClearInput(e: MouseEvent) {
		e.stopPropagation();
		e.preventDefault();
		value = '';
		inputEl?.focus();
		loadSuggestions('');
	}

	function splitMatch(text: string, q: string): { match: string; rest: string } {
		if (!q || !q.trim()) return { match: '', rest: text };
		const cleanQ = q.trim().toLowerCase();
		const cleanT = text.toLowerCase();
		if (cleanT.startsWith(cleanQ)) {
			return {
				match: text.slice(0, cleanQ.length),
				rest: text.slice(cleanQ.length)
			};
		}
		return { match: '', rest: text };
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) {
			e.preventDefault();
			close();
		} else if (e.key === 'Enter') {
			if (active >= 0 && suggestions[active]) {
				e.preventDefault();
				selectSuggestion(suggestions[active]);
			} else if (value.trim()) {
				e.preventDefault();
				saveRecentSearch(value.trim());
				close();
				onpick?.();
				goto(`/search?q=${encodeURIComponent(value.trim())}`);
			}
		} else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && suggestions.length) {
			e.preventDefault();
			open = true;
			const n = suggestions.length;
			active = e.key === 'ArrowDown' ? (active + 1) % n : (active <= 0 ? n : active) - 1;
		}
	}
</script>

<div
	class="relative w-full min-w-0"
	data-ctx
	onfocusout={(e) => {
		if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
			setTimeout(() => {
				close();
			}, 200);
		}
	}}
>
	<!-- Search Input Container -->
	<div class="relative flex items-center w-full">
		<div class="absolute left-3.5 flex items-center pointer-events-none text-muted-foreground/80">
			<HugeiconsIcon icon={Search01Icon} size={17} />
		</div>

		<Input
			bind:ref={inputEl}
			bind:value
			{placeholder}
			class="pl-10 pr-20 h-10 text-xs sm:text-sm rounded-full bg-white/40 dark:bg-white/6 backdrop-blur-md border border-black/10 dark:border-white/10 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary/60 focus:bg-card/90 transition-all shadow-inner {inputClass}"
			autocomplete="off"
			role="combobox"
			aria-expanded={open}
			aria-controls="search-suggest"
			onfocus={onFocus}
			oninput={onType}
			onkeydown={onKeydown}
		/>

		<!-- Right Quick Actions: Clear Button & Mic/Shortcut -->
		<div class="absolute right-2.5 flex items-center gap-1.5">
			{#if value}
				<button
					type="button"
					onclick={handleClearInput}
					class="flex h-6 w-6 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-muted-foreground hover:bg-black/10 dark:hover:bg-white/20 hover:text-foreground transition-colors cursor-pointer"
					title="Clear text"
					aria-label="Clear search text"
				>
					<HugeiconsIcon icon={Cancel01Icon} size={12} />
				</button>
			{:else}
				<kbd
					class="pointer-events-none hidden sm:inline-flex items-center rounded-full border border-border/50 bg-muted/60 px-2 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground/80"
				>
					{MOD}K
				</kbd>
			{/if}
		</div>
	</div>

	<!-- Suggestion Dropdown Panel (Apple macOS Liquid Glass Style) -->
	{#if open}
		<div
			id="search-suggest"
			role="listbox"
			aria-label="YouTube Smart Search Suggestions"
			class="absolute top-full z-[100] mt-2 max-h-[75vh] sm:max-h-[480px] overflow-y-auto rounded-2xl border border-black/10 dark:border-white/15 bg-white/90 dark:bg-[#0c101c]/95 text-popover-foreground shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-3xl animate-in fade-in-0 zoom-in-95 duration-150 {panelClass} divide-y divide-black/5 dark:divide-white/5"
		>
			<!-- Quick Mood / AI Chips Strip (When input is empty or has room) -->
			{#if !value.trim()}
				<div class="p-3 bg-black/[0.02] dark:bg-white/[0.02]">
					<div class="flex items-center justify-between mb-2">
						<span class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
							<HugeiconsIcon icon={SparklesIcon} size={13} class="text-primary animate-pulse" />
							AI Recommended Moods & Vibes
						</span>
					</div>
					<div class="flex flex-wrap gap-1.5">
						{#each AI_MOOD_TAGS as tag}
							<button
								type="button"
								onmousedown={(e) => e.preventDefault()}
								onclick={() => selectSuggestion({ id: tag.query, query: tag.query, title: tag.label, type: 'ai_vibe' })}
								class="rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-primary/20 hover:border-primary/40 hover:text-primary transition-all active:scale-95 cursor-pointer"
							>
								{tag.label}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- History Header Bar if history items exist -->
			{#if suggestions.some((s) => s.type === 'history') && !value.trim()}
				<div class="flex items-center justify-between px-3.5 py-2 bg-black/[0.01] dark:bg-white/[0.01]">
					<span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
						<HugeiconsIcon icon={Clock01Icon} size={13} />
						Recent Searches
					</span>
					<button
						type="button"
						onmousedown={(e) => e.preventDefault()}
						onclick={handleClearAllHistory}
						class="text-[10px] font-medium text-muted-foreground/80 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
					>
						Clear All
					</button>
				</div>
			{/if}

			<!-- Suggestions List -->
			{#if loading && !suggestions.length}
				<div class="p-3 space-y-2">
					{#each Array(4) as _, i (i)}
						<div class="flex items-center gap-3 px-2 py-1.5">
							<Skeleton class="h-9 w-9 shrink-0 rounded-xl" />
							<div class="min-w-0 flex-1 space-y-1.5">
								<Skeleton class="h-3 w-44 rounded" />
								<Skeleton class="h-2.5 w-24 rounded" />
							</div>
						</div>
					{/each}
				</div>
			{:else if !suggestions.length}
				<div class="px-4 py-4 text-center text-xs text-muted-foreground">
					No instant suggestions found. Press Enter to search on YouTube Music.
				</div>
			{:else}
				<div class="py-1">
					{#each suggestions as s, i (s.id || s.query)}
						{@const isSelected = i === active}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<div
							role="option"
							tabindex="-1"
							aria-selected={isSelected}
							class="group flex w-full cursor-pointer items-center justify-between gap-3 px-3.5 py-2 text-left transition-colors {isSelected
								? 'bg-primary/20 text-foreground'
								: 'hover:bg-black/5 dark:hover:bg-white/8 text-foreground/90'}"
							onmousedown={(e) => e.preventDefault()}
							onmouseenter={() => {
								active = i;
								if (s.item) ctxItem = s.item as BrowseItem;
							}}
							onclick={(e) => selectSuggestion(s, e)}
						>
							<div class="flex items-center gap-3 min-w-0 flex-1">
								<!-- Left Icon / Avatar / Thumbnail -->
								{#if s.item && (s.item as BrowseItem).thumbnail}
									<img
										src={thumb((s.item as BrowseItem).thumbnail!, 120)}
										alt=""
										class="h-9 w-9 shrink-0 rounded-xl object-cover ring-1 ring-black/10 dark:ring-white/15"
									/>
								{:else if s.type === 'history'}
									<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 dark:text-purple-400">
										<HugeiconsIcon icon={Clock01Icon} size={15} />
									</div>
								{:else if s.type === 'ai_vibe' || s.type === 'version'}
									<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
										<HugeiconsIcon icon={SparklesIcon} size={15} class="animate-pulse" />
									</div>
								{:else if s.type === 'trending'}
									<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 dark:text-amber-400">
										<HugeiconsIcon icon={FireIcon} size={15} />
									</div>
								{:else if s.type === 'artist'}
									<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-500 dark:text-indigo-400">
										<HugeiconsIcon icon={UserIcon} size={15} />
									</div>
								{:else}
									<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 text-muted-foreground">
										<HugeiconsIcon icon={Search01Icon} size={15} />
									</div>
								{/if}

								<!-- Text Details with YouTube-style bolding -->
								<div class="min-w-0 flex-1">
									<div class="flex items-center gap-2">
										<div class="truncate text-xs sm:text-sm font-medium">
											{#if (s.type === 'suggest' || s.type === 'history') && value.trim()}
												{@const parts = splitMatch(s.title, value)}
												{#if parts.match}
													<span class="text-muted-foreground font-normal">{parts.match}</span><span class="font-bold text-foreground">{parts.rest}</span>
												{:else}
													<span class="text-foreground/90">{s.title}</span>
												{/if}
											{:else}
												<span class="{s.type === 'song' ? 'font-semibold text-foreground' : 'text-foreground/90'}">{s.title}</span>
											{/if}
										</div>
										{#if s.badge}
											<span class="shrink-0 rounded-full px-2 py-0.2 text-[9px] font-bold uppercase tracking-wider {s.badge === 'Top Match' ? 'bg-primary/20 text-primary border border-primary/30' : s.badge === 'For You' ? 'bg-purple-500/20 text-purple-400' : 'bg-black/5 dark:bg-white/10 text-muted-foreground'}">
												{s.badge}
											</span>
										{/if}
									</div>
									{#if s.subtitle}
										<div class="truncate text-[11px] text-muted-foreground mt-0.5">
											{s.subtitle}
										</div>
									{/if}
								</div>
							</div>

							<!-- Right Side: 1-Tap Play or History Remove Button -->
							<div class="flex items-center gap-1.5 shrink-0">
								{#if s.type === 'song'}
									<button
										type="button"
										onclick={(e) => selectSuggestion(s, e)}
										class="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:scale-110 active:scale-95 transition-transform cursor-pointer"
										title="Play now"
									>
										<HugeiconsIcon icon={PlayIcon} size={13} fill="currentColor" class="ml-0.5" />
									</button>
								{:else if s.type === 'history'}
									<button
										type="button"
										onclick={(e) => handleRemoveHistory(s.query, e)}
										class="opacity-60 hover:opacity-100 p-1 text-muted-foreground hover:text-rose-500 transition-all rounded-full hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
										title="Remove from history"
									>
										<HugeiconsIcon icon={Cancel01Icon} size={13} />
									</button>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}

			<!-- Bottom "All Results" Action -->
			{#if value.trim()}
				<button
					type="button"
					class="flex w-full cursor-pointer items-center justify-between border-t border-black/5 dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.03] px-4 py-2.5 text-left text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
					onmousedown={(e) => e.preventDefault()}
					onclick={() => {
						if (value.trim()) saveRecentSearch(value.trim());
						close();
						onpick?.();
						goto(`/search?q=${encodeURIComponent(value.trim())}`);
					}}
				>
					<span class="flex items-center gap-2">
						<HugeiconsIcon icon={Search01Icon} size={14} />
						Search all YouTube Music for "{value.trim()}"
					</span>
					<span class="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
						Press Enter ↵
					</span>
				</button>
			{/if}
		</div>
	{/if}

	{#if ctxItem}
		<ItemMenu item={ctxItem} triggerClass="hidden" />
	{/if}
</div>
