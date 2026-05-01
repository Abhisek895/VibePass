'use client';

import React from 'react';
import { useAIDashboard } from '@/hooks/use-admin-intelligence';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/loading-skeleton';
import { Button } from '@/components/ui/button';
import { Brain, ShieldAlert, AlertCircle, ArrowRight, Activity, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AIDashboardPage() {
  const { data: insights, isLoading } = useAIDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  const riskColor = {
    LOW: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    MEDIUM: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    HIGH: 'text-orange-400 border-orange-500/20 bg-orange-500/5',
    CRITICAL: 'text-red-400 border-red-500/20 bg-red-500/5',
  };

  const stats = [
    { label: 'High Risk Users', value: insights?.filter(i => i.riskLevel === 'HIGH' || i.riskLevel === 'CRITICAL').length || 0, icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Anomalies Detected', value: insights?.filter(i => i.anomalyDetected).length || 0, icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Total Analyses', value: insights?.length || 0, icon: Brain, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            AI Intelligence Center
          </h1>
          <p className="text-white/40 mt-1 font-medium">
            Strategic behavioral analysis and platform safety oversight.
          </p>
        </div>
        <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-6">
          Refresh Analytics
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="vibe-card flex items-center justify-between group hover:border-white/10 transition-all duration-300">
            <div>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{stat.label}</p>
              <h3 className="text-4xl font-black mt-2 text-white">{stat.value}</h3>
            </div>
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-7 h-7" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Priority Investigations */}
        <div className="lg:col-span-2 vibe-card !p-0 overflow-hidden border-white/5">
          <div className="px-8 py-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-3 text-white">
              <TrendingUp className="w-5 h-5 text-violet-400" />
              Priority Investigations
            </h3>
            <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20">Real-time</Badge>
          </div>
          <div className="divide-y divide-white/5">
            {insights?.filter(i => i.riskLevel === 'HIGH' || i.riskLevel === 'CRITICAL').map((insight) => (
              <div key={insight.id} className="p-6 hover:bg-white/[0.02] transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-6">
                  <div className={`w-1.5 h-12 rounded-full ${insight.riskLevel === 'CRITICAL' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]'}`} />
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg text-white">User {insight.userId.slice(0, 8)}</span>
                      <div className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase ${riskColor[insight.riskLevel]}`}>
                        {insight.riskLevel}
                      </div>
                    </div>
                    <p className="text-sm text-white/40 mt-1 line-clamp-1 max-w-xl">
                      {insight.behaviorSummary}
                    </p>
                  </div>
                </div>
                <Link href={`/admin/users/${insight.userId}`}>
                  <Button variant="outline" size="sm" className="rounded-xl border-white/10 hover:bg-white/10 text-xs font-bold">
                    Profile Audit <ArrowRight className="w-3.5 h-3.5 ml-2" />
                  </Button>
                </Link>
              </div>
            ))}
            {(!insights || insights.filter(i => i.riskLevel === 'HIGH' || i.riskLevel === 'CRITICAL').length === 0) && (
              <div className="py-24 text-center space-y-3">
                <ShieldAlert className="w-12 h-12 text-white/5 mx-auto" />
                <p className="text-white/20 font-medium italic">No high-risk subjects detected in this cycle.</p>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          <div className="vibe-card border-amber-500/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="font-bold text-white">Recent Anomalies</h3>
            </div>
            <div className="space-y-4">
              {insights?.filter(i => i.anomalyDetected).slice(0, 4).map((insight) => (
                <div key={insight.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 group hover:border-amber-500/30 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Signal Detected</span>
                    <span className="text-[10px] text-white/20">{new Date(insight.generatedAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed line-clamp-2">
                    {insight.alerts[0] || 'Behavioral deviation from normal baseline.'}
                  </p>
                </div>
              ))}
              {(!insights || insights.filter(i => i.anomalyDetected).length === 0) && (
                <p className="text-center py-6 text-white/20 text-xs italic border border-dashed border-white/5 rounded-xl">No anomalies recorded.</p>
              )}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-600/20 via-violet-600/10 to-transparent border border-violet-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Brain className="w-16 h-16 text-white" />
            </div>
            <h4 className="font-bold text-white flex items-center gap-2">
              System Health
            </h4>
            <p className="text-xs text-white/40 mt-3 leading-relaxed">
              Platform intelligence is currently focused on identifying harassment patterns and suspicious account spikes. Insights are updated every 2 hours.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-green-500/80 uppercase">AI Core Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
