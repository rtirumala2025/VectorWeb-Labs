/**
 * API Client for VectorWeb Labs Python Backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

export interface ProjectCreateData {
    business_name: string;
    vibe_style: string;
    user_id: string;
    domain_choice: string;
    client_phone?: string;
    website_type?: string;
    target_audience?: string;
    project_scope?: Record<string, unknown>;
}

export interface AIQuote {
    price: number;
    reasoning: string;
    features: string[];
    risks: string[];
    suggested_stack: string;
}

export interface ProjectResponse {
    project_id: string;
    status: string;
    ai_quote?: AIQuote;
}

export interface CreateDraftResponse {
    project_id: string;
}

export interface ProjectUpdateData {
    business_name?: string;
    vibe_style?: string;
    domain_choice?: string;
    wizard_step?: number;
    wizard_data?: Record<string, unknown>;
    project_scope?: Record<string, unknown>;
}

export interface Project {
    id: string;
    user_id?: string;
    business_name: string;
    vibe_style: string;
    domain_choice: string;
    status: string;
    created_at: string;
    client_phone?: string;
    website_type?: string;
    target_audience?: string;
    deposit_paid?: boolean;
    project_scope?: Record<string, unknown>;
    ai_price_quote?: AIQuote;
    wizard_step?: number;
    wizard_data?: Record<string, unknown>;
}

export interface DomainCheckResponse {
    available: boolean;
    domain: string;
    suggestions: string[];
    warning?: string;
}

interface ApiError {
    detail: string;
}

export interface DiscoveryResponse {
    question: string;
}

export interface DiscoveryResponseNext {
    question: string;
    options: string[];
    allow_multiple?: boolean;
    is_complete?: boolean;
}

// ══════════════════════════════════════════════════════════════════════════════
// API CLIENT
// ══════════════════════════════════════════════════════════════════════════════

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const config: RequestInit = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            credentials: 'include',
        };

        const response = await fetch(url, config);

        if (!response.ok) {
            const error: ApiError = await response.json().catch(() => ({
                detail: 'An unknown error occurred',
            }));
            throw new Error(error.detail);
        }

        return response.json();
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Health
    // ────────────────────────────────────────────────────────────────────────────

    async healthCheck(): Promise<{ message: string }> {
        return this.request('/');
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Domain
    // ────────────────────────────────────────────────────────────────────────────

    async checkDomain(domain: string, vibe: string): Promise<DomainCheckResponse> {
        return this.request('/api/check-domain', {
            method: 'POST',
            body: JSON.stringify({ domain, vibe }),
        });
    }

    async generateDiscoveryNext(
        businessName: string,
        industry: string,
        currentQIndex: number,
        previousAnswers: Array<{ q: string; a: string }>
    ): Promise<DiscoveryResponseNext> {
        return this.request('/api/discovery/next', {
            method: 'POST',
            body: JSON.stringify({
                business_name: businessName,
                industry,
                current_q_index: currentQIndex,
                previous_answers: previousAnswers
            }),
        });
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Projects
    // ────────────────────────────────────────────────────────────────────────────

    async createProject(data: ProjectCreateData): Promise<ProjectResponse> {
        return this.request('/api/projects', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async createDraft(): Promise<CreateDraftResponse> {
        return this.request('/api/projects/draft', {
            method: 'POST',
        });
    }

    async updateProject(projectId: string, data: ProjectUpdateData): Promise<Project> {
        return this.request(`/api/projects/${projectId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async getProject(projectId: string): Promise<Project> {
        return this.request(`/api/projects/${projectId}`);
    }

    async getProjects(userId: string): Promise<Project[]> {
        return this.request(`/api/projects?user_id=${userId}`);
    }

    async payProject(projectId: string): Promise<{ status: string }> {
        return this.request(`/api/projects/${projectId}/pay`, {
            method: 'POST',
        });
    }

    async generateProjectQuote(projectId: string): Promise<Project> {
        return this.request(`/api/projects/${projectId}/quote`, {
            method: 'POST',
        });
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Chat
    // ────────────────────────────────────────────────────────────────────────────

    async chat(message: string, projectId: string): Promise<{ response: string }> {
        return this.request('/api/chat', {
            method: 'POST',
            body: JSON.stringify({ message, project_id: projectId }),
        });
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
