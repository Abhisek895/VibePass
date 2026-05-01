'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/services/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  MessageSquare, 
  Heart, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  User as UserIcon,
  Filter,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/loading-skeleton';

export default function GlobalMonitoringPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<'messages' | 'matches'>('messages');

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['admin', 'global-messages', searchTerm],
    queryFn: () => apiRequest<any>(`/api/v1/admin-panel/messages/all?search=${searchTerm}`, { auth: true }),
    enabled: activeView === 'messages'
  });

  const { data: voiceSessions, isLoading: voiceLoading } = useQuery({
    queryKey: ['admin', 'global-voice', searchTerm],
    queryFn: () => apiRequest<any>(`/api/v1/admin-panel/voice-sessions/all`, { auth: true }),
    enabled: activeView === 'matches'
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white">Live Monitoring</h1>
          <p className="text-white/40 mt-1 font-medium">Global oversight of platform interactions and connectivity.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
          <button 
            onClick={() => setActiveView('messages')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeView === 'messages' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/20' : 'text-white/40 hover:text-white/60'}`}
          >
            Messages
          </button>
          <button 
            onClick={() => setActiveView('matches')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeView === 'matches' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/20' : 'text-white/40 hover:text-white/60'}`}
          >
            Voice Calls
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="vibe-card flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input 
            placeholder={`Search across all ${activeView}...`}
            className="pl-12 bg-white/[0.02] border-white/5 rounded-xl h-12 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-12 px-6 rounded-xl border-white/5 hover:bg-white/5 text-white/60 gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Content Area */}
      {activeView === 'messages' ? (
        <div className="space-y-4">
          {messagesLoading ? (
             <div className="grid gap-4">
               {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
             </div>
          ) : (
            <div className="grid gap-4">
              {messages?.messages.map((msg: any) => (
                <div key={msg.id} className="vibe-card flex items-center justify-between group hover:border-white/10 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-violet-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-white">{msg.sender.username || 'System'}</span>
                        <ArrowRight className="w-3 h-3 text-white/20" />
                        <span className="text-white/60 font-medium">Channel {msg.chatId.slice(0, 8)}</span>
                      </div>
                      <p className="text-sm text-white/40 mt-1 max-w-2xl line-clamp-1">{msg.content}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 text-right">
                    <div className="hidden md:block">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Timestamp</p>
                      <p className="text-xs font-bold text-white/40 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                    </div>
                    <Link href={`/admin/users/${msg.senderId}`}>
                      <Button variant="ghost" size="sm" className="rounded-xl hover:bg-white/5 group-hover:text-violet-400">
                        View Sender
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              {(!messages || messages.messages.length === 0) && (
                <div className="vibe-card text-center py-24">
                  <MessageSquare className="w-16 h-16 text-white/5 mx-auto mb-4" />
                  <p className="text-white/20 font-medium italic text-lg">No global messages match your search.</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {voiceLoading ? (
            <div className="grid gap-4">
               {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
             </div>
          ) : (
            <div className="grid gap-4">
              {voiceSessions?.sessions.map((session: any) => (
                <div key={session.id} className="vibe-card flex items-center justify-between group hover:border-white/10 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-violet-600/10 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-violet-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-white">{session.user1.username} & {session.user2.username}</span>
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">Active</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-white/30 font-medium">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Started {new Date(session.startedAt).toLocaleTimeString()}</span>
                        <span>Room: {session.roomId}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link href={`/admin/users/${session.user1Id}`}>
                      <Button variant="outline" size="sm" className="rounded-xl border-white/5 hover:bg-white/5 text-[10px] font-black uppercase">Admin Audit</Button>
                    </Link>
                  </div>
                </div>
              ))}
              {(!voiceSessions || voiceSessions.sessions.length === 0) && (
                <div className="vibe-card text-center py-24">
                  <Activity className="w-16 h-16 text-white/5 mx-auto mb-4" />
                  <p className="text-white/20 font-medium italic text-lg">No active voice sessions recorded.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Security Banner */}
      <div className="rounded-[32px] p-8 bg-violet-600 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">Full Privacy Enforcement</h3>
            <p className="text-white/70 font-medium max-w-md">Every message view and call audit is logged to the system audit trail. Please ensure you are within your operational mandate.</p>
          </div>
        </div>
        <Link href="/admin/audit-logs">
          <Button className="bg-white text-violet-600 hover:bg-white/90 rounded-2xl px-8 h-14 font-black shadow-2xl relative z-10 transition-transform active:scale-95">
            View Audit Logs
          </Button>
        </Link>
      </div>
    </div>
  );
}
