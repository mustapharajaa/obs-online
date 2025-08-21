<script type="ts">
	export let prompt = false;
	export let exit = () => {};

	function beforeunload(e: Event) {
		exit();
		e.preventDefault();
		e.returnValue = '';
		return '';
	}
</script>

<svelte:window on:beforeunload={prompt && beforeunload} />
