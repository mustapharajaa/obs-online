import { __BROWSER__ } from 'svelte-petit-utils';
import { listen } from 'svelte/internal';
import { derived, readable, writable } from 'svelte/store';
import { abg_new, state, xyz_new } from './store.js';

function geo_to_s(n: number, plus: string, minus: string) {
	let mark = plus;
	if (n < 0) {
		mark = minus;
		n = -n;
	}
	const n1 = Math.floor(n);
	const n2 = Math.floor((n * 60) % 60);
	const n3 = Math.floor((n * 3600) % 60);
	const n4 = Math.floor((n * 216000) % 60);
	const n5 = Math.floor((n * 12960000) % 60);
	return `${n1}°${n2}′${n3}″${n4}‴${n5}⁗${mark}`;
}

function mks_to_s(n: number | null) {
	if ('number' !== typeof n) return '';
	let mark = '';
	if (n < 0) {
		mark = '-';
		n = -n;
	}
	const n1 = Math.floor(n);
	const n2 = Math.floor((n * 100) % 100);
	return `${mark}${n1}m${n2}cm`;
}

type XYZ = { x: number; y: number; z: number };

function xyz_set(base: ReturnType<typeof xyz_new>, tgt: XYZ) {
	if (tgt) {
		base.x = tgt.x;
		base.y = tgt.y;
		base.z = tgt.z;
	}
}

const XYZ_zero = { x: 0, y: 0, z: 0 };
function xyz_plus(a: XYZ, b: XYZ): XYZ {
	a ||= XYZ_zero;
	b ||= XYZ_zero;
	return {
		x: a.x + b.x,
		y: a.y + b.y,
		z: a.z + b.z
	};
}
function xyz_diff(a: XYZ, b: XYZ): XYZ {
	a ||= XYZ_zero;
	b ||= XYZ_zero;
	return {
		x: a.x - b.x,
		y: a.y - b.y,
		z: a.z - b.z
	};
}

type ABG = { alpha: number; beta: number; gamma: number };

function abg_set(base: ReturnType<typeof abg_new>, tgt: ABG) {
	if (tgt) {
		base.alpha = tgt.alpha;
		base.beta = tgt.beta;
		base.gamma = tgt.gamma;
	}
}

function coord_set(base: typeof state.locate, tgt: GeolocationCoordinates) {
	base.longitude = tgt.longitude;
	base.latitude = tgt.latitude;
	base.accuracy = tgt.accuracy;
	base.altitudeAccuracy = tgt.altitudeAccuracy;
	base.altitude = tgt.altitude;
	base.heading = tgt.heading;
	base.speed = tgt.speed;
}

export const locate = readable(state.locate, (set) => {
	if (!(__BROWSER__ && window?.navigator?.geolocation)) return;
	const watch_id = navigator.geolocation.watchPosition(
		({ coords, timestamp }) => {
			state.locate.label = `${geo_to_s(coords.longitude, 'N', 'S')} ${geo_to_s(
				coords.latitude,
				'E',
				'W'
			)} ${mks_to_s(coords.altitude)}`;
			state.locate.timestamp = timestamp;
			coord_set(state.locate, coords);
			set(state.locate);
		},
		({ code }) => {
			console.error(`watchPosition error = ${code}`);
		},
		{
			enableHighAccuracy: true,
			maximumAge: 60 * 1000,
			timeout: 10 * 1000
		}
	);

	return () => {
		navigator.geolocation.clearWatch(watch_id);
	};
});

export const gyro = readable(state.gyro, (set) => {
	if (!__BROWSER__) return;

	const bye = listen(window, 'deviceorientation', ((o: any) => {
		state.gyro.label = '';
		abg_set(state.gyro, o);
		set(state.gyro);
	}) as any);

	return bye;
});

const devicemotion = readable(0, (set) => {
	if (!__BROWSER__) return;

	let step = 0;
	const bye = listen(window, 'devicemotion', (({
		interval,
		acceleration,
		accelerationIncludingGravity,
		rotationRate
	}: any) => {
		xyz_set(state.gravity, xyz_diff(accelerationIncludingGravity, acceleration));
		abg_set(state.rotate, rotationRate);
		xyz_set(state.accel, acceleration);
		xyz_set(state.speed, xyz_plus(state.speed, state.accel));
		xyz_set(state.point, xyz_plus(state.point, state.speed));

		set(step++);
	}) as any);

	return bye;
});

export const gravity = derived(devicemotion, (interval) => state.gravity);
export const rotate = derived(devicemotion, (interval) => state.rotate);
export const accel = derived(devicemotion, (interval) => state.accel);
export const speed = derived(devicemotion, (interval) => state.speed);
export const point = derived(devicemotion, (interval) => state.point);
