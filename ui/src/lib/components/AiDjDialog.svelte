<script lang="ts">
	import { tick, onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		AiMagicIcon,
		PlayIcon,
		Queue01Icon,
		SentIcon,
		Cancel01Icon,
		SparklesIcon,
		Delete02Icon,
		Mic01Icon,
		AudioWave02Icon
	} from '@hugeicons/core-free-icons';
	import aiMascot from '$lib/assets/ai_mascot.svg';
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
	let isListening = $state(false);
	let recognition: any = null;

	let messages = $state<AiMessage[]>([
		{
			id: 'welcome',
			role: 'assistant',
			content:
				"Hey! I'm Aura AI, your personal music DJ and companion. Tell me your mood, and I'll create the perfect custom mix for you.",
			timestamp: Date.now()
		}
	]);

	let chatContainer: HTMLElement | undefined = $state();

	const quickMoodPills = [
		{ label: 'Chill', prompt: 'Chill relaxing Hindi indie acoustic melodies' },
		{ label: 'Workout', prompt: 'High energy aggressive gym workout phonk' },
		{ label: 'Focus', prompt: 'Calm ambient lofi study and coding beats' },
		{ label: 'Party', prompt: 'Top dance Punjabi and Bollywood party hits' },
		{ label: 'Romance', prompt: 'Soulful Bollywood romance and love ballads' },
		{ label: 'Sad', prompt: 'Heartbreak melancholic acoustic songs' }
	];

	onMount(() => {
		const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
		if (SpeechRec) {
			recognition = new SpeechRec();
			recognition.continuous = false;
			recognition.interimResults = false;
			recognition.lang = 'en-US';

			recognition.onresult = (event: any) => {
				const transcript = event.results[0][0].transcript;
				isListening = false;
				sendMessage(transcript);
			};

			recognition.onerror = () => {
				isListening = false;
				toast.error('Voice input error. Please try typing.');
			};

			recognition.onend = () => {
				isListening = false;
			};
		}
	});

	function toggleVoiceInput() {
		if (!recognition) {
			toast.error('Speech recognition not supported in this browser. Please type.');
			return;
		}

		if (isListening) {
			recognition.stop();
			isListening = false;
		} else {
			try {
				recognition.start();
				isListening = true;
				toast('Listening for your vibe... Speak now!');
			} catch {
				isListening = false;
			}
		}
	}

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
	<Dialog.Content class="sm:max-w-2xl max-h-[90vh] h-[700px] flex flex-col p-0 gap-0 overflow-hidden border border-purple-500/30 bg-[#0c0d18]/95 backdrop-blur-3xl shadow-2xl rounded-3xl select-none">
		<!-- Header with 3D Mascot -->
		<div class="relative flex shrink-0 items-center justify-between border-b border-white/10 bg-gradient-to-r from-purple-950/60 via-pink-950/40 to-transparent px-6 py-4">
			<div class="flex items-center gap-3">
				<div class="relative h-10 w-10">
					<img src={aiMascot} alt="Aura AI" class="h-full w-full object-contain drop-shadow-[0_0_12px_rgba(255,42,122,0.5)]" />
				</div>
				<div>
					<div class="flex items-center gap-2">
						<h2 class="text-base font-extrabold tracking-tight text-white">AI DJ</h2>
						<span class="inline-flex items-center gap-1 rounded-full bg-pink-500/20 px-2.5 py-0.5 text-[10px] font-bold text-pink-400 border border-pink-500/30">
							<HugeiconsIcon icon={SparklesIcon} size={11} class="animate-pulse" /> Companion
						</span>
					</div>
					<p class="text-xs text-muted-foreground/80">Your Personal Music Companion</p>
				</div>
			</div>

			<div class="flex items-center gap-1">
				<Button
					variant="ghost"
					size="icon-sm"
					class="text-muted-foreground hover:text-white"
					onclick={clearHistory}
					title="Clear conversation"
				>
					<HugeiconsIcon icon={Delete02Icon} size={16} />
				</Button>
				<Button
					variant="ghost"
					size="icon-sm"
					class="text-muted-foreground hover:text-white"
					onclick={() => (open = false)}
				>
					<HugeiconsIcon icon={Cancel01Icon} size={16} />
				</Button>
			</div>
		</div>

		<!-- Chat Message Stream -->
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
						class="max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg {msg.role ===
						'user'
							? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-br-none shadow-pink-500/20'
							: 'bg-[#151726]/90 border border-white/10 text-white backdrop-blur-md rounded-bl-none'}"
					>
						<p class="whitespace-pre-wrap">{msg.content}</p>

						{#if msg.tracks && msg.tracks.length > 0}
							<div class="mt-3.5 space-y-2 border-t border-white/10 pt-3">
								<div class="flex items-center justify-between gap-2 mb-2">
									<span class="text-xs font-bold text-pink-400 tracking-wide uppercase">
										Custom AI Mix ({msg.tracks.length} tracks)
									</span>
									<div class="flex items-center gap-1.5">
										<button
											onclick={() => playAllTracks(msg.tracks)}
											class="flex items-center gap-1 rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 px-3 py-1 text-xs font-bold text-white shadow-md cursor-pointer hover:scale-105 transition-transform"
										>
											<HugeiconsIcon icon={PlayIcon} size={13} fill="currentColor" />
											<span>Play Mix</span>
										</button>
										<button
											onclick={() => queueAllTracks(msg.tracks)}
											class="flex items-center gap-1 rounded-lg bg-white/10 border border-white/10 px-2.5 py-1 text-xs font-semibold text-white hover:bg-white/20 transition-colors cursor-pointer"
										>
											<HugeiconsIcon icon={Queue01Icon} size={13} />
											<span>Queue</span>
										</button>
									</div>
								</div>

								<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
									{#each msg.tracks as track}
										<div
											role="button"
											tabindex="0"
											onclick={() => playSong(track)}
											onkeydown={(e) => e.key === 'Enter' && playSong(track)}
											class="group flex items-center gap-2.5 rounded-xl border border-white/8 bg-black/40 p-2 text-left transition-colors hover:bg-white/10 cursor-pointer"
										>
											<div class="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
												<img
													src={thumb(track.thumbnail, 96)}
													alt=""
													class="h-full w-full object-cover"
												/>
												<div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
													<HugeiconsIcon icon={PlayIcon} size={14} fill="white" class="text-white" />
												</div>
											</div>
											<div class="min-w-0 flex-1">
												<div class="truncate text-xs font-semibold text-white group-hover:text-primary transition-colors">
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
					<span class="mt-1 px-1 text-[10px] text-muted-foreground/60">
						{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
					</span>
				</div>
			{/each}

			{#if loading}
				<div class="flex items-center gap-2 text-xs text-muted-foreground animate-pulse p-2">
					<div class="flex space-x-1.5">
						<span class="h-2 w-2 rounded-full bg-pink-500 animate-bounce"></span>
						<span class="h-2 w-2 rounded-full bg-pink-500 animate-bounce [animation-delay:0.15s]"></span>
						<span class="h-2 w-2 rounded-full bg-pink-500 animate-bounce [animation-delay:0.3s]"></span>
					</div>
					<span class="text-pink-300">Aura AI is generating your mix...</span>
				</div>
			{/if}
		</div>

		<!-- Quick Mood Pills Carousel -->
		<div class="shrink-0 border-t border-white/8 bg-black/20 px-4 py-2.5">
			<div class="flex gap-2 overflow-x-auto no-scrollbar">
				{#each quickMoodPills as q}
					<button
						onclick={() => sendMessage(q.prompt)}
						disabled={loading}
						class="shrink-0 rounded-full border border-white/10 bg-white/6 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition-all hover:border-pink-500/50 hover:bg-pink-500/20 hover:text-white active:scale-95 disabled:opacity-50 cursor-pointer"
					>
						{q.label}
					</button>
				{/each}
			</div>
		</div>

		<!-- Input & Tap-to-Talk Voice Trigger -->
		<div class="shrink-0 border-t border-white/10 bg-[#090b14]/90 p-4">
			<form
				onsubmit={(e) => {
					e.preventDefault();
					sendMessage();
				}}
				class="flex items-center gap-2.5"
			>
				<!-- Tap to Talk Large Mic Button -->
				<button
					type="button"
					onclick={toggleVoiceInput}
					class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full {isListening
						? 'bg-rose-600 text-white animate-pulse shadow-[0_0_15px_#f43f5e]'
						: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/25 hover:scale-105 active:scale-95'} transition-all cursor-pointer"
					title="Tap to speak your vibe"
				>
					<HugeiconsIcon icon={Mic01Icon} size={20} />
				</button>

				<div class="relative flex-1">
					<input
						type="text"
						bind:value={inputPrompt}
						placeholder="Tell Aura AI what to play, or tap mic..."
						disabled={loading}
						class="w-full h-11 rounded-full bg-white/6 border border-white/12 px-4 text-xs sm:text-sm text-white placeholder:text-muted-foreground/70 focus:outline-none focus:border-pink-500/60 focus:bg-white/10 transition-all shadow-inner"
					/>
				</div>

				<button
					type="submit"
					disabled={loading || !inputPrompt.trim()}
					class="h-11 w-11 flex items-center justify-center shrink-0 rounded-full bg-pink-500 text-white shadow-lg shadow-pink-500/30 hover:bg-pink-600 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
				>
					<HugeiconsIcon icon={SentIcon} size={18} />
				</button>
			</form>
		</div>
	</Dialog.Content>
</Dialog.Root>
