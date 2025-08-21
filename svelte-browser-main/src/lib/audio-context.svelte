<script lang="ts">
	import { setContext, getContext, onDestroy } from 'svelte';
	import { writable } from 'svelte/store';
	import { __BROWSER__ } from 'svelte-petit-utils';

	const audioNode = writable<AudioDestinationNode>();
	const audioContext = writable<AudioContext>();

	setContext('audio-node', { subscribe: audioNode.subscribe });
	setContext('audio-context', { subscribe: audioContext.subscribe });

	export let latencyHint: AudioContextOptions['latencyHint'];
	export let sampleRate: AudioContextOptions['sampleRate'];

	export let state: AudioContextState;

	$: if (__BROWSER__) {
		$audioContext = new AudioContext({ latencyHint, sampleRate });
		$audioNode = $audioContext.destination;
	}
	$: if ($audioContext && state !== $audioContext.state) {
		switch (state) {
			case 'closed':
				$audioContext.close();
				break;
			case 'running':
				$audioContext.resume();
				break;
			case 'suspended':
				$audioContext.suspend();
				break;
			default:
				state = $audioContext.state;
		}
	}

	onDestroy(() => {
		$audioContext?.close();
	});
</script>

<slot />
