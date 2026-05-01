import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/api/admin.service';
import { AdminPostsResponse, AdminActionResponse, DeletePostPayload } from '@/lib/types/admin';

export const ADMIN_CONTENT_KEY = 'admin-content';

interface UseAdminContentOptions {
  search?: string;
  darkMeme?: boolean;
  limit?: number;
  offset?: number;
}

export function useAdminContent(options: UseAdminContentOptions = {}) {
  const { search, darkMeme, limit = 20, offset = 0 } = options;

  return useQuery<AdminPostsResponse>({
    queryKey: [ADMIN_CONTENT_KEY, { search, darkMeme, limit, offset }],
    queryFn: () => adminService.getPosts({ search, darkMeme, limit, offset }),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation<AdminActionResponse, Error, { postId: string; payload?: DeletePostPayload }>({
    mutationFn: ({ postId, payload }) => adminService.deletePost(postId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_CONTENT_KEY] });
    },
  });
}

