'use client';

import Image from 'next/image';
import { Post, User } from '@/types/profile';
import { MoreHorizontal, Repeat2, Globe, Users, Lock } from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils';

const privacyIcons = {
  public: <Globe className="w-3 h-3" />, 
  friends: <Users className="w-3 h-3" />,
  private: <Lock className="w-3 h-3" />,
};

interface SharedPostCardProps {
  post: Post;
}

export function SharedPostCard({ post }: SharedPostCardProps) {
  if (!post.originalPost) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[rgb(var(--bg-secondary))] p-4 text-sm text-slate-400">
        This content is no longer available.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-[rgb(var(--bg-secondary))]">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <Image src={post.sharedBy?.avatar ?? ''} alt={post.sharedBy?.fullName ?? 'Shared post'} width={36} height={36} className="rounded-full object-cover" unoptimized />
          <div>
            <p className="text-sm font-semibold text-white">{post.sharedBy?.fullName}</p>
            <p className="text-xs text-slate-400">Shared a post</p>
          </div>
        </div>
        <button className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-slate-300 hover:bg-white/10 transition">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4">
        {post.content && <p className="text-sm text-slate-300">{post.content}</p>}
        <div className="mt-4 rounded-3xl bg-[rgb(var(--bg-primary))] p-4">
          <div className="flex items-center gap-3">
            <Image src={post.originalPost.user.avatar} alt={post.originalPost.user.fullName} width={34} height={34} className="rounded-full object-cover" unoptimized />
            <div>
              <p className="text-sm font-semibold text-white">{post.originalPost.user.fullName}</p>
              <p className="text-xs text-slate-400">{formatRelativeDate(post.originalPost.createdAt)} · {privacyIcons[post.originalPost.privacy]}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-300">{post.originalPost.content}</p>
          {post.originalPost.media.length > 0 && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {post.originalPost.media.map((item) => (
                <div key={item.id} className="overflow-hidden rounded-3xl bg-white/5">
                  <Image src={item.url} alt={item.alt} width={600} height={360} className="h-48 w-full object-cover" unoptimized />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
