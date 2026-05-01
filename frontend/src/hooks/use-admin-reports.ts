import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/api/admin.service';
import { AdminReportsResponse, AdminActionResponse, ResolveReportPayload } from '@/lib/types/admin';

export const ADMIN_REPORTS_KEY = 'admin-reports';

interface UseAdminReportsOptions {
  status?: string;
  limit?: number;
  offset?: number;
}

export function useAdminReports(options: UseAdminReportsOptions = {}) {
  const { status, limit = 20, offset = 0 } = options;

  return useQuery<AdminReportsResponse>({
    queryKey: [ADMIN_REPORTS_KEY, { status, limit, offset }],
    queryFn: () => adminService.getReports({ status, limit, offset }),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useResolveReport() {
  const queryClient = useQueryClient();

  return useMutation<AdminActionResponse, Error, { reportId: string; payload: ResolveReportPayload }>({
    mutationFn: ({ reportId, payload }) => adminService.resolveReport(reportId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_REPORTS_KEY] });
    },
  });
}

