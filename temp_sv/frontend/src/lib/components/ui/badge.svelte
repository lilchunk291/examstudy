<script lang="ts">
	import { cn } from '$lib/utils';

	export let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let className: string = '';

	const baseClasses = 'inline-flex items-center rounded-full font-medium';
	
	const variants = {
		default: 'bg-primary text-primary-foreground hover:bg-primary/90',
		secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
		destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
		outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
	};

	const sizes = {
		sm: 'px-2 py-0.5 text-xs',
		md: 'px-2.5 py-0.5 text-sm',
		lg: 'px-3 py-1 text-base'
	};

	$: classes = cn(
		baseClasses,
		variants[variant],
		sizes[size],
		className
	);
</script>

<div class={classes}>
	<slot />
</div>
