<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const supabase = useSupabaseClient()
const router = useRouter()

const handleRegister = async () => {
  if (!name.value || !email.value || !password.value || !confirmPassword.value) {
    return toast.warning('Por favor, preencha todos os campos.')
  }

  if (password.value !== confirmPassword.value) {
    return toast.error('As senhas não coincidem.')
  }

  if (password.value.length < 6) {
    return toast.warning('A senha deve ter pelo menos 6 caracteres.')
  }

  loading.value = true
  
  try {
    // 1. Criar usuário no Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        emailRedirectTo: window.location.origin
      }
    })

    if (error) {
      console.error('Supabase SignUp Error:', error)
      // FORÇA O USUÁRIO A VER O ERRO REAL
      alert(`Erro no Cadastro:\n${error.message}\n(Código: ${error.status || 'N/A'})`)
      throw error
    }
    
    console.log('User created:', data.user)
    if (!data.user) throw new Error('Erro ao criar usuário (sem dados retornados).')

    // 2. Criar perfil na tabela pública (com bônus)
    // @ts-ignore
    const { error: profileError } = await supabase
      .from('usuario')
      .insert([
        {
          nome: name.value,
          "e-mail": email.value,
          user_id: data.user.id,
          "QntdCredtos": 5, // Bônus de boas-vindas
          ativo: true
        }
      ])

    if (profileError) {
      // Se falhar no perfil, talvez devêssemos apagar o usuário do Auth? 
      // Por enquanto, apenas logamos o erro e avisamos.
      console.error('Erro ao criar perfil:', profileError)
      toast.warning('Conta criada, mas houve um erro ao configurar seu perfil. Contate o suporte.')
    } else {
      toast.success('Conta criada com sucesso! Redirecionando...')
    }

    const uid = data.user?.id
    if (uid) {
        router.push({ path: '/dashboard', query: { uid } })
    } else {
        router.push('/dashboard')
    }

  } catch (error: any) {
    toast.error(error.message || 'Erro ao criar conta.')
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
      <h2 class="text-3xl font-bold text-white tracking-tight mb-2">Junte-se à Elite</h2>
      <p class="text-gray-400 text-sm">Crie sua conta para acessar ferramentas de nível militar.</p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleRegister" class="space-y-5 relative z-10">
      
      <!-- Name Input -->
      <div class="group/input">
        <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 group-focus-within/input:text-green-500 transition-colors">Nome Completo</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within/input:text-green-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <input 
            v-model="name"
            type="text" 
            class="w-full bg-black/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
            placeholder="Seu nome"
          />
        </div>
      </div>

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
            placeholder="seu@email.com"
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
            placeholder="Mínimo 6 caracteres"
          />
        </div>
      </div>

      <!-- Confirm Password Input -->
      <div class="group/input">
        <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 group-focus-within/input:text-green-500 transition-colors">Confirmar Senha</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within/input:text-green-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <input 
            v-model="confirmPassword"
            type="password" 
            class="w-full bg-black/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
            placeholder="Repita sua senha"
          />
        </div>
      </div>

      <!-- Submit Button -->
      <button 
        type="submit" 
        :disabled="loading"
        class="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-green-900/20 transform transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
      >
        <span v-if="loading" class="animate-spin">⏳</span>
        {{ loading ? 'CRIANDO CONTA...' : 'CADASTRAR-SE' }}
      </button>

      <div class="text-center mt-4 text-sm text-gray-500">
        Already have an account? <NuxtLink to="/login" class="text-green-500 hover:text-green-400 font-bold hover:underline">Log in</NuxtLink>
      </div>

    </form>
    
  </div>
</template>
