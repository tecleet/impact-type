import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'pink' | 'blue' | 'green';
}

export default function NeonButton({ children, className, variant = 'blue', ...props }: NeonButtonProps) {
    const variants = {
        pink: 'border-[var(--neon-pink)] text-[var(--neon-pink)] hover:bg-[var(--neon-pink)] hover:text-black hover:box-glow',
        blue: 'border-[var(--neon-blue)] text-[var(--neon-blue)] hover:bg-[var(--neon-blue)] hover:text-black hover:box-glow',
        green: 'border-[var(--neon-green)] text-[var(--neon-green)] hover:bg-[var(--neon-green)] hover:text-black hover:box-glow',
    };

    return (
        <button
            className={cn(
                'px-6 py-3 font-bold uppercase tracking-widest border-2 transition-all duration-300 rounded-md',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
