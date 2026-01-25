'use server';

import { createServerClient, requireAuth } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// ══════════════════════════════════════════════════════════════════════════════
// CREATE PROJECT SERVER ACTION
// ══════════════════════════════════════════════════════════════════════════════

export type VibeStyle = 'modern' | 'classic' | 'bold';

export interface CreateProjectInput {
    businessName: string;
    vibeStyle: VibeStyle;
    domainChoice: string;
    aiPriceQuote?: number;
}

export interface CreateProjectResult {
    success: boolean;
    projectId?: string;
    error?: string;
}

/**
 * Server Action to create a new project from wizard data.
 * Inserts into the projects table with status = 'draft'.
 */
export async function createProject(input: CreateProjectInput): Promise<CreateProjectResult> {
    try {
        // Require authentication
        const user = await requireAuth();

        // Validate input
        if (!input.businessName?.trim()) {
            return { success: false, error: 'Business name is required' };
        }

        if (!['modern', 'classic', 'bold'].includes(input.vibeStyle)) {
            return { success: false, error: 'Invalid vibe style' };
        }

        if (!input.domainChoice?.trim()) {
            return { success: false, error: 'Domain choice is required' };
        }

        // Create Supabase client
        const supabase = await createServerClient();

        // Insert project
        const { data, error } = await supabase
            .from('projects')
            .insert({
                user_id: user.id,
                business_name: input.businessName.trim(),
                vibe_style: input.vibeStyle,
                domain_choice: input.domainChoice.trim().toLowerCase(),
                ai_price_quote: input.aiPriceQuote ?? null,
                status: 'draft',
            })
            .select('id')
            .single();

        if (error) {
            console.error('Error creating project:', error);
            return { success: false, error: 'Failed to create project' };
        }

        // Revalidate dashboard to show new project
        revalidatePath('/dashboard');

        return {
            success: true,
            projectId: data.id,
        };
    } catch (error) {
        console.error('Error in createProject:', error);

        if (error instanceof Error && error.message === 'Authentication required') {
            return { success: false, error: 'Please sign in to create a project' };
        }

        return { success: false, error: 'An unexpected error occurred' };
    }
}

/**
 * Server Action to get all projects for the current user.
 */
export async function getUserProjects() {
    try {
        const user = await requireAuth();
        const supabase = await createServerClient();

        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching projects:', error);
            return { success: false, error: 'Failed to fetch projects', projects: [] };
        }

        return { success: true, projects: data };
    } catch (error) {
        console.error('Error in getUserProjects:', error);
        return { success: false, error: 'Authentication required', projects: [] };
    }
}
