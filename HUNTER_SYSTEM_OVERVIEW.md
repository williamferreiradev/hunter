# 🦅 HUNTER.IO - Documentação Técnica Completa

> **Versão:** 2.0 (Turbo / Blindado)
> **Data:** 13/02/2026

---

## 1. O Que é o Projeto?

O **Hunter.io** é uma plataforma SaaS (Software as a Service) de inteligência de mercado. Sua função principal é **automatizar a prospecção de leads** (clientes potenciais) extraindo dados públicos de empresas diretamente do Google Maps.

O sistema não é apenas um "bot", mas uma aplicação completa com Front-end moderno, Autenticação segura, Sistema de Créditos e uma Infraestrutura de Nuvem escalável.

---

## 2. Arquitetura do Sistema (Como Funciona "Por Baixo do Capô")

O projeto utiliza uma arquitetura **Híbrida e Serverless**:

1.  **Frontend (Nuxt 3 + Vue.js):** A interface onde o usuário interage.
2.  **Backend Proxy (Nitro Server):** Uma camada de segurança no servidor do Nuxt.
3.  **Engine de Extração (Modal.com):** Onde o "trabalho pesado" acontece (Python + Node.js + Chrome).
4.  **Banco de Dados (Supabase):** Onde ficam os usuários, créditos e leads extraídos.

---

## 3. O Fluxo do HUNTER (Passo a Passo)

Aqui está exatamente o que acontece quando você clica em **"INICIAR CAÇADA"**:

### Fase 1: O Comando (Frontend)
1.  **Input:** O usuário digita "Padarias em São Paulo" na tela `/hunter`.
2.  **Validação:** O `hunter.vue` verifica se o usuário tem créditos suficientes (via `Sidebar.vue` / `useSupabaseUser`).
3.  **Disparo:** O Frontend envia uma requisição `POST` para `/api/hunter` com o termo pesquisado.
4.  **Feedback Visual:**
    *   O botão entra em *loading*.
    *   O componente `HuntingTimer.vue` inicia a animação da barra de progresso.
    *   Toasts (notificações) avisam: "Iniciando satélite...".

### Fase 2: A Ponte (Nuxt Proxy)
O arquivo `server/api/hunter.post.ts` recebe o pedido.
1.  **Segurança:** Ele não expõe a URL da sua nuvem (Modal) para o navegador do usuário.
2.  **Redirecionamento:** Ele pega o termo e encaminha para a URL secreta da Modal (`NUXT_MODAL_API_URL` no `.env`).
3.  **Espera:** Ele fica aguardando a resposta da nuvem para devolver ao Frontend.

### Fase 3: A Engine (Modal.com)
É aqui que a mágica acontece. O arquivo `backend_modal/main.py` entra em ação na nuvem:

1.  **Container Linux (Debian):** A Modal sobe um computador novinho na nuvem em segundos.
2.  **Ambiente Híbrido:**
    *   **Python (FastAPI):** Recebe a requisição HTTP.
    *   **Node.js (Puppeteer):** É o robô navegador.
3.  **A "Blindagem":**
    *   O script verifica se o Chrome está instalado corretamente (correção do GPG Key).
    *   O script usa "Smart Path" para achar o arquivo `robot.js` onde quer que ele esteja.
4.  **Execução do Robô:**
    *   O Python roda o comando: `node robot.js "Padarias em São Paulo"`.
    *   O **Puppeteer** abre um Chrome invisível (Headless) dentro do container.
    *   Ele acessa o Google Maps, digita o termo e começa a rolar a lista de resultados.
    *   Ele extrai: Nome, Endereço, Telefone, Site, etc.

### Fase 4: O Retorno
1.  **Streaming de Logs:** Enquanto o robô trabalha, o Python captura os "prints" do Node e manda para o painel da Modal em tempo real.
2.  **Resposta Final:**
    *   O robô termina e devolve um JSON com os leads.
    *   A Modal devolve esse JSON para o Nuxt Proxy.
    *   O Nuxt Proxy devolve para o Frontend (`hunter.vue`).
3.  **Conclusão no Frontend:**
    *   O `HuntingTimer` chega a 100%.
    *   A lista de leads aparece na tela.
    *   Um som ou toast de "Sucesso" é disparado.
    *   **Créditos:** O sistema desconta 1 crédito do usuário no Supabase.

---

## 4. Detalhes Técnicos Críticos

### Como ele é Ativado?
A ativação é 100% via API. Não existe um "botão de ligar" no servidor.
*   **Serverless:** A infraestrutura da Modal "dorme" quando não está em uso (custo zero).
*   **Cold Start:** Quando alguém clica em "Caçar", ela acorda em 1-2 segundos (graças ao modo Turbo).

### Como as Ações são Colocadas?
As ações de navegação (clicar, rolar, extrair) estão codificadas no arquivo **`robot.js`** (Node.js).
*   Ele usa a biblioteca **Puppeteer** para controlar o Chrome.
*   Ele simula um humano:
    *   Move o mouse.
    *   Faz o scroll da página para carregar mais itens.
    *   Clica em cada empresa para abrir os detalhes.
    *   Copia o texto do HTML da página.

### Autenticação & Segurança (A "Blindagem" do Usuário)
Implementamos uma segurança de nível bancário:
1.  **Middleware Global:** Se tentar acessar `/dashboard` sem logar, é chutado para `/login`.
2.  **Supabase Auth:** Gerencia email/senha e tokens de sessão.
3.  **Tabela Pública:** Criamos uma tabela `public.usuario` vinculada ao Auth para guardar os **Créditos**.
4.  **Cadastro Turbo:** Ao se cadastrar, o usuário ganha automaticamente **5 créditos** de boas-vindas.

---

## 5. Resumo da Estrutura de Arquivos

*   **`app/pages/hunter.vue`**: O cérebro do Frontend. Controla a tela de caça.
*   **`backend_modal/main.py`**: O cérebro do Backend. Gerencia o container na nuvem.
*   **`backend_modal/robot.js`**: Os "braços" do robô. Executa a extração no Google Maps.
*   **`server/api/hunter.post.ts`**: O mensageiro seguro. Conecta Front e Back.
*   **`app/middleware/auth.global.ts`**: O segurança. Protege as rotas.

Este é o **Hunter.io**: Um sistema complexo de orquestração entre Nuxt, Python, Node e Chrome, empacotado em uma interface simples e bonita para o usuário final.
