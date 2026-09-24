<script lang="ts">
	// High-Performance AI-Powered Search Suggestion & Predictive Autocomplete Component
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
		placeholder = 'Search songs, multiple versions, artists, albums, lyrics...',
		inputClass = '',
		panelClass = 'left-0 right-0',
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
		}, 160);
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
		saveRecentSearch(s.query || s.title);

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

		value = s.query || s.title;
		close();
		onpick?.();

		// Submit the parent form
		if (inputEl && inputEl.form) {
			inputEl.form.requestSubmit();
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

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) {
			e.preventDefault();
			close();
		} else if (e.key === 'Enter') {
			if (active >= 0 && suggestions[active]) {
				e.preventDefault();
				selectSuggestion(suggestions[active]);
			} else {
				if (value.trim()) {
					saveRecentSearch(value.trim());
				}
				close();
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
			// Delay closing slightly so click events on suggestions register on mobile
			setTimeout(() => {
				close();
			}, 180);
		}
	}}
>
	<!-- Search Input Container -->
	<div class="relative flex items-center w-full">
		<div class="absolute left-3.5 flex items-center pointer-events-none text-muted-foreground">
			<HugeiconsIcon icon={Search01Icon} size={18} />
		</div>

		<Input
			bind:ref={inputEl}
			bind:value
			{placeholder}
			class="pl-10 pr-20 h-11 text-xs sm:text-sm rounded-2xl bg-card/60 backdrop-blur-xl border-white/10 hover:border-white/20 focus:border-primary/50 focus:bg-card/90 transition-all shadow-inner {inputClass}"
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
					class="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-muted-foreground hover:bg-white/20 hover:text-foreground transition-colors cursor-pointer"
					title="Clear text"
					aria-label="Clear search text"
				>
					<HugeiconsIcon icon={Cancel01Icon} size={13} />
				</button>
			{:else}
				<kbd
					class="pointer-events-none hidden sm:inline-flex items-center rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[0.625rem] font-semibold text-muted-foreground/80"
				>
					{MOD}K
				</kbd>
			{/if}
		</div>
	</div>

	<!-- Suggestion Dropdown Panel -->
	{#if open}
		<div
			id="search-suggest"
			role="listbox"
			aria-label="Smart AI Search Suggestions"
			class="absolute top-full z-50 mt-2 max-h-[75vh] sm:max-h-[480px] overflow-y-auto rounded-2xl border border-white/12 bg-[#0d101d]/98 text-popover-foreground shadow-2xl backdrop-blur-3xl animate-in fade-in-0 zoom-in-95 duration-150 {panelClass} divide-y divide-white/6"
		>
			<!-- Quick Mood / AI Chips Strip (When input is empty or has room) -->
			{#if !value.trim()}
				<div class="p-3 bg-white/[0.02]">
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
								class="rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-primary/20 hover:border-primary/40 hover:text-primary transition-all active:scale-95"
							>
								{tag.label}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- History Header Bar if history items exist -->
			{#if suggestions.some((s) => s.type === 'history') && !value.trim()}
				<div class="flex items-center justify-between px-3.5 py-2 bg-white/[0.01]">
					<span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
						<HugeiconsIcon icon={Clock01Icon} size={13} />
						Recent Searches
					</span>
					<button
						type="button"
						onmousedown={(e) => e.preventDefault()}
						onclick={handleClearAllHistory}
						class="text-[10px] font-medium text-muted-foreground/80 hover:text-rose-400 transition-colors"
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
					No instant suggestions found. Press Enter to perform full search.
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
								: 'hover:bg-white/8 text-foreground/90'}"
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
										class="h-9 w-9 shrink-0 rounded-xl object-cover ring-1 ring-white/15"
									/>
								{:else if s.type === 'history'}
									<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5 text-muted-foreground">
										<HugeiconsIcon icon={Clock01Icon} size={15} />
									</div>
								{:else if s.type === 'ai_vibe' || s.type === 'version'}
									<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
										<HugeiconsIcon icon={SparklesIcon} size={15} class="animate-pulse" />
									</div>
								{:else if s.type === 'trending'}
									<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
										<HugeiconsIcon icon={FireIcon} size={15} />
									</div>
								{:else if s.type === 'artist'}
									<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
										<HugeiconsIcon icon={UserIcon} size={15} />
									</div>
								{:else}
									<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5 text-muted-foreground">
										<HugeiconsIcon icon={Search01Icon} size={15} />
									</div>
								{/if}

								<!-- Text Details -->
								<div class="min-w-0 flex-1">
									<div class="flex items-center gap-2">
										<span class="truncate text-xs sm:text-sm font-medium {s.type === 'song' ? 'font-semibold text-foreground' : ''}">
											{s.title}
										</span>
										{#if s.badge}
											<span class="shrink-0 rounded-full px-2 py-0.2 text-[9px] font-bold uppercase tracking-wider {s.badge === 'Top Match' ? 'bg-primary/20 text-primary border border-primary/30' : s.badge === 'For You' ? 'bg-purple-500/20 text-purple-300' : 'bg-white/10 text-muted-foreground'}">
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
										class="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:scale-110 active:scale-95 transition-transform"
										title="Play now"
									>
										<HugeiconsIcon icon={PlayIcon} size={13} fill="currentColor" class="ml-0.5" />
									</button>
								{:else if s.type === 'history'}
									<button
										type="button"
										onclick={(e) => handleRemoveHistory(s.query, e)}
										class="opacity-60 hover:opacity-100 p-1 text-muted-foreground hover:text-rose-400 transition-all rounded-full hover:bg-white/10"
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
					class="flex w-full cursor-pointer items-center justify-between border-t border-white/8 bg-white/[0.03] px-4 py-2.5 text-left text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
					onmousedown={(e) => e.preventDefault()}
					onclick={() => {
						if (value.trim()) saveRecentSearch(value.trim());
						close();
						onpick?.();
						inputEl?.form?.requestSubmit();
					}}
				>
					<span class="flex items-center gap-2">
						<HugeiconsIcon icon={Search01Icon} size={14} />
						Search all for "{value.trim()}"
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
