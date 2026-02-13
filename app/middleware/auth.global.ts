export default defineNuxtRouteMiddleware((to, from) => {
    const user = useSupabaseUser()

    // Lista de rotas públicas
    const publicRoutes = ['/login', '/register', '/esqueceusenha']

    // Ignora rotas de assets, api e nuxt internals
    if (to.path.startsWith('/_nuxt') ||
        to.path.startsWith('/api') ||
        to.path.startsWith('/assets') ||
        to.path.includes('.')) {
        return
    }

    // Se o usuário NÃO está logado e tenta acessar rota protegida
    if (!user.value && !publicRoutes.includes(to.path)) {
        return navigateTo('/login')
    }

    // Se o usuário JÁ está logado e tenta acessar login/register
    if (user.value && publicRoutes.includes(to.path)) {
        return navigateTo('/') // Redireciona para home/dashboard
    }
})
