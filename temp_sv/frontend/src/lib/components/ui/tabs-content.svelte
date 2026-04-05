<script lang="ts">
	import { cn } from '$lib/utils';
	import { getContext } from 'svelte';

	export let value: string = '';
	export let className: string = '';

	const tabsContext = getContext('tabs');

	$: activeTab = tabsContext?.value === value;
</script>

<div class={cn('mt-2', className)}>
	<slot />
</div>
