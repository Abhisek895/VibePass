"use client";

import { useState } from 'react';
import { useComments } from '@/hooks/use-comments';
import { Avatar } from '@/components/common/Avatar';
import { useCurrentUser } from '@/hooks/use-current-user';

interface CommentInputProps {
  postId: string;
}

export function CommentInput({ postId }: CommentInputProps) {
  const [content, setContent] = useState('');
  const { data: currentUser } = useCurrentUser();
  const { addComment, isAddingComment } = useComments(postId, currentUser?.id || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !currentUser) return;

    try {
      await addComment(content.trim());
      setContent('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 mt-4">
      <Avatar
        src={undefined}
        alt={currentUser.username}
        size={32}
      />
      <div className="flex-1 flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isAddingComment}
        />
        <button
          type="submit"
          disabled={!content.trim() || isAddingComment}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAddingComment ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
}