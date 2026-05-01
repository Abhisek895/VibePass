'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/button';

interface CoverPhotoSectionProps {
  coverImage?: string;
  profileImage?: string;
  profileName: string;
  isOwn: boolean;
  onEditCover?: () => void;
  onEditProfile?: () => void;
}

export const CoverPhotoSection: React.FC<CoverPhotoSectionProps> = ({
  coverImage,
  profileImage,
  profileName,
  isOwn,
  onEditCover,
  onEditProfile,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Cover Image */}
      <div className="relative w-full h-48 md:h-64 bg-gradient-to-br from-blue-400 to-purple-500">
        {coverImage ? (
          <Image src={coverImage} alt="Cover" fill className="object-cover" priority />
        ) : null}

        {isOwn && (
          <button
            onClick={onEditCover}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            aria-label="Edit cover photo"
          >
            <span className="text-xl">📷</span>
          </button>
        )}
      </div>

      {/* Profile Info Overlap */}
      <div className="px-6 pb-6">
        <div className="flex flex-col md:flex-row md:items-end md:gap-4 -mt-16 md:-mt-12">
          {/* Profile Avatar */}
          <div className="relative z-10 flex-shrink-0">
            <div className="relative p-1 bg-white rounded-full">
              <Avatar src={profileImage} alt={profileName} size="xxl" className="border-4 border-white" />
            </div>
            {isOwn && (
              <button
                onClick={onEditProfile}
                className="absolute bottom-1 right-1 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                aria-label="Edit profile photo"
              >
                <span className="text-sm">📷</span>
              </button>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />
        </div>
      </div>
    </div>
  );
};
