<template>
  <div class="min-h-screen bg-supabase-dark text-white p-6 md:p-12 font-sans selection:bg-supabase selection:text-white">
    <!-- Header -->
    <header class="flex justify-between items-center mb-10">
      <div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p class="text-gray-400 mt-2">Gerencie suas extrações e leads</p>
      </div>
      <div class="flex gap-4">
        <!-- New Extraction Button -->
        <BaseButton variant="primary">
          <template #icon-left>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </template>
          Nova Extração
        </BaseButton>
      </div>
    </header>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div v-for="stat in stats" :key="stat.label" class="bg-supabase-dark-800 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all">
        <div class="flex justify-between items-start mb-4">
          <div class="p-2 rounded-lg" :class="stat.iconBg">
            <component :is="stat.icon" class="w-6 h-6" :class="stat.iconColor" />
          </div>
          <span class="text-xs font-medium px-2 py-1 rounded-full" :class="stat.trendUp ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'">
            {{ stat.trend }}
          </span>
        </div>
        <div class="text-3xl font-bold mb-1">{{ stat.value }}</div>
        <div class="text-sm text-gray-400">{{ stat.label }}</div>
      </div>
    </div>

    <!-- Quick Actions / Filters -->
    <div class="bg-supabase-dark-800 border border-gray-800 rounded-xl p-6 mb-10">
      <h2 class="text-xl font-semibold mb-6">Filtros Rápidos</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <BaseInput 
          v-model="filters.search" 
          label="Buscar Leads" 
          placeholder="Ex: Tatuadores..." 
          id="search"
          :icon="true"
        />
        <BaseInput 
          v-model="filters.location" 
          label="Localização" 
          placeholder="Ex: São Paulo" 
          id="location"
        />
        <div class="flex gap-2 w-full">
           <BaseButton variant="secondary" class="w-full">Filtrar</BaseButton>
           <BaseButton variant="outline" class="w-full">Limpar</BaseButton>
        </div>
      </div>
    </div>

    <!-- Recent Activity / Table Placeholder -->
    <div class="bg-supabase-dark-800 border border-gray-800 rounded-xl overflow-hidden">
      <div class="p-6 border-b border-gray-800 flex justify-between items-center">
        <h2 class="text-lg font-semibold">Extrações Recentes</h2>
        <button class="text-sm text-supabase hover:text-supabase-light">Ver todas</button>
      </div>
      <div class="p-8 text-center text-gray-500">
        <p>Nenhuma extração recente encontrada.</p>
        <BaseButton variant="ghost" class="mt-4">Iniciar primeira extração</BaseButton>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '~/components/base/BaseButton.vue'
import BaseInput from '~/components/base/BaseInput.vue'

// Icons mocked
const CreditCardIcon = { template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>' }
const UsersIcon = { template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' }
const ActivityIcon = { template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' }

const stats = [
  { label: 'Leads Extraídos', value: '1,234', trend: '+12%', trendUp: true, icon: UsersIcon, iconBg: 'bg-blue-500/20', iconColor: 'text-blue-500' },
  { label: 'Taxa de Sucesso', value: '98.5%', trend: '+2.1%', trendUp: true, icon: ActivityIcon, iconBg: 'bg-green-500/20', iconColor: 'text-green-500' },
  { label: 'Créditos Restantes', value: '450', trend: '-50', trendUp: false, icon: CreditCardIcon, iconBg: 'bg-purple-500/20', iconColor: 'text-purple-500' },
]

const filters = ref({
  search: '',
  location: ''
})
</script>
