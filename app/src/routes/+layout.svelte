<script lang="ts">
	import 'bulma/css/bulma.min.css';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Steno - Real-time Transcription with Scripture Detection</title>
</svelte:head>

{@render children()}
