import { create } from 'zustand';

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

    // Actions
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;

    setBusinessName: (name: string) => void;
    setVibe: (vibe: VibeType) => void;
    setDomain: (domain: string) => void;
    setDomainStatus: (status: 'idle' | 'checking' | 'available' | 'taken') => void;

    // Mock domain check
    checkDomain: (domain: string) => Promise<void>;

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

    setDomain: (domain) => set({ domain, domainStatus: 'idle' }),

    setDomainStatus: (status) => set({ domainStatus: status }),

    checkDomain: async (domain) => {
        set({ domainStatus: 'checking' });

        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

        // Mock: certain patterns are "taken"
        const taken = ['google', 'facebook', 'amazon', 'apple', 'microsoft'].some(
            (name) => domain.toLowerCase().includes(name)
        );

        set({ domainStatus: taken ? 'taken' : 'available' });
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
