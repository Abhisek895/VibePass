'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreatePostInput } from '@/lib/types';
import { apiRequest } from '@/services/api/client';
import { QUERY_KEYS } from '@/lib/constants';

/**
 * Hook to create a new post
 */
export const useCreatePost = (username: string | null | undefined) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: CreatePostInput) =>
      apiRequest('/api/v1/posts', {
        method: 'POST',
        auth: true,
        body: {
          content: input.content,
        },
      }),
    onSuccess: () => {
      if (username) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS(username) });
      }
    },
  });

  return {
    createPost: mutation.mutate,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
};
