'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminMode } from '@/store/admin-mode';
import { User, ShieldCheck, ChevronRight, Activity } from 'lucide-react';

export function AdminModeProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { mode, userRole, isInitialized, setMode } = useAdminMode();

  useEffect(() => {
    useAdminMode.getState().checkRole();
  }, []);

  const isAdminRole = userRole && ['admin', 'super_admin', 'moderator'].includes(userRole);
  const showModeSelector = isInitialized && isAdminRole && mode === null;

  const handleSelectMode = (selectedMode: 'user' | 'admin') => {
    setMode(selectedMode);
    if (selectedMode === 'admin') {
      router.push('/admin');
    }
  };

  return (
    <>
      {children}

      {/* Mode Selection Overlay */}
      {showModeSelector && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop with extreme blur */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl animate-in fade-in duration-500" />
          
          {/* Main Container */}
          <div className="relative w-full max-w-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            {/* Ambient Background Glows */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />

            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0A0A0B]/80 backdrop-blur-2xl shadow-2xl shadow-black/50 p-8 md:p-12">
              <div className="space-y-10">
                {/* Header */}
                <div className="space-y-4 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-widest animate-bounce">
                    <Activity className="w-3 h-3" />
                    Security Cleared
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                    Select Your Mode
                  </h2>
                  <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
                    You have administrative privileges. How would you like to proceed with your session?
                  </p>
                </div>

                {/* Options Grid */}
                <div className="grid gap-6">
                  {/* User Mode Card */}
                  <button
                    onClick={() => handleSelectMode('user')}
                    className="group relative flex items-center gap-6 p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300 text-left overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600/0 to-violet-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-slate-800/50 border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                      <User className="w-8 h-8 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-bold text-white transition-transform duration-300">
                          Continue as User
                        </h3>
                      </div>
                      <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                        Experience VibePass as a regular user without admin tools.
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 group-hover:translate-x-1 transition-all">
                      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white" />
                    </div>
                  </button>

                  {/* Admin Mode Card */}
                  <button
                    onClick={() => handleSelectMode('admin')}
                    className="group relative flex items-center gap-6 p-6 rounded-2xl bg-violet-600/10 border border-violet-500/20 hover:border-violet-500/50 hover:bg-violet-600/20 transition-all duration-300 text-left overflow-hidden shadow-[0_0_40px_rgba(139,92,246,0.1)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-fuchsia-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-violet-600 border border-violet-400/30 flex items-center justify-center shadow-2xl shadow-violet-900/50 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                      <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-bold text-white transition-transform duration-300">
                          Enter Admin Panel
                        </h3>
                        <span className="px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 text-[10px] font-bold uppercase tracking-tighter">
                          Authorized
                        </span>
                      </div>
                      <p className="text-violet-200/60 text-sm mt-1 leading-relaxed">
                        Full access to user management, analytics, and moderation.
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/40 group-hover:translate-x-1 transition-all">
                      <ChevronRight className="w-5 h-5 text-violet-300 group-hover:text-white" />
                    </div>
                  </button>
                </div>

                {/* Footer Insight */}
                <p className="text-center text-slate-500 text-xs font-medium">
                  Signed in as <span className="text-slate-300">{userRole?.replace('_', ' ')}</span> • {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
