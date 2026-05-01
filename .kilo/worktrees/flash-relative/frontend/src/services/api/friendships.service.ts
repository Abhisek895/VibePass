import { apiRequest } from './client';

export interface FriendUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  coverImage?: string;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  sender: FriendUser;
  receiver: FriendUser;
  createdAt: string;
  respondedAt?: string;
}

export interface FriendRequestsResponse {
  requests: FriendRequest[];
  total: number;
  page: number;
  pageSize: number;
}

export interface FriendsResponse {
  friends: FriendUser[];
  total: number;
  page: number;
  pageSize: number;
}

// Friendships API calls
export const friendshipsService = {
  /**
   * Send a friend request to a user
   */
  async sendFriendRequest(userId: string): Promise<FriendRequest> {
    return apiRequest<FriendRequest>(`/api/friendships/request/${userId}`, {
      method: 'POST',
      auth: true,
    });
  },

  /**
   * Get all pending friend requests for current user
   */
  async getFriendRequests(page = 1, limit = 20): Promise<FriendRequestsResponse> {
    return apiRequest<FriendRequestsResponse>(`/api/friendships/requests?page=${page}&limit=${limit}`, {
      auth: true,
    });
  },

  /**
   * Accept a friend request
   */
  async acceptFriendRequest(requestId: string): Promise<{ success: boolean; id: string }> {
    return apiRequest<{ success: boolean; id: string }>(
      `/api/friendships/request/${requestId}/accept`,
      {
        method: 'POST',
        auth: true,
      }
    );
  },

  /**
   * Reject a friend request
   */
  async rejectFriendRequest(requestId: string): Promise<{ success: boolean; id: string }> {
    return apiRequest<{ success: boolean; id: string }>(
      `/api/friendships/request/${requestId}/reject`,
      {
        method: 'POST',
        auth: true,
      }
    );
  },

  /**
   * Get user's friends
   */
  async getUserFriends(userId: string, page = 1, limit = 20): Promise<FriendsResponse> {
    return apiRequest<FriendsResponse>(`/api/users/${userId}/friends?page=${page}&limit=${limit}`, {
      auth: false,
    });
  },

  /**
   * Remove a friend
   */
  async removeFriend(friendId: string): Promise<{ success: boolean; id: string }> {
    return apiRequest<{ success: boolean; id: string }>(`/api/friendships/${friendId}`, {
      method: 'DELETE',
      auth: true,
    });
  },

  /**
   * Check if users are friends
   */
  async areFriends(userId: string): Promise<{ isFriend: boolean }> {
    return apiRequest<{ isFriend: boolean }>(`/api/friendships/status/${userId}`, {
      auth: true,
    });
  },

  /**
   * Get mutual friends between current user and another user
   */
  async getMutualFriends(userId: string): Promise<FriendUser[]> {
    return apiRequest<FriendUser[]>(`/api/friendships/mutual/${userId}`, {
      auth: true,
    });
  },
};
