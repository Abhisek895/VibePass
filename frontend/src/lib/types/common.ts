/**
 * Common types shared across the application
 */

export type PrivacyType = 'PUBLIC' | 'FRIENDS' | 'PRIVATE';

export type ReactionType = 'LIKE' | 'LOVE' | 'CARE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface FileUploadResponse {
  url: string;
  publicId: string;
  size: number;
  mimeType: string;
}

export type FriendshipStatus = 'FRIENDS' | 'PENDING_INCOMING' | 'PENDING_OUTGOING' | 'NONE';

export interface Timestamp {
  createdAt: string;
  updatedAt: string;
}
