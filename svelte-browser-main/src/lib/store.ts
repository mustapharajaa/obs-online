import { writable } from 'svelte/store';
import { __BROWSER__, type SIZE, type POINT, type OFFSET } from 'svelte-petit-utils';

const DPI = bootDPI();
const divDPI = 1 / bootDPI();
const default_vp = { width: 1024, height: 1024, scale: 1 };
const vp = __BROWSER__ ? window.visualViewport || default_vp : default_vp;

class AreaBox {
	size: SIZE;
	point!: POINT;
	offset!: OFFSET;

	constructor({ width, height, scale }: { width: number; height: number; scale: number }) {
		this.size = [width * scale, height * scale];

		this.measureSize(width, height);
		this.measureOffset(0, 0, 0, 0);
	}

	measureSize(width: number, height: number) {
		width = byDotCeil(width);
		height = byDotCeil(height);
		this.size = [width, height];
	}

	measureOffset(top: number, right: number, bottom: number, left: number) {
		top = byDotCeil(top);
		right = byDotFloor(right);
		bottom = byDotFloor(bottom);
		left = byDotCeil(left);
		this.offset = [top, right, bottom, left];
		this.point = [left, top];
	}
}

export const xyz_new = () => ({
	label: '',
	x: 0,
	y: 0,
	z: 0
});

export const abg_new = () => ({
	label: '',
	alpha: 0,
	beta: 0,
	gamma: 0,
	absolute: false
});

export const geo_new: () => {
	label: string;
	timestamp: number;
	accuracy: number;
	altitudeAccuracy: number | null;
	longitude: number;
	latitude: number;
	altitude: number | null;
	heading: number | null;
	speed: number | null;
} = () => ({
	label: '',
	timestamp: 0,
	accuracy: 0,
	altitudeAccuracy: null,
	longitude: 0,
	latitude: 0,
	altitude: null,
	heading: null,
	speed: null
});

export const state = {
	isActive: true,
	isOnline: true,
	isWatching: true,

	isKeypad: false,
	isPortrait: false,
	isLandscape: false,
	isZoom: false,

	keys: [] as string[],

	scale: vp.scale,
	keypad: {
		size: [0, 0] as SIZE
	},
	zoom: new AreaBox(vp),
	view: new AreaBox(vp),
	safe: new AreaBox(vp),

	threshold: [0, 0] as SIZE,

	locate: geo_new(),
	gyro: abg_new(),
	gravity: xyz_new(),
	rotate: abg_new(),
	accel: xyz_new(),
	speed: xyz_new(),
	point: xyz_new(),

	gamepads: [] as Gamepad[]
};

export const isActive = writable(state.isActive);
export const isOnline = writable(state.isOnline);
export const isWatching = writable(state.isWatching);

export const isKeypad = writable(state.isKeypad);
export const isPortrait = writable(state.isPortrait);
export const isLandscape = writable(state.isLandscape);
export const isZoom = writable(state.isZoom);

export const keys = writable(state.keys);

export const zoomScale = writable(state.scale);

export const zoomPoint = writable(state.zoom.point);
export const viewPoint = writable(state.view.point);
export const safePoint = writable(state.safe.point);

export const zoomOffset = writable(state.zoom.offset);
export const viewOffset = writable(state.view.offset);
export const safeOffset = writable(state.safe.offset);

export const keypadSize = writable(state.keypad.size);
export const zoomSize = writable(state.zoom.size);
export const viewSize = writable(state.view.size);
export const safeSize = writable(state.safe.size);

function bootDPI() {
	return __BROWSER__ ? window.devicePixelRatio : 1;
}

function byDotCeil(size: number) {
	return Math.ceil(size * DPI) * divDPI;
}

function byDotFloor(size: number) {
	return Math.floor(size * DPI) * divDPI;
}
