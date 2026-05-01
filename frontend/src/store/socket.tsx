"use client";

import { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './auth';
import { getAccessToken } from '../services/api/storage';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export function SocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Only connect if authenticated and in browser
    if (!isAuthenticated || typeof window === 'undefined') {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const token = getAccessToken();
    if (!token) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.hostname}:3003`;

    if (!socketRef.current) {
      // Connect to both namespaces for separation of concerns
      const socket = io(`${apiUrl}/chat`, { 
        auth: { token },
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Global reactivity engine: Listens for events and kills stale cache immediately
      const handleRefresh = (keys?: string[]) => {
        if (!keys) {
          queryClient.invalidateQueries();
        } else {
          keys.forEach(k => queryClient.invalidateQueries({ queryKey: [k] }));
        }
      };

      // Real-time Chat
      socket.on('chat:message_received', () => handleRefresh(['chats', 'messages', 'sidebar']));
      
      // Real-time Interactions
      socket.on('match:new', () => handleRefresh(['matches', 'relationships', 'notifications']));
      socket.on('like:received', () => handleRefresh(['relationships', 'notifications']));
      
      // Admin Reactivity
      socket.on('report:new', () => handleRefresh(['reports', 'analytics']));
      socket.on('audit:updated', () => handleRefresh(['audit-logs']));
      
      // Generic "Industry Level" invalidate event
      socket.on('data:invalidate', (data: { keys: string[] }) => handleRefresh(data.keys));
      
      socketRef.current = socket;
    }

    return () => {
      // We don't necessarily want to disconnect on every re-render, 
      // but if isAuthenticated changes to false, the above logic handles it.
    };
  }, [isAuthenticated, queryClient]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
