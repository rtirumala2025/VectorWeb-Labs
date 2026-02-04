'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, LogOut, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function Navbar() {
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {

        // Check current user immediately (more reliable than getSession)
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setIsLoading(false);
        };
        checkUser();

        // Listen for auth state changes (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setUser(null); // Force clear state immediately
        router.push('/');
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.25 }}
            className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300
        ${isScrolled
                    ? 'bg-void/80 backdrop-blur-md border-b border-white/10'
                    : 'bg-transparent'}
      `}
        >
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-cobalt rounded flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="font-display font-bold text-white text-sm">V</span>
                        </div>
                        <span className="font-mono font-bold text-bone tracking-tight text-sm md:text-base">
                            VECTORWEB LABS
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {isLoading ? (
                            <div className="w-24 h-8 bg-steel/30 animate-pulse rounded" />
                        ) : user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="font-mono text-sm text-ash hover:text-bone transition-colors tracking-wider flex items-center gap-2"
                                >
                                    <User size={14} />
                                    DASHBOARD
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="
                        px-5 py-2.5
                        bg-steel/20 text-ash hover:text-white
                        font-mono font-bold text-sm uppercase tracking-wider
                        hover:bg-steel/30
                        transition-all duration-200
                        flex items-center gap-2
                        border border-steel
                    "
                                >
                                    <LogOut size={14} />
                                    LOGOUT
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="font-mono text-sm text-ash hover:text-bone transition-colors tracking-wider"
                                >
                                    LOGIN
                                </Link>
                                <Link
                                    href="/signup"
                                    className="
                        px-5 py-2.5
                        bg-cobalt text-white
                        font-mono font-bold text-sm uppercase tracking-wider
                        hover:bg-cobalt-dim hover:scale-105
                        transition-all duration-200
                        whitespace-nowrap
                    "
                                >
                                    START PROJECT
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 text-ash hover:text-bone transition-colors"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4"
                    >
                        <div className="flex flex-col gap-4">
                            {isLoading ? (
                                <div className="w-full h-8 bg-steel/30 animate-pulse rounded" />
                            ) : user ? (
                                <>
                                    <Link
                                        href="/dashboard"
                                        className="font-mono text-sm text-ash hover:text-bone transition-colors tracking-wider flex items-center gap-2"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <User size={14} />
                                        DASHBOARD
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleSignOut();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="
                                            px-5 py-2.5 text-center
                                            bg-steel/20 text-ash
                                            font-mono font-bold text-sm uppercase tracking-wider
                                            hover:bg-steel/30
                                            transition-all duration-200
                                            flex items-center justify-center gap-2
                                            border border-steel
                                        "
                                    >
                                        <LogOut size={14} />
                                        LOGOUT
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="font-mono text-sm text-ash hover:text-bone transition-colors tracking-wider"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        LOGIN
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="
                                            px-5 py-2.5 text-center
                                            bg-cobalt text-white
                                            font-mono font-bold text-sm uppercase tracking-wider
                                            hover:bg-cobalt-dim
                                            transition-all duration-200
                                        "
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        START PROJECT
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.nav>
    );
}

export default Navbar;
