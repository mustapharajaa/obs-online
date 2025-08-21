<script lang="ts">
	import { __BROWSER__, type SIZE } from 'svelte-petit-utils';
	import store, {
		KeyCapture,
		Browser,
		Viewport,
		XY,
		labels,
		AudioContext,
		AudioStereoPanner,
		AudioGain,
		Audio,
		IOS_DeviceOrientationRequestButton,
		IOS_DeviceMotionRequestButton,
		onResize
	} from '$lib';
	import {
		ua,
		cpu,
		device,
		browser,
		engine,
		os,
		isLegacy,
		isRadius,
		isIOS,
		isAndroid,
		isPC,
		isTablet,
		isMobile,
		isBlink,
		isMacSafari,
		isIOSlegacy,
		locate,
		gyro,
		gravity,
		rotate,
		accel,
		speed,
		point,
		gamepads
	} from '$lib';
	import { identity } from 'svelte/internal';

	const {
		isActive,
		isOnline,
		isWatching,
		isKeypad,
		isPortrait,
		isLandscape,
		isZoom,
		keys,
		zoomScale,
		zoomPoint,
		viewPoint,
		safePoint,
		zoomOffset,
		viewOffset,
		safeOffset,
		keypadSize,
		zoomSize,
		viewSize,
		safeSize
	} = store;

	let v = [0, 0] as SIZE;
	let sv = [0, 0] as SIZE;
	let lv = [0, 0] as SIZE;
	let dv = [0, 0] as SIZE;

	const setV = (size: SIZE) => (v = size);
	const setSV = (size: SIZE) => (sv = size);
	const setLV = (size: SIZE) => (lv = size);
	const setDV = (size: SIZE) => (dv = size);

	let mic_player: HTMLMediaElement;
	let mic_stream: MediaStream;
	let echoCancellation = true;
	let audio = {} as {
		state: AudioContextState;
		volume: number;
	};

	(async () => {
		if (!__BROWSER__) return;
		audio.devices = await navigator.mediaDevices.enumerateDevices();
		const deviceId =
			audio.devices.filter(({ kind, label }) => kind === 'audioinput' && label.match(/既定/))[0] ||
			audio.devices[0];
		mic_stream = await navigator.mediaDevices.getUserMedia({
			audio: { deviceId, echoCancellation }
		});
	})();
	$: if (mic_player && mic_stream) {
		mic_player.srcObject = mic_stream;
	}

	$: [zoom_top, zoom_right, zoom_bottom, zoom_left] = $zoomOffset;
	$: [view_top, view_right, view_bottom, view_left] = $viewOffset;
	$: [safe_top, safe_right, safe_bottom, safe_left] = $safeOffset;
	$: [zoom_point_left, zoom_point_top] = $zoomPoint;
	$: [view_point_left, view_point_top] = $viewPoint;
	$: [safe_point_left, safe_point_top] = $safePoint;
	$: [zoom_width, zoom_height] = $zoomSize;
	$: [view_width, view_height] = $viewSize;
	$: [safe_width, safe_height] = $safeSize;
	$: [keypad_width, keypad_height] = $keypadSize;
</script>

<Browser ratio={1.0} isDefaultSafeArea={true} />
<Viewport min={1.0} max={3.0} />
<KeyCapture disabled={false} />

<h1>Welcome to your library project</h1>
<p>Create your package using @sveltejs/package and preview/showcase your work with SvelteKit</p>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<hr />

<h3>audio</h3>

<AudioContext bind:state={audio.state}>
	<Audio bind:mediaElement={mic_player} controls />
	<AudioGain bind:volume={audio.volume}>
		<AudioStereoPanner pan={1}>
			<Audio
				crossorigin="anonymous"
				type="audio/mpeg"
				src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/858/outfoxing.mp3"
				controls
			/>
		</AudioStereoPanner>
		<AudioStereoPanner pan={-1}>
			<Audio
				crossorigin="anonymous"
				type="audio/mpeg"
				src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/858/outfoxing.mp3"
				controls
			/>
		</AudioStereoPanner>
	</AudioGain>
</AudioContext>
<button
	on:click={() => {
		audio.state = 'running';
		mic_player.play();
	}}>run audio.</button
>
<input
	type="range"
	id="volume"
	name="volume"
	step="0.01"
	min="0"
	max="2"
	bind:value={audio.volume}
/>
<p>{JSON.stringify(audio)}</p>

<hr />

<h3>state & device</h3>
<p>
	{#if $isPortrait}<span>Portrait size</span>{/if}
	{#if $isLandscape}<span>Landscape size</span>{/if}
	{#if $isKeypad}<span>Keypad Area</span>{/if}
	{#if $isZoom}<span>in Zoom</span>{/if}
	{#if $isOnline}<span>Online</span>{:else}<span>Offline</span>{/if}
	{#if $isWatching}<span>Watching</span>{/if}
	{#if $isActive}<span>Active</span>{/if}
</p>
<p>
	{#if isLegacy}<span>legacy browser</span>{:else}<span>modern browser</span>{/if}
	{#if isRadius}<span>radius</span>{/if}
	{#if isIOS}<span>IOS</span>{/if}
	{#if isAndroid}<span>Android</span>{/if}
	{#if isPC}<span>PC (not Tablet / Mobile / Android / IOS)</span>{/if}
	{#if isTablet}<span>Tablet</span>{/if}
	{#if isMobile}<span>Mobile</span>{/if}
	{#if isBlink}<span>Blink</span>{/if}
	{#if isMacSafari}<span>Mac Safari (Mac OS & webkit)</span>{/if}
	{#if isIOSlegacy}<span>IOS & legacy</span>{/if}
</p>
<p>keypad size : {keypad_width} x {keypad_height}</p>
<input type="text" value="for soft keyboard area test." />
<p>(press keys) : {$keys}</p>
<p>UA : {ua}</p>
<p>CPU : {cpu.architecture}</p>
<p>DEVICE : {device.vendor} {device.model} {device.type}</p>
<p>BROWSER : {browser.name} {browser.major} {browser.version}</p>
<p>ENGINE : {engine.name} {engine.version}</p>
<p>OS : {os.name} {os.version}</p>
<hr />
<h3>window zoom offset</h3>
<table>
	<tr>
		<td />
		<td>{zoom_top}</td>
		<td />
	</tr>
	<tr>
		<td>{zoom_left}</td>
		<td>{Math.floor($zoomScale * 10) / 10}</td>
		<td>{zoom_right}</td>
	</tr>
	<tr>
		<td />
		<td>{zoom_bottom}</td>
		<td />
	</tr>
</table>
<hr />
<h3>view offset</h3>
<table>
	<tr>
		<td />
		<td>{view_top}</td>
		<td />
	</tr>
	<tr>
		<td>{view_left}</td>
		<td />
		<td>{view_right}</td>
	</tr>
	<tr>
		<td />
		<td>{view_bottom}</td>
		<td />
	</tr>
</table>
<hr />
<h3>safe offset</h3>
<table>
	<tr>
		<td />
		<td>{safe_top}</td>
		<td />
	</tr>
	<tr>
		<td>{safe_left}</td>
		<td />
		<td>{safe_right}</td>
	</tr>
	<tr>
		<td />
		<td>{safe_bottom}</td>
		<td />
	</tr>
</table>
<hr />
<h3>safe offset</h3>
<div class="view">
	<p>view {view_width}px x {view_height}px</p>
	<div class="safe">
		<p>safe {safe_width}px x {safe_height}px</p>
		<div class="zoom">
			<p>zoom {zoom_width}px x {zoom_height}px</p>
		</div>
	</div>
</div>
<hr />
<p>
	vw,vh : {v}
</p>
<p>
	svw,svh : {sv}
</p>
<p>
	lvw,lvh : {lv}
</p>
<p>
	dvw,dvh : {dv}
</p>
<p />
<hr />
<p>
	locate : <br />
	<XY data={[[$locate.longitude, $locate.latitude]]} vw={180} vh={90} width="24em" height="12em" />
</p>
<p>
	<IOS_DeviceOrientationRequestButton>request</IOS_DeviceOrientationRequestButton>
	gyro : {$gyro.absolute}<br />
	<XY data={[[$gyro.alpha], [$gyro.beta], [$gyro.gamma]]} view={100} size="10em" />
</p>
<p>
	<IOS_DeviceMotionRequestButton>request</IOS_DeviceMotionRequestButton>
	gravity :<br />
	<XY
		data={[
			[10 * $gravity.x, 10 * $gravity.y],
			[10 * $gravity.x, 10 * $gravity.z]
		]}
		view={100}
		size="10em"
	/>
</p>
<p>
	rotate : {$rotate.absolute}<br />
	<XY data={[[$rotate.alpha], [$rotate.beta], [$rotate.gamma]]} view={100} size="10em" />
</p>
<p>
	accel :<br />
	<XY
		data={[
			[10 * $accel.x, 10 * $accel.y],
			[10 * $accel.x, 10 * $accel.z]
		]}
		view={100}
		size="10em"
	/>
</p>
<p>
	speed :<br />
	<XY
		data={[
			[2 * $speed.x, 2 * $speed.y],
			[2 * $speed.x, 2 * $speed.z]
		]}
		view={100}
		size="10em"
	/>
</p>
<p>
	point :<br />
	<XY
		data={[
			[1 * $point.x, 1 * $point.y],
			[1 * $point.x, 1 * $point.z]
		]}
		view={100}
		size="10em"
	/>
</p>
{#each $gamepads as pad, idx}
	<hr />
	<p>
		{#if pad}
			{@const {
				axes,
				buttons,
				hapticActuators,
				vibrationActuator,
				timestamp,
				id,
				index,
				mapping,
				connected
			} = pad}
			<div class="flex">
				<div class="item">
					<XY
						data={[
							[100 * axes[0], -100 * axes[1]],
							[100 * axes[2], -100 * axes[3]],
							[100 * (axes[4] ?? 0), -100 * (axes[5] ?? 0)]
						]}
						view={100}
						size="10em"
					/>
				</div>
				<div class="item">
					{idx}
					{index} : {connected} : {mapping} : {timestamp}<br />
					{id}<br />
					{#if hapticActuators}
						haptic :
						{#each hapticActuators as actuator, idx}
							{actuator.type} .
						{/each}<br />
					{/if}
					{#if vibrationActuator}
						vibration :
						{vibrationActuator.type} .
						<br />
					{/if}
					{#each buttons as { pressed, touched, value }, idx}
						{#if 0 === idx % 4}<br />{/if}
						<meter min="0" max="1" low="0.2" high="0.8" {value}>
							{#if touched}T{/if}
							{#if pressed}P{/if}
							{value}
						</meter>
						{labels.buttons[idx]} /
					{/each}
				</div>
			</div>
		{:else}
			not gamepad.
		{/if}
	</p>
{/each}

<span class="v" use:onResize={setV} />
<span class="sv" use:onResize={setSV} />
<span class="lv" use:onResize={setLV} />
<span class="dv" use:onResize={setDV} />

<style>
	:global(svg) {
		background-color: #aaffcc;
	}
	:global(.base) {
		stroke: #ffffff;
	}
	:global(.path0) {
		stroke: #aa88ff;
	}
	:global(.path1) {
		stroke: #ffaa88;
	}
	:global(.path2) {
		stroke: #88aaff;
	}

	.flex {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	.item {
		flex: auto;
	}

	.v {
		display: inline-block;
		width: 100vw;
		height: 100vh;
	}

	.sv {
		display: inline-block;
		width: 100svw;
		height: 100svh;
	}

	.lv {
		display: inline-block;
		width: 100lvw;
		height: 100lvh;
	}

	.dv {
		display: inline-block;
		width: 100dvw;
		height: 100dvh;
	}

	.view,
	.safe,
	.zoom {
		margin: 3px;
		border: 1px solid green;
	}
	span {
		border: 1px solid gray;
	}
</style>
