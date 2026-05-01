import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from '@/services/api/profile-content.service';
import type { Profile } from '@/types/profile';

export function useUpdateProfile(username: string) {
  const queryClient = useQueryClient();

  return useMutation<Profile | null, unknown, Partial<Profile>>({
    mutationFn: (updates) => updateProfile(username, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', username] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}
