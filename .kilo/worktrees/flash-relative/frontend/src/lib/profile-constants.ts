import type { ReactionType } from '@/types/profile';

export const REACTION_EMOJIS: Record<ReactionType, string> = {
  like: '👍',
  love: '❤️',
  care: '🤍',
  haha: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😠',
};

export const REACTION_LABELS: Record<ReactionType, string> = {
  like: 'Like',
  love: 'Love',
  care: 'Care',
  haha: 'Haha',
  wow: 'Wow',
  sad: 'Sad',
  angry: 'Angry',
};

export const REACTION_COLORS: Record<ReactionType, string> = {
  like: 'bg-blue-100 text-blue-700',
  love: 'bg-red-100 text-red-700',
  care: 'bg-pink-100 text-pink-700',
  haha: 'bg-yellow-100 text-yellow-700',
  wow: 'bg-purple-100 text-purple-700',
  sad: 'bg-orange-100 text-orange-700',
  angry: 'bg-red-100 text-red-800',
};

export const PRIVACY_ICONS: Record<string, string> = {
  public: '🌐',
  friends: '👥',
  private: '🔒',
};

export const PRIVACY_LABELS: Record<string, string> = {
  public: 'Public',
  friends: 'Friends',
  private: 'Private',
};

export const PROFILE_TABS = [
  { id: 'posts', label: 'Posts', icon: '📝' },
  { id: 'about', label: 'About', icon: 'ℹ️' },
  { id: 'photos', label: 'Photos', icon: '📸' },
  { id: 'friends', label: 'Friends', icon: '👥' },
] as const;

export const LOADING_DELAY = 450;
export const ANIMATION_DELAY = 200;
export const DEBOUNCE_DELAY = 300;

export const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80';
export const DEFAULT_COVER = 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1200&q=80';

export const TEXTAREA_MAX_CHARS = 5000;
export const COMMENT_MAX_CHARS = 2000;
