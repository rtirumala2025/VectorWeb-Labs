'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface TimelineStep {
    id: string;
    label: string;
    status: 'completed' | 'current' | 'upcoming';
    date?: string;
}

interface StatusTimelineProps {
    steps?: TimelineStep[];
}

const defaultSteps: TimelineStep[] = [
    { id: 'design', label: 'DESIGN', status: 'completed', date: 'Jan 15' },
    { id: 'dev', label: 'DEVELOPMENT', status: 'current', date: 'Jan 22' },
    { id: 'review', label: 'REVIEW', status: 'upcoming', date: 'Jan 29' },
    { id: 'launch', label: 'LAUNCH', status: 'upcoming', date: 'Feb 5' },
];

export function StatusTimeline({ steps = defaultSteps }: StatusTimelineProps) {
    return (
        <div className="w-full py-8">
            <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-6 left-0 right-0 h-[2px] bg-steel" />

                {/* Active Progress */}
                <motion.div
                    className="absolute top-6 left-0 h-[2px] bg-cobalt"
                    initial={{ width: 0 }}
                    animate={{
                        width: `${(steps.findIndex(s => s.status === 'current') + 0.5) * (100 / steps.length)}%`
                    }}
                    transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                />

                {/* Steps */}
                <div className="relative flex justify-between">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.15 }}
                            className="flex flex-col items-center"
                        >
                            {/* Icon */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.4 + index * 0.15, type: 'spring' }}
                                className={`
                  relative z-10 w-12 h-12 rounded-full
                  flex items-center justify-center
                  border-2 transition-colors duration-300
                  ${step.status === 'completed'
                                        ? 'bg-cobalt border-cobalt'
                                        : step.status === 'current'
                                            ? 'bg-carbon border-cobalt animate-pulse'
                                            : 'bg-carbon border-steel'
                                    }
                `}
                            >
                                {step.status === 'completed' ? (
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                ) : step.status === 'current' ? (
                                    <Clock className="w-5 h-5 text-cobalt" />
                                ) : (
                                    <Circle className="w-5 h-5 text-ash" />
                                )}
                            </motion.div>

                            {/* Label */}
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 + index * 0.15 }}
                                className={`
                  mt-4 font-mono text-xs tracking-widest
                  ${step.status === 'current' ? 'text-cobalt' :
                                        step.status === 'completed' ? 'text-bone' : 'text-ash'}
                `}
                            >
                                {step.label}
                            </motion.span>

                            {/* Date */}
                            {step.date && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.7 + index * 0.15 }}
                                    className="mt-1 font-mono text-[10px] text-ash"
                                >
                                    {step.date}
                                </motion.span>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default StatusTimeline;
