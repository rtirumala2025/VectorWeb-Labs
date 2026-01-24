'use client';

import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
    children: ReactNode;
    variant?: 'default' | 'elevated' | 'interactive';
    crosshairs?: boolean;
    gridBg?: boolean;
}

export function Card({
    children,
    variant = 'default',
    crosshairs = true,
    gridBg = false,
    className = '',
    ...props
}: CardProps) {
    const variants = {
        default: 'border-steel hover:border-steel/80',
        elevated: 'border-steel shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-cobalt/5',
        interactive: `
      border-steel cursor-pointer
      hover:border-cobalt hover:shadow-[0_0_30px_rgba(0,71,255,0.1)]
      active:scale-[0.99]
    `,
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={variant === 'interactive' ? { y: -4, scale: 1.02 } : undefined}
            transition={{ duration: 0.3 }}
            className={`
        relative p-6 bg-carbon border
        transition-all duration-300
        ${variants[variant]}
        ${gridBg ? 'blueprint-grid' : ''}
        ${className}
      `}
            {...props}
        >
            {/* Crosshair Decorations */}
            {crosshairs && (
                <>
                    {/* Top Left */}
                    <div className="absolute top-0 left-0 w-4 h-4 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-cobalt/40" />
                        <div className="absolute top-0 left-0 w-[1px] h-full bg-cobalt/40" />
                    </div>

                    {/* Top Right */}
                    <div className="absolute top-0 right-0 w-4 h-4 pointer-events-none">
                        <div className="absolute top-0 right-0 w-full h-[1px] bg-cobalt/40" />
                        <div className="absolute top-0 right-0 w-[1px] h-full bg-cobalt/40" />
                    </div>

                    {/* Bottom Left */}
                    <div className="absolute bottom-0 left-0 w-4 h-4 pointer-events-none">
                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-cobalt/40" />
                        <div className="absolute bottom-0 left-0 w-[1px] h-full bg-cobalt/40" />
                    </div>

                    {/* Bottom Right */}
                    <div className="absolute bottom-0 right-0 w-4 h-4 pointer-events-none">
                        <div className="absolute bottom-0 right-0 w-full h-[1px] bg-cobalt/40" />
                        <div className="absolute bottom-0 right-0 w-[1px] h-full bg-cobalt/40" />
                    </div>
                </>
            )}

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
}

export default Card;
