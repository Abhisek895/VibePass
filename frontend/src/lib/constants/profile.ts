import { ReactionType, PrivacyType } from '@/lib/types/profile';

export const REACTION_CONFIG: Record<ReactionType, {
  emoji: string;
  label: string;
  color: string;
}> = {
  like: { emoji: '👍', label: 'Like', color: 'text-blue-500' },
  love: { emoji: '❤️', label: 'Love', color: 'text-red-500' },
  care: { emoji: '🥰', label: 'Care', color: 'text-yellow-500' },
  haha: { emoji: '😂', label: 'Haha', color: 'text-yellow-500' },
  wow: { emoji: '😮', label: 'Wow', color: 'text-yellow-500' },
  sad: { emoji: '😢', label: 'Sad', color: 'text-yellow-500' },
  angry: { emoji: '😠', label: 'Angry', color: 'text-orange-500' },
};

export const PRIVACY_CONFIG: Record<PrivacyType, {
  icon: string;
  label: string;
  description: string;
}> = {
  public: { icon: '🌐', label: 'Public', description: 'Anyone can see' },
  friends: { icon: '👥', label: 'Friends', description: 'Only friends can see' },
  private: { icon: '🔒', label: 'Only me', description: 'Only you can see' },
};

export const PROFILE_TABS = [
  { id: 'posts', label: 'Posts', icon: '📝' },
  { id: 'about', label: 'About', icon: 'ℹ️' },
  { id: 'photos', label: 'Photos', icon: '📷' },
  { id: 'friends', label: 'Friends', icon: '👥' },
] as const;
