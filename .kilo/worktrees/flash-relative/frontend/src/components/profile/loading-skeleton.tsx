'use client';

export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="skeleton-shimmer h-[240px] rounded-[32px]" />
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="skeleton-shimmer h-40 rounded-[28px]" />
          <div className="skeleton-shimmer h-40 rounded-[28px]" />
        </div>
        <div className="space-y-4">
          <div className="skeleton-shimmer h-24 rounded-[28px]" />
          <div className="skeleton-shimmer h-72 rounded-[32px]" />
        </div>
      </div>
    </div>
  );
}
