'use client';

import { ThumbsUp, Heart, Laugh, Zap, Frown, Angry, MessageCircle, Share2 } from 'lucide-react';
import { ReactionSummary } from '@/types/profile';

interface ReactionsBarProps {
  reactions: ReactionSummary[];
  commentsCount: number;
  sharesCount: number;
  onReactionClick: (type: string) => void;
  onCommentClick: () => void;
  onShareClick: () => void;
}

const reactionIcons: Record<string, React.ReactNode> = {
  like: <ThumbsUp className="w-4 h-4" />,
  love: <Heart className="w-4 h-4" />,
  haha: <Laugh className="w-4 h-4" />,
  wow: <Zap className="w-4 h-4" />,
  sad: <Frown className="w-4 h-4" />,
  angry: <Angry className="w-4 h-4" />,
};

const reactionColors: Record<string, string> = {
  like: 'text-blue-600',
  love: 'text-red-500',
  haha: 'text-yellow-500',
  wow: 'text-yellow-500',
  sad: 'text-yellow-500',
  angry: 'text-orange-500',
};

export function ReactionsBar({
  reactions,
  commentsCount,
  sharesCount,
  onReactionClick,
  onCommentClick,
  onShareClick,
}: ReactionsBarProps) {
  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);
  const userReaction = reactions.find(r => r.reacted);

  return (
    <div className="border-t border-[rgba(var(--border-subtle),0.1)] pt-3">
      {/* Reaction counts */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          {reactions.filter(r => r.count > 0).slice(0, 3).map((reaction) => (
            <span key={reaction.type} className={`${reactionColors[reaction.type]} -ml-1 first:ml-0`}>
              {reactionIcons[reaction.type]}
            </span>
          ))}
          {totalReactions > 0 && (
            <span className="text-sm text-gray-500 ml-1">{totalReactions}</span>
          )}
        </div>
        
        <div className="flex gap-4 text-sm text-gray-500">
          {commentsCount > 0 && <button onClick={onCommentClick} className="hover:underline">{commentsCount} comments</button>}
          {sharesCount > 0 && <button onClick={onShareClick} className="hover:underline">{sharesCount} shares</button>}
        </div>
      </div>

      {/* Reaction buttons */}
      <div className="grid grid-cols-3 gap-1">
        <button
          onClick={() => onReactionClick(userReaction?.type === 'like' ? '' : 'like')}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
            userReaction?.type === 'like' ? 'text-blue-600 font-medium' : 'text-gray-600'
          }`}
        >
          <ThumbsUp className="w-5 h-5" />
          <span className="text-sm hidden sm:inline">Like</span>
        </button>
        
        <button
          onClick={onCommentClick}
          className="flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm hidden sm:inline">Comment</span>
        </button>
        
        <button
          onClick={onShareClick}
          className="flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-sm hidden sm:inline">Share</span>
        </button>
      </div>
    </div>
  );
}
