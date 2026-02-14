<template>
  <div class="p-8 text-white min-h-screen font-sans">
    <header class="mb-8">
        <div class="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
            <div>
                <h1 class="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">CRM Pipeline</h1>
                <p class="text-gray-400">Gerencie seus leads e negociações com precisão.</p>
            </div>
            
            <div class="flex gap-3">
                 <NuxtLink to="/hunter?new=true" class="bg-supabase hover:bg-supabase-hover text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Nova Extração
                 </NuxtLink>
            </div>
        </div>

        <!-- Toolbar -->
        <div class="mt-8 flex flex-col md:flex-row gap-4 justify-between items-center bg-supabase-dark-800 p-4 rounded-xl border border-gray-800 shadow-sm">
            <!-- Filters -->
            <div v-if="viewMode === 'list'" class="flex flex-1 gap-4 w-full md:w-auto flex-wrap md:flex-nowrap">
                
                <!-- Busca Textual -->
                <div class="relative flex-1 min-w-[200px]">
                     <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                     </span>
                     <input 
                        v-model="searchQuery" 
                        @input="onSearchInput"
                        type="text" 
                        placeholder="Buscar por nome da empresa..." 
                        class="w-full bg-black/50 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-supabase focus:border-supabase outline-none placeholder-gray-500 text-white transition-all shadow-inner"
                     >
                </div>

                <!-- Dropdown Termo de Pesquisa -->
                <div class="relative min-w-[200px]">
                    <select 
                        v-model="selectedTerm" 
                        @change="fetchLeads(1)"
                        class="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-supabase focus:border-supabase outline-none text-white appearance-none cursor-pointer shadow-inner pr-8 truncate"
                    >
                        <option value="">Todas as Campanhas</option>
                        <option v-for="term in availableTerms" :key="term" :value="term">{{ term }}</option>
                    </select>
                    <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                </div>

                <!-- Dropdown Status -->
                <div class="relative min-w-[160px]">
                    <select 
                        v-model="selectedStatus" 
                        @change="fetchLeads(1)"
                        class="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-supabase focus:border-supabase outline-none text-white appearance-none cursor-pointer shadow-inner pr-8"
                    >
                        <option value="">Todos os Status</option>
                        <option value="novo">Novo</option>
                        <option value="em_contato">Em Contato</option>
                        <option value="fechado">Fechado</option>
                        <option value="perdido">Perdido</option>
                    </select>
                    <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                </div>
            </div>

            <!-- View Toggles & Stats -->
            <div class="flex gap-4 items-center w-full md:w-auto justify-end mt-4 md:mt-0">
                <div class="bg-supabase-dark-900 p-1 rounded-lg border border-gray-800 flex shadow-sm">
                    <button 
                        @click="viewMode = 'kanban'"
                        class="p-2 rounded-md transition-all duration-200"
                        :class="viewMode === 'kanban' ? 'bg-gray-700 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'"
                        title="Kanban"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/></svg>
                    </button>
                    <button 
                        @click="viewMode = 'list'"
                        class="p-2 rounded-md transition-all duration-200"
                        :class="viewMode === 'list' ? 'bg-gray-700 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'"
                        title="Lista"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    </button>
                </div>
            </div>
        </div>
    </header>

    <!-- Content -->
    <div class="relative min-h-[400px]">
        <!-- Loading State -->
        <div v-if="isLoading" class="absolute inset-0 z-20 flex justify-center items-start pt-20 bg-supabase-dark-900/10 backdrop-blur-[2px] rounded-xl transition-all duration-300">
             <div class="flex flex-col items-center gap-3 bg-supabase-dark-800 p-6 rounded-xl border border-gray-700 shadow-2xl">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-supabase"></div>
                <span class="text-sm text-gray-400 font-medium">Carregando leads...</span>
             </div>
        </div>

        <!-- Empty State -->
        <div v-if="!isLoading && leads.length === 0" class="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-800 rounded-xl bg-supabase-dark-800/30">
            <div class="bg-gray-800/50 p-4 rounded-full mb-4 ring-1 ring-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Nenhum lead encontrado</h3>
            <p class="text-gray-400 max-w-sm mb-6">Não encontramos resultados com os filtros atuais.</p>
            <button @click="clearFilters" class="text-supabase hover:text-supabase-hover hover:underline transition-colors font-medium">Limpar Filtros</button>
        </div>

        <!-- List View -->
        <div v-if="!isLoading && leads.length > 0 && viewMode === 'list'" class="bg-supabase-dark-800 border border-gray-800 rounded-xl overflow-hidden shadow-lg animate-fade-in ring-1 ring-white/5">
             <div class="overflow-x-auto">
                <table class="w-full text-left text-sm text-gray-400">
                    <thead class="bg-gray-900/50 text-gray-300 uppercase font-semibold text-xs tracking-wider border-b border-gray-800">
                        <tr>
                            <th class="px-6 py-4">Empresa</th>
                            <th class="px-6 py-4">Campanha</th>
                            <th class="px-6 py-4">Contato</th>
                            <th class="px-6 py-4">Status</th>
                            <th class="px-6 py-4 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-800">
                        <tr v-for="lead in leads" :key="lead.id" class="hover:bg-white/5 transition-colors group">
                            <td class="px-6 py-4">
                                <div class="font-bold text-white text-base truncate max-w-[200px]" :title="lead.nome_empresa">{{ lead.nome_empresa || 'Sem Nome' }}</div>
                                <div class="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    <span class="truncate max-w-[150px]">{{ lead.endereco || 'Sem endereço' }}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="bg-gray-800 border border-gray-700 text-gray-300 px-2 py-1 rounded text-xs truncate max-w-[120px] block" :title="lead.termo_pesquisa">
                                    {{ lead.termo_pesquisa || '-' }}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                 <div class="flex items-center gap-2 mb-1.5" v-if="lead.telefone">
                                    <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                    <span class="text-white">{{ lead.telefone }}</span>
                                 </div>
                                 <div v-if="lead.website_url">
                                     <a :href="lead.website_url" target="_blank" class="text-supabase hover:text-supabase-hover hover:underline flex items-center gap-2 text-xs font-medium transition-colors">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                        Visitar Site
                                     </a>
                                 </div>
                                 <div v-else class="text-xs text-gray-600 italic">Sem site</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="relative">
                                    <select 
                                        :value="lead.status || 'novo'" 
                                        @change="(e: Event) => onStatusChange(lead.id, (e.target as HTMLSelectElement).value)"
                                        class="appearance-none pl-3 pr-8 py-1.5 rounded-md text-xs font-semibold focus:ring-2 focus:ring-offset-1 focus:ring-offset-supabase-dark-900 focus:outline-none cursor-pointer border transition-all"
                                        :class="getStatusColor(lead.status)"
                                    >
                                        <option value="novo">Novo</option>
                                        <option value="em_contato">Em Contato</option>
                                        <option value="fechado">Fechado</option>
                                        <option value="perdido">Perdido</option>
                                    </select>
                                    <div class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" :class="getIconColor(lead.status)">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <button 
                                    @click="deleteLead(lead.id)" 
                                    class="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    title="Excluir Lead"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
             </div>
        </div>

        <!-- Kanban View -->
        <div v-if="!isLoading && leads.length > 0 && viewMode === 'kanban'" class="flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-320px)] snap-x">
             <div v-for="(colLeads, status) in columns" :key="status" class="flex-shrink-0 w-80 flex flex-col bg-supabase-dark-800 rounded-xl border border-gray-800 shadow-lg snap-center" :class="{'opacity-75': colLeads.length === 0}">
                <div class="p-4 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-supabase-dark-800 rounded-t-xl z-10 backdrop-blur-sm bg-opacity-95">
                    <h3 class="font-bold flex items-center gap-2 capitalize text-white">
                        <span class="w-2.5 h-2.5 rounded-full shadow-sm" :class="getStatusDotColor(status)"></span> 
                        {{ formatStatus(status) }}
                    </h3>
                    <span class="text-xs bg-gray-700/50 border border-gray-700 px-2.5 py-0.5 rounded-full text-gray-300 font-mono">{{ colLeads.length }}</span>
                </div>
                <div class="flex-1 overflow-y-auto p-3 scrollbar-hide">
                    <draggable 
                        :list="colLeads" 
                        group="leads" 
                        item-key="id"
                        @change="(e: any) => onDragChange(e, status)"
                        class="flex flex-col gap-3 min-h-[100px] h-full"
                        ghost-class="ghost-card"
                    >
                        <template #item="{element}">
                            <LeadCard :lead="element" />
                        </template>
                    </draggable>
                </div>
             </div>
        </div>
    </div>

    <!-- Pagination -->
    <div v-if="!isLoading && totalLeads > 0" class="mt-8 flex justify-between items-center border-t border-gray-800 pt-6">
        <div class="text-sm text-gray-500">
            Mostrando <span class="font-medium text-white">{{ (page - 1) * itemsPerPage + 1 }}</span> - <span class="font-medium text-white">{{ Math.min(page * itemsPerPage, totalLeads) }}</span> de <span class="font-medium text-white">{{ totalLeads }}</span>
        </div>
        <div class="flex gap-2">
            <button 
                @click="changePage(page - 1)" 
                :disabled="page === 1"
                class="px-4 py-2 text-sm bg-supabase-dark-800 border border-gray-700 rounded-lg hover:bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
                Anterior
            </button>
            <div class="flex items-center gap-1">
                <span class="px-3 py-2 text-sm bg-supabase-dark-900 border border-gray-700 rounded-lg text-white font-medium min-w-[40px] text-center">
                    {{ page }}
                </span>
                <span class="text-gray-500 text-sm">/ {{ totalPages }}</span>
            </div>
            <button 
                @click="changePage(page + 1)" 
                :disabled="page >= totalPages"
                class="px-4 py-2 text-sm bg-supabase-dark-800 border border-gray-700 rounded-lg hover:bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
                Próxima
            </button>
        </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import draggable from 'vuedraggable'
import LeadCard from '~/components/crm/LeadCard.vue'

interface Lead {
    id: number
    created_at: string
    user_id: string
    nome_empresa: string
    ramo_atividade?: string
    telefone?: string
    instagram?: string
    website_url?: string 
    site?: string 
    endereco?: string
    termo_pesquisa?: string
    status: string
}

const supabase = useSupabaseClient()
const user = useSupabaseUser()
// @ts-ignore
const userId = computed(() => user.value?.id || user.value?.sub)

const leads = ref<Lead[]>([])
const isLoading = ref(true)
const viewMode = ref('list') 

// State
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedTerm = ref('') // Novo filtro de Campanha
const availableTerms = ref<string[]>([]) // Lista de termos únicos

const page = ref(1)
const itemsPerPage = 20
const totalLeads = ref(0)
let searchTimeout: any = null

const totalPages = computed(() => Math.ceil(totalLeads.value / itemsPerPage))

// Colunas Reativas
const columns = ref<{ [key: string]: Lead[] }>({
    novo: [],
    em_contato: [],
    fechado: [],
    perdido: []
})

// === Fetch Data ===

// Buscar termos únicos para o filtro
async function fetchTerms() {
    if (!userId.value) return
    const { data } = await supabase
        .from('leads_hunter')
        .select('termo_pesquisa')
        .or(`user_id.eq.${userId.value},user_id.is.null`)
        .order('termo_pesquisa')
    
    if (data) {
        // Filtrar únicos e remover nulos
        availableTerms.value = [...new Set((data as any[]).map(i => i.termo_pesquisa).filter(Boolean))] as string[]
    }
}

async function fetchLeads(targetPage = 1) {
    console.log('fetchLeads called. User ID:', userId.value) // DEBUG

    // Garante que o user existe antes de buscar
    if (!userId.value) {
        console.warn('User ID missing, aborting fetch.') // DEBUG
        isLoading.value = false // Para o loading state
        return
    }
    
    page.value = targetPage
    isLoading.value = true
    
    try {
        let query = supabase
            .from('leads_hunter')
            .select('*', { count: 'exact' })
            .or(`user_id.eq.${userId.value},user_id.is.null`)
            .order('created_at', { ascending: false })

        // Filtros
        if (searchQuery.value) {
            query = query.ilike('nome_empresa', `%${searchQuery.value}%`) // Busca Case Insensitive
        }
        if (selectedStatus.value) {
            query = query.eq('status', selectedStatus.value)
        }
        if (selectedTerm.value) {
             query = query.eq('termo_pesquisa', selectedTerm.value)
        }

        // Paginação
        const from = (page.value - 1) * itemsPerPage
        const to = from + itemsPerPage - 1
        query = query.range(from, to)
        
        console.log('Executing Supabase query...', { from, to, filters: { search: searchQuery.value, status: selectedStatus.value } }) // DEBUG

        const { data, count, error } = await query

        if (error) throw error

        console.log('Leads fetched:', data?.length, 'Total:', count) // DEBUG
        leads.value = data || []
        totalLeads.value = count || 0
        organizeColumns()

    } catch (error) {
        console.error('Erro ao buscar leads:', error)
    } finally {
        isLoading.value = false
    }
}

// === Actions ===

function organizeColumns() {
    columns.value.novo = leads.value.filter(l => !l.status || l.status === 'novo')
    columns.value.em_contato = leads.value.filter(l => l.status === 'em_contato')
    columns.value.fechado = leads.value.filter(l => l.status === 'fechado')
    columns.value.perdido = leads.value.filter(l => l.status === 'perdido')
}

// Debounce Search
function onSearchInput() {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        fetchLeads(1)
    }, 500)
}

function clearFilters() {
    searchQuery.value = ''
    selectedStatus.value = ''
    selectedTerm.value = ''
    fetchLeads(1)
}

function changePage(newPage: number) {
    if (newPage >= 1 && newPage <= totalPages.value) {
        fetchLeads(newPage)
    }
}

// Delete Lead
async function deleteLead(id: number) {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return

    try {
        const { error } = await supabase
            .from('leads_hunter')
            .delete()
            .eq('id', id)
            .or(`user_id.eq.${userId.value},user_id.is.null`) 

        if (error) throw error

        leads.value = leads.value.filter(l => l.id !== id)
        totalLeads.value--
        organizeColumns()
        alert('Lead removido com sucesso.')

    } catch (error) {
        console.error('Erro ao excluir:', error)
        alert('Erro ao excluir lead.')
    }
}

// Update Status Logic
async function updateLeadStatus(leadId: number, status: string) {
    const { error } = await supabase
        .from('leads_hunter')
        // @ts-ignore
        .update({ status })
        .eq('id', leadId)
        .or(`user_id.eq.${userId.value},user_id.is.null`) 
    
    if (error) {
        console.error('Erro update:', error)
        alert('Falha ao atualizar status.')
    }
}

async function onDragChange(event: any, newStatus: string) {
    if (event.added) {
        const lead = event.added.element
        await updateLeadStatus(lead.id, newStatus)
        lead.status = newStatus 
    }
}

async function onStatusChange(leadId: number, newStatus: string) {
    await updateLeadStatus(leadId, newStatus)
    const lead = leads.value.find(l => l.id === leadId)
    if (lead) lead.status = newStatus
    organizeColumns()
}

// === Helpers ===
function formatStatus(status: string) {
    return status.replace('_', ' ')
}

function getStatusColor(status: string) {
    switch (status) {
        case 'em_contato': return 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30 ring-yellow-500/50'
        case 'fechado': return 'bg-green-900/20 text-green-400 border-green-500/30 ring-green-500/50'
        case 'perdido': return 'bg-red-900/20 text-red-400 border-red-500/30 ring-red-500/50'
        default: return 'bg-blue-900/20 text-blue-400 border-blue-500/30 ring-blue-500/50'
    }
}

function getIconColor(status: string) {
    switch (status) {
        case 'em_contato': return 'text-yellow-400'
        case 'fechado': return 'text-green-400'
        case 'perdido': return 'text-red-400'
        default: return 'text-blue-400'
    }
}

function getStatusDotColor(status: string) {
    switch (status) {
        case 'em_contato': return 'bg-yellow-500'
        case 'fechado': return 'bg-green-500'
        case 'perdido': return 'bg-red-500'
        default: return 'bg-blue-500'
    }
}

// Init
onMounted(() => {
    // Watch para garantir que temos o user antes de buscar
    if (user.value) {
        fetchLeads()
        fetchTerms()
    } else {
        // Se a página carregar e o user ainda não estiver pronto (SSR/Hydration)
        const unwatch = watch(user, (newUser) => {
            if (newUser) {
                fetchLeads()
                fetchTerms()
                unwatch()
            }
        })
    }
})

// Clear filters when switching to Kanban
watch(viewMode, (newMode) => {
    if (newMode === 'kanban') {
        clearFilters()
    }
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.ghost-card {
    opacity: 0.5;
    background: #1f2937;
    border: 1px dashed #4b5563;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
}
tbody tr {
    animation: fadeIn 0.3s ease-in-out;
}
</style>
