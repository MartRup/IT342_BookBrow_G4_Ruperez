import apiClient from '../../services/apiClient';

export const getStats = (email) =>
  apiClient.get('/api/dashboard/stats/by-email', { params: { email } });

export const getFeaturedBooks = () =>
  apiClient.get('/api/v1/books/featured');

const dashboardApi = { getStats, getFeaturedBooks };
export default dashboardApi;
