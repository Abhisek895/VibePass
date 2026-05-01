'use client';

import { useQuery } from '@tanstack/react-query';
import { Post } from '@/lib/types';
import { postsService } from '@/services/api/posts-crud.service';
import { QUERY_KEYS, PAGINATION_LIMITS } from '@/lib/constants';

/**
 * Hook to fetch profile posts
 */
export const useProfilePosts = (username: string | null | undefined, page: number = 1) => {
  const query = useQuery({
    queryKey: QUERY_KEYS.POSTS(username || '', page),
    queryFn: async () => {
      if (!username) throw new Error('Username is required');
      const response = await postsService.getUserPosts(username, page, PAGINATION_LIMITS.POSTS);
      return response.posts;
    },
    enabled: !!username,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  return {
    posts: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    hasMore: (query.data?.length || 0) >= PAGINATION_LIMITS.POSTS,
  };
};
