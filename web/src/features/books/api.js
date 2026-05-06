import apiClient from '../../services/apiClient';

export const getAll = (params = {}) => {
  const { page = 1, limit = 20, search, available } = params;
  return apiClient.get('/api/v1/books', {
    params: { page, limit, search, available },
  });
};

export const getById = (id) =>
  apiClient.get(`/api/v1/books/${id}`);

export const create = (bookData) =>
  apiClient.post('/api/v1/books', bookData);

export const update = (id, bookData) =>
  apiClient.put(`/api/v1/books/${id}`, bookData);

export const remove = (id) =>
  apiClient.delete(`/api/v1/books/${id}`);

const booksApi = { getAll, getById, create, update, remove };
export default booksApi;
