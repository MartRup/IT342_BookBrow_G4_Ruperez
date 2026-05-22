const runtimeEnv = window.__BOOKBROW_ENV__ || {};

export const API_BASE_URL =
  runtimeEnv.REACT_APP_API_URL ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:8080';

export const getApiUrl = (path = '') => `${API_BASE_URL}${path}`;
