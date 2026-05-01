'use client';

import React, { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/button';
import { formatTimeAgo } from '@/lib/date-utils';
import { Comment } from '@/types/profile';

interface CommentItemProps {
  comment: Comment;
  onReply?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  isOwnComment?: boolean;
  isLoading?: boolean;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onReply,
  onDelete,
  onEdit,
  isOwnComment,
  isLoading,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex gap-3 py-3">
      <Avatar src={comment.user.avatar} alt={comment.user.firstName} size="sm" />

      <div className="flex-1">
        {/* Comment Header */}
        <div className="bg-gray-100 rounded-lg p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-sm text-gray-900">
                {comment.user.firstName} {comment.user.lastName}
              </p>
              <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
            </div>

            {isOwnComment && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="text-gray-600 hover:text-gray-900 p-1"
                >
                  ⋯
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[100px]">
                    <button
                      onClick={onEdit}
                      className="block w-full text-left px-3 py-1.5 hover:bg-gray-50 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={onDelete}
                      className="block w-full text-left px-3 py-1.5 hover:bg-gray-50 text-xs text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Comment Actions */}
        <div className="flex gap-4 mt-2 text-xs font-medium text-gray-600">
          <button onClick={onReply} className="hover:text-gray-900">
            Reply
          </button>
          <span>{formatTimeAgo(comment.createdAt)}</span>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((reply: any) => (
              <div key={reply.id} className="flex gap-3 ml-0 md:ml-6">
                <Avatar src={reply.user?.avatar || reply.avatar} alt={reply.user?.firstName || reply.firstName} size="xs" />
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg p-2">
                    <p className="font-semibold text-xs text-gray-900">
                      {reply.user?.firstName || reply.firstName} {reply.user?.lastName || reply.lastName}
                    </p>
                    <p className="text-gray-700 text-xs mt-1">{reply.content}</p>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 ml-1">{formatTimeAgo(reply.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
