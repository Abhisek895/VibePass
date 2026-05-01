'use client';

import React from 'react';
import { ReactionType } from '@/lib/types';
import { REACTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface ReactionBarProps {
  onReact: (reactionType: ReactionType) => void;
  userReaction?: ReactionType;
  className?: string;
}

export const ReactionBar: React.FC<ReactionBarProps> = ({ onReact, userReaction, className }) => {
  return (
    <div className={cn('flex gap-1 bg-white border border-gray-200 rounded-full p-2 shadow-lg', className)}>
      {REACTIONS.map((reaction) => (
        <button
          key={reaction.type}
          onClick={() => onReact(reaction.type as ReactionType)}
          className={cn(
            'p-2 rounded-full hover:bg-gray-100 transition-colors text-2xl',
            userReaction === reaction.type && 'bg-blue-50'
          )}
          title={reaction.label}
        >
          {reaction.emoji}
        </button>
      ))}
    </div>
  );
};
