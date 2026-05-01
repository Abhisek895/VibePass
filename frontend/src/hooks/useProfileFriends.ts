'use client';

import { useQuery } from '@tanstack/react-query';
import { FriendPreview } from '@/lib/types';
import { profileService } from '@/services/api/profiles.service';
import { QUERY_KEYS, PAGINATION_LIMITS } from '@/lib/constants';

/**
 * Hook to fetch profile friends
 */
export const useProfileFriends = (username: string | null | undefined, page: number = 1) => {
  const query = useQuery({
    queryKey: QUERY_KEYS.FRIENDS(username || '', page),
    queryFn: async () => {
      if (!username) throw new Error('Username is required');
      const response = await profileService.getUserFriends(username, page, PAGINATION_LIMITS.FRIENDS);
      return response.friends;
    },
    enabled: !!username,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    friends: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    hasMore: (query.data?.length || 0) >= PAGINATION_LIMITS.FRIENDS,
  };
};
