<script lang="ts">
	// Global SVG Filter for Liquid Glass Refraction & Wave Distortion
</script>

<svg class="pointer-events-none fixed -top-[9999px] -left-[9999px] h-0 w-0 opacity-0" aria-hidden="true">
	<defs>
		<filter
			id="container-glass"
			x="0%"
			y="0%"
			width="100%"
			height="100%"
			color-interpolation-filters="sRGB"
		>
			<!-- Generate turbulent noise for distortion -->
			<feTurbulence
				type="fractalNoise"
				baseFrequency="0.05 0.05"
				numOctaves="1"
				seed="1"
				result="turbulence"
			/>

			<!-- Blur the turbulence pattern slightly -->
			<feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />

			<!-- Displace the source graphic with the noise -->
			<feDisplacementMap
				in="SourceGraphic"
				in2="blurredNoise"
				scale="70"
				xChannelSelector="R"
				yChannelSelector="B"
				result="displaced"
			/>

			<!-- Apply overall blur on the final result -->
			<feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />

			<!-- Output the result -->
			<feComposite in="finalBlur" in2="finalBlur" operator="over" />
		</filter>
	</defs>
</svg>
