import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@/services/api/profiles.service';

async function uploadFile(file: File): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return `/api/uploads/${file.name}`;
}

export function useUploadCoverImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const imageUrl = await uploadFile(file);
      return profileService.updateCoverPhoto(imageUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

export function useClearCoverPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => profileService.clearCoverPhoto(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

