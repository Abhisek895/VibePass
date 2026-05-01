import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/api/admin.service';
import { AnalyticsData } from '@/lib/types/admin';

export const ADMIN_ANALYTICS_KEY = 'admin-analytics';

export function useAdminAnalytics() {
  return useQuery<AnalyticsData>({
    queryKey: [ADMIN_ANALYTICS_KEY],
    queryFn: () => adminService.getAnalytics(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

