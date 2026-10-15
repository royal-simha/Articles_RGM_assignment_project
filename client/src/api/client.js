// Determine API Base URL:
// 1. If VITE_API_URL is provided in environment variables, normalize and use it
// 2. In production (e.g. deployed on Vercel), fallback to the deployed Render backend
// 3. In local development, default to '/api/v1' to leverage Vite dev proxy
const resolveApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
  }

  // Deployed production fallback to Render backend
  if (import.meta.env.PROD) {
    return 'https://articles-rgm-assignment-project.onrender.com/api/v1';
  }

  // Local development fallback (Vite proxy: /api -> http://localhost:5000)
  return '/api/v1';
};

const API_BASE = resolveApiBase();

class ApiClient {
  static getToken() {
    return localStorage.getItem('token');
  }

  static setToken(token) {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  static async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const error = new Error(data?.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.errors = data?.errors || [];
        throw error;
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  // Auth Endpoints
  static async register(payload) {
    const res = await this.request('/auth/register', { method: 'POST', body: payload });
    if (res.data?.token) {
      this.setToken(res.data.token);
    }
    return res;
  }

  static async login(payload) {
    const res = await this.request('/auth/login', { method: 'POST', body: payload });
    if (res.data?.token) {
      this.setToken(res.data.token);
    }
    return res;
  }

  static async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch {
      // Continue cleanup even if server endpoint fails
    }
    this.setToken(null);
  }

  static async getCurrentUser() {
    return this.request('/auth/me', { method: 'GET' });
  }

  static async updateProfile(payload) {
    return this.request('/auth/profile', { method: 'PATCH', body: payload });
  }

  // Posts Endpoints
  static async getPosts({ page = 1, limit = 9, search = '', category = '', tag = '' } = {}) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (tag) params.append('tag', tag);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/posts${query}`, { method: 'GET' });
  }

  static async getPostBySlug(slug) {
    return this.request(`/posts/${slug}`, { method: 'GET' });
  }

  static async createPost(payload) {
    return this.request('/posts', { method: 'POST', body: payload });
  }

  static async updatePost(id, payload) {
    return this.request(`/posts/${id}`, { method: 'PATCH', body: payload });
  }

  static async deletePost(id) {
    return this.request(`/posts/${id}`, { method: 'DELETE' });
  }

  static async getMyPosts({ status = '', search = '' } = {}) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/users/me/posts${query}`, { method: 'GET' });
  }

  // Comments Endpoints
  static async getPostComments(postId) {
    return this.request(`/posts/${postId}/comments`, { method: 'GET' });
  }

  static async addComment(postId, content) {
    return this.request(`/posts/${postId}/comments`, { method: 'POST', body: { content } });
  }

  static async updateComment(commentId, content) {
    return this.request(`/comments/${commentId}`, { method: 'PATCH', body: { content } });
  }

  static async deleteComment(commentId) {
    return this.request(`/comments/${commentId}`, { method: 'DELETE' });
  }

  static async moderateComment(commentId, status) {
    return this.request(`/comments/${commentId}/moderate`, { method: 'PATCH', body: { status } });
  }

  // Categories & Tags
  static async getCategories() {
    return this.request('/categories', { method: 'GET' });
  }

  static async createCategory(payload) {
    return this.request('/categories', { method: 'POST', body: payload });
  }

  static async getTags() {
    return this.request('/tags', { method: 'GET' });
  }

  // Admin Endpoints
  static async getAdminStats() {
    return this.request('/admin/stats', { method: 'GET' });
  }

  static async getAdminUsers({ page = 1, limit = 20, search = '' } = {}) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (search) params.append('search', search);
    return this.request(`/admin/users?${params.toString()}`, { method: 'GET' });
  }

  static async toggleUserStatus(userId) {
    return this.request(`/admin/users/${userId}/status`, { method: 'PATCH' });
  }

  static async updateUserRole(userId, role) {
    return this.request(`/admin/users/${userId}/role`, { method: 'PATCH', body: { role } });
  }

  static async getAdminComments({ page = 1, limit = 20, status = '' } = {}) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (status) params.append('status', status);
    return this.request(`/admin/comments?${params.toString()}`, { method: 'GET' });
  }
}

export default ApiClient;
