'use client';

import React, { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/button';
import { Comment } from '@/lib/types';
import { CommentItem } from './CommentItem';

interface CommentSectionProps {
  comments: Comment[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  userAvatar?: string;
  userName?: string;
  onAddComment?: (content: string) => void;
  onLoadMore?: () => void;
  isOwnPost?: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  isLoading,
  isLoadingMore,
  hasMore,
  userAvatar,
  userName = 'You',
  onAddComment,
  onLoadMore,
  isOwnPost,
}) => {
  const [commentText, setCommentText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    if (commentText.trim()) {
      onAddComment?.(commentText);
      setCommentText('');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Comments ({comments.length})</h3>

      {/* Comment Input */}
      <div className="flex gap-3 mb-6 pb-6 border-b border-gray-200">
        <Avatar src={userAvatar} alt={userName} size="sm" />
        <div className="flex-1">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Write a comment..."
            className="w-full px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {isFocused && (
            <div className="flex gap-2 mt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setCommentText('');
                  setIsFocused(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                disabled={!commentText.trim()}
              >
                Post
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Comments List */}
      {comments.length > 0 ? (
        <>
          <div className="space-y-1">
            {comments.map((comment: any) => (
              <CommentItem key={comment.id} comment={comment as any} isOwnComment={isOwnPost} />
            ))}
          </div>

          {hasMore && (
            <button
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="w-full py-2 text-blue-600 hover:text-blue-700 font-medium text-sm mt-4"
            >
              {isLoadingMore ? 'Loading...' : 'Load More Comments'}
            </button>
          )}
        </>
      ) : (
        <p className="text-center text-gray-600 py-8">No comments yet. Be the first to comment!</p>
      )}
    </div>
  );
};
