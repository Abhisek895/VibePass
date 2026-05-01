'use client';

import Image from 'next/image';
import { useState, useRef } from 'react';
import { Camera, Edit2 } from 'lucide-react';
import type { User } from '@/types/profile';
import { getInitials } from '@/lib/profile-utils';

interface CoverPhotoSectionProps {
  coverPhoto: string;
  userName: string;
  isOwnProfile: boolean;
  onUploadCover?: (file: File) => void;
}

export function CoverPhotoSection({
  coverPhoto,
  userName,
  isOwnProfile,
  onUploadCover,
}: CoverPhotoSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await onUploadCover?.(file);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative h-64 sm:h-80 lg:h-96 w-full overflow-hidden rounded-b-3xl bg-gray-200 shadow-lg">
      {/* Cover Image */}
      {coverPhoto ? (
        <Image
          src={coverPhoto}
          alt={`${userName}'s cover photo`}
          fill
          className="object-cover"
          priority
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400" />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10" />

      {/* Edit Button */}
      {isOwnProfile && (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="absolute bottom-4 right-4 bg-white hover:bg-gray-100 disabled:opacity-50 text-gray-900 px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 font-medium transition-all hover:shadow-xl"
        >
          <Camera className="w-4 h-4" />
          {isUploading ? 'Uploading...' : 'Edit cover'}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        aria-label="Upload cover photo"
      />
    </div>
  );
}

interface ProfilePictureSectionProps {
  avatar: string;
  fullName: string;
  firstName: string;
  lastName: string;
  isOnline?: boolean;
  isOwnProfile: boolean;
  onUploadAvatar?: (file: File) => void;
}

export function ProfilePictureSection({
  avatar,
  fullName,
  firstName,
  lastName,
  isOnline,
  isOwnProfile,
  onUploadAvatar,
}: ProfilePictureSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await onUploadAvatar?.(file);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      {/* Avatar Container */}
      <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-100">
        {avatar ? (
          <Image
            src={avatar}
            alt={fullName}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-4xl font-bold text-white">
            {getInitials(firstName, lastName)}
          </div>
        )}

        {/* Online Indicator */}
        {isOnline && (
          <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-lg" />
        )}

        {/* Edit Avatar Button */}
        {isOwnProfile && (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="absolute inset-0 bg-black/0 hover:bg-black/40 disabled:bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 disabled:opacity-100 transition-all duration-200"
          >
            <div className="flex flex-col items-center gap-1 text-white">
              <Camera className="w-6 h-6" />
              <span className="text-xs font-medium">{isUploading ? 'Uploading...' : 'Edit'}</span>
            </div>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        aria-label="Upload profile photo"
      />
    </div>
  );
}
