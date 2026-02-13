<script setup lang="ts">
  definePageMeta({
    layout: 'auth'
  })
</script>

<template>
  <div class="h-screen w-screen overflow-hidden flex bg-gray-950 text-white font-sans">
    
    <!-- LADO ESQUERDO: IMAGEM (50% desktop, hidden mobile) -->
    <div class="hidden lg:block w-1/2 relative">
        
        <!-- Imagem de Fundo (Local Asset) -->
        <div 
             class="absolute inset-0 bg-cover bg-center"
             style="background-image: url('/assets/hunter-bg.jpg');"
        ></div>

        <!-- Dark Overlay (Gradiente para texto) -->
        <div class="absolute inset-0 bg-black/60"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent"></div>

        <!-- Texto Promocional / Frase de Efeito -->
        <div class="absolute bottom-20 left-12 max-w-lg z-10 transition-all duration-1000 slide-in-bottom">
            <div class="flex items-center gap-2 text-green-500 font-bold uppercase tracking-widest text-sm mb-4">
                <span class="relative flex h-3 w-3">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                System Online
            </div>
            
            <h1 class="text-6xl font-bold text-white mb-6 leading-none">
                A Caçada <br>
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">Começa Agora.</span>
            </h1>
            
            <p class="text-gray-300 text-lg border-l-4 border-green-500 pl-6 py-2 bg-black/30 backdrop-blur-sm rounded-r-lg">
                Plataforma de inteligência tática e extração de dados para caçadores de elite.
            </p>
        </div>
    </div>

    <!-- LADO DIREITO: FORMULÁRIO (100% mobile, 50% desktop) -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-950 relative">
        
        <!-- Efeito de Grid (Tech Background) -->
        <div class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <!-- Glow Central -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/5 blur-[120px] rounded-full pointer-events-none"></div>

        <LoginCard class="w-full max-w-md relative z-10" />

        <!-- Footer Links MOBILE -->
        <div class="absolute bottom-6 text-center text-gray-600 text-xs w-full">
            &copy; 2026 Hunter.io Inc.
        </div>
    </div>

  </div>
</template>

<style scoped>
.slide-in-bottom {
    animation: slideUp 1s ease-out forwards;
}

@keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
