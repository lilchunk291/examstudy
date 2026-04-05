<script lang="ts">
	import { cn } from '$lib/utils';

	export let className: string = '';
</script>

<div class={cn('absolute top-full mt-1 w-full z-50 bg-popover border border-border rounded-md shadow-lg', className)}>
	<slot />
</div>
