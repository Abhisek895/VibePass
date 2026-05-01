'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon = '📭', title, description, action, className }) => {
  return (
    <div className={cn('py-12 px-6 text-center', className)}>
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-600 mb-6 max-w-sm mx-auto">{description}</p>}
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
};
