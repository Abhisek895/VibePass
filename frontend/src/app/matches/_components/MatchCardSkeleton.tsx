export function MatchCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.04]">
      <div className="h-72 animate-pulse bg-[linear-gradient(90deg,rgba(255,255,255,0.03),rgba(255,255,255,0.08),rgba(255,255,255,0.03))]" />
      <div className="space-y-4 p-5">
        <div className="h-5 w-24 animate-pulse rounded-full bg-white/8" />
        <div className="h-7 w-40 animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-52 animate-pulse rounded-full bg-white/8" />
        <div className="h-4 w-full animate-pulse rounded-full bg-white/8" />
        <div className="h-4 w-5/6 animate-pulse rounded-full bg-white/8" />
        <div className="flex gap-2">
          <div className="h-8 w-20 animate-pulse rounded-full bg-white/8" />
          <div className="h-8 w-24 animate-pulse rounded-full bg-white/8" />
        </div>
        <div className="flex gap-3">
          <div className="h-12 flex-1 animate-pulse rounded-2xl bg-white/10" />
          <div className="h-12 w-28 animate-pulse rounded-2xl bg-white/8" />
        </div>
      </div>
    </div>
  );
}

export function MatchesLoadingState() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="space-y-3">
          <div className="h-8 w-36 animate-pulse rounded-full bg-white/8" />
          <div className="h-12 w-56 animate-pulse rounded-full bg-white/10" />
          <div className="h-4 w-80 max-w-full animate-pulse rounded-full bg-white/8" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[34rem]">
          <div className="h-14 animate-pulse rounded-2xl bg-white/8" />
          <div className="h-14 animate-pulse rounded-2xl bg-white/8" />
          <div className="h-14 animate-pulse rounded-2xl bg-white/8" />
        </div>
      </div>

      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="min-w-[18rem] flex-1">
            <MatchCardSkeleton />
          </div>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <MatchCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
