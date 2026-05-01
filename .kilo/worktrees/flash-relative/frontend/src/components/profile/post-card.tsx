'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Post, User } from '@/types/profile';
import { SharedPostCard } from './shared-post-card';
import { ReactionsBar } from './reactions-bar';
import { CommentsSection } from './comments-section';
import { useComments } from '@/hooks/use-comments';

interface PostCardProps {
  post: Post;
  currentUser: User;
  onReact: (postId: string, reactionType: string) => void;
}

export function PostCard({ post, currentUser, onReact }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const commentsQuery = useComments(post.id, currentUser.id);
  const comments = commentsQuery.data ?? post.comments;

  if (post.isShared) {
    return <SharedPostCard post={post} />;
  }

  return (
    <article className="rounded-[32px] border border-white/10 bg-[rgb(var(--bg-secondary))] shadow-2xl overflow-hidden">
      <div className="px-5 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Image src={post.user.avatar} alt={post.user.fullName} width={48} height={48} className="rounded-full object-cover" unoptimized />
            <div>
              <p className="font-semibold text-white">{post.user.fullName}</p>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">{post.createdAt} · {post.privacy}</p>
            </div>
          </div>
          <button className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-white/5 text-slate-300 transition hover:bg-white/10">
            <span className="text-xl">⋯</span>
          </button>
        </div>
        {post.content && <p className="mt-4 text-slate-300 leading-7">{post.content}</p>}
      </div>

      {post.media.length > 0 && (
        <div className="grid gap-1 sm:grid-cols-2">
          {post.media.map((item) => (
            <div key={item.id} className="relative aspect-[4/3] overflow-hidden bg-slate-900">
              <Image src={item.url} alt={item.alt} fill className="object-cover" unoptimized />
            </div>
          ))}
        </div>
      )}

      <div className="px-5 py-4">
        <ReactionsBar
          reactions={post.reactions}
          commentsCount={post.commentsCount}
          sharesCount={post.sharesCount}
          onReactionClick={(reactionType) => onReact(post.id, reactionType)}
          onCommentClick={() => setShowComments((current) => !current)}
          onShareClick={() => undefined}
        />

        {showComments && (
          <CommentsSection
            comments={comments}
            currentUserAvatar={currentUser.avatar || ''}
            onAddComment={commentsQuery.addComment}
          />
        )}
      </div>
    </article>
  );
}
