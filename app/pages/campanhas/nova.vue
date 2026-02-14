<template>
  <div class="p-8 text-white min-h-screen font-sans flex flex-col items-center">
    
    <!-- Progress Header -->
    <div class="w-full max-w-4xl mb-12">
        <div class="flex items-center justify-between relative">
            <div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-800 -z-10 rounded-full"></div>
            <div 
                class="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 transition-all duration-500 rounded-full"
                :style="{ width: ((step - 1) / 2) * 100 + '%' }"
            ></div>
            
            <div 
                v-for="s in 3" :key="s"
                class="w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300 z-10"
                :class="step >= s ? 'bg-green-500 border-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-gray-900 border-gray-700 text-gray-500'"
            >
                {{ s }}
            </div>
        </div>
        <div class="flex justify-between mt-2 text-xs font-medium text-gray-400 uppercase tracking-widest px-2">
            <span>Audiência</span>
            <span>Mensagem</span>
            <span>Disparo</span>
        </div>
    </div>

    <!-- Wizard Content -->
    <div class="w-full max-w-4xl bg-supabase-dark-800 border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        <!-- STEP 1: Audiência -->
        <div v-if="step === 1" class="animate-fade-in">
            <h2 class="text-2xl font-bold mb-2">Quem vamos alcançar?</h2>
            <p class="text-gray-400 mb-6">Selecione os leads para esta campanha.</p>

            <!-- Stats Card -->
            <div class="bg-gradient-to-r from-green-900/20 to-transparent border border-green-500/20 rounded-xl p-4 mb-6 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-green-500/10 rounded-lg text-green-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-white">{{ leads.length }}</div>
                        <div class="text-xs text-green-400 font-medium uppercase tracking-wide">Leads Disponíveis</div>
                    </div>
                </div>
                <button 
                    @click="toggleSelectAll"
                    class="text-sm font-medium transition-colors"
                    :class="areAllSelected ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'"
                >
                    {{ areAllSelected ? 'Desmarcar Todos' : 'Selecionar Todos' }}
                </button>
            </div>

            <!-- Leads List -->
            <div class="h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                <div v-if="loadingLeads" class="flex justify-center py-10">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
                
                <div v-else class="space-y-2">
                     <label 
                        v-for="lead in leads" 
                        :key="lead.id" 
                        class="flex items-center justify-between p-3 rounded-lg border border-gray-800 bg-black/20 hover:bg-white/5 cursor-pointer transition-colors group"
                        :class="{'border-green-500/30 bg-green-900/10': selectedLeadsIds.has(lead.id)}"
                     >
                        <div class="flex items-center gap-4">
                            <input 
                                type="checkbox" 
                                :checked="selectedLeadsIds.has(lead.id)"
                                @change="toggleSelection(lead.id)"
                                class="w-5 h-5 rounded border-gray-600 bg-gray-900 text-green-500 focus:ring-green-500 focus:ring-offset-gray-900 cursor-pointer"
                            >
                            <div>
                                <div class="font-medium text-white group-hover:text-green-400 transition-colors">{{ lead.nome_empresa || 'Sem Nome' }}</div>
                                <div class="text-xs text-gray-500">{{ lead.telefone || 'Sem telefone' }} • {{ lead.status || 'Novo' }}</div>
                            </div>
                        </div>
                        <div class="text-xs text-gray-600 font-mono">ID: {{ lead.id }}</div>
                     </label>
                </div>
            </div>
            
            <div class="mt-4 text-right text-sm text-gray-400">
                <span class="text-green-400 font-bold">{{ selectedLeadsIds.size }}</span> leads selecionados
            </div>
        </div>

        <!-- STEP 2: Mensagem -->
        <div v-if="step === 2" class="animate-fade-in flex flex-col md:flex-row gap-8">
            <!-- Editor -->
            <div class="flex-1">
                <h2 class="text-2xl font-bold mb-2">Editor de Mensagem</h2>
                <div class="mb-4">
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nome da Campanha</label>
                    <input 
                        v-model="campaignName"
                        type="text" 
                        placeholder="Ex: Oferta Black Friday"
                        class="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                    >
                </div>

                <div class="relative">
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Conteúdo</label>
                    <textarea 
                        v-model="messageBody"
                        rows="12"
                        placeholder="Olá {nome_empresa}, tudo bem?"
                        class="w-full bg-black/50 border border-gray-700 rounded-lg p-4 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all resize-none font-mono text-sm leading-relaxed"
                    ></textarea>
                    
                    <!-- Chips -->
                    <div class="flex gap-2 mt-3 flex-wrap">
                        <button 
                            @click="insertVariable('{nome_empresa}')"
                            class="px-3 py-1 bg-gray-800 hover:bg-green-900/30 text-green-400 border border-gray-700 hover:border-green-500/50 rounded-full text-xs font-mono transition-all transform active:scale-95"
                        >
                            {nome_empresa}
                        </button>
                        <button 
                            @click="insertVariable('{nome_socio}')"
                            class="px-3 py-1 bg-gray-800 hover:bg-green-900/30 text-green-400 border border-gray-700 hover:border-green-500/50 rounded-full text-xs font-mono transition-all transform active:scale-95"
                        >
                            {nome_socio}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Preview -->
            <div class="w-full md:w-80 flex flex-col">
                <h3 class="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Preview (WhatsApp)</h3>
                <div class="flex-1 bg-[#E5DDD5] rounded-xl p-4 overflow-hidden relative border border-gray-700 shadow-inner">
                    <!-- Chat Bubble -->
                    <div class="bg-white rounded-lg p-3 max-w-[90%] shadow-sm relative text-black text-sm leading-snug">
                         <div class="whitespace-pre-wrap">{{ previewMessage }}</div>
                         <div class="text-[10px] text-gray-400 text-right mt-1 flex items-center justify-end gap-1">
                            12:00 <span class="text-blue-500">✓✓</span>
                         </div>
                         <!-- Triangle -->
                         <div class="absolute top-0 -left-2 w-0 h-0 border-t-[10px] border-t-white border-l-[10px] border-l-transparent transform rotate-0"></div>
                    </div>
                </div>
                <p class="text-xs text-gray-500 mt-2 text-center">
                    Visualização para: <span class="text-white font-bold">{{ firstSelectedLead?.nome_empresa || 'Exemplo' }}</span>
                </p>
            </div>
        </div>

        <!-- STEP 3: Confirmar -->
        <div v-if="step === 3" class="animate-fade-in text-center py-10">
            <div class="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 border border-green-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </div>
            <h2 class="text-3xl font-bold text-white mb-2">Tudo pronto para o disparo!</h2>
            <p class="text-gray-400 max-w-md mx-auto mb-8">
                Você esta prestes a iniciar a campanha <strong class="text-white">{{ campaignName }}</strong> para <strong class="text-white">{{ selectedLeadsIds.size }} leads</strong>.
            </p>

            <div class="bg-black/30 border border-gray-800 rounded-lg p-6 max-w-md mx-auto mb-8 text-left space-y-3">
                <div class="flex justify-between">
                    <span class="text-gray-500">Campanha:</span>
                    <span class="text-white font-medium">{{ campaignName }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-500">Leads:</span>
                    <span class="text-green-400 font-bold">{{ selectedLeadsIds.size }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-500">Estimativa:</span>
                    <span class="text-white text-xs bg-gray-800 px-2 py-0.5 rounded">~{{ Math.ceil(selectedLeadsIds.size * 2 / 60) }} min</span>
                </div>
            </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="mt-8 pt-6 border-t border-gray-800 flex justify-between items-center">
            <button 
                v-if="step > 1"
                @click="step--"
                class="text-gray-400 hover:text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
                Voltar
            </button>
            <div v-else></div> <!-- Spacer -->

            <button 
                v-if="step < 3"
                @click="nextStep"
                :disabled="!canProceed"
                class="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-green-900/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:shadow-none"
            >
                Próximo Passo
            </button>

             <button 
                v-else
                @click="startCampaign"
                class="bg-green-500 hover:bg-green-400 text-black px-12 py-3 rounded-lg font-bold shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all transform active:scale-95 hover:scale-105 flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                INICIAR CAMPANHA
            </button>
        </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

// Supabase
const supabase = useSupabaseClient()
const user = useSupabaseUser()
// @ts-ignore
const userId = computed(() => user.value?.id || user.value?.sub)

// State
const step = ref(1)
const loadingLeads = ref(false)
const leads = ref<any[]>([])
const selectedLeadsIds = ref<Set<number>>(new Set())

// Campaign Data
const campaignName = ref('')
const messageBody = ref('Olá {nome_empresa}, vi que vocês trabalham com...')

onMounted(() => {
    if (userId.value) {
        fetchLeads()
    } else {
        const unwatch = watch(user, (u) => {
            if (u) {
                fetchLeads()
                unwatch()
            }
        })
    }
})

// === STEP 1: AUDIENCE ===

async function fetchLeads() {
    loadingLeads.value = true
    try {
        const { data, error } = await supabase
            .from('leads_hunter')
            .select('*')
            .or(`user_id.eq.${userId.value},user_id.is.null`)
            .order('created_at', { ascending: false })
        
        if (error) throw error
        
        // TODO: Filter out leads already in 'fila_envios' if table exists
        leads.value = data || []
    } catch (e) {
        console.error(e)
        toast.error('Erro ao carregar leads.')
    } finally {
        loadingLeads.value = false
    }
}

function toggleSelection(id: number) {
    if (selectedLeadsIds.value.has(id)) {
        selectedLeadsIds.value.delete(id)
    } else {
        selectedLeadsIds.value.add(id)
    }
}

function toggleSelectAll() {
    if (selectedLeadsIds.value.size === leads.value.length) {
        selectedLeadsIds.value.clear()
    } else {
        leads.value.forEach(l => selectedLeadsIds.value.add(l.id))
    }
}

const areAllSelected = computed(() => {
    return leads.value.length > 0 && selectedLeadsIds.value.size === leads.value.length
})

// === STEP 2: MESSAGE ===

const firstSelectedLead = computed(() => {
    if (selectedLeadsIds.value.size === 0) return null
    const firstId = Array.from(selectedLeadsIds.value)[0]
    return leads.value.find(l => l.id === firstId)
})

const previewMessage = computed(() => {
    let msg = messageBody.value
    const lead = firstSelectedLead.value || { nome_empresa: 'Empresa Exemplo', nome_socio: 'Fulano' }
    
    msg = msg.replace(/{nome_empresa}/g, lead.nome_empresa || '')
    msg = msg.replace(/{nome_socio}/g, lead.nome_socio || '')
    return msg
})

function insertVariable(variable: string) {
    messageBody.value += ` ${variable}`
}

// === NAVIGATION ===

const canProceed = computed(() => {
    if (step.value === 1) return selectedLeadsIds.value.size > 0
    if (step.value === 2) return campaignName.value.length > 0 && messageBody.value.length > 10
    return true
})

function nextStep() {
    if (canProceed.value) step.value++
}

// === ACTION ===

async function startCampaign() {
    const payload = {
        nome: campaignName.value,
        mensagem: messageBody.value,
        leads_selecionados: Array.from(selectedLeadsIds.value)
    }
    
    console.log('>>> CAMPANHA INICIADA:', payload)
    
    // Placeholder logic for now
    toast.success('Campanha iniciada com sucesso! (Simulação)')
    
    // Reset or redirect
    setTimeout(() => {
        // router.push('/campanhas') // Future
        step.value = 1
        selectedLeadsIds.value.clear()
        campaignName.value = ''
    }, 2000)
}

</script>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1); 
}
::-webkit-scrollbar-thumb {
  background: rgba(74, 222, 128, 0.2); 
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(74, 222, 128, 0.4); 
}
</style>
