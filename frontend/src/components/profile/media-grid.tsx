'use client';

import type { PhotoItem } from '@/types/profile';
import { normalizeImageUrl } from '@/lib/image-utils';

interface MediaGridProps {
  photos: PhotoItem[];
}

export function MediaGrid({ photos }: MediaGridProps) {
  if (photos.length === 0) {
    return <div className="rounded-3xl border border-white/10 bg-[rgb(var(--bg-surface))] p-8 text-center text-sm text-slate-400">No photos uploaded yet.</div>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {photos.map((photo) => (
        <button key={photo.id} className="group overflow-hidden rounded-3xl bg-white/5 transition hover:scale-[1.01]">
          <img src={normalizeImageUrl(photo.url)} alt={photo.caption} className="h-56 w-full object-cover" />
          <div className="space-y-1 p-4 text-left">
            <p className="line-clamp-2 text-sm text-slate-200">{photo.caption}</p>
            <p className="text-xs text-slate-500">{photo.createdAt}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
