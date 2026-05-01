'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { User } from '@/types/profile';
import { Camera, Pencil, MessageCircle, UserPlus, UserCheck, Clock } from 'lucide-react';
import { ProfileActions } from './profile-actions';
import { ProfileTabs } from './profile-tabs';

interface ProfileHeaderProps {
  user: User;
  onUploadAvatar?: (file: File) => void;
  onUploadCover?: (file: File) => void;
  onOpenEdit?: () => void;
}

export function ProfileHeader({ user, onUploadAvatar, onUploadCover, onOpenEdit }: ProfileHeaderProps) {
  const [coverPhoto, setCoverPhoto] = useState(user.coverPhoto);
  const [avatar, setAvatar] = useState(user.avatar);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCoverPhoto(url);
      onUploadCover?.(file);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);
      onUploadAvatar?.(file);
    }
  };

  return (
    <div className="relative">
      {/* Cover Photo */}
      <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 w-full overflow-hidden rounded-b-2xl bg-gray-100">
        {coverPhoto ? (
          <Image
            src={coverPhoto}
            alt="Cover photo"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500" />
        )}
        
        {user.isOwnProfile && (
          <button
            onClick={() => coverInputRef.current?.click()}
            className="absolute bottom-4 right-4 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl shadow-md flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Camera className="w-4 h-4" />
            Edit cover photo
          </button>
        )}
        
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverChange}
          className="hidden"
        />
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 sm:-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt={user.fullName}
                    width={160}
                    height={160}
                    className="object-cover w-full h-full"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl text-gray-400">
                    👤
                  </div>
                )}
              </div>
              
              {user.isOwnProfile && (
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-2 right-2 bg-gray-100 hover:bg-gray-200 rounded-full p-2 shadow-md transition-colors"
                >
                  <Camera className="w-5 h-5 text-gray-600" />
                </button>
              )}
              
              <div className={`absolute bottom-3 right-3 w-5 h-5 rounded-full border-2 border-white ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
              
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* Identity */}
            <div className="pb-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user.fullName}</h1>
              <p className="text-gray-500">@{user.username}</p>
              
              {user.bio && (
                <p className="mt-2 text-gray-700 max-w-2xl">{user.bio}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{user.friendsCount}</span> friends
                {user.mutualFriends > 0 && !user.isOwnProfile && (
                  <span className="text-gray-500">· {user.mutualFriends} mutual friends</span>
                )}
              </div>
            </div>
          </div>

          <ProfileActions 
            user={user} 
            isOwnProfile={user.isOwnProfile} 
            friendStatus={user.friendStatus}
            onEditProfile={onOpenEdit}
          />
        </div>
      </div>
    </div>
  );
}
