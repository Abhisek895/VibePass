'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ReactionType } from '@/lib/types';
import { apiRequest } from '@/services/api/client';
import { QUERY_KEYS } from '@/lib/constants';

/**
 * Hook to react to a post
 */
export const useReactToPost = (postId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (_reactionType: ReactionType) =>
      apiRequest(`/api/v1/posts/${postId}/like`, {
        method: 'POST',
        auth: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POST(postId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REACTIONS(postId) });
    },
  });

  return {
    reactToPost: mutation.mutate,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
};

/**
 * Hook to remove reaction from a post
 */
export const useRemoveReaction = (postId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      apiRequest(`/api/v1/posts/${postId}/like`, {
        method: 'POST',
        auth: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POST(postId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REACTIONS(postId) });
    },
  });

  return {
    removeReaction: mutation.mutate,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
};
