import { MatchCardActions } from './MatchCardActions';
import { MatchStatusBadge } from './MatchStatusBadge';
import type { MatchViewModel } from '../_lib/matches-view-model';

type SpotlightMatchesCarouselProps = {
  isSubmittingId?: string | null;
  matches: MatchViewModel[];
  onChat: (match: MatchViewModel) => void;
  onToggleFavorite: (match: MatchViewModel) => void;
  onViewProfile: (match: MatchViewModel) => void;
};

export function SpotlightMatchesCarousel({
  isSubmittingId,
  matches,
  onChat,
  onToggleFavorite,
  onViewProfile,
}: SpotlightMatchesCarouselProps) {
  if (matches.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/48">Spotlight matches</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Most likely to spark a reply</h2>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {matches.map(match => (
          <article
            key={match.id}
            className="group min-w-[18rem] max-w-[19rem] flex-1 rounded-[2rem] border border-white/10 bg-white/[0.045] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1 hover:border-white/16 hover:bg-white/[0.07]"
          >
            <div
              className="relative flex min-h-[24rem] flex-col justify-end overflow-hidden rounded-[1.6rem] p-4"
              style={match.heroStyle}
            >
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.12)_35%,rgba(0,0,0,0.88)_100%)]" />
              <div className="relative z-10">
                <MatchStatusBadge
                  label={match.primaryStatus.label}
                  tone={match.primaryStatus.tone}
                />
                <div className="mt-4 flex items-end gap-2 text-white">
                  <h3 className="text-2xl font-semibold">{match.displayName}</h3>
                  <span className="text-2xl font-light">{match.age}</span>
                </div>
                <p className="mt-2 text-sm text-white/76">{match.spotlightLabel}</p>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/84">
                  {match.lastMessage || match.fallbackPrompt}
                </p>
              </div>
            </div>

            <div className="p-2">
              <MatchCardActions
                chatLabel={match.hasConversation ? 'Reply now' : 'Say hi'}
                disabled={isSubmittingId === match.id}
                isFavorite={match.isFavorite}
                onChat={() => onChat(match)}
                onToggleFavorite={() => onToggleFavorite(match)}
                onViewProfile={() => onViewProfile(match)}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
