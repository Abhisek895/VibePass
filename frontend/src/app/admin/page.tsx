'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/loading-skeleton';
import { useToast } from '@/components/ui/toast';
import { Users, MessageSquare, Shield, Phone, TrendingUp, AlertTriangle, ClipboardList } from 'lucide-react';
import { apiRequest } from '@/services/api/client';

interface AnalyticsData {
  users: {
    total: number;
    active: number;
    banned: number;
    growth: { date: string; count: number }[];
  };
  engagement: {
    totalMatches: number;
    totalChats: number;
    totalVoiceCalls: number;
  };
  safety: {
    totalReports: number;
    pendingReports: number;
  };
  system: {
    totalAuditLogs: number;
  };
}

const kpis = (data: AnalyticsData) => [
  {
    label: 'Total Users',
    value: data.users.total.toLocaleString(),
    sub: `${data.users.active} active · ${data.users.banned} banned`,
    icon: Users,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
  {
    label: 'Messages',
    value: data.engagement.totalChats.toLocaleString(),
    sub: 'total messages exchanged',
    icon: MessageSquare,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    label: 'Voice Calls',
    value: data.engagement.totalVoiceCalls.toLocaleString(),
    sub: 'sessions completed',
    icon: Phone,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    label: 'Pending Reports',
    value: data.safety.pendingReports.toLocaleString(),
    sub: `${data.safety.totalReports} total reports`,
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    label: 'Total Matches',
    value: data.engagement.totalMatches.toLocaleString(),
    sub: 'connections made',
    icon: Shield,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
  },
  {
    label: 'Audit Logs',
    value: data.system.totalAuditLogs.toLocaleString(),
    sub: 'admin actions recorded',
    icon: ClipboardList,
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
  },
];

export default function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    apiRequest<AnalyticsData>('/api/v1/admin-panel/analytics', { auth: true })
      .then(setData)
      .catch(() => addToast({ type: 'error', title: 'Failed to load analytics' }))
      .finally(() => setLoading(false));
  }, [addToast]);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400 font-medium">Failed to load analytics</p>
          <p className="text-white/40 text-sm mt-1">Make sure you are logged in as an admin.</p>
        </div>
      </div>
    );
  }

  const maxGrowth = Math.max(...data.users.growth.map((g) => g.count), 1);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="text-white/40 mt-1 text-sm">Platform overview and live metrics</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis(data).map(({ label, value, sub, icon: Icon, color, bg }) => (
          <Card key={label} className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs text-white/50 font-medium uppercase tracking-wide">
                {label}
              </CardTitle>
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{value}</div>
              <p className="text-xs text-white/40 mt-1">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Growth Chart */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white/80 text-sm">
            <TrendingUp className="w-4 h-4 text-violet-400" />
            User Registrations — Last 7 Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-end gap-3 px-2">
            {data.users.growth.map((day) => {
              const pct = Math.max((day.count / maxGrowth) * 100, 2);
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full">
                    <div
                      className="w-full bg-violet-600/60 group-hover:bg-violet-500 rounded-t-lg transition-all duration-300"
                      style={{ height: `${(pct / 100) * 160}px` }}
                      title={`${day.date}: ${day.count} new users`}
                    />
                    {day.count > 0 && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white/60 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {day.count}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-white/30">{day.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: '/admin/users', label: 'Manage Users', desc: 'Ban, suspend, or change roles', color: 'border-violet-500/20 hover:border-violet-500/40' },
          { href: '/admin/reports', label: 'Review Reports', desc: `${data.safety.pendingReports} reports need attention`, color: 'border-amber-500/20 hover:border-amber-500/40' },
          { href: '/admin/content', label: 'Moderate Content', desc: 'Review and remove posts', color: 'border-blue-500/20 hover:border-blue-500/40' },
        ].map(({ href, label, desc, color }) => (
          <a
            key={href}
            href={href}
            className={`block rounded-2xl border ${color} bg-white/3 p-5 transition-all duration-200 hover:bg-white/6`}
          >
            <p className="font-semibold text-white text-sm">{label}</p>
            <p className="text-white/40 text-xs mt-1">{desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
