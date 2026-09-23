<script lang="ts">
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import {
        PlayIcon,
        MoreVerticalIcon,
        ShuffleIcon,
        PlayListAddIcon,
        Radio02Icon,
        ArrowUpNarrowWideIcon,
        ArrowDownWideNarrowIcon,
        DashboardSquare02Icon,
        Share08Icon,
        BookmarkAdd02Icon,
        BookmarkCheck02Icon,
    } from "@hugeicons/core-free-icons";
    import TrackRow from "$lib/components/TrackRow.svelte";
    import TrackSelectionBar from "$lib/components/TrackSelectionBar.svelte";
    import TrackSelectButton from "$lib/components/TrackSelectButton.svelte";
    import { trackSelection } from "$lib/selection.svelte";
    import TrackFilter, {
        filterTracks,
    } from "$lib/components/TrackFilter.svelte";
    import TrackRowSkeleton from "$lib/components/TrackRowSkeleton.svelte";
    import Shelf from "$lib/components/Shelf.svelte";
    import ErrorState from "$lib/components/ErrorState.svelte";
    import ArtistLine from "$lib/components/ArtistLine.svelte";
    import ExplicitIcon from "$lib/components/ExplicitIcon.svelte";
    import { Skeleton } from "$lib/components/ui/skeleton";
    import * as api from "$lib/api";
    import type { AlbumPage, BrowseItem } from "$lib/api";
    import {
        addPick,
        openShare,
        auth,
        enqueue,
        isSaved,
        playback,
        openAddManyToPlaylist,
        playFrom,
        startRadio,
        toast,
        noteLibrary,
        toggleSaved,
    } from "$lib/player.svelte";
    import { getCached, putCached } from "$lib/pagecache";
    import { thumb } from "$lib/thumb";
    import { anchorMenu, fitMenu, NO_ANCHOR, toBody } from "$lib/menu";
    import { t } from "$lib/i18n.svelte";

    let album = $state<AlbumPage | null>(null);
    let loading = $state(true);
    let error = $state<string | null>(null);
    let expanded = $state(false);
    // ⋯ options menu, `fixed` and anchored under the button so the header can't clip it.
    let menuOpen = $state(false);
    let anchor = $state(NO_ANCHOR);

    function openMenu(e: MouseEvent) {
        anchor = anchorMenu(e);
        menuOpen = true;
    }
    // Header filter box: matches title / artist / album.
    let query = $state("");

    const id = $derived(page.params.id ?? "");
    // The rows actually on screen. Identical to `album.items` with no query typed.
    const shown = $derived(filterTracks(album?.items ?? [], query));
    const selection = trackSelection(() => album?.items ?? [], () => shown, () => `${auth.epoch}:${id}`);
    // A local album has no YouTube playlist behind it: nothing to save or add to a playlist.
    // Playing, shuffling and Shortcuts all work exactly the same.
    const isLocal = $derived(api.isLocalId(id));
    const nowId = $derived(playback.now?.videoId);

    async function load(aid: string) {
        const key = `album:${aid}`;
        const hit = getCached<AlbumPage>(key);
        if (hit) {
            album = hit;
            loading = false;
        } else {
            loading = true;
            album = null;
        }
        error = null;
        expanded = false;
        query = "";
        try {
            const fresh = await api.getAlbum(aid);
            if (aid !== id) return; // superseded by navigation — drop the stale response
            album = fresh;
            putCached(key, fresh);
        } catch (e) {
            if (aid !== id) return;
            if (!hit) error = String(e);
        } finally {
            if (aid === id) loading = false;
        }
    }

    $effect(() => {
        if (id) load(id);
    });

    // A local track deleted off disk vanishes from the open page too, header count included: the
    // page is rebuilt from SQLite (already pruned) rather than patched, so nothing can go stale.
    // An album whose last file is gone has no page left to show — step back to the library.
    $effect(() => {
        const un = api.onLocalChanged(async (removed) => {
            const a = album;
            if (!isLocal || !a) return;
            const gone = new Set(removed);
            const items = a.items.filter((i) => !gone.has(i.video_id));
            if (items.length === a.items.length) return; // not this album
            a.items = items; // the row goes now; the refetch below repairs the header counts
            await load(id);
            if (!album?.items.length) goto("/library?tab=local");
        });
        return () => un.then((f) => f());
    });

    // This album as a card, for the sidebar's last-played sort and the Shortcuts grid.
    const asItem = (): BrowseItem => ({
        // A local artist opens this route too — it stays an artist on the Shortcuts grid, so the
        // tile keeps its circle (see browse.ts `hrefFor`).
        kind: id.startsWith(api.LOCAL_ARTIST_PREFIX) ? "artist" : "album",
        id,
        title: album?.title ?? "Album",
        subtitle: album?.artist,
        thumbnail: album?.thumbnail,
        // Recently played keeps this object as the card it draws, so without the flag an album
        // played from its own page would lose the mark it has everywhere else.
        explicit: album?.explicit,
    });

    // `start` indexes the rows on screen, which a filter narrows. The queue is always the whole
    // album: the search box finds a track, it doesn't decide what plays after it, so playing a
    // match has to leave the same queue behind as scrolling to that row would.
    function playAll(start: number | null) {
        if (!album) return;
        const at = start === null ? null : album.items.indexOf(shown[start]);
        playFrom(asItem(), album.items, at === -1 ? null : at, album.playlistId);
    }
    function radio() {
        if (!album?.playlistId) return;
        menuOpen = false;
        startRadio("playlist", album.playlistId, album.title);
    }
    function shuffle() {
        if (!album?.items.length) return;
        menuOpen = false;
        // Real order + shuffle flag — the backend shuffles (fresh each time, restorable).
        playFrom(asItem(), album.items, null, album.playlistId, true);
    }
    // Saved on YouTube (signed in) or on this machine (signed out, and anything saved before the
    // user ever signed in). The button reads both, so a local save can't show as "Save to library"
    // while its tile sits in the library.
    const savedHere = $derived(isSaved(id));
    const inLibrary = $derived((album?.inLibrary ?? false) || savedHere);

    // Signed in, saving an album is a "like" on its audio playlist: optimistic, the button flips now
    // and reverts if YouTube rejects it (mutating `album` updates the page cache, which holds this
    // same object). Signed out there is nobody to tell, so it goes in the local library instead.
    let savingLibrary = $state(false);
    async function toggleLibrary() {
        const a = album;
        if (!a || savingLibrary) return;
        const next = !inLibrary;
        if (!auth.account?.signedIn || !a.playlistId) {
            toggleSaved(asItem());
            toast.success(next ? t('library.saved_to_library') : t('toasts.removed_from_library'));
            return;
        }
        // Signed in: YouTube owns it from here. The local row is kept in step rather than dropped,
        // so a card's ⋯ menu elsewhere shows the album as being in the library (and it still renders
        // offline); `noteLibrary` flags it synced, so nothing offers a local-only removal.
        if (a.inLibrary === next) {
            noteLibrary(asItem(), next);
            toast.success(next ? t('library.saved_to_library') : t('toasts.removed_from_library'));
            return; // YouTube already agrees; only the local row had to move
        }
        a.inLibrary = next;
        savingLibrary = true;
        try {
            await api.setAlbumSaved(a.playlistId, next);
            noteLibrary(asItem(), next);
            toast.success(next ? t('library.saved_to_library') : t('toasts.removed_from_library'));
        } catch (e) {
            a.inLibrary = !next;
            toast.error(String(e));
        } finally {
            savingLibrary = false;
        }
    }

    function queue(next: boolean) {
        if (!album?.items.length) return;
        menuOpen = false;
        enqueue(album.items, next, album.title, album.continuation);
    }

    function saveToPlaylist() {
        if (!album?.items.length) return;
        menuOpen = false;
        openAddManyToPlaylist(album.items);
    }

    // A shelf's "See all" opens the same grid route the artist page uses.
    function showMore(s: { title: string; moreBrowseId?: string; moreParams?: string }) {
        const q = new URLSearchParams({ id: s.moreBrowseId!, title: s.title });
        if (s.moreParams) q.set("params", s.moreParams);
        goto(`/list?${q.toString()}`);
    }
</script>

{#if loading}
    <div class="flex flex-col gap-5 p-6 pt-10">
        <div class="flex items-end gap-5">
            <Skeleton class="h-28 w-28 shrink-0 rounded-xl" />
            <div class="flex-1 space-y-3">
                <Skeleton class="h-3 w-16 rounded" />
                <Skeleton class="h-10 w-1/2 rounded-lg" />
                <Skeleton class="h-4 w-40 rounded" />
            </div>
        </div>
        <div class="flex gap-3">
            <Skeleton class="h-11 w-28 rounded-full" />
            <Skeleton class="h-11 w-28 rounded-full" />
        </div>
    </div>
    <div class="p-6 pt-2">
        {#each Array(8) as _, i (i)}
            <TrackRowSkeleton hideThumb />
        {/each}
    </div>
{:else if error}
    <div class="p-6"><ErrorState message={error} onRetry={() => load(id)} /></div>
{:else if album}
    <!-- Header with the blurred album cover as a hero backdrop -->
    <div class="content-in relative overflow-hidden">
        {#if album.thumbnail}
            <img
                src={thumb(album.thumbnail, 120)}
                alt=""
                class="absolute inset-0 h-full w-full art-wash scale-125 object-cover opacity-40 blur-3xl"
            />
        {/if}
        <div
            class="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30"
        ></div>

        <div class="absolute right-6 top-6 z-10 hidden sm:block">
            <TrackFilter bind:value={query} placeholder={t("common.search_this_album")} />
        </div>

        <div class="relative flex flex-col gap-6 p-6 pt-10 sm:p-8 md:p-10">
            <div class="flex flex-col sm:flex-row items-center sm:items-end gap-6 md:gap-8">
                {#if album.thumbnail}
                    <div class="relative group shrink-0">
                        <div class="absolute -inset-2 bg-gradient-to-r from-primary/30 to-purple-600/30 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-500"></div>
                        <img
                            src={thumb(album.thumbnail, 500)}
                            alt={album.title ?? "Album"}
                            class="relative w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56 rounded-2xl object-cover shadow-2xl ring-1 ring-white/15"
                        />
                    </div>
                {:else}
                    <div
                        class="w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56 shrink-0 rounded-2xl bg-muted flex items-center justify-center ring-1 ring-white/10"
                    >
                        <span class="text-4xl">🎵</span>
                    </div>
                {/if}

                <div class="min-w-0 flex-1 text-center sm:text-left">
                    <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <span class="rounded-full bg-primary/15 border border-primary/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                            {album.subtitle ?? "Album"}
                        </span>
                        <span class="rounded-full bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                            Lossless 320kbps
                        </span>
                    </div>

                    <h1
                        class="mt-2.5 font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-md text-foreground"
                    >
                        {album.title ?? "Album"}
                    </h1>

                    <div
                        class="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-x-2.5 gap-y-1.5 text-sm text-muted-foreground font-medium"
                    >
                        {#if album.explicit}
                            <ExplicitIcon class="h-4 w-4 shrink-0 text-red-400" />
                        {/if}
                        {#if album.artist}
                            <span
                                class="flex items-center gap-2 font-semibold text-foreground"
                            >
                                {#if album.artistThumbnail}
                                    <img
                                        src={album.artistThumbnail}
                                        alt=""
                                        class="h-6 w-6 rounded-full object-cover ring-1 ring-white/20"
                                    />
                                {/if}
                                <ArtistLine
                                    runs={album.artistRuns}
                                    text={album.artist}
                                />
                            </span>
                        {/if}
                        {#if album.secondSubtitle}
                            <span class="text-muted-foreground/40">•</span>
                            <span>{album.secondSubtitle}</span>
                        {/if}
                        {#if album.items.length > 0}
                            <span class="text-muted-foreground/40">•</span>
                            <span>{album.items.length} {album.items.length === 1 ? 'track' : 'tracks'}</span>
                        {/if}
                    </div>
                </div>
            </div>

            {#if album.description}
                <div class="max-w-3xl">
                    <p
                        class="text-sm leading-relaxed text-foreground/85 {expanded
                            ? ''
                            : 'line-clamp-2'}"
                    >
                        {album.description}
                    </p>
                    <button
                        class="mt-1 cursor-pointer text-xs font-semibold uppercase text-primary hover:underline"
                        onclick={() => (expanded = !expanded)}
                    >
                        {expanded ? t("common.less") : t("common.more")}
                    </button>
                </div>
            {/if}

            <!-- Action Controls -->
            <div class="relative flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
                <button
                    class="flex cursor-pointer items-center gap-2.5 rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/30 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
                    onclick={() => playAll(null)}
                    disabled={!album.items.length}
                >
                    <HugeiconsIcon icon={PlayIcon} class="h-5 w-5 fill-current" /> {t("player.play")}
                </button>
                <button
                    class="flex cursor-pointer items-center gap-2 rounded-full border border-border/70 bg-card/60 backdrop-blur-md px-6 py-3 text-sm font-semibold transition-all hover:bg-card hover:border-foreground/30 active:scale-95 disabled:opacity-50"
                    onclick={shuffle}
                    disabled={!album.items.length}
                >
                    <HugeiconsIcon icon={ShuffleIcon} class="h-4 w-4" /> {t("common.shuffle")}
                </button>

                {#if !isLocal}
                    <button
                        class="flex cursor-pointer items-center gap-2 rounded-full border border-border/70 bg-card/60 backdrop-blur-md px-5 py-3 text-sm font-semibold transition-all hover:bg-card active:scale-95 disabled:opacity-50 {inLibrary ? 'border-primary text-primary bg-primary/10' : ''}"
                        onclick={toggleLibrary}
                        disabled={savingLibrary}
                    >
                        <HugeiconsIcon
                            icon={BookmarkAdd02Icon}
                            altIcon={BookmarkCheck02Icon}
                            showAlt={inLibrary}
                            class="h-4 w-4"
                        />
                        {inLibrary ? t("library.in_library") : t("library.save_to_library")}
                    </button>
                {/if}

                <TrackSelectButton
                    {selection}
                    class="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border/70 bg-card/60 backdrop-blur-md transition-all hover:bg-card hover:text-foreground active:scale-95"
                />

                <button
                    class="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border/70 bg-card/60 backdrop-blur-md text-muted-foreground transition-all hover:bg-card hover:text-foreground active:scale-95"
                    onclick={openMenu}
                    aria-label={t("a11y.more_options")}
                >
                    <HugeiconsIcon icon={MoreVerticalIcon} class="h-5 w-5" />
                </button>

                {#if menuOpen}
                    <!-- Moved to <body>: the header clips its overflow, and a menu opened from the
                         bottom of it would be cut off. -->
                    <button
                        class="fixed inset-0 z-40 cursor-default"
                        onclick={() => (menuOpen = false)}
                        oncontextmenu={(e) => {
                            e.preventDefault();
                            menuOpen = false;
                        }}
                        aria-label={t("a11y.close_menu")}
                        {@attach toBody}
                    ></button>
                    <div
                        class="fixed z-50 min-w-48 animate-in rounded-lg border bg-popover p-1 text-popover-foreground shadow-xl duration-150 fade-in-0 zoom-in-95"
                        style={anchor.style}
                        {@attach toBody}
                        {@attach fitMenu(anchor)}
                    >
                        <button
                            class="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent/10"
                            onclick={() => queue(true)}
                        >
                            <HugeiconsIcon
                                icon={ArrowUpNarrowWideIcon}
                                class="h-4 w-4"
                            /> {t("player.play_next")}
                        </button>
                        <button
                            class="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent/10"
                            onclick={() => queue(false)}
                        >
                            <HugeiconsIcon
                                icon={ArrowDownWideNarrowIcon}
                                class="h-4 w-4"
                            /> {t("player.add_to_queue")}
                        </button>
                        <!-- The album's audio playlist is what a radio seeds from; an album page
                             without one (rare) has nothing to ask YouTube for. -->
                        {#if !isLocal && album.playlistId}
                            <button
                                class="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent/10"
                                onclick={radio}
                            >
                                <HugeiconsIcon
                                    icon={Radio02Icon}
                                    class="h-4 w-4"
                                /> {t("player.start_radio")}
                            </button>
                        {/if}
                        {#if !isLocal}
                            <button
                                class="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent/10"
                                onclick={saveToPlaylist}
                            >
                                <HugeiconsIcon
                                    icon={PlayListAddIcon}
                                    class="h-4 w-4"
                                /> {t("player.save_to_playlist")}
                            </button>
                        {/if}
                        <button
                            class="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent/10"
                            onclick={() => {
                                menuOpen = false;
                                addPick(asItem());
                            }}
                        >
                            <HugeiconsIcon
                                icon={DashboardSquare02Icon}
                                class="h-4 w-4"
                            /> {t("home.add_shortcut")}
                        </button>
                        {#if !isLocal}
                            <button
                                class="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent/10"
                                onclick={() => {
                                    menuOpen = false;
                                    openShare(asItem());
                                }}
                            >
                                <HugeiconsIcon
                                    icon={Share08Icon}
                                    class="h-4 w-4"
                                /> {t("player.share")}
                            </button>
                        {/if}
                    </div>
                {/if}
            </div>
        </div>
    </div>

    <!-- Numbered track list -->
    <div class="content-in p-6 pt-2">
        <TrackSelectionBar {selection} from={album.title} />
        {#each shown as item, i (JSON.stringify([item.video_id, i]))}
            <TrackRow
                song={{ ...item, thumbnail: item.thumbnail || album.thumbnail }}
                {selection}
                selectionKey={selection.visibleKeys[i]}
                index={i}
                showPlayCount
                active={item.video_id === nowId}
                onplay={() => playAll(i)}
                onAdd={isLocal ? undefined : () => openAddManyToPlaylist([item])}
            />
        {:else}
            <p class="p-4 text-sm text-muted-foreground">
                {query.trim()
                    ? t("library.no_matching_tracks", { query: query.trim() })
                    : t("library.empty_album")}
            </p>
        {/each}
    </div>

    <!-- Other versions of this release, and what sits near it. Ruled off from the tracks so the
         page reads as the album first and its surroundings second. -->
    {#if album.sections?.length}
        <div class="content-in mt-2 flex flex-col gap-8 border-t px-6 pb-8 pt-8">
            {#each album.sections as section, i (i + ":" + section.title)}
                <Shelf
                    title={section.title}
                    items={section.items}
                    headingClass="font-heading text-xl font-bold"
                    onMore={section.moreBrowseId
                        ? () => showMore(section)
                        : undefined}
                />
            {/each}
        </div>
    {/if}
{/if}
