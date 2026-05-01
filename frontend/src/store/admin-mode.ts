'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getAccessToken } from '../services/api/storage';
import { apiRequest } from '../services/api/client';

type UserRole = 'user' | 'moderator' | 'admin' | 'super_admin' | null;
type AppMode = 'user' | 'admin' | null;

interface AdminModeState {
  mode: AppMode;
  userRole: UserRole;
  isInitialized: boolean;
  setMode: (mode: 'user' | 'admin') => void;
  checkRole: () => Promise<void>;
  reset: () => void;
}

export const useAdminMode = create<AdminModeState>()(
  persist(
    (set, get) => ({
      mode: null,
      userRole: null,
      isInitialized: false,

      setMode: (mode) => {
        set({ mode });
        if (typeof window !== 'undefined') {
          localStorage.setItem('vibepass_mode', mode);
        }
      },

      checkRole: async () => {
        const token = getAccessToken();
        if (!token) {
          set({ userRole: null, isInitialized: true });
          return;
        }

        try {
          const data = await apiRequest<{ role?: UserRole }>('/api/v1/users/me', {
            auth: true,
          });
          const role = data.role ?? null;
          set({ userRole: role });

          const adminRoles = ['admin', 'super_admin', 'moderator'];
          if (!role || !adminRoles.includes(role)) {
            set({ mode: 'user', isInitialized: true });
            return;
          }

          const savedMode = localStorage.getItem('vibepass_mode') as AppMode;
          if (savedMode && (savedMode === 'user' || savedMode === 'admin')) {
            set({ mode: savedMode, isInitialized: true });
          } else {
            set({ mode: null, isInitialized: true });
          }
        } catch {
          set({ userRole: null, isInitialized: true });
        }
      },

      reset: () => {
        set({ mode: null, userRole: null, isInitialized: false });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('vibepass_mode');
        }
      },
    }),
    {
      name: 'vibepass_admin_mode',
      partialize: (state) => ({ mode: state.mode }),
    }
  )
);
