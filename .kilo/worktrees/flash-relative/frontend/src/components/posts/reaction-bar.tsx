'use client';

import { useState } from 'react';
import { ThumbsUp, MessageCircle, Share2 } from 'lucide-react';
import { ReactionSummary } from '@/lib/types/profile';
import { REACTION_CONFIG } from '@/lib/constants/profile';

interface ReactionBarProps {
  reactions: ReactionSummary;
  commentsCount: number;
  sharesCount: number;
  onToggleComments: () => void;
}

export function ReactionBar({ reactions, commentsCount, sharesCount, onToggleComments }: ReactionBarProps) {
  const [showPicker, setShowPicker] = useState(false);

  const totalReactions = reactions.total;
  const topReactions = Object.entries(reactions.breakdown)
    .filter(([_, count]) => count > 0)
    .slice(0, 3);

  return (
    <div className="border-t border-gray-100 pt-3">
      {/* Reaction summary */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          {topReactions.map(([type]) => (
            <span key={type} className="text-sm -ml-1 first:ml-0">
              {REACTION_CONFIG[type as keyof typeof REACTION_CONFIG].emoji}
            </span>
          ))}
          {totalReactions > 0 && (
            <span className="text-sm text-gray-500 ml-1">{totalReactions}</span>
          )}
        </div>
        
        <div className="flex gap-4 text-sm text-gray-500">
          {commentsCount > 0 && (
            <button onClick={onToggleComments} className="hover:underline">
              {commentsCount} comments
            </button>
          )}
          {sharesCount > 0 && (
            <button className="hover:underline">{sharesCount} shares</button>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-1 relative">
        <div 
          className="relative"
          onMouseEnter={() => setShowPicker(true)}
          onMouseLeave={() => setShowPicker(false)}
        >
          <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600">
            <ThumbsUp className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">Like</span>
          </button>
          
          {showPicker && (
            <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-full p-2 shadow-lg flex gap-1">
              {REACTION_CONFIG && Object.values(REACTION_CONFIG).map((reaction: any) => (
                <button key={reaction.value} className="text-2xl hover:scale-125 transition-transform">
                  {reaction.emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button
          onClick={onToggleComments}
          className="flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm hidden sm:inline">Comment</span>
        </button>
        
        <button className="flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
          <Share2 className="w-5 h-5" />
          <span className="text-sm hidden sm:inline">Share</span>
        </button>
      </div>
    </div>
  );
}
