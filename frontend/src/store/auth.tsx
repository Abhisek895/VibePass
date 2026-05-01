"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getAccessToken, setAccessToken, clearAccessToken } from '../services/api/storage';

const USER_DATA_KEY = 'vibepass_user';

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

type BackendMe = {
  email: string;
  id: string;
  username?: string | null;
};

function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_DATA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeUser(user: User | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_DATA_KEY);
  }
}

function normalizeUser(userData: BackendMe): User {
  return {
    id: userData.id,
    email: userData.email,
    username: userData.username || userData.email.split('@')[0],
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }

      import('../services/api/client').then(({ apiRequest }) => {
        apiRequest<BackendMe>('/api/v1/users/me', { auth: true })
          .then((userData) => {
            const normalizedUser = normalizeUser(userData);
            setUser(normalizedUser);
            storeUser(normalizedUser);
          })
          .catch(() => {
            clearAccessToken();
            storeUser(null);
            setUser(null);
          })
          .finally(() => setIsLoading(false));
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((token: string, userData: User) => {
    setAccessToken(token);
    storeUser(userData);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    clearAccessToken();
    storeUser(null);
    setUser(null);
    // Reset admin mode on logout
    import('./admin-mode').then(({ useAdminMode }) => {
      useAdminMode.getState().reset();
    }).catch(() => {});
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
