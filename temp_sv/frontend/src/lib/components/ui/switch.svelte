<script lang="ts">
	import { cn } from '$lib/utils';

	export let checked: boolean = false;
	export let disabled: boolean = false;
	export let className: string = '';

	const toggle = () => {
		if (!disabled) {
			checked = !checked;
		}
	};
</script>

<button
	type="button"
	role="switch"
	class={cn(
		'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	disabled
	on:click={toggle}
	aria-checked={checked}
>
	<span
		class={cn(
			'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
			checked ? 'bg-primary' : 'bg-muted'
		)}
		data-state={checked ? 'checked' : 'unchecked'}
	></span>
</button>
