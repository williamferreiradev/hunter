# 🛡️ Dossiê de Guerra: Bug de Autenticação Supabase (User ID vs Sub)

> **Status:** RESOLVIDO
> **Data:** 13/02/2026
> **Severidade:** CRÍTICA (Dashboard não carregava dados)
> **Componente:** `app/pages/dashboard.vue` (Frontend Auth Logic)

---

## 🚨 O Cenário
Ao fazer login na aplicação, o usuário era redirecionado para o Dashboard, mas os dados (créditos, leads, etc.) ficavam eternamente em "Aguardando..." ou retornavam erro de "ID não detectado".

## 🐛 O Inimigo: A Estrutura do Objeto User (JWT vs User)

### O Sintoma
O composable `useSupabaseUser()` retornava um objeto populado, mas o campo `.value.id` estava indefinido ou não era persistido corretamente na reatividade do Vue. No entanto, o email estava visível no debug.

### A Causa Raiz
O objeto retornado pelo `useSupabaseUser()` neste ambiente/configuração específica não é o objeto padrão de "User" do Supabase Auth (que tem um campo `id` no topo), mas sim o **payload decodificado do token JWT (JSON Web Token)**.

Em tokens JWT padrão (OIDC/OAuth), o identificador único do usuário não fica no campo `id`, mas sim no campo **`sub` (Subject)**.

**Exemplo do Objeto Recebido (Raw):**
```json
{
  "iss": "https://xsmofmnrzrcypddrrncr.supabase.co/auth/v1",
  "sub": "2696f097-e6c0-4d77-b149-2c33d704bc50", // <--- O ID ESTÁ AQUI!
  "aud": "authenticated",
  "exp": 1770992289,
  "iat": 1770988689,
  "email": "wf@gmail.com",
  // ... outros campos de metadados
}
```

O código anterior esperava estritamente `user.value.id`, que não existia nesse nível do objeto.

### 🛡️ A Solução Definitiva (Tríade de Fallback)

Implementamos uma lógica de recuperação de ID robusta no `dashboard.vue` que tenta obter o ID de três fontes diferentes, em ordem de prioridade:

1.  **`user.value.id`**: O padrão esperado (para compatibilidade futura/correta).
2.  **`user.value.sub`**: O "Subject" do token JWT (a correção para o problema atual).
3.  **`route.query.uid`**: Um fallback explícito passado via URL durante o redirecionamento de Login/Registro.

**Código da Correção:**
```typescript
// Monitoramento de Auth (Watch)
watch(() => user.value, (newUser) => {
    // @ts-ignore
    const currentId = newUser?.id || newUser?.sub || route.query.uid
    
    if (currentId) {
        console.log('✅ Dashboard: Usuário/UID detectado:', currentId)
        fetchDashboardData()
    }
}, { immediate: true })
```

Esta abordagem "blindada" garante que, independente de como o Supabase/Nuxt entregue o objeto de sessão (User ou JWT), a aplicação conseguirá extrair o ID único e carregar os dados.

---

## 🚀 Prevenção (Lições Aprendidas)

1.  **Sempre inspecione o objeto completo**: Não assuma a estrutura de `user.value`. Use `JSON.stringify(user.value)` para ver o que realmente está chegando.
2.  **JWT Awareness**: Se o objeto se parecer com um token (tem `iss`, `aud`, `exp`, `sub`), trate-o como tal. O ID é o `sub`.
3.  **Redundância na Navegação**: Passar dados cruciais (como UID) via Query Params no redirecionamento (`router.push({ query: { uid } })`) salva o dia quando o estado global (Pinia/Composables) demora a hidratar.

Assinado,
**Hunter.io Engineering Team**
