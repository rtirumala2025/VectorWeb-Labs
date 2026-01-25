import { createClient } from '@supabase/supabase-js';

// ══════════════════════════════════════════════════════════════════════════════
// SUPABASE CLIENT CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ──────────────────────────────────────────────────────────────────────────────
// Browser Client (for client components)
// Uses the anon key - respects Row Level Security
// ──────────────────────────────────────────────────────────────────────────────
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ──────────────────────────────────────────────────────────────────────────────
// Server Client Factory (for server components/API routes)
// Uses service role key - bypasses Row Level Security
// ──────────────────────────────────────────────────────────────────────────────
export function createServerClient() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

// ──────────────────────────────────────────────────────────────────────────────
// Type Exports (to be generated from Supabase schema)
// Run: npx supabase gen types typescript --project-id nyoyqzybgsydxhwvfwfr > src/lib/database.types.ts
// ──────────────────────────────────────────────────────────────────────────────
export type { Database } from './database.types';
