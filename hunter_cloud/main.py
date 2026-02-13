import modal
from modal import App, Image, Secret, web_endpoint

# 1. Define a imagem do servidor (Linux + Chrome + Node)
image = (
    Image.debian_slim()
    # Instala Chrome, Node 20 e dependências básicas
    .run_commands(
        "apt-get update",
        "apt-get install -y wget gnupg",
        # FIX 1: Adicionar repositório do Chrome (Obrigatório, senão falha)
        "wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -",
        "sh -c 'echo \"deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main\" >> /etc/apt/sources.list.d/google.list'",
        "apt-get update",
        "apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1",
        "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -",
        "apt-get install -y nodejs",
    )
    .run_commands("npm install -g npm@latest")
    # FIX 2: Método correto de copiar arquivos nessa versão da Modal
    .add_local_dir("./", remote_path="/root/bot")
)

app = App("hunter-bot-pro")

# 2. Configura a função Web (API)
@app.function(
    image=image,
    # CHAVES INJETADAS AUTOMATICAMENTE
    secrets=[Secret.from_dict({
        "SUPABASE_URL": "https://xsmofmnrzrcypddrrncr.supabase.co",
        "SUPABASE_KEY": "sb_publishable_YLLrdth-tBE33gFXnxlpjQ_JStnml_p"
    })],
    # mounts=[] Removido pois quebra nesta versão (usamos .add_local_dir acima)
    timeout=600 # 10 minutos para rodar
)
@web_endpoint(method="POST")
def run_hunter(item: dict):
    import subprocess
    import os
    
    termo = item.get("termo")
    print(f"Recebido pedido: {termo}")

    # Entra na pasta, instala dependências (se precisar) e roda o robô
    # O unbuffered=True garante que os logs apareçam em tempo real
    cmd = f"cd /root/bot && npm install && node robot.js '{termo}'"
    
    process = subprocess.Popen(
        cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
    )
    
    # Lê os logs em tempo real (opcional, para debug)
    stdout, stderr = process.communicate()
    
    print(stdout)
    if stderr: print("Erros:", stderr)

    return {"status": "Finalizado", "logs": stdout}
