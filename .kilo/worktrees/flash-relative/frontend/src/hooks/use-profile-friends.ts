import { useQuery } from '@tanstack/react-query';
import { fetchProfileFriends } from '@/services/api/profile-content.service';
import type { FriendPreview } from '@/types/profile';

export function useProfileFriends(username: string) {
  const { data, ...rest } = useQuery<FriendPreview[]>({
    queryKey: ['friends', username],
    queryFn: () => fetchProfileFriends(username),
    staleTime: 1000 * 60,
    retry: false,
  });
  return { data: data ?? [], ...rest };
}
