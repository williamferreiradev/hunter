# Hunter Bot 🕵️‍♂️

Bot de extração de leads do Google Maps integrado com Supabase.

## Instalação

As dependências já foram instaladas. Caso precise reinstalar:

```bash
cd hunter-bot
npm install
```

## Configuração

Abra o arquivo `index.js` e configure suas credenciais do Supabase nas linhas:

```javascript
const supabase = createClient('SUA_URL_SUPABASE', 'SUA_CHAVE_SERVICE_ROLE');
```

## Como usar

Execute o comando na raiz do projeto (ou dentro da pasta `hunter-bot` adjustando o caminho):

```bash
node hunter-bot/index.js "Termo de busca"
```

Exemplo:

```bash
node hunter-bot/index.js "Pizzarias em São Paulo"
```

## Notas

- O navegador abrirá visivelmente (`headless: false`) para que você possa acompanhar.
- O script tenta rolar a página automaticamente para carregar mais resultados.
