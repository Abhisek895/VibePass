'use client';

import React from 'react';
import { AdminRelationships } from '@/lib/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/loading-skeleton';
import { 
  Heart, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Users, 
  MessageSquare, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface Props {
  relationships?: AdminRelationships;
  isLoading: boolean;
}

export const RelationshipsTab: React.FC<Props> = ({ relationships, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 rounded-3xl" />
        ))}
      </div>
    );
  }

  const sections = [
    {
      title: 'Sent Likes',
      icon: <ArrowUpRight className="w-5 h-5 text-violet-400" />,
      data: relationships?.sent || [],
      description: 'Users this person has shown interest in.',
      badge: 'Interest Shown',
      getUser: (item: any) => item,
    },
    {
      title: 'Received Likes',
      icon: <ArrowDownLeft className="w-5 h-5 text-emerald-400" />,
      data: relationships?.received || [],
      description: 'Users who liked this person.',
      badge: 'Admired By',
      getUser: (item: any) => item,
    },
    {
      title: 'Mutual Matches',
      icon: <Heart className="w-5 h-5 text-rose-500" />,
      data: relationships?.mutual || [],
      description: 'Mutual connections (both liked each other).',
      badge: 'Active Bond',
      getUser: (item: any) => item.user,
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <div key={section.title} className="vibe-card flex flex-col h-[500px]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                  {section.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-none">{section.title}</h3>
                  <p className="text-[10px] text-white/20 mt-1 uppercase font-black tracking-widest">{section.data.length} Total</p>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-white/40 mb-6 px-1">{section.description}</p>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
              {section.data.map((item: any) => {
                const user = section.getUser(item);
                return (
                <div key={user.id} className="group p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-sm font-bold border border-white/5 overflow-hidden">
                       {user.profile?.profilePhotoUrl ? (
                         <img src={user.profile.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
                       ) : (
                         user.username?.[0]?.toUpperCase() || 'U'
                       )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-none group-hover:text-violet-400 transition-colors">{user.username || 'User'}</p>
                      <p className="text-[9px] text-white/20 mt-1 uppercase font-bold">{user.profile?.currentCity || user.email || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/users/${user.id}`}>
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-white/10">
                        <ExternalLink className="w-3.5 h-3.5 text-white/30" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )})}
              {section.data.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-12">
                   <Users className="w-12 h-12 mb-2" />
                   <p className="text-xs italic">No activity recorded</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
