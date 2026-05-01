'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/loading-skeleton';
import { TrendingUp, Users, MessageSquare, Shield, Phone, AlertTriangle, Heart } from 'lucide-react';
import { apiRequest } from '@/services/api/client';

interface AnalyticsData {
  users: { total: number; active: number; banned: number; growth: { date: string; count: number }[] };
  engagement: { totalMatches: number; totalChats: number; totalVoiceCalls: number };
  safety: { totalReports: number; pendingReports: number };
  system: { totalAuditLogs: number };
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<AnalyticsData>('/api/v1/admin-panel/analytics', { auth: true })
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-72 rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400 font-medium">Failed to load analytics</p>
        </div>
      </div>
    );
  }

  const maxGrowth = Math.max(...data.users.growth.map((g) => g.count), 1);
  const bannedPct = data.users.total > 0 ? Math.round((data.users.banned / data.users.total) * 100) : 0;
  const pendingPct = data.safety.totalReports > 0 ? Math.round((data.safety.pendingReports / data.safety.totalReports) * 100) : 0;

  const metrics = [
    { label: 'Total Users', value: data.users.total, sub: `${data.users.active} active`, icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Banned Users', value: data.users.banned, sub: `${bannedPct}% of total`, icon: Shield, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { label: 'Total Matches', value: data.engagement.totalMatches, sub: 'connections made', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { label: 'Messages', value: data.engagement.totalChats, sub: 'exchanged', icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Voice Sessions', value: data.engagement.totalVoiceCalls, sub: 'completed', icon: Phone, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Pending Reports', value: data.safety.pendingReports, sub: `${pendingPct}% unresolved`, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-white/40 text-sm mt-1">Platform performance metrics</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <Card key={label} className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs text-white/40 uppercase tracking-wider font-medium">{label}</CardTitle>
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{value.toLocaleString()}</div>
              <p className="text-xs text-white/30 mt-1">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Growth Chart */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-white/70">
            <TrendingUp className="w-4 h-4 text-violet-400" />
            User Registrations — Last 7 Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-52 flex items-end gap-4 px-4 pb-2">
            {data.users.growth.map((day) => {
              const pct = Math.max((day.count / maxGrowth) * 100, 1);
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group relative">
                  <div
                    className="absolute -top-7 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
                  >
                    {day.count} users
                  </div>
                  <div
                    className="w-full bg-violet-600/50 group-hover:bg-violet-500 rounded-t-lg transition-all duration-300 cursor-default"
                    style={{ height: `${(pct / 100) * 180}px`, minHeight: '4px' }}
                  />
                  <span className="text-[10px] text-white/30">{day.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Safety breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm text-white/60">User Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Active', value: data.users.active, pct: data.users.total > 0 ? Math.round((data.users.active / data.users.total) * 100) : 0, color: 'bg-emerald-500' },
              { label: 'Banned', value: data.users.banned, pct: bannedPct, color: 'bg-rose-500' },
            ].map(({ label, value, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/50">{label}</span>
                  <span className="text-white">{value.toLocaleString()} ({pct}%)</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm text-white/60">Safety Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Resolved', value: data.safety.totalReports - data.safety.pendingReports, pct: 100 - pendingPct, color: 'bg-emerald-500' },
              { label: 'Pending', value: data.safety.pendingReports, pct: pendingPct, color: 'bg-amber-500' },
            ].map(({ label, value, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/50">{label}</span>
                  <span className="text-white">{value.toLocaleString()} ({pct}%)</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
