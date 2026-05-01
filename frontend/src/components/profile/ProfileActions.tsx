'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { FriendshipStatus } from '@/lib/types';

interface FriendshipAction {
  status: FriendshipStatus;
  label: string;
  variant: 'primary' | 'secondary' | 'outline';
}

interface ProfileActionsProps {
  isOwnProfile: boolean;
  friendshipStatus: FriendshipStatus;
  onMessage?: () => void;
  onAddFriend?: () => void;
  onRemoveFriend?: () => void;
  onAcceptRequest?: () => void;
  onCancelRequest?: () => void;
  onEditProfile?: () => void;
  onCreatePost?: () => void;
}

export const ProfileActions: React.FC<ProfileActionsProps> = ({
  isOwnProfile,
  friendshipStatus,
  onMessage,
  onAddFriend,
  onRemoveFriend,
  onAcceptRequest,
  onCancelRequest,
  onEditProfile,
  onCreatePost,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  if (isOwnProfile) {
    return (
      <div className="flex gap-3 flex-wrap">
        <Button variant="primary" onClick={onEditProfile}>
          ✏️ Edit Profile
        </Button>
        <Button variant="secondary" onClick={onCreatePost}>
          ➕ Create Post
        </Button>
        <div className="relative">
          <Button variant="ghost" onClick={() => setShowMoreMenu(!showMoreMenu)}>
            ⋯
          </Button>
          {showMoreMenu && (
            <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-50">Settings</button>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-50">Privacy</button>
              <button className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50">Logout</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Other user's profile
  const actionMap: Record<FriendshipStatus, { buttons: React.ReactNode[] }> = {
    FRIENDS: {
      buttons: [
        <Button key="msg" variant="primary" onClick={onMessage}>
          💬 Message
        </Button>,
        <Button key="remove" variant="secondary" onClick={onRemoveFriend}>
          👋 Unfriend
        </Button>,
      ],
    },
    PENDING_OUTGOING: {
      buttons: [
        <Button key="cancel" variant="secondary" onClick={onCancelRequest}>
          ❌ Cancel Request
        </Button>,
      ],
    },
    PENDING_INCOMING: {
      buttons: [
        <Button key="accept" variant="primary" onClick={onAcceptRequest}>
          ✓ Accept Request
        </Button>,
        <Button key="decline" variant="secondary" onClick={onRemoveFriend}>
          ✕ Decline
        </Button>,
      ],
    },
    NONE: {
      buttons: [
        <Button key="add" variant="primary" onClick={onAddFriend}>
          ➕ Add Friend
        </Button>,
        <Button key="msg" variant="secondary" onClick={onMessage}>
          💬 Message
        </Button>,
      ],
    },
  };

  return <div className="flex gap-3 flex-wrap">{actionMap[friendshipStatus].buttons}</div>;
};
