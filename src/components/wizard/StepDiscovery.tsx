'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Cpu, ChevronRight, ChevronLeft } from 'lucide-react';
import { useWizardStore } from '@/stores/wizardStore';

// Matrix Text Effect Component
const MatrixText = ({ text }: { text: string }) => {
    return <span className="font-mono text-cobalt animate-pulse">{text}</span>;
}

export function StepDiscovery() {
    const {
        businessName,
        currentDiscoveryStep,
        currentQuestion,
        currentSelections,
        isGeneratingDiscovery,
        isDiscoveryComplete, // Subscribe to completion
        startDiscovery,
        submitDiscoveryAnswer,
        toggleSelection,
        prevDiscoveryStep,
        nextStep // Subscribe to nextStep
    } = useWizardStore();

    // Trigger AI generation start on mount
    useEffect(() => {
        startDiscovery();
    }, [startDiscovery]);

    // Format step number (01/10)
    const stepNumber = String(currentDiscoveryStep + 1).padStart(2, '0');

    const handleOptionClick = (option: string) => {
        if (currentQuestion?.allow_multiple) {
            toggleSelection(option);
        } else {
            submitDiscoveryAnswer(option);
        }
    };

    // Render Completion State
    if (isDiscoveryComplete) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 w-full max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-lg bg-carbon/60 border border-green-500/30 p-12 text-center rounded-lg relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50" />

                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/50">
                        <Terminal size={40} className="text-green-500" />
                    </div>

                    <h2 className="text-3xl font-display text-green-400 mb-4">DISCOVERY COMPLETE</h2>
                    <p className="text-ash font-mono text-sm mb-8">
                        Protocol finished. 10/10 vectors analyzed.<br />
                        System is ready for visual style selection.
                    </p>

                    <button
                        onClick={nextStep}
                        className="w-full bg-green-600 hover:bg-green-500 text-black font-mono font-bold py-4 rounded transition-all flex items-center justify-center gap-2"
                    >
                        <span>PROCEED_TO_VIBE_CHECK</span>
                        <ChevronRight size={18} />
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 w-full max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full flex justify-between items-center mb-12 border-b border-steel/30 pb-4"
            >
                <div className="flex items-center gap-6">
                    {/* Back Button */}
                    <button
                        onClick={prevDiscoveryStep}
                        disabled={currentDiscoveryStep === 0 || isGeneratingDiscovery}
                        className={`p-2 rounded-full border border-steel transition-colors 
                            ${currentDiscoveryStep === 0 || isGeneratingDiscovery
                                ? 'opacity-30 cursor-not-allowed text-ash'
                                : 'hover:border-cobalt hover:text-white text-ash'}`}
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <div className="flex items-center gap-3">
                        <Terminal size={18} className="text-cobalt" />
                        <span className="text-xs font-mono text-ash tracking-widest">
                            DISCOVERY_PROTOCOL_V2.0
                        </span>
                    </div>
                </div>
                <span className="font-display text-cobalt text-xl">
                    STEP {stepNumber}<span className="text-ash text-sm">/10</span>
                </span>
            </motion.div>

            {/* Main Content Area */}
            <div className="w-full relative min-h-[400px]">
                <AnimatePresence mode="wait">
                    {isGeneratingDiscovery || !currentQuestion ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute inset-0 flex flex-col items-center justify-center text-center"
                        >
                            <div className="w-16 h-16 border border-cobalt/30 border-t-cobalt rounded-full animate-spin mb-6" />
                            <h3 className="font-display text-2xl text-bone mb-2 tracking-wide">
                                ANALYZING VECTORS
                            </h3>
                            <p className="font-mono text-xs text-cobalt">
                                <MatrixText text={`PROCESSING DATA FOR ${businessName.toUpperCase()}...`} />
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="question"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full"
                        >
                            {/* Question */}
                            <h2 className="text-3xl md:text-4xl font-display text-bone leading-tight mb-4 text-center">
                                {currentQuestion.text}
                            </h2>
                            {currentQuestion.allow_multiple && (
                                <p className="text-center text-ash font-mono text-xs mb-8">
                                    [MULTI-SELECT ENABLED: CHOOSE ALL THAT APPLY]
                                </p>
                            )}
                            {!currentQuestion.allow_multiple && <div className="mb-12" />}

                            {/* Options Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentQuestion.options.map((option, idx) => {
                                    const isSelected = currentSelections.includes(option);
                                    return (
                                        <motion.button
                                            key={idx}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleOptionClick(option)}
                                            className={`group relative flex items-center justify-between p-6 border transition-all text-left
                                                ${isSelected
                                                    ? 'bg-cobalt/20 border-cobalt'
                                                    : 'bg-carbon/40 border-steel hover:bg-carbon/60 hover:border-cobalt/50'
                                                }`}
                                        >
                                            <span className={`font-mono text-sm transition-colors relative z-10 w-[90%] 
                                                ${isSelected ? 'text-white' : 'text-ash group-hover:text-bone'}`}>
                                                {option}
                                            </span>

                                            {/* Checkbox / Arrow Visual */}
                                            {currentQuestion.allow_multiple ? (
                                                <div className={`w-5 h-5 border flex items-center justify-center transition-colors
                                                    ${isSelected ? 'bg-cobalt border-cobalt' : 'border-steel group-hover:border-cobalt'}`}>
                                                    {isSelected && <ChevronRight size={14} className="text-white" />}
                                                </div>
                                            ) : (
                                                <ChevronRight className="text-steel group-hover:text-cobalt group-hover:translate-x-1 transition-all" size={20} />
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Continue Button for Multi-Select */}
                            {currentQuestion.allow_multiple && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-8 text-center"
                                >
                                    <button
                                        onClick={() => submitDiscoveryAnswer()}
                                        disabled={currentSelections.length === 0}
                                        className="bg-cobalt text-white font-mono text-sm px-8 py-3 hover:bg-cobalt/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        CONFIRM_SELECTION &gt;&gt;
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Context Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 flex items-center gap-2 text-xs font-mono text-ash/50"
            >
                <Cpu size={14} />
                <span>NEURAL ENGINE ACTIVE • ADAPTIVE MODE</span>
            </motion.div>
        </div>
    );
}
