<script lang="ts">
	import type { POINT } from 'svelte-petit-utils';

	const by_deg = (Math.PI * 2) / 360;

	export let data: any[] = [];
	export let view = 100;
	export let vw = view;
	export let vh = view;
	export let size = '10em';
	export let width = size;
	export let height = size;
	export let style = 'solid' as 'hide' | 'wide' | 'solid' | 'dotted';
</script>

<svg viewBox="-{vw} -{vh} {vw * 2} {vh * 2}" {width} {height}>
	<g class="edgePath">
		<path class="base dotted" d="M{-vw},0L{vw},0M0,{-vh}L0,{vh}" />
		{#each data as val, idx}
			{#if 1 === val.length}
				{@const rx = 0.9 * view * Math.sin(val[0] * by_deg)}
				{@const ry = 0.9 * view * Math.cos(val[0] * by_deg)}
				<path class="path{idx} {style}" d="M{rx},{-ry}L0,0" />
				<text class="path{idx}" text-anchor="middle" x={rx} y={-ry}>{parseInt(val[0])}</text>
			{/if}
			{#if 2 === val.length}
				{@const [x, y] = val}
				<path class="path{idx} {style}" d="M{x},{-y}L0,0" />
				<text class="path{idx}" text-anchor="middle" {x} y={-y}>{parseInt(x)} x {parseInt(y)}</text>
			{/if}
		{/each}
	</g>
</svg>

<style>
	svg g path {
		fill: none;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	path.hide {
		stroke: none;
		stroke-width: 0;
	}
	path.wide {
		stroke-width: 6px;
	}
	path.solid {
		stroke-width: 3px;
	}
	path.dotted {
		stroke-width: 6px;
		stroke-dasharray: 0, 12px;
	}
</style>
