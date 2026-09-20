<script lang="ts">
	import { tick } from 'svelte';
	import { fade, scale, fly } from 'svelte/transition';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		AiMagicIcon,
		PlayIcon,
		Queue01Icon,
		SentIcon,
		Cancel01Icon,
		MusicNote01Icon,
		SparklesIcon,
		Refresh03Icon,
		Delete02Icon,
		Mic01Icon
	} from '@hugeicons/core-free-icons';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { aiAgent, type AiMessage } from '$lib/aiAgent';
	import { playback, toast } from '$lib/player.svelte';
	import * as api from '$lib/api';
	import type { SongItem } from '$lib/api';
	import { thumb } from '$lib/thumb';

	let { open = $bindable(false) }: { open: boolean } = $props();

	let inputPrompt = $state('');
	let loading = $state(false);
	let messages = $state<AiMessage[]>([
		{
			id: 'welcome',
			role: 'assistant',
			content:
				"Hey! I'm Aura AI, your smart personal music DJ and curator. Ask me to create custom mixes, discover songs by mood, explain lyrics meaning, or match the energy of what you're listening to.",
			timestamp: Date.now()
		}
	]);

	let chatContainer: HTMLElement | undefined = $state();

	const quickPrompts = [
		'🚀 High-energy workout mix',
		'🌧️ Late night Bollywood rain melodies',
		'☕ 24/7 Lofi chill for focus',
		'✨ Match the vibe of current song',
		'💡 Explain story & meaning of current song'
	];

	async function sendMessage(text?: string) {
		const prompt = (text ?? inputPrompt).trim();
		if (!prompt || loading) return;

		inputPrompt = '';

		const userMsg: AiMessage = {
			id: `user_${Date.now()}`,
			role: 'user',
			content: prompt,
			timestamp: Date.now()
		};

		messages = [...messages, userMsg];
		loading = true;
		scrollToBottom();

		try {
			const currentSong = playback.now
				? ({
						id: playback.now.videoId,
						video_id: playback.now.videoId,
						title: playback.now.title,
						artists: playback.now.artists,
						thumbnail: playback.now.thumbnail,
						duration: playback.now.duration
					} as SongItem)
				: null;

			const history = messages.map((m) => ({
				role: m.role as 'user' | 'assistant',
				content: m.content
			}));

			const aiResponse = await aiAgent.chat(prompt, { currentSong, history });
			messages = [...messages, aiResponse];
		} catch (err: any) {
			messages = [
				...messages,
				{
					id: `err_${Date.now()}`,
					role: 'assistant',
					content: 'Sorry, I ran into an issue connecting to the AI DJ. Please try again in a moment.',
					timestamp: Date.now()
				}
			];
		} finally {
			loading = false;
			scrollToBottom();
		}
	}

	function scrollToBottom() {
		tick().then(() => {
			if (chatContainer) {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}
		});
	}

	function playSong(song: SongItem) {
		api.play(song);
		toast.success(`Playing "${song.title}"`);
	}

	function playAllTracks(tracks?: SongItem[]) {
		if (!tracks || tracks.length === 0) return;
		api.playPlaylist(tracks, 0, undefined, 'Aura AI Mix', false);
		toast.success(`Playing AI Mix (${tracks.length} songs)`);
		open = false;
	}

	function queueAllTracks(tracks?: SongItem[]) {
		if (!tracks || tracks.length === 0) return;
		api.addToQueue(tracks);
		toast.success(`Added ${tracks.length} songs to queue`);
	}

	function clearHistory() {
		messages = [
			{
				id: 'welcome',
				role: 'assistant',
				content: "History cleared! What music vibe would you like to explore next?",
				timestamp: Date.now()
			}
		];
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-2xl max-h-[85vh] h-[650px] flex flex-col p-0 gap-0 overflow-hidden border-border/80 bg-background/95 backdrop-blur-2xl shadow-2xl rounded-3xl">
		<!-- Header -->
		<div class="relative flex shrink-0 items-center justify-between border-b border-border/60 bg-gradient-to-r from-primary/15 via-purple-500/10 to-transparent px-6 py-4">
			<div class="flex items-center gap-3">
				<div class="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-purple-600 text-primary-foreground shadow-lg shadow-primary/25">
					<HugeiconsIcon icon={AiMagicIcon} class="h-5 w-5 animate-pulse" />
				</div>
				<div>
					<div class="flex items-center gap-2">
						<h2 class="text-base font-bold tracking-tight text-foreground">Aura AI DJ & Music Agent</h2>
						<span class="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/30">
							<HugeiconsIcon icon={SparklesIcon} class="h-3 w-3" /> Smart DJ
						</span>
					</div>
					<p class="text-xs text-muted-foreground">Ask anything • Generate custom mixes • Lyrics stories</p>
				</div>
			</div>

			<div class="flex items-center gap-1">
				<Button
					variant="ghost"
					size="icon-sm"
					class="text-muted-foreground hover:text-foreground"
					onclick={clearHistory}
					title="Clear conversation"
				>
					<HugeiconsIcon icon={Delete02Icon} class="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon-sm"
					class="text-muted-foreground hover:text-foreground"
					onclick={() => (open = false)}
				>
					<HugeiconsIcon icon={Cancel01Icon} class="h-4 w-4" />
				</Button>
			</div>
		</div>

		<!-- Chat Message Area -->
		<div
			bind:this={chatContainer}
			class="min-h-0 flex-1 overflow-y-auto p-4 md:p-6 space-y-4"
		>
			{#each messages as msg (msg.id)}
				<div
					in:fade={{ duration: 150 }}
					class="flex flex-col {msg.role === 'user' ? 'items-end' : 'items-start'}"
				>
					<div
						class="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm {msg.role ===
						'user'
							? 'bg-primary text-primary-foreground rounded-br-none'
							: 'bg-card/70 border border-border/60 text-foreground backdrop-blur-md rounded-bl-none'}"
					>
						<p class="whitespace-pre-wrap">{msg.content}</p>

						<!-- Embedded Song Recommendations -->
						{#if msg.tracks && msg.tracks.length > 0}
							<div class="mt-3.5 space-y-2 border-t border-border/40 pt-3">
								<div class="flex items-center justify-between gap-2 mb-2">
									<span class="text-xs font-semibold text-primary tracking-wide uppercase">
										Recommended Mix ({msg.tracks.length} tracks)
									</span>
									<div class="flex items-center gap-1.5">
										<Button
											variant="default"
											size="xs"
											onclick={() => playAllTracks(msg.tracks)}
											class="h-7 text-xs gap-1 rounded-lg shadow-sm"
										>
											<HugeiconsIcon icon={PlayIcon} class="h-3 w-3 fill-current" />
											Play Mix
										</Button>
										<Button
											variant="secondary"
											size="xs"
											onclick={() => queueAllTracks(msg.tracks)}
											class="h-7 text-xs gap-1 rounded-lg"
										>
											<HugeiconsIcon icon={Queue01Icon} class="h-3 w-3" />
											Queue All
										</Button>
									</div>
								</div>

								<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
									{#each msg.tracks as track}
										<div
											role="button"
											tabindex="0"
											onclick={() => playSong(track)}
											onkeydown={(e) => e.key === 'Enter' && playSong(track)}
											class="group flex items-center gap-2.5 rounded-xl border border-border/40 bg-background/50 p-2 text-left transition-colors hover:bg-muted/70 cursor-pointer"
										>
											<div class="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
												<img
													src={thumb(track.thumbnail, 96)}
													alt=""
													class="h-full w-full object-cover"
												/>
												<div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
													<HugeiconsIcon icon={PlayIcon} class="h-4 w-4 fill-white text-white" />
												</div>
											</div>
											<div class="min-w-0 flex-1">
												<div class="truncate text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
													{track.title}
												</div>
												<div class="truncate text-[11px] text-muted-foreground">
													{track.artists}
												</div>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
					<span class="mt-1 px-1 text-[10px] text-muted-foreground">
						{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
					</span>
				</div>
			{/each}

			{#if loading}
				<div class="flex items-center gap-2 text-xs text-muted-foreground animate-pulse p-2">
					<div class="flex space-x-1.5">
						<span class="h-2 w-2 rounded-full bg-primary animate-bounce"></span>
						<span class="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.15s]"></span>
						<span class="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.3s]"></span>
					</div>
					<span>Aura AI is curating your mix...</span>
				</div>
			{/if}
		</div>

		<!-- Quick Suggestions Carousel -->
		<div class="shrink-0 border-t border-border/40 bg-card/30 px-4 py-2">
			<div class="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
				{#each quickPrompts as q}
					<button
						onclick={() => sendMessage(q)}
						disabled={loading}
						class="shrink-0 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-foreground active:scale-95 disabled:opacity-50"
					>
						{q}
					</button>
				{/each}
			</div>
		</div>

		<!-- Input Footer -->
		<form
			onsubmit={(e) => {
				e.preventDefault();
				sendMessage();
			}}
			class="shrink-0 border-t border-border/60 bg-card/50 p-4"
		>
			<div class="flex items-center gap-2">
				<div class="relative flex-1">
					<Input
						bind:value={inputPrompt}
						placeholder="Ask Aura AI for a playlist, vibe, artist, or song story..."
						disabled={loading}
						class="rounded-2xl pr-10 bg-background/80 text-sm h-11 border-border/60 focus-visible:ring-primary"
					/>
				</div>
				<Button
					type="submit"
					disabled={loading || !inputPrompt.trim()}
					class="h-11 w-11 shrink-0 rounded-2xl shadow-md"
				>
					<HugeiconsIcon icon={SentIcon} class="h-5 w-5" />
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
