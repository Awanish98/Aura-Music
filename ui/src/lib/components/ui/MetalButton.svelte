<script lang="ts">
	// 21st.dev 3D Metal Button Component with Tactile GPU Transforms & Shimmer
	import { cn } from '$lib/utils';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	export type MetalColorVariant =
		| 'default'
		| 'primary'
		| 'success'
		| 'error'
		| 'gold'
		| 'bronze';

	interface Props extends HTMLButtonAttributes {
		variant?: MetalColorVariant;
		class?: string;
		children?: import('svelte').Snippet;
	}

	let {
		variant = 'primary',
		class: className = '',
		children,
		disabled = false,
		...restProps
	}: Props = $props();

	let isPressed = $state(false);
	let isHovered = $state(false);

	const colorVariants: Record<
		MetalColorVariant,
		{
			outer: string;
			inner: string;
			button: string;
			textColor: string;
			textShadow: string;
		}
	> = {
		default: {
			outer: 'bg-gradient-to-b from-[#333] to-[#111]',
			inner: 'bg-gradient-to-b from-[#FAFAFA] via-[#3E3E3E] to-[#E5E5E5]',
			button: 'bg-gradient-to-b from-[#2A2A38] to-[#161622]',
			textColor: 'text-white',
			textShadow: '[text-shadow:_0_-1px_0_rgb(0_0_0_/_80%)]'
		},
		primary: {
			outer: 'bg-gradient-to-b from-[#ff2a7a] to-[#a855f7]',
			inner: 'bg-gradient-to-b from-pink-400 via-rose-600 to-purple-800',
			button: 'bg-gradient-to-b from-[#ff2a7a] to-[#e11d48]',
			textColor: 'text-white',
			textShadow: '[text-shadow:_0_-1px_0_rgba(159,18,57,0.8)]'
		},
		success: {
			outer: 'bg-gradient-to-b from-[#005A43] to-[#7CCB9B]',
			inner: 'bg-gradient-to-b from-[#E5F8F0] via-[#00352F] to-[#D1F0E6]',
			button: 'bg-gradient-to-b from-[#10b981] to-[#059669]',
			textColor: 'text-[#FFF7F0]',
			textShadow: '[text-shadow:_0_-1px_0_rgb(6_78_59_/_100%)]'
		},
		error: {
			outer: 'bg-gradient-to-b from-[#5A0000] to-[#FFAEB0]',
			inner: 'bg-gradient-to-b from-[#FFDEDE] via-[#680002] to-[#FFE9E9]',
			button: 'bg-gradient-to-b from-[#ef4444] to-[#b91c1c]',
			textColor: 'text-[#FFF7F0]',
			textShadow: '[text-shadow:_0_-1px_0_rgb(146_64_14_/_100%)]'
		},
		gold: {
			outer: 'bg-gradient-to-b from-[#917100] to-[#EAD98F]',
			inner: 'bg-gradient-to-b from-[#FFFDDD] via-[#856807] to-[#FFF1B3]',
			button: 'bg-gradient-to-b from-[#f59e0b] to-[#d97706]',
			textColor: 'text-[#FFFDE5]',
			textShadow: '[text-shadow:_0_-1px_0_rgb(178_140_2_/_100%)]'
		},
		bronze: {
			outer: 'bg-gradient-to-b from-[#864813] to-[#E9B486]',
			inner: 'bg-gradient-to-b from-[#EDC5A1] via-[#5F2D01] to-[#FFDEC1]',
			button: 'bg-gradient-to-b from-[#ea580c] to-[#c2410c]',
			textColor: 'text-[#FFF7F0]',
			textShadow: '[text-shadow:_0_-1px_0_rgb(124_45_18_/_100%)]'
		}
	};

	const currentColors = $derived(colorVariants[variant]);
</script>

<div
	class={cn(
		'relative inline-flex transform-gpu rounded-full p-[1.5px] will-change-transform select-none',
		currentColors.outer
	)}
	style="
		transform: {isPressed ? 'translateY(2px) scale(0.98)' : isHovered ? 'translateY(-1px) scale(1.02)' : 'translateY(0) scale(1)'};
		box-shadow: {isPressed ? '0 1px 2px rgba(0,0,0,0.4)' : isHovered ? '0 8px 24px -4px rgba(255,42,122,0.4)' : '0 4px 12px rgba(0,0,0,0.3)'};
		transition: all 220ms cubic-bezier(0.1, 0.4, 0.2, 1);
		transform-origin: center center;
	"
>
	<div
		class={cn('absolute inset-[1px] transform-gpu rounded-full will-change-transform opacity-75', currentColors.inner)}
		style="
			transition: all 220ms cubic-bezier(0.1, 0.4, 0.2, 1);
			transform-origin: center center;
			filter: {isHovered && !isPressed ? 'brightness(1.15)' : 'none'};
		"
	></div>

	<button
		class={cn(
			'relative z-10 m-[1px] inline-flex h-10 transform-gpu cursor-pointer items-center justify-center overflow-hidden rounded-full px-5 py-2 text-xs sm:text-sm font-bold tracking-wide will-change-transform outline-none transition-all disabled:opacity-50 disabled:pointer-events-none',
			currentColors.button,
			currentColors.textColor,
			currentColors.textShadow,
			className
		)}
		style="
			transform: {isPressed ? 'scale(0.97)' : 'scale(1)'};
			transition: all 220ms cubic-bezier(0.1, 0.4, 0.2, 1);
			transform-origin: center center;
		"
		onmousedown={() => (isPressed = true)}
		onmouseup={() => (isPressed = false)}
		onmouseleave={() => {
			isPressed = false;
			isHovered = false;
		}}
		onmouseenter={() => (isHovered = true)}
		ontouchstart={() => (isPressed = true)}
		ontouchend={() => (isPressed = false)}
		ontouchcancel={() => (isPressed = false)}
		{disabled}
		{...restProps}
	>
		<!-- Specular Light Sweep Shine -->
		<div
			class={cn(
				'pointer-events-none absolute inset-0 z-20 overflow-hidden transition-opacity duration-300',
				isPressed ? 'opacity-30' : isHovered ? 'opacity-20' : 'opacity-0'
			)}
		>
			<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"></div>
		</div>

		<div class="relative z-10 flex items-center justify-center gap-2">
			{@render children?.()}
		</div>
	</button>
</div>
