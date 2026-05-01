import { apiRequest } from './client';
import { AIUserInsight, AuditSession } from '@/lib/types/admin';

export const adminIntelligenceService = {
  analyzeUser: async (userId: string): Promise<AIUserInsight> => {
    return apiRequest<AIUserInsight>('/api/v1/admin-panel/ai/analyze-user', {
      auth: true,
      method: 'POST',
      body: { userId },
    });
  },

  getDashboard: async (): Promise<AIUserInsight[]> => {
    return apiRequest<AIUserInsight[]>('/api/v1/admin-panel/ai/insights', { auth: true });
  },

  startAuditSession: async (userId: string, reason: string): Promise<AuditSession> => {
    return apiRequest<AuditSession>('/api/v1/admin-panel/audit/start', {
      auth: true,
      method: 'POST',
      body: { userId, reason },
    });
  },

  endAuditSession: async (sessionId: string): Promise<AuditSession> => {
    return apiRequest<AuditSession>('/api/v1/admin-panel/audit/end', {
      auth: true,
      method: 'POST',
      body: { sessionId },
    });
  },
};
