import api from './api';

export const bookService = {
  // Get all books
  getAllBooks: async (page = 0, size = 20) => {
    try {
      const response = await api.get(`/books?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search books
  searchBooks: async (query, page = 0, size = 20) => {
    try {
      const response = await api.get(`/books/search?query=${query}&page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get book by ID
  getBookById: async (id) => {
    try {
      const response = await api.get(`/books/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get featured books
  getFeaturedBooks: async () => {
    try {
      const response = await api.get('/books/featured');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search external books (Google Books API)
  searchExternalBooks: async (query) => {
    try {
      const response = await api.get(`/books/external/search?query=${query}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
