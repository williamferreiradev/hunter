
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLeads() {
    console.log('Checking leads_hunter table...');

    // 1. Count total leads
    const { count, error: countError } = await supabase
        .from('leads_hunter')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('Error counting leads:', countError);
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
    if (data.length === 0) {
        console.log('No leads found.');
    } else {
        console.table(data);
    }

    // 3. Check specific user_id if provided (simulating the frontend check)
    // You can pass a UUID as an argument to test a specific user
    const targetUserId = process.argv[2];
    if (targetUserId) {
        console.log(`\nChecking for user_id: ${targetUserId}`);
        const { count: userCount, error: userError } = await supabase
            .from('leads_hunter')
            .select('*', { count: 'exact', head: true })
            .or(`user_id.eq.${targetUserId},user_id.is.null`);

        if (userError) {
            console.error('Error checking user leads:', userError);
        } else {
            console.log(`Leads found for user (OR NULL): ${userCount}`);
        }
    }
}

checkLeads();
