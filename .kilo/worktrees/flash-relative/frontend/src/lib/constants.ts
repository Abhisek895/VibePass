import { ProfileTab, PrivacyType, ReactionType } from '@/types/profile';

export const profileTabs: ProfileTab[] = [
  { id: 'posts', label: 'Posts', icon: '📝', href: '/profile/{username}' },
  { id: 'about', label: 'About', icon: 'ℹ️', href: '/profile/{username}/about' },
  { id: 'photos', label: 'Photos', icon: '📷', href: '/profile/{username}/photos' },
  { id: 'friends', label: 'Friends', icon: '👥', href: '/profile/{username}/friends' },
];

export const privacyOptions: { value: PrivacyType; label: string; subtitle: string }[] = [
  { value: 'public', label: 'Public', subtitle: 'Anyone can see this post' },
  { value: 'friends', label: 'Friends', subtitle: 'Only friends can see this post' },
  { value: 'private', label: 'Only me', subtitle: 'Only you can see this post' },
];

export const reactionTypes: { type: ReactionType; label: string; emoji: string; color: string }[] = [
  { type: 'like', label: 'Like', emoji: '👍', color: 'text-sky-500' },
  { type: 'love', label: 'Love', emoji: '❤️', color: 'text-rose-500' },
  { type: 'care', label: 'Care', emoji: '🤗', color: 'text-amber-400' },
  { type: 'haha', label: 'Haha', emoji: '😂', color: 'text-yellow-400' },
  { type: 'wow', label: 'Wow', emoji: '😮', color: 'text-amber-300' },
  { type: 'sad', label: 'Sad', emoji: '😢', color: 'text-slate-400' },
  { type: 'angry', label: 'Angry', emoji: '😡', color: 'text-orange-500' },
];

export const relationshipOptions = [
  'Single',
  'In a relationship',
  'Engaged',
  'Married',
  'It’s complicated',
] as const;
// Query Keys for React Query
export const QUERY_KEYS = {
  PROFILE: (username: string) => ['profile', username],
  POSTS: (username: string, page?: number) => ['posts', username, page],
  POST: (id: string) => ['post', id],
  COMMENTS: (postId: string, page?: number) => ['comments', postId, page],
  REACTIONS: (postId: string) => ['reactions', postId],
  FRIENDS: (username: string, page?: number) => ['friends', username, page],
  PHOTOS: (username: string, page?: number) => ['photos', username, page],
  CURRENT_USER: () => ['currentUser'],
} as const;

// Reactions constant
export const REACTIONS = [
  { type: 'LIKE', emoji: '👍', label: 'Like' },
  { type: 'LOVE', emoji: '❤️', label: 'Love' },
  { type: 'CARE', emoji: '🤍', label: 'Care' },
  { type: 'HAHA', emoji: '😂', label: 'Haha' },
  { type: 'WOW', emoji: '😮', label: 'Wow' },
  { type: 'SAD', emoji: '😢', label: 'Sad' },
  { type: 'ANGRY', emoji: '😠', label: 'Angry' },
] as const;

// Pagination limits
export const PAGINATION_LIMITS = {
  POSTS: 10,
  COMMENTS: 5,
  FRIENDS: 12,
  PHOTOS: 9,
  DEFAULT: 20,
} as const;

// Empty states
export const EMPTY_STATES = {
  NO_POSTS: {
    title: 'No Posts Yet',
    description: 'Be the first to share something with this profile.',
  },
  NO_COMMENTS: {
    title: 'No Comments',
    description: 'Start a conversation by leaving a comment.',
  },
  NO_FRIENDS: {
    title: 'No Friends Yet',
    description: 'This user is just getting started.',
  },
  NO_PHOTOS: {
    title: 'No Photos',
    description: 'No photos shared yet.',
  },
} as const;