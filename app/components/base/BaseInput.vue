<template>
  <div class="flex flex-col gap-1.5 w-full">
    <label v-if="label" :for="id" class="text-sm font-medium text-gray-300">
      {{ label }}
    </label>
    <div class="relative">
      <input
        :id="id"
        v-bind="$attrs"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        class="w-full px-4 py-2.5 bg-supabase-dark-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-supabase focus:ring-1 focus:ring-supabase transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        :class="{ 'pl-10': icon }"
      />
      <div v-if="icon" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <slot name="icon">
          <!-- Default generic icon if none provided but prop is true? -->
          <!-- We can use a dynamic component or just slot -->
        </slot>
      </div>
    </div>
    <span v-if="error" class="text-xs text-red-500">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

defineProps<{
  id?: string
  label?: string
  modelValue: string | number
  error?: string
  icon?: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>
