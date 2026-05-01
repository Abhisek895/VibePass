import { apiRequest } from './client';

// Post types
export interface PostUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentCommentId?: string;
  user: PostUser;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Reaction {
  id: string;
  postId?: string;
  userId: string;
  reactionType: 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry';
  user: PostUser;
  createdAt: string;
}

export interface ReactionSummary {
  total: number;
  byType: {
    like: number;
    love: number;
    care: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
  };
  reactions: Reaction[];
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  privacy: 'public' | 'friends' | 'private';
  backgroundColor?: string;
  user: PostUser;
  reactions: Reaction[];
  comments: Comment[];
  commentsCount: number;
  reactionsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
  page: number;
  pageSize: number;
}

// Posts API calls
export const postsService = {
  /**
   * Create a new post
   */
  async createPost(data: {
    content: string;
    imageUrl?: string;
    privacy?: 'public' | 'friends' | 'private';
    backgroundColor?: string;
  }): Promise<Post> {
    return apiRequest<Post>('/api/posts', {
      method: 'POST',
      auth: true,
      body: data,
    });
  },

  /**
   * Get user's feed (posts from user and friends)
   */
  async getFeed(page = 1, limit = 20): Promise<PostsResponse> {
    return apiRequest<PostsResponse>(`/api/posts/feed?page=${page}&limit=${limit}`, {
      auth: true,
    });
  },

  /**
   * Get all posts by a specific user
   */
  async getUserPosts(username: string, page = 1, limit = 20): Promise<PostsResponse> {
    return apiRequest<PostsResponse>(`/api/posts/user/${username}?page=${page}&limit=${limit}`, {
      auth: false,
    });
  },

  /**
   * Get a single post by ID
   */
  async getPost(postId: string): Promise<Post> {
    return apiRequest<Post>(`/api/posts/${postId}`, {
      auth: false,
    });
  },

  /**
   * Update a post
   */
  async updatePost(postId: string, data: Partial<Post>): Promise<Post> {
    return apiRequest<Post>(`/api/posts/${postId}`, {
      method: 'PUT',
      auth: true,
      body: data,
    });
  },

  /**
   * Delete a post
   */
  async deletePost(postId: string): Promise<{ success: boolean; id: string }> {
    return apiRequest<{ success: boolean; id: string }>(`/api/posts/${postId}`, {
      method: 'DELETE',
      auth: true,
    });
  },

  /**
   * Search posts
   */
  async searchPosts(query: string, page = 1, limit = 20): Promise<PostsResponse> {
    return apiRequest<PostsResponse>(
      `/api/posts/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
      { auth: false }
    );
  },

  // Comments sub-endpoints
  /**
   * Add a comment to a post
   */
  async addComment(postId: string, data: { content: string; parentCommentId?: string }): Promise<Comment> {
    return apiRequest<Comment>(`/api/posts/${postId}/comments`, {
      method: 'POST',
      auth: true,
      body: data,
    });
  },

  /**
   * Get all comments on a post
   */
  async getPostComments(postId: string, page = 1, limit = 20): Promise<CommentsResponse> {
    return apiRequest<CommentsResponse>(`/api/posts/${postId}/comments?page=${page}&limit=${limit}`, {
      auth: false,
    });
  },

  /**
   * Get a single comment
   */
  async getComment(commentId: string): Promise<Comment> {
    return apiRequest<Comment>(`/api/comments/${commentId}`, {
      auth: false,
    });
  },

  /**
   * Update a comment
   */
  async updateComment(commentId: string, content: string): Promise<Comment> {
    return apiRequest<Comment>(`/api/comments/${commentId}`, {
      method: 'PUT',
      auth: true,
      body: { content },
    });
  },

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<{ success: boolean; id: string }> {
    return apiRequest<{ success: boolean; id: string }>(`/api/comments/${commentId}`, {
      method: 'DELETE',
      auth: true,
    });
  },

  // Reactions sub-endpoints
  /**
   * Add a reaction to a post
   */
  async addReaction(
    postId: string,
    reactionType: 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry'
  ): Promise<Reaction> {
    return apiRequest<Reaction>(`/api/posts/${postId}/reactions`, {
      method: 'POST',
      auth: true,
      body: { reactionType },
    });
  },

  /**
   * Remove a reaction from a post
   */
  async removeReaction(postId: string): Promise<{ success: boolean; id: string }> {
    return apiRequest<{ success: boolean; id: string }>(`/api/posts/${postId}/reactions`, {
      method: 'DELETE',
      auth: true,
    });
  },

  /**
   * Get all reactions on a post
   */
  async getPostReactions(postId: string): Promise<ReactionSummary> {
    return apiRequest<ReactionSummary>(`/api/posts/${postId}/reactions`, {
      auth: false,
    });
  },

  /**
   * Get current user's reaction on a post
   */
  async getUserReaction(postId: string): Promise<Reaction | null> {
    return apiRequest<Reaction | null>(`/api/posts/${postId}/reactions/user`, {
      auth: true,
    });
  },

  /**
   * Add reaction to a comment
   */
  async addCommentReaction(
    commentId: string,
    reactionType: 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry'
  ): Promise<Reaction> {
    return apiRequest<Reaction>(`/api/comments/${commentId}/reactions`, {
      method: 'POST',
      auth: true,
      body: { reactionType },
    });
  },

  /**
   * Remove reaction from a comment
   */
  async removeCommentReaction(commentId: string): Promise<{ success: boolean; id: string }> {
    return apiRequest<{ success: boolean; id: string }>(`/api/comments/${commentId}/reactions`, {
      method: 'DELETE',
      auth: true,
    });
  },
};
