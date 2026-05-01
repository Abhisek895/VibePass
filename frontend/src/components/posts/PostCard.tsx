'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Post, ReactionType } from '@/lib/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/button';
import { ReactionBar } from '@/components/reactions/ReactionBar';
import { formatTimeAgo } from '@/lib/date-utils';

interface PostCardProps {
  post: Post;
  onReact?: (reactionType: ReactionType) => void;
  onComment?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  isOwnPost?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onReact,
  onComment,
  onShare,
  onDelete,
  isOwnPost,
}) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const totalReactions = Object.values(post.reactionsCount).reduce((a, b) => a + b, 0) - (post.reactionsCount.userReaction ? 1 : 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-4">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          <Avatar src={post.author.profileImage} alt={post.author.firstName || post.author.username} size="md" />
          <div>
            <p className="font-semibold text-gray-900">
              {post.author.firstName} {post.author.lastName}
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              {formatTimeAgo(post.createdAt)}
              <span>•</span>
              <span>{post.privacy === 'PUBLIC' ? '🌍' : post.privacy === 'FRIENDS' ? '👥' : '🔒'}</span>
            </p>
          </div>
        </div>

        {isOwnPost && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              ⋯
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">Edit</button>
                <button
                  onClick={onDelete}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-gray-900 text-base leading-relaxed">{post.content}</p>
      </div>

      {/* Media */}
      {post.media.length > 0 && (
        <div className="px-4 pb-4">
          {post.media.length === 1 ? (
            <div className="relative w-full pt-[66%] rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={post.media[0].url}
                alt="Post media"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {post.media.map((media, idx) => (
                <div
                  key={idx}
                  className="relative w-full pt-[100%] rounded-lg overflow-hidden bg-gray-100"
                >
                  <Image src={media.url} alt="Post media" fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reactions Summary */}
      {totalReactions > 0 && (
        <div className="px-4 py-2 border-t border-b border-gray-100 text-sm text-gray-600 flex items-center gap-2">
          {Object.entries(post.reactionsCount)
            .filter(([key, count]) => count > 0 && key !== 'userReaction')
            .slice(0, 3)
            .map(([type, count]) => (
              <span key={type} className="text-lg">
                {type === 'LIKE' && '👍'}
                {type === 'LOVE' && '❤️'}
                {type === 'CARE' && '🤍'}
                {type === 'HAHA' && '😂'}
                {type === 'WOW' && '😮'}
                {type === 'SAD' && '😢'}
                {type === 'ANGRY' && '😠'}
              </span>
            ))}
          <span className="ml-2">{totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}</span>
        </div>
      )}

      {/* Stats */}
      <div className="px-4 py-2 border-b border-gray-100 text-sm text-gray-600 flex gap-4 justify-between">
        <span>{totalReactions} Reactions</span>
        <span>{post.commentsCount} Comments</span>
        <span>{post.sharesCount} Shares</span>
      </div>

      {/* Actions */}
      <div className="p-2 flex gap-1 relative">
        <div className="flex-1 relative">
          <button
            onMouseEnter={() => setShowReactionPicker(true)}
            onMouseLeave={() => setShowReactionPicker(false)}
            className="w-full py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            👍 React
          </button>
          {showReactionPicker && (
            <ReactionBar
              onReact={(type) => {
                onReact?.(type);
                setShowReactionPicker(false);
              }}
              className="absolute bottom-full left-0 mb-2"
            />
          )}
        </div>

        <button
          onClick={onComment}
          className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          💬 Comment
        </button>

        <button
          onClick={onShare}
          className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          📤 Share
        </button>
      </div>
    </div>
  );
};
