import type { MatchesFilterKey } from '../_lib/matches-view-model';

type MatchesFilterTabsProps = {
  activeFilter: MatchesFilterKey;
  counts: Record<MatchesFilterKey, number>;
  onChange: (value: MatchesFilterKey) => void;
};

const tabs: Array<{ id: MatchesFilterKey; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'unread', label: 'Unread' },
  { id: 'active', label: 'Active' },
  { id: 'recent', label: 'Recent' },
  { id: 'nearby', label: 'Nearby' },
  { id: 'favorites', label: 'Favorites' },
];

export function MatchesFilterTabs({
  activeFilter,
  counts,
  onChange,
}: MatchesFilterTabsProps) {
  return (
    <div className="overflow-x-auto">
      <div className="inline-flex min-w-full gap-2 rounded-[1.75rem] border border-white/8 bg-white/6 p-2 backdrop-blur-xl">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`inline-flex min-w-fit items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition duration-200 ${
              activeFilter === tab.id
                ? 'bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500 text-white shadow-[0_16px_30px_rgba(217,70,239,0.28)]'
                : 'text-white/72 hover:bg-white/8 hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            <span className="rounded-full bg-black/18 px-2 py-0.5 text-xs text-white/88">
              {counts[tab.id]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
