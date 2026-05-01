'use client';

import Link from 'next/link';
import { ReactNode, useState } from 'react';
import { useProfile } from '@/hooks/use-profile';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useProfilePhotos } from '@/hooks/use-profile-photos';
import { useProfileFriends } from '@/hooks/use-profile-friends';
import { useUploadCoverImage } from '@/hooks/use-upload-cover-image';
import { useUploadProfileImage } from '@/hooks/use-upload-profile-image';
import { useUpdateProfile } from '@/hooks/use-update-profile';
import { ProfileTabs } from './profile-tabs';
import { ProfileHeader } from './profile-header';
import { IntroCard, AboutCard, PhotosPreviewCard, FriendsPreviewCard } from './preview-cards';
import { EditProfileModal } from './edit-profile-modal';
import { EmptyState } from './empty-state';
import { LoadingSkeleton } from './loading-skeleton';
import type { ProfileSection, Profile, PhotoItem, FriendPreview } from '@/types/profile';

interface ProfileShellProps {
  username: string;
  section: ProfileSection;
  children: ReactNode;
}

export function ProfileShell({ username, section, children }: ProfileShellProps) {
  const { user: profile, isLoading, error } = useProfile(username);
  const { data: currentUser } = useCurrentUser();
  const photos: PhotoItem[] = useProfilePhotos(username).data;
  const friends: FriendPreview[] = useProfileFriends(username).data;
  const coverUpload = useUploadCoverImage();
  const avatarUpload = useUploadProfileImage();
  const profileUpdate = useUpdateProfile(username);
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl bg-[rgb(var(--bg-surface))] p-10 shadow-xl">
          <h2 className="text-2xl font-semibold text-white">Profile not found</h2>
          <p className="mt-4 text-sm text-slate-400">We could not load that profile. Try a different username or come back later.</p>
          <Link href="/" className="mt-6 inline-flex btn-primary">Return home</Link>
        </div>
      </div>
    );
  }

  const isOwner = currentUser?.username === profile.username;

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-primary))] pb-12">
      <ProfileHeader
        user={profile}
        onOpenEdit={() => setIsEditOpen(true)}
        onUploadAvatar={(file: File) => avatarUpload.mutate(file)}
        onUploadCover={(file: File) => coverUpload.mutate(file)}
      />

      <div className="mx-auto mt-6 max-w-6xl px-4 sm:px-6 lg:px-8">
        <ProfileTabs username={profile.username} activeSection={section} />
      </div>

      <div className="mx-auto mt-6 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <IntroCard profile={profile} />
            <AboutCard profile={profile} />
            <PhotosPreviewCard photos={photos.slice(0, 4)} />
            <FriendsPreviewCard friends={friends.slice(0, 5)} />
          </aside>

          <main className="space-y-6">{children}</main>
        </div>
      </div>

      {isOwner && (
        <EditProfileModal
          user={profile}
          isOpen={isEditOpen}
          isSaving={profileUpdate.isPending}
          onClose={() => setIsEditOpen(false)}
          onSave={(changes: Partial<Profile>) => profileUpdate.mutate(changes)}
        />
      )}
    </div>
  );
}
