#!/usr/bin/env npx tsx

/**
 * Test Supabase connection by querying the projects table
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nyoyqzybgsydxhwvfwfr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55b3lxenliZ3N5ZHhod3Zmd2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMDcxNzQsImV4cCI6MjA4NDg4MzE3NH0.D6C4c6HMKu5NmZTv6WFkGuUT5szSb8jBSb95sgURnzw';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55b3lxenliZ3N5ZHhod3Zmd2ZyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMwNzE3NCwiZXhwIjoyMDg0ODgzMTc0fQ.hXGLQNXCaBJCNrZmojxVocNqyZRVPaaFBjcCpf6uPmI';

async function testConnection() {
    console.log('🔌 Testing Supabase connection...\n');

    // Test with anon key
    console.log('1️⃣ Testing with ANON key:');
    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { count: anonCount, error: anonError } = await anonClient
        .from('projects')
        .select('*', { count: 'exact', head: true });

    if (anonError) {
        console.log(`   ❌ Anon key error: ${anonError.message}`);
    } else {
        console.log(`   ✅ Anon key works! Projects count: ${anonCount}`);
    }

    // Test with service role key
    console.log('\n2️⃣ Testing with SERVICE ROLE key:');
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    const { count: serviceCount, error: serviceError } = await serviceClient
        .from('projects')
        .select('*', { count: 'exact', head: true });

    if (serviceError) {
        console.log(`   ❌ Service key error: ${serviceError.message}`);
    } else {
        console.log(`   ✅ Service key works! Projects count: ${serviceCount}`);
    }

    // Test all tables exist
    console.log('\n3️⃣ Checking all tables exist:');
    const tables = ['users', 'projects', 'contracts'];

    for (const table of tables) {
        const { error } = await serviceClient
            .from(table)
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.log(`   ❌ ${table}: ${error.message}`);
        } else {
            console.log(`   ✅ ${table}: exists`);
        }
    }

    console.log('\n✨ Connection test complete!');
}

testConnection().catch(console.error);
