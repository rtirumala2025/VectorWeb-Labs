'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

// ══════════════════════════════════════════════════════════════════════════════
// GOOGLE OAUTH BUTTON - CYBER-INDUSTRIAL STYLE
// ══════════════════════════════════════════════════════════════════════════════

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface GoogleButtonProps {
    className?: string;
    mode?: 'login' | 'signup';
}

export function GoogleButton({ className = '', mode = 'login' }: GoogleButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });

            if (error) {
                console.error('OAuth error:', error.message);
                setIsLoading(false);
            }
            // If no error, we'll be redirected
        } catch (err) {
            console.error('OAuth error:', err);
            setIsLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className={`
                group relative w-full flex items-center justify-center gap-3
                px-6 py-4
                bg-[#1a1a1a] border border-gray-700
                font-mono text-sm tracking-wider uppercase
                text-gray-300 hover:text-white
                transition-all duration-300
                hover:border-gray-500
                hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]
                disabled:opacity-50 disabled:cursor-not-allowed
                ${className}
            `}
        >
            {/* Monochrome Google "G" icon */}
            <svg
                className="w-5 h-5 transition-transform group-hover:scale-110"
                viewBox="0 0 24 24"
                fill="currentColor"
            >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>

            {/* Button text */}
            <span className="relative">
                {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                        <span className="animate-pulse">CONNECTING</span>
                        <span className="animate-bounce">...</span>
                    </span>
                ) : (
                    `${mode === 'signup' ? 'SIGN UP' : 'CONTINUE'} WITH GOOGLE`
                )}
            </span>

            {/* Corner brackets - cyber aesthetic */}
            <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
    );
}

/**
 * Divider component for separating OAuth from email/password form
 */
export function AuthDivider() {
    return (
        <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-gray-700" />
            <span className="flex-shrink mx-4 text-gray-500 font-mono text-xs tracking-widest">
                — OR —
            </span>
            <div className="flex-grow border-t border-gray-700" />
        </div>
    );
}
