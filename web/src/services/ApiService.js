import apiClient from './apiClient';
import authApi from '../features/auth/api';
import booksApi from '../features/books/api';
import borrowApi from '../features/borrow/api';
import usersApi from '../features/users/api';
import dashboardApi from '../features/dashboard/api';

// ── Export unified facade for backward compatibility ────────────────
const ApiService = {
  auth: authApi,
  books: booksApi,
  borrow: borrowApi,
  users: usersApi,
  dashboard: dashboardApi,
  client: apiClient, // Escape hatch for custom calls
};

export default ApiService;
