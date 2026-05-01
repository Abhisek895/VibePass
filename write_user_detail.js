const fs = require('fs');
const path = 'frontend/src/app/admin/users/[id]/page.tsx';

const content = `'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/loading-skeleton';
import { useToast } from '@/components/ui/toast';
import { useAdminUserDetail } from '@/hooks/use-admin-user-detail';
import { useAdminMode } from '@/store/admin-mode';
import {
  useUserChats, useChatMessages, useUserMatches, useUserMatchRequests,
  useUserBlocks, useUserVoiceSessions, useUserNotifications,
  useUserBadges, useUserFeedback, useUserEverything,
} from '@/hooks/use-super-admin';
import {
  ArrowLeft, User, Mail, Calendar, FileText, Flag, Shield, AlertTriangle,
  Heart, MessageSquare, Share2, ImageIcon, Phone, Ban, Bell, Award,
  ThumbsUp, ThumbsDown, Eye, X, Zap, Hash,
} from 'lucide-react';

type TabKey = 'profile' | 'posts' | 'reports' | 'everything' | 'chats' | 'matches' | 'matchRequests' | 'blocks' | 'voice' | 'notifications' | 'badges' | 'feedback';

const statusColor: Record<string, string> = { pending: 'warning', resolved: 'success', dismissed: 'default', escalated: 'danger' };

const allTabs: { key: TabKey; label: string }[] = [
  { key: 'profile', label: 'Profile' }, { key: 'posts', label: 'Posts' }, { key: 'reports', label: 'Reports' },
  { key: 'everything', label: 'Everything' }, { key: 'chats', label: 'Chats' }, { key: 'matches', label: 'Matches' },
  { key: 'matchRequests', label: 'Match Requests' }, { key: 'blocks', label: 'Blocks' }, { key: 'voice', label: 'Voice Calls' },
  { key: 'notifications', label: 'Notifications' }, { key: 'badges', label: 'Badges' }, { key: 'feedback', label: 'Feedback' },
];

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToast } = useToast();
  const { userRole } = useAdminMode();
  const isSuperAdmin = userRole === 'super_admin';
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const { data: user, isLoading: userLoading } = useAdminUserDetail(id);
  const { data: everythingData, isLoading: everythingLoading } = useUserEverything(isSuperAdmin && activeTab === 'everything' ? id : undefined);
  const { data: chatsData } = useUserChats(isSuperAdmin && activeTab === 'chats' ? id : undefined);
  const { data: messagesData } = useChatMessages(selectedChatId ?? undefined);
  const { data: matchesData } = useUserMatches(isSuperAdmin && activeTab === 'matches' ? id : undefined);
  const { data: matchReqData } = useUserMatchRequests(isSuperAdmin && activeTab === 'matchRequests' ? id : undefined);
  const { data: blocksData } = useUserBlocks(isSuperAdmin && activeTab === 'blocks' ? id : undefined);
  const { data: voiceData } = useUserVoiceSessions(isSuperAdmin && activeTab === 'voice' ? id : undefined);
  const { data: notifData } = useUserNotifications(isSuperAdmin && activeTab === 'notifications' ? id : undefined);
  const { data: badgesData } = useUserBadges(isSuperAdmin && activeTab === 'badges' ? id : undefined);
  const { data: feedbackData } = useUserFeedback(isSuperAdmin && activeTab === 'feedback' ? id : undefined);

  const doAction = async (endpoint: string, body?: object) => {
    if (!id) return;
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch('/api/v1/admin-panel/users/' + id + '/' + endpoint, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(body || {}),
      });
      const json = await res.json();
      if (json.success) addToast({ type: 'success', title: json.message });
      else addToast({ type: 'error', title: 'Action failed' });
    } catch { addToast({ type: 'error', title: 'Action failed' }); }
  };

  if (userLoading) {
    return (<div className="p-8 space-y-6"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[1,2,3].map((i)=><Skeleton key={i} className="h-32 rounded-lg" />)}</div><Skeleton className="h-64 rounded-lg" /></div>);
  }
  if (!user) {
    return (<div className="p-8"><p className="text-red-400">User not found.</p><Button variant="outline" className="mt-4" onClick={()=>router.back()}>Go Back</Button></div>);
  }

  const visibleTabs = isSuperAdmin ? allTabs : allTabs.filter((t)=>['profile','posts','reports'].includes(t.key));
  const ev = everythingData;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={()=>router.back()}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{user.profile?.nickname || user.username || user.email.split('@')[0]}</h1>
          <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {user.isBanned && <Badge variant="danger">Banned</Badge>}
          {user.isSuspended && <Badge variant="warning">Suspended</Badge>}
          {!user.isBanned && !user.isSuspended && <Badge variant="success">Active</Badge>}
          <Badge variant={user.role==='super_admin'?'danger':user.role==='admin'?'warning':'default'}>{user.role}</Badge>
        </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[{label:'Posts',value:user.stats.postsCount,icon:FileText},{label:'Reports Filed',value:user.stats.reportsMadeCount,icon:Flag},{label:'Reports Received',value:user.stats.reportsReceivedCount,icon:AlertTriangle},{label:'Trust Score',value:user.trustScore,icon:Shield}].map(({label,value,icon:Icon})=>(
          <Card key={label}><CardContent className="pt-4 pb-4 flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-violet-900/30 flex items-center justify-center shrink-0"><Icon className="w-5 h-5 text-violet-400" /></div><div><div className="text-xl font-bold">{value}</div><div className="text-xs text-muted-foreground">{label}</div></CardContent></Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-white/10 pb-2">
        {visibleTabs.map((tab)=>(
          <button key={tab.key} onClick={()=>{setActiveTab(tab.key);setSelectedChatId(null);}} className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-all '+(activeTab===tab.key?'bg-violet-500/20 text-violet-300 border border-violet-500/30':'text-white/40 hover:text-white hover:bg-white/5 border border-transparent')}>{tab.label}</button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* PROFILE */}
        {activeTab==='profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><User className="w-4 h-4" /> Profile Info</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-4 h-4 shrink-0" /><span>{user.email}</span></div>
                <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4 shrink-0" /><span>Joined {new Date(user.createdAt).toLocaleDateString()}</span></div>
                {user.profile?.age && <div className="flex items-center gap-2 text-muted-foreground"><User className="w-4 h-4 shrink-0" /><span>Age: {user.profile.age}</span></div>}
                {user.profile?.city && <div className="flex items-center gap-2 text-muted-foreground"><Shield className="w-4 h-4 shrink-0" /><span>{user.profile.city}{user.profile.country?', '+user.profile.country:''}</span></div>}
                {user.profile?.bio && <div className="mt-2 p-3 bg-gray-900 rounded text-muted-foreground italic text-xs">&ldquo;{user.profile.bio}&rdquo;</div>}
                <div className="pt-4 flex gap-2 flex-wrap">
                  <Button size="sm" variant={user.isBanned?'default':'outline'} onClick={()=>doAction(user.isBanned?'unban':'ban',{reason:'By admin'})}>{user.isBanned?'Unban User':'Ban User'}</Button>
                  <Button size="sm" variant={user.isSuspended?'default':'outline'} onClick={()=>doAction(user.isSuspended?'unsuspend':'suspend',{reason:'By admin',durationHours:24})}>{user.isSuspended?'Unsuspend':'Suspend 24h'}</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* POSTS */}
        {activeTab==='posts' && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><FileText className="w-4 h-4" /> Recent Posts ({user.stats.postsCount} total)</CardTitle></CardHeader>
            <CardContent>
              {user.posts.length===0?<p className="text-muted-foreground text-sm text-center py-4">No posts yet.</p>:(
                <div className="space-y-3">
                  {user.posts.map((post)=>(
                    <div key={post.id} className="border border-gray-800 rounded p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        {post.isDarkMeme && <Badge variant="danger" className="text-xs shrink-0">Dark Meme</Badge>}
                        <p className="text-sm line-clamp-2 flex-1">{post.content}</p>
                        {post.imageUrl && <ImageIcon className="w-4 h-4 text-muted-foreground shrink-0" />}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likesCount}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{post.commentsCount}</span>
                        <span className="flex items-center gap-1"><Share2 className="w-3 h-3" />{post.sharesCount}</span>
                        <span className="ml-auto">{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* REPORTS */}
        {activeTab==='reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="w-4 h-4 text-red-400" /> Reports Received ({user.stats.reportsReceivedCount})</CardTitle></CardHeader>
              <CardContent>
                {user.reportsReceived.length===0?<p className="text-muted-foreground text-sm text-center py-4">No reports received.</p>:(
                  <div className="space-y-2">
                    {user.reportsReceived.map((r)=>(
                      <div key={r.id} className="flex items-center justify-between text-sm border border-gray-800 rounded px-3 py-2">
                        <div><span className="font-medium capitalize">{r.reason.replace('_',' ')}</span><span className="text-muted-foreground ml-2 text-xs">by {r.reporter.username||r.reporter.email}</span></div>
                        <Badge variant={(statusColor[r.status] as any)||'default'}>{r.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Flag className="w-4 h-4 text-yellow-400" /> Reports Filed ({user.stats.reportsMadeCount})</CardTitle></CardHeader>
              <CardContent>
                {user.reportsMade.length===0?<p className="text-muted-foreground text-sm text-center py-4">No reports filed.</p>:(
                  <div className="space-y-2">
                    {user.reportsMade.map((r)=>(
                      <div key={r.id} className="flex items-center justify-between text-sm border border-gray-800 rounded px-3 py-2">
                        <div><span className="font-medium capitalize">{r.reason.replace('_',' ')}</span><span className="text-muted-foreground ml-2 text-xs">against {r.reported.username||r.reported.email}</span></div>
                        <Badge variant={(statusColor[r.status] as any)||'default'}>{r.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* EVERYTHING */}
        {activeTab==='everything' && (
          <div className="space-y-6">
            {everythingLoading && (
              <div className="space-y-4"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4,5,6,7,8].map((i)=><Skeleton key={i} className="h-20 rounded-lg" />)}</div>
            )}
            {!everythingLoading && ev && (
              <>
                <Card className="border-violet-500/20">
                  <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Zap className="w-4 h-4 text-violet-400" /> User Summary</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /><span>{ev.user.email}</span></div>
                      <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-muted-foreground" /><span>Trust Score: {ev.user.trustScore}</span></div>
                      <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" /><span>Joined: {new Date(ev.user.createdAt).toLocaleDateString()}</span></div>
                      <Badge variant={ev.user.isBanned?'danger':ev.user.isSuspended?'warning':'success'}>{ev.user.isBanned?'Banned':ev.user.isSuspended?'Suspended':'Active'}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[{label:'Posts',value:ev.posts.length,icon:FileText},{label:'Badges',value:ev.badges.length,icon:Award},{label:'Likes Sent',value:ev.likesSent.length,icon:ThumbsUp},{label:'Likes Received',value:ev.likesReceived.length,icon:Heart},{label:'Matches',value:ev.matches.length,icon:Hash},{label:'Chats',value:ev.chats.length,icon:MessageSquare},{label:'Blocked',value:ev.blocked.length,icon:Ban},{label:'Blocked By',value:ev.blockedBy.length,icon:Ban},{label:'Voice Sessions',value:ev.voiceSessions.length,icon:Phone},{label:'Notifications',value:ev.notifications.length,icon:Bell},{label:'Reports Made',value:ev.reportsMade.length,icon:Flag},{label:'Reports Received',value:ev.reportsReceived.length,icon:AlertTriangle}].map(({label,value,icon:Icon})=>(
                    <Card key={label}><CardContent className="pt-4 pb-4 flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-violet-900/30 flex items-center justify-center shrink-0"><Icon className="w-5 h-5 text-violet-400" /></div><div><div className="text-xl font-bold">{value}</div><div className="text-xs text-muted-foreground">{label}</div></CardContent></Card>
                  ))}
                </div>

                {ev.posts.length>0 && <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><FileText className="w-4 h-4" /> Posts ({ev.posts.length})</CardTitle></CardHeader><CardContent className="space-y-2">{ev.posts.map((p)=><div key={p.id} className="text-sm border border-gray-800 rounded px-3 py-2"><p className="line-clamp-2">{p.content}</p><div className="flex items-center gap-3 text-xs text-muted-foreground mt-1"><span>{p.likesCount} likes</span><span>{p.commentsCount} comments</span><span className="ml-auto">{new Date(p.createdAt).toLocaleDateString()}</span></div>)}</CardContent></Card>}
