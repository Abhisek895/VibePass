"use client";

import { io, type Socket } from 'socket.io-client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/services/api';
import { getAccessToken } from '@/services/api/storage';
import { useAuth } from '@/store/auth';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Avatar } from '@/components/common/Avatar';

/* ── Types ── */
type ChatDetails = {
  id: string;
  user1Id: string;
  user2Id: string;
  user1?: { id: string; username: string | null; updatedAt?: string; profile?: { profilePhotoUrl: string | null } | null; };
  user2?: { id: string; username: string | null; updatedAt?: string; profile?: { profilePhotoUrl: string | null } | null; };
};
type MessageStatusType = 'pending' | 'sent' | 'delivered' | 'seen' | 'failed';
type ChatMessage = {
  id: string;
  chatId?: string;
  clientId?: string;
  content: string;
  createdAt: string;
  deliveredAt?: string | null;
  readAt?: string | null;
  senderId: string;
  status: MessageStatusType;
  isDeletedForEveryone?: boolean;
  sender?: { id: string; username: string | null; profile?: { profilePhotoUrl?: string | null; } | null; };
};

/* ── Helpers ── */
function formatTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function atomicMerge(current: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  const map = new Map<string, ChatMessage>();
  current.forEach(m => {
    const key = m.id || m.clientId!;
    map.set(key, m);
  });
  incoming.forEach(m => {
    if (m.clientId) map.delete(m.clientId);
    const key = m.id || m.clientId!;
    const existing = map.get(key);
    const statusWeight = (s?: string) => {
      if (s === 'seen') return 4;
      if (s === 'delivered') return 3;
      if (s === 'sent') return 2;
      if (s === 'pending') return 1;
      return 0;
    };
    const mergedStatus = statusWeight(m.status) >= statusWeight(existing?.status)
      ? m.status
      : existing?.status || m.status;
    map.set(key, { ...existing, ...m, status: mergedStatus });
  });
  return Array.from(map.values()).sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    if (timeA !== timeB) return timeA - timeB;
    return (a.id || '').localeCompare(b.id || '');
  });
}

function MessageStatusIcon({ status }: { status: MessageStatusType }) {
  if (status === 'pending') return <div className="ml-1 animate-spin h-3 w-3 border-2 border-white/25 border-t-white rounded-full" />;
  if (status === 'failed') return <span className="ml-1 text-red-500 text-[10px] font-bold">!</span>;
  const isRead = status === 'seen';
  const isDelivered = status === 'delivered' || isRead;
  const color = isRead ? '#34B7F1' : '#8A96A3';
  return (
    <div className="flex items-center ml-1" style={{ color }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12l5 5L13 7" className={isDelivered ? 'translate-x-[-3px]' : ''} />
        {isDelivered && <path d="M9 12l5 5L22 7" />}
      </svg>
    </div>
  );
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const chatId = params.id as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: currentUser, isLoading: currentUserLoading } = useCurrentUser();

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastEmitTimeRef = useRef<number>(0);

  // MOBILE VIEWPORT HANDLING - INDUSTRY STANDARD FOR STABLE CHAT
  const [viewportHeight, setViewportHeight] = useState<number>(0);
  const [viewportOffset, setViewportOffset] = useState<number>(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const handleVisualViewportResize = () => {
      if (window.visualViewport) {
        const v = window.visualViewport;
        setViewportHeight(v.height);
        setViewportOffset(v.offsetTop);
        setIsKeyboardOpen(v.height < window.innerHeight * 0.85);
      }
    };
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportResize);
      window.visualViewport.addEventListener('scroll', handleVisualViewportResize);
      handleVisualViewportResize();
    }
    return () => {
      window.visualViewport?.removeEventListener('resize', handleVisualViewportResize);
      window.visualViewport?.removeEventListener('scroll', handleVisualViewportResize);
    };
  }, []);

  const handleTyping = useCallback((currentValue: string) => {
    if (!socketRef.current?.connected || currentValue.trim().length === 0) return;
    const now = Date.now();
    if (now - lastEmitTimeRef.current > 1500) {
      socketRef.current.emit('chat:typing_start', { chatId });
      lastEmitTimeRef.current = now;
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('chat:typing_stop', { chatId });
      lastEmitTimeRef.current = 0;
    }, 2500);
  }, [chatId]);

  const { data: chat } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => apiRequest<ChatDetails>(`/api/v1/chats/${chatId}`, { auth: true }),
    enabled: isAuthenticated && !authLoading,
  });

  const { data: fetchedMessages, isLoading: messagesLoading } = useQuery({
    queryKey: ['chatMessages', chatId],
    queryFn: () => apiRequest<ChatMessage[]>(`/api/v1/chats/${chatId}/messages`, { auth: true }),
    enabled: isAuthenticated && !authLoading,
  });

  useEffect(() => {
    if (fetchedMessages) setMessages(prev => atomicMerge(prev, fetchedMessages));
  }, [fetchedMessages]);

  const otherUser = useMemo(() => {
    if (!chat || !currentUser) return null;
    return chat.user1Id === currentUser.id ? chat.user2 : chat.user1;
  }, [chat, currentUser]);

  const isRecentlyActive = useMemo(() => {
    if (!otherUser?.updatedAt) return false;
    const lastActive = new Date(otherUser.updatedAt).getTime();
    const now = Date.now();
    return (now - lastActive) < 4 * 60 * 1000;
  }, [otherUser]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    window.requestAnimationFrame(() => messagesEndRef.current?.scrollIntoView({ behavior }));
  }, []);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !currentUser?.id) return;
    const token = getAccessToken();
    if (!token) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:3003` : 'http://localhost:3003');

    if (!socketRef.current) {
      const socket = io(`${apiUrl}/chat`, { auth: { token } });
      socket.on('connect', () => socket.emit('chat:join', { chatId, markAsRead: true }));
      socket.on('chat:messages_read', payload => {
        if (!payload.showReceipts) return;
        setMessages(prev => prev.map(m => payload.messageIds.includes(m.id) ? { ...m, status: 'seen' } : m));
      });

      socket.on('chat:messages_delivered', payload => {
        setMessages(prev => prev.map(m => payload.messageIds.includes(m.id) ? { ...m, status: m.status === 'seen' ? 'seen' : 'delivered' } : m));
      });
      socketRef.current = socket;
    }

    return () => {
      if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null; }
    };
  }, [isAuthenticated, authLoading, chatId, currentUser?.id, queryClient]);

  const onMessageReceived = useCallback((payload: any) => {
    setMessages(prev => atomicMerge(prev, [payload]));
    queryClient.invalidateQueries({ queryKey: ['chatMessages', chatId] });

    // Auto-ACK Read if the message is from someone else
    if (payload.senderId !== currentUser?.id && socketRef.current?.connected) {
      socketRef.current.emit('chat:read', { chatId });
    }
  }, [chatId, currentUser?.id, queryClient]);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.off('chat:message_received');
      socketRef.current.on('chat:message_received', onMessageReceived);
    }
  }, [onMessageReceived]);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;
    const content = newMessage.trim();
    const clientId = typeof window !== 'undefined' && window.crypto?.randomUUID ? window.crypto.randomUUID() : `temp-${Date.now()}`;
    setNewMessage('');
    // Use preventScroll to stop the browser from jumping the viewport on focus
    textareaRef.current?.focus({ preventScroll: true });
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const opt: ChatMessage = { id: '', clientId, content, createdAt: new Date().toISOString(), senderId: currentUser.id, status: 'pending' };
    setMessages(prev => atomicMerge(prev, [opt]));
    scrollToBottom('auto');

    if (socketRef.current?.connected) {
      socketRef.current.emit('chat:typing_stop', { chatId });
      socketRef.current.emit('chat:message_send', { chatId, content, clientId }, (ack: any) => {
        if (!ack?.error) setMessages(prev => atomicMerge(prev, [ack]));
      });
    }
  };

  if (authLoading || currentUserLoading || (messagesLoading && messages.length === 0)) {
    return <div className="h-screen flex items-center justify-center bg-[#0B141B]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#25D366]" /></div>;
  }

  return (
    <div
      style={{
        height: viewportHeight || '100vh',
        position: 'fixed',
        top: viewportOffset,
        left: 0,
        right: 0,
        overflow: 'hidden'
      }}
      className="bg-[#0B141B] text-white flex flex-col overscroll-none"
    >
      <style jsx global>{`
        html, body {
          position: fixed;
          overflow: hidden;
          width: 100%;
          height: 100%;
          -webkit-overflow-scrolling: touch;
        }
      `}</style>

      {/* 1. WHATSAPP STABLE HEADER */}
      <header className="flex-shrink-0 h-[60px] px-3 bg-[#202C33] border-b border-white/5 z-50 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-1">
          <button onClick={() => router.push('/chat')} className="p-2 hover:bg-white/10 rounded-full transition-all text-white/70">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(`/profile/${otherUser?.username}`)}>
            <div className="relative">
              <Avatar src={otherUser?.profile?.profilePhotoUrl} alt={otherUser?.username || 'User'} size={40} className="border border-white/5" />
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#202C33] ${isRecentlyActive ? 'bg-[#25D366]' : 'bg-slate-500'}`} />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-[16px] font-bold leading-tight truncate max-w-[150px]">{otherUser?.username || 'Loading...'}</h1>
              {(isOtherUserTyping || isRecentlyActive) && (
                <p className="text-[11px] font-bold text-[#25D366] leading-tight">
                  {isOtherUserTyping ? 'typing...' : 'online'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="p-2 text-[#25D366] opacity-80">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <button className="p-2 text-white/40">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 16 16"><path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" /></svg>
          </button>
        </div>
      </header>

      {/* 2. CHAT SCROLL AREA */}
      <main
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-[#0B141B] overscroll-contain"
        style={{
          backgroundImage: 'radial-gradient(circle at center, #111b21 0%, #0b141a 100%)',
          scrollPaddingBottom: '20px'
        }}
      >
        {messages.map((m) => {
          const isMine = m.senderId === currentUser?.id;
          return (
            <div key={m.id || m.clientId} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`relative max-w-[85%] px-3 py-1.5 rounded-2xl shadow-sm ${isMine ? 'bg-[#005C4B] rounded-tr-none' : 'bg-[#202C33] rounded-tl-none'}`}>
                <p className="text-[15px] leading-normal break-words whitespace-pre-wrap">{m.content}</p>
                <div className="flex items-center justify-end gap-1 mt-1 opacity-50 text-[10px]">
                  <span>{formatTime(m.createdAt)}</span>
                  {isMine && <MessageStatusIcon status={m.status} />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} className="h-2" />
      </main>

      {/* 3. WHATSAPP COMPOSER - STABLE POSITION */}
      <footer className={`flex-shrink-0 p-2 bg-[#0B141B] transition-all duration-75 ${isKeyboardOpen ? 'pb-2' : 'pb-[max(env(safe-area-inset-bottom),8px)]'}`}>
        <div className="flex items-end gap-2 bg-[#202C33] rounded-3xl px-3 py-1.5 border border-white/5 focus-within:ring-1 ring-[#25D366]/30 transition-all">
          <textarea
            ref={textareaRef}
            value={newMessage}
            onInput={e => {
              const val = (e.target as HTMLTextAreaElement).value;
              setNewMessage(val);
              handleTyping(val);
              if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
              }
            }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 bg-transparent border-none focus:ring-0 text-[16px] py-1.5 resize-none max-h-36 overflow-y-auto outline-none"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2.5 bg-[#25D366] text-black rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale shadow-lg"
          >
            <svg className="w-5 h-5 translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.4 20.4l17.45-7.48c.78-.33.78-1.43 0-1.76L3.4 3.68c-.68-.29-1.38.32-1.19 1.03l1.67 6.2a1 1 0 0 0 .73.71l7.54 1.39-7.54 1.38a1 1 0 0 0-.73.72l-1.67 6.19c-.19.72.51 1.33 1.19 1.04Z" />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
}
