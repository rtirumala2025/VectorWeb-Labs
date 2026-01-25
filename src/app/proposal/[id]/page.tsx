'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import {
    FileText, CheckCircle2, CreditCard, PenTool,
    ArrowRight, Eraser, Download, ArrowLeft, Loader2, Sparkles,
    FileSignature, Receipt, LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { GridBackground } from '@/components/backgrounds/GridBackground';
import { apiClient, Project } from '@/lib/api';
import { ContractView, InvoiceView } from '@/components/proposal';
import Link from 'next/link';

type DocumentTab = 'summary' | 'contract' | 'invoice';

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

export default function DynamicProposalPage() {
    const router = useRouter();
    const params = useParams();
    const projectId = params.id as string;

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasSigned, setHasSigned] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState<DocumentTab>('summary');

    // Fetch project data
    useEffect(() => {
        async function fetchProject() {
            try {
                const data = await apiClient.getProject(projectId);
                setProject(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load project');
            } finally {
                setLoading(false);
            }
        }

        if (projectId) {
            fetchProject();
        }
    }, [projectId]);

    // Calculate pricing from AI quote or use defaults
    const aiQuote = project?.ai_price_quote;
    const totalPrice = aiQuote?.price || 1200;
    const basePrice = 500;
    const complexityPrice = totalPrice - basePrice;
    const deposit = Math.round(totalPrice * 0.5);

    const aiAnalysis = aiQuote?.reasoning ||
        `Based on your "${project?.vibe_style || 'modern'}" aesthetic and scope for ${project?.business_name || 'your project'}, 
I've calculated an optimal price point of $${totalPrice}. This includes premium custom design, 
full-stack development, and 1-year hosting. The 50% deposit of $${deposit} secures your slot 
and initiates the design phase. Given current demand, estimated delivery is 10-14 days.`;

    const features = aiQuote?.features || [
        'Custom Website Design',
        'Development (Next.js)',
        'Domain + Hosting (1yr)',
        'SEO Optimization',
        'Responsive Design'
    ];

    const handlePayment = async () => {
        setIsProcessing(true);
        try {
            await apiClient.payProject(projectId);
            router.push('/dashboard');
        } catch (err) {
            console.error('Payment processing failed:', err);
            setIsProcessing(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="relative min-h-screen flex items-center justify-center">
                <GridBackground className="opacity-20" />
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-cobalt mx-auto mb-4" />
                    <p className="font-mono text-ash">Loading proposal...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !project) {
        return (
            <div className="relative min-h-screen flex items-center justify-center">
                <GridBackground className="opacity-20" />
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error || 'Project not found'}</p>
                    <Button variant="outline" onClick={() => router.push('/wizard')}>
                        <ArrowLeft size={16} />
                        Back to Wizard
                    </Button>
                </div>
            </div>
        );
    }

    const formattedDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

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

                    <h1 className="headline-lg mb-4 text-6xl">YOUR<br />PROPOSAL</h1>
                    <p className="text-technical text-ash">
                        Review your project details and sign to proceed.
                    </p>
                </motion.div>

                {/* Document Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex gap-1 mb-8 bg-white/5 border border-white/10 rounded-full p-1 w-max"
                >
                    <button
                        onClick={() => setActiveTab('summary')}
                        className={`flex items-center gap-2 px-4 py-1.5 font-mono text-xs transition-all rounded-full
                            ${activeTab === 'summary'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-400 hover:text-white'}`}
                    >
                        <LayoutDashboard size={14} />
                        SUMMARY
                    </button>
                    <button
                        onClick={() => setActiveTab('contract')}
                        className={`flex items-center gap-2 px-4 py-1.5 font-mono text-xs transition-all rounded-full
                            ${activeTab === 'contract'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-400 hover:text-white'}`}
                    >
                        <FileSignature size={14} />
                        CONTRACT
                    </button>
                    <button
                        onClick={() => setActiveTab('invoice')}
                        className={`flex items-center gap-2 px-4 py-1.5 font-mono text-xs transition-all rounded-full
                            ${activeTab === 'invoice'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-400 hover:text-white'}`}
                    >
                        <Receipt size={14} />
                        INVOICE
                    </button>
                </motion.div>

                {/* Contract View */}
                {activeTab === 'contract' && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8"
                    >
                        <ContractView project={project} />
                    </motion.div>
                )}

                {/* Invoice View */}
                {activeTab === 'invoice' && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8"
                    >
                        <InvoiceView project={project} />
                    </motion.div>
                )}

                {/* Summary View (Original Receipt/Invoice Card) */}
                {activeTab === 'summary' && (
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
                                        {project.business_name}
                                    </h2>
                                    <p className="font-mono text-xs text-ash">
                                        PROJECT ID: {project.id.slice(0, 8).toUpperCase()}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <span className="text-label text-cobalt block mb-1">INVOICE</span>
                                    <p className="font-mono text-xs text-ash">{formattedDate}</p>
                                </div>
                            </div>

                            {/* Project Details */}
                            <div className="grid grid-cols-2 gap-4 mb-8 pb-6 border-b border-steel">
                                <div>
                                    <span className="text-label block mb-2">STYLE</span>
                                    <p className="font-mono text-sm text-bone uppercase">{project.vibe_style}</p>
                                </div>
                                <div>
                                    <span className="text-label block mb-2">DOMAIN</span>
                                    <p className="font-mono text-sm text-bone">{project.domain_choice}</p>
                                </div>
                            </div>

                            {/* Line Items - Features from AI */}
                            <div className="mb-8 pb-6 border-b border-steel">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles size={14} className="text-cobalt" />
                                    <span className="text-label">AI-RECOMMENDED DELIVERABLES</span>
                                </div>
                                <div className="space-y-3">
                                    {features.map((feature, i) => (
                                        <motion.div
                                            key={feature}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 + i * 0.1 }}
                                            className="flex items-center gap-3"
                                        >
                                            <CheckCircle2 size={14} className="text-cobalt" />
                                            <span className="font-mono text-sm text-bone">{feature}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="space-y-2 mb-8">
                                <div className="flex justify-between font-mono text-sm">
                                    <span className="text-ash">Web Design Base</span>
                                    <span className="text-bone">${basePrice}</span>
                                </div>
                                <div className="flex justify-between font-mono text-sm">
                                    <span className="text-ash">AI Complexity Features</span>
                                    <span className="text-bone">${complexityPrice}</span>
                                </div>
                                <div className="flex justify-between font-mono text-lg font-bold border-t border-steel pt-4 mt-4">
                                    <span className="text-bone">TOTAL</span>
                                    <span className="text-cobalt">${totalPrice}</span>
                                </div>
                            </div>

                            {/* AI Analysis */}
                            <div className="bg-carbon border border-steel p-6 mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <FileText size={16} className="text-cobalt" />
                                    <span className="text-label text-cobalt">SCOUT AI ANALYSIS</span>
                                </div>
                                <p className="font-mono text-sm text-ash leading-relaxed">
                                    <TypewriterText text={aiAnalysis} delay={500} />
                                </p>

                                {/* Show risks if any */}
                                {aiQuote?.risks && aiQuote.risks.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-steel">
                                        <span className="text-label text-amber-400 block mb-2">CONSIDERATIONS</span>
                                        <ul className="space-y-1">
                                            {aiQuote.risks.map((risk, i) => (
                                                <li key={i} className="font-mono text-xs text-amber-400">
                                                    • {risk}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Show suggested stack */}
                                {aiQuote?.suggested_stack && (
                                    <div className="mt-4 pt-4 border-t border-steel">
                                        <span className="text-label text-ash block mb-1">SUGGESTED STACK</span>
                                        <p className="font-mono text-xs text-bone">{aiQuote.suggested_stack}</p>
                                    </div>
                                )}
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
                )}

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
