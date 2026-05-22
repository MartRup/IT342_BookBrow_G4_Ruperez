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
      const response = await api.get('/borrow/user');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get active borrows
  getActiveBorrows: async () => {
    try {
      const response = await api.get('/borrow/user', {
        params: { status: 'active' },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get borrow history
  getBorrowHistory: async () => {
    try {
      const response = await api.get('/borrow/user');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
