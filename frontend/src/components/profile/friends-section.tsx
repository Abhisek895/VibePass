import Image from 'next/image';
import { User as UserType } from '@/types/profile';
import { User as UserIcon } from 'lucide-react';

interface FriendsSectionProps {
  friends: UserType[];
  friendsCount: number;
}

export function FriendsSection({ friends, friendsCount }: FriendsSectionProps) {
  return (
    <div className="vibe-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">Friends</h2>
        <button className="text-[rgb(var(--accent-primary))] hover:brightness-110 text-sm font-medium">
          See all friends
        </button>
      </div>
      
      <p className="text-[rgb(var(--text-muted))] text-sm mb-4">{friendsCount} friends</p>
      
      <div className="grid grid-cols-3 gap-3">
        {friends.slice(0, 9).map((friend) => (
          <a
            key={friend.id}
            href={`/profile/${friend.id}`}
            className="group"
          >
            <div className="aspect-square rounded-xl overflow-hidden bg-[rgb(var(--bg-surface))]">
              <Image
                src={friend.avatar}
                alt={friend.fullName}
                width={200}
                height={200}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <p className="mt-2 text-sm font-medium text-[rgb(var(--text-primary))] truncate">
              {friend.fullName}
            </p>
            {friend.mutualFriends > 0 && (
              <p className="text-xs text-[rgb(var(--text-muted))]">{friend.mutualFriends} mutual friends</p>
            )}
          </a>
        ))}
      </div>
      
      {friends.length === 0 && (
        <div className="text-center py-8 text-[rgb(var(--text-muted))]">
          <UserIcon className="w-12 h-12 mx-auto mb-3 text-[rgb(var(--text-muted))]/50" />
          <p>No friends yet</p>
        </div>
      )}
    </div>
  );
}
