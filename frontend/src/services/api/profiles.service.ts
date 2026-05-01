import { apiRequest } from './client';
import { UserProfile, UpdateProfileInput, UpdateUserInput } from '@/lib/types';

// Export types used by this service
export type { UserProfile, UpdateProfileInput, UpdateUserInput };

export interface UserMinimal {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  bio?: string;
}

export interface Friend {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  coverImage?: string;
  mutualFriendsCount: number;
}

export interface SearchUsersResponse {
  users: UserMinimal[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Relationship {
  isFriend: boolean;
  pendingRequest: null | { id: string; sentBy: 'you' | 'them' };
}

// Profile API calls
export const profileService = {
  /**
   * Get current user's profile
   */
  async getMe(): Promise<UserProfile> {
    return apiRequest<UserProfile>('/api/v1/users/me', {
      auth: true,
    });
  },

  /**
    * Get user profile by username
    */
  async getProfile(username: string, viewerId?: string): Promise<UserProfile> {
    const query = viewerId ? `?viewerId=${viewerId}` : '';
    return apiRequest<UserProfile>(`/api/users/${username}${query}`, {
      auth: false,
    });
  },

  /**
    * Update user profile
    */
  async updateProfile(data: UpdateProfileInput): Promise<UserProfile> {
    return apiRequest<UserProfile>('/api/v1/users/me', {
      method: 'PUT',
      auth: true,
      body: data,
    });
  },

  /**
    * Update user
    */
  async updateUser(data: UpdateUserInput): Promise<UserProfile> {
    return apiRequest<UserProfile>('/api/v1/users/me', {
      method: 'PUT',
      auth: true,
      body: data,
    });
  },

  /**
   * Update profile photo
   */
  async updateProfilePhoto(photoUrl: string): Promise<UserProfile> {
    return apiRequest<UserProfile>('/api/v1/users/me/profile-photo', {
      method: 'PUT',
      auth: true,
      body: { url: photoUrl },
    });
  },

  async clearProfilePhoto(): Promise<UserProfile> {
    return apiRequest<UserProfile>('/api/v1/users/me/profile-photo', {
      method: 'DELETE',
      auth: true,
    });
  },

  /**
   * Update cover photo
   */
  async updateCoverPhoto(coverUrl: string): Promise<UserProfile> {
    return apiRequest<UserProfile>('/api/v1/users/me/cover-photo', {
      method: 'PUT',
      auth: true,
      body: { url: coverUrl },
    });
  },

  async clearCoverPhoto(): Promise<UserProfile> {
    return apiRequest<UserProfile>('/api/v1/users/me/cover-photo', {
      method: 'DELETE',
      auth: true,
    });
  },

  /**
   * Upload profile photo
   */
  async uploadProfilePhoto(file: File): Promise<UserProfile> {
    const formData = new FormData();
    formData.append('file', file);

    return apiRequest<UserProfile>('/api/v1/users/me/profile-photo/upload', {
      method: 'POST',
      auth: true,
      body: formData,
    });
  },

  /**
   * Upload cover photo
   */
  async uploadCoverPhoto(file: File): Promise<UserProfile> {
    const formData = new FormData();
    formData.append('file', file);

    return apiRequest<UserProfile>('/api/v1/users/me/cover-photo/upload', {
      method: 'POST',
      auth: true,
      body: formData,
    });
  },

  /**
   * Get user's friends
   */
  async getUserFriends(username: string, page = 1, limit = 20): Promise<{ friends: Friend[]; total: number; page: number; pageSize: number }> {
    return apiRequest(`/api/users/${username}/friends?page=${page}&limit=${limit}`, {
      auth: false,
    });
  },

  /**
   * Search users by query
   */
  async searchUsers(query: string, page = 1, limit = 20): Promise<SearchUsersResponse> {
    return apiRequest<SearchUsersResponse>(
      `/api/users/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
      { auth: false }
    );
  },

  /**
   * Get relationship status with another user
   */
  async getRelationship(userId: string): Promise<Relationship> {
    return apiRequest<Relationship>(`/api/friendships/status/${userId}`, {
      auth: true,
    });
  },

  /**
   * Get mutual friends with another user
   */
  async getMutualFriends(userId: string): Promise<Friend[]> {
    return apiRequest<Friend[]>(`/api/friendships/mutual/${userId}`, {
      auth: true,
    });
  },

  /**
   * Get trending users
   */
  async getTrendingUsers(limit = 10): Promise<UserMinimal[]> {
    return apiRequest<UserMinimal[]>(`/api/users/trending?limit=${limit}`, {
      auth: false,
    });
  },

  /**
   * Delete current user's account
   */
  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>('/api/v1/users/me', {
      method: 'DELETE',
      auth: true,
    });
  },
};
