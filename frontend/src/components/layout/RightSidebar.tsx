'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  Clock,
  Heart,
  MessageCircle,
  Phone,
  TrendingUp,
  UserPlus,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { formatRelativeTime } from '@/lib/date-utils';
import type {
  AppNotification,
  NotificationsResponse,
} from '@/lib/types/notification';
import {
  getMatchPool,
  type Match,
} from '@/services/api/matches.service';
import { apiRequest } from '@/services/api/client';
import { getAccessToken } from '@/services/api/storage';

function getNotificationIcon(type: string) {
  switch (type) {
    case 'NEW_MATCH':
    case 'LIKE_POST':
      return Heart;
    case 'NEW_MESSAGE':
    case 'COMMENT_POST':
      return MessageCircle;
    case 'VOICE_REQUEST':
      return Phone;
    default:
      return Bell;
  }
}

function buildInterestTrends(matches: Match[]) {
  const counts = new Map<string, number>();

  matches.forEach(match => {
    match.interests.forEach(interest => {
      const normalized = interest.trim();

      if (!normalized) {
        return;
      }

      counts.set(normalized, (counts.get(normalized) || 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([name, count]) => ({
      count,
      href: `/search?q=${encodeURIComponent(name)}`,
      label: `#${name.replace(/\s+/g, '')}`,
      name,
    }));
}

function renderRecentActivity(notification: AppNotification) {
  const Icon = getNotificationIcon(notification.type);

  return (
    <div className="flex items-center gap-3 text-[rgb(var(--text-secondary))] p-2 rounded-xl hover:bg-[rgba(var(--bg-elevated),0.5)] transition-all">
      <div className="w-8 h-8 bg-[rgb(var(--accent-primary),0.15)] rounded-full flex items-center justify-center">
        <Icon className="h-4 w-4 text-[rgb(var(--accent-primary))]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate">{notification.message}</p>
      </div>
      <span className="ml-auto text-[rgb(var(--text-muted))] whitespace-nowrap">
        {formatRelativeTime(notification.createdAt)}
      </span>
    </div>
  );
}

export function RightSidebar() {
  const hasToken = Boolean(getAccessToken());

  const { data: matches = [] } = useQuery({
    queryKey: ['sidebar', 'match-pool'],
    queryFn: getMatchPool,
    enabled: hasToken,
    staleTime: 1000 * 60,
  });

  const { data: notificationsData } = useQuery({
    queryKey: ['sidebar', 'recent-notifications'],
    queryFn: () =>
      apiRequest<NotificationsResponse>('/api/v1/notifications?limit=4', {
        auth: true,
      }),
    enabled: hasToken,
    staleTime: 1000 * 30,
  });

  const suggestions = matches.slice(0, 4);
  const trends = useMemo(() => buildInterestTrends(matches), [matches]);
  const recentNotifications = notificationsData?.notifications || [];

  return (
    <div className="space-y-6">
      <div className="vibe-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="h-4 w-4 text-[rgb(var(--accent-primary))]" />
          <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))] uppercase tracking-wide">
            Suggestions for you
          </h3>
        </div>
        <div className="space-y-4">
          {suggestions.length === 0 ? (
            <p className="text-sm text-[rgb(var(--text-muted))]">
              More people will appear here as profiles land in the database.
            </p>
          ) : (
            suggestions.map(user => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-2 hover:bg-[rgba(var(--bg-elevated),0.5)] rounded-xl transition-all group"
              >
                <Avatar
                  alt={user.username}
                  size="md"
                  initials={user.username.slice(0, 2).toUpperCase()}
                  className="border border-[rgba(var(--border-subtle),0.1)] shadow-sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[rgb(var(--text-primary))] text-sm truncate">
                    @{user.username}
                  </p>
                  <p className="text-[rgb(var(--text-muted))] text-xs truncate">
                    {user.compatibilityScore}% match
                    {user.voiceOpen ? ' • voice open' : ''}
                  </p>
                  <p className="text-[rgb(var(--text-muted))] text-xs truncate mt-1">
                    {user.interests.slice(0, 3).join(' • ') || 'No interests yet'}
                  </p>
                </div>
                <Link
                  href={`/profile/${user.username}`}
                  className="px-4 py-1.5 bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] hover:from-[rgb(var(--accent-primary),0.9)] hover:to-[rgb(var(--accent-secondary),0.9)] text-white text-xs rounded-lg font-medium transition-all group-hover:scale-105 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                >
                  View
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="vibe-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-[rgb(var(--accent-secondary))]" />
          <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))] uppercase tracking-wide">
            Trends
          </h3>
        </div>
        <div className="space-y-2">
          {trends.length === 0 ? (
            <p className="text-sm text-[rgb(var(--text-muted))]">
              Once people start adding interests, trend clusters will show up here.
            </p>
          ) : (
            trends.map(trend => (
              <Link
                key={trend.name}
                href={trend.href}
                className="flex items-center justify-between p-3 hover:bg-[rgba(var(--bg-elevated),0.5)] rounded-xl transition-all group text-sm"
              >
                <span className="font-medium text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--accent-primary))]">
                  {trend.label}
                </span>
                <span className="text-[rgb(var(--text-muted))] text-xs font-mono">
                  {trend.count}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="vibe-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-[rgb(var(--accent-tertiary))]" />
          <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))] uppercase tracking-wide">
            Recent
          </h3>
        </div>
        <div className="space-y-4 text-xs">
          {recentNotifications.length === 0 ? (
            <p className="text-sm text-[rgb(var(--text-muted))]">
              New likes, messages, and matches will show up here.
            </p>
          ) : (
            recentNotifications.map(notification =>
              notification.actionUrl ? (
                <Link
                  key={notification.id}
                  href={notification.actionUrl}
                  className="block"
                >
                  {renderRecentActivity(notification)}
                </Link>
              ) : (
                <div key={notification.id}>
                  {renderRecentActivity(notification)}
                </div>
              ),
            )
          )}
        </div>
      </div>
    </div>
  );
}
