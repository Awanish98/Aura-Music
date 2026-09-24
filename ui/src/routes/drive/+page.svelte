<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		goto('/library', { replaceState: true });
	});
</script>

<svelte:head>
	<title>Library • Aura Music</title>
</svelte:head>

<div class="container mx-auto max-w-7xl px-4 py-12 text-center text-muted-foreground text-sm">
	Redirecting to Library...
</div>

