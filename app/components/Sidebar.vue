<script setup lang="ts">
const user = useSupabaseUser()
const client = useSupabaseClient()
const profile = ref<any>(null)
const loading = ref(true)

watch(() => user.value, async (newUser) => {
  // @ts-ignore
  const userId = newUser?.id || newUser?.sub
  if (userId) {
    try {
      const { data, error } = await client
        .from('usuario')
        // Importante: Aspas duplas nas colunas Case Sensitive
        .select('nome, "QntdCredtos"')
        .eq('user_id', userId)
        .single()
      
      if (error) {
        console.error('Sidebar: Error fetching profile:', error)
      }

      if (data) {
        profile.value = data
      }
    } catch (e) {
      console.error('Sidebar: Exception:', e)
    } finally {
      loading.value = false
    }
  }
}, { immediate: true })

const displayName = computed(() => {
  if (profile.value?.nome) return profile.value.nome
  if (user.value?.email) return user.value.email.split('@')[0]
  return 'Caçador'
})

const userCredits = computed(() => {
  return profile.value?.QntdCredtos || 0
})
</script>

<template>
  <aside class="w-64 bg-supabase-dark-900 border-r border-gray-800 h-screen fixed left-0 top-0 flex flex-col z-50">
    <div class="p-6 flex items-center gap-3 mb-6">
      <div class="w-8 h-8 bg-supabase rounded-lg flex items-center justify-center">
        <!-- Logo Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
      </div>
      <span class="font-bold text-xl text-white tracking-tight">Hunter<span class="text-supabase">.io</span></span>
    </div>

    <nav class="flex-1 px-4 space-y-2">
      <NuxtLink to="/dashboard" class="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all" active-class="bg-supabase/10 text-supabase font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
        Home
      </NuxtLink>

      <NuxtLink to="/hunter" class="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all" active-class="bg-supabase/10 text-supabase font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        Extração
      </NuxtLink>

      <NuxtLink to="/crm" class="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all" active-class="bg-supabase/10 text-supabase font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        CRM
      </NuxtLink>

      <NuxtLink to="/campanhas/nova" class="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all" active-class="bg-supabase/10 text-supabase font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        Campanhas
      </NuxtLink>

      <NuxtLink to="/enrichment" class="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all" active-class="bg-supabase/10 text-supabase font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s 9-1.34 9-3V5"/></svg>
        Enriquecimento
      </NuxtLink>
    </nav>

    <div class="p-6 border-t border-gray-800">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-bold border border-gray-600">
              {{ displayName.charAt(0).toUpperCase() }}
            </div>
            <div class="overflow-hidden">
                <p class="text-sm font-bold text-white truncate">{{ displayName }}</p>
                <div class="flex items-center gap-1 text-xs text-green-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  <span>{{ userCredits }} Créditos</span>
                </div>
            </div>
        </div>
    </div>
  </aside>
</template>
