
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Manually load .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '.env');

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.warn('.env file not found at', envPath);
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.NUXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. Checked SUPABASE_URL/KEY and NUXT_PUBLIC_SUPABASE_URL/KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLeads() {
    console.log('Checking leads_hunter table...');
    console.log('Using URL:', supabaseUrl);

    // 1. Count total leads
    const { count, error: countError } = await supabase
        .from('leads_hunter')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('Error counting leads:', countError);
        // Does the table exist?
        if (countError.code === '42P01') {
            console.error('Table leads_hunter does not exist!');
        }
        return;
    }
    console.log(`Total leads in table: ${count}`);

    // 2. Sample leads to see user_id distribution
    const { data, error } = await supabase
        .from('leads_hunter')
        .select('id, nome_empresa, user_id, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Error fetching leads:', error);
        return;
    }

    console.log('\nLatest 20 leads:');
    if (!data || data.length === 0) {
        console.log('No leads found.');
    } else {
        console.table(data);
    }
}

checkLeads();
