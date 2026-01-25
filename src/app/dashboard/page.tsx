'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, FileText, Settings, LogOut,
    ExternalLink, Bell, User, Clock, CheckCircle2, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GridBackground } from '@/components/backgrounds/GridBackground';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusTimeline } from '@/components/dashboard/StatusTimeline';
import { ChatWidget } from '@/components/dashboard/ChatWidget';
import { apiClient, type Project } from '@/lib/api';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState<string>('');

    useEffect(() => {
        async function loadData() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push('/login');
                    return;
                }

                setUserEmail(user.email || '');
                const data = await apiClient.getProjects(user.id);
                setProjects(data);
            } catch (err) {
                console.error('Failed to load projects:', err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [router]);

    const activeProject = projects[0];

    const projectData = activeProject ? {
        name: activeProject.business_name,
        domain: activeProject.domain_choice,
        vibe: activeProject.vibe_style,
        status: activeProject.status,
        progress: 45, // Mock progress for now
        startDate: new Date(activeProject.created_at).toLocaleDateString(),
        estimatedLaunch: 'Feb 5, 2024',
        teamLead: 'Alex Chen',
    } : null;

    const recentActivity = [
        { id: 1, action: 'Design mockups approved', time: '2 hours ago', type: 'success' },
        { id: 2, action: 'Homepage development started', time: '5 hours ago', type: 'info' },
        { id: 3, action: 'Color palette finalized', time: '1 day ago', type: 'success' },
        { id: 4, action: 'Domain DNS configured', time: '2 days ago', type: 'success' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-void">
                <Loader2 className="animate-spin text-cobalt" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <motion.aside
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-64 bg-carbon border-r border-steel flex flex-col"
            >
                {/* Logo */}
                <div className="p-6 border-b border-steel">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-cobalt rounded flex items-center justify-center">
                            <span className="font-display font-bold text-white text-sm">V</span>
                        </div>
                        <span className="font-display font-bold text-bone tracking-tight">VECTORWEB</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        {[
                            { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', active: true },
                            { icon: FileText, label: 'Documents', href: '#' },
                            { icon: Settings, label: 'Settings', href: '#' },
                        ].map((item) => (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded
                    font-mono text-sm transition-colors
                    ${item.active
                                            ? 'bg-cobalt/10 text-cobalt border border-cobalt/30'
                                            : 'text-ash hover:text-bone hover:bg-steel/30'}
                  `}
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-steel">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-steel flex items-center justify-center">
                            <User size={16} className="text-ash" />
                        </div>
                        <div className="flex-1">
                            <p className="font-mono text-sm text-bone">Demo User</p>
                            <p className="font-mono text-[10px] text-ash">demo@vectorweb.io</p>
                        </div>
                    </div>

                    <button className="flex items-center gap-2 px-4 py-2 text-ash hover:text-red-400 transition-colors font-mono text-xs w-full">
                        <LogOut size={14} />
                        Logout
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 relative overflow-y-auto">
                <GridBackground className="opacity-20" />

                <div className="relative z-10 p-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start justify-between mb-12"
                    >
                        <div>
                            <h1 className="headline-md mb-2">WELCOME BACK</h1>
                            <p className="text-technical text-ash">
                                Your project is in progress. Track status and communicate with your team.
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="relative p-2 text-ash hover:text-bone transition-colors">
                                <Bell size={20} />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-cobalt rounded-full" />
                            </button>
                        </div>
                    </motion.div>

                    {/* Project Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-12"
                    >
                        {projectData ? (
                            <Card className="bg-carbon border-cobalt/30">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <span className="text-label text-cobalt block mb-2">ACTIVE PROJECT</span>
                                        <h2 className="font-display font-bold text-3xl text-bone mb-1">
                                            {projectData.name}
                                        </h2>
                                        <p className="font-mono text-sm text-ash flex items-center gap-2">
                                            {projectData.domain}.com
                                            <ExternalLink size={12} className="text-cobalt" />
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <span className={`
                        inline-flex items-center gap-2 px-3 py-1
                        font-mono text-xs border
                        ${projectData.status === 'In Development'
                                                ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
                                                : 'text-green-400 border-green-400/30 bg-green-400/10'}
                      `}>
                                            <Clock size={12} />
                                            {projectData.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-mono text-xs text-ash">OVERALL PROGRESS</span>
                                        <span className="font-mono text-xs text-cobalt">{projectData.progress}%</span>
                                    </div>
                                    <div className="h-2 bg-steel rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${projectData.progress}%` }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                            className="h-full bg-cobalt"
                                        />
                                    </div>
                                </div>

                                {/* Project Details */}
                                <div className="grid grid-cols-4 gap-6 pt-6 border-t border-steel">
                                    <div>
                                        <span className="text-label block mb-1">STYLE</span>
                                        <p className="font-mono text-sm text-bone uppercase">{projectData.vibe}</p>
                                    </div>
                                    <div>
                                        <span className="text-label block mb-1">STARTED</span>
                                        <p className="font-mono text-sm text-bone">{projectData.startDate}</p>
                                    </div>
                                    <div>
                                        <span className="text-label block mb-1">LAUNCH ETA</span>
                                        <p className="font-mono text-sm text-cobalt">{projectData.estimatedLaunch}</p>
                                    </div>
                                    <div>
                                        <span className="text-label block mb-1">TEAM LEAD</span>
                                        <p className="font-mono text-sm text-bone">{projectData.teamLead}</p>
                                    </div>
                                </div>
                            </Card>
                        ) : (
                            <Card className="bg-carbon border-dashed border-steel text-center py-12">
                                <h2 className="headline-md text-bone mb-4">NO ACTIVE PROJECT</h2>
                                <p className="text-technical text-ash mb-8 max-w-md mx-auto">
                                    You haven't started a project yet. Launch the wizard to create your digital presence.
                                </p>
                                <Button
                                    variant="primary"
                                    onClick={() => router.push('/wizard')}
                                >
                                    START NEW PROJECT
                                    <ExternalLink size={16} />
                                </Button>
                            </Card>
                        )}
                    </motion.div>

                    {/* Status Timeline */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-12"
                    >
                        <span className="text-label text-ash block mb-6">PROJECT TIMELINE</span>
                        <Card className="bg-carbon">
                            <StatusTimeline />
                        </Card>
                    </motion.div>

                    {/* Recent Activity & Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Recent Activity */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <span className="text-label text-ash block mb-6">RECENT ACTIVITY</span>
                            <Card className="bg-carbon">
                                <div className="space-y-4">
                                    {recentActivity.map((activity, i) => (
                                        <motion.div
                                            key={activity.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 + i * 0.1 }}
                                            className="flex items-start gap-3 pb-4 border-b border-steel last:border-0 last:pb-0"
                                        >
                                            <CheckCircle2
                                                size={16}
                                                className={activity.type === 'success' ? 'text-green-400' : 'text-cobalt'}
                                            />
                                            <div className="flex-1">
                                                <p className="font-mono text-sm text-bone">{activity.action}</p>
                                                <p className="font-mono text-[10px] text-ash">{activity.time}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <span className="text-label text-ash block mb-6">QUICK ACTIONS</span>
                            <Card className="bg-carbon">
                                <div className="space-y-4">
                                    <Button variant="outline" className="w-full justify-start">
                                        <FileText size={16} />
                                        View Contract
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start">
                                        <ExternalLink size={16} />
                                        Preview Staging Site
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start">
                                        <Settings size={16} />
                                        Project Settings
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </main>

            {/* AI Chat Widget */}
            <ChatWidget projectId={activeProject?.id || null} />
        </div>
    );
}
