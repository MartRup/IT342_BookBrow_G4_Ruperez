/**
 * Unified API service client.
 * Handles base URL configuration, endpoints, and automatic auth token injection.
 */
import axios from 'axios';

// ── Axios Instance with Interceptors ─────────────────────────────
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: inject auth token
apiClient.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const token = user?.token || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: normalize errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Auto-redirect on 401 (token expired)
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Facade: Auth API ─────────────────────────────────────────────
const auth = {
  login: (email, password) =>
    apiClient.post('/api/v1/auth/login', { email, password }),

  register: (data) =>
    apiClient.post('/api/v1/auth/register', data),

  createLibrarian: (data) =>
    apiClient.post('/api/v1/auth/librarian', data),

  createPrivilegedUser: (data) =>
    apiClient.post('/api/v1/auth/privileged', data),

  health: () =>
    apiClient.get('/api/v1/auth/health'),
};

// ── Facade: Books API ────────────────────────────────────────────
const books = {
  getAll: (params = {}) => {
    const { page = 1, limit = 20, search, available } = params;
    return apiClient.get('/api/v1/books', {
      params: { page, limit, search, available },
    });
  },

  getById: (id) =>
    apiClient.get(`/api/v1/books/${id}`),

  create: (bookData) =>
    apiClient.post('/api/v1/books', bookData),

  update: (id, bookData) =>
    apiClient.put(`/api/v1/books/${id}`, bookData),

  delete: (id) =>
    apiClient.delete(`/api/v1/books/${id}`),
};

// ── Facade: Borrow API ──────────────────────────────────────────
const borrow = {
  create: (bookId) =>
    apiClient.post('/api/v1/borrow', { bookId }),

  getUserBorrows: (status) =>
    apiClient.get('/api/v1/borrow/user', { params: { status } }),

  getAll: (params = {}) => {
    const { page = 1, limit = 20, status } = params;
    return apiClient.get('/api/v1/borrow/all', {
      params: { page, limit, status },
    });
  },

  returnBook: (borrowId) =>
    apiClient.put(`/api/v1/borrow/${borrowId}/return`),
};

// ── Facade: Users API ───────────────────────────────────────────
const users = {
  getAll: (params = {}) => {
    const { page = 1, limit = 20, role } = params;
    return apiClient.get('/api/v1/users', {
      params: { page, limit, role },
    });
  },

  updateRole: (id, role) =>
    apiClient.put(`/api/v1/users/${id}/role`, { role }),

  delete: (id) =>
    apiClient.delete(`/api/v1/users/${id}`),

  updateProfile: (data) =>
    apiClient.put('/api/v1/users/profile', data),

  changePassword: (data) =>
    apiClient.put('/api/v1/users/password', data),

  deleteAccount: () =>
    apiClient.delete('/api/v1/users/account'),
};

// ── Facade: Dashboard API ───────────────────────────────────────
const dashboard = {
  getStats: (email) =>
    apiClient.get('/api/dashboard/stats/by-email', { params: { email } }),

  getFeaturedBooks: () =>
    apiClient.get('/api/v1/books/featured'),
};

// ── Export unified facade ────────────────────────────────────────
const ApiService = {
  auth,
  books,
  borrow,
  users,
  dashboard,
  client: apiClient, // Escape hatch for custom calls
};

export default ApiService;
