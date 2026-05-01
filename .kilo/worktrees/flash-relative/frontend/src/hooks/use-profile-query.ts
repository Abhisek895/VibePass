'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchProfile,
  fetchProfilePosts,
  fetchProfilePhotos,
  fetchProfileFriends,
  fetchComments,
  addComment as addCommentApi,
  createPost as createPostApi,
  togglePostReaction as togglePostReactionApi,
  updateProfile as updateProfileApi,
  uploadProfileImage as uploadProfileImageApi,
  uploadCoverImage as uploadCoverImageApi,
} from '@/services/api/profile-content.service';
import type { Profile, Post, Comment, PhotoItem, FriendPreview, PostCreateInput, EditProfileInput, ReactionType } from '@/types/profile';

const QUERY_KEYS = {
  profile: (username: string) => ['profile', username],
  profilePosts: (username: string) => ['posts', username],
  profilePhotos: (username: string) => ['photos', username],
  profileFriends: (username: string) => ['friends', username],
  comments: (postId: string) => ['comments', postId],
  reactions: (postId: string) => ['reactions', postId],
};

// Profile Queries
export function useProfileQuery(username: string) {
  return useQuery<Profile | null>({
    queryKey: QUERY_KEYS.profile(username),
    queryFn: () => fetchProfile(username),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useProfilePostsQuery(username: string) {
  return useQuery<Post[]>({
    queryKey: QUERY_KEYS.profilePosts(username),
    queryFn: () => fetchProfilePosts(username),
    enabled: !!username,
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 30,
  });
}

export function useProfilePhotosQuery(username: string) {
  return useQuery<PhotoItem[]>({
    queryKey: QUERY_KEYS.profilePhotos(username),
    queryFn: () => fetchProfilePhotos(username),
    enabled: !!username,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

export function useProfileFriendsQuery(username: string) {
  return useQuery<FriendPreview[]>({
    queryKey: QUERY_KEYS.profileFriends(username),
    queryFn: () => fetchProfileFriends(username),
    enabled: !!username,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

export function useCommentsQuery(postId: string, enabled: boolean = true) {
  return useQuery<Comment[]>({
    queryKey: QUERY_KEYS.comments(postId),
    queryFn: () => fetchComments(postId),
    enabled: enabled && !!postId,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

// Mutations
export function useCreatePostMutation(username: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PostCreateInput) =>
      createPostApi(username, input.content, input.media || [], input.privacy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profilePosts(username) });
    },
  });
}

export function useToggleReactionMutation(username: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, reactionType }: { postId: string; reactionType: ReactionType }) =>
      togglePostReactionApi(postId, reactionType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profilePosts(username) });
    },
  });
}

export function useAddCommentMutation(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, content, parentId }: { userId: string; content: string; parentId?: string }) =>
      addCommentApi(postId, userId, content, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.comments(postId) });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useUpdateProfileMutation(username: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: EditProfileInput) => updateProfileApi(username, input),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile(username) });
      if (updated) {
        queryClient.setQueryData(QUERY_KEYS.profile(username), updated);
      }
    },
  });
}

export function useUploadProfileImageMutation(username: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (url: string) => uploadProfileImageApi(username, url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile(username) });
    },
  });
}

export function useUploadCoverImageMutation(username: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (url: string) => uploadCoverImageApi(username, url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile(username) });
    },
  });
}

// Combined Hooks
export interface UseProfilePageParams {
  username: string;
}

export function useProfilePage(params: UseProfilePageParams) {
  const { username } = params;

  const profileQuery = useProfileQuery(username);
  const postsQuery = useProfilePostsQuery(username);
  const photosQuery = useProfilePhotosQuery(username);
  const friendsQuery = useProfileFriendsQuery(username);

  const createPostMutation = useCreatePostMutation(username);
  const toggleReactionMutation = useToggleReactionMutation(username);
  const updateProfileMutation = useUpdateProfileMutation(username);
  const uploadProfileImageMutation = useUploadProfileImageMutation(username);
  const uploadCoverImageMutation = useUploadCoverImageMutation(username);

  const isLoading = profileQuery.isLoading || postsQuery.isLoading;
  const error = profileQuery.error || postsQuery.error;

  return {
    // Queries
    profile: profileQuery.data,
    posts: postsQuery.data || [],
    photos: photosQuery.data || [],
    friends: friendsQuery.data || [],

    // Loading/Error States
    isLoading,
    error: error?.message || null,
    isLoadingPosts: postsQuery.isLoading,
    isLoadingPhotos: photosQuery.isLoading,
    isLoadingFriends: friendsQuery.isLoading,

    // Mutations
    createPost: createPostMutation.mutateAsync,
    toggleReaction: (postId: string, reactionType: ReactionType) =>
      toggleReactionMutation.mutate({ postId, reactionType }),
    updateProfile: updateProfileMutation.mutateAsync,
    uploadProfileImage: uploadProfileImageMutation.mutateAsync,
    uploadCoverImage: uploadCoverImageMutation.mutateAsync,

    // Mutation States
    isCreatingPost: createPostMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
  };
}
