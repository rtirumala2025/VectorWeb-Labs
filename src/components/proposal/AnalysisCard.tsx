'use client';

import { motion } from 'framer-motion';
import { Terminal, AlertTriangle, ShieldCheck } from 'lucide-react';

interface AnalysisCardProps {
    businessName: string;
    reasoning: string;
    risks?: string[];
}

export function AnalysisCard({ businessName, reasoning, risks = [] }: AnalysisCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-900/10 border border-blue-500/30 p-6 mb-8 rounded-lg relative overflow-hidden"
        >
            {/* Background scanner line effect */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-scan" />

            {/* Header */}
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-blue-500/20">
                <Terminal size={18} className="text-blue-400" />
                <h3 className="font-mono text-sm font-bold text-blue-400 tracking-wider">
                    AI TACTICAL ANALYSIS // {businessName.toUpperCase()}
                </h3>
            </div>

            {/* Reasoning Section */}
            <div className="mb-6">
                <span className="text-xs font-mono text-blue-500/70 block mb-2 uppercase tracking-widest">STRATEGY PROFILE</span>
                <p className="font-mono text-sm text-blue-100/80 leading-relaxed border-l-2 border-blue-500/30 pl-4">
                    {reasoning || "Analysis pending..."}
                </p>
            </div>

            {/* Risks Section - Conditional */}
            {risks && risks.length > 0 ? (
                <div className="bg-red-900/20 border border-red-500/30 rounded p-4">
                    <div className="flex items-center gap-2 mb-3 text-red-400">
                        <AlertTriangle size={16} />
                        <span className="font-mono text-xs font-bold tracking-wider">DETECTED RISKS:</span>
                    </div>
                    <ul className="space-y-2">
                        {risks.map((risk, idx) => (
                            <li key={idx} className="flex items-start gap-2 font-mono text-xs text-red-200/80">
                                <span className="text-red-500 mt-1">›</span>
                                {risk}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="flex items-center gap-2 text-green-400/80 font-mono text-xs p-2 bg-green-900/10 border border-green-500/20 rounded">
                    <ShieldCheck size={14} />
                    <span>NO CRITICAL RISKS DETECTED</span>
                </div>
            )}
        </motion.div>
    );
}
