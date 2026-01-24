'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    FileText, CheckCircle2, CreditCard, PenTool,
    ArrowRight, Eraser, Download, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { GridBackground } from '@/components/backgrounds/GridBackground';
import { useWizardStore } from '@/stores/wizardStore';
import Link from 'next/link';

// Typewriter effect component
function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            let index = 0;
            const interval = setInterval(() => {
                if (index < text.length) {
                    setDisplayedText(text.slice(0, index + 1));
                    index++;
                } else {
                    setIsComplete(true);
                    clearInterval(interval);
                }
            }, 30);

            return () => clearInterval(interval);
        }, delay);

        return () => clearTimeout(timeout);
    }, [text, delay]);

    return (
        <span>
            {displayedText}
            {!isComplete && <span className="animate-pulse text-cobalt">|</span>}
        </span>
    );
}

// Signature Canvas Component
function SignatureCanvas({ onSign }: { onSign: (signed: boolean) => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        setIsDrawing(true);

        const rect = canvas.getBoundingClientRect();
        const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.strokeStyle = '#0047FF';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();

        setHasSignature(true);
        onSign(true);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
        onSign(false);
    };

    return (
        <div className="relative">
            <canvas
                ref={canvasRef}
                width={400}
                height={150}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-[150px] bg-void border border-steel cursor-crosshair touch-none"
            />

            {/* Clear button */}
            {hasSignature && (
                <button
                    onClick={clearCanvas}
                    className="absolute top-2 right-2 p-2 text-ash hover:text-bone transition-colors"
                >
                    <Eraser size={16} />
                </button>
            )}

            {/* Signature line */}
            <div className="absolute bottom-8 left-8 right-8 h-[1px] bg-steel" />
            <span className="absolute bottom-2 left-8 text-[10px] font-mono text-ash">SIGNATURE</span>
        </div>
    );
}

export default function ProposalPage() {
    const router = useRouter();
    const { businessName, selectedVibe, domain } = useWizardStore();
    const [hasSigned, setHasSigned] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Mock proposal data
    const proposal = {
        projectName: businessName || 'Nexus Digital',
        style: selectedVibe || 'modern',
        domain: domain || 'nexusdigital',
        items: [
            { name: 'Custom Website Design', price: 600 },
            { name: 'Development (Next.js)', price: 500 },
            { name: 'Domain + Hosting (1yr)', price: 100 },
            { name: 'SEO Optimization', price: 200 },
            { name: 'AI Content Generation', price: 100 },
        ],
        discount: 200,
        date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
    };

    const subtotal = proposal.items.reduce((sum, item) => sum + item.price, 0);
    const total = subtotal - proposal.discount;
    const deposit = Math.round(total * 0.5);

    const aiAnalysis = `Based on the "${proposal.style}" aesthetic and scope for ${proposal.projectName}, 
I've calculated an optimal price point of $${total}. This includes premium custom design, 
full-stack development, and 1-year hosting. The 50% deposit of $${deposit} secures your slot 
and initiates the design phase. Given current demand, estimated delivery is 10-14 days.`;

    const handlePayment = async () => {
        setIsProcessing(true);
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        router.push('/dashboard');
    };

    return (
        <div className="relative min-h-screen py-12 px-6">
            <GridBackground className="opacity-20" />

            <div className="relative z-10 max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <Link
                        href="/wizard"
                        className="inline-flex items-center gap-2 text-ash hover:text-bone transition-colors mb-8"
                    >
                        <ArrowLeft size={14} />
                        <span className="font-mono text-xs tracking-wider">BACK TO WIZARD</span>
                    </Link>

                    <h1 className="headline-lg mb-4">YOUR<br />PROPOSAL</h1>
                    <p className="text-technical text-ash">
                        Review your project details and sign to proceed.
                    </p>
                </motion.div>

                {/* Receipt/Invoice Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="mb-8 bg-void border-steel" gridBg>
                        {/* Receipt Header */}
                        <div className="flex items-start justify-between mb-8 pb-6 border-b border-steel">
                            <div>
                                <h2 className="font-display font-bold text-2xl text-bone mb-2">
                                    {proposal.projectName}
                                </h2>
                                <p className="font-mono text-xs text-ash">
                                    PROJECT ID: VWL-{Date.now().toString().slice(-6)}
                                </p>
                            </div>

                            <div className="text-right">
                                <span className="text-label text-cobalt block mb-1">INVOICE</span>
                                <p className="font-mono text-xs text-ash">{proposal.date}</p>
                            </div>
                        </div>

                        {/* Project Details */}
                        <div className="grid grid-cols-2 gap-4 mb-8 pb-6 border-b border-steel">
                            <div>
                                <span className="text-label block mb-2">STYLE</span>
                                <p className="font-mono text-sm text-bone uppercase">{proposal.style}</p>
                            </div>
                            <div>
                                <span className="text-label block mb-2">DOMAIN</span>
                                <p className="font-mono text-sm text-bone">{proposal.domain}.com</p>
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="mb-8 pb-6 border-b border-steel">
                            <span className="text-label block mb-4">DELIVERABLES</span>
                            <div className="space-y-3">
                                {proposal.items.map((item, i) => (
                                    <motion.div
                                        key={item.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + i * 0.1 }}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 size={14} className="text-cobalt" />
                                            <span className="font-mono text-sm text-bone">{item.name}</span>
                                        </div>
                                        <span className="font-mono text-sm text-bone">${item.price}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="space-y-2 mb-8">
                            <div className="flex justify-between font-mono text-sm">
                                <span className="text-ash">Subtotal</span>
                                <span className="text-bone">${subtotal}</span>
                            </div>
                            <div className="flex justify-between font-mono text-sm">
                                <span className="text-green-400">Early Bird Discount</span>
                                <span className="text-green-400">-${proposal.discount}</span>
                            </div>
                            <div className="flex justify-between font-mono text-lg font-bold border-t border-steel pt-4 mt-4">
                                <span className="text-bone">TOTAL</span>
                                <span className="text-cobalt">${total}</span>
                            </div>
                        </div>

                        {/* AI Analysis */}
                        <div className="bg-carbon border border-steel p-6 mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText size={16} className="text-cobalt" />
                                <span className="text-label text-cobalt">AI ANALYSIS</span>
                            </div>
                            <p className="font-mono text-sm text-ash leading-relaxed">
                                <TypewriterText text={aiAnalysis} delay={1000} />
                            </p>
                        </div>

                        {/* Signature Section */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <PenTool size={16} className="text-ash" />
                                <span className="text-label">CLIENT SIGNATURE</span>
                            </div>
                            <SignatureCanvas onSign={setHasSigned} />
                        </div>

                        {/* Payment Section */}
                        <div className="bg-carbon border border-cobalt/30 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <span className="text-label block mb-1">DEPOSIT (50%)</span>
                                    <span className="font-display font-bold text-3xl text-cobalt">${deposit}</span>
                                </div>
                                <CreditCard size={32} className="text-ash" />
                            </div>

                            <Button
                                variant="primary"
                                size="lg"
                                className="w-full"
                                disabled={!hasSigned || isProcessing}
                                onClick={handlePayment}
                            >
                                {isProcessing ? (
                                    <motion.span
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    >
                                        PROCESSING PAYMENT...
                                    </motion.span>
                                ) : (
                                    <>
                                        PAY DEPOSIT
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </Button>

                            {!hasSigned && (
                                <p className="text-center text-technical text-ash mt-4">
                                    Please sign above to proceed with payment
                                </p>
                            )}

                            <p className="text-center text-[10px] font-mono text-ash mt-4">
                                Payments secured by Stripe. SSL encrypted.
                            </p>
                        </div>
                    </Card>
                </motion.div>

                {/* Download Option */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center"
                >
                    <button className="inline-flex items-center gap-2 text-ash hover:text-bone transition-colors font-mono text-sm">
                        <Download size={14} />
                        Download PDF
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
