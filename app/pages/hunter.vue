<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import BaseButton from '~/components/base/BaseButton.vue'

const supabase = useSupabaseClient()

// --- ESTADO DA LISTAGEM ---
const showExtraction = ref(false)
const leadsList = ref<any[]>([])
const totalLeads = ref(0)
const currentPage = ref(1)
const itemsPerPage = 8
const isLoadingList = ref(false)

// --- ESTADO DA EXTRAÇÃO ---
const extractionStep = ref<'selection' | 'form'>('selection')
const selectedSource = ref<string | null>(null)
const termo = ref('')
const loading = ref(false)
const status = ref('Pronto para a caçada...')
const extractedLeads = ref<any[]>([]) // Leads da extração ATUAL
const timerRef = ref(null) // Referência para o Timer
// const { $toast } = useNuxtApp() as any // REMOVIDO: Usando import direto

// --- COMPUTED ---
const totalPages = computed(() => Math.ceil(totalLeads.value / itemsPerPage))

// --- MÉTODOS DA LISTAGEM ---
async function fetchLeads(page = 1) {
    const user = useSupabaseUser()
    // @ts-ignore
    const userId = user.value?.id || user.value?.sub
    
    if (!userId) {
        console.warn('Hunter: Usuário não identificado para listar leads.')
        return
    }

    isLoadingList.value = true
    try {
        const from = (page - 1) * itemsPerPage
        const to = from + itemsPerPage - 1

        // Busca leads paginados DO USUÁRIO ATUAL
        const { data, error, count } = await supabase
            .from('leads_hunter')
            .select('*', { count: 'exact' })
            .eq('user_id', userId) // <--- FILTRO ADICIONADO
            .order('created_at', { ascending: false })
            .range(from, to)

        if (error) throw error

        leadsList.value = data || []
        totalLeads.value = count || 0
    } catch (e) {
        console.error('Erro ao buscar leads:', e)
    } finally {
        isLoadingList.value = false
    }
}

function changePage(newPage: number) {
    if (newPage >= 1 && newPage <= totalPages.value) {
        currentPage.value = newPage
        fetchLeads(newPage)
    }
}

// --- MÉTODOS DA EXTRAÇÃO ---
const dispararSistema = async () => {
  if (!termo.value) return toast.warning('Digita alguma coisa aí, chefe!')
  
  loading.value = true
  status.value = '🚀 Inicializando satélite...'
  extractedLeads.value = []

  try {
    status.value = '🕵️ O Robô está abrindo o navegador no seu computador...'
    
    // Chama o nosso backend
    // @ts-ignore
    const { data, error } = await useFetch('/api/hunter', {
      method: 'POST',
      body: { termo: termo.value },
      timeout: 120000 // 2 minutos de tolerância
    })

    if (error.value) throw error.value

    if (data.value && (data.value as any).status === 'Finalizado') {
      status.value = `✅ Sucesso! O robô finalizou a missão.`
      
      // Animação de conclusão (Visual)
      if (timerRef.value) {
         // @ts-ignore
         timerRef.value.finish()
      }
      
      // Pequeno delay para o usuário ver a barra em 100%
      await new Promise(r => setTimeout(r, 1500))

      toast.success(`Sucesso! O robô terminou. Os leads estão na lista.`)
      
      // Atualiza a lista principal
      fetchLeads(1) 
      
      // Limpa o campo para nova busca
      termo.value = ''
      
      // Opcional: Voltar para a lista automaticamente
      // showExtraction.value = false
      
    } else {
      status.value = '❌ O robô reportou erro ou voltou vazio.'
      toast.error('O robô voltou de mãos vazias ou deu erro.')
      if (data.value && (data.value as any).logs) {
         console.log('LOGS DO ROBÔ:', (data.value as any).logs)
      }
    }

  } catch (e: any) {
    status.value = `❌ Erro crítico: ${e.message}`
    toast.error(`Erro crítico: ${e.message}`)
  } finally {
    loading.value = false
  }
}

function selectSource(source: string) {
    selectedSource.value = source
}

function nextStep() {
    if (selectedSource.value) {
        extractionStep.value = 'form'
    }
}

function toggleMode() {
    showExtraction.value = !showExtraction.value
    // Reset para o passo inicial
    if (showExtraction.value) {
        extractionStep.value = 'selection'
        selectedSource.value = null // Opcional: limpar seleção anterior
    }
    
    // Se voltar para a lista, recarrega para garantir dados frescos
    if (!showExtraction.value) {
        fetchLeads(currentPage.value)
    }
}

// Inicialização
onMounted(() => {
    fetchLeads()
    
    // Verifica se veio do dashboard com intenção de nova extração
    const route = useRoute()
    if (route.query.new) {
        showExtraction.value = true
        extractionStep.value = 'selection' // Garante que comece na seleção
    }
})
</script>

<template>
  <div class="min-h-screen bg-supabase-dark text-white p-6 md:p-12 font-sans selection:bg-supabase selection:text-white">
    
    <!-- HEADER -->
    <header class="flex justify-between items-center mb-10">
      <div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Hunter / Extração
        </h1>
        <p class="text-gray-400 mt-2">Encontre novos leads no Google Maps de forma automática.</p>
      </div>
      <div>
        <BaseButton 
            @click="toggleMode"
            :variant="showExtraction ? 'secondary' : 'primary'"
            class="px-8 py-4 text-lg"
        >
            <template #icon-left>
                <svg v-if="showExtraction" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </template>
            {{ showExtraction ? 'Voltar para Lista' : 'Nova Extração' }}
        </BaseButton>
      </div>
    </header>

    <!-- VIEW: EXTRAÇÃO (WIZARD) -->
    <div v-if="showExtraction" class="animate-fade-in-up">
        <div class="max-w-4xl mx-auto">
            
            <!-- STEP 1: SELEÇÃO DE FONTE -->
            <div v-if="extractionStep === 'selection'">
                <h2 class="text-2xl font-bold text-center mb-2">Onde vamos caçar hoje?</h2>
                <p class="text-gray-400 text-center mb-10">Escolha a fonte de dados para sua prospecção.</p>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <!-- Card Google Maps -->
                    <div 
                        @click="selectSource('google_maps')"
                        class="cursor-pointer group relative p-6 bg-supabase-dark-800 border-2 rounded-2xl transition-all duration-300 hover:scale-105"
                        :class="selectedSource === 'google_maps' ? 'border-supabase bg-supabase/5' : 'border-gray-800 hover:border-gray-600'"
                    >
                        <div class="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        </div>
                        <h3 class="text-lg font-bold text-white mb-2">Google Maps</h3>
                        <p class="text-sm text-gray-400">Extraia empresas locais, telefones e endereços.</p>
                        
                        <!-- Checkmark -->
                        <div v-if="selectedSource === 'google_maps'" class="absolute top-4 right-4 text-supabase animate-scale-in">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                        </div>
                    </div>

                    <!-- Card Instagram -->
                    <div 
                        @click="selectSource('instagram')"
                        class="cursor-pointer group relative p-6 bg-supabase-dark-800 border-2 rounded-2xl transition-all duration-300 hover:scale-105"
                        :class="selectedSource === 'instagram' ? 'border-pink-500 bg-pink-500/5' : 'border-gray-800 hover:border-gray-600'"
                    >
                        <div class="w-12 h-12 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center mb-4 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                        </div>
                        <h3 class="text-lg font-bold text-white mb-2">Instagram</h3>
                        <p class="text-sm text-gray-400">Encontre perfis comerciais e contatos na bio.</p>

                        <div v-if="selectedSource === 'instagram'" class="absolute top-4 right-4 text-pink-500 animate-scale-in">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                        </div>
                    </div>

                    <!-- Card Casa dos Dados -->
                    <div 
                        @click="selectSource('casa_dados')"
                        class="cursor-pointer group relative p-6 bg-supabase-dark-800 border-2 rounded-2xl transition-all duration-300 hover:scale-105"
                        :class="selectedSource === 'casa_dados' ? 'border-yellow-500 bg-yellow-500/5' : 'border-gray-800 hover:border-gray-600'"
                    >
                        <div class="w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center mb-4 group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                        </div>
                        <h3 class="text-lg font-bold text-white mb-2">Casa dos Dados</h3>
                        <p class="text-sm text-gray-400">Base completa de CNPJs e sócios do Brasil.</p>

                        <div v-if="selectedSource === 'casa_dados'" class="absolute top-4 right-4 text-yellow-500 animate-scale-in">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                        </div>
                    </div>
                </div>

                <div class="flex justify-center">
                    <BaseButton 
                        @click="nextStep"
                        :disabled="!selectedSource"
                        variant="primary"
                        class="px-12 py-4 text-lg w-full md:w-auto"
                    >
                        Avançar
                        <template #icon-right>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        </template>
                    </BaseButton>
                </div>
            </div>

            <!-- STEP 2: FORMULÁRIO (Form original) -->
            <div v-if="extractionStep === 'form'">
                 <div class="mb-6">
                    <button @click="extractionStep = 'selection'" class="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                        Voltar para seleção
                    </button>
                 </div>

                <div class="bg-supabase-dark-800 p-8 rounded-2xl shadow-2xl border border-gray-800 mb-8">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="p-2 rounded-lg bg-supabase/10">
                            <!-- Ícone dinâmico baseado na seleção -->
                            <svg v-if="selectedSource === 'google_maps'" class="text-supabase" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                            <svg v-else-if="selectedSource === 'instagram'" class="text-pink-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                            <svg v-else-if="selectedSource === 'casa_dados'" class="text-yellow-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                            <svg v-else class="text-supabase" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                        </div>
                        <div>
                            <span class="text-xs font-bold uppercase tracking-wider text-gray-500">Fonte Selecionada</span>
                            <h3 class="font-bold text-white text-lg leading-none">
                                {{ selectedSource === 'google_maps' ? 'Google Maps' : selectedSource === 'instagram' ? 'Instagram' : 'Casa dos Dados' }}
                            </h3>
                        </div>
                    </div>

                    <label class="block text-sm font-bold mb-4 text-gray-300 uppercase tracking-wider">Qual o alvo de hoje?</label>
                    <div class="flex flex-col md:flex-row gap-4">
                    <input 
                        v-model="termo" 
                        @keyup.enter="dispararSistema"
                        type="text" 
                        placeholder="Ex: Tatuadores em Brasília, Barbearias em Curitiba..." 
                        class="flex-1 bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-4 text-lg focus:outline-none focus:border-supabase focus:ring-1 focus:ring-supabase/50 transition-colors text-white placeholder-gray-600"
                    />
                    <button 
                        @click="dispararSistema"
                        :disabled="loading"
                        class="bg-supabase hover:bg-supabase-hover text-white font-bold py-4 px-8 rounded-xl shadow-lg transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[200px]"
                    >
                        <span v-if="loading" class="animate-spin">⏳</span>
                        {{ loading ? 'ROBÔ TRABALHANDO...' : 'INICIAR CAÇADA' }}
                    </button>
                    </div>
                    
                    <!-- Timer Visual -->
                    <HuntingTimer ref="timerRef" :is-running="loading" />
                    
                    <!-- Terminal Log (Mantido para debug rápido) -->
                    <div class="mt-6 font-mono text-sm p-4 bg-black/50 rounded-lg border border-gray-800 text-green-400 min-h-[60px] flex items-center">
                        > {{ status }}
                    </div>
                </div>

                <!-- Resultado da Extração Atual -->
                <div v-if="extractedLeads.length > 0" class="mt-10">
                    <h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
                        <span>📦 Resultado da Extração</span>
                        <span class="bg-supabase/20 text-supabase text-xs px-3 py-1 rounded-full border border-supabase/30">{{ extractedLeads.length }} novos leads</span>
                    </h2>
                    
                    <div class="grid gap-4">
                        <div v-for="(lead, i) in extractedLeads" :key="i" class="bg-supabase-dark-800 p-5 rounded-xl border border-gray-800 flex justify-between items-center hover:border-gray-700 transition-colors">
                            <div>
                                <h3 class="font-bold text-lg text-white">{{ lead.nome_empresa }}</h3>
                                <p class="text-sm text-gray-400">{{ lead.endereco }}</p>
                                <p class="font-mono text-sm font-medium text-gray-300 mt-1">{{ lead.telefone || 'Sem telefone' }}</p>
                            </div>
                            <div class="text-right">
                                <span v-if="!lead.website_url" class="inline-block px-3 py-1 bg-red-500/10 text-red-400 text-xs font-bold rounded-full border border-red-500/20">SEM SITE</span>
                                <span v-else class="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20">TEM SITE</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>


    <!-- VIEW: LISTA PAGINADA (PADRÃO) -->
    <div v-else class="animate-fade-in-up">
        
        <!-- Loading List -->
        <div v-if="isLoadingList" class="space-y-4">
             <div v-for="i in 5" :key="i" class="h-16 bg-supabase-dark-800 rounded-xl animate-pulse border border-gray-800"></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="leadsList.length === 0" class="text-center py-20 bg-supabase-dark-800 rounded-xl border border-gray-800">
            <div class="mb-4 text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </div>
            <p class="text-gray-400 text-lg mb-2">Nenhum lead encontrado.</p>
            <p class="text-gray-500 mb-6">Comece uma nova extração para encher sua lista.</p>
            <button @click="showExtraction = true" class="text-supabase hover:underline font-medium">Ir para Nova Extração</button>
        </div>

        <!-- Tabela de Leads -->
        <div v-else>
            <div class="bg-supabase-dark-800 border border-gray-800 rounded-xl overflow-hidden mb-6">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm text-gray-400">
                        <thead class="bg-gray-900/50 text-gray-200 uppercase font-medium">
                            <tr>
                                <th class="px-6 py-4">Empresa</th>
                                <th class="px-6 py-4">Localização</th>
                                <th class="px-6 py-4">Contato</th>
                                <th class="px-6 py-4">Status</th>
                                <th class="px-6 py-4 text-right">Extraído em</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-800">
                            <tr v-for="lead in leadsList" :key="lead.id" class="hover:bg-white/5 transition-colors">
                                <td class="px-6 py-4 max-w-[300px]">
                                    <div class="font-medium text-white text-base truncate" :title="lead.nome_empresa">{{ lead.nome_empresa }}</div>
                                    <div class="text-xs opacity-70">{{ lead.termo_pesquisa || 'Pesquisa manual' }}</div>
                                </td>
                                <td class="px-6 py-4 max-w-[200px] truncate" :title="lead.endereco">
                                    {{ lead.endereco || '-' }}
                                </td>
                                <td class="px-6 py-4">
                                    <div class="font-mono text-gray-300">{{ lead.telefone || '-' }}</div>
                                    <a v-if="lead.site" :href="lead.site.startsWith('http') ? lead.site : `https://${lead.site}`" target="_blank" class="text-xs text-supabase hover:underline block mt-1 truncate max-w-[150px]">
                                        {{ lead.site }}
                                    </a>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300 capitalize">
                                        {{ lead.status || 'Novo' }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-right font-mono text-xs">
                                    {{ new Date(lead.created_at).toLocaleDateString() }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Paginação -->
            <div class="flex justify-between items-center border-t border-gray-800 pt-6">
                <div class="text-sm text-gray-400">
                    Mostrando <span class="font-medium text-white">{{ leadsList.length }}</span> de <span class="font-medium text-white">{{ totalLeads }}</span> leads
                </div>
                <div class="flex gap-2">
                    <button 
                        @click="changePage(currentPage - 1)" 
                        :disabled="currentPage === 1"
                        class="px-4 py-2 bg-supabase-dark-800 border border-gray-800 rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Anterior
                    </button>
                    <span class="px-4 py-2 text-sm font-medium flex items-center bg-gray-900 rounded-lg border border-gray-800">
                        Página {{ currentPage }} de {{ totalPages }}
                    </span>
                    <button 
                        @click="changePage(currentPage + 1)" 
                        :disabled="currentPage === totalPages"
                        class="px-4 py-2 bg-supabase-dark-800 border border-gray-800 rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Próxima
                    </button>
                </div>
            </div>
        </div>

    </div>

  </div>
</template>

<style scoped>
/* Animação suave de entrada */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out forwards;
}

@keyframes scaleIn {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.animate-scale-in {
    animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
</style>
