type MatchCardActionsProps = {
  chatLabel: string;
  disabled?: boolean;
  isFavorite: boolean;
  onChat: () => void;
  onToggleFavorite: () => void;
  onViewProfile: () => void;
};

export function MatchCardActions({
  chatLabel,
  disabled = false,
  isFavorite,
  onChat,
  onToggleFavorite,
  onViewProfile,
}: MatchCardActionsProps) {
  return (
    <div className="mt-5 flex items-center gap-3">
      <button
        type="button"
        onClick={onChat}
        disabled={disabled}
        className="inline-flex flex-1 items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(236,72,153,0.28)] transition duration-200 hover:scale-[1.01] hover:shadow-[0_24px_50px_rgba(236,72,153,0.36)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {chatLabel}
      </button>
      <button
        type="button"
        onClick={onViewProfile}
        className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm font-medium text-white/84 transition hover:bg-white/10"
      >
        View profile
      </button>
      <button
        type="button"
        onClick={onToggleFavorite}
        aria-pressed={isFavorite}
        className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border transition ${
          isFavorite
            ? 'border-rose-400/30 bg-rose-500/18 text-rose-100'
            : 'border-white/12 bg-white/6 text-white/72 hover:bg-white/10'
        }`}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z" />
        </svg>
      </button>
    </div>
  );
}
