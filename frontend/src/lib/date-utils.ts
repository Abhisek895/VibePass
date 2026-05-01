/**
 * Extended utility functions for profile module
 */

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTimeAgo = (date: string | Date): string => {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
  return `${Math.floor(seconds / 31536000)}y ago`;
};

export const formatRelativeTime = formatTimeAgo;

export const getFullName = (
  firstName?: string | null,
  lastName?: string | null,
): string => {
  return [firstName, lastName].filter(Boolean).join(' ').trim() || 'VibePass User';
};

export const getTimeGroup = (date: string | Date): string => {
  const now = new Date();
  const d = new Date(date);
  const diffTime = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const notificationDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayDiff = Math.floor((today.getTime() - notificationDate.getTime()) / (1000 * 60 * 60 * 24));

  if (dayDiff === 0) return 'Today';
  if (dayDiff === 1) return 'Yesterday';
  if (dayDiff <= 7) return 'This Week';
  if (dayDiff <= 30) return 'This Month';
  return 'Older';
};

export const truncateText = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

export const getInitials = (firstName?: string | null, lastName?: string | null): string => {
  const first = firstName?.charAt(0).toUpperCase() || 'V';
  const last = lastName?.charAt(0).toUpperCase() || '';
  return first + last;
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const isEmpty = (obj: unknown): boolean => {
  if (obj === null || obj === undefined) return true;
  if (typeof obj !== 'object') return false;
  return Object.keys(obj).length === 0;
};
