import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/api/admin.service';
import {
  AdminChatsResponse,
  AdminChatMessagesResponse,
  AdminMatchesResponse,
  AdminMatchRequest,
  AdminAllMessagesResponse,
  AdminBlocksResponse,
  AdminVoiceSessionsResponse,
  AdminAllVoiceSessionsResponse,
  AdminNotificationsResponse,
  AdminBadgesResponse,
  AdminFeedbackResponse,
  AdminEverythingResponse,
  AdminRelationships,
} from '@/lib/types/admin';

export const SUPER_ADMIN_KEY = 'super-admin';

export function useUserChats(userId: string | undefined, limit = 20, offset = 0) {
  return useQuery<AdminChatsResponse>({
    queryKey: [SUPER_ADMIN_KEY, 'chats', userId, limit, offset],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return adminService.getUserChats(userId, limit, offset);
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

export function useUserRelationships(userId: string | undefined) {
  return useQuery<AdminRelationships>({
    queryKey: [SUPER_ADMIN_KEY, 'relationships', userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return adminService.getUserRelationships(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

export function useChatMessages(chatId: string | undefined, limit = 50, offset = 0) {
  return useQuery<AdminChatMessagesResponse>({
    queryKey: [SUPER_ADMIN_KEY, 'chat-messages', chatId, limit, offset],
    queryFn: () => {
      if (!chatId) throw new Error('Chat ID is required');
      return adminService.getChatMessages(chatId, limit, offset);
    },
    enabled: !!chatId,
    staleTime: 1000 * 30,
  });
}

export function useUserMatches(userId: string | undefined) {
  return useQuery<AdminMatchesResponse>({
    queryKey: [SUPER_ADMIN_KEY, 'matches', userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return adminService.getUserMatches(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

export function useUserMatchRequests(userId: string | undefined) {
  return useQuery<AdminMatchRequest>({
    queryKey: [SUPER_ADMIN_KEY, 'match-requests', userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return adminService.getUserMatchRequests(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

export function useAllMessages(search?: string, senderId?: string, limit = 50, offset = 0) {
  return useQuery<AdminAllMessagesResponse>({
    queryKey: [SUPER_ADMIN_KEY, 'all-messages', search, senderId, limit, offset],
    queryFn: () => adminService.getAllMessages(search, senderId, limit, offset),
    staleTime: 1000 * 30,
  });
}

export function useUserBlocks(userId: string | undefined) {
  return useQuery<AdminBlocksResponse>({
    queryKey: [SUPER_ADMIN_KEY, 'blocks', userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return adminService.getUserBlocks(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

export function useUserVoiceSessions(userId: string | undefined) {
  return useQuery<AdminVoiceSessionsResponse>({
    queryKey: [SUPER_ADMIN_KEY, 'voice-sessions', userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return adminService.getUserVoiceSessions(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

export function useAllVoiceSessions(limit = 50, offset = 0) {
  return useQuery<AdminAllVoiceSessionsResponse>({
    queryKey: [SUPER_ADMIN_KEY, 'all-voice-sessions', limit, offset],
    queryFn: () => adminService.getAllVoiceSessions(limit, offset),
    staleTime: 1000 * 30,
  });
}

export function useUserNotifications(userId: string | undefined, limit = 100, offset = 0) {
  return useQuery<AdminNotificationsResponse>({
    queryKey: [SUPER_ADMIN_KEY, 'notifications', userId, limit, offset],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return adminService.getUserNotifications(userId, limit, offset);
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

export function useUserBadges(userId: string | undefined) {
  return useQuery<AdminBadgesResponse>({
    queryKey: [SUPER_ADMIN_KEY, 'badges', userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return adminService.getUserBadges(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

export function useUserFeedback(userId: string | undefined) {
  return useQuery<AdminFeedbackResponse>({
    queryKey: [SUPER_ADMIN_KEY, 'feedback', userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return adminService.getUserFeedback(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

export function useUserEverything(userId: string | undefined) {
  return useQuery<AdminEverythingResponse>({
    queryKey: [SUPER_ADMIN_KEY, 'everything', userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return adminService.getUserEverything(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

