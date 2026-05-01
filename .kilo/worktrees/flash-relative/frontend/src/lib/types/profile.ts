export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar: string | null;
  coverPhoto: string | null;
  bio: string | null;
  intro: string | null;
  work: {
    title: string;
    company: string;
  } | null;
  education: {
    school: string;
    degree: string;
  } | null;
  currentCity: string | null;
  hometown: string | null;
  relationshipStatus: 'single' | 'dating' | 'married' | 'complicated' | null;
  joinedDate: string;
  friendsCount: number;
  postsCount: number;
  photosCount: number;
  isOnline: boolean;
  mutualFriends: number;
  relationship: 'none' | 'friend' | 'pending_sent' | 'pending_received' | 'following';
  isOwnProfile: boolean;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  media: PostMedia[];
  reactions: ReactionSummary;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  privacy: PrivacyType;
  isShared: boolean;
  originalPost?: Post | null;
  sharedBy?: User | null;
  shareCaption?: string;
}

export interface PostMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail: string;
  width: number;
  height: number;
}

export interface ReactionSummary {
  total: number;
  breakdown: Record<ReactionType, number>;
  userReaction: ReactionType | null;
}

export type ReactionType = 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry';

export type PrivacyType = 'public' | 'friends' | 'private';

export interface Comment {
  id: string;
  author: User;
  content: string;
  createdAt: string;
  likes: number;
  userLiked: boolean;
  replies: Comment[];
}

export interface FriendPreview {
  id: string;
  fullName: string;
  avatar: string | null;
  mutualFriends: number;
  relationship: 'none' | 'friend' | 'pending';
}

export interface PhotoItem {
  id: string;
  url: string;
  thumbnail: string;
  createdAt: string;
  likes: number;
  comments: number;
}
