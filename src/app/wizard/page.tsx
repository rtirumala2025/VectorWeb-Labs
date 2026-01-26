'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Sparkles, Crown, Zap, Check, Terminal, Loader2, X, AlertCircle } from 'lucide-react';
import { useWizardStore, mockWizardData, VibeType } from '@/stores/wizardStore';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { GridBackground } from '@/components/backgrounds/GridBackground';
import { StepDiscovery } from '@/components/wizard/StepDiscovery';

// Vibe card data
const vibes = [
    {
        id: 'modern' as VibeType,
        icon: Sparkles,
        title: 'MODERN',
        description: 'Clean lines, minimalist aesthetics, cutting-edge tech feel.',
        gradient: 'from-blue-600 to-cyan-400',
        animation: { y: [0, -10, 0], transition: { duration: 2, repeat: Infinity } },
    },
    {
        id: 'classic' as VibeType,
        icon: Crown,
        title: 'CLASSIC',
        description: 'Timeless elegance, refined typography, sophisticated feel.',
        gradient: 'from-amber-500 to-yellow-300',
        animation: { rotate: [0, 5, -5, 0], transition: { duration: 3, repeat: Infinity } },
    },
    {
        id: 'bold' as VibeType,
        icon: Zap,
        title: 'BOLD',
        description: 'High contrast, aggressive typography, unapologetic presence.',
        gradient: 'from-red-600 to-orange-400',
        animation: { scale: [1, 1.1, 1], transition: { duration: 1.5, repeat: Infinity } },
    },
];

// Step 1: Business Name
function Step1() {
    const { businessName, setBusinessName } = useWizardStore();

    // Calculate font size based on name length
    const getFontSize = () => {
        const len = businessName.length;
        if (len < 5) return 'text-7xl md:text-9xl';
        if (len < 10) return 'text-5xl md:text-7xl';
        if (len < 15) return 'text-4xl md:text-6xl';
        return 'text-3xl md:text-5xl';
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-6">
            <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-label text-cobalt block mb-8"
            >
                STEP 01 - IDENTITY
            </motion.span>

            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="headline-md text-center mb-12"
            >
                WHAT&apos;S YOUR<br />BUSINESS NAME?
            </motion.h2>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-3xl text-center"
            >
                <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Type here..."
                    className={`
            w-full text-center bg-transparent border-none outline-none
            font-display font-bold uppercase tracking-tight
            text-bone placeholder:text-steel
            transition-all duration-300
            ${getFontSize()}
          `}
                    autoFocus
                />

                {/* Underline */}
                <motion.div
                    className="mt-6 h-[2px] bg-cobalt mx-auto"
                    initial={{ width: 0 }}
                    animate={{ width: businessName.length > 0 ? '100%' : '50%' }}
                    transition={{ duration: 0.3 }}
                />
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-technical text-ash mt-8 text-center"
            >
                This will be used for your domain and branding
            </motion.p>
        </div>
    );
}

// Step 2: Vibe Selection
function Step2() {
    const { selectedVibe, setVibe } = useWizardStore();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
            <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-label text-cobalt block mb-8"
            >
                STEP 03 — AESTHETIC
            </motion.span>

            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="headline-md text-center mb-16"
            >
                PICK YOUR<br />VIBE
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                {vibes.map((vibe, index) => {
                    const Icon = vibe.icon;
                    const isSelected = selectedVibe === vibe.id;

                    return (
                        <motion.button
                            key={vibe.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            onClick={() => setVibe(vibe.id)}
                            whileHover={{ scale: 1.05, y: -10 }}
                            whileTap={{ scale: 0.98 }}
                            className={`
                relative p-8 border transition-all duration-300
                ${isSelected
                                    ? 'border-cobalt bg-cobalt/10 shadow-[0_0_40px_rgba(0,71,255,0.2)]'
                                    : 'border-steel bg-carbon hover:border-ash'}
              `}
                        >
                            {/* Selected indicator */}
                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-4 right-4 w-6 h-6 rounded-full bg-cobalt flex items-center justify-center"
                                >
                                    <Check size={14} className="text-white" />
                                </motion.div>
                            )}

                            {/* Icon with animation */}
                            <motion.div
                                animate={isSelected ? vibe.animation : undefined}
                                className={`
                  w-16 h-16 rounded-lg mx-auto mb-6
                  bg-gradient-to-br ${vibe.gradient}
                  flex items-center justify-center
                `}
                            >
                                <Icon size={32} className="text-white" />
                            </motion.div>

                            <h3 className="font-display font-bold text-2xl text-bone mb-3">
                                {vibe.title}
                            </h3>

                            <p className="text-technical text-ash">
                                {vibe.description}
                            </p>

                            {/* Crosshairs on hover/select */}
                            {isSelected && (
                                <>
                                    <div className="absolute top-0 left-0 w-4 h-4">
                                        <div className="absolute top-0 left-0 w-full h-[1px] bg-cobalt" />
                                        <div className="absolute top-0 left-0 w-[1px] h-full bg-cobalt" />
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-4 h-4">
                                        <div className="absolute bottom-0 right-0 w-full h-[1px] bg-cobalt" />
                                        <div className="absolute bottom-0 right-0 w-[1px] h-full bg-cobalt" />
                                    </div>
                                </>
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}

// Step 3: Domain Check
function Step3() {
    const { domain, setDomain, domainStatus, checkDomain, domainSuggestions } = useWizardStore();

    const handleCheck = () => {
        if (domain.trim().length >= 3) {
            checkDomain(domain);
        }
    };

    const handleSelectSuggestion = (suggestion: string) => {
        // Extract domain name without TLD for input
        const parts = suggestion.split('.');
        const name = parts[0];
        setDomain(suggestion); // Keep full domain with TLD
        // Mark as available since AI suggested it
        useWizardStore.setState({ domainStatus: 'available' });
    };

    const getStatusIcon = () => {
        switch (domainStatus) {
            case 'checking':
                return <Loader2 size={16} className="animate-spin text-cobalt" />;
            case 'available':
                return <Check size={16} className="text-green-400" />;
            case 'taken':
                return <X size={16} className="text-red-400" />;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-6">
            <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-label text-cobalt block mb-8"
            >
                STEP 04 — DOMAIN
            </motion.span>

            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="headline-md text-center mb-12"
            >
                CLAIM YOUR<br />TERRITORY
            </motion.h2>

            {/* Terminal-style input */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-2xl"
            >
                <div className="bg-void border border-steel p-6">
                    {/* Terminal header */}
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-steel">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="font-mono text-xs text-ash ml-4">domain_check.sh</span>
                    </div>

                    {/* Input line */}
                    <div className="flex items-center gap-2 font-mono">
                        <Terminal size={16} className="text-cobalt" />
                        <span className="text-cobalt">$</span>
                        <span className="text-ash">check</span>
                        <input
                            type="text"
                            value={domain.includes('.') ? domain.split('.')[0] : domain}
                            onChange={(e) => setDomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            onKeyPress={(e) => e.key === 'Enter' && handleCheck()}
                            placeholder="yourdomain"
                            className="flex-1 bg-transparent border-none outline-none text-bone font-mono"
                            autoFocus
                        />
                        <span className="text-ash">.com</span>

                        <Button
                            onClick={handleCheck}
                            variant="outline"
                            size="sm"
                            disabled={domain.length < 3 || domainStatus === 'checking'}
                        >
                            CHECK
                        </Button>
                    </div>

                    {/* Status output */}
                    <AnimatePresence mode="wait">
                        {domainStatus !== 'idle' && (
                            <motion.div
                                key={domainStatus}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-4 pt-4 border-t border-steel font-mono text-sm"
                            >
                                <div className="flex items-center gap-2">
                                    {getStatusIcon()}
                                    {domainStatus === 'checking' && (
                                        <span className="text-ash">
                                            Checking availability for {domain}.com...
                                        </span>
                                    )}
                                    {domainStatus === 'available' && (
                                        <span className="text-green-400">
                                            ✓ {domain.includes('.') ? domain : `${domain}.com`} is available!
                                        </span>
                                    )}
                                    {domainStatus === 'taken' && (
                                        <span className="text-red-400">
                                            ✗ {domain}.com is already taken.
                                        </span>
                                    )}
                                </div>

                                {/* AI Suggestions */}
                                {domainStatus === 'taken' && domainSuggestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-4 pt-4 border-t border-steel"
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <Sparkles size={14} className="text-cobalt" />
                                            <span className="text-cobalt text-xs font-bold">SCOUT AI SUGGESTS</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {domainSuggestions.map((suggestion, i) => (
                                                <motion.button
                                                    key={suggestion}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    onClick={() => handleSelectSuggestion(suggestion)}
                                                    className="px-3 py-2 border border-cobalt/50 hover:border-cobalt 
                                                        hover:bg-cobalt/10 text-bone text-sm transition-all"
                                                >
                                                    {suggestion}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Helper text */}
                <p className="text-technical text-ash mt-4 text-center">
                    We&apos;ll register and configure this domain for you
                </p>
            </motion.div>
        </div>
    );
}


// Main Wizard Component
export default function WizardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlProjectId = searchParams.get('id');

    const {
        currentStep,
        setStep,
        nextStep,
        prevStep,
        canProceed,
        setBusinessName,
        setVibe,
        setDomain,
        projectId,
        saveStatus,
        saveStep,
        init,
        generateQuote
    } = useWizardStore();

    // Hydrate from Server
    useEffect(() => {
        if (urlProjectId && urlProjectId !== projectId) {
            init(urlProjectId);
        }
    }, [urlProjectId, init, projectId]);

    // Keep URL in sync (optional, mainly for initial creation)
    useEffect(() => {
        if (projectId && !urlProjectId) {
            router.replace(`/wizard?id=${projectId}`);
        }
    }, [projectId, urlProjectId, router]);

    const handleNext = async () => {
        // 1. Create Draft if Step 1 and no project
        if (currentStep === 1 && !projectId) {
            // Check if user is logged in first to avoid 401 console errors
            const { supabase } = await import('@/lib/supabase');
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                try {
                    const response = await apiClient.createDraft();
                    useWizardStore.setState({ projectId: response.project_id });
                } catch (error) {
                    console.error('Failed to create draft:', error);
                }
            } else {
                console.log('Guest user: continuing without server draft');
            }
        }

        // 2. Save current progress (only if we have a project)
        if (projectId) {
            await saveStep();
        }

        // 3. Navigate or Finalize
        if (currentStep === 4 && canProceed()) {
            // Import supabase client to get user
            const { supabase } = await import('@/lib/supabase');
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Finalize Project:
                // If we are in Guest Mode (no projectId), we must create it now
                if (!projectId) {
                    const newProjectId = await useWizardStore.getState().saveProject(user.id);
                    if (!newProjectId) {
                        alert('Failed to save project. Please try again.');
                        return;
                    }
                }

                // Generate Quote
                await generateQuote();

                router.push(`/proposal/${useWizardStore.getState().projectId}`);
            } else {
                router.push('/login');
            }
        } else {
            nextStep();
        }
    };

    const steps = [
        { component: Step1 },
        { component: StepDiscovery },
        { component: Step2 },
        { component: Step3 },
    ];

    const CurrentStepComponent = steps[currentStep - 1].component;

    return (
        <div className="relative min-h-screen bg-void overflow-hidden">
            <GridBackground className="opacity-30" />

            {/* Progress Bar */}
            <div className="fixed top-0 left-0 right-0 z-50">
                <div className="h-1 bg-steel">
                    <motion.div
                        className="h-full bg-cobalt"
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStep / 4) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* Step Indicators */}
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4">
                {[1, 2, 3, 4].map((step) => (
                    <button
                        key={step}
                        onClick={() => setStep(step)}
                        className={`
              w-8 h-8 rounded-full border-2 flex items-center justify-center
              font-mono text-xs font-bold transition-all duration-300
              ${currentStep === step
                                ? 'border-cobalt bg-cobalt text-white'
                                : currentStep > step
                                    ? 'border-cobalt bg-transparent text-cobalt'
                                    : 'border-steel text-ash'}
            `}
                    >
                        {currentStep > step ? <Check size={14} /> : step}
                    </button>
                ))}
            </div>

            {/* Exit Button */}
            <button
                onClick={() => router.push('/')}
                className="fixed top-6 right-6 z-50 p-2 text-ash hover:text-bone transition-colors"
            >
                <X size={24} />
            </button>

            {/* Step Content with Slide Transition */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{
                        type: 'tween',
                        ease: [0.16, 1, 0.3, 1],
                        duration: 0.5,
                    }}
                    className="relative z-10"
                >
                    <CurrentStepComponent />
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="fixed bottom-8 left-0 right-0 z-50 px-8">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="opacity-0 data-[visible=true]:opacity-100 transition-opacity"
                        data-visible={currentStep > 1}
                    >
                        <ArrowLeft size={16} />
                        BACK
                    </Button>

                    <Button
                        variant="primary"
                        onClick={handleNext}
                        disabled={!canProceed() || saveStatus === 'saving'}
                    >
                        {saveStatus === 'saving' ? (
                            <>
                                <Sparkles size={16} className="animate-pulse" />
                                SCOUT AI ANALYZING...
                            </>
                        ) : currentStep === 4 ? (
                            <>
                                GENERATE PROPOSAL
                                <ArrowRight size={16} />
                            </>
                        ) : (
                            <>
                                CONTINUE
                                <ArrowRight size={16} />
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Cannot Proceed Warning */}
            <AnimatePresence>
                {!canProceed() && currentStep === 4 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50
              flex items-center gap-2 px-4 py-2 bg-carbon border border-steel"
                    >
                        <AlertCircle size={14} className="text-cobalt" />
                        <span className="text-technical text-ash">
                            Check domain availability to continue
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
