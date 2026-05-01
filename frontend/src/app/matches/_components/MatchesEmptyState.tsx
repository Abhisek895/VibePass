type MatchesEmptyStateProps = {
  description?: string;
  onCompleteProfile?: () => void;
  onDiscoverPeople?: () => void;
  title?: string;
};

export function MatchesEmptyState({
  description = "Start your journey by exploring profiles that match your frequency.",
  onCompleteProfile = () => { },
  onDiscoverPeople = () => { },
  title = "Find Your Vibe",
}: MatchesEmptyStateProps) {
  return (
    <div className="mx-auto max-w-md rounded-2xl bg-slate-900 p-8 text-center shadow-2xl border border-slate-800">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 text-blue-500">
        <svg aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="h-10 w-10">
          <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-slate-400 text-sm mb-8">
        {description}
      </p>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onDiscoverPeople}
          className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors"
        >
          Discover People
        </button>
        <button
          type="button"
          onClick={onCompleteProfile}
          className="w-full py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors"
        >
          Complete Your Profile
        </button>
      </div>
    </div>
  );
}
