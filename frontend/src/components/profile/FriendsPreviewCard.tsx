'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/button';
import { FriendPreview } from '@/lib/types';

interface FriendsPreviewCardProps {
  friends: FriendPreview[];
  isLoading?: boolean;
  onViewAll?: () => void;
}

export const FriendsPreviewCard: React.FC<FriendsPreviewCardProps> = ({ friends, isLoading, onViewAll }) => {
  const displayFriends = friends.slice(0, 6);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Friends</h3>
        {friends.length > 0 && (
          <span className="text-sm text-gray-600">{friends.length} total</span>
        )}
      </div>

      {displayFriends.length > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {displayFriends.map((friend) => (
              <div key={friend.id} className="text-center">
                <Avatar
                  src={friend.profileImage}
                  alt={friend.firstName || friend.username}
                  size="lg"
                  className="mx-auto mb-2"
                />
                <p className="text-sm font-medium text-gray-900 truncate">
                  {friend.firstName} {friend.lastName}
                </p>
                <p className="text-xs text-gray-600">{friend.mutualFriendsCount} mutual</p>
              </div>
            ))}
          </div>
          {friends.length > 6 && (
            <Button variant="secondary" onClick={onViewAll} className="w-full">
              View All Friends
            </Button>
          )}
        </>
      ) : (
        <p className="text-gray-600 text-center py-6">No friends yet</p>
      )}
    </Card>
  );
};
