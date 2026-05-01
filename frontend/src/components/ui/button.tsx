'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  children: ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, className, disabled, children, ...props }, ref) => {
    const baseStyles =
      'font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer';

    const variants = {
      default:
        'bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40',
      primary:
        'bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40',
      secondary:
        'bg-white/10 text-white hover:bg-white/20 disabled:opacity-40',
      outline:
        'border border-white/20 text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-40',
      ghost:
        'text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-40',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-40',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
