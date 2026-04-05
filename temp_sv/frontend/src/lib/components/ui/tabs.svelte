<script lang="ts">
	import { cn } from '$lib/utils';
	import { createEventDispatcher } from 'svelte';
	import { setContext } from 'svelte';

	export let value: string = '';
	export let className: string = '';

	const dispatch = createEventDispatcher();

	const tabsContext = setContext('tabs', {
		value,
		handleTabChange: (tabValue: string) => {
			value = tabValue;
			dispatch('change', { value: tabValue });
		}
	});
</script>

<div class="w-full">
	<div class="inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
		<slot name="list" />
	</div>
	<div class="mt-2">
		<slot />
	</div>
</div>
