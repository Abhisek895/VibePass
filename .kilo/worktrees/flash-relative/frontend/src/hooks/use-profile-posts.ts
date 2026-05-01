import { useQuery } from '@tanstack/react-query';
import { fetchProfilePosts } from '@/services/api/profile-content.service';
import type { Post } from '@/types/profile';

export function useProfilePosts(username: string) {
  return useQuery<Post[]>({
    queryKey: ['posts', username],
    queryFn: () => fetchProfilePosts(username),
    staleTime: 1000 * 30,
    retry: false,
  });
}
