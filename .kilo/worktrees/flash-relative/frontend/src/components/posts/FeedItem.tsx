 "use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Post, REACTION_TYPES } from '@/services/api/social.service';
import { Avatar } from '@/components/common/Avatar';
import { ReactionButton } from '@/components/reactions/ReactionButton';
import { CommentList } from '@/components/comments/CommentList';
import { CommentInput } from '@/components/comments/CommentInput';
import { ShareModal } from '@/components/shares/ShareModal';
import { normalizeImageUrl } from '@/lib/image-utils';

interface FeedItemProps {
  post: Post;
  currentUserId?: string;
  onProfileClick?: (user: any) => void;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return date.toLocaleDateString();
}

function MediaGrid({ media }: { media: Post['media'] }) {
  if (!media || media.length === 0) return null;

  if (media.length === 1) {
    return (
      <div className="mt-2 rounded-lg overflow-hidden">
        <img
          src={normalizeImageUrl(media[0].url)}
          alt="Post media"
          className="w-full max-h-[500px] object-cover"
        />
      </div>
    );
  }

  return (
    <div className="mt-2 grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
      {media.slice(0, 4).map((item, index) => (
        <div key={item.id} className="relative aspect-square">
          <img
            src={normalizeImageUrl(item.url)}
            alt={`Media ${index + 1}`}
            className="w-full h-full object-cover"
          />
          {index === 3 && media.length > 4 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xl font-bold">
              +{media.length - 4}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function OriginalPostPreview({ originalPost }: { originalPost: Post['originalPost'] }) {
  if (!originalPost) return null;

  if (originalPost.isDeleted) {
    return (
      <div className="mt-3 p-4 bg-gray-100 rounded-lg border border-gray-200">
        <p className="text-gray-500 text-sm">This post is no longer available</p>
      </div>
    );
  }

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-700">
          <Image 
            src={normalizeImageUrl(originalPost.author?.profilePhotoUrl) || '/placeholder-avatar.jpg'} 
            alt={originalPost.author?.username || 'User'}
            width={32}
            height={32}
            className="object-cover"
          />
        </div>
        <span className="font-semibold text-sm">
          {originalPost.author?.firstName} {originalPost.author?.lastName}
        </span>
      </div>
      <p className="text-sm text-gray-700 line-clamp-3">
        {originalPost.content}
      </p>
      {originalPost.media && originalPost.media.length > 0 && (
        <MediaGrid media={originalPost.media} />
      )}
    </div>
  );
}

export function FeedItem({ post, currentUserId }: FeedItemProps) {
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [reactionsCount, setReactionsCount] = useState(post.reactionsCount);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [userReaction, setUserReaction] = useState(post.currentUserReaction);
  const [isLiking, setIsLiking] = useState(false);

  const isOwner = currentUserId === post.author.id;

  const handleReaction = async (reactionType: string) => {
    if (isLiking) return;
    setIsLiking(true);

    const previousReaction = userReaction;
    const wasReacted = !!userReaction;

    if (wasReacted && userReaction === reactionType) {
      setUserReaction(null);
      setReactionsCount((prev: number) => Math.max(0, prev - 1));
    } else if (wasReacted) {
      setUserReaction(reactionType);
    } else {
      setUserReaction(reactionType);
      setReactionsCount((prev: number) => prev + 1);
    }

    try {
      if (wasReacted && userReaction === reactionType) {
        await fetch(`/api/posts/${post.id}/reactions`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        });
      } else {
        await fetch(`/api/posts/${post.id}/reactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({ reactionType }),
        });
      }
    } catch (error) {
      setUserReaction(previousReaction);
      setReactionsCount((prev: number) => prev + (previousReaction ? 0 : 1));
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = () => {
    setShowComments(true);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  return (
    <>
      <article className="group bg-gradient-to-r from-slate-800/60 to-slate-900/60 backdrop-blur-xl text-white rounded-2xl shadow-2xl border border-slate-700/50 hover:border-purple-500/50 hover:shadow-purple-500/20 p-6 transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-start gap-3">
          <Link href={`/profile/${post.author.username}`}>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-700 border border-slate-600">
              <Image 
                src={normalizeImageUrl(post.author.profilePhotoUrl) || '/placeholder-avatar.jpg'} 
                alt={post.author.username}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={`/profile/${post.author.username}`}
                className="font-semibold text-white hover:text-purple-300 truncate"
              >
                {post.author.firstName} {post.author.lastName}
              </Link>
              <span className="text-slate-400 text-sm">@{post.author.username}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <span>{formatTimeAgo(post.createdAt)}</span>
              {post.visibility === 'friends' && <span>• Friends</span>}
              {post.visibility === 'private' && <span>• Private</span>}
              {post.feeling && <span>• feeling {post.feeling}</span>}
            </div>
          </div>
        </div>

        {post.isShare && (
          <div className="mt-2">
            <p className="text-gray-900 font-medium">{post.shareCaption}</p>
          </div>
        )}

        <div className="mt-2">
          {post.backgroundColor && post.backgroundColor !== 'transparent' ? (
            <div
              className="p-4 rounded-lg text-white"
              style={{ backgroundColor: post.backgroundColor }}
            >
              <p className="text-lg">{post.content}</p>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{post.content}</p>
          )}
        </div>

        <MediaGrid media={post.media} />

        {post.isShare && <OriginalPostPreview originalPost={post.originalPost} />}

        <div className="mt-3 flex items-center justify-between text-gray-500 text-sm">
          <div className="flex items-center gap-1">
            {reactionsCount > 0 && (
              <>
                <span>👍❤️</span>
                <span>{reactionsCount}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {commentsCount > 0 && (
              <button
                onClick={() => setShowComments(!showComments)}
                className="hover:underline"
              >
                {commentsCount} comments
              </button>
            )}
            {post.sharesCount > 0 && (
              <span>{post.sharesCount} shares</span>
            )}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-around">
          <ReactionButton
            currentReaction={userReaction}
            onReaction={handleReaction}
            count={reactionsCount}
          />
          <button
            onClick={handleComment}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Comment</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>Share</span>
          </button>
        </div>

        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <CommentInput postId={post.id} />
            <CommentList postId={post.id} />
          </div>
        )}
      </article>

      {showShareModal && (
        <ShareModal
          post={post}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
}

