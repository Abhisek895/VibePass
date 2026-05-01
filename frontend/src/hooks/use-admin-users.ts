import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/api/admin.service';
import {
  AdminUsersResponse,
  AdminActionResponse,
  BanUserPayload,
  SuspendUserPayload,
  ChangeRolePayload,
  AdminUserRole,
} from '@/lib/types/admin';

export const ADMIN_USERS_KEY = 'admin-users';

interface UseAdminUsersOptions {
  search?: string;
  role?: AdminUserRole;
  limit?: number;
  offset?: number;
}

export function useAdminUsers(options: UseAdminUsersOptions = {}) {
  const { search, role, limit = 20, offset = 0 } = options;

  return useQuery<AdminUsersResponse>({
    queryKey: [ADMIN_USERS_KEY, { search, role, limit, offset }],
    queryFn: () => adminService.getUsers({ search, role, limit, offset }),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useBanUser() {
  const queryClient = useQueryClient();

  return useMutation<AdminActionResponse, Error, { userId: string; payload?: BanUserPayload }>({
    mutationFn: ({ userId, payload }) => adminService.banUser(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_KEY] });
    },
  });
}

export function useUnbanUser() {
  const queryClient = useQueryClient();

  return useMutation<AdminActionResponse, Error, { userId: string; payload?: BanUserPayload }>({
    mutationFn: ({ userId, payload }) => adminService.unbanUser(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_KEY] });
    },
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation<AdminActionResponse, Error, { userId: string; payload?: SuspendUserPayload }>({
    mutationFn: ({ userId, payload }) => adminService.suspendUser(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_KEY] });
    },
  });
}

export function useUnsuspendUser() {
  const queryClient = useQueryClient();

  return useMutation<AdminActionResponse, Error, { userId: string; payload?: BanUserPayload }>({
    mutationFn: ({ userId, payload }) => adminService.unsuspendUser(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_KEY] });
    },
  });
}

export function useChangeUserRole() {
  const queryClient = useQueryClient();

  return useMutation<AdminActionResponse, Error, { userId: string; payload: ChangeRolePayload }>({
    mutationFn: ({ userId, payload }) => adminService.changeUserRole(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_KEY] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation<AdminActionResponse, Error, string>({
    mutationFn: (userId) => adminService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_KEY] });
    },
  });
}

