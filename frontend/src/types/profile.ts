export type PrivacyType = 'public' | 'friends' | 'private';
export type ReactionType = 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry';
export type UserStatus = 'online' | 'offline' | 'idle';
export type PageTabType = 'posts' | 'about' | 'photos' | 'friends';

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar: string;
  coverPhoto: string;
  intro: string;
  bio: string;
  headline: string;
  workTitle: string;
  workPlace: string;
  education: string;
  currentCity: string;
  hometown: string;
  relationshipStatus: string;
  joinedDate: string;
  friendsCount: number;
  photosCount: number;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isOnline: boolean;
  isOwnProfile: boolean;
  mutualFriends: number;
  friendStatus: 'none' | 'pending' | 'friends' | 'request_sent';
}

export interface Profile extends User {
  contactEmail?: string;
  phone?: string;
  website?: string;
  pronouns?: string;
  updatedAt?: string;
  age?: number | null;
  genderPreference?: string | null;
  interests?: string[] | null;
  language?: string | null;
  timezone?: string | null;
  voiceComfort?: string | null;
  trustScore?: number;
  isSuspended?: boolean;
  isBanned?: boolean;
}

export interface PostMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  alt: string;
}

export interface Reaction {
  id: string;
  userId: string;
  type: ReactionType;
  createdAt: string;
}

export interface ReactionSummary {
  type: ReactionType;
  count: number;
  reacted?: boolean;
  userReactions?: Reaction[];
}

export interface Comment {
  id: string;
  postId: string;
  parentId?: string;
  user: User;
  content: string;
  createdAt: string;
  updatedAt?: string;
  likesCount: number;
  liked?: boolean;
  replies?: Comment[];
  replyCount?: number;
}

export interface CommentInput {
  content: string;
  postId: string;
  parentId?: string;
}

export interface FriendPreview {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar: string;
  mutualFriends: number;
  status: 'friend' | 'requested' | 'suggested';
  friendStatus: 'none' | 'pending' | 'friends' | 'request_sent';
}

export interface PhotoItem {
  id: string;
  url: string;
  thumbnail: string;
  caption: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  likesCountSummary?: ReactionSummary[];
}

export interface Post {
  id: string;
  user: User;
  content: string;
  media: PostMedia[];
  reactions: ReactionSummary[];
  comments: Comment[];
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  updatedAt?: string;
  privacy: PrivacyType;
  isShared?: boolean;
  originalPost?: Post;
  sharedBy?: User;
  currentUserReaction?: ReactionType;
}

export interface PostCreateInput {
  content: string;
  media?: PostMedia[];
  privacy: PrivacyType;
}

export interface EditProfileInput {
  firstName?: string;
  lastName?: string;
  bio?: string;
  headline?: string;
  workTitle?: string;
  workPlace?: string;
  education?: string;
  currentCity?: string;
  hometown?: string;
  relationshipStatus?: string;
  contactEmail?: string;
  phone?: string;
  website?: string;
  pronouns?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface SharedPost {
  id: string;
  user: User;
  content: string;
  media: PostMedia[];
  originalPost?: Post;
  sharedBy: User;
  createdAt: string;
  privacy: PrivacyType;
}

export interface ProfileTab {
  id: 'posts' | 'about' | 'friends' | 'photos' | 'videos';
  label: string;
  icon: string;
  href: string;
}

export type ProfileSection = 'posts' | 'about' | 'friends' | 'photos';
