import apiClient from '../../services/apiClient';

export const login = (email, password) =>
  apiClient.post('/api/v1/auth/login', { email, password });

export const register = (data) =>
  apiClient.post('/api/v1/auth/register', data);

export const createLibrarian = (data) =>
  apiClient.post('/api/v1/auth/librarian', data);

export const createPrivilegedUser = (data) =>
  apiClient.post('/api/v1/auth/privileged', data);

export const health = () =>
  apiClient.get('/api/v1/auth/health');

const authApi = { login, register, createLibrarian, createPrivilegedUser, health };
export default authApi;
