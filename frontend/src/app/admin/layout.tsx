'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminMode } from '@/store/admin-mode';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Shield,
  LayoutDashboard,
  Users,
  Flag,
  BarChart2,
  ClipboardList,
  FileText,
  LogOut,
  Brain,
  Search,
  Bell,
  Activity,
  Eye,
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users, exact: false },
  { href: '/admin/ai', label: 'AI Intelligence', icon: Brain, exact: false },
  { href: '/admin/monitoring', label: 'Live Monitoring', icon: Activity, exact: false },
  { href: '/admin/content', label: 'Content', icon: FileText, exact: false },
  { href: '/admin/reports', label: 'Reports', icon: Flag, exact: false },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2, exact: false },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: ClipboardList, exact: false },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { mode, isInitialized, userRole } = useAdminMode();

  useEffect(() => {
    if (isInitialized && mode === 'user') {
      router.replace('/');
    }
  }, [isInitialized, mode, router]);

  if (!isInitialized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0B141B]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-violet-400" />
          <p className="text-white/50 text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (mode === 'user') return null;

  return (
    /*
     * Use `fixed inset-0` to escape the `position:fixed; overflow:hidden`
     * on <body> set by globals.css (needed for the main app mobile UX).
     * This gives the admin panel its own independent scroll context.
     */
    <div className="fixed inset-0 flex bg-[#050505] text-white">
      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-white/5 bg-[#0A0A0B]">
        {/* Logo / Brand */}
        <div className="px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-900/40">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-white leading-none">Admin Panel</p>
              <p className="text-[11px] font-medium text-violet-400 mt-1 uppercase tracking-widest">Enterprise</p>
            </div>
          </div>
        </div>

        {/* Search Bar Placeholder */}
        <div className="px-4 mb-6">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-white/30 text-xs">
            <Search className="w-3.5 h-3.5" />
            <span>Search console...</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto no-scrollbar">
          <p className="px-3 mb-2 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Management</p>
          {navItems
            .filter((item: any) => !item.superOnly || userRole === 'super_admin')
            .map(({ href, label, icon: Icon, exact }) => {
              const isActive = exact ? pathname === href : pathname.startsWith(href);
              return (
                <a
                  key={href}
                  href={href}
                  className={`
                    group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                    transition-all duration-200
                    ${isActive
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/20'
                      : 'text-white/40 hover:text-white hover:bg-white/[0.03]'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-white/30 group-hover:text-white/60'}`} />
                  {label}
                </a>
              );
            })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 mt-auto">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                <Users className="w-4 h-4 text-slate-400" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">System Administrator</p>
                <p className="text-[10px] text-white/40 truncate">v1.2.0-stable</p>
              </div>
            </div>
            <button
              onClick={() => {
                useAdminMode.getState().setMode('user');
                router.push('/');
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all border border-white/5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Return to App
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto bg-[#050505] relative">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md px-8 flex items-center justify-between">
          <h1 className="text-sm font-bold text-white/60 uppercase tracking-widest">
            {navItems.find(i => pathname === i.href || (i.href !== '/admin' && pathname.startsWith(i.href)))?.label || 'Overview'}
          </h1>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-white/5 transition-colors relative">
              <Bell className="w-5 h-5 text-white/40" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-violet-500 rounded-full border-2 border-[#050505]" />
            </button>
            <div className="h-8 w-px bg-white/10 mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white leading-none">Console</p>
                <p className="text-[10px] text-green-500 mt-1 font-bold">● Live</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
