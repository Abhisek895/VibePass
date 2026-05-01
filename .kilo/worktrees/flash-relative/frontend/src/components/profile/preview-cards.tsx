'use client';

import type { FriendPreview, PhotoItem, Profile } from '@/types/profile';
import Link from 'next/link';
import { normalizeImageUrl } from '@/lib/image-utils';

interface IntroCardProps {
  profile: Profile;
}

export function IntroCard({ profile }: IntroCardProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[rgb(var(--bg-surface))] p-6 shadow-xl">
      <h2 className="text-lg font-semibold text-white">Intro</h2>
      <p className="mt-3 text-sm leading-6 text-slate-300">{profile.intro}</p>
      <div className="mt-5 space-y-3 text-sm text-slate-400">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-white/5 px-3 py-1">Work</span>
          <span>{profile.workTitle} at {profile.workPlace}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-white/5 px-3 py-1">Education</span>
          <span>{profile.education}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-white/5 px-3 py-1">Location</span>
          <span>{profile.currentCity}</span>
        </div>
      </div>
    </section>
  );
}

interface AboutCardProps {
  profile: Profile;
}

export function AboutCard({ profile }: AboutCardProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[rgb(var(--bg-surface))] p-6 shadow-xl">
      <h2 className="text-lg font-semibold text-white">About</h2>
      <div className="mt-5 space-y-3 text-sm text-slate-300">
        <div>
          <p className="font-semibold text-white">Work</p>
          <p>{profile.workTitle} at {profile.workPlace}</p>
        </div>
        <div>
          <p className="font-semibold text-white">Education</p>
          <p>{profile.education}</p>
        </div>
        <div>
          <p className="font-semibold text-white">Current city</p>
          <p>{profile.currentCity}</p>
        </div>
        <div>
          <p className="font-semibold text-white">Hometown</p>
          <p>{profile.hometown}</p>
        </div>
        <div>
          <p className="font-semibold text-white">Relationship</p>
          <p>{profile.relationshipStatus}</p>
        </div>
      </div>
    </section>
  );
}

interface PhotosPreviewCardProps {
  photos: PhotoItem[];
}

export function PhotosPreviewCard({ photos }: PhotosPreviewCardProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[rgb(var(--bg-surface))] p-6 shadow-xl">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-white">Photos</h2>
        <span className="text-sm text-slate-400">{photos.length} items</span>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {photos.map((photo) => (
          <div key={photo.id} className="overflow-hidden rounded-3xl bg-white/5">
            <img src={normalizeImageUrl(photo.url)} alt={photo.caption} className="h-28 w-full object-cover" />
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm text-slate-400">Photos are a great way to show your personality and favorite moments.</div>
    </section>
  );
}

interface FriendsPreviewCardProps {
  friends: FriendPreview[];
}

export function FriendsPreviewCard({ friends }: FriendsPreviewCardProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[rgb(var(--bg-surface))] p-6 shadow-xl">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-white">Friends</h2>
        <span className="text-sm text-slate-400">{friends.length}</span>
      </div>
      <div className="mt-4 space-y-3">
        {friends.map((friend) => (
          <div key={friend.id} className="flex items-center gap-3 rounded-3xl bg-white/5 p-3 transition hover:bg-white/10">
            <Avatar src={friend.avatar} alt={friend.fullName} size={48} className="flex-shrink-0" />
            <div>
              <p className="font-medium text-white">{friend.fullName}</p>
              <p className="text-sm text-slate-400">{friend.mutualFriends} mutual</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm text-slate-400">A quick preview of the people you connect with most.</div>
    </section>
  );
}
