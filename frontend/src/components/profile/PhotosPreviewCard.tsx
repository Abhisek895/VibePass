'use client';

import React from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PostMedia } from '@/lib/types';

interface PhotosPreviewCardProps {
  photos: PostMedia[];
  isLoading?: boolean;
  onViewAll?: () => void;
  onPhotoClick?: (photo: PostMedia) => void;
}

export const PhotosPreviewCard: React.FC<PhotosPreviewCardProps> = ({
  photos,
  isLoading,
  onViewAll,
  onPhotoClick,
}) => {
  const displayPhotos = photos.slice(0, 6);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Photos</h3>
        {photos.length > 0 && <span className="text-sm text-gray-600">{photos.length} photos</span>}
      </div>

      {displayPhotos.length > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {displayPhotos.map((photo, idx) => (
              <button
                key={idx}
                onClick={() => onPhotoClick?.(photo)}
                className="relative w-full pt-[100%] rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
              >
                <Image
                  src={photo.url}
                  alt="Photo"
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
          {photos.length > 6 && (
            <Button variant="secondary" onClick={onViewAll} className="w-full">
              View All Photos
            </Button>
          )}
        </>
      ) : (
        <p className="text-gray-600 text-center py-6">No photos yet</p>
      )}
    </Card>
  );
};
