<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const email = ref('')
const password = ref('')
const loading = ref(false)
const supabase = useSupabaseClient()
const router = useRouter()

const handleLogin = async () => {
  if (!email.value || !password.value) {
    return toast.warning('Por favor, preencha todos os campos.')
  }

  loading.value = true
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })

    if (error) throw error

    toast.success('Acesso autorizado. Bem-vindo ao QG.')
    const uid = data.user?.id
    if (uid) {
        router.push({ path: '/dashboard', query: { uid } })
    } else {
        router.push('/dashboard')
    }
    
  } catch (error: any) {
    toast.error(error.message || 'Falha na autenticação.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 relative overflow-hidden group">
    
    <!-- Glow Effect -->
    <div class="absolute -top-10 -right-10 w-32 h-32 bg-green-500/10 blur-3xl rounded-full pointer-events-none"></div>
    <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-green-500/5 blur-3xl rounded-full pointer-events-none"></div>

    <!-- Header -->
    <div class="mb-8 text-center">
      <h2 class="text-3xl font-bold text-white tracking-tight mb-2">Acesse o QG</h2>
      <p class="text-gray-400 text-sm">Entre com suas credenciais para iniciar a caçada.</p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleLogin" class="space-y-6 relative z-10">
      
      <!-- Email Input -->
      <div class="group/input">
        <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 group-focus-within/input:text-green-500 transition-colors">E-mail</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within/input:text-green-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          </div>
          <input 
            v-model="email"
            type="email" 
            class="w-full bg-black/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
            placeholder="agente@hunter.io"
          />
        </div>
      </div>

      <!-- Password Input -->
      <div class="group/input">
        <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 group-focus-within/input:text-green-500 transition-colors">Senha</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within/input:text-green-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <input 
            v-model="password"
            type="password" 
            class="w-full bg-black/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
            placeholder="••••••••"
          />
        </div>
      </div>

      <!-- Submit Button -->
      <button 
        type="submit" 
        :disabled="loading"
        class="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-green-900/20 transform transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <span v-if="loading" class="animate-spin">⏳</span>
        {{ loading ? 'AUTENTICANDO...' : 'ENTRAR NO SISTEMA' }}
      </button>

    </form>
    
    <!-- Footer -->
    <div class="mt-6 text-center text-xs text-gray-600">
      Protegido por criptografia de ponta a ponta.
      <br>Acesso restrito a pessoal autorizado.
    </div>

  </div>
</template>
