'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Wifi, Clock, Zap } from 'lucide-react';

export function LabStatusFooter() {
    const [time, setTime] = useState<string>('--:--:--');
    const [latency, setLatency] = useState(12);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString('en-US', { hour12: false }));
        };

        updateTime();
        const interval = setInterval(() => {
            updateTime();
            // Simulate latency fluctuation
            setLatency(Math.floor(Math.random() * 8) + 8);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const metrics = [
        { icon: Activity, label: 'SYSTEM', value: 'ONLINE', status: 'success' },
        { icon: Wifi, label: 'LATENCY', value: `${latency}ms`, status: 'warning' },
        { icon: Clock, label: 'LOCAL', value: time, status: 'neutral' },
        { icon: Zap, label: 'STATUS', value: 'OPERATIONAL', status: 'success' },
    ];

    return (
        <motion.footer
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="fixed bottom-0 left-0 right-0 z-50
        bg-carbon/90 backdrop-blur-md border-t border-steel
        px-4 py-2"
        >
            <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
                {/* Logo / Brand */}
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cobalt animate-pulse" />
                    <span className="font-mono text-xs text-ash tracking-widest">
                        VECTORWEB.LAB
                    </span>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-6">
                    {metrics.map((metric, i) => (
                        <motion.div
                            key={metric.label}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 + i * 0.1 }}
                            className="flex items-center gap-2"
                        >
                            <metric.icon size={12} className="text-ash" />
                            <span className="font-mono text-[10px] text-ash tracking-wider">
                                {metric.label}:
                            </span>
                            <span className={`font-mono text-[10px] tracking-wider ${metric.status === 'success' ? 'text-green-400' :
                                    metric.status === 'warning' ? 'text-yellow-400' :
                                        'text-bone'
                                }`}>
                                {metric.value}
                            </span>
                        </motion.div>
                    ))}
                </div>

                {/* Version */}
                <div className="font-mono text-[10px] text-ash/50 tracking-wider">
                    v0.1.0-alpha
                </div>
            </div>
        </motion.footer>
    );
}

export default LabStatusFooter;
