'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { NodesAnimation } from '@/components/backgrounds/NodesAnimation';

export default function SignupPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate account creation
        await new Promise(resolve => setTimeout(resolve, 1500));

        router.push('/wizard');
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Visualization */}
            <div className="hidden md:flex flex-1 relative bg-carbon border-r border-steel overflow-hidden">
                <NodesAnimation
                    nodeCount={50}
                    connectionDistance={130}
                    nodeColor="rgba(0, 71, 255, 0.9)"
                    lineColor="rgba(0, 71, 255, 0.2)"
                />

                {/* Overlay Content */}
                <div className="absolute inset-0 flex items-center justify-center px-12">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center"
                    >
                        <h2 className="headline-md mb-6">
                            BUILD<br />
                            <span className="text-cobalt">SOMETHING</span><br />
                            GREAT
                        </h2>
                        <p className="text-technical text-ash max-w-xs mx-auto">
                            Join the next generation of web development.
                            AI-powered, student-led, results-driven.
                        </p>
                    </motion.div>
                </div>

                {/* Corner decorations */}
                <div className="absolute top-8 left-8 w-8 h-8">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-cobalt/40" />
                    <div className="absolute top-0 left-0 w-[1px] h-full bg-cobalt/40" />
                </div>
                <div className="absolute bottom-8 right-8 w-8 h-8">
                    <div className="absolute bottom-0 right-0 w-full h-[1px] bg-cobalt/40" />
                    <div className="absolute bottom-0 right-0 w-[1px] h-full bg-cobalt/40" />
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 relative">
                {/* Crosshair decorations */}
                <div className="absolute top-8 right-8 w-8 h-8">
                    <div className="absolute top-0 right-0 w-full h-[1px] bg-cobalt/40" />
                    <div className="absolute top-0 right-0 w-[1px] h-full bg-cobalt/40" />
                </div>
                <div className="absolute bottom-8 left-8 w-8 h-8 md:hidden">
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-cobalt/40" />
                    <div className="absolute bottom-0 left-0 w-[1px] h-full bg-cobalt/40" />
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md min-w-[360px] px-4"
                >
                    {/* Header */}
                    <div className="mb-12">
                        <Link href="/" className="inline-flex items-center gap-2 text-ash hover:text-bone transition-colors mb-8">
                            <ArrowRight size={14} className="rotate-180" />
                            <span className="font-mono text-xs tracking-wider">BACK TO LAB</span>
                        </Link>

                        <h1 className="headline-md mb-4">START YOUR<br />PROJECT</h1>
                        <p className="text-technical text-ash">
                            Create an account to begin the creation wizard.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="FULL NAME"
                            type="text"
                            placeholder="John Doe"
                            icon={<User size={16} />}
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />

                        <Input
                            label="EMAIL"
                            type="email"
                            placeholder="john@company.com"
                            icon={<Mail size={16} />}
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />

                        <div className="relative">
                            <Input
                                label="PASSWORD"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Min. 8 characters"
                                icon={<Lock size={16} />}
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-[38px] text-ash hover:text-bone transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        <div className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                id="terms"
                                className="mt-1 w-4 h-4 bg-carbon border border-steel rounded-none accent-cobalt"
                                required
                            />
                            <label htmlFor="terms" className="text-technical text-ash">
                                I agree to the{' '}
                                <Link href="#" className="text-cobalt hover:text-cobalt-glow transition-colors">
                                    Terms of Service
                                </Link>
                                {' '}and{' '}
                                <Link href="#" className="text-cobalt hover:text-cobalt-glow transition-colors">
                                    Privacy Policy
                                </Link>
                            </label>
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
                                    CREATING ACCOUNT...
                                </motion.span>
                            ) : (
                                <>
                                    CREATE ACCOUNT
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Login Link */}
                    <p className="mt-8 text-center text-technical text-ash">
                        Already have an account?{' '}
                        <Link href="/login" className="text-cobalt hover:text-cobalt-glow transition-colors">
                            Log in
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
