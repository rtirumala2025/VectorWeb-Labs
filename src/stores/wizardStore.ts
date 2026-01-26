import { create } from 'zustand';
import { apiClient, AIQuote } from '@/lib/api';

export type VibeType = 'modern' | 'classic' | 'bold' | null;

interface WizardState {
    // Current step (1-3)
    currentStep: number;

    // Step 1: Business Identity
    businessName: string;

    // Step 2: Vibe Selection
    selectedVibe: VibeType;

    // Step 3: Domain
    domain: string;
    domainStatus: 'idle' | 'checking' | 'available' | 'taken';
    domainSuggestions: string[];

    // Save state
    saveStatus: 'idle' | 'saving' | 'success' | 'error';
    saveError: string | null;
    projectId: string | null;
    aiQuote: AIQuote | null;

    // Discovery Step (Adaptive Gauntlet)
    discoveryHistory: Array<{ q: string; a: string }>;
    currentDiscoveryStep: number; // 0-9
    currentQuestion: { text: string; options: string[]; allow_multiple?: boolean } | null;
    isGeneratingDiscovery: boolean;
    isDiscoveryComplete: boolean;
    currentSelections: string[];

    // Actions
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;

    setBusinessName: (name: string) => void;
    setVibe: (vibe: VibeType) => void;
    setDomain: (domain: string) => void;
    setDomainStatus: (status: 'idle' | 'checking' | 'available' | 'taken') => void;

    // Real domain check via API
    checkDomain: (domain: string) => Promise<void>;

    // Save project to backend
    saveProject: (userId: string) => Promise<string | null>;

    // Reset wizard
    reset: () => void;

    // Check if can proceed
    canProceed: () => boolean;

    // Discovery Actions
    startDiscovery: () => Promise<void>;
    submitDiscoveryAnswer: (answer?: string) => Promise<void>;
    completeDiscovery: () => void;
    toggleSelection: (option: string) => void;
    prevDiscoveryStep: () => void;

    // Server-First Actions
    init: (projectId: string) => Promise<void>;
    saveStep: () => Promise<void>;
    generateQuote: () => Promise<void>;
}

const initialState = {
    currentStep: 1,
    businessName: '',
    selectedVibe: null as VibeType,
    domain: '',
    domainStatus: 'idle' as const,
    domainSuggestions: [] as string[],
    saveStatus: 'idle' as const,
    saveError: null as string | null,
    projectId: null as string | null,
    aiQuote: null as AIQuote | null,

    // and...
    discoveryHistory: [],
    currentDiscoveryStep: 0,
    currentQuestion: null,
    isGeneratingDiscovery: false,
    isDiscoveryComplete: false,
    currentSelections: [],
};

export const useWizardStore = create<WizardState>((set, get) => ({
    ...initialState,

    // ... (existing actions)

    setStep: (step) => set({ currentStep: step }),

    nextStep: () => {
        const { currentStep, canProceed } = get();
        if (canProceed() && currentStep < 4) {
            set({ currentStep: currentStep + 1 });
        }
    },

    prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
            set({ currentStep: currentStep - 1 });
        }
    },

    setBusinessName: (name) => set({ businessName: name }),

    setVibe: (vibe) => set({ selectedVibe: vibe }),

    setDomain: (domain) => set({ domain, domainStatus: 'idle', domainSuggestions: [] }),

    setDomainStatus: (status) => set({ domainStatus: status }),

    checkDomain: async (domain) => {
        const { selectedVibe } = get();
        set({ domainStatus: 'checking', domainSuggestions: [] });
        try {
            const result = await apiClient.checkDomain(domain, selectedVibe || 'modern');
            if (result.available) {
                set({ domainStatus: 'available', domainSuggestions: [] });
            } else {
                set({ domainStatus: 'taken', domainSuggestions: result.suggestions || [] });
            }
        } catch (error) {
            console.error('Domain check failed:', error);
            set({ domainStatus: 'available' }); // Fallback
        }
    },

    saveProject: async (userId: string) => {
        const { businessName, selectedVibe, domain, discoveryHistory } = get();

        if (!selectedVibe) {
            set({ saveStatus: 'error', saveError: 'Please select a vibe style' });
            return null;
        }

        set({ saveStatus: 'saving', saveError: null });

        try {
            const response = await apiClient.createProject({
                business_name: businessName,
                vibe_style: selectedVibe,
                user_id: userId,
                domain_choice: domain.includes('.') ? domain : domain + '.com',
                project_scope: { discovery: discoveryHistory }
            });

            set({
                saveStatus: 'success',
                projectId: response.project_id,
                aiQuote: response.ai_quote || null
            });
            return response.project_id;
        } catch (error) {
            set({ saveStatus: 'error', saveError: (error as Error).message });
            return null;
        }
    },

    reset: () => set(initialState),

    canProceed: () => {
        const { currentStep, businessName, isDiscoveryComplete, selectedVibe, domainStatus } = get();

        switch (currentStep) {
            case 1: // Identity
                return businessName.trim().length >= 2;
            case 2: // Discovery
                return isDiscoveryComplete;
            case 3: // Vibe
                return selectedVibe !== null;
            case 4: // Domain
                return domainStatus === 'available';
            default:
                return false;
        }
    },

    startDiscovery: async () => {
        const { businessName, currentDiscoveryStep, currentQuestion, isGeneratingDiscovery } = get();
        if (currentQuestion || isGeneratingDiscovery || currentDiscoveryStep > 0) return;

        set({ isGeneratingDiscovery: true });
        try {
            const response = await apiClient.generateDiscoveryNext(businessName, 'modern web', 0, []);

            if (response.is_complete) {
                set({
                    currentQuestion: null,
                    isGeneratingDiscovery: false,
                    currentSelections: [],
                    isDiscoveryComplete: true
                });
                return;
            }

            set({
                currentQuestion: {
                    text: response.question,
                    options: response.options,
                    allow_multiple: response.allow_multiple
                },
                isGeneratingDiscovery: false,
                currentSelections: []
            });
        } catch (error) {
            console.error(error);
            set({ isGeneratingDiscovery: false });
        }
    },

    toggleSelection: (option: string) => {
        const { currentSelections } = get();
        const exists = currentSelections.includes(option);
        if (exists) {
            set({ currentSelections: currentSelections.filter(s => s !== option) });
        } else {
            set({ currentSelections: [...currentSelections, option] });
        }
    },

    prevDiscoveryStep: async () => {
        const { currentDiscoveryStep, discoveryHistory, businessName } = get();
        if (currentDiscoveryStep <= 0) return;

        // Go back one step
        const newStep = currentDiscoveryStep - 1;
        // Remove the last answer from history to return to previous state
        const newHistory = discoveryHistory.slice(0, newStep);

        set({
            currentDiscoveryStep: newStep,
            discoveryHistory: newHistory,
            currentQuestion: null,
            isGeneratingDiscovery: true,
            currentSelections: [],
            isDiscoveryComplete: false
        });

        try {
            // Re-fetch the question for this previous step
            const response = await apiClient.generateDiscoveryNext(businessName, 'modern web', newStep, newHistory);
            set({
                currentQuestion: {
                    text: response.question,
                    options: response.options,
                    allow_multiple: response.allow_multiple
                },
                isGeneratingDiscovery: false
            });
        } catch (error) {
            console.error('Failed to fetch previous question:', error);
            set({ isGeneratingDiscovery: false });
        }
    },

    submitDiscoveryAnswer: async (answer?: string) => {
        const { currentQuestion, currentDiscoveryStep, discoveryHistory, businessName, currentSelections } = get();
        if (!currentQuestion) return;

        // Determine final answer (single arg or multi-select state)
        let finalAnswer = answer;
        if (!finalAnswer) {
            // If no arg, treat as multi-select submission
            if (currentSelections.length === 0) return; // Prevent empty submission
            finalAnswer = currentSelections.join(', ');
        }

        // 1. Update history
        const newHistory = [...discoveryHistory, { q: currentQuestion.text, a: finalAnswer }];
        const nextStep = currentDiscoveryStep + 1;

        // 2. Check completion (Limit to 10 steps)
        if (nextStep >= 10) {
            set({
                discoveryHistory: newHistory,
                currentDiscoveryStep: nextStep,
                currentQuestion: null,
                isDiscoveryComplete: true,
                currentSelections: []
            });
            return;
        }

        // 3. Generate Next Question
        set({
            discoveryHistory: newHistory,
            currentDiscoveryStep: nextStep,
            currentQuestion: null,
            isGeneratingDiscovery: true,
            currentSelections: []
        });

        try {
            const response = await apiClient.generateDiscoveryNext(businessName, 'modern web', nextStep, newHistory);

            // Check for backend completion signal
            if (response.is_complete) {
                set({
                    discoveryHistory: newHistory,
                    currentDiscoveryStep: nextStep,
                    currentQuestion: null,
                    isDiscoveryComplete: true,
                    currentSelections: []
                });
                return;
            }

            set({
                currentQuestion: {
                    text: response.question,
                    options: response.options,
                    allow_multiple: response.allow_multiple
                },
                isGeneratingDiscovery: false
            });
        } catch (error) {
            console.error('Failed to get next question:', error);
            set({ isGeneratingDiscovery: false, isDiscoveryComplete: true });
        }
    },

    completeDiscovery: () => set({ isDiscoveryComplete: true }),

    // Server-First Implementation
    init: async (projectId: string) => {
        set({ projectId, saveStatus: 'saving' });
        try {
            const project = await apiClient.getProject(projectId);

            // Hydrate Store
            set({
                currentStep: project.wizard_step || 1,
                businessName: project.business_name,
                selectedVibe: (project.vibe_style as VibeType) || null,
                domain: project.domain_choice,
                saveStatus: 'success',

                // Hydrate Discovery History if exists
                discoveryHistory: (project.wizard_data as any)?.discoveryHistory || [],
                currentDiscoveryStep: (project.wizard_data as any)?.currentDiscoveryStep || 0,
                // If discovery is done based on history length or explicit flag (not stored yet, maybe check history length)
                isDiscoveryComplete: ((project.wizard_data as any)?.discoveryHistory?.length || 0) >= 10
            });
        } catch (error) {
            console.error('Failed to init project:', error);
            set({ saveStatus: 'error', saveError: 'Failed to load project' });
        }
    },

    saveStep: async () => {
        const { projectId, businessName, selectedVibe, domain, currentStep, discoveryHistory, currentDiscoveryStep } = get();
        if (!projectId) return;

        set({ saveStatus: 'saving' });
        try {
            await apiClient.updateProject(projectId, {
                business_name: businessName,
                vibe_style: selectedVibe || undefined,
                domain_choice: domain,
                wizard_step: currentStep,
                wizard_data: {
                    discoveryHistory,
                    currentDiscoveryStep
                }
            });
            set({ saveStatus: 'success' });
        } catch (error) {
            console.error('Failed to save step:', error);
            set({ saveStatus: 'error', saveError: 'Failed to save progress' });
        }
    },

    generateQuote: async () => {
        const { projectId } = get();
        if (!projectId) return;
        set({ saveStatus: 'saving' });
        try {
            await apiClient.generateProjectQuote(projectId);
            set({ saveStatus: 'success' });
        } catch (error) {
            console.error('Failed to generate quote:', error);
            set({ saveStatus: 'error', saveError: 'Failed to generate quote' });
        }
    },
}));

// Pre-filled mock data for demo
export const mockWizardData = {
    businessName: 'Nexus Digital',
    selectedVibe: 'modern' as VibeType,
    domain: 'nexusdigital',
};

export default useWizardStore;
