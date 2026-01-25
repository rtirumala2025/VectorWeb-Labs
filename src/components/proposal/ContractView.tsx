'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Check, Download, Shield } from 'lucide-react';
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
        <div className="bg-void text-bone font-mono text-sm relative overflow-hidden border border-steel">
            {/* Header Strip */}
            <div className="bg-carbon border-b border-steel p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cobalt/20 rounded border border-cobalt">
                        <FileText size={16} className="text-cobalt" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg leading-none">CONTRACT_AGREEMENT_V1.0</h2>
                        <span className="text-xs text-ash">ID: {project.id.slice(0, 8)}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="px-2 py-1 bg-green-500/10 border border-green-500/30 text-green-400 text-xs rounded">
                        STATUS: {signed ? 'SIGNED' : 'PENDING'}
                    </div>
                </div>
            </div>

            <div className="p-8 md:p-12 relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
                    <Shield size={200} />
                </div>

                {/* Agreement Body */}
                <div className="max-w-3xl mx-auto space-y-8">

                    {/* Parties */}
                    <section className="border-l-2 border-cobalt pl-4">
                        <p className="text-ash mb-2 uppercase tracking-widest text-xs">01 // PARTIES</p>
                        <p className="leading-relaxed">
                            This agreement is executed on <span className="text-cobalt">{today}</span> between:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                            <div className="bg-carbon/30 p-4 border border-steel">
                                <span className="text-xs text-ash block mb-1">PROVIDER</span>
                                <strong className="text-lg block mb-1">VectorWeb Labs</strong>
                                <span className="text-ash text-xs">Services: Web Development & AI Integration</span>
                            </div>
                            <div className="bg-carbon/30 p-4 border border-steel">
                                <span className="text-xs text-ash block mb-1">CLIENT</span>
                                <strong className="text-lg block mb-1">{businessName}</strong>
                                <span className="text-ash text-xs">Contact: {email}</span>
                            </div>
                        </div>
                    </section>

                    {/* Scope */}
                    <section className="border-l-2 border-steel pl-4">
                        <p className="text-ash mb-2 uppercase tracking-widest text-xs">02 // SCOPE_OF_WORK</p>
                        <div className="bg-void border border-steel p-6 font-mono text-xs">
                            <p className="mb-4 text-ash">The Provider agrees to deliver the following:</p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2">
                                    <span className="text-cobalt">Foundations:</span>
                                    <span>{suggestedStack}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-cobalt">Features:</span>
                                    <span>{features.join(', ')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-cobalt">Deliverables:</span>
                                    <span>Deployed application, source code access, basic SEO configuration.</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Terms */}
                    <section className="border-l-2 border-steel pl-4">
                        <p className="text-ash mb-2 uppercase tracking-widest text-xs">03 // FINANCIAL_TERMS</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 border border-steel bg-carbon/30">
                                <span className="block text-xs text-ash mb-1">TOTAL VALUE</span>
                                <span className="text-xl font-bold text-bone">${totalPrice}</span>
                            </div>
                            <div className="p-4 border border-cobalt bg-cobalt/10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-8 h-8 bg-cobalt -mr-4 -mt-4 transform rotate-45" />
                                <span className="block text-xs text-cobalt mb-1">DEPOSIT (50%)</span>
                                <span className="text-xl font-bold text-cobalt">${deposit}</span>
                            </div>
                            <div className="p-4 border border-steel bg-carbon/30">
                                <span className="block text-xs text-ash mb-1">BALANCE</span>
                                <span className="text-xl font-bold text-bone">${totalPrice - deposit}</span>
                            </div>
                        </div>
                    </section>

                    {/* Signature Area */}
                    <section className="pt-8 border-t border-dashed border-steel mt-12">
                        <p className="text-ash mb-6 uppercase tracking-widest text-xs text-center">04 // EXECUTION</p>

                        <AnimatePresence mode="wait">
                            {!signed ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="max-w-md mx-auto"
                                >
                                    <p className="text-xs text-center text-ash mb-4">
                                        By signing below, you accept all terms and conditions specified in this digital agreement.
                                    </p>
                                    <SignaturePad onSign={handleSign} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="border border-green-500/30 bg-green-500/5 p-8 text-center max-w-md mx-auto relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50" />

                                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
                                        <Check size={32} className="text-green-500" />
                                    </div>

                                    <h3 className="text-xl font-bold text-green-400 mb-2">CONTRACT EXECUTED</h3>
                                    <p className="text-xs text-green-500/70 font-mono mb-6">
                                        Digital Signature Verified • {new Date().toLocaleTimeString()}
                                    </p>

                                    {signature && (
                                        <div className="mb-6 p-4 bg-void/50 border border-green-500/20 inline-block">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={signature} alt="Client Signature" className="h-12 opacity-80" />
                                        </div>
                                    )}

                                    <Button variant="outline" className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10">
                                        <Download size={14} className="mr-2" />
                                        DOWNLOAD_SIGNED_COPY
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>

                </div>
            </div>

            {/* Footer Status Bar */}
            <div className="bg-carbon border-t border-steel p-2 flex justify-between text-[10px] text-ash uppercase tracking-wider">
                <span>SECURE_CONNECTION: ENCRYPTED</span>
                <span>VECTORWEB_LEGAL_OS_V2</span>
            </div>
        </div>
    );
}
