import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@/services/api/profiles.service';

async function uploadFile(file: File): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return `/api/uploads/${file.name}`;
}

export function useUploadProfileImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const imageUrl = await uploadFile(file);
      return profileService.updateProfilePhoto(imageUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

export function useClearProfilePhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => profileService.clearProfilePhoto(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

