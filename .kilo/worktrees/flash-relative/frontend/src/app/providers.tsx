"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from '@/store/auth';
import { SocketProvider } from '@/store/socket';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          {children}
        </SocketProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

