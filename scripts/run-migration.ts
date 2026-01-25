#!/usr/bin/env npx tsx

/**
 * Run migration SQL directly against Supabase using the Management API
 */

import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = 'https://nyoyqzybgsydxhwvfwfr.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55b3lxenliZ3N5ZHhod3Zmd2ZyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMwNzE3NCwiZXhwIjoyMDg0ODgzMTc0fQ.hXGLQNXCaBJCNrZmojxVocNqyZRVPaaFBjcCpf6uPmI';
const PROJECT_REF = 'nyoyqzybgsydxhwvfwfr';

async function runSQL(sql: string) {
    // Use the Supabase SQL endpoint (pg-meta)
    const response = await fetch(`${SUPABASE_URL}/pg/query`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ query: sql }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`SQL failed (${response.status}): ${text}`);
    }

    return response.json();
}

async function main() {
    const migrationPath = path.resolve(__dirname, '../supabase/migrations/0001_initial_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📦 Running migration against Supabase...\n');

    // Split into individual statements and run them
    const statements = sql
        .split(/;(?=\s*(?:--|CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|GRANT|REVOKE|$))/i)
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

    let success = 0;
    let failed = 0;

    for (const statement of statements) {
        if (!statement || statement.length < 5) continue;

        try {
            await runSQL(statement + ';');
            success++;
            // Show first 60 chars of statement
            const preview = statement.replace(/\s+/g, ' ').slice(0, 60);
            console.log(`✅ ${preview}...`);
        } catch (err: any) {
            failed++;
            const preview = statement.replace(/\s+/g, ' ').slice(0, 40);
            console.error(`❌ ${preview}... - ${err.message}`);
        }
    }

    console.log(`\n📊 Results: ${success} succeeded, ${failed} failed`);

    // Verify tables exist
    console.log('\n🔍 Verifying tables...');
    try {
        const result = await runSQL(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `);
        console.log('Tables in public schema:', result);
    } catch (err: any) {
        console.error('Verification failed:', err.message);
    }
}

main().catch(console.error);
