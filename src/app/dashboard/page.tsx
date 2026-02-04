'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Plus, Clock, CheckCircle, ArrowRight, FileText } from 'lucide-react';
import { Link } from 'lucide-react';

export default function DashboardPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push('/login');
                return;
            }

            const res = await fetch('http://localhost:8000/api/projects', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-cobalt border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen pt-24 px-4 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-3xl font-display font-bold text-bone mb-2">MISSION CONTROL</h1>
                    <p className="text-ash font-mono text-sm">Manage your active web deployments</p>
                </div>
                <button
                    onClick={() => router.push('/wizard')}
                    className="flex items-center gap-2 px-6 py-3 bg-cobalt hover:bg-cobalt-light text-white font-mono font-bold rounded transition-all hover:scale-105"
                >
                    <Plus size={18} />
                    NEW_PROJECT
                </button>
            </div>

            {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-dashed border-steel">
                    <div className="w-16 h-16 bg-carbon rounded-full flex items-center justify-center mb-6">
                        <FileText size={32} className="text-ash" />
                    </div>
                    <h2 className="text-xl font-bold text-bone mb-2">No Projects Found</h2>
                    <p className="text-ash mb-8">Start your first digital rapid deployment.</p>
                    <button
                        onClick={() => router.push('/wizard')}
                        className="px-6 py-3 bg-cobalt text-white font-mono rounded hover:bg-cobalt/80 transition"
                    >
                        INITIATE_PROJECT
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="group relative bg-carbon border border-steel hover:border-cobalt transition-all duration-300 overflow-hidden flex flex-col"
                        >
                            {/* Status Bar */}
                            <div className={`h-1 w-full ${project.status === 'draft' ? 'bg-ash' :
                                ['signed', 'building', 'active'].includes(project.status) ? 'bg-green-500' :
                                    'bg-cobalt'
                                }`} />

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-display text-xl font-bold text-bone truncate pr-4">
                                        {project.business_name || 'Untitled Project'}
                                    </h3>
                                    <span className={`px-2 py-1 text-xs font-mono rounded border ${project.status === 'draft'
                                        ? 'bg-ash/10 border-ash/30 text-ash'
                                        : ['signed', 'building', 'active'].includes(project.status)
                                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                            : 'bg-cobalt/10 border-cobalt/30 text-cobalt'
                                        }`}>
                                        {project.status === 'proposal_ready' ? 'PROPOSAL READY' : project.status.toUpperCase()}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-6 flex-1">
                                    <p className="text-sm text-ash font-mono flex items-center gap-2">
                                        <Clock size={14} />
                                        {new Date(project.created_at).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-ash font-mono truncate">
                                        {project.domain_choice || 'No domain selected'}
                                    </p>
                                </div>

                                <div className="mt-auto">
                                    {project.status === 'draft' ? (
                                        <button
                                            onClick={() => router.push(`/wizard?id=${project.id}`)}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-sm text-bone transition-colors"
                                        >
                                            RESUME SETUP
                                            <ArrowRight size={14} />
                                        </button>
                                    ) : project.status === 'proposal_ready' ? (
                                        <button
                                            onClick={() => router.push(`/proposal/${project.id}`)}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cobalt/20 hover:bg-cobalt/30 border border-cobalt/30 rounded text-sm text-cobalt transition-colors"
                                        >
                                            VIEW PROPOSAL
                                            <ArrowRight size={14} />
                                        </button>
                                    ) : ['signed', 'building', 'active'].includes(project.status) ? (
                                        <button
                                            onClick={() => router.push(`/proposal/${project.id}`)}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded text-sm text-green-400 transition-colors"
                                        >
                                            <CheckCircle size={14} />
                                            PROJECT ACTIVE
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => router.push(`/proposal/${project.id}`)}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cobalt/20 hover:bg-cobalt/30 border border-cobalt/30 rounded text-sm text-cobalt transition-colors"
                                        >
                                            VIEW DASHBOARD
                                            <ArrowRight size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
