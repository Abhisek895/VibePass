'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserProfile, UpdateProfileInput, UpdateUserInput } from '@/lib/types';
import { profileService } from '@/services/api/profiles.service';
import { QUERY_KEYS } from '@/lib/constants';

async function uploadFile(file: File): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return `/api/uploads/${file.name}`;
}

/**
 * Hook to fetch user profile by username
 */
export const useProfile = (username: string | null | undefined) => {
  const query = useQuery({
    queryKey: QUERY_KEYS.PROFILE(username || ''),
    queryFn: async () => {
      if (!username) throw new Error('Username is required');
      return profileService.getProfile(username);
    },
    enabled: !!username,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Hook to update user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: UpdateProfileInput) => profileService.updateProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CURRENT_USER() });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return {
    updateProfile: mutation.mutate,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
};

/**
 * Hook to update user
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: UpdateUserInput) => profileService.updateUser(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CURRENT_USER() });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return {
    updateUser: mutation.mutate,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
};

/**
 * Hook to upload profile image
 */
export const useUploadProfileImage = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const imageUrl = await uploadFile(file);
      return profileService.updateProfilePhoto(imageUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
};

/**
 * Hook to upload cover image
 */
export const useUploadCoverImage = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const imageUrl = await uploadFile(file);
      return profileService.updateCoverPhoto(imageUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
};

/**
 * Hook to clear profile photo
 */
export const useClearProfilePhoto = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => profileService.clearProfilePhoto(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
};

/**
 * Hook to clear cover photo
 */
export const useClearCoverPhoto = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => profileService.clearCoverPhoto(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
};

