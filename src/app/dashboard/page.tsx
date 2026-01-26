'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchProject();
    }, []);

    const fetchProject = async () => {
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
                const projects = await res.json();
                if (projects.length > 0) {
                    setProject(projects[0]); // Show latest project
                } else {
                    // No project found, redirect to wizard handled by middleware mostly, but good to handle here too
                }
            }
        } catch (error) {
            console.error('Error fetching project:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) return;

            setUploading(true);
            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${project.id}/${fileName}`;

            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            const { error } = await supabase.storage
                .from('project-assets')
                .upload(filePath, file);

            if (error) throw error;
            alert('Upload successful!');

        } catch (error) {
            console.error('Error uploading:', error);
            alert('Error uploading asset');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="min-h-screen pt-24 px-4 text-center">Loading...</div>;

    if (!project) return (
        <div className="min-h-screen pt-24 px-4 flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-4">No Active Projects</h1>
            <button
                onClick={() => router.push('/wizard')}
                className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
                Start a New Project
            </button>
        </div>
    );

    const isActive = project.status === 'active' || project.status === 'building';

    // Timeline steps
    const steps = [
        { id: 'draft', label: 'Design' },
        { id: 'building', label: 'Dev' },
        { id: 'qa', label: 'QA' },
        { id: 'launched', label: 'Launch' }
    ];

    // Simple mapping for progress; customize as needed based on your status values
    const getStepStatus = (stepId: string) => {
        if (project.status === stepId) return 'current';
        // Simplistic logic: assume order. 
        const statusOrder = ['draft', 'building', 'qa', 'launched'];
        const currentIndex = statusOrder.indexOf(project.status) !== -1 ? statusOrder.indexOf(project.status) : 0;
        const stepIndex = statusOrder.indexOf(stepId);

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'upcoming';
    };

    return (
        <div className="min-h-screen pt-24 px-4 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-12 p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{project.business_name}</h1>
                    <p className="text-gray-400">Project ID: {project.id}</p>
                </div>

                <div className={`px-4 py-2 rounded-full border ${isActive
                        ? 'bg-green-500/20 border-green-500/50 text-green-400'
                        : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                    }`}>
                    <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                        {project.status.toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Timeline */}
            <div className="mb-12">
                <h2 className="text-xl font-semibold mb-6">Project Progress</h2>
                <div className="relative flex justify-between">
                    {/* Connecting Line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-700 -z-10 transform -translate-y-1/2"></div>

                    {steps.map((step) => {
                        const status = getStepStatus(step.id);
                        return (
                            <div key={step.id} className="flex flex-col items-center bg-zinc-900 px-4 z-10">
                                <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 transition-all duration-300
                            ${status === 'completed' ? 'bg-green-500 border-green-500 text-black' : ''}
                            ${status === 'current' ? 'bg-blue-600 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : ''}
                            ${status === 'upcoming' ? 'bg-gray-800 border-gray-600 text-gray-500' : ''}
                        `}>
                                    {status === 'completed' && '✓'}
                                    {status === 'current' && <div className="w-3 h-3 bg-white rounded-full animate-pulse" />}
                                </div>
                                <span className={`text-sm font-medium ${status === 'upcoming' ? 'text-gray-500' : 'text-white'}`}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Grid Layout for Assets & Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Asset Uploader */}
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        Asset Manager
                    </h3>
                    <p className="text-sm text-gray-400 mb-6">Upload your logo, brand guide, or specific images.</p>

                    <div className="border-2 border-dashed border-gray-700 hover:border-blue-500 rounded-xl p-8 transition-colors text-center cursor-pointer relative group">
                        <input
                            type="file"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={uploading}
                        />

                        {uploading ? (
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                <span className="text-blue-400">Uploading...</span>
                            </div>
                        ) : (
                            <>
                                <div className="mx-auto w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-500/20 transition-colors">
                                    <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                </div>
                                <p className="text-gray-300 font-medium">Click or Drag to Upload</p>
                                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Project Details */}
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                    <h3 className="text-lg font-semibold mb-4">Project Details</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between border-b border-gray-800 pb-2">
                            <span className="text-gray-400">Website Type</span>
                            <span>{project.website_type || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-800 pb-2">
                            <span className="text-gray-400">Vibe</span>
                            <span className="capitalize">{project.vibe_style}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-800 pb-2">
                            <span className="text-gray-400">Domain</span>
                            <span>{project.domain_choice}</span>
                        </div>
                        <div className="mt-6 pt-4">
                            <h4 className="text-sm font-semibold text-gray-400 mb-2">AI Reasoning</h4>
                            <p className="text-sm text-gray-300 bg-black/30 p-3 rounded-lg border border-white/5">
                                {project.ai_reasoning || 'No analysis available.'}
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
