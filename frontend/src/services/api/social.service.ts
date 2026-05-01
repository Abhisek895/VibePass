import { apiRequest } from './client';
import { getAccessToken } from './storage';

// ============================================
// Types
// ============================================

export interface User {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  profilePhotoUrl: string | null;
  coverPhotoUrl: string | null;
  bio: string | null;
  intro: string | null;
  accountPrivacy: 'public' | 'friends' | 'private';
  isActive: boolean;
  createdAt: string;
  // Computed
  friendsCount?: number;
  postsCount?: number;
}

export interface Media {
  id: string;
  url: string;
  type: 'image' | 'video';
  orderIndex: number;
  width?: number;
  height?: number;
}

export interface PostAuthor {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  profilePhotoUrl: string | null;
}

export interface OriginalPost {
  id: string;
  content: string;
  author: PostAuthor;
  media: Media[];
  createdAt: string;
  isDeleted: boolean;
}

export interface Post {
  id: string;
  postType: 'original' | 'share';
  content: string | null;
  feeling: string | null;
  backgroundColor: string | null;
  visibility: 'public' | 'friends' | 'private';
  createdAt: string;
  updatedAt: string;
  author: PostAuthor;
  media: Media[];
  reactionsCount: number;
  commentsCount: number;
  sharesCount: number;
  currentUserReaction: string | null;
  isShare: boolean;
  originalPost: OriginalPost | null;
  shareCaption: string | null;
}

export interface FeedResponse {
  posts: Post[];
  nextCursor: string | null;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  parentCommentId: string | null;
  content: string;
  createdAt: string;
  author: PostAuthor;
  reactionsCount: number;
  repliesCount: number;
  currentUserReaction: string | null;
}

export interface ReactionType {
  type: 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry';
  emoji: string;
  label: string;
}

export const REACTION_TYPES: ReactionType[] = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'care', emoji: '🥰', label: 'Care' },
  { type: 'haha', emoji: '😂', label: 'Haha' },
  { type: 'wow', emoji: '😮', label: 'Wow' },
  { type: 'sad', emoji: '😢', label: 'Sad' },
  { type: 'angry', emoji: '😠', label: 'Angry' },
];

// ============================================
// Post Service
// ============================================

export const postsService = {
  async createPost(data: {
    content?: string;
    visibility?: 'public' | 'friends' | 'private';
    feeling?: string;
    backgroundColor?: string;
    media?: { url: string; type: 'image' | 'video'; width?: number; height?: number }[];
  }) {
    return apiRequest<Post>('/api/posts', {
      method: 'POST',
      auth: true,
      body: { ...data, postType: 'original' },
    });
  },

  async sharePost(postId: string, caption?: string) {
    return apiRequest<Post>(`/api/posts/${postId}/share`, {
      method: 'POST',
      auth: true,
      body: { caption },
    });
  },

  async getFeed(cursor?: string, limit = 20) {
    const params = new URLSearchParams();
    if (cursor) params.set('cursor', cursor);
    params.set('limit', limit.toString());
    return apiRequest<FeedResponse>(`/api/posts/feed?${params}`, { auth: true });
  },

  async getPost(postId: string) {
    const token = getAccessToken();
    const headers: Record<string, string> | undefined = token ? { Authorization: `Bearer ${token}` } : undefined;
    return apiRequest<Post>(`/api/posts/${postId}`, { headers });
  },

  async updatePost(postId: string, data: { content?: string; visibility?: string }) {
    return apiRequest<Post>(`/api/posts/${postId}`, {
      method: 'PATCH',
      auth: true,
      body: data,
    });
  },

  async deletePost(postId: string) {
    return apiRequest<{ success: boolean }>(`/api/posts/${postId}`, {
      method: 'DELETE',
      auth: true,
    });
  },

  async getUserPosts(username: string, cursor?: string, limit = 10) {
    const params = new URLSearchParams();
    if (cursor) params.set('cursor', cursor);
    params.set('limit', limit.toString());
    return apiRequest<FeedResponse>(`/api/posts/user/${username}?${params}`, { auth: true });
  },

  async getUserShares(username: string, cursor?: string, limit = 10) {
    const params = new URLSearchParams();
    if (cursor) params.set('cursor', cursor);
    params.set('limit', limit.toString());
    return apiRequest<FeedResponse>(`/api/posts/shares/${username}?${params}`, { auth: true });
  },
};

// ============================================
// Reaction Service
// ============================================

export const reactionsService = {
  async addReaction(postId: string, reactionType: string) {
    return apiRequest<{ liked: boolean }>(`/api/posts/${postId}/reactions`, {
      method: 'POST',
      auth: true,
      body: { reactionType },
    });
  },

  async removeReaction(postId: string) {
    return apiRequest<{ liked: boolean }>(`/api/posts/${postId}/reactions`, {
      method: 'DELETE',
      auth: true,
    });
  },
};

// ============================================
// Comment Service
// ============================================

export const commentsService = {
  async createComment(postId: string, content: string, parentCommentId?: string) {
    return apiRequest<Comment>(`/api/posts/${postId}/comments`, {
      method: 'POST',
      auth: true,
      body: { content, parentCommentId },
    });
  },

  async getComments(postId: string, cursor?: string, limit = 20) {
    const params = new URLSearchParams();
    if (cursor) params.set('cursor', cursor);
    params.set('limit', limit.toString());
    return apiRequest<{ comments: Comment[]; nextCursor: string | null }>(
      `/api/posts/${postId}/comments?${params}`,
      { auth: true }
    );
  },

  async updateComment(commentId: string, content: string) {
    return apiRequest<Comment>(`/api/comments/${commentId}`, {
      method: 'PATCH',
      auth: true,
      body: { content },
    });
  },

  async deleteComment(commentId: string) {
    return apiRequest<{ success: boolean }>(`/api/comments/${commentId}`, {
      method: 'DELETE',
      auth: true,
    });
  },
};

// ============================================
// User Service
// ============================================

export const userService = {
  async getProfile(username: string) {
    return apiRequest<User>(`/api/users/${username}`, { auth: true });
  },

  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    intro?: string;
    workTitle?: string;
    workPlace?: string;
    education?: string;
    currentCity?: string;
    hometown?: string;
    relationshipStatus?: string;
    accountPrivacy?: 'public' | 'friends' | 'private';
  }) {
    return apiRequest<User>('/api/users/me', {
      method: 'PATCH',
      auth: true,
      body: data,
    });
  },

  async updateProfilePhoto(photoUrl: string) {
    return apiRequest<User>('/api/users/me/profile-photo', {
      method: 'PATCH',
      auth: true,
      body: { profilePhotoUrl: photoUrl },
    });
  },

  async updateCoverPhoto(photoUrl: string) {
    return apiRequest<User>('/api/users/me/cover-photo', {
      method: 'PATCH',
      auth: true,
      body: { coverPhotoUrl: photoUrl },
    });
  },

  async getCurrentUser() {
    return apiRequest<User>('/api/auth/me', { auth: true });
  },
};

// ============================================
// Friends Service
// ============================================

export const friendsService = {
  async sendRequest(userId: string) {
    return apiRequest<{ success: boolean }>(`/api/friends/request/${userId}`, {
      method: 'POST',
      auth: true,
    });
  },

  async acceptRequest(requestId: string) {
    return apiRequest<{ success: boolean }>(`/api/friends/accept/${requestId}`, {
      method: 'POST',
      auth: true,
    });
  },

  async rejectRequest(requestId: string) {
    return apiRequest<{ success: boolean }>(`/api/friends/reject/${requestId}`, {
      method: 'POST',
      auth: true,
    });
  },

  async removeFriend(friendId: string) {
    return apiRequest<{ success: boolean }>(`/api/friends/${friendId}`, {
      method: 'DELETE',
      auth: true,
    });
  },

  async getPendingRequests() {
    return apiRequest<any[]>('/api/friends/requests', { auth: true });
  },

  async getFriendsList(userId: string) {
    return apiRequest<any[]>(`/api/users/${userId}/friends`, { auth: true });
  },

  async getFriendshipStatus(userId: string) {
    return apiRequest<any>(`/api/friends/${userId}/status`, { auth: true });
  },
};