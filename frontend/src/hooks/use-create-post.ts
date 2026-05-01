'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost as createPostApi } from '@/services/api/profile-content.service';
import type { PostMedia } from '@/types/profile';

interface CreatePostData {
  content: string;
  media: PostMedia[];
  privacy: string;
}

export function useCreatePost(username: string, onSuccess?: (newPost: any) => void) {
  const queryClient = useQueryClient();

  const { mutate: createPost, isPending: isCreating } = useMutation({
    mutationFn: (data: CreatePostData) => createPostApi(username, data.content, data.media, data.privacy as any),
    onSuccess: (newPost) => {
      // Add to profile posts cache
      queryClient.setQueryData(['profile-posts', username], (old: any[] = []) => [newPost, ...old]);
      // Call custom onSuccess if provided
      onSuccess?.(newPost);
    },
  });

  return { createPost, isCreating };
}
