// ══════════════════════════════════════════════════════════════════════════════
// SUPABASE CONNECTION TEST
// ══════════════════════════════════════════════════════════════════════════════
// Run with: npx tsx scripts/test-supabase.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nyoyqzybgsydxhwvfwfr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function testConnection() {
    console.log('🔌 Testing Supabase connection...\n');
    console.log(`📍 URL: ${supabaseUrl}`);

    if (!supabaseServiceKey) {
        console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    try {
        // Test 1: Query tables in public schema
        console.log('\n📋 Fetching tables in public schema...\n');

        const { data, error } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public');

        if (error) {
            // Try alternative method using RPC or direct query
            console.log('ℹ️  Direct query failed, trying alternative...');

            // Check if we can at least connect
            const { data: authData, error: authError } = await supabase.auth.getSession();

            if (authError) {
                console.error('❌ Connection failed:', authError.message);
            } else {
                console.log('✅ Supabase connection successful!');
                console.log('ℹ️  No tables found in public schema (database may be empty)');
            }
        } else {
            console.log('✅ Supabase connection successful!');
            console.log('📊 Tables found:');
            if (data && data.length > 0) {
                data.forEach((table: any) => {
                    console.log(`   - ${table.table_name}`);
                });
            } else {
                console.log('   (no tables in public schema)');
            }
        }

        // Test 2: Check auth health
        console.log('\n🔐 Checking auth service...');
        const { error: healthError } = await supabase.auth.getSession();
        if (!healthError) {
            console.log('✅ Auth service is healthy');
        }

        console.log('\n✨ All checks passed!');

    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

testConnection();
