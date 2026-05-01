"use client";

import { useState } from 'react';
import { REACTION_TYPES } from '@/services/api/social.service';

interface ReactionButtonProps {
  currentReaction: string | null;
  onReaction: (reactionType: string) => void;
  count: number;
}

export function ReactionButton({ currentReaction, onReaction, count }: ReactionButtonProps) {
  const [showReactions, setShowReactions] = useState(false);

  const handleReactionClick = (reactionType: string) => {
    onReaction(reactionType);
    setShowReactions(false);
  };

  const currentReactionData = REACTION_TYPES.find(r => r.type === currentReaction);

  return (
    <div className="relative">
      <button
        onClick={() => setShowReactions(!showReactions)}
        onMouseEnter={() => setShowReactions(true)}
        onMouseLeave={() => setShowReactions(false)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          currentReaction
            ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        {currentReactionData ? (
          <span className="text-lg">{currentReactionData.emoji}</span>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
        )}
        <span className="text-sm font-medium">
          {currentReactionData ? currentReactionData.label : 'Like'}
        </span>
        {count > 0 && <span className="text-xs text-gray-500">({count})</span>}
      </button>

      {/* Reaction Picker */}
      {showReactions && (
        <div className="absolute bottom-full left-0 mb-2 p-2 bg-white rounded-lg shadow-lg border border-gray-200 flex gap-1">
          {REACTION_TYPES.map((reaction) => (
            <button
              key={reaction.type}
              onClick={() => handleReactionClick(reaction.type)}
              className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                currentReaction === reaction.type ? 'bg-blue-100' : ''
              }`}
              title={reaction.label}
            >
              <span className="text-xl">{reaction.emoji}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}