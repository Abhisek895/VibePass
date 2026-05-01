import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminIntelligenceService } from '@/services/api/admin-intelligence.service';

export const AI_KEY = 'admin-ai';

export function useAnalyzeUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminIntelligenceService.analyzeUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: [AI_KEY, 'user', userId] });
    },
  });
}

export function useUserAIInsight(userId: string | undefined) {
  return useQuery({
    queryKey: [AI_KEY, 'user', userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return adminIntelligenceService.analyzeUser(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAIDashboard() {
  return useQuery({
    queryKey: [AI_KEY, 'dashboard'],
    queryFn: () => adminIntelligenceService.getDashboard(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useAuditSession() {
  const queryClient = useQueryClient();

  const startMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      adminIntelligenceService.startAuditSession(userId, reason),
    onSuccess: (session) => {
      localStorage.setItem('active_audit_session', JSON.stringify(session));
      queryClient.invalidateQueries({ queryKey: ['audit-session'] });
    },
  });

  const endMutation = useMutation({
    mutationFn: (sessionId: string) => adminIntelligenceService.endAuditSession(sessionId),
    onSuccess: () => {
      localStorage.removeItem('active_audit_session');
      queryClient.invalidateQueries({ queryKey: ['audit-session'] });
    },
  });

  return {
    startSession: startMutation.mutateAsync,
    endSession: endMutation.mutateAsync,
    isStarting: startMutation.isPending,
    isEnding: endMutation.isPending,
  };
}
