import { apiRequest } from './client';

export interface ReportPayload {
  chatId?: string;
  description?: string;
  reason: string;
  reportedId: string;
}

export interface BlockPayload {
  blockedId: string;
}

export interface FeedbackPayload {
  attributes: string[];
  chatId: string;
  toUserId: string;
}

export interface BlockedUser {
  blockedId: string;
  createdAt: string;
  id: string;
}

export async function reportUser(
  payload: ReportPayload,
): Promise<{ success: boolean; message?: string }> {
  return apiRequest<{ success: boolean; message?: string }>(
    '/api/v1/safety/report',
    {
      method: 'POST',
      body: payload,
      auth: true,
    },
  );
}

export async function blockUser(
  payload: BlockPayload,
): Promise<{ success: boolean; message?: string }> {
  return apiRequest<{ success: boolean; message?: string }>(
    '/api/v1/safety/block',
    {
      method: 'POST',
      body: payload,
      auth: true,
    },
  );
}

export async function getBlockedUsers(): Promise<BlockedUser[]> {
  return apiRequest<BlockedUser[]>('/api/v1/safety/blocked-users', {
    auth: true,
  });
}

export async function submitFeedback(
  payload: FeedbackPayload,
): Promise<{ success: boolean; message?: string }> {
  return apiRequest<{ success: boolean; message?: string }>(
    '/api/v1/safety/feedback',
    {
      method: 'POST',
      body: payload,
      auth: true,
    },
  );
}
