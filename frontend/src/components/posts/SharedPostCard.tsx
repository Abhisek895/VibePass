'use client';

import React from 'react';
import Image from 'next/image';
import { Post, ReactionType } from '@/lib/types';
import { Avatar } from '@/components/ui/Avatar';
import { PostCard } from './PostCard';

interface SharedPostCardProps {
  post: Post;
  onReact?: (reactionType: ReactionType) => void;
  onComment?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  isOwnPost?: boolean;
}

export const SharedPostCard: React.FC<SharedPostCardProps> = ({
  post,
  onReact,
  onComment,
  onShare,
  onDelete,
  isOwnPost,
}) => {
  if (!post.originalPost) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center">
        <p className="text-gray-600">This post is no longer available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-4">
      {/* Shared Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3">
          <Avatar src={post.sharedBy?.profileImage} alt={post.sharedBy?.firstName || 'User'} size="sm" />
          <div>
            <p className="font-semibold text-gray-900 text-sm">
              {post.sharedBy?.firstName} {post.sharedBy?.lastName}
            </p>
            <p className="text-xs text-gray-600">shared a post</p>
          </div>
        </div>
        {post.sharedCaption && <p className="text-sm text-gray-700 mt-2">{post.sharedCaption}</p>}
      </div>

      {/* Original Post */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3 mb-3">
          <Avatar
            src={post.originalPost.author.profileImage}
            alt={post.originalPost.author.firstName || post.originalPost.author.username}
            size="md"
          />
          <div>
            <p className="font-semibold text-gray-900">
              {post.originalPost.author.firstName} {post.originalPost.author.lastName}
            </p>
            <p className="text-xs text-gray-600">
              {new Date(post.originalPost.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <p className="text-gray-900 text-sm mb-3">{post.originalPost.content}</p>

        {post.originalPost.media.length > 0 && (
          <div className="relative w-full pt-[66%] rounded-lg overflow-hidden bg-gray-200">
            <Image
              src={post.originalPost.media[0].url}
              alt="Shared post media"
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>

      {/* Engagement Stats */}
      <div className="px-4 py-2 border-b border-gray-100 text-sm text-gray-600 flex gap-4 justify-between">
        <span>{post.reactionsCount.LIKE} Likes</span>
        <span>{post.commentsCount} Comments</span>
      </div>

      {/* Actions */}
      <div className="p-2 flex gap-1">
        <button className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm">
          👍 Like
        </button>
        <button onClick={onComment} className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm">
          💬 Comment
        </button>
        <button onClick={onShare} className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm">
          📤 Share
        </button>
      </div>
    </div>
  );
};
