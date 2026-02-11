// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  // Configuração simples para IGNORAR o puppeteer no build
  nitro: {
    externals: {
      external: ['puppeteer', 'puppeteer-extra', 'puppeteer-extra-plugin-stealth']
    }
  }
})