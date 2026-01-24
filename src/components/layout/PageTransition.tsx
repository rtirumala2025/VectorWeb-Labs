'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface PageTransitionProps {
    children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 30,
                    duration: 0.3,
                }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}

// Aggressive slide transition for wizard steps
export function SlideTransition({
    children,
    direction = 'left',
    isActive = true
}: {
    children: ReactNode;
    direction?: 'left' | 'right';
    isActive?: boolean;
}) {
    const xOffset = direction === 'left' ? -100 : 100;

    return (
        <AnimatePresence mode="wait">
            {isActive && (
                <motion.div
                    initial={{ opacity: 0, x: -xOffset }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: xOffset }}
                    transition={{
                        type: 'tween',
                        ease: [0.16, 1, 0.3, 1], // easeOutExpo
                        duration: 0.5,
                    }}
                    className="w-full h-full"
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Staggered container for list items
export function StaggerContainer({
    children,
    delay = 0.1,
    className = '',
}: {
    children: ReactNode;
    delay?: number;
    className?: string;
}) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                visible: {
                    transition: {
                        staggerChildren: delay,
                    },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
            }}
            transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export default PageTransition;
