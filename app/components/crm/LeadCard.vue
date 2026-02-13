<template>
  <div class="bg-supabase-dark-900 p-4 rounded-lg border border-gray-700 hover:border-supabase cursor-grab active:cursor-grabbing shadow-sm transition-all group">
    <div class="flex justify-between items-start mb-2">
        <h4 class="font-bold text-white text-sm line-clamp-2" :title="lead.nome_empresa">
            {{ lead.nome_empresa || 'Sem Nome' }}
        </h4>
        <a v-if="lead.website_url" :href="lead.website_url" target="_blank" class="text-gray-500 hover:text-supabase" title="Visitar Site">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        </a>
    </div>
    
    <div class="text-xs text-gray-400 space-y-1">
        <div v-if="lead.telefone" class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span>{{ lead.telefone }}</span>
        </div>
        <div v-if="lead.endereco" class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span class="truncate max-w-[200px]" :title="lead.endereco">{{ lead.endereco }}</span>
        </div>
        <div v-if="lead.termo_pesquisa" class="mt-2 pt-2 border-t border-gray-800 flex items-center gap-1 text-[10px] text-gray-500">
             <span class="bg-gray-800 px-1.5 py-0.5 rounded">{{ lead.termo_pesquisa }}</span>
             <span v-if="lead.nota" class="bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded">{{ lead.nota }}</span>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  lead: any
}>()
</script>
