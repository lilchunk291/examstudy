<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let variant: 'default' | 'outline' | 'destructive' = 'default';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let disabled = false;
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let className = '';
  
  const dispatch = createEventDispatcher();
  
  function handleClick(event: MouseEvent) {
    if (!disabled) {
      dispatch('click', event);
    }
  }
  
  $: baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
  
  $: variantClasses = {
    default: 'bg-lime-500 text-black hover:bg-lime-600',
    outline: 'border border-gray-700 bg-gray-900/50 text-white hover:bg-gray-800',
    destructive: 'bg-red-500 text-white hover:bg-red-600'
  }[variant];
  
  $: sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2 text-sm',
    lg: 'h-11 px-8 text-base'
  }[size];
</script>

<button
  {type}
  {disabled}
  class="{baseClasses} {variantClasses} {sizeClasses} {className}"
  on:click={handleClick}
  on:keydown
  on:keyup
>
  <slot />
</button>
