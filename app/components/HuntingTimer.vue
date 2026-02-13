<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps<{
  isRunning: boolean
}>()

const progress = ref(0)
const statusMessage = ref('Aguardando comando...')
const timerDisplay = ref('00:00')

let progressInterval: any = null
let messageInterval: any = null
let timerInterval: any = null
let secondaryTimerInterval: any = null
let startTime: number | null = null

const messages = [
  'Varrendo Google Maps...',
  'Identificando negócios locais...',
  'Extraindo telefones e contatos...',
  'Validando sites e redes sociais...',
  'Filtrando resultados duplicados...',
  'Enriquecendo dados dos leads...',
  'Preparando pacote de dados...',
  'Quase lá, finalizando extração...'
]

const startTimer = () => {
    // Reset
    progress.value = 0
    statusMessage.value = 'Iniciando protocolos de varredura...'
    startTime = Date.now()
    
    // Progress Bar (0 to 95% in ~60s)
    // 60s = 60000ms. Update every 100ms. Steps = 600.
    // Increment per step = 95 / 600 = 0.158
    progressInterval = setInterval(() => {
        if (progress.value < 95) {
            // Pequena variação aleatória para parecer "vivo"
            const increment = 0.1 + Math.random() * 0.2 
            progress.value = Math.min(progress.value + increment, 95)
        }
    }, 100)

    // Mensagens aleatórias
    messageInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * messages.length)
        statusMessage.value = messages[randomIndex] || messages[0]
    }, 5000) // A cada 5s para ser mais dinâmico

    // Cronômetro visual
    timerInterval = setInterval(() => {
        if (startTime) {
            const diff = Date.now() - startTime
            const minutes = Math.floor(diff / 60000)
            const seconds = Math.floor((diff % 60000) / 1000)
            timerDisplay.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        }
    }, 1000)
}

const stopTimer = () => {
    clearInterval(progressInterval)
    clearInterval(messageInterval)
    clearInterval(timerInterval)
    clearInterval(secondaryTimerInterval)
    
    if (props.isRunning) {
        // Se ainda estava rodando e parou abruptamente
        // Mantemos o estado atual ou resetamos?
        // Na nova lógica, o pai chama finish() antes de parar.
    }
}

const finish = () => {
    clearInterval(progressInterval)
    clearInterval(messageInterval)
    clearInterval(timerInterval)
    clearInterval(secondaryTimerInterval)
    
    progress.value = 100
    statusMessage.value = 'Concluído!'
}

defineExpose({
    finish
})

watch(() => props.isRunning, (newVal) => {
    if (newVal) {
        startTimer()
    } else {
        stopTimer()
    }
})

onUnmounted(() => {
    stopTimer()
})
</script>

<template>
  <div v-if="props.isRunning || progress > 0" class="w-full max-w-2xl mx-auto mt-6 p-6 rounded-xl border border-supabase/30 bg-black/40 backdrop-blur-sm relative overflow-hidden group">
    
    <!-- Cyberpunk Glow Effect -->
    <div class="absolute inset-0 bg-supabase/5 blur-xl group-hover:bg-supabase/10 transition-colors duration-500"></div>

    <div class="relative z-10">
        <!-- Header: Mensagem e Timer -->
        <div class="flex justify-between items-end mb-2">
            <div class="flex flex-col">
                <span class="text-xs text-supabase-light font-bold uppercase tracking-widest mb-1">Status do Sistema</span>
                <span class="text-gray-200 font-mono text-sm animate-pulse">{{ statusMessage }}</span>
            </div>
            <div class="text-2xl font-mono font-bold text-supabase tabular-nums">
                {{ timerDisplay }}
            </div>
        </div>

        <!-- Barra de Progresso Container -->
        <div class="h-4 bg-gray-900/80 rounded-full overflow-hidden border border-gray-700 relative">
            <!-- Barra de Progresso Fill -->
            <div 
                class="h-full bg-gradient-to-r from-supabase-dark to-supabase transition-all duration-300 ease-out relative"
                :style="{ width: `${progress}%` }"
            >
                <!-- Brilho na ponta -->
                <div class="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]"></div>
            </div>

            <!-- Grid lines overlay (efeito tech) -->
            <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTEwIDBMMTAgMjBNMCAxMEwyMCAxMCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        </div>

        <!-- Porcentagem em texto abaixo -->
        <div class="flex justify-between mt-1">
            <span class="text-[10px] text-gray-500 font-mono">ID: {{ Math.floor(Math.random() * 100000) }}</span>
            <span class="text-xs font-bold text-supabase">{{ Math.floor(progress) }}%</span>
        </div>
    </div>
  </div>
</template>
