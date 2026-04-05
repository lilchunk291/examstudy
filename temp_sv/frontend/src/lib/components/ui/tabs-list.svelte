<script lang="ts">
	import { cn } from '$lib/utils';
	import { getContext } from 'svelte';

	export let value: string = '';
	export let className: string = '';

	interface TabsContext {
		value: string;
		handleTabChange: (tabValue: string) => void;
	}

	const tabsContext = getContext<TabsContext>('tabs');

	function handleClick(tabValue: string) {
		tabsContext?.handleTabChange(tabValue);
	}

	$: activeTab = tabsContext?.value === value;
</script>

<div class={cn('inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground', className)}>
	<slot />
</div>
