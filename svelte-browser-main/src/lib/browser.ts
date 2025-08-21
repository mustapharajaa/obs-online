import { listen, once } from 'svelte/internal';
import { onMount } from 'svelte';
import { __BROWSER__ } from 'svelte-petit-utils';
import { state, isOnline, isWatching, isActive } from './store.js';

const browserInit = once(() => {
	onMount(() => {
		const byes = [
			listen(window, 'offline', setOnLine),
			listen(window, 'online', setOnLine),
			listen(window, 'visibilitychange', setVisibilityState)
		];
		setOnLine();
		setVisibilityState();

		return () => {
			byes.forEach((fn) => fn());
		};
	});
});
export default browserInit;

function setActive() {
	isActive.set(state.isOnline && state.isWatching);
}

function setOnLine() {
	state.isOnline = window.navigator.onLine;
	isOnline.set(state.isOnline);
	setActive();
}

function setVisibilityState() {
	state.isWatching = 'visible' === document.visibilityState;
	isWatching.set(state.isWatching);
	setActive();
}
