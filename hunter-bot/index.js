// hunter-bot/index.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

require('dotenv').config({ path: '../.env' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

puppeteer.use(StealthPlugin());

const TERMO_BUSCA = process.argv[2] || 'Tatuadores em São Paulo'; // Pega do terminal

async function run() {
    console.log(`🔍 Iniciando caçada por: "${TERMO_BUSCA}"...`);

    // Launch puppeteer. Headless: false to see it in action.
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Adding these for stability
    });
    const page = await browser.newPage();

    // 1. Ir para o Google Maps
    await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(TERMO_BUSCA)}`);

    try {
        await page.waitForSelector('div[role="feed"]', { timeout: 10000 });
    } catch (e) {
        console.log("Erro ao carregar lista. O Google pode ter pedido Captcha.");
        // Keep browser open for inspection if needed, or close. 
        // For this script, we'll return but not close browser immediately to let user see?
        // User script says 'return', so we return.
        // But we should probably close browser or let it hang? Script says return.
        await browser.close();
        return;
    }

    // Auto-scroll para carregar mais resultados
    console.log("📜 Rolando a lista para carregar leads...");
    await autoScroll(page);

    // 2. Extrair dados básicos do HTML
    const places = await page.evaluate(() => {
        const elements = document.querySelectorAll('div[role="article"]');
        return Array.from(elements).map(el => {
            const url = el.querySelector('a')?.href;
            const text = el.innerText.split('\n');
            return {
                nome: el.getAttribute('aria-label') || text[0],
                url_maps: url,
            };
        });
    });

    console.log(`🎯 ${places.length} locais encontrados. Analisando detalhes...`);

    // 3. Loop detalhado em cada local
    for (const place of places) {
        if (!place.url_maps) continue;

        const newPage = await browser.newPage();
        try {
            await newPage.goto(place.url_maps, { waitUntil: 'domcontentloaded', timeout: 30000 });
        } catch (e) {
            console.log(`Erro ao abrir mapa para ${place.nome}: ${e.message}`);
            await newPage.close();
            continue;
        }

        // Extração dos detalhes
        const details = await newPage.evaluate(() => {
            const textBody = document.body.innerText;
            // Tenta achar site (botão que geralmente tem globo ou texto website)
            const websiteBtn = document.querySelector('a[data-item-id="authority"]');
            // Regex simples telefone - pode precisar de ajuste
            const phoneBtn = document.body.innerText.match(/\(\d{2}\)\s\d{4,5}-\d{4}/);

            return {
                website: websiteBtn ? websiteBtn.href : null,
                phone: phoneBtn ? phoneBtn[0] : null,
                address: document.querySelector('button[data-item-id="address"]')?.getAttribute('aria-label')?.replace('Endereço: ', '')
            };
        });

        // 4. Análise de Qualidade do Site (Se existir)
        let siteRuim = false;
        let motivoSite = null;

        if (details.website) {
            // Lógica rápida: Checa se o site abre e se tem viewport mobile
            try {
                await newPage.goto(details.website, { waitUntil: 'domcontentloaded', timeout: 15000 }); // timeout reduzido
                const isResponsive = await newPage.evaluate(() => {
                    return !!document.querySelector('meta[name="viewport"]');
                });

                if (!isResponsive) {
                    siteRuim = true;
                    motivoSite = "Site antigo (não responsivo)";
                }
            } catch (err) {
                siteRuim = true; // Assume ruim se não abre
                motivoSite = "Site fora do ar ou lento demais";
            }
        } else {
            siteRuim = true;
            motivoSite = "NÃO TEM SITE (Oportunidade de Ouro)";
        }

        // 5. Tentativa de Enriquecer Decisor (via BrasilAPI buscando pelo nome da empresa)
        let decisorInfo = {};
        if (details.address) {
            // Aqui entra aquela lógica de tentar achar o CNPJ pelo nome na BrasilAPI
            // Simplificado para demonstração:
            decisorInfo.nome_socio = "Pesquisar Manualmente";
        }

        // 6. Salvar no Supabase
        // Using upsert or just insert. Script uses insert.
        const { error } = await supabase.from('leads_hunter').insert({
            termo_pesquisa: TERMO_BUSCA,
            nome_empresa: place.nome,
            website_url: details.website,
            telefone: details.phone,
            endereco: details.address,
            tem_site: !!details.website,
            site_provavelmente_ruim: siteRuim,
            motivo_site_ruim: motivoSite,
            status: 'novo'
        });

        if (error) console.error("Erro ao salvar:", error.message);
        else console.log(`✅ Salvo: ${place.nome} | Site: ${details.website ? 'Sim' : 'NÃO'}`);

        await newPage.close();
        // Delay humano para evitar bloqueio
        await new Promise(r => setTimeout(r, 2000));
    }

    await browser.close();
}

// Função auxiliar de scroll
async function autoScroll(page) {
    await page.evaluate(async () => {
        const wrapper = document.querySelector('div[role="feed"]');
        await new Promise((resolve) => {
            let totalHeight = 0;
            let distance = 1000;
            const timer = setInterval(() => {
                // Se wrapper sumiu ou mudou
                if (!wrapper) { clearInterval(timer); resolve(); return; }

                // Tenta scrollar
                wrapper.scrollBy(0, distance);
                totalHeight += distance;

                // Checa se chegou no fim (pode ser impreciso em infinite scroll, mas serve)
                if (totalHeight >= wrapper.scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 1000);
        });
    });
}

run();
