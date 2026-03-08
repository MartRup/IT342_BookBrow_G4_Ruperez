// Security utilities for frontend protection

// Generate CSRF token
export const generateCSRFToken = () => {
  try {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    } else {
      // Fallback for environments without crypto API
      return Math.random().toString(36).substring(2, 34) + Math.random().toString(36).substring(2, 34);
    }
  } catch (error) {
    // Ultimate fallback
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
};

// Store CSRF token securely
export const storeCSRFToken = (token) => {
  sessionStorage.setItem('csrfToken', token);
  return token;
};

// Get CSRF token
export const getCSRFToken = () => {
  return sessionStorage.getItem('csrfToken');
};

// Validate CSRF token for API calls
export const validateCSRFToken = (providedToken) => {
  const storedToken = getCSRFToken();
  return storedToken && storedToken === providedToken;
};

// Secure fetch with CSRF protection
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
    
    // Check for CSRF token in response headers
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

// Input sanitization for display
export const sanitizeForDisplay = (input) => {
  if (typeof input !== 'string') return '';
  
  // Simple HTML escaping without DOM manipulation
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

// Check if URL is safe
export const isSafeURL = (url) => {
  try {
    if (typeof window === 'undefined') return false;
    const parsedUrl = new URL(url, window.location.origin);
    return parsedUrl.origin === window.location.origin;
  } catch {
    return false;
  }
};

// Rate limiting for API calls
export const apiRateLimit = {
  cache: new Map(),
  
  isAllowed: (endpoint, maxCalls = 10, windowMs = 60000) => {
    const now = Date.now();
    const key = endpoint;
    const calls = apiRateLimit.cache.get(key) || [];
    
    // Filter calls outside the window
    const validCalls = calls.filter(timestamp => now - timestamp < windowMs);
    
    if (validCalls.length >= maxCalls) {
      return false;
    }
    
    // Add current call
    validCalls.push(now);
    apiRateLimit.cache.set(key, validCalls);
    
    return true;
  },
  
  reset: (endpoint) => {
    apiRateLimit.cache.delete(endpoint);
  }
};

// Session timeout management
export const sessionManager = {
  warningShown: false,
  
  init: (timeoutMinutes = 15, warningMinutes = 2) => {
    const timeout = timeoutMinutes * 60 * 1000;
    const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000;
    
    setTimeout(() => {
      if (!sessionManager.warningShown) {
        sessionManager.warningShown = true;
        if (confirm('Your session is about to expire. Do you want to extend it?')) {
          // Refresh session logic would go here
          sessionManager.warningShown = false;
          sessionManager.init(timeoutMinutes, warningMinutes);
        }
      }
    }, warningTime);
  }
};
