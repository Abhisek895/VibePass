import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/api/admin.service';
import { AdminAuditLogsResponse } from '@/lib/types/admin';

export const ADMIN_AUDIT_LOGS_KEY = 'admin-audit-logs';

interface UseAdminAuditLogsOptions {
  action?: string;
  adminId?: string;
  limit?: number;
  offset?: number;
}

export function useAdminAuditLogs(options: UseAdminAuditLogsOptions = {}) {
  const { action, adminId, limit = 25, offset = 0 } = options;

  return useQuery<AdminAuditLogsResponse>({
    queryKey: [ADMIN_AUDIT_LOGS_KEY, { action, adminId, limit, offset }],
    queryFn: () => adminService.getAuditLogs({ action, adminId, limit, offset }),
    staleTime: 1000 * 60, // 1 minute
  });
}

