<template>
  <div class="p-8 text-white">
    <h1 class="text-2xl font-bold mb-4">Debug Auth & Leads</h1>
    
    <div class="mb-6 p-4 bg-gray-800 rounded">
      <h2 class="text-xl font-bold mb-2">User Info</h2>
      <p><strong>User ID (id):</strong> {{ user?.id || 'Undefined' }}</p>
      <p><strong>User Sub (sub):</strong> {{ user?.sub || 'Undefined' }}</p>
      <p><strong>Email:</strong> {{ user?.email || '-' }}</p>
    </div>

    <!-- DEBUG USER OBJECT -->
    <div class="mb-6 p-4 bg-gray-800 rounded border border-red-500/50">
        <h3 class="font-bold text-red-300 mb-2">User Object Dump</h3>
        <pre class="text-xs overflow-auto max-h-60 bg-black p-2 text-green-400">{{ JSON.stringify(user, null, 2) }}</pre>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <!-- ALL LEADS (Limit 5) -->
      <div class="p-4 bg-gray-900 rounded border border-gray-700">
        <h3 class="font-bold text-lg mb-2 text-blue-400">1. All Leads (No Filter)</h3>
        <button @click="fetchAll" class="bg-blue-600 px-3 py-1 rounded text-sm mb-2">Fetch</button>
        <pre class="text-xs overflow-auto h-40 bg-black p-2">{{ allLeads }}</pre>
      </div>

      <!-- MY LEADS (Filter by ID) -->
      <div class="p-4 bg-gray-900 rounded border border-gray-700">
        <h3 class="font-bold text-lg mb-2 text-green-400">2. My Leads (user_id = me)</h3>
        <button @click="fetchMyLeads" class="bg-green-600 px-3 py-1 rounded text-sm mb-2">Fetch</button>
        <pre class="text-xs overflow-auto h-40 bg-black p-2">{{ myLeads }}</pre>
      </div>

      <!-- LEGACY LEADS (Filter by NULL) -->
      <div class="p-4 bg-gray-900 rounded border border-gray-700">
        <h3 class="font-bold text-lg mb-2 text-yellow-400">3. Legacy Leads (user_id is NULL)</h3>
        <button @click="fetchLegacy" class="bg-yellow-600 px-3 py-1 rounded text-sm mb-2">Fetch</button>
        <pre class="text-xs overflow-auto h-40 bg-black p-2">{{ legacyLeads }}</pre>
      </div>

    </div>
  </div>
</template>

<script setup>
const user = useSupabaseUser()
const supabase = useSupabaseClient()

const allLeads = ref('Click Fetch')
const myLeads = ref('Click Fetch')
const legacyLeads = ref('Click Fetch')

async function fetchAll() {
  allLeads.value = 'Loading...'
  const { data, error } = await supabase.from('leads_hunter').select('id, nome_empresa, user_id').limit(5)
  allLeads.value = error ? error : (data?.length ? data : 'No data found')
}

async function fetchMyLeads() {
  if (!user.value?.id) return myLeads.value = 'Not logged in'
  myLeads.value = 'Loading...'
  const { data, error } = await supabase.from('leads_hunter').select('id, nome_empresa, user_id').eq('user_id', user.value.id).limit(5)
  myLeads.value = error ? error : (data?.length ? data : 'No data found')
}

async function fetchLegacy() {
  legacyLeads.value = 'Loading...'
  const { data, error } = await supabase.from('leads_hunter').select('id, nome_empresa, user_id').is('user_id', null).limit(5)
  legacyLeads.value = error ? error : (data?.length ? data : 'No data found')
}
</script>
