import apiClient from '../../services/apiClient';

export const create = (bookId) =>
  apiClient.post('/api/v1/borrow', { bookId });

export const getUserBorrows = (status) =>
  apiClient.get('/api/v1/borrow/user', { params: { status } });

export const getAll = (params = {}) => {
  const { page = 1, limit = 20, status } = params;
  return apiClient.get('/api/v1/borrow/all', {
    params: { page, limit, status },
  });
};

export const returnBook = (borrowId) =>
  apiClient.put(`/api/v1/borrow/${borrowId}/return`);

const borrowApi = { create, getUserBorrows, getAll, returnBook };
export default borrowApi;
