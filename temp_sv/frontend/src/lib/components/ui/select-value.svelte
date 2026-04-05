<script lang="ts">
	import { cn } from '$lib/utils';

	export let className: string = '';
</script>

<span class={cn('block truncate', className)}>
	<slot />
</span>
