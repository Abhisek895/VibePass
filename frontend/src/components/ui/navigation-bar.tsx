'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Heart, MessageCircle, User as UserIcon, LogOut, Bell } from 'lucide-react';
import { apiRequest } from '@/services/api/client';
import { getAccessToken } from '@/services/api/storage';
import { useAuth } from '@/store/auth';

const navItems = [
  { id: 'inbox', label: 'Inbox', href: '/chat', icon: MessageCircle },
  { id: 'matches', label: 'Matches', href: '/matches', icon: Heart },
  { id: 'notifications', label: 'Notifications', href: '/notifications', icon: Bell },
];

export function NavigationBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hasToken = Boolean(getAccessToken());

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'count'],
    queryFn: () =>
      apiRequest<{ count: number }>('/api/v1/notifications/count-unread', {
        auth: true,
      }),
    enabled: isAuthenticated && hasToken,
  });

  const { data: unreadMessagesData } = useQuery({
    queryKey: ['notifications', 'messages-count'],
    queryFn: () =>
      apiRequest<{ count: number }>('/api/v1/notifications/unread-messages-count', {
        auth: true,
      }),
    enabled: isAuthenticated && hasToken,
  });

  const handleNotificationClick = () => {
    router.push('/notifications');
  };

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/auth');
    setMobileMenuOpen(false);
  };

  const unreadCount = unreadData?.count ?? 0;
  const unreadMessagesCount = unreadMessagesData?.count ?? 0;

  return (
    <>
      {/* Mobile: Bottom tab bar - Part of flex flow */}
      <nav className="border-t border-white/10 bg-[#202C33]/90 backdrop-blur-xl sm:hidden h-[70px] flex-shrink-0">
        <div className="flex h-full items-center justify-around px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isInbox = item.id === 'inbox';
            const badgeValue = isInbox ? unreadMessagesCount : (item.id === 'notifications' ? unreadCount : 0);

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`relative flex size-12 items-center justify-center rounded-2xl transition-all duration-300 ${pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'text-[#25D366] scale-110'
                  : 'text-white/40 hover:text-white/70'
                  }`}
              >
                <Icon className={pathname === item.href || pathname.startsWith(item.href + '/') ? "h-6 w-6 fill-current" : "h-6 w-6"} />
                {item.id === 'notifications' && unreadCount > 0 ? (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#25D366] ring-2 ring-[#0B141B]" />
                ) : item.id === 'inbox' && unreadMessagesCount > 0 ? (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#25D366] text-[8px] font-black text-black">
                    {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
          <button
            onClick={() => user?.username && router.push(`/profile/${user.username}`)}
            className={`flex size-12 items-center justify-center rounded-2xl transition-all duration-300 ${pathname.startsWith('/profile/')
              ? 'text-[#25D366] scale-110'
              : 'text-white/40 hover:text-white/70'
              }`}
          >
            <UserIcon className={pathname.startsWith('/profile/') ? "h-6 w-6 fill-current" : "h-6 w-6"} />
          </button>
        </div>
      </nav>

      {/* Desktop: Top header - Part of flex flow */}
      <header className="border-b border-white/10 bg-[#202C33]/80 backdrop-blur-md hidden sm:block h-16 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex h-full items-center justify-between px-6">
          <Link href="/profile" className="text-xl font-black tracking-tighter text-white hover:text-[#25D366] transition-colors">
            VibePass
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-2 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isInbox = item.id === 'inbox';
              const badgeValue = isInbox ? unreadMessagesCount : (item.id === 'notifications' ? unreadCount : 0);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 ${pathname === item.href || pathname.startsWith(item.href + '/')
                    ? 'bg-[rgb(var(--accent-primary))] text-white shadow-[0_10px_30px_rgba(139,92,246,0.2)]'
                    : 'text-[rgb(var(--text-secondary))] hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.id === 'notifications' && unreadCount > 0 ? (
                    <span className="h-2 w-2 rounded-full bg-white/40" />
                  ) : item.id === 'inbox' && unreadMessagesCount > 0 ? (
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={handleNotificationClick}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[rgb(var(--bg-elevated))] border border-[rgba(var(--border-subtle),0.08)] hover:bg-white/10 transition-colors"
            >
              <Bell className="h-5 w-5 text-[rgb(var(--text-secondary))]" />
              {unreadCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[rgb(var(--accent-primary))]" />
              ) : null}
            </button>
            <button
              onClick={() => user?.username && router.push(`/profile/${user.username}`)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgb(var(--bg-elevated))] border border-[rgba(var(--border-subtle),0.08)] hover:bg-white/10 transition-colors overflow-hidden"
            >
              <UserIcon className="h-5 w-5 text-[rgb(var(--text-secondary))]" />
            </button>
            <div className="text-sm hidden md:block">
              <p className="font-semibold text-white">{user?.username || 'Guest'}</p>
              <p className="text-[rgb(var(--text-secondary))]">@{user?.username || 'guest'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-[rgb(var(--text-secondary))] transition-all duration-200 hover:bg-[rgb(var(--danger),0.15)] hover:text-[rgb(var(--danger))]"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile user menu dropdown */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 sm:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute bottom-20 left-4 right-4 bg-[rgb(var(--bg-surface))] border border-[rgba(var(--border-subtle),0.12)] rounded-2xl p-4 shadow-2xl backdrop-blur-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4 p-2 -m-2 rounded-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgb(var(--bg-elevated))] border border-[rgba(var(--border-subtle),0.08)] overflow-hidden">
                <UserIcon className="h-6 w-6 text-[rgb(var(--text-secondary))]" />
              </div>
              <div>
                <p className="font-semibold text-white text-base">{user?.username || 'Guest'}</p>
                <p className="text-[rgb(var(--text-secondary))] text-sm">@{user?.username || 'guest'}</p>
              </div>
            </div>
            <div className="-m-2">
              <Link
                href="/profile"
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserIcon className="h-5 w-5 text-[rgb(var(--text-secondary))]" />
                Profile
              </Link>
            </div>
            <button
              onClick={handleLogout}
              className="mt-2 w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-[rgb(var(--danger))] hover:bg-[rgb(var(--danger),0.1)] transition"
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </>
  );
}
