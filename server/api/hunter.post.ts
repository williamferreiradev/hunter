// server/api/hunter.post.ts
import { createRequire } from 'module'
import { createClient } from '@supabase/supabase-js'

// --- CONFIGURAÇÃO ---
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const termo = body.termo

    if (!termo) throw createError({ statusCode: 400, message: 'Faltou o termo!' })

    // --- SOLUÇÃO DE IMPORTAÇÃO: createRequire (MANTIDA PARA EVITAR ERRO DE BUILD) ---
    const require = createRequire(import.meta.url)
    const puppeteer = require('puppeteer-extra')
    const StealthPlugin = require('puppeteer-extra-plugin-stealth')

    puppeteer.use(StealthPlugin())

    console.log(`🤖 Iniciando CAÇADA TÁTICA para: ${termo}`)

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized', '--lang=pt-BR']
    })

    // @ts-ignore
    const page = await browser.newPage()
    const leadsSalvos: any[] = []

    try {
        // 1. URL CORRETA (Oficial)
        // @ts-ignore
        await page.goto(`https://www.google.com.br/maps/search/${encodeURIComponent(termo)}`, {
            waitUntil: 'networkidle2',
            timeout: 60000
        })

        // 2. SCROLL NA LISTA
        console.log("📜 Carregando lista...")
        // @ts-ignore
        try { await page.waitForSelector('div[role="feed"]', { timeout: 10000 }); } catch (e) { }

        // @ts-ignore
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

        // 3. CAPTURA DOS LINKS
        // @ts-ignore
        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a'))
                .map(a => a.href)
                .filter(href => href.includes('/maps/place/'))
                .filter((v, i, a) => a.indexOf(v) === i);
        });

        console.log(`🎯 Encontrados ${links.length} locais. Iniciando extração...`)

        // 4. LOOP DE EXTRAÇÃO (VISITANDO CADA LOCAL)
        // @ts-ignore
        for (const link of links) {
            // @ts-ignore
            const detailPage = await browser.newPage();

            try {
                // Aumentei o timeout e mudei o wait
                // @ts-ignore
                await detailPage.goto(link, { waitUntil: 'domcontentloaded', timeout: 25000 });

                // Pequena pausa pro título carregar
                // @ts-ignore
                await new Promise(r => setTimeout(r, 1500));

                // --- EXTRAÇÃO NO DOM (TÁTICA TÍTULO DA ABA) ---
                // @ts-ignore
                const data = await detailPage.evaluate(() => {
                    // ESTRATÉGIA 1: Título da Aba (Infalível)
                    let nome = document.title;
                    if (nome.includes(' - Google Maps')) {
                        nome = nome.replace(' - Google Maps', '').trim();
                    }

                    // ESTRATÉGIA 2: H1 (Se o título falhar ou for genérico)
                    if (!nome || nome === "Google Maps") {
                        const h1 = document.querySelector('h1');
                        if (h1) nome = h1.innerText;
                    }

                    // Se depois de tudo for "Google Maps", é lixo
                    if (nome === "Google Maps" || !nome) return null;

                    // Extração de Texto Completo para Regex
                    const bodyText = document.body.innerText;

                    // Telefone (Regex BR)
                    const phoneRegex = /\(\d{2}\)\s\d{4,5}-?\d{4}/;
                    const phoneMatch = bodyText.match(phoneRegex);
                    const telefone = phoneMatch ? phoneMatch[0] : null;

                    // Endereço (Procura pelo botão com ícone de local)
                    const buttons = Array.from(document.querySelectorAll('button'));
                    const addressBtn = buttons.find(b => b.getAttribute('aria-label')?.includes('Endereço: '));
                    const endereco = addressBtn ? addressBtn.getAttribute('aria-label').replace('Endereço: ', '') : null;

                    // Site (Procura links externos)
                    const allLinks = Array.from(document.querySelectorAll('a[href^="http"]'));
                    const websiteLink = allLinks.find(a =>
                        !a.href.includes('google.com') &&
                        !a.href.includes('googleadservices') &&
                        (a.getAttribute('data-item-id') === 'authority' || a.innerText.includes('Website') || a.innerText.includes('Site'))
                    );

                    return {
                        nome_empresa: nome,
                        telefone: telefone,
                        // @ts-ignore
                        website_url: websiteLink ? websiteLink.href : null,
                        endereco: endereco
                    };
                });

                if (!data) {
                    console.log(`   ⚠️ Pulei: Título da página estava inválido.`);
                    // CORREÇÃO: Não chamar close() aqui, deixar o finally cuidar disso
                    continue;
                }

                // Análise Rápida
                let leadFinal = {
                    termo_pesquisa: termo,
                    ...data,
                    tem_site: !!data.website_url,
                    nota: data.website_url ? "TEM SITE" : "SEM SITE (OPORTUNIDADE)",
                    site_provavelmente_ruim: false,
                    status: 'novo'
                };

                console.log(`   ✅ ${leadFinal.nome_empresa} | ${leadFinal.nota}`);

                // Salvar no Banco (MANUAL UPSERT para evitar erro ON CONFLICT)
                const { data: existing } = await supabase
                    .from('leads_hunter')
                    .select('id')
                    .eq('nome_empresa', leadFinal.nome_empresa)
                    .maybeSingle()

                if (existing) {
                    // Atualiza
                    const { error: updateError } = await supabase
                        .from('leads_hunter')
                        .update(leadFinal)
                        .eq('id', existing.id)

                    if (updateError) console.error(`      ❌ Erro Update: ${updateError.message}`);
                    else leadsSalvos.push(leadFinal);
                } else {
                    // Insere
                    const { error: insertError } = await supabase
                        .from('leads_hunter')
                        .insert(leadFinal)

                    if (insertError) console.error(`      ❌ Erro Insert: ${insertError.message}`);
                    else leadsSalvos.push(leadFinal);
                }

            } catch (err: any) {
                console.log(`   ❌ Erro de navegação: ${err.message}`);
            } finally {
                // @ts-ignore
                await detailPage.close();
            }
        }

    } catch (error: any) {
        console.error("ERRO GERAL:", error)
        return { success: false, erro: error.message }
    } finally {
        await browser.close()
    }

    return { success: true, total: leadsSalvos.length, leads: leadsSalvos }
})
