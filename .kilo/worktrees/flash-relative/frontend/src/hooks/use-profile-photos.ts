import { useQuery } from '@tanstack/react-query';
import { fetchProfilePhotos } from '@/services/api/profile-content.service';
import type { PhotoItem } from '@/types/profile';

export function useProfilePhotos(username: string) {
  const { data, ...rest } = useQuery<PhotoItem[]>({
    queryKey: ['photos', username],
    queryFn: () => fetchProfilePhotos(username),
    staleTime: 1000 * 60,
    retry: false,
  });
  return { data: data ?? [], ...rest };
}
