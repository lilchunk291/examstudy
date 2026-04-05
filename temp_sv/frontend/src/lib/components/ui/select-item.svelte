<script lang="ts">
	import { cn } from '$lib/utils';

	export let value: string = '';
	export let className: string = '';

	function handleClick() {
		// This will be handled by parent select component
	}
</script>

<div class={cn('relative flex cursor-default select-none py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground', className)} on:click={handleClick}>
	<slot />
</div>
