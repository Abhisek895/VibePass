'use client';

import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { apiRequest } from '@/services/api/client';
import { NotificationItem } from './NotificationItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import type { NotificationsResponse, AppNotification } from '@/lib/types/notification';
import { Bell } from 'lucide-react';
import { getTimeGroup } from '@/lib/date-utils';

interface NotificationsCache {
  pages: NotificationsResponse[];
  pageParams: (string | undefined)[];
}

export function NotificationsList({ filter }: { filter?: string }) {
  const queryClient = useQueryClient();

  const buildQueryString = (selectedFilter?: string, cursor?: string) => {
    const params = new URLSearchParams();

    if (cursor) {
      params.set('cursor', cursor);
    }

    params.set('limit', '10');

    switch (selectedFilter) {
      case 'unread':
        params.set('unread', 'true');
        break;
      case 'matches':
        params.append('types', 'NEW_MATCH');
        break;
      case 'messages':
        params.append('types', 'NEW_MESSAGE');
        params.append('types', 'VOICE_REQUEST');
        break;
      case 'social':
        params.append('types', 'LIKE_POST');
        params.append('types', 'COMMENT_POST');
        params.append('types', 'SHARE_POST');
        params.append('types', 'PROFILE_VIEW');
        break;
    }

    return params.toString();
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } = useInfiniteQuery({
    queryKey: ['notifications', filter],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const queryString = buildQueryString(filter, pageParam);
      const url = queryString
        ? `/api/v1/notifications?${queryString}`
        : '/api/v1/notifications';

      return apiRequest<NotificationsResponse>(url, { auth: true });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: NotificationsResponse) => lastPage.nextCursor,
    retry: 2,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/v1/notifications/${id}/read`, {
        method: 'POST',
        auth: true,
      }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });

      const previousData = queryClient.getQueryData(['notifications', filter]);

      // Optimistically update the notification as read
      queryClient.setQueryData(['notifications', filter], (old: NotificationsCache | undefined) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            notifications: page.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            )
          }))
        };
      });

      return { previousData };
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['notifications', filter], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'count'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/v1/notifications/${id}`, {
        method: 'DELETE',
        auth: true,
      }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });

      const previousData = queryClient.getQueryData(['notifications', filter]);

      // Optimistically remove the notification
      queryClient.setQueryData(['notifications', filter], (old: NotificationsCache | undefined) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            notifications: page.notifications.filter((n) => n.id !== id)
          }))
        };
      });

      return { previousData };
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['notifications', filter], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'count'] });
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: () =>
      apiRequest('/api/v1/notifications/mark-all-read', {
        method: 'POST',
        auth: true,
      }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });

      const previousData = queryClient.getQueryData(['notifications', filter]);

      // Optimistically mark all as read
      queryClient.setQueryData(['notifications', filter], (old: NotificationsCache | undefined) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            notifications: page.notifications.map((n) => ({ ...n, read: true }))
          }))
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['notifications', filter], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'count'] });
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="vibe-card text-center py-16">
        <div className="text-[rgb(var(--danger))] mb-4">
          <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2">Failed to load notifications</h2>
        <p className="text-[rgb(var(--text-secondary))] max-w-xs mx-auto mb-4">
          There was an error loading your notifications. Please try again.
        </p>
        <button
          onClick={() => refetch()}
          className="btn-primary"
        >
          Try again
        </button>
      </div>
    );
  }

  const notifications = data?.pages.flatMap(page => page.notifications) || [];
  const hasUnread = notifications.some(n => !n.read);

  // Group notifications by time periods
  const groupedNotifications = notifications.reduce((groups: Record<string, AppNotification[]>, notification) => {
    const group = getTimeGroup(notification.createdAt);
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(notification);
    return groups;
  }, {} as Record<string, AppNotification[]>);

  const groupOrder = ['Today', 'Yesterday', 'This Week', 'This Month', 'Older'];
  const sortedGroups = Object.entries(groupedNotifications)
    .sort(([a], [b]) => groupOrder.indexOf(a) - groupOrder.indexOf(b));

  if (notifications.length === 0) {
    return (
      <div className="vibe-card text-center py-20">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] blur-2xl opacity-20 rounded-full scale-150" />
          <Bell className="h-20 w-20 text-[rgb(var(--text-secondary))] mx-auto relative" strokeWidth={1.5} />
          <div className="absolute -top-2 -right-2 size-5 rounded-full bg-gradient-to-br from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] animate-ping" />
        </div>
        <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-[rgb(var(--text-primary))] to-[rgb(var(--text-secondary))] bg-clip-text text-transparent">
          All caught up!
        </h2>
        <p className="text-[rgb(var(--text-secondary))] max-w-sm mx-auto text-base">
          When someone likes, comments or messages you, they'll appear here.
        </p>
        <div className="mt-8 flex justify-center gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-[rgb(var(--accent-primary))] animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hasUnread && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="text-sm px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[rgb(var(--accent-primary),0.15)] to-[rgb(var(--accent-secondary),0.1)] text-[rgb(var(--accent-primary))] font-medium border border-[rgb(var(--accent-primary),0.2)] hover:from-[rgb(var(--accent-primary),0.25)] hover:to-[rgb(var(--accent-secondary),0.15)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {markAllReadMutation.isPending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Marking all as read...
              </span>
            ) : 'Mark all as read'}
          </button>
        </div>
      )}

      {sortedGroups.map(([groupName, groupNotifications]) => (
        <div key={groupName} className="space-y-3">
          <div className="sticky top-0 z-10 backdrop-blur-xl bg-[rgba(var(--bg-primary),0.85)] -mx-2 px-2 py-3 mb-1">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(var(--border-subtle),0.15)] to-transparent" />
              <h3 className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-[0.15em]">
                {groupName}
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(var(--border-subtle),0.15)] to-transparent" />
            </div>
          </div>

          {groupNotifications.map((notification, index) => (
            <div
              key={notification.id}
              style={{ animationDelay: `${index * 50}ms` }}
              className="animate-fadeIn"
            >
              <NotificationItem
                notification={notification}
                onMarkRead={(id) => markReadMutation.mutate(id)}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            </div>
          ))}
        </div>
      ))}

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="btn-secondary w-full mt-4"
        >
          {isFetchingNextPage ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  );
}

