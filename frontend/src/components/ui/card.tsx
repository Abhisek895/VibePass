'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

interface CardSectionProps {
  children: ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, noPadding = false }) => {
  return (
    <div
      className={cn(
        'rounded-3xl border border-white/10 bg-slate-950/65 text-white shadow-[0_24px_60px_rgba(2,6,23,0.35)]',
        !noPadding && 'p-6',
        className,
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardSectionProps> = ({ children, className }) => {
  return <div className={cn('mb-4 flex items-center justify-between', className)}>{children}</div>;
};

export const CardTitle: React.FC<CardSectionProps> = ({ children, className }) => {
  return <h3 className={cn('text-sm font-medium', className)}>{children}</h3>;
};

export const CardContent: React.FC<CardSectionProps> = ({ children, className }) => {
  return <div className={cn('pt-0', className)}>{children}</div>;
};

export const CardBody: React.FC<CardSectionProps> = ({ children, className }) => {
  return <div className={cn(className)}>{children}</div>;
};

export const CardFooter: React.FC<CardSectionProps> = ({ children, className }) => {
  return <div className={cn('mt-4 flex gap-2 border-t border-white/10 pt-4', className)}>{children}</div>;
};
