<script lang="ts">
	import { setContext, getContext, onDestroy } from 'svelte';
	import { writable } from 'svelte/store';

	const audioNode = writable<StereoPannerNode>();
	const parentNode = getContext<Readable<AudioNode>>('audio-node');
	const audioContext = getContext<Readable<AudioContext>>('audio-context');
	setContext('audio-node', audioNode);

	export let pan: number;

	$: if ($audioContext) $audioNode = new StereoPannerNode($audioContext);
	$: if ($parentNode && $audioNode) $audioNode.connect($parentNode);
	$: if ($audioNode) {
		if (pan) {
			$audioNode.pan.value = pan;
		} else {
			pan = $audioNode.pan.defaultValue;
		}
	}

	onDestroy(() => {
		$audioNode?.disconnect();
	});
</script>

<slot />
