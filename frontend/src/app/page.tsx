"use client";

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[rgb(var(--accent-primary),0.12)] rounded-full blur-[140px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[55%] h-[55%] bg-[rgb(var(--accent-secondary),0.08)] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-[rgb(var(--accent-tertiary),0.06)] rounded-full blur-[80px] pointer-events-none" />

      {/* Logo / Brand */}
      <div className="mb-8 relative">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.4)]">
          <span className="text-4xl">🎵</span>
        </div>
      </div>

      <h1 className="text-5xl font-bold tracking-tight mb-3 text-center">
        VibePass
      </h1>
      <p className="text-xl text-[rgb(var(--text-secondary))] max-w-lg mb-12 text-center">
        Match by vibe. Reveal by choice.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Link href="/auth" onClick={(e) => { sessionStorage.setItem('authView', 'register') }} className="btn-primary flex-1">
          Find your vibe
        </Link>
        <Link href="/auth" onClick={(e) => { sessionStorage.setItem('authView', 'login') }} className="btn-secondary flex-1">
          Log in
        </Link>
      </div>

      {/* Features Preview */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
        <div className="text-center p-4">
          <div className="text-2xl mb-2">🎭</div>
          <div className="text-sm text-[rgb(var(--text-secondary))]">Mood-based matching</div>
        </div>
        <div className="text-center p-4">
          <div className="text-2xl mb-2">🎙️</div>
          <div className="text-sm text-[rgb(var(--text-secondary))]">Voice when you want</div>
        </div>
        <div className="text-center p-4">
          <div className="text-2xl mb-2">💬</div>
          <div className="text-sm text-[rgb(var(--text-secondary))]">Text or voice</div>
        </div>
      </div>
    </main>
  );
}
