<script lang="ts">
	import { setContext, getContext, onMount } from 'svelte';

	const audioNode = writable<AudioWorkletNode>(undefined);
	const parentNode = getContext<Readable<AudioNode>>('audio-node');
	const audioContext = getContext<Readable<AudioContext>>('audio-context');
	setContext('audio-node', audioNode);

	/* wip */

	export let src: string;
	export let credentials: RequestCredentials;

	$: if ($parentNode && $audioNode) $audioNode.connect($parentNode);
	$: $audioContext?.audioWorklet.addModule(src, { credentials });

	onDestroy(() => {
		$audioNode.disconnect();
	});
</script>

<slot />
