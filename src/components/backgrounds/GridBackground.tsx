'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface GridBackgroundProps {
    className?: string;
    gridSize?: number;
    interactive?: boolean;
}

export function GridBackground({
    className = '',
    gridSize = 60,
    interactive = true
}: GridBackgroundProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 30, stiffness: 100 };
    const spotlightX = useSpring(mouseX, springConfig);
    const spotlightY = useSpring(mouseY, springConfig);

    useEffect(() => {
        if (!interactive) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            mouseX.set(e.clientX - rect.left);
            mouseY.set(e.clientY - rect.top);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [interactive, mouseX, mouseY]);

    return (
        <div
            ref={containerRef}
            className={`absolute inset-0 overflow-hidden ${className}`}
        >
            {/* Base Grid */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
                    backgroundSize: `${gridSize}px ${gridSize}px`,
                }}
            />

            {/* Dotted intersections */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `radial-gradient(circle, rgba(0,71,255,0.2) 1px, transparent 1px)`,
                    backgroundSize: `${gridSize}px ${gridSize}px`,
                }}
            />

            {/* Interactive Spotlight */}
            {interactive && (
                <motion.div
                    className="pointer-events-none absolute w-[400px] h-[400px] rounded-full"
                    style={{
                        x: spotlightX,
                        y: spotlightY,
                        translateX: '-50%',
                        translateY: '-50%',
                        background: `radial-gradient(circle, rgba(0,71,255,0.08) 0%, transparent 70%)`,
                    }}
                />
            )}

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-32 h-32">
                <div className="absolute top-8 left-0 w-24 h-[1px] bg-gradient-to-r from-cobalt/30 to-transparent" />
                <div className="absolute top-0 left-8 w-[1px] h-24 bg-gradient-to-b from-cobalt/30 to-transparent" />
            </div>

            <div className="absolute top-0 right-0 w-32 h-32">
                <div className="absolute top-8 right-0 w-24 h-[1px] bg-gradient-to-l from-cobalt/30 to-transparent" />
                <div className="absolute top-0 right-8 w-[1px] h-24 bg-gradient-to-b from-cobalt/30 to-transparent" />
            </div>

            <div className="absolute bottom-0 left-0 w-32 h-32">
                <div className="absolute bottom-8 left-0 w-24 h-[1px] bg-gradient-to-r from-cobalt/30 to-transparent" />
                <div className="absolute bottom-0 left-8 w-[1px] h-24 bg-gradient-to-t from-cobalt/30 to-transparent" />
            </div>

            <div className="absolute bottom-0 right-0 w-32 h-32">
                <div className="absolute bottom-8 right-0 w-24 h-[1px] bg-gradient-to-l from-cobalt/30 to-transparent" />
                <div className="absolute bottom-0 right-8 w-[1px] h-24 bg-gradient-to-t from-cobalt/30 to-transparent" />
            </div>
        </div>
    );
}

export default GridBackground;
