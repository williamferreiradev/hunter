<template>
  <div class="p-8 text-white min-h-screen font-sans">
    
    <!-- Header -->
    <header class="mb-8">
        <h1 class="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Enriquecimento de Dados</h1>
        <p class="text-gray-400">Descubra CNPJ, Sócios e Faturamento estimado de seus leads.</p>
    </header>

    <!-- KPIs -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Eligible -->
        <div class="bg-supabase-dark-800 border border-gray-800 p-6 rounded-xl shadow-lg relative overflow-hidden group">
            <div class="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
            <div class="relative z-10">
                <div class="flex items-center justify-between mb-4">
                    <span class="text-gray-400 font-medium text-sm uppercase tracking-wider">Elegíveis</span>
                    <div class="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    </div>
                </div>
                <div class="text-3xl font-bold text-white">{{ stats.eligible }}</div>
                <div class="text-xs text-blue-400 mt-2">Leads sem CNPJ</div>
            </div>
        </div>

        <!-- Enriched -->
        <div class="bg-supabase-dark-800 border border-gray-800 p-6 rounded-xl shadow-lg relative overflow-hidden group">
            <div class="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-colors"></div>
            <div class="relative z-10">
                <div class="flex items-center justify-between mb-4">
                    <span class="text-gray-400 font-medium text-sm uppercase tracking-wider">Enriquecidos</span>
                    <div class="p-2 bg-green-500/10 rounded-lg text-green-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    </div>
                </div>
                <div class="text-3xl font-bold text-white">{{ stats.enriched }}</div>
                <div class="text-xs text-green-400 mt-2">Com CNPJ e Sócios</div>
            </div>
        </div>

        <!-- Success Rate -->
        <div class="bg-supabase-dark-800 border border-gray-800 p-6 rounded-xl shadow-lg relative overflow-hidden group">
            <div class="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors"></div>
            <div class="relative z-10">
                <div class="flex items-center justify-between mb-4">
                    <span class="text-gray-400 font-medium text-sm uppercase tracking-wider">Taxa de Sucesso</span>
                    <div class="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </div>
                </div>
                <div class="text-3xl font-bold text-white">{{ stats.successRate }}%</div>
                <div class="text-xs text-purple-400 mt-2">Média global</div>
            </div>
        </div>
    </div>

    <!-- Content -->
    <div class="bg-supabase-dark-800 border border-gray-800 rounded-xl overflow-hidden shadow-lg min-h-[400px]">
        <div v-if="loading" class="flex justify-center py-20">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-supabase"></div>
        </div>

        <div v-else-if="leads.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
            <div class="bg-gray-800/50 p-4 rounded-full mb-4 ring-1 ring-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Tudo em dia!</h3>
            <p class="text-gray-400 max-w-sm">Não há leads pendentes de enriquecimento no momento.</p>
        </div>

        <div v-else class="overflow-x-auto">
             <table class="w-full text-left text-sm text-gray-400">
                <thead class="bg-gray-900/50 text-gray-300 uppercase font-semibold text-xs tracking-wider border-b border-gray-800">
                    <tr>
                        <th class="px-6 py-4">Empresa</th>
                        <th class="px-6 py-4">Localização</th>
                        <th class="px-6 py-4">Dados Faltantes</th>
                        <th class="px-6 py-4 text-right">Ação</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-800">
                    <tr v-for="lead in leads" :key="lead.id" class="hover:bg-white/5 transition-colors group">
                        <td class="px-6 py-4">
                            <div class="font-bold text-white text-base">{{ lead.nome_empresa || 'Sem Nome' }}</div>
                            <div class="text-xs text-gray-500 mt-1">{{ lead.telefone || 'Sem telefone' }}</div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-2">
                                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                <span>{{ extractCity(lead.endereco) }}</span>
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex gap-2">
                                <span class="bg-gray-800 text-gray-400 px-2 py-1 rounded text-xs border border-gray-700">CNPJ</span>
                                <span class="bg-gray-800 text-gray-400 px-2 py-1 rounded text-xs border border-gray-700">Sócios</span>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-right">
                             <button 
                                @click="enrichLead(lead.id)"
                                :disabled="enrichingIds.has(lead.id)"
                                class="bg-supabase/10 hover:bg-supabase/20 text-supabase hover:text-supabase-hover border border-supabase/30 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ml-auto"
                            >
                                <svg v-if="enrichingIds.has(lead.id)" class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                                {{ enrichingIds.has(lead.id) ? 'Processando...' : 'Enriquecer' }}
                            </button>
                        </td>
                    </tr>
                </tbody>
             </table>
        </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const supabase = useSupabaseClient()
const user = useSupabaseUser()
// @ts-ignore
const userId = computed(() => user.value?.id || user.value?.sub)

const loading = ref(true)
const leads = ref<any[]>([])
const enrichingIds = ref<Set<number>>(new Set())

const stats = ref({
    eligible: 0,
    enriched: 0,
    successRate: 0
})

onMounted(() => {
    if (userId.value) {
        initData()
    } else {
        const unwatch = watch(user, (u) => {
            if (u) {
                initData()
                unwatch()
            }
        })
    }
})

async function initData() {
    loading.value = true
    await Promise.all([fetchLeads(), fetchStats()])
    loading.value = false
}

async function fetchLeads() {
    const { data, error } = await supabase
        .from('leads_hunter')
        .select('*')
        .or(`user_id.eq.${userId.value},user_id.is.null`)
        .is('cnpj', null) // Only missing CNPJ
        .order('created_at', { ascending: false })
        .limit(20) // Limit for demo
    
    if (data) leads.value = data
}

async function fetchStats() {
    // Stat 1: Eligible (Total missing CNPJ)
    const { count: startCount } = await supabase
        .from('leads_hunter')
        .select('*', { count: 'exact', head: true })
        .or(`user_id.eq.${userId.value},user_id.is.null`)
        .is('cnpj', null)
    
    // Stat 2: Enriched (Has CNPJ + Partners)
    const { count: enrichedCount } = await supabase
        .from('leads_hunter')
        .select('*', { count: 'exact', head: true })
        .or(`user_id.eq.${userId.value},user_id.is.null`)
        .not('cnpj', 'is', null)
    
    stats.value.eligible = startCount || 0
    stats.value.enriched = enrichedCount || 0
    
    const total = (stats.value.eligible + stats.value.enriched)
    stats.value.successRate = total > 0 
        ? Math.round((stats.value.enriched / total) * 100) 
        : 0
}

function extractCity(address: string) {
    if (!address) return 'Desconhecido'
    // Simple heuristic: Try to find "City - State" at the end
    const parts = address.split(',')
    if (parts.length > 1) {
        // Return last part or second to last
        return parts[parts.length - 2]?.trim() || parts[parts.length - 1]?.trim()
    }
    return address
}

function enrichLead(id: number) {
    enrichingIds.value.add(id)
    
    // Simulate API delay
    setTimeout(() => {
        toast.success('Lead enviado para a fila de enriquecimento!')
        enrichingIds.value.delete(id)
        
        // Remove from list to simulate processed
        leads.value = leads.value.filter(l => l.id !== id)
        stats.value.eligible--
    }, 2000)
}
</script>
