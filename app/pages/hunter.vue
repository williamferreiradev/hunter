<script setup lang="ts">
const termo = ref('')
const loading = ref(false)
const status = ref('Pronto para a caçada...')
const leads = ref([])

const dispararSistema = async () => {
  if (!termo.value) return alert('Digita alguma coisa aí, chefe!')
  
  loading.value = true
  status.value = '🚀 Inicializando satélite...'
  leads.value = []

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

    if (data.value?.success) {
      status.value = `✅ Sucesso! ${data.value.total} leads capturados.`
      leads.value = data.value.leads
    } else {
      status.value = '❌ O robô voltou de mãos vazias.'
    }

  } catch (e: any) {
    status.value = `❌ Erro crítico: ${e.message}`
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-white p-8 font-sans">
    <div class="max-w-3xl mx-auto">
      
      <div class="mb-8 text-center">
        <h1 class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
          LEAD HUNTER PRO
        </h1>
        <p class="text-gray-400 mt-2">Sistema Automatizado de Prospecção Google Maps</p>
      </div>

      <div class="bg-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-700">
        <label class="block text-sm font-bold mb-2 text-green-400">QUAL O ALVO DE HOJE?</label>
        <div class="flex flex-col md:flex-row gap-3">
          <input 
            v-model="termo" 
            @keyup.enter="dispararSistema"
            type="text" 
            placeholder="Ex: Tatuadores em Brasília, Barbearias em Curitiba..." 
            class="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-4 text-lg focus:outline-none focus:border-green-500 transition-colors"
          />
          <button 
            @click="dispararSistema"
            :disabled="loading"
            class="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'ROBÔ TRABALHANDO...' : 'INICIAR CAÇADA' }}
          </button>
        </div>
        
        <div class="mt-4 font-mono text-sm p-3 bg-black/30 rounded-lg text-yellow-300">
          > {{ status }}
        </div>
      </div>

      <div v-if="leads.length > 0" class="mt-10">
        <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
          <span>📦 Última Carga</span>
          <span class="bg-green-900 text-green-300 text-xs px-2 py-1 rounded-full">{{ leads.length }} itens</span>
        </h2>
        
        <div class="grid gap-4">
          <div v-for="(lead, i) in leads" :key="i" class="bg-white text-slate-900 p-4 rounded-xl shadow-sm border-l-4 border-green-500 flex justify-between items-center">
            <div>
              <h3 class="font-bold text-lg">{{ lead.nome_empresa }}</h3>
              <p class="text-sm text-gray-600">{{ lead.endereco }}</p>
              <p class="font-mono text-sm font-bold text-slate-800 mt-1">{{ lead.telefone || 'Sem telefone' }}</p>
            </div>
            <div class="text-right">
              <span v-if="!lead.website_url" class="block px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full mb-2">SEM SITE</span>
              <span v-else class="block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-2">TEM SITE</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
