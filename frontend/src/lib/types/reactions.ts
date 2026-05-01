import { ReactionType, Timestamp } from './common';
import { UserMinimal } from './user';

export interface PostReaction extends Timestamp {
  id: string;
  postId: string;
  user: UserMinimal;
  type: ReactionType;
}

export interface ReactionSummaryItem {
  type: ReactionType;
  count: number;
  users: UserMinimal[];
}

export interface PaginatedReactions {
  reactionType: ReactionType;
  count: number;
  users: UserMinimal[];
  page: number;
  hasMore: boolean;
}

export const REACTION_EMOJI: Record<ReactionType, string> = {
  LIKE: '👍',
  LOVE: '❤️',
  CARE: '🤍',
  HAHA: '😂',
  WOW: '😮',
  SAD: '😢',
  ANGRY: '😠',
};

export const REACTION_LABELS: Record<ReactionType, string> = {
  LIKE: 'Like',
  LOVE: 'Love',
  CARE: 'Care',
  HAHA: 'Haha',
  WOW: 'Wow',
  SAD: 'Sad',
  ANGRY: 'Angry',
};
