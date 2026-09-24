<script lang="ts">
	import { Dialog as DialogPrimitive } from "bits-ui";

	let { open = $bindable(), ...restProps }: DialogPrimitive.RootProps = $props();
</script>

<DialogPrimitive.Root bind:open {...restProps} />
