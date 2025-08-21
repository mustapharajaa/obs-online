<script lang="ts">
	import { setContext, getContext, onDestroy } from 'svelte';
	import { writable } from 'svelte/store';

	const audioNode = writable<GainNode>();
	const parentNode = getContext<Readable<AudioNode>>('audio-node');
	const audioContext = getContext<Readable<AudioContext>>('audio-context');
	setContext('audio-node', audioNode);

	export let volume: number;

	$: if ($audioContext) $audioNode = new GainNode($audioContext);
	$: if ($parentNode && $audioNode) $audioNode.connect($parentNode);
	$: if ($audioNode) {
		if (volume) {
			$audioNode.gain.value = volume;
		} else {
			volume = $audioNode.gain.defaultValue;
		}
	}

	onDestroy(() => {
		$audioNode?.disconnect();
	});
</script>

<slot />
