<script lang="ts">
	import { cn } from '$lib/utils';
	import { getContext } from 'svelte';

	export let value: string = '';
	export let className: string = '';
	export let disabled: boolean = false;

	interface TabsContext {
		value: string;
		handleTabChange: (tabValue: string) => void;
	}

	const tabsContext = getContext<TabsContext>('tabs');

	function handleClick() {
		tabsContext?.handleTabChange(value);
	}

	$: activeTab = tabsContext?.value === value;
</script>

<button
	type="button"
	class={cn(
		'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
		activeTab ? 'bg-background text-foreground shadow-sm' : 'hover:bg-accent hover:text-accent-foreground',
		className
	)}
	disabled={disabled}
	on:click={handleClick}
>
	<slot />
</button>
