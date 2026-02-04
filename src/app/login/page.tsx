'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { NodesAnimation } from '@/components/backgrounds/NodesAnimation';
import { GoogleButton, AuthDivider } from '@/components/auth/GoogleButton';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const authError = searchParams.get('error');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate auth
        await new Promise(resolve => setTimeout(resolve, 1500));

        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 relative">
                {/* Crosshair decorations */}
                <div className="absolute top-8 left-8 w-8 h-8">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-cobalt/40" />
                    <div className="absolute top-0 left-0 w-[1px] h-full bg-cobalt/40" />
                </div>
                <div className="absolute bottom-8 right-8 w-8 h-8 md:hidden">
                    <div className="absolute bottom-0 right-0 w-full h-[1px] bg-cobalt/40" />
                    <div className="absolute bottom-0 right-0 w-[1px] h-full bg-cobalt/40" />
                </div>

                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md min-w-[360px] px-4"
                >
                    {/* Header */}
                    <div className="mb-12">
                        <Link href="/" className="inline-flex items-center gap-2 text-ash hover:text-bone transition-colors mb-8 whitespace-nowrap">
                            <ArrowRight size={14} className="rotate-180" />
                            <span className="font-mono text-xs tracking-wider">BACK TO LAB</span>
                        </Link>

                        <h1 className="headline-md mb-4">WELCOME<br />BACK</h1>
                        <p className="text-technical text-ash">
                            Enter your credentials to access your dashboard.
                        </p>
                    </div>

                    {/* Auth Error */}
                    {authError && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs">
                            Authentication failed. Please try again.
                        </div>
                    )}

                    {/* Google OAuth Button */}
                    <GoogleButton mode="login" />

                    {/* Divider */}
                    <AuthDivider />

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="EMAIL"
                            type="email"
                            placeholder="operator@vectorweb.io"
                            icon={<Mail size={16} />}
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />

                        <div className="relative">
                            <Input
                                label="PASSWORD"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••••••"
                                icon={<Lock size={16} />}
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-10 text-ash hover:text-bone transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                                <input type="checkbox" className="w-4 h-4 bg-carbon border border-steel rounded-none accent-cobalt" />
                                <span className="text-technical text-ash">Remember me</span>
                            </label>

                            <Link href="#" className="text-technical text-cobalt hover:text-cobalt-glow transition-colors whitespace-nowrap">
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full whitespace-nowrap"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <motion.span
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                >
                                    AUTHENTICATING...
                                </motion.span>
                            ) : (
                                <>
                                    LOGIN
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Signup Link */}
                    <p className="mt-8 text-center text-technical text-ash">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="text-cobalt hover:text-cobalt-glow transition-colors">
                            Start a project
                        </Link>
                    </p>
                </motion.div>
            </div>

            {/* Right Side - Visualization */}
            <div className="hidden md:flex flex-1 relative bg-carbon border-l border-steel overflow-hidden">
                <NodesAnimation
                    nodeCount={40}
                    connectionDistance={120}
                    nodeColor="rgba(0, 71, 255, 0.9)"
                    lineColor="rgba(0, 71, 255, 0.2)"
                />

                {/* Overlay Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center"
                    >
                        <span className="text-label text-cobalt/60 block mb-4">SECURE CONNECTION</span>
                        <div className="font-mono text-[10px] text-ash/50 tracking-widest">
                            <p>PROTOCOL: AES-256-GCM</p>
                            <p>STATUS: ENCRYPTED</p>
                        </div>
                    </motion.div>
                </div>

                {/* Corner decorations */}
                <div className="absolute top-8 right-8 w-8 h-8">
                    <div className="absolute top-0 right-0 w-full h-[1px] bg-cobalt/40" />
                    <div className="absolute top-0 right-0 w-[1px] h-full bg-cobalt/40" />
                </div>
                <div className="absolute bottom-8 left-8 w-8 h-8">
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-cobalt/40" />
                    <div className="absolute bottom-0 left-0 w-[1px] h-full bg-cobalt/40" />
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-void">
                <div className="font-mono text-ash animate-pulse">LOADING...</div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
