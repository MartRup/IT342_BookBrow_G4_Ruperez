import apiClient from '../../services/apiClient';

export const getAll = (params = {}) => {
  const { page = 1, limit = 20, role } = params;
  return apiClient.get('/api/v1/users', {
    params: { page, limit, role },
  });
};

export const updateRole = (id, role) =>
  apiClient.put(`/api/v1/users/${id}/role`, { role });

export const remove = (id) =>
  apiClient.delete(`/api/v1/users/${id}`);

export const updateProfile = (data) =>
  apiClient.put('/api/v1/users/profile', data);

export const changePassword = (data) =>
  apiClient.put('/api/v1/users/password', data);

export const deleteAccount = () =>
  apiClient.delete('/api/v1/users/account');

export const getSuspensionStatus = () =>
  apiClient.get('/api/v1/users/suspension-status');

const usersApi = { getAll, updateRole, remove, updateProfile, changePassword, deleteAccount, getSuspensionStatus };
export default usersApi;
