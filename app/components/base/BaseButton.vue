<template>
  <button
    v-bind="$attrs"
    class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-supabase-dark disabled:opacity-50 disabled:cursor-not-allowed"
    :class="variantClasses"
  >
    <slot name="icon-left" />
    <slot />
    <slot name="icon-right" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
}>(), {
  variant: 'primary'
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-supabase text-white hover:bg-supabase-hover focus:ring-supabase'
    case 'secondary':
      return 'bg-supabase-dark-700 text-white hover:bg-gray-700 focus:ring-gray-500'
    case 'outline':
      return 'border border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white focus:ring-gray-500'
    case 'ghost':
      return 'text-gray-400 hover:text-white hover:bg-white/5 focus:ring-gray-500'
    default:
      return ''
  }
})
</script>
