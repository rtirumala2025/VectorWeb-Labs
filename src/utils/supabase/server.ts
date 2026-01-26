import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';

// ══════════════════════════════════════════════════════════════════════════════
// SUPABASE SERVER CLIENT (Cookie-based auth for SSR)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Creates a Supabase client for Server Components, Server Actions, and Route Handlers.
 * Uses cookie-based authentication via @supabase/ssr.
 */
export async function createServerClient() {
    const cookieStore = await cookies();

    return createSupabaseServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, {
                                ...options,
                                // Force options for localhost/debugging if needed
                                // domain: '', 
                                // sameSite: 'lax',
                            })
                        );
                    } catch {
                        // The `setAll` method is called from a Server Component
                        // when cookies can't be modified. This is expected in
                        // read-only contexts like Server Components.
                    }
                },
            },
        }
    );
}

/**
 * Get the currently authenticated user from the session.
 * Returns null if not authenticated.
 */
export async function getUser() {
    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return null;
    }

    return user;
}

/**
 * Require authentication - throws redirect if not authenticated.
 * Use this in Server Components/Actions that require auth.
 */
export async function requireAuth() {
    const user = await getUser();

    if (!user) {
        throw new Error('Authentication required');
    }

    return user;
}
