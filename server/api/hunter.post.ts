// server/api/hunter.post.ts
export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // 1. URL da Modal (via Variável de Ambiente)
    const MODAL_URL = process.env.NUXT_MODAL_API_URL || 'https://williamferreiradev--hunter-bot-turbo-run-hunter.modal.run'

    try {
        console.log(`📡 Enviando missão para a nuvem: ${body.termo}`)

        // 2. Chama o Robô na Modal
        const response = await fetch(MODAL_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ termo: body.termo })
        })

        // 3. Recebe o resultado
        const data = await response.json()
        return data

    } catch (error) {
        console.error("Erro na comunicação com a nuvem:", error)
        return {
            success: false,
            error: 'Erro ao conectar com o servidor de caça. Tente novamente.'
        }
    }
})
