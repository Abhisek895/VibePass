'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    if (user?.username) {
      router.push(`/profile/${user.username}`);
    }
  }, [user, isLoading, isAuthenticated, router]);

  if (!isLoading && isAuthenticated && !user?.username) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-slate-700 bg-slate-900/80 p-8 text-center">
          <h1 className="text-2xl font-semibold">Profile unavailable</h1>
          <p className="mt-3 text-slate-400">
            Sign in and finish setting a username to open your profile page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
        <p className="text-slate-400">Loading your profile...</p>
      </div>
    </div>
  );
}
