import { PrivacyType, ReactionType, Timestamp } from './common';
import { UserMinimal } from './user';

export interface PostMedia {
  id: string;
  url: string;
  type: 'IMAGE' | 'VIDEO';
  order: number;
  width?: number;
  height?: number;
}

export interface ReactionSummary {
  LIKE: number;
  LOVE: number;
  CARE: number;
  HAHA: number;
  WOW: number;
  SAD: number;
  ANGRY: number;
  userReaction?: ReactionType;
}

export interface Post extends Timestamp {
  id: string;
  author: UserMinimal;
  content: string;
  privacy: PrivacyType;
  media: PostMedia[];
  backgroundColor?: string;
  reactionsCount: ReactionSummary;
  commentsCount: number;
  sharesCount: number;
  isShared: boolean;
  sharedBy?: UserMinimal;
  sharedCaption?: string;
  originalPost?: Post;
}

export interface SharedPost extends Timestamp {
  id: string;
  sharedBy: UserMinimal;
  caption?: string;
  privacy: PrivacyType;
  originalPost: Post;
  reactionsCount: ReactionSummary;
  commentsCount: number;
  sharesCount: number;
}

export interface CreatePostInput {
  content: string;
  privacy: PrivacyType;
  media?: File[];
  backgroundColor?: string;
}

export interface UpdatePostInput {
  content?: string;
  privacy?: PrivacyType;
  backgroundColor?: string;
}

export interface PostFeed {
  posts: Post[];
  total: number;
  page: number;
  hasMore: boolean;
}
