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
        <BaseButton variant="primary" @click="router.push({ path: '/hunter', query: { new: 'true' } })">
          <template #icon-left>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </template>
          Nova Extração
        </BaseButton>
      </div>
    </header>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
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



    <!-- Recent Activity / Table -->
    <div class="bg-supabase-dark-800 border border-gray-800 rounded-xl overflow-hidden">
      <div class="p-6 border-b border-gray-800 flex justify-between items-center">
        <h2 class="text-lg font-semibold">Extrações Recentes</h2>
        <button @click="router.push('/crm')" class="text-sm text-supabase hover:text-supabase-light">Ver todas</button>
      </div>
      
      <div v-if="isLoading" class="p-6 space-y-4">
        <div v-for="i in 3" :key="i" class="h-12 bg-gray-800 rounded animate-pulse"></div>
      </div>

      <div v-else-if="recentLeads.length === 0" class="p-8 text-center text-gray-500">
        <p>Nenhuma extração recente encontrada.</p>
        <BaseButton variant="ghost" class="mt-4" @click="router.push('/hunter')">Iniciar primeira extração</BaseButton>
      </div>

      <div v-else class="divide-y divide-gray-800">
         <div v-for="lead in recentLeads" :key="lead.id" class="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-gray-400">
                    {{ lead.nome_empresa ? lead.nome_empresa.substring(0,2).toUpperCase() : '??' }}
                </div>
                <div>
                    <h4 class="font-medium text-white">{{ lead.nome_empresa || 'Sem Nome' }}</h4>
                    <p class="text-xs text-gray-400">{{ lead.telefone || 'Sem telefone' }}</p>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <span class="px-2 py-1 rounded text-xs font-medium uppercase tracking-wide"
                    :class="{
                        'bg-blue-500/20 text-blue-400': !lead.status || lead.status === 'novo',
                        'bg-yellow-500/20 text-yellow-400': lead.status === 'em_contato',
                        'bg-green-500/20 text-green-400': lead.status === 'fechado',
                        'bg-red-500/20 text-red-400': lead.status === 'perdido'
                    }"
                >
                    {{ lead.status ? lead.status.replace('_', ' ') : 'novo' }}
                </span>
                <span class="text-xs text-gray-500">
                    {{ new Date(lead.created_at).toLocaleDateString() }}
                </span>
            </div>
         </div>
         
         <div class="p-4 text-center border-t border-gray-800 bg-gray-900/50">
            <button @click="router.push('/crm')" class="text-xs text-gray-400 hover:text-white flex items-center justify-center gap-1 w-full">
                Ver todos os leads no CRM
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
         </div>
      </div>
    </div>



  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, markRaw, watch, h } from 'vue'
import { useRouter, useRoute } from '#app'
import BaseButton from '~/components/base/BaseButton.vue'
import { toast } from 'vue3-toastify'


// --- Ícones (Render Functions) ---
const UsersIcon = {
  render: () => h('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: '24', height: '24', viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', 'stroke-width': '2',
    'stroke-linecap': 'round', 'stroke-linejoin': 'round'
  }, [
    h('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
    h('circle', { cx: '9', cy: '7', r: '4' }),
    h('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
    h('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })
  ])
}

const ActivityIcon = {
  render: () => h('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: '24', height: '24', viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', 'stroke-width': '2',
    'stroke-linecap': 'round', 'stroke-linejoin': 'round'
  }, [
    h('polyline', { points: '22 12 18 12 15 21 9 3 6 12 2 12' })
  ])
}

const CreditCardIcon = {
  render: () => h('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: '24', height: '24', viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', 'stroke-width': '2',
    'stroke-linecap': 'round', 'stroke-linejoin': 'round'
  }, [
    h('rect', { x: '1', y: '4', width: '22', height: '16', rx: '2', ry: '2' }),
    h('line', { x1: '1', y1: '10', x2: '23', y2: '10' })
  ])
}

// --- Composable & Refs ---
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()
const route = useRoute()

const recentLeads = ref<any[]>([])
const isLoading = ref(true)
const debugValues = ref({ credits: '...', totalLeads: '...', error: 'Nenhum error' })

const stats = ref([
  { label: 'Leads Extraídos', value: '0', trend: 'Total', trendUp: true, icon: markRaw(UsersIcon), iconBg: 'bg-blue-500/20', iconColor: 'text-blue-500' },
  { label: 'Taxa de Sucesso', value: '0%', trend: 'Fechado vs Perdido', trendUp: true, icon: markRaw(ActivityIcon), iconBg: 'bg-green-500/20', iconColor: 'text-green-500' },
  { label: 'Leads Novos', value: '0', trend: 'Aguardando', trendUp: true, icon: markRaw(CreditCardIcon), iconBg: 'bg-yellow-500/20', iconColor: 'text-yellow-500' },
  { label: 'Créditos', value: '0', trend: 'Plano Gratuito', trendUp: true, icon: markRaw(CreditCardIcon), iconBg: 'bg-purple-500/20', iconColor: 'text-purple-500' },
])

// --- Functions ---
function resetStats() {
    stats.value.forEach(s => s.value = (s.label === 'Taxa de Sucesso' ? '0%' : '0'))
    recentLeads.value = []
}

async function fetchDashboardData() {
    isLoading.value = true
    debugValues.value.error = 'Buscando...'
    
    try {
        // Tenta pegar o ID do user. Se falhar, tenta user.sub, depois route.query.uid
        // @ts-ignore
        let userId = user.value?.id || user.value?.sub || (route.query.uid as string)
        
        if (userId && route.query.uid) {
            console.log('⚠️ Dashboard: Usando ID da URL (ou user.id/sub) para iniciar:', userId)
        } else if (userId) {
            console.log('⚠️ Dashboard: Usando ID do usuário (user.id/sub) para iniciar:', userId)
        }

        // Fallback: Auth Check Direto se userId ainda não foi encontrado
        if (!userId) {
            console.warn('⚠️ Dashboard: ID ainda nulo. Tentando auth.getUser()...')
            const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser()
            if (authUser?.id) userId = authUser.id
        }

        // 4. Se falhar tudo
        if (!userId) {
             console.error('❌ Dashboard: Falha crítica. Sem ID.')
             debugValues.value.error = 'Usuário não autenticado.'
             isLoading.value = false
             return
        }
    
        console.log('🔄 Dashboard: Querying for:', userId)

        // Promise.all para performance
        const [
            userDataRes,
            totalRes,
            novosRes,
            fechadosRes,
            perdidosRes,
            recentesRes
        ] = await Promise.all([
            // 1. Créditos (usando .maybeSingle() para evitar erro 406 se não existir)
            supabase.from('usuario').select('"QntdCredtos"').eq('user_id', userId).maybeSingle(),
            // 2. Counts
            supabase.from('leads_hunter').select('*', { count: 'exact', head: true }).eq('user_id', userId),
            supabase.from('leads_hunter').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'novo'),
            supabase.from('leads_hunter').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'fechado'),
            supabase.from('leads_hunter').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'perdido'),
            // 3. Recentes
            supabase.from('leads_hunter').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5)
        ])

        // --- Processamento Créditos ---
        if (userDataRes.data) {
            // @ts-ignore
            const creds = userDataRes.data.QntdCredtos
            stats.value[3].value = (creds !== null && creds !== undefined) ? creds.toString() : '0'
            debugValues.value.credits = stats.value[3].value
        } else {
            console.warn('⚠️ Dashboard: Registro em public.usuario não encontrado.')
            stats.value[3].value = '0'
            debugValues.value.credits = 'Não encontrado (0)'
        }

        // --- Processamento Métricas ---
        const total = totalRes.count || 0
        const novos = novosRes.count || 0
        const fechados = fechadosRes.count || 0
        const perdidos = perdidosRes.count || 0
        const totalFinal = fechados + perdidos
        const taxa = totalFinal > 0 ? Math.round((fechados / totalFinal) * 100) : 0

        stats.value[0].value = total.toString()
        stats.value[1].value = `${taxa}%`
        stats.value[2].value = novos.toString()
        
        debugValues.value.totalLeads = total.toString()

        // --- Processamento Recentes ---
        if (recentesRes.data) {
            recentLeads.value = recentesRes.data
        }

        console.log('✅ Dashboard: Dados carregados com sucesso!')

    } catch (e: any) {
        console.error('❌ Dashboard: Erro fatal.', e)
        debugValues.value.error = e.message || 'Erro desconhecido'
        toast.error('Erro ao carregar dados.')
    } finally {
        isLoading.value = false
    }
}

// Monitoramento de Auth
watch(() => user.value, (newUser) => {
    // Check user.id OR user.sub OR route query uid OR just fire if user object exists (maybe id is hidden?)
    // @ts-ignore
    const currentId = newUser?.id || newUser?.sub || route.query.uid
    
    if (currentId) {
        console.log('✅ Dashboard: Usuário/UID detectado (Watch)', currentId)
        fetchDashboardData()
    } else {
        console.log('⚠️ Dashboard: Sem usuário logado.')
        resetStats()
    }
}, { immediate: true })
</script>
