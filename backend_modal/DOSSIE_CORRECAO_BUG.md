# 🛡️ Dossiê de Guerra: Correção do Bug de Deploy na Modal (Chrome & Paths)

> **Status:** RESOLVIDO
> **Data:** 12/02/2026
> **Severidade:** CRÍTICA (Impedia o deploy completo)
> **Componente:** `backend_modal/main.py` (Infraestrutura Serverless)

---

## 🚨 O Cenário
Estávamos migrando um bot de extração (Node.js/Puppeteer) para rodar dentro de um container Python na plataforma Serverless **Modal.com**. O objetivo era ter escalabilidade infinita sem gerenciar servidores.

## 🐛 O Inimigo nº 1: A Instalação do Chrome (Erro GPG Key)

### O Sintoma
Ao tentar construir a imagem Docker do container, o processo falhava na etapa de instalação do Google Chrome com o seguinte erro:

```
W: GPG error: http://dl.google.com/linux/chrome/deb stable Release: The following signatures couldn't be verified because the public key is not available: NO_PUBKEY E88979FB9B30ACF2
E: The repository 'http://dl.google.com/linux/chrome/deb stable Release' is not signed.
```

### A Causa Raiz
O comando padrão sugerido na maioria dos tutoriais (incluindo alguns antigos da Modal) usava `apt-key add`, que foi **descontinuado** nas versões mais recentes do Debian (sistema base da imagem `debian_slim`). O sistema de segurança do Debian rejeitava a chave de assinatura do repositório do Google, impedindo o `apt-get update`.

### 🛡️ A Solução Definitiva (O "Blindado")
Reescrevemos o bloco de construção da imagem para usar o padrão moderno de chaveiros (`keyrings`) do Linux.

**Código da Correção:**
```python
# MANTENDO FIX DE INFRAESTRUTURA (Chrome Repos + FastAPI + add_local_dir)
image = (
    modal.Image.debian_slim()
    # 1. Instala dependências básicas do Linux
    .run_commands(
        "apt-get update && apt-get install -y wget gnupg curl ca-certificates",
    )
    # 2. Configura Repositório do Chrome (Crucial para Debian Moderno)
    .run_commands(
        "mkdir -p /etc/apt/keyrings",
        # Baixa a chave e converte para formato gpg (dearmor)
        "wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /etc/apt/keyrings/google-chrome.gpg",
        # Adiciona o repositório referenciando a chave correta
        "echo 'deb [arch=amd64 signed-by=/etc/apt/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main' | tee /etc/apt/sources.list.d/google-chrome.list",
        "apt-get update",
        "apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-kacst fonts-freefont-ttf libxss1",
    )
    # ... resto da instalação
)
```

---

## 🐛 O Inimigo nº 2: O Arquivo Fantasma (`robot.js` not found)

### O Sintoma
O container subia, instalava tudo, mas na hora de rodar o comando `node robot.js`, o log estourava:

```
Error: Cannot find module '/root/robot.js'
    at Function.Module._resolveFilename (node:internal/modules/cjs/loader:933:15)
    ...
```

### A Causa Raiz
A forma como a Modal monta arquivos locais mudou. Usar `mounts=[modal.Mount.from_local_dir(...)]` estava colocando os arquivos em caminhos imprevisíveis ou não montando corretamente na raiz `/root`, dependendo da versão da CLI. O script Node.js não sabia onde ele mesmo estava.

### 🛡️ A Solução Definitiva (Smart Path + add_local_dir)
1.  **Mudança na Montagem:** Passamos a usar `.add_local_dir("./", remote_path="/root/bot")` diretamente na definição da imagem. Isso força os arquivos a irem para uma pasta conhecida.
2.  **Smart Path Detection:** No código Python, criamos uma lógica que "caça" o arquivo antes de tentar rodar.

**Código da Correção:**
```python
# 1. Montagem explícita na imagem
image = (
    # ...
    .add_local_dir("./", remote_path="/root/bot")
)

# 2. Lógica de Detecção no Python
@modal.web_endpoint(method="POST")
def run_hunter(item: dict):
    # ...
    # 1. Localiza o script (Smart Path)
    script_path = "/root/bot/robot.js"
    
    if not os.path.exists(script_path):
        print(f"⚠️ {script_path} não encontrado. Tentando subpastas...")
        # Fallback caso a montagem crie uma subpasta com o nome do projeto
        if os.path.exists("/root/bot/hunter_cloud/robot.js"):
             script_path = "/root/bot/hunter_cloud/robot.js"
        else:
             # Debug total: lista o que tem lá
             files = os.listdir("/root/bot")
             return {"status": "Erro", "logs": f"CRÍTICO: robot.js sumiu! Arquivos: {files}"}
    
    # Agora é 100% seguro rodar
    cmd = f"node {script_path} '{termo}'"
```

---

## 🚀 A Estratégia "Turbo" (Bônus)

Além de corrigir os bugs, implementamos uma melhoria de performance crítica: **Dependências Globais**.

**O Problema Anterior:**
O script rodava `npm install` TODA VEZ que o endpoint era chamado. Isso adicionava 30-60 segundos de latência ("Cold Start").

**A Solução Turbo:**
Instalamos o `puppeteer` e o `supabase-js` **dentro da imagem Docker** durante o build.

```python
# No main.py
.run_commands(
    "npm install -g puppeteer@21.5.0 puppeteer-extra puppeteer-extra-plugin-stealth @supabase/supabase-js"
)
.env({
    # Diz pro Node onde achar os módulos globais no Debian
    "NODE_PATH": "/usr/lib/node_modules:/usr/local/lib/node_modules"
})
```

**Resultado:** O bot agora inicia em **segundos**, não minutos.

---

## ✅ Conclusão

Este arquivo documenta a "blindagem" do nosso backend. Se precisarmos migrar para outra conta Modal ou reconstruir o projeto:

1.  **NÃO TIRE** os comandos `gpg` e `keyrings`. O Debian precisa deles.
2.  **NÃO TIRE** o `.add_local_dir`. Ele garante que seus arquivos subam.
3.  **MANTENHA** o `NODE_PATH`. Ele permite o modo Turbo sem `npm install`.

Assinado,
**Hunter.io Engineering Team**
