'use client';

import React from 'react';
import { UserProfile } from '@/lib/types';
import { getFullName, formatDate } from '@/lib/date-utils';

interface ProfileIdentityProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  onEditProfile?: () => void;
}

export const ProfileIdentity: React.FC<ProfileIdentityProps> = ({ profile, isOwnProfile, onEditProfile }) => {
  return (
    <div className="mt-6">
      {/* Name and Username */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{getFullName(profile.firstName, profile.lastName)}</h1>
          <p className="text-gray-600 text-lg">@{profile.username}</p>
        </div>
        {isOwnProfile && (
          <button
            onClick={onEditProfile}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-4 flex flex-wrap gap-6 text-gray-700">
        <div>
          <span className="font-semibold text-gray-900">{profile.friendsCount}</span>
          <span className="text-gray-600"> Friends</span>
        </div>
        <div>
          <span className="font-semibold text-gray-900">Joined</span>
          <span className="text-gray-600"> {formatDate(profile.createdAt)}</span>
        </div>
      </div>

      {/* Bio and Intro */}
      <div className="mt-4">
        {profile.intro && <p className="text-gray-700 text-lg font-medium">{profile.intro}</p>}
        {profile.bio && <p className="text-gray-600 mt-2">{profile.bio}</p>}
      </div>
    </div>
  );
};
