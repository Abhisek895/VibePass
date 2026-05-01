import { apiRequest } from './client';

export interface CreatePostInput {
  content: string;
  imageUrl?: string;
}

export interface UpdatePostInput {
  content?: string;
}

export const postService = {
  async createPost(data: CreatePostInput) {
    return apiRequest('/api/v1/crud/post', {
      method: 'POST',
      auth: true,
      body: {
        data,
      },
    });
  },

  async deletePost(postId: string) {
    return apiRequest(`/api/v1/crud/post/${postId}`, {
      method: 'DELETE',
      auth: true,
    });
  },

  async updatePostCaption(postId: string, content: string) {
    return apiRequest(`/api/v1/crud/post/${postId}`, {
      method: 'PATCH',
      auth: true,
      body: {
        data: { content },
      },
    });
  },

  async clearPostCaption(postId: string) {
    return apiRequest(`/api/v1/crud/post/${postId}`, {
      method: 'PATCH',
      auth: true,
      body: {
        data: { content: '' },
      },
    });
  },
};

