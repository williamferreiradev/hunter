<template>
  <div class="min-h-screen bg-supabase-dark">
    <Sidebar />
    <main class="ml-64 min-h-screen">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '~/components/Sidebar.vue'
</script>
