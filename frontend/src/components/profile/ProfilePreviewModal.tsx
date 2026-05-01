"use client";

import { X } from "lucide-react";
import { CoverPhotoSection } from "./CoverPhotoSection";
import { AboutCard } from "./AboutCard";
import { FriendsPreviewCard } from "./FriendsPreviewCard";
import { PhotosPreviewCard } from "./PhotosPreviewCard";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";
import type { BackendProfile } from "@/lib/types";

interface ProfilePreviewModalProps {
  profile: BackendProfile;
  isOpen: boolean;
  onClose: () => void;
  onViewFullProfile?: () => void;
}

export function ProfilePreviewModal({ profile, isOpen, onClose, onViewFullProfile }: ProfilePreviewModalProps) {
  if (!isOpen) return null;

  const displayName = profile.displayName || profile.username;
  const profilePhotoUrl = profile.profile?.profilePhotoUrl || undefined;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 max-h-[90vh] max-w-4xl w-full mx-4 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar src={profilePhotoUrl} alt={displayName} size="lg" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
              <p className="text-sm text-gray-600">@{profile.username}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onViewFullProfile}>
              View Profile
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2 h-10 w-10 rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <CoverPhotoSection 
            coverImage={profile.profile?.coverPhotoUrl || undefined} 
            profileImage={profilePhotoUrl}
            profileName={displayName}
            isOwn={false}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AboutCard profile={profile as any} isOwnProfile={false} />
            
            <div className="space-y-6">
              <FriendsPreviewCard friends={[]} />
              <PhotosPreviewCard photos={[]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

