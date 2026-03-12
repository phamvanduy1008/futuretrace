import { apiFetch } from './apiClient';

export interface CommunityPostData {
  title: string;
  content: string;
  category?: string;
  is_anonymous?: boolean;
  type: string;
  career_growth: number;
  happiness: number;
  roi: number;
  reliability: number;
  deep_analysis?: any;
  scenario_id?: string;
}

export const communityService = {
  getPosts: async (page = 1, limit = 3, filter = 'all', q = '') => {
    const url = new URL(`${(import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/community/posts`);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('filter', filter);
    if (q) url.searchParams.append('q', q);

    const response = await apiFetch(url.toString());

    if (!response.ok) {
      throw new Error('Không thể tải danh sách bài viết.');
    }

    return await response.json();
  },

  publishPost: async (data: CommunityPostData) => {
    const response = await apiFetch('/community/posts', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể chia sẻ bài viết.');
    }

    return await response.json();
  },

  toggleLike: async (postId: string) => {
    const response = await apiFetch(`/community/posts/${postId}/like`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error('Không thể thực hiện tương tác.');
    }

    return await response.json();
  },

  deletePost: async (postId: string) => {
    const response = await apiFetch(`/community/posts/${postId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Không thể xóa bài viết.');
    }

    return await response.json();
  },

  getComments: async (postId: string) => {
    const response = await apiFetch(`/community/posts/${postId}/comments`);

    if (!response.ok) {
      throw new Error('Không thể tải bình luận.');
    }

    return await response.json();
  },

  addComment: async (postId: string, content: string) => {
    const response = await apiFetch(`/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể gửi bình luận.');
    }

    return await response.json();
  },

  toggleCommentLike: async (postId: string, commentId: string) => {
    const response = await apiFetch(`/community/posts/${postId}/comments/${commentId}/like`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error('Không thể thực hiện tương tác với bình luận.');
    }

    return await response.json();
  }
};
