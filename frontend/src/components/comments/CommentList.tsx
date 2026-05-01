"use client";

import { useComments } from '@/hooks/use-comments';
import { Avatar } from '@/components/common/Avatar';

interface CommentListProps {
  postId: string;
  currentUserId?: string;
}

export function CommentList({ postId, currentUserId }: CommentListProps) {
  const { data: comments, isLoading, error } = useComments(postId, currentUserId || '');

  if (isLoading) {
    return (
      <div className="space-y-3 mt-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
        Failed to load comments
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="mt-4 text-center text-gray-500 text-sm">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <Avatar
            src={comment.user.avatar}
            alt={comment.user.username || ''}
            size={32}
          />
          <div className="flex-1">
            <div className="bg-gray-100 rounded-lg px-3 py-2">
              <div className="font-semibold text-sm">
                {comment.user.firstName} {comment.user.lastName}
              </div>
              <p className="text-sm text-gray-700">{comment.content}</p>
            </div>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
              <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
              <button className="hover:underline">Like</button>
              <button className="hover:underline">Reply</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}