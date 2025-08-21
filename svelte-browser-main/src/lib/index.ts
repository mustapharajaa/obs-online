import XY from './xy.svelte';
import Exit from './exit.svelte';
import Browser from './main.svelte';
import Viewport from './viewport.svelte';
import KeyCapture from './key-capture.svelte';
import IOS_DeviceMotionRequestButton from './ios-device-motion-request-button.svelte';
import IOS_DeviceOrientationRequestButton from './ios-device-orientation-request-button.svelte';

import AudioContext from './audio-context.svelte';
import AudioStereoPanner from './audio-stereo-panner.svelte';
import AudioGain from './audio-gain.svelte';
import Audio from './audio.svelte';

import * as store from './store.js';

export * from './gamepad.js';
export * from './sensor.js';
export * from './device.js';
export * from './measure.js';
export * from './observer.js';
export {
	XY,
	Exit,
	Browser,
	KeyCapture,
	Viewport,
	AudioContext,
	AudioStereoPanner,
	AudioGain,
	Audio,
	IOS_DeviceOrientationRequestButton,
	IOS_DeviceMotionRequestButton
};
export default store;
