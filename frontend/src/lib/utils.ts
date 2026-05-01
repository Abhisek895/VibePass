export function cn(...inputs: Array<string | undefined | false | null>) {
  return inputs.filter(Boolean).join(' ');
}

export function formatRelativeDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const delta = Math.round((now.getTime() - date.getTime()) / 1000);

  if (delta < 60) return 'Just now';
  if (delta < 60 * 60) return `${Math.floor(delta / 60)}m`;
  if (delta < 60 * 60 * 24) return `${Math.floor(delta / (60 * 60))}h`;
  if (delta < 60 * 60 * 24 * 7) return `${Math.floor(delta / (60 * 60 * 24))}d`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Extended utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type) && file.size <= 5 * 1024 * 1024;
};

export const pluralize = (word: string, count: number): string => {
  return count === 1 ? word : word + 's';
};

export const getReactionEmoji = (reactionType: string): string => {
  const emojiMap: Record<string, string> = {
    LIKE: '👍',
    LOVE: '❤️',
    CARE: '🤍',
    HAHA: '😂',
    WOW: '😮',
    SAD: '😢',
    ANGRY: '😠',
    like: '👍',
    love: '❤️',
    care: '🤗',
    haha: '😂',
    wow: '😮',
    sad: '😢',
    angry: '😡',
  };
  return emojiMap[reactionType] || '👍';
};

