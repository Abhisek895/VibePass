'use client';

import { useState } from 'react';
import type { ReactionType } from '@/types/profile';
import { reactionTypes } from '@/lib/constants';

interface ReactionPickerProps {
  selected?: ReactionType;
  onSelect: (reaction: ReactionType) => void;
}

export function ReactionPicker({ selected, onSelect }: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/10"
      >
        {selected ? reactionTypes.find((reaction) => reaction.type === selected)?.emoji : 'React'}
      </button>

      {isOpen && (
        <div className="absolute left-0 z-20 mt-3 flex rounded-3xl border border-white/10 bg-[rgb(var(--bg-surface))] p-2 shadow-2xl">
          {reactionTypes.map((reaction) => (
            <button
              key={reaction.type}
              type="button"
              onClick={() => onSelect(reaction.type)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-xl transition hover:bg-white/10"
              aria-label={reaction.label}
            >
              <span>{reaction.emoji}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
