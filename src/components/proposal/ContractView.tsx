'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Check, Download, Shield, Terminal } from 'lucide-react';
import { Project } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { SignaturePad } from '@/components/ui/SignaturePad';

interface ContractViewProps {
    project: Project;
}

export function ContractView({ project }: ContractViewProps) {
    const [signed, setSigned] = useState(false);
    const [signature, setSignature] = useState<string | null>(null);

    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Extract data from project
    const businessName = project.business_name || 'Client';
    const email = project.user_id || 'email@example.com';
    const totalPrice = project.ai_price_quote?.price || 1200;
    const deposit = Math.round(totalPrice / 2);
    const features = project.ai_price_quote?.features || [];
    const suggestedStack = project.ai_price_quote?.suggested_stack || 'Next.js + Tailwind CSS + Supabase';

    const handleSign = (data: string) => {
        setSignature(data);
        setSigned(true);
    };

    return (
        <div className="bg-[#0a0a0a] text-gray-300 font-mono text-sm relative border border-white/10 shadow-2xl">
            {/* Header Strip */}
            <div className="bg-black/50 border-b border-white/10 p-4 flex justify-between items-center backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <Terminal size={18} className="text-blue-500/50" />
                    <div>
                        <h2 className="font-bold text-lg leading-none text-blue-500/50 tracking-wider">
                            VECTORWEB_SECURE_CONTRACT // V.2.0
                        </h2>
                        <span className="text-xs text-gray-600 uppercase tracking-widest">
                            HASH: {project.id.slice(0, 12).toUpperCase()}
                        </span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className={`px-3 py-1 border text-xs rounded uppercase tracking-wider ${signed
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                            : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500/80'
                        }`}>
                        STATUS: {signed ? 'EXECUTED' : 'AWAITING_SIGNATURE'}
                    </div>
                </div>
            </div>

            <div className="p-8 md:p-12 relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Shield size={300} />
                </div>

                {/* Agreement Body */}
                <div className="max-w-4xl mx-auto space-y-12">

                    {/* Parties */}
                    <section>
                        <p className="text-blue-500/50 mb-4 uppercase tracking-widest text-xs font-bold border-b border-white/5 pb-2">
                            01 // PARTIES
                        </p>
                        <p className="leading-relaxed mb-6">
                            This Service Agreement ("Agreement") is entered into on <span className="text-blue-400">{today}</span> by and between:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-6 border border-white/10 bg-white/5">
                                <span className="text-xs text-gray-500 block mb-2 uppercase tracking-wider">PROVIDER</span>
                                <strong className="text-xl block mb-2 text-white">VectorWeb Labs</strong>
                                <span className="text-gray-400 text-xs font-mono">
                                    Entity: Variable Vector LLC<br />
                                    Role: Development & AI Architecture
                                </span>
                            </div>
                            <div className="p-6 border border-blue-500/20 bg-blue-500/5">
                                <span className="text-xs text-blue-500/70 block mb-2 uppercase tracking-wider">CLIENT</span>
                                <strong className="text-xl block mb-2 text-blue-400">{businessName}</strong>
                                <span className="text-gray-400 text-xs font-mono">
                                    Contact ID: {email}<br />
                                    Project Ref: {project.id.slice(0, 8)}
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Scope */}
                    <section>
                        <p className="text-blue-500/50 mb-4 uppercase tracking-widest text-xs font-bold border-b border-white/5 pb-2">
                            02 // SCOPE_OF_WORK
                        </p>
                        <div className="space-y-6 text-sm leading-relaxed">
                            <p>
                                Provider agrees to perform services as described in the authenticated "VectorWeb Proposal"
                                attached hereto as Exhibit A.
                            </p>

                            <div className="pl-4 border-l-2 border-blue-500/30 space-y-4">
                                <div>
                                    <strong className="text-white block mb-1">A. TECHNOLOGY STACK</strong>
                                    <p className="text-blue-400">{suggestedStack}</p>
                                </div>
                                <div>
                                    <strong className="text-white block mb-1">B. DELIVERABLES</strong>
                                    <ul className="list-disc list-inside space-y-1 text-gray-400">
                                        <li>Full stack web application deployment</li>
                                        <li>Responsive mobile-first interface design</li>
                                        <li>Source code repository access</li>
                                        {features.map((f, i) => <li key={i}>{f}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Timeline & Terms */}
                    <section>
                        <p className="text-blue-500/50 mb-4 uppercase tracking-widest text-xs font-bold border-b border-white/5 pb-2">
                            03 // TERMS_OF_SERVICE
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed text-gray-400">
                            <div>
                                <strong className="text-white block mb-2">3.1 OWNERSHIP</strong>
                                <p>
                                    Upon full payment, Client shall own all rights, title, and interest in the final Deliverables.
                                    Provider retains the right to display the project in their portfolio and retains ownership
                                    of reusable background code and AI vectors.
                                </p>
                            </div>
                            <div>
                                <strong className="text-white block mb-2">3.2 CONFIDENTIALITY</strong>
                                <p>
                                    Both parties agree to treat all non-public information obtained during the project as
                                    strictly confidential. No proprietary "VectorWeb" AI algorithms are transferred this agreement.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Financials */}
                    <section>
                        <p className="text-blue-500/50 mb-4 uppercase tracking-widest text-xs font-bold border-b border-white/5 pb-2">
                            04 // FINANCIAL_PROTOCOL
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-4 border border-white/10 bg-[#111]">
                                <span className="block text-xs text-gray-500 mb-1">TOTAL PROJECT VALUE</span>
                                <span className="text-2xl font-bold text-white">${totalPrice}</span>
                            </div>
                            <div className="p-4 border border-blue-500/50 bg-blue-500/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/20 rounded-full blur-xl -mr-6 -mt-6"></div>
                                <span className="block text-xs text-blue-400 mb-1">INITIAL DEPOSIT (50%)</span>
                                <span className="text-2xl font-bold text-blue-400">${deposit}</span>
                                <span className="text-[10px] text-blue-500/70 block mt-1">DUE UPON EXECUTION</span>
                            </div>
                            <div className="p-4 border border-white/10 bg-[#111]">
                                <span className="block text-xs text-gray-500 mb-1">FINAL BALANCE</span>
                                <span className="text-2xl font-bold text-white">${totalPrice - deposit}</span>
                                <span className="text-[10px] text-gray-600 block mt-1">DUE UPON COMPLETION</span>
                            </div>
                        </div>
                    </section>

                    {/* Signature Area */}
                    <section className="pt-12 mt-12 border-t border-dashed border-white/10">
                        <p className="text-blue-500/50 mb-8 uppercase tracking-widest text-xs font-bold text-center">
                            05 // SYSTEM_EXECUTION
                        </p>

                        <AnimatePresence mode="wait">
                            {!signed ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="max-w-xl mx-auto"
                                >
                                    <p className="text-xs text-center text-gray-500 mb-6 font-mono">
                                        By inputting a digital signature, you acknowledge that you have read, understood,
                                        and agree to be bound by the terms above.
                                    </p>
                                    <SignaturePad onSign={handleSign} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="border border-blue-500/50 bg-blue-500/5 p-12 text-center max-w-xl mx-auto relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-[url('/img/grid.svg')] opacity-10"></div>
                                    <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                                        <Check size={40} className="text-blue-400" />
                                    </div>

                                    <h3 className="text-2xl font-bold text-blue-400 mb-2 tracking-tight">CONTRACT EXECUTED</h3>
                                    <p className="text-xs text-blue-300/70 font-mono mb-8 uppercase tracking-widest">
                                        Cryptographic Signature Verified • {new Date().toLocaleTimeString()}
                                    </p>

                                    {signature && (
                                        <div className="mb-8 p-4 bg-black/50 border border-blue-500/20 inline-block rounded">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={signature} alt="Client Signature" className="h-16 opacity-90 invert" />
                                        </div>
                                    )}

                                    <Button variant="outline" className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/60 font-mono">
                                        <Download size={14} className="mr-2" />
                                        DOWNLOAD_ENCRYPTED_COPY
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>

                </div>
            </div>

            {/* Footer Status Bar */}
            <div className="bg-black/80 border-t border-white/10 p-2 flex justify-between text-[10px] text-gray-600 uppercase tracking-widest">
                <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    SECURE_CONNECTION: ENCRYPTED
                </span>
                <span>VECTORWEB_LEGAL_OS_V2.0</span>
            </div>
        </div>
    );
}
