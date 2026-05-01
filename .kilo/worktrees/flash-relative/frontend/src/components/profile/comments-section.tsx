'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Comment } from '@/types/profile';
import { ThumbsUp, MessageCircle } from 'lucide-react';

interface CommentsSectionProps {
  comments: Comment[];
  currentUserAvatar: string;
  onAddComment: (content: string) => void;
}

export function CommentsSection({ comments, currentUserAvatar, onAddComment }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onAddComment(newComment);
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-t border-gray-100 pt-3 space-y-3">
      {/* Existing comments */}
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-2">
          <Image
            src={comment.user.avatar}
            alt={comment.user.firstName}
            width={32}
            height={32}
            className="rounded-full object-cover flex-shrink-0"
          />
          
          <div className="flex-1">
            <div className="bg-[rgb(var(--bg-elevated))] rounded-2xl px-3 py-2">
              <p className="font-semibold text-sm text-[rgb(var(--text-primary))]">{comment.user.firstName} {comment.user.lastName}</p>
              <p className="text-sm text-[rgb(var(--text-secondary))]">{comment.content}</p>
            </div>
            
            <div className="flex items-center gap-4 mt-1 px-3">
              <span className="text-xs text-[rgb(var(--text-muted))]">{comment.createdAt}</span>
              <button className="text-xs font-semibold text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]">Like</button>
              <button className="text-xs font-semibold text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]">Reply</button>
            </div>
          </div>
        </div>
      ))}

      {/* Add comment */}
      <div className="flex gap-2">
        <Image
          src={currentUserAvatar}
          alt="Your avatar"
          width={32}
          height={32}
          className="rounded-full object-cover flex-shrink-0"
        />
        
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Write a comment..."
            className="flex-1 bg-[rgb(var(--bg-elevated))] rounded-full px-4 py-2 text-sm text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]"
          />
          
          <button
            onClick={handleSubmit}
            disabled={!newComment.trim() || isSubmitting}
            className="p-2 text-blue-600 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
