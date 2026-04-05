<script lang="ts">
	import { cn } from '$lib/utils';

	export let value: string = '';
	export let placeholder: string = '';
	export let disabled: boolean = false;
	export let className: string = '';

	let isOpen = false;

	function toggleOpen() {
		if (!disabled) {
			isOpen = !isOpen;
		}
	}

	function selectOption(optionValue: string) {
		value = optionValue;
		isOpen = false;
	}
</script>

<div class="relative">
	<button
		type="button"
		class={cn(
			'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:ring-0 file:ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
			className
		)}
		disabled
		on:click={toggleOpen}
	>
		<span class="block truncate">{value || placeholder}</span>
		<svg class="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path d="m6 9 6 6 6 6-6 6-6z"/>
		</svg>
	</button>

	{#if isOpen}
		<div class="absolute top-full mt-1 w-full z-50 bg-popover border border-border rounded-md shadow-lg">
			<slot />
		</div>
	{/if}
</div>
