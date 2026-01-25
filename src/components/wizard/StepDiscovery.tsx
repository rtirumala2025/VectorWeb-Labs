'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Terminal, MessageSquare } from 'lucide-react';
import { useWizardStore } from '@/stores/wizardStore';
import { Button } from '@/components/ui/Button';

export function StepDiscovery() {
    const {
        businessName,
        discoveryQuestion,
        discoveryAnswer,
        setDiscoveryAnswer,
        generateDiscoveryQuestion,
        isGeneratingDiscovery
    } = useWizardStore();

    // Trigger AI generation on mount
    useEffect(() => {
        generateDiscoveryQuestion();
    }, [generateDiscoveryQuestion]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
            <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-label text-cobalt block mb-8"
            >
                STEP 02 — SCOPING
            </motion.span>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl bg-carbon/50 border border-steel p-8 backdrop-blur-sm relative overflow-hidden"
            >
                {/* AI Processing State */}
                <AnimatePresence mode="wait">
                    {isGeneratingDiscovery ? (
                        <motion.div
                            key="thinking"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-12"
                        >
                            <Sparkles className="text-cobalt w-12 h-12 mb-6 animate-pulse" />
                            <h3 className="font-display text-xl text-bone mb-2">SCOUT AI IS ANALYZING...</h3>
                            <p className="font-mono text-sm text-ash text-center max-w-sm">
                                Studying {businessName} to ask the right technical questions.
                            </p>

                            {/* Scanning effect */}
                            <motion.div
                                className="absolute top-0 left-0 w-full h-1 bg-cobalt/50 shadow-[0_0_20px_#0047FF]"
                                animate={{ top: ['0%', '100%', '0%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="question"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="flex items-start gap-4 mb-8">
                                <div className="p-3 bg-cobalt/10 rounded-lg border border-cobalt/20">
                                    <Terminal className="text-cobalt w-6 h-6" />
                                </div>
                                <div>
                                    <span className="font-mono text-xs text-cobalt mb-2 block">VECTORWEB SCOUT SAYS:</span>
                                    <h3 className="font-display text-2xl text-bone leading-tight">
                                        {discoveryQuestion || "What are the primary goals for your new website?"}
                                    </h3>
                                </div>
                            </div>

                            <div className="relative">
                                <textarea
                                    value={discoveryAnswer}
                                    onChange={(e) => setDiscoveryAnswer(e.target.value)}
                                    placeholder="Type your answer here..."
                                    className="w-full h-32 bg-void border border-steel p-4 text-bone font-mono text-sm focus:border-cobalt outline-none resize-none transition-colors"
                                    autoFocus
                                />
                                <div className="absolute bottom-4 right-4 text-xs text-ash font-mono">
                                    {discoveryAnswer.length} chars
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Context/Help */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-technical text-ash mt-8 text-center max-w-lg"
            >
                Start typing to continue. Your answer helps us determine the correct tech stack and pricing.
            </motion.p>
        </div>
    );
}
