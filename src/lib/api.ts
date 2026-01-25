/**
 * API Client for VectorWeb Labs Python Backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ProjectCreateData {
    business_name: string;
    vibe_style: string;
    user_id: string;
    domain_choice: string;
}

interface ProjectResponse {
    project_id: string;
    status: string;
}

interface ApiError {
    detail: string;
}

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

    async healthCheck(): Promise<{ message: string }> {
        return this.request('/');
    }

    async createProject(data: ProjectCreateData): Promise<ProjectResponse> {
        return this.request('/api/projects', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getProjects(userId: string): Promise<Project[]> {
        return this.request(`/api/projects?user_id=${userId}`);
    }

    async chat(message: string, projectId: string): Promise<{ response: string }> {
        return this.request('/api/chat', {
            method: 'POST',
            body: JSON.stringify({ message, project_id: projectId }),
        });
    }

    async payProject(projectId: string): Promise<{ status: string }> {
        return this.request(`/api/projects/${projectId}/pay`, {
            method: 'POST',
        });
    }
}

export interface Project {
    id: string;
    business_name: string;
    vibe_style: string;
    domain_choice: string;
    status: string;
    created_at: string;
}

export const apiClient = new ApiClient(API_BASE_URL);

export type { ProjectCreateData, ProjectResponse };
