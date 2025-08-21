import { __BROWSER__ } from 'svelte-petit-utils';
import { listen } from 'svelte/internal';
import { readable } from 'svelte/store';
import { state } from './store.js';

export const labels = {
	buttons: [
		'×',
		'○',
		'□',
		'△',
		'L1',
		'R1',
		'L2',
		'R2',
		'share',
		'options',
		'L3',
		'R3',
		'↑',
		'↓',
		'←',
		'→',
		'PS',
		'pad'
	]
};

export const gamepads = readable(state.gamepads, (set) => {
	if (!__BROWSER__) return;

	let polling = false;
	const byes = [] as (() => void)[];
	byes[0] = listen(window, 'gamepadconnected', (({ gamepad }: GamepadEvent) => {
		update(gamepad);
		set(state.gamepads);
		console.log('connected', state.gamepads);

		polling = true;
		requestAnimationFrame(poll);
	}) as any);
	byes[1] = listen(window, 'gamepaddisconnected', (({ gamepad }: GamepadEvent) => {
		delete state.gamepads[gamepad.index];
		set(state.gamepads);
		console.log('disconnected', state.gamepads);

		requestAnimationFrame(poll);
	}) as any);

	return () => {
		polling = false;
		byes[0]();
		byes[1]();
	};

	function update(o: Gamepad | null) {
		if (!o) return;
		state.gamepads[o.index] = o;
	}

	function poll() {
		for (const gamepad of window.navigator.getGamepads()) {
			update(gamepad);
		}
		set(state.gamepads);
		if (polling) requestAnimationFrame(poll);
	}
});
