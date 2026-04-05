<script lang="ts">
	import { cn } from '$lib/utils';

	export let value: number = 0;
	export let min: number = 0;
	export let max: number = 100;
	export let step: number = 1;
	export let className: string = '';

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = parseFloat(target.value);
	}
</script>

<div class="space-y-2">
	<input
		type="range"
		{min}
		{max}
		{step}
		{value}
		class={cn(
			'w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer',
			className
		)}
		on:input={handleInput}
	/>
</div>
