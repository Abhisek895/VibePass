'use client';

import Link from 'next/link';
import { profileTabs } from '@/lib/constants';
import type { ProfileSection } from '@/types/profile';

interface ProfileTabsProps {
  username: string;
  activeSection: ProfileSection;
}

export function ProfileTabs({ username, activeSection }: ProfileTabsProps) {
  return (
    <div className="border-b border-white/10 bg-[rgb(var(--bg-secondary))] px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto no-scrollbar">
        {profileTabs.map((tab) => {
          const href = tab.id === 'posts' ? `/profile/${username}` : `/profile/${username}/${tab.id}`;
          const active = activeSection === tab.id;

          return (
            <Link key={tab.id} href={href} className={`rounded-full px-4 py-2 text-sm font-medium transition ${active ? 'bg-[rgb(var(--bg-primary))] text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)]' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
