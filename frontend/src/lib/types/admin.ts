/**
 * Admin Panel Type Definitions
 * Centralized types for all admin-related entities.
 */

export type AdminUserRole = 'user' | 'moderator' | 'admin' | 'super_admin';
export type ReportStatus = 'pending' | 'resolved' | 'dismissed' | 'escalated';
export type ReportAction = 'resolved' | 'dismissed' | 'escalated';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AdminUser {
  id: string;
  email: string;
  username: string | null;
  role: AdminUserRole;
  isBanned: boolean;
  isSuspended: boolean;
  trustScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserDetail extends AdminUser {
  profile: {
    nickname: string | null;
    bio: string | null;
    avatarUrl: string | null;
    age: number | null;
    city: string | null;
    country: string | null;
  } | null;
  posts: AdminPostPreview[];
  reportsMade: AdminReportPreview[];
  reportsReceived: AdminReportPreview[];
  stats: {
    postsCount: number;
    reportsMadeCount: number;
    reportsReceivedCount: number;
  };
}

export interface AdminPostPreview {
  id: string;
  content: string;
  imageUrl: string | null;
  isDarkMeme: boolean;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
}

export interface AdminReportPreview {
  id: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
  reported: { id: string; username: string | null; email: string };
  reporter: { id: string; username: string | null; email: string };
}

export interface AdminReport {
  id: string;
  reason: string;
  description: string | null;
  status: ReportStatus;
  createdAt: string;
  reporter: { id: string; username: string | null; email: string };
  reported: { id: string; username: string | null; email: string };
  chat?: {
    id: string;
    user1: { username: string };
    user2: { username: string };
  } | null;
}

export interface AdminPost {
  id: string;
  content: string;
  imageUrl: string | null;
  isDarkMeme: boolean;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  user: {
    id: string;
    username: string | null;
    email: string;
    role: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string | null;
  createdAt: string;
  admin: {
    id: string;
    username: string | null;
    email: string;
    role: string;
  };
}

export interface AnalyticsData {
  users: {
    total: number;
    active: number;
    banned: number;
    growth: { date: string; count: number }[];
  };
  engagement: {
    totalMatches: number;
    totalChats: number;
    totalVoiceCalls: number;
  };
  safety: {
    totalReports: number;
    pendingReports: number;
  };
  system: {
    totalAuditLogs: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  limit: number;
  offset: number;
}

export interface AdminReportsResponse {
  reports: AdminReport[];
  total: number;
  limit: number;
  offset: number;
}

export interface AdminPostsResponse {
  posts: AdminPost[];
  total: number;
  limit: number;
  offset: number;
}

export interface AdminAuditLogsResponse {
  logs: AuditLog[];
  total: number;
  limit: number;
  offset: number;
}

export interface BanUserPayload {
  reason?: string;
}

export interface SuspendUserPayload {
  reason?: string;
  durationHours?: number;
}

export interface ChangeRolePayload {
  role: AdminUserRole;
}

export interface ResolveReportPayload {
  action: ReportAction;
  notes?: string;
}

export interface DeletePostPayload {
  reason?: string;
}

export interface AdminActionResponse {
  success: boolean;
  message: string;
}

// ── SUPER ADMIN TYPES ──

export interface AdminChatPreview {
  id: string;
  status: string;
  startedAt: string;
  archivedAt?: string | null;
  endedAt?: string | null;
  user1Id: string;
  user2Id: string;
  user1?: AdminShortUser;
  user2?: AdminShortUser;
  otherUser: AdminShortUser;
  lastMessage: (AdminMessagePreview & { isDeleted?: boolean }) | null;
  messageCount?: number;
}

export interface AdminMessagePreview {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  isDeletedForEveryone: boolean;
}

export interface AdminMessage {
  id: string;
  content: string;
  chatId: string;
  senderId: string;
  createdAt: string;
  deliveredAt?: string | null;
  readAt?: string | null;
  isDeletedForEveryone: boolean;
  deletedByRecipient: boolean;
  deletedBySender: boolean;
  clientId?: string | null;
  sender: AdminShortUser;
  chat: {
    id: string;
    user1Id: string;
    user2Id: string;
    user1: { username: string | null; email: string };
    user2: { username: string | null; email: string };
  };
  isDeleted: boolean;
}

export interface AdminShortUser {
  id: string;
  username: string | null;
  email: string;
  profile: { profilePhotoUrl: string | null } | null;
}

export interface AdminMatch {
  id: string;
  savedAt: string;
  label?: string | null;
  otherUser: AdminShortUser;
  chat: {
    id: string;
    status: string;
    messageCount: number;
  } | null;
}

export interface AdminMatchRequest {
  likesSent: { id: string; createdAt: string; target: AdminShortUser }[];
  likesReceived: { id: string; createdAt: string; sender: AdminShortUser }[];
  passesSent: { id: string; createdAt: string; target: AdminShortUser }[];
}

export interface AdminBlock {
  id: string;
  createdAt: string;
  blocked?: AdminShortUser;
  blocker?: AdminShortUser;
}

export interface AdminVoiceSession {
  id: string;
  status: string;
  startedAt?: string | null;
  endedAt?: string | null;
  durationSeconds?: number | null;
  otherUser: AdminShortUser;
  chat?: { id: string; status: string } | null;
}

export interface AdminNotification {
  id: string;
  type: string;
  read: boolean;
  data?: string | null;
  createdAt: string;
  actor: AdminShortUser;
}

export interface AdminBadge {
  id: string;
  badgeType: string;
  count: number;
  awardedAt: string;
}

export interface AdminUserFeedbackItem {
  id: string;
  attributes?: string | null;
  createdAt: string;
  toUser?: AdminShortUser;
  fromUser?: AdminShortUser;
  chat?: { id: string; status: string } | null;
}

export interface AIUserInsight {
  id: string;
  userId: string;
  userType: string;
  engagementLevel: string;
  activityPattern: string;
  riskLevel: RiskLevel;
  anomalyDetected: boolean;
  intentSummary: any;
  alerts: string[];
  recommendation: any;
  behaviorSummary: string;
  aiConfidence: string;
  persona?: string;
  analysisDetail?: {
    actions: string;
    choices: string;
    vibeCategory: string;
  };
  aiModel: string;
  aiVersion: string;
  generatedAt: string;
  updatedAt: string;
}

export interface AuditSession {
  id: string;
  adminId: string;
  userId: string;
  reason: string;
  startedAt: string;
  endedAt?: string | null;
}

export interface AdminEverythingResponse {
  user: {
    id: string;
    email: string;
    username: string | null;
    role: string;
    isBanned: boolean;
    isSuspended: boolean;
    trustScore: number;
    createdAt: string;
    updatedAt: string;
    profile: Record<string, unknown> | null;
  };
  posts: AdminPostPreview[];
  badges: AdminBadge[];
  likesSent: { id: string; createdAt: string; target: AdminShortUser }[];
  likesReceived: { id: string; createdAt: string; sender: AdminShortUser }[];
  passesSent: { id: string; createdAt: string; targetId: string }[];
  blocked: AdminBlock[];
  blockedBy: AdminBlock[];
  chats: {
    id: string;
    status: string;
    startedAt: string;
    otherUser: AdminShortUser;
    _count: { messages: number };
  }[];
  matches: AdminMatch[];
  reportsMade: AdminReportPreview[];
  reportsReceived: AdminReportPreview[];
  notifications: (AdminNotification & { actor: AdminShortUser })[];
  voiceSessions: (AdminVoiceSession & { otherUser: AdminShortUser })[];
}

export interface AdminRelationships {
  sent: (AdminShortUser & { likedAt: string })[];
  received: (AdminShortUser & { likedAt: string })[];
  mutual: { user: AdminShortUser; matchedAt: string }[];
}

export interface AdminChatsResponse {
  chats: AdminChatPreview[];
  total: number;
  limit: number;
  offset: number;
}

export interface AdminChatMessagesResponse {
  chat: { id: string; user1: AdminShortUser; user2: AdminShortUser };
  messages: AdminMessage[];
  total: number;
  limit: number;
  offset: number;
}

export interface AdminMatchesResponse {
  matches: AdminMatch[];
}

export interface AdminBlocksResponse {
  blocked: AdminBlock[];
  blockedBy: AdminBlock[];
}

export interface AdminVoiceSessionsResponse {
  sessions: AdminVoiceSession[];
}

export interface AdminAllVoiceSession {
  id: string;
  status: string;
  startedAt?: string | null;
  endedAt?: string | null;
  durationSeconds?: number | null;
  user1: AdminShortUser;
  user2: AdminShortUser;
  chat?: { id: string; status: string } | null;
}

export interface AdminAllVoiceSessionsResponse {
  sessions: AdminAllVoiceSession[];
  total: number;
  limit: number;
  offset: number;
}

export interface AdminNotificationsResponse {
  notifications: AdminNotification[];
  total: number;
  limit: number;
  offset: number;
}

export interface AdminBadgesResponse {
  badges: AdminBadge[];
}

export interface AdminFeedbackResponse {
  given: AdminUserFeedbackItem[];
  received: AdminUserFeedbackItem[];
}

export interface AdminAllMessagesResponse {
  messages: AdminMessage[];
  total: number;
  limit: number;
  offset: number;
}

