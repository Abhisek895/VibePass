import { MatchCardActions } from './MatchCardActions';
import { MatchStatusBadge } from './MatchStatusBadge';
import type { MatchViewModel } from '../_lib/matches-view-model';

type MatchCardProps = {
  isSubmitting?: boolean;
  match: MatchViewModel;
  onChat: (match: MatchViewModel) => void;
  onToggleFavorite: (match: MatchViewModel) => void;
  onViewProfile: (match: MatchViewModel) => void;
};

export function MatchCard({
  isSubmitting = false,
  match,
  onChat,
  onToggleFavorite,
  onViewProfile,
}: MatchCardProps) {
  return (
    <article className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-[0_22px_50px_rgba(0,0,0,0.16)] transition duration-300 hover:-translate-y-1 hover:border-white/16 hover:shadow-[0_30px_70px_rgba(0,0,0,0.26)]">
      <div
        className="relative flex min-h-[18rem] flex-col justify-end overflow-hidden px-5 pb-5 pt-4"
        style={match.heroStyle}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.18)_36%,rgba(0,0,0,0.88)_100%)]" />
        <div className="absolute right-4 top-4 flex items-center gap-2">
          {match.isActive && (
            <span className="relative flex h-3 w-3 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
            </span>
          )}
          <button
            type="button"
            onClick={() => onToggleFavorite(match)}
            aria-pressed={match.isFavorite}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-black/24 text-white/84 backdrop-blur-sm transition hover:bg-black/36"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z" />
            </svg>
          </button>
        </div>

        <div className="relative z-10">
          <MatchStatusBadge label={match.primaryStatus.label} tone={match.primaryStatus.tone} />
          <div className="mt-4 flex items-end gap-2 text-white">
            <h3 className="text-2xl font-semibold">{match.displayName}</h3>
            <span className="text-2xl font-light">{match.age}</span>
          </div>
          <p className="mt-2 text-sm text-white/78">
            {match.locationLabel ? `${match.locationLabel} · ` : ''}
            {match.metaLine}
          </p>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 text-xs text-white/56">
          <span className="rounded-full bg-white/8 px-2.5 py-1">{match.compatibilityScore}% match</span>
          {match.voiceOpen && <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-emerald-200">Voice open</span>}
        </div>

        <p className="mt-4 text-sm font-medium text-white/92">{match.moodLabel}</p>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/64">
          {match.lastMessage || match.fallbackPrompt}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {match.interests.slice(0, 3).map(interest => (
            <span
              key={interest}
              className="rounded-full border border-white/8 bg-white/6 px-3 py-1.5 text-xs font-medium text-white/76"
            >
              {interest}
            </span>
          ))}
        </div>

        <MatchCardActions
          chatLabel={match.hasConversation ? 'Chat' : 'Start chat'}
          disabled={isSubmitting}
          isFavorite={match.isFavorite}
          onChat={() => onChat(match)}
          onToggleFavorite={() => onToggleFavorite(match)}
          onViewProfile={() => onViewProfile(match)}
        />
      </div>
    </article>
  );
}
