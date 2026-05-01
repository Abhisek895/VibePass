import { apiRequest } from './client';
import {
  AdminUsersResponse,
  AdminUserDetail,
  AdminReportsResponse,
  AdminPostsResponse,
  AdminAuditLogsResponse,
  AnalyticsData,
  AdminActionResponse,
  BanUserPayload,
  SuspendUserPayload,
  ChangeRolePayload,
  ResolveReportPayload,
  DeletePostPayload,
  AdminUserRole,
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

const BASE = '/api/v1/admin-panel';

export const adminService = {
  // ── ANALYTICS ──
  async getAnalytics(): Promise<AnalyticsData> {
    return apiRequest<AnalyticsData>(`${BASE}/analytics`, { auth: true });
  },

  // ── USERS ──
  async getUsers(options?: {
    search?: string;
    role?: AdminUserRole;
    limit?: number;
    offset?: number;
  }): Promise<AdminUsersResponse> {
    const params = new URLSearchParams();
    if (options?.search) params.append('search', options.search);
    if (options?.role) params.append('role', options.role);
    if (options?.limit !== undefined) params.append('limit', String(options.limit));
    if (options?.offset !== undefined) params.append('offset', String(options.offset));

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<AdminUsersResponse>(`${BASE}/users${query}`, { auth: true });
  },

  async getUserById(userId: string): Promise<AdminUserDetail> {
    return apiRequest<AdminUserDetail>(`${BASE}/users/${userId}`, { auth: true });
  },

  async getUserDetail(userId: string): Promise<AdminUserDetail> {
    return apiRequest<AdminUserDetail>(`${BASE}/users/${userId}/detail`, { auth: true });
  },

  async banUser(userId: string, payload?: BanUserPayload): Promise<AdminActionResponse> {
    return apiRequest<AdminActionResponse>(`${BASE}/users/${userId}/ban`, {
      auth: true,
      method: 'PUT',
      body: payload ?? {},
    });
  },

  async unbanUser(userId: string, payload?: BanUserPayload): Promise<AdminActionResponse> {
    return apiRequest<AdminActionResponse>(`${BASE}/users/${userId}/unban`, {
      auth: true,
      method: 'PUT',
      body: payload ?? {},
    });
  },

  async suspendUser(userId: string, payload?: SuspendUserPayload): Promise<AdminActionResponse> {
    return apiRequest<AdminActionResponse>(`${BASE}/users/${userId}/suspend`, {
      auth: true,
      method: 'PUT',
      body: payload ?? {},
    });
  },

  async unsuspendUser(userId: string, payload?: BanUserPayload): Promise<AdminActionResponse> {
    return apiRequest<AdminActionResponse>(`${BASE}/users/${userId}/unsuspend`, {
      auth: true,
      method: 'PUT',
      body: payload ?? {},
    });
  },

  async changeUserRole(userId: string, payload: ChangeRolePayload): Promise<AdminActionResponse> {
    return apiRequest<AdminActionResponse>(`${BASE}/users/${userId}/role`, {
      auth: true,
      method: 'PUT',
      body: payload,
    });
  },

  async deleteUser(userId: string): Promise<AdminActionResponse> {
    return apiRequest<AdminActionResponse>(`${BASE}/users/${userId}`, {
      auth: true,
      method: 'DELETE',
    });
  },

  // ── REPORTS ──
  async getReports(options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<AdminReportsResponse> {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.limit !== undefined) params.append('limit', String(options.limit));
    if (options?.offset !== undefined) params.append('offset', String(options.offset));

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<AdminReportsResponse>(`${BASE}/reports${query}`, { auth: true });
  },

  async resolveReport(
    reportId: string,
    payload: ResolveReportPayload,
  ): Promise<AdminActionResponse> {
    return apiRequest<AdminActionResponse>(`${BASE}/reports/${reportId}/resolve`, {
      auth: true,
      method: 'PUT',
      body: payload,
    });
  },

  // ── AUDIT LOGS ──
  async getAuditLogs(options?: {
    action?: string;
    adminId?: string;
    limit?: number;
    offset?: number;
  }): Promise<AdminAuditLogsResponse> {
    const params = new URLSearchParams();
    if (options?.action) params.append('action', options.action);
    if (options?.adminId) params.append('adminId', options.adminId);
    if (options?.limit !== undefined) params.append('limit', String(options.limit));
    if (options?.offset !== undefined) params.append('offset', String(options.offset));

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<AdminAuditLogsResponse>(`${BASE}/audit-logs${query}`, { auth: true });
  },

  // ── CONTENT MODERATION ──
  async getPosts(options?: {
    search?: string;
    darkMeme?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<AdminPostsResponse> {
    const params = new URLSearchParams();
    if (options?.search) params.append('search', options.search);
    if (options?.darkMeme !== undefined) params.append('darkMeme', String(options.darkMeme));
    if (options?.limit !== undefined) params.append('limit', String(options.limit));
    if (options?.offset !== undefined) params.append('offset', String(options.offset));

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<AdminPostsResponse>(`${BASE}/content/posts${query}`, { auth: true });
  },

  async deletePost(postId: string, payload?: DeletePostPayload): Promise<AdminActionResponse> {
    return apiRequest<AdminActionResponse>(`${BASE}/content/posts/${postId}`, {
      auth: true,
      method: 'DELETE',
      body: payload ?? {},
    });
  },

  // ── SUPER ADMIN: USER CHATS ──
  async getUserChats(userId: string, limit?: number, offset?: number): Promise<AdminChatsResponse> {
    const params = new URLSearchParams();
    if (limit !== undefined) params.append('limit', String(limit));
    if (offset !== undefined) params.append('offset', String(offset));
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<AdminChatsResponse>(`${BASE}/users/${userId}/chats${query}`, { auth: true });
  },

  // ── SUPER ADMIN: RELATIONSHIPS ──
  async getUserRelationships(userId: string): Promise<AdminRelationships> {
    return apiRequest<AdminRelationships>(`${BASE}/users/${userId}/relationships`, { auth: true });
  },

  // ── SUPER ADMIN: CHAT MESSAGES ──
  async getChatMessages(chatId: string, limit?: number, offset?: number): Promise<AdminChatMessagesResponse> {
    const params = new URLSearchParams();
    if (limit !== undefined) params.append('limit', String(limit));
    if (offset !== undefined) params.append('offset', String(offset));
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<AdminChatMessagesResponse>(`${BASE}/chats/${chatId}/messages${query}`, { auth: true });
  },

  // ── SUPER ADMIN: USER MATCHES ──
  async getUserMatches(userId: string): Promise<AdminMatchesResponse> {
    return apiRequest<AdminMatchesResponse>(`${BASE}/users/${userId}/matches`, { auth: true });
  },

  // ── SUPER ADMIN: USER MATCH REQUESTS ──
  async getUserMatchRequests(userId: string): Promise<AdminMatchRequest> {
    return apiRequest<AdminMatchRequest>(`${BASE}/users/${userId}/match-requests`, { auth: true });
  },

  // ── SUPER ADMIN: ALL MESSAGES ──
  async getAllMessages(search?: string, senderId?: string, limit?: number, offset?: number): Promise<AdminAllMessagesResponse> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (senderId) params.append('senderId', senderId);
    if (limit !== undefined) params.append('limit', String(limit));
    if (offset !== undefined) params.append('offset', String(offset));
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<AdminAllMessagesResponse>(`${BASE}/messages/all${query}`, { auth: true });
  },

  // ── SUPER ADMIN: USER BLOCKS ──
  async getUserBlocks(userId: string): Promise<AdminBlocksResponse> {
    return apiRequest<AdminBlocksResponse>(`${BASE}/users/${userId}/blocks`, { auth: true });
  },

  // ── SUPER ADMIN: USER VOICE SESSIONS ──
  async getUserVoiceSessions(userId: string): Promise<AdminVoiceSessionsResponse> {
    return apiRequest<AdminVoiceSessionsResponse>(`${BASE}/users/${userId}/voice-sessions`, { auth: true });
  },

  // ── SUPER ADMIN: ALL VOICE SESSIONS ──
  async getAllVoiceSessions(limit?: number, offset?: number): Promise<AdminAllVoiceSessionsResponse> {
    const params = new URLSearchParams();
    if (limit !== undefined) params.append('limit', String(limit));
    if (offset !== undefined) params.append('offset', String(offset));
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<AdminAllVoiceSessionsResponse>(`${BASE}/voice-sessions/all${query}`, { auth: true });
  },

  // ── SUPER ADMIN: USER NOTIFICATIONS ──
  async getUserNotifications(userId: string, limit?: number, offset?: number): Promise<AdminNotificationsResponse> {
    const params = new URLSearchParams();
    if (limit !== undefined) params.append('limit', String(limit));
    if (offset !== undefined) params.append('offset', String(offset));
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<AdminNotificationsResponse>(`${BASE}/users/${userId}/notifications${query}`, { auth: true });
  },

  // ── SUPER ADMIN: USER BADGES ──
  async getUserBadges(userId: string): Promise<AdminBadgesResponse> {
    return apiRequest<AdminBadgesResponse>(`${BASE}/users/${userId}/badges`, { auth: true });
  },

  // ── SUPER ADMIN: USER FEEDBACK ──
  async getUserFeedback(userId: string): Promise<AdminFeedbackResponse> {
    return apiRequest<AdminFeedbackResponse>(`${BASE}/users/${userId}/feedback`, { auth: true });
  },

  // ── SUPER ADMIN: EVERYTHING (consolidated) ──
  async getUserEverything(userId: string): Promise<AdminEverythingResponse> {
    return apiRequest<AdminEverythingResponse>(`${BASE}/users/${userId}/everything`, { auth: true });
  },

  // ── AI INTELLIGENCE ──
  async analyzeUser(userId: string): Promise<AdminActionResponse> {
    return apiRequest<AdminActionResponse>(`${BASE}/ai/analyze-user`, {
      auth: true,
      method: 'POST',
      body: { userId },
    });
  },

  async getAIDashboard(): Promise<any[]> {
    return apiRequest<any[]>(`${BASE}/ai/insights`, { auth: true });
  },
};

