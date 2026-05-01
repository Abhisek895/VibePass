'use client';

import React, { useState } from 'react';
import { AdminChatPreview, AdminMessage } from '@/lib/types/admin';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/loading-skeleton';
import { 
  MessageSquare, 
  Search, 
  User, 
  Clock, 
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
  Inbox
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

interface Props {
  chats?: AdminChatPreview[];
  messages?: AdminMessage[];
  selectedChatId: string | null;
  onSelectChat: (id: string | null) => void;
  isLoading: boolean;
  messagesLoading: boolean;
}

export const AdminChatInbox: React.FC<Props> = ({ 
  chats, 
  messages, 
  selectedChatId, 
  onSelectChat, 
  isLoading,
  messagesLoading 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChats = chats?.filter(c => 
    c.otherUser.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.otherUser.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedChat = chats?.find(c => c.id === selectedChatId);

  return (
    <div className="flex h-[600px] vibe-card !p-0 overflow-hidden border-white/5">
      {/* Sidebar: Conversation List */}
      <div className={`w-full md:w-80 border-r border-white/5 flex flex-col bg-white/[0.01] ${selectedChatId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Inbox className="w-4 h-4 text-violet-400" />
              Inbox
            </h3>
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{chats?.length || 0} Threads</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
            <Input 
              placeholder="Search conversations..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs bg-white/5 border-white/5 rounded-xl"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {isLoading ? (
            [1,2,3,4].map(i => <div key={i} className="p-4 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>)
          ) : filteredChats?.length === 0 ? (
            <div className="p-8 text-center text-white/20 text-xs italic">No conversations found.</div>
          ) : (
            filteredChats?.map((chat) => (
              <div
                key={chat.id}
                className={`w-full p-4 text-left transition-all hover:bg-white/5 flex items-center gap-3 ${selectedChatId === chat.id ? 'bg-violet-600/10 border-l-2 border-violet-500' : ''}`}
              >
                <Link 
                  href={`/admin/users/${chat.otherUser.id}`}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-sm shrink-0 border border-white/5 overflow-hidden hover:scale-105 transition-transform"
                >
                  {chat.otherUser.profile?.profilePhotoUrl ? (
                    <img src={chat.otherUser.profile.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    chat.otherUser.username?.[0]?.toUpperCase() || 'U'
                  )}
                </Link>
                <div 
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => onSelectChat(chat.id)}
                >
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-bold text-sm text-white truncate hover:text-violet-400 transition-colors">
                      {chat.otherUser.username || 'User'}
                    </span>
                    <span className="text-[10px] text-white/20">{new Date(chat.startedAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-white/40 truncate leading-tight">
                    {chat.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content: Message History */}
      <div className={`flex-1 flex flex-col bg-black/20 ${!selectedChatId ? 'hidden md:flex' : 'flex'}`}>
        {selectedChatId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => onSelectChat(null)}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Link 
                  href={`/admin/users/${selectedChat?.otherUser.id}`}
                  className="w-8 h-8 rounded-full bg-violet-600/20 flex items-center justify-center font-bold text-xs text-violet-400 overflow-hidden hover:scale-105 transition-transform"
                >
                  {selectedChat?.otherUser.profile?.profilePhotoUrl ? (
                    <img src={selectedChat.otherUser.profile.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    selectedChat?.otherUser.username?.[0] || 'U'
                  )}
                </Link>
                <div>
                  <Link href={`/admin/users/${selectedChat?.otherUser.id}`}>
                    <h4 className="font-bold text-white text-sm leading-none hover:text-violet-400 transition-colors">
                      {selectedChat?.otherUser.username}
                    </h4>
                  </Link>
                  <p className="text-[10px] text-white/30 mt-1 uppercase font-black tracking-tighter">Status: {selectedChat?.status}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl text-[10px] font-black uppercase tracking-widest h-8 border-white/5 hover:bg-white/5">
                Audit Details
              </Button>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messagesLoading ? (
                <div className="space-y-6">
                   {[1,2,3].map(i => <Skeleton key={i} className={`h-12 w-2/3 ${i % 2 === 0 ? 'ml-auto' : ''} rounded-2xl`} />)}
                </div>
              ) : messages?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-20 py-20">
                   <MessageSquare className="w-12 h-12 mb-2" />
                   <p className="text-sm italic">No messages in this conversation yet</p>
                </div>
              ) : (
                messages?.map((msg) => {
                  const isOther = msg.sender.username === selectedChat?.otherUser.username;
                  return (
                    <div key={msg.id} className={`flex gap-3 ${isOther ? 'flex-row' : 'flex-row-reverse'}`}>
                      <Link 
                        href={`/admin/users/${msg.senderId}`}
                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5 overflow-hidden mt-1 hover:scale-110 transition-transform"
                      >
                        {msg.sender.profile?.profilePhotoUrl ? (
                          <img src={msg.sender.profile.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          msg.sender.username?.[0]?.toUpperCase() || 'U'
                        )}
                      </Link>
                      <div className={`flex flex-col max-w-[75%] ${isOther ? 'items-start' : 'items-end'}`}>
                        <div className={`p-3 px-4 rounded-2xl text-sm shadow-lg ${
                          isOther 
                            ? 'bg-white/5 text-white/80 border border-white/5 rounded-tl-none' 
                            : 'bg-violet-600 text-white rounded-tr-none'
                        }`}>
                          {msg.isDeleted ? (
                            <p className="text-white/30 italic text-xs">[Deleted Message]</p>
                          ) : (
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 px-1 opacity-40">
                          <span className="text-[8px] font-black uppercase tracking-widest">{msg.sender.username || 'User'}</span>
                          <span className="text-[8px]">&middot;</span>
                          <span className="text-[8px]">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Admin Controls: Premium Audit Banner */}
            <div className="p-6 border-t border-white/10 bg-black/40 backdrop-blur-md">
              <div className="relative overflow-hidden group px-6 py-4 rounded-2xl bg-amber-500/[0.03] border border-amber-500/20 flex items-center gap-4 transition-all hover:bg-amber-500/[0.05]">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/10">
                  <ShieldAlert className="w-5 h-5 text-amber-500 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">High-Privilege Audit Active</h5>
                  <p className="text-xs text-white/60 leading-relaxed max-w-lg">
                    You are in **Read-Only Audit Mode**. Every message view and navigation event is timestamped and cryptographically logged to the platform security trail.
                  </p>
                </div>
                <div className="hidden lg:block">
                  <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-500 uppercase tracking-widest">
                    Secured
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
            <div className="w-20 h-20 rounded-[32px] bg-white/5 flex items-center justify-center">
              <MessageSquare className="w-10 h-10 text-white/10" />
            </div>
            <div>
              <h4 className="font-bold text-white text-lg">Select a Conversation</h4>
              <p className="text-white/20 text-sm max-w-xs mx-auto">Click on a thread from the sidebar to inspect the full interaction history between users.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
