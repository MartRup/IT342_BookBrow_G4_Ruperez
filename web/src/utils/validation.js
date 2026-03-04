// Simplified validation utilities to test webpack

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
};

export const validateEmail = (email) => {
  const sanitizedEmail = sanitizeInput(email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(sanitizedEmail) ? sanitizedEmail : null;
};

export const validatePassword = (password) => {
  if (typeof password !== 'string') return null;
  if (password.length === 0) {
    return {
      isValid: false,
      errors: ['Password is required']
    };
  }
  return { isValid: true, errors: [] };
};

export const validateName = (name) => {
  const sanitizedName = sanitizeInput(name);
  if (sanitizedName.length < 2) return null;
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  return nameRegex.test(sanitizedName) ? sanitizedName : null;
};

export const validateRole = (role) => {
  const validRoles = ['USER', 'LIBRARIAN'];
  return validRoles.includes(role) ? role : 'USER';
};

export const rateLimit = {
  attempts: {},
  isAllowed: function(identifier, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    const now = Date.now();
    const attempts = this.attempts[identifier] || [];
    const validAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
    if (validAttempts.length >= maxAttempts) return false;
    validAttempts.push(now);
    this.attempts[identifier] = validAttempts;
    return true;
  },
  reset: function(identifier) {
    delete this.attempts[identifier];
  }
};
