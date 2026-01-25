/**
 * API Client for VectorWeb Labs Python Backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

    // ────────────────────────────────────────────────────────────────────────────
    // Projects
    // ────────────────────────────────────────────────────────────────────────────

    async createProject(data: ProjectCreateData): Promise<ProjectResponse> {
        return this.request('/api/projects', {
            method: 'POST',
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
