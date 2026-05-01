'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { NotificationsList } from './NotificationsList';
import { Bell, MessageCircle, Heart, Users } from 'lucide-react';

export function NotificationsTabs() {

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="w-full grid grid-cols-3 sm:grid-cols-5 gap-1 bg-[rgb(var(--bg-surface))] p-1 rounded-xl sm:p-1.5 sm:rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-[rgba(var(--border-subtle),0.08)]">
        <TabsTrigger value="all" className="rounded-lg sm:rounded-xl text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[rgb(var(--accent-primary))] data-[state=active]:to-[rgb(var(--accent-secondary))] data-[state=active]:text-white data-[state=active]:shadow-[0_0_25px_rgba(139,92,246,0.3)] transition-all duration-300">
          <Bell className="mr-0 sm:mr-2 h-4 w-4" />
          <span className="hidden sm:inline">All</span>
        </TabsTrigger>
        <TabsTrigger value="unread" className="rounded-lg sm:rounded-xl text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[rgb(var(--accent-primary))] data-[state=active]:to-[rgb(var(--accent-secondary))] data-[state=active]:text-white data-[state=active]:shadow-[0_0_25px_rgba(139,92,246,0.3)] transition-all duration-300">
          <Bell className="mr-0 sm:mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Unread</span>
        </TabsTrigger>
        <TabsTrigger value="matches" className="rounded-lg sm:rounded-xl text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[rgb(var(--accent-primary))] data-[state=active]:to-[rgb(var(--accent-secondary))] data-[state=active]:text-white data-[state=active]:shadow-[0_0_25px_rgba(139,92,246,0.3)] transition-all duration-300">
          <Heart className="mr-0 sm:mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Matches</span>
        </TabsTrigger>
        <TabsTrigger value="messages" className="rounded-lg sm:rounded-xl text-xs sm:text-sm hidden sm:block data-[state=active]:bg-gradient-to-r data-[state=active]:from-[rgb(var(--accent-primary))] data-[state=active]:to-[rgb(var(--accent-secondary))] data-[state=active]:text-white data-[state=active]:shadow-[0_0_25px_rgba(139,92,246,0.3)] transition-all duration-300">
          <MessageCircle className="mr-2 h-4 w-4" />
          Messages
        </TabsTrigger>
        <TabsTrigger value="social" className="rounded-lg sm:rounded-xl text-xs sm:text-sm hidden sm:block data-[state=active]:bg-gradient-to-r data-[state=active]:from-[rgb(var(--accent-primary))] data-[state=active]:to-[rgb(var(--accent-secondary))] data-[state=active]:text-white data-[state=active]:shadow-[0_0_25px_rgba(139,92,246,0.3)] transition-all duration-300">
          <Users className="mr-2 h-4 w-4" />
          Social
        </TabsTrigger>
      </TabsList>
      <TabsContent value="all" className="mt-6">
        <NotificationsList filter="all" />
      </TabsContent>
      <TabsContent value="unread" className="mt-6">
        <NotificationsList filter="unread" />
      </TabsContent>
      <TabsContent value="matches" className="mt-6">
        <NotificationsList filter="matches" />
      </TabsContent>
      <TabsContent value="messages" className="mt-6">
        <NotificationsList filter="messages" />
      </TabsContent>
      <TabsContent value="social" className="mt-6">
        <NotificationsList filter="social" />
      </TabsContent>
    </Tabs>
  );
}



