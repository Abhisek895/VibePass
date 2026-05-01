"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { io, type Socket } from 'socket.io-client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getApiErrorMessage, getConnections } from '@/services/api';
import { getAccessToken } from '@/services/api/storage';
import { useAuth } from '@/store/auth';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Avatar } from '@/components/common/Avatar';

interface ChatListItem {
  id: string;
  otherUser: {
    id: string;
    username: string;
    profilePhotoUrl?: string | null;
    updatedAt?: string;
  };
  lastMessage?: string | null;
  updatedAt: string;
  unreadCount?: number;
  hasUnread?: boolean;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return date.toLocaleDateString();
}

export default function ChatsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typingMap, setTypingMap] = useState<Record<string, boolean>>({});
  const { currentUser } = useCurrentUser();
  const socketRef = useRef<Socket | null>(null);

  const loadChats = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const data = await getConnections();
      setChats(data as ChatListItem[]);
    } catch (error) {
      setChats([]);
      setErrorMsg(getApiErrorMessage(error, 'Failed to load conversations.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      if (!authLoading && !isAuthenticated) router.push('/auth/login');
      return;
    }

    const token = getAccessToken();
    if (!token) return;

    void loadChats();

    const socket = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/chat`, {
      auth: { token },
    });

    socket.on('chat:message_received', (payload) => {
      setChats((prev) => {
        const existing = prev.find((c) => c.id === payload.chatId);
        if (existing) {
          const isFromOther = payload.senderId !== currentUser?.id;
          const updatedChat = {
            ...existing,
            lastMessage: payload.content,
            updatedAt: payload.createdAt,
            unreadCount: isFromOther ? (existing.unreadCount || 0) + 1 : (existing.unreadCount || 0),
            hasUnread: isFromOther ? true : existing.hasUnread
          };

          // Auto-ACK Delivery if we are in the inbox and it's from someone else
          if (isFromOther && socketRef.current?.connected) {
            socketRef.current.emit('chat:delivered', { chatId: payload.chatId });
          }

          return [updatedChat, ...prev.filter((c) => c.id !== payload.chatId)];
        }
        return prev;
      });
      setTypingMap((prev) => ({ ...prev, [payload.chatId]: false }));
    });

    socket.on('chat:message_sent', (payload) => {
      setChats((prev) => {
        const existing = prev.find((chat) => chat.id === payload.chatId);
        if (!existing) return prev;
        return [
          { ...existing, lastMessage: payload.content, updatedAt: payload.createdAt },
          ...prev.filter((chat) => chat.id !== payload.chatId),
        ];
      });
    });

    socket.on('chat:messages_read', (payload) => {
      setChats((prev) => prev.map(c =>
        c.id === payload.chatId ? { ...c, unreadCount: 0, hasUnread: false } : c
      ));
    });

    socket.on('chat:user_typing', (payload) => {
      setTypingMap((prev) => ({ ...prev, [payload.chatId]: payload.isTyping }));
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [authLoading, isAuthenticated, loadChats, router]);

  useEffect(() => {
    if (socketRef.current?.connected && chats.length > 0) {
      chats.forEach(chat => {
        socketRef.current?.emit('chat:join', { chatId: chat.id, markAsRead: false });
      });
    }
  }, [chats.length]);

  const filteredChats = chats; // Removed search filtering

  if (authLoading || loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0B141B]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#25D366]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-[#0B141B] overflow-hidden">
      {/* App-Style Header */}
      <header className="px-5 py-3 bg-[#202C33]/80 backdrop-blur-xl border-b border-white/10 z-20">
        <h1 className="text-xl font-black tracking-tight text-white">Inbox</h1>
        {errorMsg && (
          <p className="mt-2 text-xs text-red-400 bg-red-400/10 px-3 py-1 rounded-full w-fit animate-pulse">{errorMsg}</p>
        )}
      </header>

      {/* Main Chat List Area */}
      <main className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
        {filteredChats.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
            <div className="relative mb-6 scale-125">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#25D366]/20 to-transparent flex items-center justify-center">
                <span className="text-4xl shadow-xl">💬</span>
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">No conversations yet</h2>
            <p className="text-sm max-w-xs mx-auto mb-8 px-8">Like a match to start a conversation instantly and vibe.</p>
            <button
              onClick={() => router.push('/matches')}
              className="px-8 py-3 bg-[#25D366] text-black font-black rounded-full hover:scale-105 transition-all shadow-lg active:scale-95"
            >
              Explore Vibes
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredChats.map(chat => {
              const isOnline = chat.otherUser.updatedAt && (new Date().getTime() - new Date(chat.otherUser.updatedAt).getTime()) < 4 * 60 * 1000;
              const hasUnread = (chat.unreadCount || 0) > 0;

              return (
                <Link
                  key={chat.id}
                  href={`/chat/${chat.id}`}
                  className="flex items-center gap-4 p-4 mb-2 bg-[#202C33]/40 border border-white/5 hover:bg-[#202C33]/80 transition-all rounded-2xl group"
                >
                  <div className="flex-shrink-0 relative" style={{ width: '48px', height: '48px' }}>
                    <Avatar
                      src={chat.otherUser.profilePhotoUrl}
                      alt={chat.otherUser.username}
                      size={48}
                      className="shadow-md border border-white/10 !rounded-full !block"
                    />
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#25D366] rounded-full border-2 border-[#0B141B] shadow-lg" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-white truncate">{chat.otherUser.username}</p>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-medium ${hasUnread ? 'text-[#25D366]' : 'text-slate-400'}`}>
                          {formatTime(chat.updatedAt)}
                        </span>
                        {hasUnread && (
                          <div className="bg-[#25D366] text-black text-[10px] font-black h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full shadow-lg">
                            {chat.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className={`text-sm truncate mt-0.5 ${hasUnread ? 'text-white font-medium' : 'text-slate-400'}`}>
                      {typingMap[chat.id] ? (
                        <span className="text-[#25D366] font-bold animate-pulse">typing...</span>
                      ) : (
                        chat.lastMessage || 'Tap to open the conversation'
                      )}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
