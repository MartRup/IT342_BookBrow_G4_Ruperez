// Simplified security utilities

export const generateCSRFToken = () => {
  return Math.random().toString(36).substring(2, 34) + Math.random().toString(36).substring(2, 34);
};

export const storeCSRFToken = (token) => {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('csrfToken', token);
  }
  return token;
};

export const getCSRFToken = () => {
  if (typeof sessionStorage !== 'undefined') {
    return sessionStorage.getItem('csrfToken');
  }
  return null;
};

export const validateCSRFToken = (providedToken) => {
  const storedToken = getCSRFToken();
  return storedToken && storedToken === providedToken;
};

export const secureFetch = async (url, options = {}) => {
  const csrfToken = getCSRFToken();
  
  const secureOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      ...options.headers,
    },
    credentials: 'same-origin',
  };
  
  try {
    const response = await fetch(url, secureOptions);
    
    const newCSRFToken = response.headers.get('X-CSRF-Token');
    if (newCSRFToken) {
      storeCSRFToken(newCSRFToken);
    }
    
    return response;
  } catch (error) {
    console.error('Secure fetch error:', error);
    throw error;
  }
};

export const sanitizeForDisplay = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

export const isSafeURL = (url) => {
  try {
    if (typeof window === 'undefined') return false;
    const parsedUrl = new URL(url, window.location.origin);
    return parsedUrl.origin === window.location.origin;
  } catch {
    return false;
  }
};

export const apiRateLimit = {
  cache: new Map(),
  isAllowed: (endpoint, maxCalls = 10, windowMs = 60000) => {
    const now = Date.now();
    const key = endpoint;
    const calls = apiRateLimit.cache.get(key) || [];
    const validCalls = calls.filter(timestamp => now - timestamp < windowMs);
    if (validCalls.length >= maxCalls) return false;
    validCalls.push(now);
    apiRateLimit.cache.set(key, validCalls);
    return true;
  },
  reset: (endpoint) => {
    apiRateLimit.cache.delete(endpoint);
  }
};

export const sessionManager = {
  warningShown: false,
  init: (timeoutMinutes = 15, warningMinutes = 2) => {
    const timeout = timeoutMinutes * 60 * 1000;
    const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000;
    
    setTimeout(() => {
      if (!sessionManager.warningShown) {
        sessionManager.warningShown = true;
        // Use window.confirm to avoid ESLint restriction
        if (window.confirm('Your session is about to expire. Do you want to extend it?')) {
          sessionManager.warningShown = false;
          sessionManager.init(timeoutMinutes, warningMinutes);
        }
      }
    }, warningTime);
  }
};
