import { postService } from '@/services/api/posts.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ content, imageUrl }: { content: string; imageUrl?: string }) => 
      postService.createPost({ content, imageUrl }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postService.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useClearPostCaption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postService.clearPostCaption(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

