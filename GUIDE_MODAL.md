# 🚀 Guia de Configuração e Deploy na Modal

## 1. Instalar Cliente Modal (Localmente)
No seu terminal (Powershell ou CMD), execute:

```powershell
pip install modal
```

Em seguida, autentique-se (isso abrirá o navegador):
```powershell
modal token new
```
Siga os passos no navegador para autorizar o computador.

---

## 2. Configurar Segredos do Supabase
Para que o código Python consiga escrever no banco de dados, precisamos criar um "Sidecar Secret" na Modal.

**⚠️ Importante:** Você deve usar a **SERVICE_ROLE_KEY** (não a chave pública/anon) para garantir permissão de escrita sem bloqueios de RLS.

1.  Vá para o [Painel da Modal - Secrets](https://modal.com/secrets).
2.  Clique em **"Create new secret"**.
3.  Escolha **"Custom"**.
4.  Nomeie o segredo como: `supabase-secrets` (exatamente como no código).
5.  Adicione as chaves:
    *   **Key:** `SUPABASE_URL` -> **Value:** (Sua URL do Supabase, ex: `https://xsmofmnrzrcypddrrncr.supabase.co`)
    *   **Key:** `SUPABASE_KEY` -> **Value:** (Sua **SERVICE_ROLE_KEY** do Supabase - pegue em Settings > API)
6.  Clique em **Create**.

---

## 3. Realizar o Deploy
Agora que o ambiente está configurado, envie o código para a nuvem:

```powershell
modal deploy backend_modal/main.py
```

O terminal irá exibir algo como:
`✓ Created ...`
`=> View App: https://modal.com/apps/...`
`=> Function run_hunter: https://SEU-USUARIO--hunter-start-run-hunter.modal.run`

**COPIE A ÚLTIMA URL!** (a que termina em `.modal.run`)

---

## 4. Atualizar o Nuxt
Vá até o arquivo `server/api/hunter.post.ts` e cole a URL que você copiou:

```typescript
const MODAL_API_URL = "https://seu-usuario--hunter-start-run-hunter.modal.run";
```

Pronto! Seu scraper agora roda na nuvem escalável da Modal, liberando seu servidor Nuxt.
