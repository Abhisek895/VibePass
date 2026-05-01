'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import type { Post, User, ReactionType } from '@/types/profile';
import { formatDate, formatNumber } from '@/lib/profile-utils';
import { REACTION_EMOJIS, PRIVACY_ICONS } from '@/lib/profile-constants';

interface PostCardProps {
  post: Post;
  currentUser: User;
  onReaction?: (postId: string, reactionType: ReactionType) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

export function PostCard({ post, currentUser, onReaction, onComment, onShare }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);

  const totalReactions = post.reactions?.reduce((sum, r) => sum + r.count, 0) || 0;
  const userReaction = post.reactions?.find((r) => r.reacted);

  return (
    <article className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Post Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {post.user.avatar ? (
              <Image
                src={post.user.avatar}
                alt={post.user.fullName}
                width={44}
                height={44}
                className="w-11 h-11 rounded-full object-cover"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                {post.user.firstName[0]}{post.user.lastName[0]}
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{post.user.fullName}</h3>
                {post.user.headline && <span className="text-sm text-gray-600">·{post.user.headline}</span>}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <time>{formatDate(post.createdAt)}</time>
                <span>·</span>
                <span>{PRIVACY_ICONS[post.privacy]}</span>
              </div>
            </div>
          </div>

          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Shared Post Info */}
        {post.isShared && post.sharedBy && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            Shared by <span className="font-semibold text-gray-900">{post.sharedBy.fullName}</span>
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="px-4 sm:px-6 py-4">
        <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{post.content}</p>

        {/* Post Media */}
        {post.media && post.media.length > 0 && (
          <div className={`mt-4 grid gap-2 rounded-xl overflow-hidden ${post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {post.media.map((media, idx) => (
              <div key={media.id} className="relative bg-gray-100 min-h-64 sm:min-h-80">
                <Image
                  src={media.url}
                  alt={media.alt || `Post media ${idx + 1}`}
                  fill
                  className="object-cover hover:opacity-90 transition-opacity cursor-pointer"
                />
              </div>
            ))}
          </div>
        )}

        {/* Original Post (for shared posts) */}
        {post.isShared && post.originalPost && (
          <div className="mt-4 p-4 border border-gray-200 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              {post.originalPost.user.avatar && (
                <Image
                  src={post.originalPost.user.avatar}
                  alt={post.originalPost.user.fullName}
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-semibold text-sm text-gray-900">{post.originalPost.user.fullName}</p>
                <p className="text-xs text-gray-600">{formatDate(post.originalPost.createdAt)}</p>
              </div>
            </div>
            <p className="text-gray-700 text-sm line-clamp-3">{post.originalPost.content}</p>
          </div>
        )}
      </div>

      {/* Reactions Bar */}
      {totalReactions > 0 && (
        <div className="px-4 sm:px-6 py-3 border-b border-gray-100 flex gap-2">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            {post.reactions?.slice(0, 3).map((reaction) => (
              <span key={reaction.type} className="text-lg">
                {REACTION_EMOJIS[reaction.type]}
              </span>
            ))}
            <span className="text-sm text-gray-600">{formatNumber(totalReactions)}</span>
          </div>
          <div className="ml-auto flex gap-4 text-sm text-gray-600">
            {post.commentsCount > 0 && <button className="hover:text-blue-600">{formatNumber(post.commentsCount)} comments</button>}
            {post.sharesCount > 0 && <button className="hover:text-blue-600">{formatNumber(post.sharesCount)} shares</button>}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 sm:px-6 py-3 flex items-center gap-1 text-gray-600">
        <button
          onClick={() => onReaction?.(post.id, userReaction?.type || 'like')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors ${
            userReaction ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-100'
          }`}
        >
          <Heart className={`w-5 h-5 ${userReaction ? 'fill-current' : ''}`} />
          <span className="hidden sm:inline">{userReaction ? userReaction.type : 'Like'}</span>
        </button>

        <button
          onClick={() => {
            setShowComments(!showComments);
            onComment?.(post.id);
          }}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="hidden sm:inline">Comment</span>
        </button>

        <button
          onClick={() => onShare?.(post.id)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          <Share2 className="w-5 h-5" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100 px-4 sm:px-6 py-4 bg-gray-50">
          <div className="space-y-3">
            {post.comments && post.comments.length > 0
              ? post.comments.slice(0, 2).map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    {comment.user.avatar ? (
                      <Image
                        src={comment.user.avatar}
                        alt={comment.user.fullName}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="bg-white rounded-lg p-2 sm:p-3">
                        <p className="font-semibold text-sm text-gray-900">{comment.user.fullName}</p>
                        <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 ml-2">
                        {formatDate(comment.createdAt)} · <button className="hover:underline">Like</button>
                      </p>
                    </div>
                  </div>
                ))
              : <p className="text-center text-gray-600 text-sm">No comments yet</p>}

            {post.commentsCount > 2 && (
              <button className="text-sm text-blue-600 font-medium hover:underline">
                Load {post.commentsCount - 2} more comments
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
