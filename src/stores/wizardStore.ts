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
};

export const useWizardStore = create<WizardState>((set, get) => ({
    ...initialState,

    setStep: (step) => set({ currentStep: step }),

    nextStep: () => {
        const { currentStep, canProceed } = get();
        if (canProceed() && currentStep < 3) {
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
            // Call real API
            const result = await apiClient.checkDomain(domain, selectedVibe || 'modern');

            if (result.available) {
                set({ domainStatus: 'available', domainSuggestions: [] });
            } else {
                set({
                    domainStatus: 'taken',
                    domainSuggestions: result.suggestions || []
                });
            }
        } catch (error) {
            console.error('Domain check failed:', error);
            // Fallback to mock on error
            const taken = ['google', 'facebook', 'amazon', 'apple', 'microsoft'].some(
                (name) => domain.toLowerCase().includes(name)
            );
            set({ domainStatus: taken ? 'taken' : 'available' });
        }
    },

    saveProject: async (userId: string) => {
        const { businessName, selectedVibe, domain } = get();

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
            });

            set({
                saveStatus: 'success',
                projectId: response.project_id,
                aiQuote: response.ai_quote || null
            });

            return response.project_id;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to save project';
            set({ saveStatus: 'error', saveError: message });
            return null;
        }
    },

    reset: () => set(initialState),

    canProceed: () => {
        const { currentStep, businessName, selectedVibe, domainStatus } = get();

        switch (currentStep) {
            case 1:
                return businessName.trim().length >= 2;
            case 2:
                return selectedVibe !== null;
            case 3:
                return domainStatus === 'available';
            default:
                return false;
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
