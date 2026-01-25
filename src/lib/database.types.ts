// ══════════════════════════════════════════════════════════════════════════════
// DATABASE TYPES (Auto-generated from Supabase schema)
// ══════════════════════════════════════════════════════════════════════════════
// To regenerate, run:
// npx supabase gen types typescript --project-id nyoyqzybgsydxhwvfwfr > src/lib/database.types.ts
// ══════════════════════════════════════════════════════════════════════════════

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    full_name: string | null;
                    created_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    full_name?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    full_name?: string | null;
                    created_at?: string;
                };
                Relationships: [];
            };
            projects: {
                Row: {
                    id: string;
                    user_id: string;
                    business_name: string;
                    vibe_style: 'modern' | 'classic' | 'bold';
                    domain_choice: string;
                    ai_price_quote: number | null;
                    status: 'draft' | 'paid' | 'building';
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    business_name: string;
                    vibe_style: 'modern' | 'classic' | 'bold';
                    domain_choice: string;
                    ai_price_quote?: number | null;
                    status?: 'draft' | 'paid' | 'building';
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    business_name?: string;
                    vibe_style?: 'modern' | 'classic' | 'bold';
                    domain_choice?: string;
                    ai_price_quote?: number | null;
                    status?: 'draft' | 'paid' | 'building';
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'projects_user_id_fkey';
                        columns: ['user_id'];
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    }
                ];
            };
            contracts: {
                Row: {
                    id: string;
                    project_id: string;
                    signature_url: string | null;
                    signed_at: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    project_id: string;
                    signature_url?: string | null;
                    signed_at?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    project_id?: string;
                    signature_url?: string | null;
                    signed_at?: string | null;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'contracts_project_id_fkey';
                        columns: ['project_id'];
                        referencedRelation: 'projects';
                        referencedColumns: ['id'];
                    }
                ];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
    };
}
