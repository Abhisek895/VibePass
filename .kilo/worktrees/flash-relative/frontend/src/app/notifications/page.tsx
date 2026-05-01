'use client';

import { NotificationsTabs } from '@/components/notifications/NotificationsTabs';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { useAuth } from '@/store/auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-[#0B141B] overflow-hidden">
      {/* Immersive Header */}
      <header className="px-5 py-3 bg-[#202C33]/80 backdrop-blur-xl border-b border-white/10 z-20">
        <h1 className="text-xl font-black tracking-tight text-white">Activity</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 no-scrollbar relative">
        {/* Premium background effects */}
        <div className="absolute top-[8%] right-[8%] w-[40%] h-[40%] bg-gradient-to-br from-[#25D366]/10 to-transparent rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <NotificationsTabs />
        </div>
      </main>
    </div>
  );
}
