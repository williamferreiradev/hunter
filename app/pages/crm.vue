<template>
  <div class="p-8 text-white min-h-screen">
    <header class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold mb-2">CRM Pipeline</h1>
        <p class="text-gray-400">Gerencie seus leads e negociações.</p>
      </div>
      <div class="flex gap-4 items-center">
         <!-- View Toggles -->
         <div class="bg-supabase-dark-800 p-1 rounded-lg border border-gray-800 flex">
            <button 
                @click="viewMode = 'kanban'"
                class="p-2 rounded-md transition-all"
                :class="viewMode === 'kanban' ? 'bg-supabase text-white' : 'text-gray-400 hover:text-white'"
                title="Visualização em Kanban"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/></svg>
            </button>
            <button 
                @click="viewMode = 'list'"
                class="p-2 rounded-md transition-all"
                :class="viewMode === 'list' ? 'bg-supabase text-white' : 'text-gray-400 hover:text-white'"
                title="Visualização em Lista"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </button>
         </div>

         <div class="bg-supabase-dark-800 px-4 py-2 rounded-lg border border-gray-800 text-sm">
            Total: <span class="font-bold text-white">{{ leads.length }}</span>
         </div>
      </div>
    </header>

    <!-- Skeleton Loading -->
    <div v-if="isLoading" class="flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
      <div v-for="i in 4" :key="i" class="flex-shrink-0 w-80 flex flex-col bg-supabase-dark-800 rounded-xl border border-gray-800 animate-pulse">
        <div class="p-4 border-b border-gray-700 flex justify-between items-center">
            <div class="h-5 w-24 bg-gray-700 rounded"></div>
            <div class="h-4 w-8 bg-gray-700 rounded-full"></div>
        </div>
        <div class="p-3 space-y-3">
            <div v-for="j in 3" :key="j" class="h-28 bg-supabase-dark-900 rounded-lg border border-gray-700"></div>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-else-if="viewMode === 'list'" class="bg-supabase-dark-800 border border-gray-800 rounded-xl overflow-hidden animate-fade-in-up">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-400">
                <thead class="bg-gray-900/50 text-gray-200 uppercase font-medium">
                    <tr>
                        <th class="px-6 py-4">Empresa</th>
                        <th class="px-6 py-4">Contato</th>
                        <th class="px-6 py-4">Site / Dados</th>
                        <th class="px-6 py-4">Status</th>
                        <th class="px-6 py-4 text-right">Data</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-800">
                    <tr v-for="lead in leads" :key="lead.id" class="hover:bg-white/5 transition-colors">
                        <td class="px-6 py-4">
                            <div class="font-medium text-white">{{ lead.nome_empresa || 'Sem Nome' }}</div>
                            <div class="text-xs">{{ lead.ramo_atividade }}</div>
                        </td>
                        <td class="px-6 py-4">
                             <div>{{ lead.telefone || '-' }}</div>
                             <div class="text-xs text-gray-500">{{ lead.instagram || '-' }}</div>
                        </td>
                        <td class="px-6 py-4">
                            <a v-if="lead.site" :href="lead.site.startsWith('http') ? lead.site : `https://${lead.site}`" target="_blank" class="text-supabase hover:underline truncate max-w-[150px] block">
                                {{ lead.site }}
                            </a>
                            <span v-else class="text-gray-600">-</span>
                        </td>
                        <td class="px-6 py-4">
                            <select 
                                :value="lead.status || 'novo'" 
                                @change="(e) => onStatusChange(lead.id, (e.target as HTMLSelectElement).value)"
                                class="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-supabase outline-none cursor-pointer"
                                :class="{
                                    'text-blue-400 border-blue-500/30': !lead.status || lead.status === 'novo',
                                    'text-yellow-400 border-yellow-500/30': lead.status === 'em_contato',
                                    'text-green-400 border-green-500/30': lead.status === 'fechado',
                                    'text-red-400 border-red-500/30': lead.status === 'perdido'
                                }"
                            >
                                <option value="novo">Novo</option>
                                <option value="em_contato">Em Contato</option>
                                <option value="fechado">Fechado</option>
                                <option value="perdido">Perdido</option>
                            </select>
                        </td>
                        <td class="px-6 py-4 text-right">
                            {{ new Date(lead.created_at).toLocaleDateString() }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Kanban Board -->
    <div v-else class="flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
      
      <!-- Coluna: Novo -->
      <div class="flex-shrink-0 w-80 flex flex-col bg-supabase-dark-800 rounded-xl border border-gray-800">
        <div class="p-4 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-supabase-dark-800 rounded-t-xl z-10">
            <h3 class="font-semibold flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-blue-500"></span> Novo
            </h3>
            <span class="text-xs bg-gray-700 px-2 py-1 rounded-full text-gray-300">{{ columns.novo.length }}</span>
        </div>
        <div class="flex-1 overflow-y-auto p-3 scrollbar-hide">
            <draggable 
                v-model="columns.novo" 
                group="leads" 
                item-key="id"
                @change="(e) => onDragChange(e, 'novo')"
                class="flex flex-col gap-3 min-h-[100px]"
            >
                <template #item="{element}">
                    <LeadCard :lead="element" />
                </template>
            </draggable>
        </div>
      </div>

      <!-- Coluna: Em Contato -->
      <div class="flex-shrink-0 w-80 flex flex-col bg-supabase-dark-800 rounded-xl border border-gray-800">
        <div class="p-4 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-supabase-dark-800 rounded-t-xl z-10">
            <h3 class="font-semibold flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-yellow-500"></span> Em Contato
            </h3>
            <span class="text-xs bg-gray-700 px-2 py-1 rounded-full text-gray-300">{{ columns.em_contato.length }}</span>
        </div>
        <div class="flex-1 overflow-y-auto p-3 scrollbar-hide">
             <draggable 
                v-model="columns.em_contato" 
                group="leads" 
                item-key="id"
                @change="(e) => onDragChange(e, 'em_contato')"
                class="flex flex-col gap-3 min-h-[100px]"
            >
                <template #item="{element}">
                    <LeadCard :lead="element" />
                </template>
            </draggable>
        </div>
      </div>

      <!-- Coluna: Fechado -->
      <div class="flex-shrink-0 w-80 flex flex-col bg-supabase-dark-800 rounded-xl border border-gray-800">
        <div class="p-4 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-supabase-dark-800 rounded-t-xl z-10">
            <h3 class="font-semibold flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-green-500"></span> Fechado
            </h3>
            <span class="text-xs bg-gray-700 px-2 py-1 rounded-full text-gray-300">{{ columns.fechado.length }}</span>
        </div>
        <div class="flex-1 overflow-y-auto p-3 scrollbar-hide">
             <draggable 
                v-model="columns.fechado" 
                group="leads" 
                item-key="id"
                @change="(e) => onDragChange(e, 'fechado')"
                class="flex flex-col gap-3 min-h-[100px]"
            >
                <template #item="{element}">
                    <LeadCard :lead="element" />
                </template>
            </draggable>
        </div>
      </div>

      <!-- Coluna: Perdido -->
      <div class="flex-shrink-0 w-80 flex flex-col bg-supabase-dark-800 rounded-xl border border-gray-800">
        <div class="p-4 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-supabase-dark-800 rounded-t-xl z-10">
            <h3 class="font-semibold flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-red-500"></span> Perdido
            </h3>
            <span class="text-xs bg-gray-700 px-2 py-1 rounded-full text-gray-300">{{ columns.perdido.length }}</span>
        </div>
        <div class="flex-1 overflow-y-auto p-3 scrollbar-hide">
             <draggable 
                v-model="columns.perdido" 
                group="leads" 
                item-key="id"
                @change="(e) => onDragChange(e, 'perdido')"
                class="flex flex-col gap-3 min-h-[100px]"
            >
                <template #item="{element}">
                    <LeadCard :lead="element" />
                </template>
            </draggable>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import draggable from 'vuedraggable'
import LeadCard from '~/components/crm/LeadCard.vue'

const supabase = useSupabaseClient()
const leads = ref([])
const isLoading = ref(true)
const viewMode = ref('kanban') // 'kanban' | 'list'

// Colunas Reativas
const columns = ref({
    novo: [],
    em_contato: [],
    fechado: [],
    perdido: []
})

// Busca inicial
async function fetchLeads() {
    isLoading.value = true
    try {
        const { data, error } = await supabase
            .from('leads_hunter')
            .select('*')
            .order('created_at', { ascending: false })
        
        if (error) {
            console.error('Erro ao buscar leads:', error)
            return
        }

        leads.value = data || []
        organizeColumns()
    } finally {
        isLoading.value = false
    }
}

// Organiza os leads nas colunas certas baseado no status
function organizeColumns() {
    columns.value.novo = leads.value.filter(l => !l.status || l.status === 'novo')
    columns.value.em_contato = leads.value.filter(l => l.status === 'em_contato')
    columns.value.fechado = leads.value.filter(l => l.status === 'fechado')
    columns.value.perdido = leads.value.filter(l => l.status === 'perdido')
}

// Atualiza o status no banco quando move (Kanban)
async function onDragChange(event: any, newStatus: string) {
    if (event.added) {
        const leadId = event.added.element.id
        await updateLeadStatus(leadId, newStatus)
    }
}

// Atualiza o status via Lista (Select)
async function onStatusChange(leadId: number, newStatus: string) {
    await updateLeadStatus(leadId, newStatus)
    // Atualiza localmente para refletir na lista e no kanban
    const lead = leads.value.find(l => l.id === leadId)
    if (lead) lead.status = newStatus
    organizeColumns()
}

// Função centralizada de update
async function updateLeadStatus(leadId: number, status: string) {
    const { error } = await supabase
        .from('leads_hunter')
        .update({ status })
        .eq('id', leadId)
    
    if (error) {
        console.error('Erro ao atualizar status:', error)
        alert('Erro ao salvar alteração.')
    }
}

onMounted(() => {
    fetchLeads()
})
</script>

<style scoped>
/* Esconde barra de rolagem mas permite scroll */
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
