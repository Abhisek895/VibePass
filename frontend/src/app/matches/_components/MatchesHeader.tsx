import type { MatchesSortKey } from '../_lib/matches-view-model';

type MatchesHeaderProps = {
  activeSummary: 'active' | 'new' | 'unread' | null;
  counts: {
    active: number;
    new: number;
    total: number;
    unread: number;
  };
  onFilterButtonClick: () => void;
  onSearchChange: (value: string) => void;
  onSortChange: (value: MatchesSortKey) => void;
  searchValue: string;
  sortValue: MatchesSortKey;
};

export function MatchesHeader({
  activeSummary,
  counts,
  onFilterButtonClick,
  onSearchChange,
  onSortChange,
  searchValue,
  sortValue,
}: MatchesHeaderProps) {
  const summaryChips = [
    { id: 'new', label: 'New', count: counts.new },
    { id: 'unread', label: 'Unread', count: counts.unread },
    { id: 'active', label: 'Active now', count: counts.active },
  ] as const;

  return (
    <header className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/62">
            <span>Your Matches</span>
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            <span>{counts.total} Matches</span>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Your Matches
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/68 sm:text-base">
            People who connected with your vibe.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] lg:min-w-[34rem]">
          <label className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-white/78 transition focus-within:border-white/20 focus-within:bg-white/8">
            <SearchIcon />
            <input
              type="search"
              value={searchValue}
              onChange={event => onSearchChange(event.target.value)}
              placeholder="Search by name or username"
              className="w-full bg-transparent text-sm outline-none placeholder:text-white/40"
            />
          </label>

          <button
            type="button"
            onClick={onFilterButtonClick}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-medium text-white/84 transition hover:bg-white/10"
          >
            <FilterIcon />
            Filters
          </button>

          <label className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/84">
            <SortIcon />
            <select
              value={sortValue}
              onChange={event => onSortChange(event.target.value as MatchesSortKey)}
              className="bg-transparent outline-none"
            >
              <option value="recent" className="bg-slate-900 text-white">Most recent</option>
              <option value="unread" className="bg-slate-900 text-white">Unread first</option>
              <option value="active" className="bg-slate-900 text-white">Active now</option>
              <option value="newest" className="bg-slate-900 text-white">Newest matches</option>
              <option value="oldest" className="bg-slate-900 text-white">Oldest matches</option>
            </select>
          </label>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {summaryChips.map(chip => (
          <div
            key={chip.id}
            className={`min-w-fit rounded-full border px-4 py-2 text-sm transition ${
              activeSummary === chip.id
                ? 'border-rose-400/30 bg-rose-500/16 text-white'
                : 'border-white/10 bg-white/6 text-white/74'
            }`}
          >
            {chip.label} <span className="ml-1 text-white/90">{chip.count}</span>
          </div>
        ))}
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-white/48" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16" />
      <path d="M7 12h10" />
      <path d="M10 17h4" />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 6h10" />
      <path d="M9 12h8" />
      <path d="M12 18h5" />
    </svg>
  );
}
