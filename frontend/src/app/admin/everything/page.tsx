'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/loading-skeleton';
import { useAdminMode } from '@/store/admin-mode';
import { useAllMessages, useAllVoiceSessions } from '@/hooks/use-super-admin';
import { ArrowLeft, MessageSquare, Phone, Search, Eye, User, Calendar } from 'lucide-react';

const LIMIT = 50;

export default function AdminEverythingPage() {
  const router = useRouter();
  const { userRole } = useAdminMode();
  const isSuperAdmin = userRole === 'super_admin';

  const [msgSearch, setMsgSearch] = useState('');
  const [msgSenderId, setMsgSenderId] = useState('');
  const [msgOffset, setMsgOffset] = useState(0);

  const [voiceOffset, setVoiceOffset] = useState(0);

  const [lookupId, setLookupId] = useState('');

  const { data: messagesData, isLoading: messagesLoading } = useAllMessages(
    msgSearch || undefined,
    msgSenderId || undefined,
    LIMIT,
    msgOffset
  );

  const { data: voiceData, isLoading: voiceLoading } = useAllVoiceSessions(LIMIT, voiceOffset);

  if (!isSuperAdmin) {
    return (
      <div className="p-8">
        <p className="text-red-400 font-medium">Access Denied</p>
        <p className="text-white/50 text-sm mt-1">This page is restricted to super_admin only.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/admin')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  const totalMsgPages = messagesData ? Math.ceil(messagesData.total / LIMIT) : 0;
  const totalVoicePages = voiceData ? Math.ceil(voiceData.total / LIMIT) : 0;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/admin')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Eye className="w-7 h-7 text-violet-400" />
            Everything
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Global view of all messages, voice sessions, and user data — super_admin only.
          </p>
        </div>
        <Badge variant="danger">SUPER ADMIN</Badge>
      </div>

      {/* Quick User Lookup */}
      <Card className="border-violet-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="w-4 h-4 text-violet-400" /> Quick User Lookup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter user ID..."
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50"
            />
            <Button
              size="sm"
              onClick={() => lookupId && router.push(`/admin/users/${lookupId}`)}
              disabled={!lookupId}
            >
              <Search className="w-4 h-4 mr-2" /> View User
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => lookupId && router.push(`/admin/users/${lookupId}?tab=everything`)}
              disabled={!lookupId}
            >
              Everything Tab
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-900/30 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <div className="text-xl font-bold">{messagesData?.total ?? '—'}</div>
              <div className="text-xs text-muted-foreground">Total Messages</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-900/30 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-xl font-bold">{voiceData?.total ?? '—'}</div>
              <div className="text-xs text-muted-foreground">Total Voice Sessions</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="w-4 h-4 text-violet-400" /> All Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search message content..."
              value={msgSearch}
              onChange={(e) => { setMsgSearch(e.target.value); setMsgOffset(0); }}
              className="flex-1 min-w-[200px] bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50"
            />
            <input
              type="text"
              placeholder="Filter by sender ID..."
              value={msgSenderId}
              onChange={(e) => { setMsgSenderId(e.target.value); setMsgOffset(0); }}
              className="w-48 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50"
            />
          </div>

          {messagesLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : !messagesData?.messages.length ? (
            <p className="text-muted-foreground text-sm text-center py-4">No messages found.</p>
          ) : (
            <div className="space-y-2">
              {messagesData.messages.map((m) => (
                <div
                  key={m.id}
                  className={`text-sm border rounded px-3 py-2 ${m.isDeleted ? 'border-red-500/20 bg-red-500/5' : 'border-gray-800'}`}
                >
                  <div className="flex items-center gap-2 text-xs text-white/40 mb-1 flex-wrap">
                    <span className="font-medium text-white/60">{m.sender.username || m.sender.email}</span>
                    <span>in chat with {m.chat.user1.username || m.chat.user1.email} ↔ {m.chat.user2.username || m.chat.user2.email}</span>
                    <span className="ml-auto flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(m.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className={m.isDeleted ? 'line-through opacity-60' : ''}>{m.content}</p>
                  {m.isDeleted && <Badge variant="danger" size="sm" className="mt-1">Deleted</Badge>}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalMsgPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <Button
                size="sm"
                variant="outline"
                disabled={msgOffset === 0}
                onClick={() => setMsgOffset((o) => Math.max(0, o - LIMIT))}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {Math.floor(msgOffset / LIMIT) + 1} of {totalMsgPages} ({messagesData?.total} total)
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={msgOffset + LIMIT >= (messagesData?.total ?? 0)}
                onClick={() => setMsgOffset((o) => o + LIMIT)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Voice Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="w-4 h-4 text-emerald-400" /> All Voice Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {voiceLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : !voiceData?.sessions.length ? (
            <p className="text-muted-foreground text-sm text-center py-4">No voice sessions found.</p>
          ) : (
            <div className="space-y-2">
              {voiceData.sessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm border border-gray-800 rounded px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-900/30 flex items-center justify-center text-xs font-bold">
                      {s.user1?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-medium">
                        {s.user1?.username || s.user1?.email} ↔ {s.user2?.username || s.user2?.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.durationSeconds
                          ? `${Math.floor(s.durationSeconds / 60)}m ${s.durationSeconds % 60}s`
                          : s.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/30">
                      {s.startedAt ? new Date(s.startedAt).toLocaleDateString() : '—'}
                    </span>
                    <Badge variant={s.status === 'completed' ? 'success' : s.status === 'requested' ? 'warning' : 'default'}>
                      {s.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalVoicePages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <Button
                size="sm"
                variant="outline"
                disabled={voiceOffset === 0}
                onClick={() => setVoiceOffset((o) => Math.max(0, o - LIMIT))}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {Math.floor(voiceOffset / LIMIT) + 1} of {totalVoicePages} ({voiceData?.total} total)
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={voiceOffset + LIMIT >= (voiceData?.total ?? 0)}
                onClick={() => setVoiceOffset((o) => o + LIMIT)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

