import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addComment, fetchComments } from '@/services/api/profile-content.service';
import type { Comment } from '@/types/profile';

export function useComments(postId: string, currentUserId: string) {
  const queryClient = useQueryClient();

  const query = useQuery<Comment[]>({
    queryKey: ['comments', postId],
    queryFn: () => fetchComments(postId),
    staleTime: 1000 * 20,
  });

  const mutation = useMutation<Comment | null, unknown, string>({
    mutationFn: (content) => addComment(postId, currentUserId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  return {
    ...query,
    addComment: mutation.mutateAsync,
    isAddingComment: mutation.isPending,
  };
}
