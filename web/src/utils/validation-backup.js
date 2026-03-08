// Input validation and sanitization utilities

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

export const validateEmail = (email) => {
  const sanitizedEmail = sanitizeInput(email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(sanitizedEmail) ? sanitizedEmail : null;
};

export const validatePassword = (password) => {
  if (typeof password !== 'string') return null;
  
  // Password requirements: at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  
  if (!passwordRegex.test(password)) {
    return {
      isValid: false,
      errors: [
        'Password must be at least 8 characters long',
        'Password must contain at least one uppercase letter',
        'Password must contain at least one lowercase letter',
        'Password must contain at least one number',
        'Password must contain at least one special character (@$!%*?&)'
      ]
    };
  }
  
  return { isValid: true, errors: [] };
};

export const validateName = (name) => {
  const sanitizedName = sanitizeInput(name);
  
  if (sanitizedName.length < 2) return null;
  if (sanitizedName.length > 100) return null;
  
  // Allow only letters, spaces, hyphens, and apostrophes
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
    
    // Remove attempts outside the window
    const validAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }
    
    // Add current attempt
    validAttempts.push(now);
    this.attempts[identifier] = validAttempts;
    
    return true;
  },
  
  reset: function(identifier) {
    delete this.attempts[identifier];
  }
};
