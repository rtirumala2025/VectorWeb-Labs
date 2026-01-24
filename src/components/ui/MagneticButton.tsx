'use client';

import { useRef, useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface MagneticButtonProps {
    children: ReactNode;
    href?: string;
    onClick?: () => void;
    className?: string;
    strength?: number;
}

export function MagneticButton({
    children,
    href,
    onClick,
    className = '',
    strength = 0.4
}: MagneticButtonProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * strength;
        const deltaY = (e.clientY - centerY) * strength;

        setPosition({ x: deltaX, y: deltaY });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    const content = (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: 'spring', stiffness: 350, damping: 15 }}
            className={`
        relative inline-flex items-center justify-center
        px-8 py-4 cursor-pointer
        bg-cobalt text-white
        font-mono font-bold uppercase tracking-[0.2em] text-sm
        border border-cobalt
        hover:shadow-[0_0_40px_rgba(0,71,255,0.5)]
        transition-shadow duration-300
        group
        ${className}
      `}
            onClick={onClick}
        >
            {/* Glowing border effect */}
            <motion.div
                className="absolute inset-0 border border-cobalt-glow opacity-0 group-hover:opacity-100"
                style={{ transform: 'scale(1.05)' }}
                transition={{ duration: 0.3 }}
            />

            {/* Background pulse */}
            <motion.div
                className="absolute inset-0 bg-cobalt-glow"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.2 }}
                transition={{ duration: 0.3 }}
            />

            {/* Arrow animation */}
            <span className="relative z-10 flex items-center gap-3">
                {children}
                <motion.span
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                >
                    →
                </motion.span>
            </span>
        </motion.div>
    );

    if (href) {
        return <Link href={href}>{content}</Link>;
    }

    return content;
}

export default MagneticButton;
