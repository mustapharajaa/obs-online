<script lang="ts">
	import SafeMeasure from './safe-measure.svelte';

	import areaBoxInit from './area-box';
	import browserInit from './browser';

	areaBoxInit();
	browserInit();

	export let ratio: number;
	export let isDefaultSafeArea: boolean;

	// subscribe initial event.
</script>

<SafeMeasure bind:ratio bind:isDefaultSafeArea />
