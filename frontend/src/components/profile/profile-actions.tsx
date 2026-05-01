'use client';

import { MessageCircle, UserPlus, UserCheck, Clock, Settings } from 'lucide-react';
import type { User } from '@/types/profile';

interface ProfileActionsProps {
  user: User;
  isOwnProfile: boolean;
  friendStatus: 'none' | 'pending' | 'friends' | 'request_sent';
  onEditProfile?: () => void;
  onMessage?: () => void;
  onAddFriend?: () => void;
  onUnfriend?: () => void;
  onCancelRequest?: () => void;
}

export function ProfileActions({
  user,
  isOwnProfile,
  friendStatus,
  onEditProfile,
  onMessage,
  onAddFriend,
  onUnfriend,
  onCancelRequest,
}: ProfileActionsProps) {
  if (isOwnProfile) {
    return (
      <div className="flex gap-3">
        <button
          onClick={onEditProfile}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
        >
          <Settings className="w-4 h-4" />
          <span>Edit profile</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        onClick={onMessage}
        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        <span>Message</span>
      </button>

      {friendStatus === 'friends' ? (
        <button
          onClick={onUnfriend}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
        >
          <UserCheck className="w-4 h-4" />
          <span>Friends</span>
        </button>
      ) : friendStatus === 'request_sent' ? (
        <button
          onClick={onCancelRequest}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
        >
          <Clock className="w-4 h-4" />
          <span>Request sent</span>
        </button>
      ) : friendStatus === 'pending' ? (
        <div className="flex gap-2">
          <button
            onClick={onAddFriend}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <UserCheck className="w-4 h-4" />
            <span>Accept</span>
          </button>
          <button onClick={onCancelRequest} className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors">
            Decline
          </button>
        </div>
      ) : (
        <button
          onClick={onAddFriend}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add friend</span>
        </button>
      )}
    </div>
  );
}
