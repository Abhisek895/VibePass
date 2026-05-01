'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Post } from '@/lib/types/profile';
import { MoreHorizontal, Globe, Users, Lock, Repeat2 } from 'lucide-react';
import { ReactionBar } from './reaction-bar';
import { CommentSection } from './comment-section';
import { MediaGrid } from './media-grid';

interface PostCardProps {
  post: Post;
}

const privacyIcons = {
  public: <Globe className="w-3 h-3" />,
  friends: <Users className="w-3 h-3" />,
  private: <Lock className="w-3 h-3" />,
};

export function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);

  // Handle shared posts
  if (post.isShared && post.originalPost) {
    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Shared post header */}
        {post.sharedBy && (
          <div className="px-4 pt-3 flex items-center gap-2 text-sm text-gray-500">
            <Repeat2 className="w-4 h-4" />
            <span>
              <span className="font-semibold text-gray-900">{post.sharedBy.fullName}</span> shared a post
            </span>
          </div>
        )}
        
        {post.shareCaption && (
          <p className="px-4 py-2 text-gray-700">{post.shareCaption}</p>
        )}
        
        {/* Original post */}
        <div className="mx-4 mb-4 border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-3 bg-gray-50">
            <div className="flex items-center gap-2">
              <Image
                src={post.originalPost.author.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=32&h=32'}
                alt={post.originalPost.author.fullName}
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="font-semibold text-sm">{post.originalPost.author.fullName}</span>
            </div>
            <p className="mt-2 text-sm text-gray-700">{post.originalPost.content}</p>
          </div>
          
          {post.originalPost.media.length > 0 && (
            <MediaGrid media={post.originalPost.media} />
          )}
        </div>
        
        <div className="px-4 pb-4">
          <ReactionBar
            reactions={post.reactions}
            commentsCount={post.commentsCount}
            sharesCount={post.sharesCount}
            onToggleComments={() => setShowComments(!showComments)}
          />
          
          {showComments && <CommentSection postId={post.id} />}
        </div>
      </div>
    );
  }

  // Original post
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <Image
              src={post.author.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=40&h=40'}
              alt={post.author.fullName}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            
            <div>
              <a href={`/profile/${post.author.username}`} className="font-semibold text-gray-900 hover:underline">
                {post.author.fullName}
              </a>
              
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>{post.createdAt}</span>
                <span>·</span>
                {privacyIcons[post.privacy]}
              </div>
            </div>
          </div>
          
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreHorizontal className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {post.content && (
          <p className="mt-3 text-gray-700 whitespace-pre-wrap">{post.content}</p>
        )}
      </div>

      {post.media.length > 0 && <MediaGrid media={post.media} />}

      <div className="px-4 pb-4">
        <ReactionBar
          reactions={post.reactions}
          commentsCount={post.commentsCount}
          sharesCount={post.sharesCount}
          onToggleComments={() => setShowComments(!showComments)}
        />

        {showComments && <CommentSection postId={post.id} />}
      </div>
    </div>
  );
}
