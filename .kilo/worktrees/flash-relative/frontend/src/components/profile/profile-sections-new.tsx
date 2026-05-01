'use client';

import Image from 'next/image';
import { MapPin, Briefcase, GraduationCap, Heart, Calendar } from 'lucide-react';
import type { Profile, FriendPreview, PhotoItem } from '@/types/profile';
import { formatDate } from '@/lib/profile-utils';

interface ProfileInfoProps {
  user: Profile;
  isOwnProfile: boolean;
  onEditProfile?: () => void;
}

export function ProfileInfo({ user, isOwnProfile, onEditProfile }: ProfileInfoProps) {
  const infoItems = [
    { icon: Briefcase, label: 'Work', value: user.workTitle && user.workPlace ? `${user.workTitle} at ${user.workPlace}` : null },
    { icon: GraduationCap, label: 'Education', value: user.education },
    { icon: MapPin, label: 'Current City', value: user.currentCity },
    { icon: MapPin, label: 'Hometown', value: user.hometown },
    { icon: Heart, label: 'Relationship', value: user.relationshipStatus },
    { icon: Calendar, label: 'Joined', value: user.joinedDate ? formatDate(user.joinedDate) : null },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">About</h2>
        {isOwnProfile && (
          <button
            onClick={onEditProfile}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Edit
          </button>
        )}
      </div>

      {user.bio && (
        <div className="mb-6 pb-6 border-b border-gray-200">
          <p className="text-gray-700 leading-relaxed">{user.bio}</p>
        </div>
      )}

      <div className="space-y-3">
        {infoItems.map(
          (item) =>
            item.value && (
              <div key={item.label} className="flex items-center gap-3 text-gray-700">
                <item.icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="text-sm">
                  <span className="font-medium text-gray-900">{item.label}:</span> {item.value}
                </span>
              </div>
            )
        )}
      </div>

      {user.contactEmail || user.website ? (
        <div className="pt-4 border-t border-gray-200 space-y-2">
          {user.contactEmail && (
            <a href={`mailto:${user.contactEmail}`} className="text-blue-600 hover:underline text-sm">
              {user.contactEmail}
            </a>
          )}
          {user.website && (
            <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm block">
              {user.website}
            </a>
          )}
        </div>
      ) : null}
    </div>
  );
}

interface FriendsSectionProps {
  friends: FriendPreview[];
  totalCount: number;
  onViewAll?: () => void;
}

export function FriendsSection({ friends, totalCount, onViewAll }: FriendsSectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Friends</h2>
        <span className="text-sm text-gray-600">{totalCount}</span>
      </div>

      {friends.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            {friends.slice(0, 6).map((friend) => (
              <div key={friend.id} className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                  {friend.avatar ? (
                    <Image
                      src={friend.avatar}
                      alt={friend.fullName}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{friend.fullName}</p>
                  {friend.mutualFriends > 0 && (
                    <p className="text-xs text-gray-600">{friend.mutualFriends} mutual</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalCount > 6 && (
            <button
              onClick={onViewAll}
              className="w-full mt-4 px-4 py-2 text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition-colors text-sm"
            >
              View all friends
            </button>
          )}
        </>
      ) : (
        <p className="text-center text-gray-600 py-8">No friends yet</p>
      )}
    </div>
  );
}

interface PhotosSectionProps {
  photos: PhotoItem[];
  totalCount: number;
  onViewAll?: () => void;
}

export function PhotosSection({ photos, totalCount, onViewAll }: PhotosSectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Photos</h2>
        <span className="text-sm text-gray-600">{totalCount}</span>
      </div>

      {photos.length > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            {photos.slice(0, 6).map((photo) => (
              <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 hover:opacity-80 cursor-pointer transition-opacity">
                <Image
                  src={photo.url}
                  alt={photo.caption}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {totalCount > 6 && (
            <button
              onClick={onViewAll}
              className="w-full mt-4 px-4 py-2 text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition-colors text-sm"
            >
              View all photos
            </button>
          )}
        </>
      ) : (
        <p className="text-center text-gray-600 py-8">No photos yet</p>
      )}
    </div>
  );
}
