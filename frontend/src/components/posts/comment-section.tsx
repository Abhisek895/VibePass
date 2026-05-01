'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useComments } from '@/hooks/use-comments';
import { CommentItem } from '@/components/comments/CommentItem';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const { data: comments = [], isLoading, addComment, isAddingComment } = useComments(postId, '');

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    await addComment(newComment);
    setNewComment('');
  };

  if (isLoading) {
    return (
      <div className="mt-4 space-y-3">
        <LoadingSkeleton className="h-16 rounded-xl" />
        <LoadingSkeleton className="h-16 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {/* Existing comments */}
      {comments.map((comment: any) => (
        <CommentItem key={comment.id} comment={comment as any} />
      ))}

      {/* Add comment */}
      <div className="flex gap-2">
        <Image
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=32&h=32"
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
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <button
            onClick={handleSubmit}
            disabled={!newComment.trim() || isAddingComment}
            className="p-2 text-blue-600 hover:bg-gray-100 rounded-full disabled:opacity-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
