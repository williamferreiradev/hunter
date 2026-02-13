// hunter_cloud/robot.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { createClient } = require('@supabase/supabase-js');

// Pega os argumentos que a Modal vai mandar
const termo = process.argv[2];
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!termo) { console.error("❌ ERRO: Sem termo de busca!"); process.exit(1); }

puppeteer.use(StealthPlugin());
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

(async () => {
    console.log(`🤖 [NUVEM] Iniciando caçada por: ${termo}`);

    // Configuração OBRIGATÓRIA para rodar em servidor Linux (Modal)
    const browser = await puppeteer.launch({
        headless: "new", // Sem interface gráfica
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--lang=pt-BR'
        ]
    });

    const page = await browser.newPage();
    const leadsSalvos = [];

    try {
        await page.goto(`https://www.google.com.br/maps/search/${encodeURIComponent(termo)}`, { waitUntil: 'networkidle2', timeout: 60000 });

        // --- SEU CÓDIGO DE SCROLL E EXTRAÇÃO AQUI ---
        // (Vou resumir a lógica de scroll pra caber, use a mesma lógica do seu hunter.post.ts)

        console.log("📜 Rolando página...");
        try { await page.waitForSelector('div[role="feed"]', { timeout: 10000 }); } catch (e) { }

        await page.evaluate(async () => {
            const feed = document.querySelector('div[role="feed"]');
            if (!feed) return;
            await new Promise((resolve) => {
                let totalHeight = 0;
                let distance = 800;
                let attempts = 0;
                const timer = setInterval(() => {
                    let scrollHeight = feed.scrollHeight;
                    feed.scrollBy(0, distance);
                    totalHeight += distance;
                    if (totalHeight >= scrollHeight) {
                        attempts++;
                        if (attempts > 3) { clearInterval(timer); resolve(true); }
                    } else { attempts = 0; }
                }, 500);
            });
        });

        // Captura Links
        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a'))
                .map(a => a.href)
                .filter(href => href.includes('/maps/place/'))
                .filter((v, i, a) => a.indexOf(v) === i);
        });

        console.log(`🎯 Encontrados ${links.length} locais. Processando...`);

        // Loop de Visita
        for (const link of links) {
            const detailPage = await browser.newPage();
            try {
                await detailPage.goto(link, { waitUntil: 'domcontentloaded', timeout: 20000 });
                await new Promise(r => setTimeout(r, 1000)); // Pausa tática

                const data = await detailPage.evaluate(() => {
                    let nome = document.title.replace(' - Google Maps', '').trim();
                    if (nome === "Google Maps") return null;

                    const bodyText = document.body.innerText;
                    const phoneMatch = bodyText.match(/\(\d{2}\)\s\d{4,5}-?\d{4}/);

                    const allLinks = Array.from(document.querySelectorAll('a[href^="http"]'));
                    const websiteLink = allLinks.find(a =>
                        !a.href.includes('google.com') &&
                        !a.href.includes('googleadservices') &&
                        (a.getAttribute('data-item-id') === 'authority' || a.innerText.includes('Website') || a.innerText.includes('Site'))
                    );

                    const btns = Array.from(document.querySelectorAll('button'));
                    const addr = btns.find(b => b.getAttribute('aria-label')?.includes('Endereço: '));

                    return {
                        nome_empresa: nome,
                        telefone: phoneMatch ? phoneMatch[0] : null,
                        website_url: websiteLink ? websiteLink.href : null,
                        endereco: addr ? addr.getAttribute('aria-label').replace('Endereço: ', '') : null
                    };
                });

                if (data) {
                    const lead = {
                        termo_pesquisa: termo,
                        ...data,
                        tem_site: !!data.website_url,
                        nota: data.website_url ? "TEM SITE" : "SEM SITE (OPORTUNIDADE)",
                        site_provavelmente_ruim: false
                    };

                    console.log(`✅ ${lead.nome_empresa}`);

                    const { error } = await supabase.from('leads_hunter').upsert(lead, { onConflict: 'nome_empresa' });
                    if (!error) leadsSalvos.push(lead);
                }

            } catch (e) { console.log("Erro no lead:", e.message); }
            finally { await detailPage.close(); }
        }

    } catch (e) {
        console.error("Erro Fatal:", e);
    } finally {
        await browser.close();
        console.log(`🏁 FIM. ${leadsSalvos.length} leads salvos.`);
    }
})();
