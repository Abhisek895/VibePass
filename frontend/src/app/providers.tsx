"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from '@/store/auth';
import { SocketProvider } from '@/store/socket';
import { ToastProvider } from '@/components/ui/toast';
import { AdminModeProvider } from '@/components/admin/AdminModeProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Industry Standard Reactivity
        staleTime: 5000, // Data is fresh for 5 seconds
        refetchOnWindowFocus: true, // Auto-sync when user returns to tab
        refetchInterval: 15000, // Background poll every 15s for "Live" feel
        retry: 2,
      },
    },
  }));

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          <ToastProvider>
            <AdminModeProvider>
              {children}
            </AdminModeProvider>
          </ToastProvider>
        </SocketProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

