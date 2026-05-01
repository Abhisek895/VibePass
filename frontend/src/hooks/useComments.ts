'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Comment, CreateCommentInput } from '@/lib/types';
import { apiRequest } from '@/services/api/client';
import { QUERY_KEYS } from '@/lib/constants';

/**
 * Hook to fetch comments for a post
 */
export const useComments = (postId: string | null | undefined, page: number = 1) => {
  const query = useQuery({
    queryKey: QUERY_KEYS.COMMENTS(postId || '', page),
    queryFn: async () => {
      if (!postId) throw new Error('Post ID is required');
      const response = await apiRequest<{ comments: Comment[] }>(
        `/api/v1/posts/${postId}/comments?limit=20`,
      );
      return response.comments;
    },
    enabled: !!postId,
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    comments: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Hook to create a comment
 */
export const useCreateComment = (postId: string | null | undefined) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: CreateCommentInput) => {
      if (!postId) throw new Error('Post ID is required');
      return apiRequest<Comment>(`/api/v1/posts/${postId}/comments`, {
        method: 'POST',
        auth: true,
        body: {
          content: input.content,
        },
      });
    },
    onSuccess: () => {
      if (postId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMMENTS(postId) });
      }
    },
  });

  return {
    createComment: mutation.mutate,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
};
