import { ReactionType, Timestamp } from './common';
import { UserMinimal } from './user';

export interface CommentReaction {
  type: ReactionType;
  count: number;
  userReaction?: ReactionType;
}

export interface Comment extends Timestamp {
  id: string;
  postId: string;
  author: UserMinimal;
  content: string;
  attachmentUrl?: string;
  reactions: CommentReaction[];
  repliesCount: number;
  replies?: Reply[];
}

export interface Reply extends Timestamp {
  id: string;
  commentId: string;
  author: UserMinimal;
  content: string;
  attachmentUrl?: string;
  reactions: CommentReaction[];
}

export interface CreateCommentInput {
  content: string;
  attachmentUrl?: string;
}

export interface CreateReplyInput {
  content: string;
  attachmentUrl?: string;
}

export interface UpdateCommentInput {
  content: string;
}
