<script lang="ts">
	import { __BROWSER__ } from 'svelte-petit-utils';
</script>

{#if __BROWSER__ && DeviceOrientationEvent?.requestPermission}
	<button on:click={DeviceOrientationEvent.requestPermission}><slot /></button>
{/if}
