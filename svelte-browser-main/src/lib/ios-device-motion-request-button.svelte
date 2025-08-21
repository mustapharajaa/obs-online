<script lang="ts">
	import { __BROWSER__ } from 'svelte-petit-utils';
</script>

{#if __BROWSER__ && DeviceMotionEvent?.requestPermission}
	<button on:click={DeviceMotionEvent.requestPermission}><slot /></button>
{/if}
