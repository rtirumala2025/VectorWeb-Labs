'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

/**
 * Client-side callback handler for OAuth.
 * This handles the hash fragment (#access_token) from implicit flow.
 */

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const handleAuthCallback = async () => {
            // Check if there's a hash fragment with tokens (implicit flow)
            const hash = window.location.hash;

            if (hash) {
                // Parse the hash fragment
                const params = new URLSearchParams(hash.substring(1));
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');

                if (accessToken) {
                    // Set the session manually
                    const { error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken || '',
                    });

                    if (!error) {
                        router.push('/wizard');
                        return;
                    }
                }
            }

            // Check for code in query params (PKCE flow)
            const searchParams = new URLSearchParams(window.location.search);
            const code = searchParams.get('code');

            if (code) {
                // The route.ts handler should have processed this
                // If we're still here, something went wrong
                // Try to exchange the code client-side as fallback
                const { error } = await supabase.auth.exchangeCodeForSession(code);

                if (!error) {
                    router.push('/wizard');
                    return;
                }
            }

            // If we get here, auth failed
            router.push('/login?error=auth');
        };

        handleAuthCallback();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-void">
            <div className="text-center">
                <div className="font-mono text-cobalt text-lg animate-pulse mb-4">
                    AUTHENTICATING...
                </div>
                <div className="font-mono text-ash text-xs">
                    Establishing secure connection
                </div>
            </div>
        </div>
    );
}
