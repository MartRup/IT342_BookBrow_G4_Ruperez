import api from './api';

export const borrowService = {
  // Borrow a book
  borrowBook: async (bookId) => {
    try {
      const response = await api.post('/borrow', { bookId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's borrow records
  getMyBorrowRecords: async () => {
    try {
      const response = await api.get('/borrow/my-records');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get active borrows
  getActiveBorrows: async () => {
    try {
      const response = await api.get('/borrow/active');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get borrow history
  getBorrowHistory: async () => {
    try {
      const response = await api.get('/borrow/history');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get borrow record by ID
  getBorrowRecordById: async (id) => {
    try {
      const response = await api.get(`/borrow/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
