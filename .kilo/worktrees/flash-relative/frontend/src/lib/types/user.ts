import { Timestamp } from './common';

/**
 * Backend-aligned User from Prisma User + Profile
 */
export interface BackendUser extends Timestamp {
  id: string;
  username: string;
  email?: string;
  age?: number;
  pronouns?: string;
  genderPreference?: string | null;
  bio?: string;
  interests?: string[] | null;
  language?: string;
  timezone?: string;
  voiceComfort?: string;
  trustScore?: number;
  isSuspended?: boolean;
  isBanned?: boolean;
  profile?: {
    id: string;
    intro?: string;
    profilePhotoUrl: string | null;
    coverPhotoUrl: string | null;
    pronouns?: string;
    interests?: string;
    voiceOpen: boolean;
    gender?: string;
    dateOfBirth?: string;
    relationshipStatus?: string;
    workTitle?: string;
    workPlace?: string;
    education?: string;
    currentCity?: string;
    hometown?: string;
    updatedAt: string;
  } | null;
  friendsCount?: number;
  postsCount?: number;
  avatar: string; // computed from profile?.profilePhotoUrl || default
  coverPhoto: string; // computed from profile?.coverPhotoUrl || default
  fullName: string; // computed from username or profile
}

/**
 * Frontend UserProfile - extends BackendUser
 */
export interface UserProfile extends BackendUser {
  isOwnProfile: boolean;
  friendshipStatus: 'FRIENDS' | 'PENDING_INCOMING' | 'PENDING_OUTGOING' | 'NONE';
  mutualFriendsCount?: number;
  profileImage?: string | null;
  coverImage?: string | null;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  intro?: string;
  workTitle?: string;
  workPlace?: string;
  education?: string | null;
  currentCity?: string;
  hometown?: string;
  relationshipStatus?: string;
  voiceOpen?: boolean;
  isEmailVerified?: boolean;
  isProfileComplete?: boolean;
  likesCount?: number;
  viewsCount?: number;
  dateOfBirth?: string;
  work?: { title?: string; company?: string } | null;
  location?: { city?: string; hometown?: string } | null;
  profileDetails?: {
    interests?: string[] | null;
    updatedAt?: string;
    voiceOpen?: boolean;
  } | null;
}

export type User = UserProfile;

export interface BackendProfile {
  id: string;
  username: string;
  displayName?: string;
  email?: string;
  bio?: string | null;
  intro?: string | null;
  age?: number | null;
  pronouns?: string | null;
  genderPreference?: string | null;
  interests?: string[] | null;
  language?: string | null;
  timezone?: string | null;
  voiceComfort?: string | null;
  trustScore?: number;
  isSuspended?: boolean;
  isBanned?: boolean;
  friendsCount?: number;
  postsCount?: number;
  createdAt?: string;
  updatedAt?: string;
  isOwnProfile?: boolean;
  friendshipStatus?: 'FRIENDS' | 'PENDING_INCOMING' | 'PENDING_OUTGOING' | 'NONE' | string;
  gender?: string | null;
  profileDetails?: {
    voiceOpen?: boolean;
    interests?: string[] | null;
    updatedAt?: string;
  } | null;
  profile?: {
    profilePhotoUrl?: string | null;
    coverPhotoUrl?: string | null;
    intro?: string | null;
    voiceOpen?: boolean;
    workTitle?: string | null;
    workPlace?: string | null;
    education?: string | null;
    currentCity?: string | null;
    hometown?: string | null;
    relationshipStatus?: string | null;
    pronouns?: string | null;
    gender?: string | null;
    updatedAt?: string;
  } | null;
}

export interface UserMinimal {
  id: string;
  username: string;
  avatar?: string;
  fullName?: string;
  profileImage?: string;
  firstName?: string;
  lastName?: string;
}

export interface FriendPreview extends UserMinimal {
  mutualFriendsCount: number;
  isFollowing?: boolean;
}

export interface UpdateUserInput {
  username?: string;
  age?: number;
  bio?: string;
  pronouns?: string;
  genderPreference?: string;
  interests?: string[];
  language?: string;
}

export interface UpdateProfileInput {
  intro?: string;
  pronouns?: string;
  interests?: string[];
  voiceOpen?: boolean;
  firstName?: string;
  lastName?: string;
  bio?: string;
  work?: { title?: string; company?: string } | null;
  education?: { school?: string; graduationYear?: number } | null;
  location?: { city?: string; hometown?: string } | null;
  relationshipStatus?: string;
  dateOfBirth?: string;
}
