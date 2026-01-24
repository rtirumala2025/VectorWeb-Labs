'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    variant?: 'default' | 'terminal';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, variant = 'default', className = '', ...props }, ref) => {
        const isTerminal = variant === 'terminal';

        return (
            <div className="w-full space-y-2">
                {label && (
                    <label className="text-label block">
                        {label}
                    </label>
                )}

                <div className="relative">
                    {icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ash">
                            {icon}
                        </div>
                    )}

                    {isTerminal && (
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cobalt font-mono">
                            {'>'}_
                        </span>
                    )}

                    <motion.input
                        ref={ref}
                        whileFocus={{ scale: 1.01 }}
                        className={`
              w-full px-4 py-3
              bg-carbon border border-steel
              text-bone font-mono text-sm
              placeholder:text-ash/50
              focus:outline-none focus:border-cobalt
              focus:shadow-[0_0_20px_rgba(0,71,255,0.15)]
              transition-all duration-300
              ${icon ? 'pl-12' : ''}
              ${isTerminal ? 'pl-14 bg-void font-mono tracking-wide' : ''}
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
                        {...props}
                    />

                    {/* Underline animation */}
                    <motion.div
                        className="absolute bottom-0 left-0 h-[2px] bg-cobalt"
                        initial={{ width: 0 }}
                        whileHover={{ width: '100%' }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-xs font-mono"
                    >
                        {error}
                    </motion.p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
