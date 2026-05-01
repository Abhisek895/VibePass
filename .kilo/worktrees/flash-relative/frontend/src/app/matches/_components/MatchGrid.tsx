import { MatchCard } from './MatchCard';
import type { MatchViewModel } from '../_lib/matches-view-model';

type MatchGridProps = {
  isSubmittingId?: string | null;
  matches: MatchViewModel[];
  onChat: (match: MatchViewModel) => void;
  onToggleFavorite: (match: MatchViewModel) => void;
  onViewProfile: (match: MatchViewModel) => void;
};

export function MatchGrid({
  isSubmittingId,
  matches,
  onChat,
  onToggleFavorite,
  onViewProfile,
}: MatchGridProps) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-white/48">All matches</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Reply-worthy connections</h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {matches.map(match => (
          <MatchCard
            key={match.id}
            match={match}
            isSubmitting={isSubmittingId === match.id}
            onChat={onChat}
            onToggleFavorite={onToggleFavorite}
            onViewProfile={onViewProfile}
          />
        ))}
      </div>
    </section>
  );
}
