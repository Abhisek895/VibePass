'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addComment as addCommentApi, createPost as createPostApi, fetchProfile, fetchProfilePosts, togglePostReaction } from '@/services/api/profile-content.service';
import type { Profile, Post, ReactionType } from '@/types/profile';

interface UseProfileOptions {
  username?: string;
}

interface UseProfileReturn {
  user: Profile | null | undefined;
  isLoading: boolean;
  error: Error | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  viewMode: 'owner' | 'visitor';
  isFollowing: boolean;
  setIsFollowing: (value: boolean) => void;
  friendStatus: 'none' | 'pending' | 'friends' | 'request_sent';
  setFriendStatus: (status: 'none' | 'pending' | 'friends' | 'request_sent') => void;
  createPost: (content: string, attachments: string[]) => Promise<void>;
  toggleReaction: (postId: string, reactionType: ReactionType) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
}

type UseProfileInput = string | UseProfileOptions | undefined;

export function useProfile(input?: UseProfileInput): UseProfileReturn {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [friendStatus, setFriendStatus] = useState<'none' | 'pending' | 'friends' | 'request_sent'>('none');

  const username = typeof input === 'string' ? input : input?.username;
  const viewMode = username && username !== 'current' ? 'visitor' : 'owner';

  const { data: user, isLoading: userLoading, error: userError } = useQuery<Profile | null>({
    queryKey: ['profile', username || 'current'],
    queryFn: () => fetchProfile(username || 'current'),
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ['profile-posts', user?.username || username || 'current'],
    queryFn: () => fetchProfilePosts(user?.username || username || 'current'),
    enabled: !!user?.username || !!username,
  });

  const createPost = async (content: string, attachments: string[]) => {
    await createPostApi(user?.username || username || 'current', content, attachments.map((url, index) => ({ id: `media-${Date.now()}-${index}`, type: 'image', url, alt: '' })), 'friends');
    queryClient.invalidateQueries({ queryKey: ['profile-posts', user?.username || username || 'current'] });
  };

  const toggleReaction = async (postId: string, reactionType: ReactionType) => {
    await togglePostReaction(postId, reactionType);
    queryClient.invalidateQueries({ queryKey: ['profile-posts', user?.username || username || 'current'] });
  };

  const addComment = async (postId: string, content: string) => {
    await addCommentApi(postId, user?.username || 'current', content);
    queryClient.invalidateQueries({ queryKey: ['comments', postId] });
  };

  return {
    user: user || null,
    isLoading: userLoading || postsLoading,
    error: userError || null,
    activeTab,
    setActiveTab,
    viewMode,
    isFollowing,
    setIsFollowing,
    friendStatus,
    setFriendStatus,
    createPost,
    toggleReaction,
    addComment,
  };
}
