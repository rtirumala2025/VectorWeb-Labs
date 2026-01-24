'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', children, className = '', ...props }, ref) => {
    const baseStyles = `
      relative inline-flex items-center justify-center gap-2
      font-mono font-medium uppercase tracking-widest
      transition-all duration-300
      border cursor-pointer
      disabled:opacity-50 disabled:cursor-not-allowed
      overflow-hidden
    `;

    const variants = {
      primary: `
        bg-cobalt text-white border-cobalt
        hover:bg-cobalt-dim hover:shadow-[0_0_30px_rgba(0,71,255,0.4)]
        active:scale-[0.98]
      `,
      secondary: `
        bg-steel text-bone border-steel
        hover:bg-graphite hover:border-cobalt
        active:scale-[0.98]
      `,
      ghost: `
        bg-transparent text-ash border-transparent
        hover:text-bone hover:bg-steel/30
      `,
      outline: `
        bg-transparent text-bone border-steel
        hover:border-cobalt hover:text-cobalt
        hover:shadow-[0_0_20px_rgba(0,71,255,0.2)]
      `,
    };

    const sizes = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        whileHover={{ y: -2 }}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {/* Sliding fill effect */}
        <motion.span
          className="absolute inset-0 bg-white/5"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.5 }}
        />
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
