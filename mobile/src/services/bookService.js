import api from './api';

export const bookService = {
  // Get all books — backend uses 1-based page, returns { books, pagination }
  getAllBooks: async (page = 1, limit = 20, search = null, available = null) => {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (available !== null) params.available = available;
      const response = await api.get('/books', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search books using the backend's search param on GET /books
  searchBooks: async (query, page = 1, limit = 20) => {
    try {
      const response = await api.get('/books', {
        params: { page, limit, search: query },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get book by ID — backend returns { data: { book: {...} } }
  getBookById: async (id) => {
    try {
      const response = await api.get(`/books/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get featured books — backend returns array directly in data
  getFeaturedBooks: async () => {
    try {
      const response = await api.get('/books/featured');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search external books (Google Books API) — admin/librarian only
  searchExternalBooks: async (query) => {
    try {
      const response = await api.get('/books/search/external', {
        params: { q: query },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
