import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/api/admin.service';
import { AdminUserDetail, AdminActionResponse, BanUserPayload, SuspendUserPayload } from '@/lib/types/admin';

export const ADMIN_USER_DETAIL_KEY = 'admin-user-detail';

export function useAdminUserDetail(userId: string | undefined) {
  return useQuery<AdminUserDetail>({
    queryKey: [ADMIN_USER_DETAIL_KEY, userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return adminService.getUserDetail(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useAdminUserBan(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation<AdminActionResponse, Error, BanUserPayload | undefined>({
    mutationFn: (payload) => {
      if (!userId) throw new Error('User ID is required');
      return adminService.banUser(userId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_USER_DETAIL_KEY, userId] });
    },
  });
}

export function useAdminUserUnban(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation<AdminActionResponse, Error, BanUserPayload | undefined>({
    mutationFn: (payload) => {
      if (!userId) throw new Error('User ID is required');
      return adminService.unbanUser(userId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_USER_DETAIL_KEY, userId] });
    },
  });
}

export function useAdminUserSuspend(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation<AdminActionResponse, Error, SuspendUserPayload | undefined>({
    mutationFn: (payload) => {
      if (!userId) throw new Error('User ID is required');
      return adminService.suspendUser(userId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_USER_DETAIL_KEY, userId] });
    },
  });
}

export function useAdminUserUnsuspend(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation<AdminActionResponse, Error, BanUserPayload | undefined>({
    mutationFn: (payload) => {
      if (!userId) throw new Error('User ID is required');
      return adminService.unsuspendUser(userId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_USER_DETAIL_KEY, userId] });
    },
  });
}

