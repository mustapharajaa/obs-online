<script lang="ts">
	import { setContext, getContext, onDestroy } from 'svelte';
	import { writable, type Readable } from 'svelte/store';
	import { listen } from 'svelte/internal';

	const audioNode = writable<MediaElementAudioSourceNode>();
	const parentNode = getContext<Readable<AudioNode>>('audio-node');
	const audioContext = getContext<Readable<AudioContext>>('audio-context');

	export let mediaElement: HTMLMediaElement;

	$: if (mediaElement)
		$audioNode = new MediaElementAudioSourceNode($audioContext, { mediaElement });
	$: if ($parentNode && $audioNode) $audioNode.connect($parentNode);

	onDestroy(() => {
		$audioNode?.disconnect($parentNode);
	});
</script>

<audio bind:this={mediaElement} {...$$props} />
