import modal

# 1. Configura a Imagem (O Computador na Nuvem)
# MANTENDO FIX DE INFRAESTRUTURA (Chrome Repos + FastAPI + add_local_dir)
image = (
    modal.Image.debian_slim()
    # 1. Instala dependências básicas do Linux
    .run_commands(
        "apt-get update && apt-get install -y wget gnupg curl ca-certificates",
    )
    # 2. Configura Repositório do Chrome (Crucial para Debian)
    .run_commands(
        "mkdir -p /etc/apt/keyrings",
        "wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /etc/apt/keyrings/google-chrome.gpg",
        "echo 'deb [arch=amd64 signed-by=/etc/apt/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main' | tee /etc/apt/sources.list.d/google-chrome.list",
        "apt-get update",
        "apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-kacst fonts-freefont-ttf libxss1",
    )
    # 3. Instala Node.js 20
    .run_commands(
        "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -",
        "apt-get install -y nodejs",
    )
    # --- TURBO: Instala as dependências NA IMAGEM (Globalmente) ---
    .run_commands(
        "npm install -g puppeteer puppeteer-extra puppeteer-extra-plugin-stealth puppeteer-extra-plugin-user-preferences puppeteer-extra-plugin-user-data-dir @supabase/supabase-js"
    )
    # 4. Dependências Python (Supabase + FastAPI obrigatório)
    .pip_install("supabase", "fastapi[standard]")
    # 5. Variáveis de Ambiente do Usuário (Força uso do Chrome instalado e Node Path)
    .env({
        "PUPPETEER_SKIP_CHROMIUM_DOWNLOAD": "true",
        "PUPPETEER_EXECUTABLE_PATH": "/usr/bin/google-chrome-stable",
        # Onde o npm -g instala no Debian/Ubuntu geralmente é /usr/lib/node_modules ou /usr/local/lib/node_modules
        # Vamos garantir setando ambos no NODE_PATH ou verificando
        "NODE_PATH": "/usr/lib/node_modules:/usr/local/lib/node_modules"
    })
    # 6. Montagem de Arquivos (Método novo v1.3.2)
    # Monta a pasta onde está o main.py (backend_modal) para /root/bot
    .add_local_dir("backend_modal", remote_path="/root/bot", ignore=["node_modules", ".git", ".nuxt", ".output", "venv", "__pycache__", ".agent"])
)

app = modal.App("hunter-bot-turbo")

@app.function(
    image=image,
    secrets=[modal.Secret.from_name("secretssupbase")], # Seu cofre
    # mounts=[...] REMOVIDO (usando .add_local_dir acima para compatibilidade)
    timeout=600 # 10 minutos
)
@modal.web_endpoint(method="POST")
def run_hunter(item: dict):
    import subprocess
    import os
    import sys
    
    termo = item.get("termo")
    user_id = item.get("user_id", "anonymous") # Pega o ID enviado pelo Proxy
    
    print(f"🤖 [NUVEM] Recebido pedido para: {termo} (User: {user_id})")

    # 1. Localiza o script (Smart Path)
    script_path = "/root/bot/robot.js"
    
    if not os.path.exists(script_path):
        print(f"⚠️ {script_path} não encontrado. Tentando subpastas...")
        if os.path.exists("/root/bot/hunter_cloud/robot.js"):
             script_path = "/root/bot/hunter_cloud/robot.js"
             # print(f"✅ Encontrado: {script_path}")
        else:
             # Lista arquivos para debug
             files = os.listdir("/root/bot")
             return {"status": "Erro", "logs": f"CRÍTICO: robot.js não encontrado! Arquivos na raiz: {files}"}

    # --- COMANDO DIRETO (Sem npm install) ---
    # Passamos o termo E o user_id como argumentos
    cmd = f"node {script_path} '{termo}' '{user_id}'"
    
    print(f"🚀 Executando: {cmd}")
    
    # Roda o processo e captura TUDO (stdout e stderr combinados)
    # bufsize=1 e universal_newlines=True ajuda no streaming
    process = subprocess.Popen(
        cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1
    )
    
    # Transmite os logs em tempo real e acumula
    output_total = ""
    try:
        for line in process.stdout:
            print(line, end="") # Imprime no console do Modal
            output_total += line
    except Exception as e:
        print(f"Erro ao ler stdout: {e}")
        output_total += f"\n[Erro interno de leitura de logs: {e}]"

    process.wait() # Espera terminar

    if process.returncode != 0:
        print("❌ O robô falhou!")
        return {"status": "Erro", "logs": f"Falha na execução (Exit Code {process.returncode}):\n{output_total}"}

    print("✅ Robô finalizou com sucesso.")
    return {"status": "Finalizado", "logs": output_total}
