// Validation utilities for BookBrow frontend

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
};

export const validateEmail = (email) => {
  const sanitized = sanitizeInput(email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(sanitized) ? sanitized : null;
};

/**
 * Validates password strength.
 * Minimum 8 characters (matches backend rule).
 * Returns { isValid: boolean, errors: string[] }
 */
export const validatePassword = (password) => {
  if (typeof password !== 'string' || password.length === 0) {
    return { isValid: false, errors: ['Password is required'] };
  }

  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters.');
  }

  return { isValid: errors.length === 0, errors };
};

export const validateName = (name) => {
  const sanitized = sanitizeInput(name);
  if (sanitized.length < 2) return null;
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  return nameRegex.test(sanitized) ? sanitized : null;
};

/**
 * Validates an optional phone number.
 * Accepts formats like: +63 912 345 6789, 09123456789, +1-800-555-0100
 * Returns true if valid, false otherwise.
 */
export const validatePhone = (phone) => {
  if (!phone) return true; // optional field
  const sanitized = sanitizeInput(phone);
  // Allows digits, spaces, dashes, parentheses, and a leading +
  const phoneRegex = /^\+?[\d\s\-().]{7,20}$/;
  return phoneRegex.test(sanitized);
};

export const rateLimit = {
  attempts: {},
  isAllowed: function (identifier, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    const now = Date.now();
    const attempts = this.attempts[identifier] || [];
    const validAttempts = attempts.filter((timestamp) => now - timestamp < windowMs);
    if (validAttempts.length >= maxAttempts) return false;
    validAttempts.push(now);
    this.attempts[identifier] = validAttempts;
    return true;
  },
  reset: function (identifier) {
    delete this.attempts[identifier];
  },
};
