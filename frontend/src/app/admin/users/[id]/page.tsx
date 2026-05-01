'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/loading-skeleton';
import { useToast } from '@/components/ui/toast';
import { useAdminUserDetail } from '@/hooks/use-admin-user-detail';
import { useAdminMode } from '@/store/admin-mode';
import { 
  useUserChats,
  useChatMessages,
  useUserRelationships,
  useUserBlocks,
  useUserVoiceSessions,
  useUserNotifications,
  useUserBadges,
  useUserFeedback,
  useUserEverything,
} from '@/hooks/use-super-admin';
import { 
  useUserAIInsight, 
  useAuditSession 
} from '@/hooks/use-admin-intelligence';
import { AIIntelligenceTab } from './components/ai-intelligence-tab';
import { AuditTab } from './components/audit-tab';
import { AdminChatInbox } from './components/admin-chat-inbox';
import { RelationshipsTab } from './components/relationships-tab';
import { AuditSession } from '@/lib/types/admin';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  FileText,
  Flag,
  Shield,
  AlertTriangle,
  Heart,
  MessageSquare,
  Phone,
  Ban,
  Bell,
  Award,
  ThumbsUp,
  ThumbsDown,
  Eye,
  X,
  Hash,
  Brain,
  Search,
  Activity,
  Award as AwardIcon,
  ExternalLink,
  Zap,
  TrendingUp,
} from 'lucide-react';

type TabKey =
  | 'profile'
  | 'posts'
  | 'reports'
  | 'everything'
  | 'chats'
  | 'relationships'
  | 'blocks'
  | 'voice'
  | 'notifications'
  | 'badges'
  | 'feedback'
  | 'intelligence'
  | 'audit';

const statusColor: Record<string, string> = {
  pending: 'warning',
  resolved: 'success',
  dismissed: 'default',
  escalated: 'danger',
};

const tabGroups: { label: string; isSensitive?: boolean; tabs: { key: TabKey; label: string; icon: any }[] }[] = [
  { 
    label: 'Overview', 
    tabs: [
      { key: 'profile', label: 'Identity', icon: User },
    ]
  },
  {
    label: 'Social & Content',
    tabs: [
      { key: 'posts', label: 'Posts', icon: FileText },
      { key: 'reports', label: 'Reports', icon: Flag },
      { key: 'badges', label: 'Badges', icon: AwardIcon },
    ]
  },
  {
    label: 'Security & Intelligence',
    tabs: [
      { key: 'intelligence', label: 'AI Risk Profile', icon: Brain },
      { key: 'audit', label: 'Audit Control', icon: Shield },
    ]
  },
  {
    label: 'Sensitive Data',
    isSensitive: true,
    tabs: [
      { key: 'chats', label: 'Conversations', icon: MessageSquare },
      { key: 'relationships', label: 'Relationships', icon: Heart },
      { key: 'voice', label: 'Voice Sessions', icon: Phone },
      { key: 'notifications', label: 'System Alerts', icon: Bell },
    ]
  }
];

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToast } = useToast();
  const { userRole } = useAdminMode();
  const isSuperAdmin = userRole === 'super_admin';

  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<AuditSession | null>(null);

  const { data: user, isLoading: userLoading } = useAdminUserDetail(id);
  
  const { data: aiInsight, isLoading: aiLoading } = useUserAIInsight(
    activeTab === 'intelligence' ? id : undefined
  );

  const { startSession, endSession } = useAuditSession();

  useEffect(() => {
    const s = localStorage.getItem('active_audit_session');
    if (s) {
      const session = JSON.parse(s);
      if (session.userId === id) setActiveSession(session);
    }
  }, [id]);

  const { data: chatsData, isLoading: chatsLoading } = useUserChats(isSuperAdmin && activeTab === 'chats' ? id : undefined);
  const { data: messagesData, isLoading: messagesLoading } = useChatMessages(selectedChatId ?? undefined);
  const { data: relationshipsData, isLoading: relationshipsLoading } = useUserRelationships(
    isSuperAdmin && activeTab === 'relationships' ? id : undefined
  );
  const { data: voiceSessionsData, isLoading: voiceSessionsLoading } = useUserVoiceSessions(
    isSuperAdmin && activeTab === 'voice' ? id : undefined
  );
  const { data: notificationsData, isLoading: notificationsLoading } = useUserNotifications(
    isSuperAdmin && activeTab === 'notifications' ? id : undefined
  );

  const handleAction = async (endpoint: string, body?: object) => {
    if (!id) return;
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch('/api/v1/admin-panel/users/' + id + '/' + endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(body || {}),
      });
      const json = await res.json();
      if (json.success) addToast({ type: 'success', title: json.message });
      else addToast({ type: 'error', title: 'Action failed' });
    } catch {
      addToast({ type: 'error', title: 'Action failed' });
    }
  };

  const isTabSensitive = (key: TabKey) => {
    return tabGroups.find(g => g.tabs.find(t => t.key === key))?.isSensitive;
  };

  if (userLoading) {
    return (
      <div className="space-y-6 p-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}
          </div>
          <div className="md:col-span-3">
            <Skeleton className="h-[600px] rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="vibe-card text-center py-20 m-8">
        <p className="text-red-400 font-bold text-xl">Target user not found.</p>
        <Button variant="outline" className="mt-6 rounded-xl" onClick={() => router.back()}>
          Return to Directory
        </Button>
      </div>
    );
  }


  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/30 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" /> User Directory
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-3xl shadow-2xl">
              {user.profile?.nickname?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-white">
                {user.profile?.nickname || user.username || user.email.split('@')[0]}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant={user.isBanned ? 'danger' : user.isSuspended ? 'warning' : 'success'} className="rounded-md uppercase tracking-tighter text-[10px] font-black px-2">
                  {user.isBanned ? 'Banned' : user.isSuspended ? 'Suspended' : 'Active Status'}
                </Badge>
                <span className="text-white/20 font-bold text-xs uppercase tracking-widest">ID: {user.id.slice(0, 12)}...</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeSession && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-violet-600/10 border border-violet-500/30 text-violet-400">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">Audit Active</span>
            </div>
          )}
          <Button variant="outline" className="rounded-xl border-white/5 hover:bg-white/5">
            Admin Logs
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-1 space-y-8">
          {tabGroups.map((group) => (
            <div key={group.label} className="space-y-3">
              <p className="px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{group.label}</p>
              <div className="space-y-1">
                {group.tabs.map((tab) => {
                  const isLocked = group.isSensitive && !activeSession;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setActiveTab(tab.key);
                        setSelectedChatId(null);
                      }}
                      className={`
                        w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
                        ${activeTab === tab.key 
                          ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/20 font-bold' 
                          : 'text-white/40 hover:text-white/80 hover:bg-white/[0.03] font-medium'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.key ? 'text-white' : 'text-white/30 group-hover:text-white/60'}`} />
                        <span className="text-sm">{tab.label}</span>
                      </div>
                      {isLocked && <Shield className="w-3.5 h-3.5 text-orange-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-3 min-h-[600px]">
          {isTabSensitive(activeTab) && !activeSession ? (
            <div className="vibe-card !p-8 h-full max-w-2xl mx-auto border-violet-500/20 bg-[#0A0A0B]">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-5 h-5 text-amber-500" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Super Admin Audit Mode</h2>
              </div>
              
              <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="text-sm font-bold text-amber-500">High Privilege Access Required</h3>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  Audit Mode is required to view sensitive user data including full chat transcripts, 
                  deleted messages, and system logs. All actions performed during this session are 
                  recorded and permanently linked to your admin account.
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Reason for Audit</p>
                <textarea 
                  className="w-full h-32 bg-black/40 border border-white/5 rounded-2xl p-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/30 transition-all resize-none"
                  placeholder="Enter detailed justification for accessing sensitive data..."
                  id="audit-reason"
                />
                
                <Button 
                  onClick={async () => {
                    const reason = (document.getElementById('audit-reason') as HTMLTextAreaElement)?.value;
                    if (!reason) return alert('Please provide a reason');
                    const s = await startSession({ userId: id, reason });
                    setActiveSession(s);
                  }}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-2xl h-14 font-bold text-lg shadow-xl shadow-violet-900/20 flex items-center justify-center gap-3"
                >
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                  Start Audit Session
                </Button>
              </div>

              <p className="text-center mt-8 text-[10px] font-bold text-violet-400/50 uppercase tracking-widest">
                All data access is logged under Audit ID: PENDING
              </p>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right-4 duration-300">
              {activeTab === 'profile' && (
                <div className="grid gap-8">
                  <div className="vibe-card space-y-8">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                      <User className="w-5 h-5 text-violet-400" />
                      Core Identity
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 text-sm">
                      {[
                        { label: 'Nickname', value: user.profile?.nickname || 'Not Provided' },
                        { label: 'Email', value: user.email },
                        { label: 'Username', value: user.username || 'Unset' },
                        { label: 'Trust Score', value: user.trustScore, color: 'text-violet-400' },
                        { label: 'Joined', value: new Date(user.createdAt).toLocaleDateString() },
                        { label: 'Role', value: user.role, color: 'text-amber-400 uppercase font-black' },
                      ].map(item => (
                        <div key={item.label} className="space-y-1">
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{item.label}</p>
                          <p className={`font-bold ${item.color || 'text-white'}`}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="vibe-card">
                    <h3 className="text-lg font-bold mb-6">Quick Actions</h3>
                    <div className="flex flex-wrap gap-4">
                      {!user.isBanned ? (
                        <Button onClick={() => handleAction('ban')} variant="danger" className="rounded-xl px-6">Ban User</Button>
                      ) : (
                        <Button onClick={() => handleAction('unban')} variant="outline" className="rounded-xl px-6">Unban User</Button>
                      )}
                      {!user.isSuspended ? (
                        <Button onClick={() => handleAction('suspend', { days: 7 })} className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-6">Suspend 7d</Button>
                      ) : (
                        <Button onClick={() => handleAction('unsuspend')} variant="outline" className="rounded-xl px-6">Unsuspend</Button>
                      )}
                    </div>
                  </div>
                </div>
              )}


              {activeTab === 'intelligence' && (
                  <AIIntelligenceTab userId={id} insight={aiInsight} isLoading={aiLoading} />
              )}

              {activeTab === 'audit' && (
                <AuditTab 
                  userId={id} 
                  activeSession={activeSession} 
                  onStart={async (reason) => {
                    const s = await startSession({ userId: id, reason });
                    setActiveSession(s);
                  }}
                  onEnd={async () => {
                    if (activeSession) {
                      await endSession(activeSession.id);
                      setActiveSession(null);
                    }
                  }}
                />
              )}

              {activeTab === 'chats' && (
                <AdminChatInbox 
                  chats={chatsData?.chats}
                  messages={messagesData?.messages}
                  selectedChatId={selectedChatId}
                  onSelectChat={setSelectedChatId}
                  isLoading={chatsLoading}
                  messagesLoading={messagesLoading}
                />
              )}

              {activeTab === 'relationships' && (
                <RelationshipsTab 
                  relationships={relationshipsData}
                  isLoading={relationshipsLoading}
                />
              )}

              {activeTab === 'voice' && (
                <div className="vibe-card border-white/5 bg-[#0A0A0B] min-h-[400px] flex items-center justify-center relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
                   <div className="p-12 text-center max-w-sm">
                      <div className="w-20 h-20 rounded-3xl bg-violet-600/5 flex items-center justify-center mx-auto mb-6 border border-violet-500/10">
                        <Phone className="w-8 h-8 text-violet-500/40" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Voice Call History</h3>
                      <p className="text-xs text-white/30 leading-relaxed italic">
                        The secure voice session logger is currently being calibrated for high-volume audit tracking. All call metadata is being recorded in the background.
                      </p>
                   </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="vibe-card border-white/5 bg-[#0A0A0B] min-h-[400px] flex items-center justify-center relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                   <div className="p-12 text-center max-w-sm">
                      <div className="w-20 h-20 rounded-3xl bg-blue-600/5 flex items-center justify-center mx-auto mb-6 border border-blue-500/10">
                        <Bell className="w-8 h-8 text-blue-500/40" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">System Alert Engine</h3>
                      <p className="text-xs text-white/30 leading-relaxed italic">
                        The real-time notification audit stream is undergoing a security handshake. System alerts are being captured and will be visible shortly.
                      </p>
                   </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

