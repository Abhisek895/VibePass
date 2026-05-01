'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Bell, Heart, Home, MessageCircle, User } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { apiRequest } from '@/services/api/client';
import { getConnections } from '@/services/api/matches.service';
import { profileService } from '@/services/api/profiles.service';
import { getAccessToken } from '@/services/api/storage';

interface LeftSidebarProps {
  currentUserUsername: string;
}

interface SidebarProfile {
  displayName?: string;
  friendsCount?: number;
  postsCount?: number;
  profile?: {
    profilePhotoUrl?: string | null;
  } | null;
  profileImage?: string | null;
  username?: string | null;
}

function isPathActive(pathname: string, href: string) {
  if (href.startsWith('/profile')) {
    return pathname.startsWith('/profile');
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function LeftSidebar({ currentUserUsername }: LeftSidebarProps) {
  const pathname = usePathname();
  const hasToken = Boolean(getAccessToken());

  const { data: profile } = useQuery({
    queryKey: ['sidebar', 'profile', currentUserUsername],
    queryFn: () =>
      profileService.getProfile(currentUserUsername) as Promise<SidebarProfile>,
    enabled: Boolean(currentUserUsername),
    staleTime: 1000 * 60 * 5,
  });

  const { data: connections = [] } = useQuery({
    queryKey: ['sidebar', 'connections'],
    queryFn: getConnections,
    enabled: hasToken,
    staleTime: 1000 * 60,
  });

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'count'],
    queryFn: () =>
      apiRequest<{ count: number }>('/api/v1/notifications/count-unread', {
        auth: true,
      }),
    enabled: hasToken,
    staleTime: 1000 * 30,
  });

  const { data: unreadMessagesData } = useQuery({
    queryKey: ['notifications', 'messages-count'],
    queryFn: () =>
      apiRequest<{ count: number }>('/api/v1/notifications/unread-messages-count', {
        auth: true,
      }),
    enabled: hasToken,
  });

  const navItems = [
    { href: '/feed', icon: Home, label: 'Feed' },
    { href: '/matches', icon: Heart, label: 'Matches' },
    { href: '/chat', icon: MessageCircle, label: 'Inbox' },
    { href: '/notifications', icon: Bell, label: 'Notifications' },
    {
      href: `/profile/${currentUserUsername}`,
      icon: User,
      label: 'Profile',
    },
  ];

  const displayName =
    profile?.displayName?.trim() ||
    profile?.username?.trim() ||
    currentUserUsername;
  const avatarSrc =
    profile?.profileImage || profile?.profile?.profilePhotoUrl || undefined;
  const connectionsCount = profile?.friendsCount ?? connections.length;
  const postsCount = profile?.postsCount ?? 0;
  const unreadCount = unreadData?.count ?? 0;
  const unreadMessagesCount = unreadMessagesData?.count ?? 0;

  return (
    <aside className="w-64 bg-[rgb(var(--bg-surface))] border-r border-[rgba(var(--border-subtle),0.05)] hidden xl:block">
      <div className="p-6 border-b border-[rgba(var(--border-subtle),0.05)]">
        <Link
          href="/matches"
          className="inline-flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] bg-clip-text text-transparent"
        >
          Vibe<span className="text-[rgb(var(--accent-primary))]">Pass</span>
        </Link>
      </div>

      <nav className="p-4 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = isPathActive(pathname, item.href);

          let badgeCount = 0;
          if (item.href === '/notifications') badgeCount = unreadCount;
          if (item.href === '/chat') badgeCount = unreadMessagesCount;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between gap-3 p-3 rounded-xl transition-all duration-200 ${active
                ? 'bg-gradient-to-r from-[rgb(var(--accent-primary),0.15)] to-[rgb(var(--accent-secondary),0.1)] border border-[rgb(var(--accent-primary),0.2)] text-[rgb(var(--text-primary))] shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-elevated),0.5)] hover:text-[rgb(var(--text-primary))] border border-transparent'
                }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium truncate">{item.label}</span>
              </span>
              {item.href === '/notifications' && unreadCount > 0 ? (
                <span className="h-2 w-2 rounded-full bg-[rgb(var(--accent-primary))]" />
              ) : item.href === '/chat' && unreadMessagesCount > 0 ? (
                <span className="rounded-full bg-[rgb(var(--accent-primary))] px-2 py-0.5 text-[10px] font-semibold text-white">
                  {unreadMessagesCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[rgba(var(--border-subtle),0.05)]">
        <h3 className="text-sm font-semibold text-[rgb(var(--text-muted))] mb-3 uppercase tracking-wider">
          Quick
        </h3>
        <div className="space-y-2">
          <Link
            href="/chat"
            className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-[rgb(var(--bg-elevated),0.5)] hover:text-[rgb(var(--text-primary))] transition-all text-sm"
          >
            <span className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[rgb(var(--voice-active),0.15)] rounded-xl flex items-center justify-center border border-[rgb(var(--voice-active),0.2)]">
                <MessageCircle className="h-4 w-4 text-[rgb(var(--voice-active))]" />
              </div>
              <span>Open chats</span>
            </span>
            <span className="text-[rgb(var(--text-primary))] font-semibold">
              {connections.length}
            </span>
          </Link>
          <Link
            href="/notifications"
            className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-[rgb(var(--bg-elevated),0.5)] hover:text-[rgb(var(--text-primary))] transition-all text-sm"
          >
            <span className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[rgb(var(--accent-primary),0.15)] rounded-xl flex items-center justify-center border border-[rgb(var(--accent-primary),0.2)]">
                <Bell className="h-4 w-4 text-[rgb(var(--accent-primary))]" />
              </div>
              <span>Unread alerts</span>
            </span>
            <span className="text-[rgb(var(--text-primary))] font-semibold">
              {unreadCount}
            </span>
          </Link>
        </div>
      </div>

      <div className="p-4 border-t border-[rgba(var(--border-subtle),0.05)] mt-auto">
        <div className="flex items-center gap-3 p-4 bg-[rgb(var(--bg-elevated),0.5)] backdrop-blur-md rounded-2xl border border-[rgba(var(--border-subtle),0.08)] hover:border-[rgb(var(--accent-primary),0.2)] transition-all">
          <Avatar
            src={avatarSrc}
            alt={displayName}
            size="lg"
            initials={displayName.slice(0, 2).toUpperCase()}
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[rgb(var(--text-primary))] truncate">
              {displayName}
            </p>
            <p className="text-sm text-[rgb(var(--text-secondary))] truncate">
              @{profile?.username || currentUserUsername}
            </p>
          </div>
          <Link
            href={`/profile/${profile?.username || currentUserUsername}`}
            className="p-2 hover:bg-[rgb(var(--bg-surface))] rounded-xl transition-colors"
          >
            <User className="h-4 w-4 text-[rgb(var(--text-secondary))]" />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
          <div>
            <div className="font-semibold text-[rgb(var(--text-primary))] text-sm">
              {connectionsCount}
            </div>
            <div className="text-[rgb(var(--text-muted))]">Matches</div>
          </div>
          <div>
            <div className="font-semibold text-[rgb(var(--text-primary))] text-sm">
              {postsCount}
            </div>
            <div className="text-[rgb(var(--text-muted))]">Posts</div>
          </div>
          <div>
            <div className="font-semibold text-[rgb(var(--accent-primary))] text-sm">
              {unreadCount}
            </div>
            <div className="text-[rgb(var(--text-muted))]">Unread</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
