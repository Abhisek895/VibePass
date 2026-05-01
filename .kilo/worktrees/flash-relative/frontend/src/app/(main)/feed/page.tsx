"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, getApiErrorMessage } from '@/services/api';
import { useAuth } from '@/store/auth';
import { useCurrentUser } from '@/hooks/use-current-user';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { RightSidebar } from '@/components/layout/RightSidebar';

type BackendUser = {
  id: string;
  username: string | null;
  profile?: {
    profilePhotoUrl?: string | null;
  } | null;
};

type BackendComment = {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  user: BackendUser;
};

type BackendLike = {
  id: string;
  userId: string;
};

type BackendPost = {
  id: string;
  content: string;
  imageUrl?: string | null;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: BackendUser;
  likes?: BackendLike[];
  comments?: BackendComment[];
};

type FeedResponse = {
  posts: BackendPost[];
  nextCursor: string | null;
};

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return date.toLocaleDateString();
}

export default function FeedPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: currentUser, isLoading: currentUserLoading } = useCurrentUser();

  const [posts, setPosts] = useState<BackendPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [errorMsg, setErrorMsg] = useState('');

  const loadFeed = useCallback(async (cursor?: string, append = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoadingFeed(true);
    }

    try {
      const params = new URLSearchParams();
      params.set('limit', '10');
      if (cursor) {
        params.set('cursor', cursor);
      }

      const response = await apiRequest<FeedResponse>(
        `/api/v1/posts/feed?${params.toString()}`,
        { auth: true },
      );

      setPosts(previous =>
        append ? [...previous, ...response.posts] : response.posts,
      );
      setNextCursor(response.nextCursor);
      setErrorMsg('');
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error, 'Unable to load the feed.'));
      if (!append) {
        setPosts([]);
      }
    } finally {
      setIsLoadingFeed(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || currentUserLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    void loadFeed();
  }, [
    authLoading,
    currentUserLoading,
    isAuthenticated,
    loadFeed,
    router,
  ]);

  const currentUserId = currentUser?.id;
  const openProfile = (username?: string | null) => {
    if (!username) {
      return;
    }

    router.push(`/profile/${username}`);
  };

  const postsWithViewerState = useMemo(
    () =>
      posts.map(post => ({
        ...post,
        isLikedByCurrentUser: post.likes?.some(like => like.userId === currentUserId) ?? false,
      })),
    [currentUserId, posts],
  );

  const handleCreatePost = async () => {
    if (!postContent.trim() && !postImageUrl.trim()) {
      return;
    }

    setIsSubmittingPost(true);
    setErrorMsg('');

    try {
      const createdPost = await apiRequest<BackendPost>('/api/v1/posts', {
        method: 'POST',
        auth: true,
        body: {
          content: postContent.trim(),
          imageUrl: postImageUrl.trim() || undefined,
        },
      });

      setPosts(prev => [createdPost, ...prev]);
      setPostContent('');
      setPostImageUrl('');
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error, 'Unable to create your post.'));
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    try {
      const response = await apiRequest<{ liked: boolean }>(
        `/api/v1/posts/${postId}/like`,
        {
          method: 'POST',
          auth: true,
        },
      );

      setPosts(prev =>
        prev.map(post => {
          if (post.id !== postId || !currentUserId) {
            return post;
          }

          const alreadyLiked = post.likes?.some(like => like.userId === currentUserId);
          const likes = post.likes ? [...post.likes] : [];

          if (response.liked && !alreadyLiked) {
            likes.push({
              id: `optimistic-like-${postId}-${currentUserId}`,
              userId: currentUserId,
            });
          }

          if (!response.liked && alreadyLiked) {
            return {
              ...post,
              likesCount: Math.max(0, post.likesCount - 1),
              likes: likes.filter(like => like.userId !== currentUserId),
            };
          }

          return {
            ...post,
            likesCount: response.liked ? post.likesCount + 1 : post.likesCount,
            likes,
          };
        }),
      );
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error, 'Unable to update the reaction.'));
    }
  };

  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();

    if (!content) {
      return;
    }

    try {
      const comment = await apiRequest<BackendComment>(
        `/api/v1/posts/${postId}/comments`,
        {
          method: 'POST',
          auth: true,
          body: { content },
        },
      );

      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? {
              ...post,
              commentsCount: post.commentsCount + 1,
              comments: [comment, ...(post.comments || [])].slice(0, 5),
            }
            : post,
        ),
      );
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      setExpandedComments(prev => ({ ...prev, [postId]: true }));
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error, 'Unable to add your comment.'));
    }
  };

  const handleShare = async (postId: string) => {
    try {
      await apiRequest(`/api/v1/posts/${postId}/share`, {
        method: 'POST',
        auth: true,
      });

      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? { ...post, sharesCount: post.sharesCount + 1 }
            : post,
        ),
      );
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error, 'Unable to share this post.'));
    }
  };

  if (authLoading || currentUserLoading || isLoadingFeed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[rgb(var(--accent-primary))]" />
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-[#0B141B] overflow-hidden">
      {/* Immersive Header */}
      <header className="px-5 py-5 bg-[#202C33]/80 backdrop-blur-xl border-b border-white/10 z-20">
        <h1 className="text-2xl font-black tracking-tight text-white">Feed</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 no-scrollbar relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-[280px_1fr_340px] gap-6 lg:gap-8">
            <LeftSidebar currentUserUsername={currentUser.username} />

            <div className="lg:col-span-2 xl:col-span-1 flex flex-col">
              <section className="bg-[#202C33]/50 backdrop-blur-xl rounded-3xl p-6 border border-white/5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] flex items-center justify-center text-white font-semibold">
                    {currentUser.username[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 space-y-3">
                    <textarea
                      value={postContent}
                      onChange={event => setPostContent(event.target.value)}
                      placeholder={`What's on your mind, ${currentUser.displayName}?`}
                      rows={4}
                      className="w-full rounded-2xl border border-[rgba(var(--border-subtle),0.12)] bg-[rgb(var(--bg-primary),0.65)] px-4 py-3 text-[rgb(var(--text-primary))] outline-none resize-none focus:border-[rgb(var(--accent-primary))]"
                    />
                    <input
                      type="url"
                      value={postImageUrl}
                      onChange={event => setPostImageUrl(event.target.value)}
                      placeholder="Optional image URL"
                      className="w-full rounded-2xl border border-[rgba(var(--border-subtle),0.12)] bg-[rgb(var(--bg-primary),0.65)] px-4 py-3 text-[rgb(var(--text-primary))] outline-none focus:border-[rgb(var(--accent-primary))]"
                    />
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-[rgb(var(--text-secondary))]">
                        Text posts work instantly. Add an image URL if you want media in the feed.
                      </p>
                      <button
                        onClick={() => void handleCreatePost()}
                        disabled={isSubmittingPost}
                        className="btn-primary disabled:opacity-50"
                      >
                        {isSubmittingPost ? 'Posting...' : 'Post'}
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {errorMsg && (
                <div className="mt-4 rounded-2xl border border-[rgb(var(--warning),0.25)] bg-[rgb(var(--warning),0.08)] px-4 py-3 text-sm text-[rgb(var(--warning))]">
                  {errorMsg}
                </div>
              )}

              <div className="flex-1 space-y-6 mt-6 pr-2 -mr-2 lg:max-h-screen lg:overflow-y-auto lg:custom-scrollbar pb-20">
                {postsWithViewerState.map(post => (
                  <article
                    key={post.id}
                    className="bg-gradient-to-r from-slate-800/60 to-slate-900/60 backdrop-blur-xl text-white rounded-2xl shadow-2xl border border-slate-700/50 p-6"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => openProfile(post.user.username)}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] flex items-center justify-center text-sm font-semibold"
                      >
                        {post.user.username?.[0]?.toUpperCase() || '?'}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openProfile(post.user.username)}
                            className="font-semibold hover:text-[rgb(var(--accent-primary))] transition-colors"
                          >
                            {post.user.username || 'VibePass User'}
                          </button>
                          <span className="text-xs text-[rgb(var(--text-muted))]">
                            {formatTimeAgo(post.createdAt)}
                          </span>
                        </div>
                        <p className="mt-3 whitespace-pre-wrap text-[rgb(var(--text-primary))]">
                          {post.content}
                        </p>
                        {post.imageUrl && (
                          <img
                            src={post.imageUrl}
                            alt="Post"
                            className="mt-4 w-full rounded-2xl max-h-[440px] object-cover border border-slate-700/40"
                          />
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm text-[rgb(var(--text-secondary))]">
                      <span>{post.likesCount} likes</span>
                      <span>{post.commentsCount} comments</span>
                      <span>{post.sharesCount} shares</span>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <button
                        onClick={() => void handleToggleLike(post.id)}
                        className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${post.isLikedByCurrentUser
                          ? 'bg-[rgb(var(--accent-primary),0.18)] text-[rgb(var(--accent-primary))]'
                          : 'bg-[rgb(var(--bg-primary),0.55)] text-[rgb(var(--text-secondary))] hover:text-white'
                          }`}
                      >
                        {post.isLikedByCurrentUser ? 'Liked' : 'Like'}
                      </button>
                      <button
                        onClick={() =>
                          setExpandedComments(prev => ({
                            ...prev,
                            [post.id]: !prev[post.id],
                          }))
                        }
                        className="rounded-xl px-4 py-2 text-sm font-medium bg-[rgb(var(--bg-primary),0.55)] text-[rgb(var(--text-secondary))] hover:text-white transition-all"
                      >
                        Comment
                      </button>
                      <button
                        onClick={() => void handleShare(post.id)}
                        className="rounded-xl px-4 py-2 text-sm font-medium bg-[rgb(var(--bg-primary),0.55)] text-[rgb(var(--text-secondary))] hover:text-white transition-all"
                      >
                        Share
                      </button>
                    </div>

                    {(expandedComments[post.id] || (post.comments?.length ?? 0) > 0) && (
                      <div className="mt-4 space-y-3">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={commentInputs[post.id] || ''}
                            onChange={event =>
                              setCommentInputs(prev => ({
                                ...prev,
                                [post.id]: event.target.value,
                              }))
                            }
                            placeholder="Write a comment..."
                            className="flex-1 rounded-xl border border-[rgba(var(--border-subtle),0.12)] bg-[rgb(var(--bg-primary),0.65)] px-4 py-2 text-sm outline-none focus:border-[rgb(var(--accent-primary))]"
                          />
                          <button
                            onClick={() => void handleAddComment(post.id)}
                            className="btn-secondary text-sm"
                          >
                            Post
                          </button>
                        </div>

                        <div className="space-y-3">
                          {(post.comments || []).map(comment => (
                            <div
                              key={comment.id}
                              className="rounded-2xl bg-[rgb(var(--bg-primary),0.45)] px-4 py-3 border border-slate-700/30"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <p className="font-medium text-sm">
                                  {comment.user.username || 'VibePass User'}
                                </p>
                                <span className="text-xs text-[rgb(var(--text-muted))]">
                                  {formatTimeAgo(comment.createdAt)}
                                </span>
                              </div>
                              <p className="mt-2 text-sm text-[rgb(var(--text-secondary))]">
                                {comment.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                ))}

                {posts.length === 0 && (
                  <div className="rounded-2xl border border-slate-700/40 bg-slate-900/60 px-6 py-12 text-center text-[rgb(var(--text-secondary))]">
                    No posts yet. Create the first one and the feed will come alive.
                  </div>
                )}

                {nextCursor && (
                  <button
                    onClick={() => void loadFeed(nextCursor, true)}
                    disabled={isLoadingMore}
                    className="w-full py-4 bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl text-slate-200 font-semibold hover:border-purple-500 hover:text-white transition-all text-lg shadow-xl hover:shadow-purple-500/10 sticky bottom-4 z-10 mx-auto max-w-md"
                  >
                    {isLoadingMore ? 'Loading...' : 'Load more'}
                  </button>
                )}
              </div>
              <RightSidebar />
            </div>
          </div>
      </main>
    </div>
  );
}
