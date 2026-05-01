import { Timestamp } from './common';
import type { UserMinimal } from './user';
import type { Post } from './post';


export type NotificationType = 
  | 'LIKE_POST'
  | 'COMMENT_POST'
  | 'SHARE_POST'
  | 'FRIEND_REQUEST'
  | 'FRIEND_ACCEPTED'
  | 'NEW_MATCH'
  | 'NEW_MESSAGE'
  | 'VOICE_REQUEST'
  | 'ROOM_INVITE'
  | 'POST_MENTION'
  | 'PROFILE_VIEW';

export interface AppNotification extends Timestamp {
  id: string;
  type: NotificationType;
  actor: UserMinimal; // user who triggered notification
  targetUserId?: string;
  targetPost?: string | null; // post ID
  targetChat?: string | null; // chat ID
  targetRoom?: string | null; // room ID
  message: string; // rendered message like "Alex liked your post"
  read: boolean;
  actionUrl?: string; // link to post/chat/profile
  data: Record<string, any>; // extra data like post preview
}

export interface NotificationPreview extends Omit<AppNotification, 'data'> {
  previewPost?: Pick<Post, 'id' | 'content' | 'media'> | null;
}

export interface NotificationsResponse {
  notifications: AppNotification[];
  nextCursor: string | null;
  hasMore: boolean;
}

