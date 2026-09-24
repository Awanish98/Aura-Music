<script lang="ts" module>
	import { cn } from '$lib/utils';
	import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';
	import { tv, type VariantProps } from 'tailwind-variants';

	export const liquidButtonVariants = tv({
		base: 'relative inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary select-none active:scale-95',
		variants: {
			variant: {
				default: 'text-white hover:scale-105',
				primary: 'text-primary hover:scale-105',
				destructive: 'text-rose-400 hover:text-rose-300 hover:scale-105',
				outline: 'border border-white/15 text-white hover:border-white/30 hover:scale-105',
				secondary: 'text-foreground/90 hover:text-white hover:scale-105',
				ghost: 'hover:bg-white/10 text-white',
				link: 'text-primary underline-offset-4 hover:underline'
			},
			size: {
				default: 'h-9 px-4 py-2 has-[>svg]:px-3',
				sm: 'h-8 text-xs gap-1.5 px-3.5 has-[>svg]:px-3',
				lg: 'h-10 rounded-full px-6 has-[>svg]:px-4 text-sm',
				xl: 'h-12 rounded-full px-8 has-[>svg]:px-6 text-base',
				xxl: 'h-14 rounded-full px-10 has-[>svg]:px-8 text-base font-bold',
				icon: 'size-9 rounded-full'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	});

	export type LiquidButtonVariant = VariantProps<typeof liquidButtonVariants>['variant'];
	export type LiquidButtonSize = VariantProps<typeof liquidButtonVariants>['size'];

	export type LiquidButtonProps = HTMLButtonAttributes &
		HTMLAnchorAttributes & {
			variant?: LiquidButtonVariant;
			size?: LiquidButtonSize;
			ref?: HTMLElement | null;
		};
</script>

<script lang="ts">
	let {
		class: className,
		variant = 'default',
		size = 'default',
		ref = $bindable(null),
		href = undefined,
		type = 'button',
		disabled = false,
		children,
		...restProps
	}: LiquidButtonProps = $props();
</script>

{#if href}
	<a
		bind:this={ref}
		data-slot="liquid-button"
		class={cn(liquidButtonVariants({ variant, size }), className)}
		href={disabled ? undefined : href}
		aria-disabled={disabled}
		role={disabled ? 'link' : undefined}
		tabindex={disabled ? -1 : undefined}
		{...restProps}
	>
		<!-- 3D Multi-Layered Liquid Glass Shadow Overlay -->
		<div
			class="pointer-events-none absolute inset-0 z-0 h-full w-full rounded-full transition-all duration-300
			shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.9),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.85),inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.6),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.6),inset_0_0_6px_6px_rgba(0,0,0,0.12),inset_0_0_2px_2px_rgba(0,0,0,0.06),0_0_12px_rgba(255,255,255,0.15)]
			dark:shadow-[0_0_8px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.09),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.85),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.6),inset_0_0_6px_6px_rgba(255,255,255,0.12),inset_0_0_2px_2px_rgba(255,255,255,0.06),0_0_12px_rgba(0,0,0,0.15)]"
		></div>

		<!-- Refractive Glass Distortion Backdrop -->
		<div
			class="pointer-events-none absolute inset-0 isolate -z-10 h-full w-full overflow-hidden rounded-full bg-white/[0.06] backdrop-blur-xl"
			style="backdrop-filter: blur(20px) url('#container-glass'); -webkit-backdrop-filter: blur(20px);"
		></div>

		<div class="relative z-10 flex items-center justify-center gap-2">
			{@render children?.()}
		</div>
	</a>
{:else}
	<button
		bind:this={ref}
		data-slot="liquid-button"
		class={cn(liquidButtonVariants({ variant, size }), className)}
		{type}
		{disabled}
		{...restProps}
	>
		<!-- 3D Multi-Layered Liquid Glass Shadow Overlay -->
		<div
			class="pointer-events-none absolute inset-0 z-0 h-full w-full rounded-full transition-all duration-300
			shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.9),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.85),inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.6),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.6),inset_0_0_6px_6px_rgba(0,0,0,0.12),inset_0_0_2px_2px_rgba(0,0,0,0.06),0_0_12px_rgba(255,255,255,0.15)]
			dark:shadow-[0_0_8px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.09),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.85),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.6),inset_0_0_6px_6px_rgba(255,255,255,0.12),inset_0_0_2px_2px_rgba(255,255,255,0.06),0_0_12px_rgba(0,0,0,0.15)]"
		></div>

		<!-- Refractive Glass Distortion Backdrop -->
		<div
			class="pointer-events-none absolute inset-0 isolate -z-10 h-full w-full overflow-hidden rounded-full bg-white/[0.06] backdrop-blur-xl"
			style="backdrop-filter: blur(20px) url('#container-glass'); -webkit-backdrop-filter: blur(20px);"
		></div>

		<div class="relative z-10 flex items-center justify-center gap-2">
			{@render children?.()}
		</div>
	</button>
{/if}
