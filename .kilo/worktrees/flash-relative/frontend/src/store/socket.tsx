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
      console.log('Initializing Central Socket Connection...');
      const socket = io(`${apiUrl}/chat`, { 
        auth: { token },
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      const handleGlobalUpdate = () => {
        console.log('Real-time event received: Invalidating notification queries');
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['sidebar'] });
      };

      // Industry Standard listeners: Listen once, update all
      socket.on('chat:message_received', handleGlobalUpdate);
      socket.on('notifications:new', handleGlobalUpdate);
      
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
