import type { MatchStatusTone } from '../_lib/matches-view-model';

const toneClasses: Record<MatchStatusTone, string> = {
  amber: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
  emerald: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
  rose: 'border-rose-400/40 bg-rose-400/10 text-rose-300',
  slate: 'border-white/20 bg-white/5 text-white/90',
};

type MatchStatusBadgeProps = {
  label: string;
  tone: MatchStatusTone;
};

export function MatchStatusBadge({ label, tone }: MatchStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[10px] font-black tracking-[0.2em] uppercase backdrop-blur-md shadow-lg ${toneClasses[tone]}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      {label}
    </span>
  );
}
