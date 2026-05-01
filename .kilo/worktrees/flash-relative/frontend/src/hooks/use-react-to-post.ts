import { useMutation, useQueryClient } from '@tanstack/react-query';
import { togglePostReaction } from '@/services/api/profile-content.service';
import type { Post, ReactionType } from '@/types/profile';

export function useReactToPost(username: string) {
  const queryClient = useQueryClient();

  return useMutation<Post | null, unknown, { postId: string; reactionType: ReactionType }>({
    mutationFn: ({ postId, reactionType }) => togglePostReaction(postId, reactionType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', username] });
    },
  });
}
