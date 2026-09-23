<script lang="ts">
	import { onMount } from 'svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		CheckmarkCircle01Icon,
		Cancel01Icon,
		Loading03Icon,
		SparklesIcon,
		Refresh03Icon,
		ViewIcon,
		ViewOffIcon,
		ShieldCheckIcon
	} from '@hugeicons/core-free-icons';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { AI_CONFIG, aiAgent } from '$lib/aiAgent';
	import { toast } from '$lib/player.svelte';

	let geminiKey = $state(AI_CONFIG.geminiApiKey);
	let groqKey = $state(AI_CONFIG.groqApiKey);
	let persona = $state(AI_CONFIG.aiPersona);

	let showGeminiKey = $state(false);
	let showGroqKey = $state(false);

	let testing = $state(false);
	let testResults = $state<{
		gemini?: { ok: boolean; message: string; latency: number };
		groq?: { ok: boolean; message: string; latency: number };
		backend?: { ok: boolean; message: string; latency: number };
	}>({});

	function saveKeys() {
		AI_CONFIG.geminiApiKey = geminiKey.trim();
		AI_CONFIG.groqApiKey = groqKey.trim();
		AI_CONFIG.aiPersona = persona;
		toast.success('AI Configuration updated successfully');
	}

	function clearKeys() {
		geminiKey = '';
		groqKey = '';
		AI_CONFIG.geminiApiKey = '';
		AI_CONFIG.groqApiKey = '';
		testResults = {};
		toast.success('Custom API keys cleared. Using built-in Aura AI.');
	}

	async function runTest() {
		testing = true;
		testResults = {};
		try {
			const res = await aiAgent.testProviders();
			testResults = res;
			if (res.backend?.ok || res.gemini?.ok || res.groq?.ok) {
				toast.success('Aura AI connection verified!');
			} else {
				toast.error('AI Connection Test Failed');
			}
		} catch (e: any) {
			toast.error(e.message || 'Test failed');
		} finally {
			testing = false;
		}
	}

	const PERSONAS = [
		{ id: 'Smart Aura DJ', label: '✨ Smart Aura DJ (Balanced, Curated & Dynamic)' },
		{ id: 'Chill Vibe Curator', label: '🎧 Chill Vibe Curator (Lofi, Acoustic, Relaxing)' },
		{ id: 'High-Energy Party DJ', label: '🔥 High-Energy Club & EDM Host' },
		{ id: 'Music Historian & Critic', label: '🎼 Deep Story & Lyrical Analyst' }
	];
</script>

<div class="space-y-6">
	<!-- AI Header Banner -->
	<div
		class="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-5"
	>
		<div
			class="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rounded-full bg-primary/20 blur-2xl"
		></div>
		<div class="flex items-start justify-between gap-4">
			<div class="space-y-1">
				<div class="flex items-center gap-2">
					<div
						class="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/30"
					>
						<HugeiconsIcon icon={SparklesIcon} size={16} />
					</div>
					<h3 class="font-heading text-base font-bold text-foreground">
						Aura AI Intelligence & Smart DJ
					</h3>
				</div>
				<p class="text-xs text-muted-foreground leading-relaxed">
					Instant vibe generation, smart playlist curation, and deep song lyrical analysis.
					Built-in smart curation works out of the box. Adding personal API keys is completely optional.
				</p>
			</div>

			<Button
				variant="outline"
				size="sm"
				class="gap-1.5 shrink-0 text-xs border-primary/30 hover:bg-primary/10"
				onclick={runTest}
				disabled={testing}
			>
				{#if testing}
					<HugeiconsIcon icon={Loading03Icon} size={14} class="animate-spin" />
					Testing...
				{:else}
					<HugeiconsIcon icon={Refresh03Icon} size={14} />
					Check Status
				{/if}
			</Button>
		</div>

		<!-- Status Pills -->
		{#if testResults.backend || testResults.gemini || testResults.groq}
			<div class="mt-4 flex flex-wrap gap-2 pt-2 border-t border-primary/20">
				{#if testResults.backend}
					<div
						class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium {testResults
							.backend.ok
							? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
							: 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}"
					>
						<HugeiconsIcon icon={ShieldCheckIcon} size={13} />
						{testResults.backend.message} ({testResults.backend.latency}ms)
					</div>
				{/if}

				{#if testResults.gemini && geminiKey}
					<div
						class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium {testResults
							.gemini.ok
							? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
							: 'bg-red-500/15 text-red-400 border border-red-500/30'}"
					>
						{#if testResults.gemini.ok}
							<HugeiconsIcon icon={CheckmarkCircle01Icon} size={13} />
							Gemini 2.5 Flash ({testResults.gemini.latency}ms)
						{:else}
							<HugeiconsIcon icon={Cancel01Icon} size={13} />
							Gemini Key Error
						{/if}
					</div>
				{/if}

				{#if testResults.groq && groqKey}
					<div
						class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium {testResults
							.groq.ok
							? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
							: 'bg-red-500/15 text-red-400 border border-red-500/30'}"
					>
						{#if testResults.groq.ok}
							<HugeiconsIcon icon={CheckmarkCircle01Icon} size={13} />
							Groq Llama 3.3 ({testResults.groq.latency}ms)
						{:else}
							<HugeiconsIcon icon={Cancel01Icon} size={13} />
							Groq Key Error
						{/if}
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- AI Persona Section -->
	<div class="rounded-xl border border-border/60 bg-card p-4 space-y-3">
		<label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground" for="persona-select">
			AI DJ Persona & Tone
		</label>
		<select
			id="persona-select"
			bind:value={persona}
			onchange={saveKeys}
			class="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
		>
			{#each PERSONAS as p}
				<option value={p.id}>{p.label}</option>
			{/each}
		</select>
	</div>

	<!-- Optional Custom API Keys Configuration -->
	<div class="rounded-xl border border-border/60 bg-card divide-y divide-border/60">
		<div class="px-4 py-3 bg-muted/20 flex items-center justify-between">
			<span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
				Custom API Keys (Optional)
			</span>
			{#if geminiKey || groqKey}
				<button
					type="button"
					onclick={clearKeys}
					class="text-[11px] text-destructive hover:underline cursor-pointer"
				>
					Clear Keys
				</button>
			{/if}
		</div>

		<!-- Gemini Key -->
		<div class="p-4 space-y-2">
			<div class="flex items-center justify-between">
				<div>
					<div class="text-xs font-semibold text-foreground">Google Gemini API Key</div>
					<div class="text-[11px] text-muted-foreground">
						Optional personal key for direct Gemini 2.5 Flash access. Stored locally in your browser only.
					</div>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<div class="relative flex-1">
					<Input
						type={showGeminiKey ? 'text' : 'password'}
						bind:value={geminiKey}
						placeholder="Enter your Gemini API key (optional)..."
						class="pr-9 font-mono text-xs"
					/>
					<button
						type="button"
						class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
						onclick={() => (showGeminiKey = !showGeminiKey)}
						aria-label={showGeminiKey ? 'Hide Gemini API key' : 'Show Gemini API key'}
					>
						<HugeiconsIcon icon={showGeminiKey ? ViewOffIcon : ViewIcon} size={15} />
					</button>
				</div>
			</div>
		</div>

		<!-- Groq Key -->
		<div class="p-4 space-y-2">
			<div class="flex items-center justify-between">
				<div>
					<div class="text-xs font-semibold text-foreground">Groq API Key</div>
					<div class="text-[11px] text-muted-foreground">
						Optional personal key for direct Groq Llama 3.3 inference. Stored locally in your browser only.
					</div>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<div class="relative flex-1">
					<Input
						type={showGroqKey ? 'text' : 'password'}
						bind:value={groqKey}
						placeholder="Enter your Groq API key (optional)..."
						class="pr-9 font-mono text-xs"
					/>
					<button
						type="button"
						class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
						onclick={() => (showGroqKey = !showGroqKey)}
						aria-label={showGroqKey ? 'Hide Groq API key' : 'Show Groq API key'}
					>
						<HugeiconsIcon icon={showGroqKey ? ViewOffIcon : ViewIcon} size={15} />
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Save Action -->
	<div class="flex justify-end gap-2">
		<Button size="sm" class="gap-1.5 px-4" onclick={saveKeys}>
			<HugeiconsIcon icon={CheckmarkCircle01Icon} size={15} />
			Save Changes
		</Button>
	</div>
</div>
