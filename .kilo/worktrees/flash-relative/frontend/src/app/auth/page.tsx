import AuthFlow from '@/components/auth/AuthFlow';

export default function AuthPage() {
  return (
    <main className="h-full flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden bg-[#0B141B]">
      {/* Background Atmosphere Elements */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-[rgb(var(--accent-primary),0.12)] rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-[rgb(var(--accent-secondary),0.08)] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] left-[60%] w-[25%] h-[25%] bg-[rgb(var(--accent-tertiary),0.06)] rounded-full blur-[60px] pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 text-center z-10">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)]">
          <span className="text-3xl">🎵</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">VibePass</h1>
      </div>

      {/* Embedded Client Flow */}
      <div className="w-full max-w-md z-10">
        <AuthFlow />
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-[rgb(var(--text-muted))]">
        <p>By continuing, you agree to our Terms & Privacy</p>
      </div>
    </main>
  );
}