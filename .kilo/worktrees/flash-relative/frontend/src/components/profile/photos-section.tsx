import Image from 'next/image';
import { PhotoItem } from '@/types/profile';
import { Image as ImageIcon } from 'lucide-react';

interface PhotosSectionProps {
  photos: PhotoItem[];
  photosCount: number;
}

export function PhotosSection({ photos, photosCount }: PhotosSectionProps) {
  return (
    <div className="vibe-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">Photos</h2>
        <button className="text-[rgb(var(--accent-primary))] hover:brightness-110 text-sm font-medium">
          See all photos
        </button>
      </div>
      
      <p className="text-[rgb(var(--text-muted))] text-sm mb-4">{photosCount} photos</p>
      
      <div className="grid grid-cols-3 gap-2">
        {photos.slice(0, 9).map((photo) => (
          <button
            key={photo.id}
            className="aspect-square rounded-xl overflow-hidden bg-[rgb(var(--bg-surface))] group relative"
          >
            <Image
              src={photo.thumbnail}
              alt=""
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </button>
        ))}
      </div>
      
      {photos.length === 0 && (
        <div className="text-center py-8 text-[rgb(var(--text-muted))]">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-[rgb(var(--text-muted))]/50" />
          <p>No photos yet</p>
        </div>
      )}
    </div>
  );
}
