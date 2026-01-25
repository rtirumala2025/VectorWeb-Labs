'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Sparkles } from 'lucide-react';

export function VectorBot() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("System Online. How can I help?");

    // Context-aware logic
    useEffect(() => {
        if (pathname?.includes('/wizard/domain')) {
            setMessage("Tip: Short .com domains rank 20% higher on Google. I can help you brainstorm alternates!");
        } else if (pathname?.includes('/proposal')) {
            setMessage("I generated this pricing based on your feature request. Want me to break down the math?");
        } else {
            setMessage("System Online. Ready to assist with your web project.");
        }
    }, [pathname]);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="mb-4 w-72 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-blue-600/20 p-3 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles size={14} className="text-blue-400" />
                                <span className="text-xs font-mono font-bold text-blue-100 uppercase tracking-wider">VectorBot v1.0</span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/50 hover:text-white transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <p className="text-sm text-gray-300 leading-relaxed font-mono">
                                {message}
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="px-4 pb-4 pt-0">
                            <div className="flex gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse mt-1" />
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest">AI_CORE_ACTIVE</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group relative"
            >
                {/* Pulsing Glow */}
                <span className="absolute inset-0 rounded-full bg-blue-500 blur-lg opacity-40 group-hover:opacity-70 group-hover:blur-xl transition-all duration-300 animate-pulse" />

                {/* Orb */}
                <div className={`relative w-14 h-14 rounded-full flex items-center justify-center border border-white/20 shadow-lg ring-1 ring-white/10 transition-all duration-300 ${isOpen ? 'bg-black' : 'bg-blue-600'
                    }`}>
                    {isOpen ? (
                        <X size={24} className="text-white" />
                    ) : (
                        <MessageSquare size={24} className="text-white" />
                    )}
                </div>
            </button>
        </div>
    );
}
