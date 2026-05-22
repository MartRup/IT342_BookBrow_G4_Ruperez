import './Register.css';

import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Alert from '../../components/Alert';
import {
  rateLimit,
  sanitizeInput,
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from '../../utils/validation';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: sanitizeInput(value) }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const fieldErrors = {};

    const sanitizedName = validateName(formData.fullName);
    if (!sanitizedName) {
      fieldErrors.fullName = 'Please enter a valid name (letters, spaces, hyphens, apostrophes only)';
    }

    const sanitizedEmail = validateEmail(formData.email);
    if (!sanitizedEmail) {
      fieldErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      fieldErrors.phone = 'Please enter a valid phone number';
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      fieldErrors.password = passwordValidation.errors.join(' ');
    }

    if (!formData.confirmPassword) {
      fieldErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      fieldErrors.confirmPassword = 'Passwords do not match';
    }

    return fieldErrors;
  };

  const completedFields = [
    formData.fullName,
    validateEmail(formData.email),
    !formData.phone || validatePhone(formData.phone),
    formData.password.length >= 8,
    formData.confirmPassword && formData.password === formData.confirmPassword,
  ].filter(Boolean).length;

  const passwordChecks = [
    { label: '8+ characters', met: formData.password.length >= 8 },
    { label: 'Uppercase', met: /[A-Z]/.test(formData.password) },
    { label: 'Lowercase', met: /[a-z]/.test(formData.password) },
    { label: 'Number', met: /\d/.test(formData.password) },
    { label: 'Symbol', met: /[^A-Za-z0-9]/.test(formData.password) },
  ];

  const passwordScore = passwordChecks.filter((check) => check.met).length;
  const strengthLabel = ['Empty', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][passwordScore];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');

    const clientIdentifier = formData.email || 'anonymous';
    if (!rateLimit.isAllowed(clientIdentifier, 3, 15 * 60 * 1000)) {
      setGlobalError('Too many registration attempts. Please try again in 15 minutes.');
      return;
    }

    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/v1/auth/register', {
        fullName: validateName(formData.fullName),
        email: validateEmail(formData.email),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone || null,
      });

      if (!response.data.success) {
        setGlobalError(response.data.error?.message || 'Error creating account');
      } else {
        rateLimit.reset(clientIdentifier);

        const msg = response.data.data?.message || 'Account created successfully! Please sign in.';
        setAlertMessage(msg);
        setAlertType('success');
        setShowAlert(true);

        setTimeout(() => {
          navigate('/login', { state: { message: msg } });
        }, 2000);
      }
    } catch (err) {
      const serverMsg = err.response?.data?.error?.message;
      setGlobalError(serverMsg || 'Error creating account. Please try again.');
      console.error('Registration error:', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-ambient auth-ambient-one" />
      <div className="auth-ambient auth-ambient-two" />

      <div className="auth-shell register-shell">
        <aside className="auth-story-panel register-story-panel" aria-label="BookBrow registration">
          <div className="shelf-preview">
            <div className="book-spine spine-red" />
            <div className="book-spine spine-gold" />
            <div className="book-spine spine-blue" />
            <div className="book-spine spine-green" />
            <div className="book-spine spine-plum" />
          </div>
          <p className="auth-kicker">Borrower Account</p>
          <h2>Build your profile and start browsing the shelves.</h2>
          <div className="signup-progress" aria-label="Registration completion">
            <div className="signup-progress-label">
              <span>Account setup</span>
              <strong>{completedFields}/5</strong>
            </div>
            <div className="signup-progress-track">
              <span style={{ width: `${(completedFields / 5) * 100}%` }} />
            </div>
          </div>
        </aside>

        <div className="auth-card register-card">
          <div className="auth-brand-header">
            <div className="auth-logo-circle">
              <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3ZM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82Z" />
              </svg>
            </div>
            <span className="auth-brand-name">BookBrow</span>
          </div>

          <h1>Join BookBrow!</h1>
          <p className="auth-subtitle">Create your account and start borrowing books</p>

          <div className="role-info-badge">
            <span aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19v17.5A2.5 2.5 0 0 1 16.5 22H7a3 3 0 0 1-3-3V5.5c0-.55.45-1 1-1Zm1 12.67c.31-.11.65-.17 1-.17h10V4H7.5A.5.5 0 0 0 7 4.5H6v12.67ZM7 19a1 1 0 0 0 0 2h9.5a.5.5 0 0 0 .5-.5V19H7Z" />
              </svg>
            </span>
            You will be registered as a <strong>Borrower</strong>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className={`form-group ${errors.fullName ? 'has-error' : ''} ${focusedField === 'fullName' ? 'is-focused' : ''}`}>
              <label htmlFor="fullName">Full Name</label>
              <div className="input-shell">
                <span className="input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 1.8c-3.81 0-7 2.15-7 4.8V20h14v-1.4c0-2.65-3.19-4.8-7-4.8Z" />
                  </svg>
                </span>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                  onFocus={() => setFocusedField('fullName')}
                  onBlur={() => setFocusedField('')}
                />
              </div>
              {errors.fullName && <span className="field-error">{errors.fullName}</span>}
            </div>

            <div className={`form-group ${errors.email ? 'has-error' : ''} ${focusedField === 'email' ? 'is-focused' : ''}`}>
              <label htmlFor="email">Email Address</label>
              <div className="input-shell">
                <span className="input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Zm2.5-.7a.7.7 0 0 0-.7.7v.34l6.2 4.02 6.2-4.02V6.5a.7.7 0 0 0-.7-.7h-11Zm11.7 3.18-5.71 3.7a.9.9 0 0 1-.98 0L5.8 8.98v8.52c0 .39.31.7.7.7h11c.39 0 .7-.31.7-.7V8.98Z" />
                  </svg>
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                />
              </div>
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className={`form-group ${errors.phone ? 'has-error' : ''} ${focusedField === 'phone' ? 'is-focused' : ''}`}>
              <label htmlFor="phone">
                Phone Number <span className="optional-label">(optional)</span>
              </label>
              <div className="input-shell">
                <span className="input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M7.2 3.5 9 3.1a2 2 0 0 1 2.22 1.12l.98 2.22a2 2 0 0 1-.5 2.31l-1.05.95a11.3 11.3 0 0 0 3.65 3.65l.95-1.05a2 2 0 0 1 2.31-.5l2.22.98A2 2 0 0 1 20.9 15l-.4 1.8A3.95 3.95 0 0 1 16.65 20C9.66 20 4 14.34 4 7.35A3.95 3.95 0 0 1 7.2 3.5Z" />
                  </svg>
                </span>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="+63 912 345 6789"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField('')}
                />
              </div>
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>

            <div className={`form-group ${errors.password ? 'has-error' : ''} ${focusedField === 'password' ? 'is-focused' : ''}`}>
              <label htmlFor="password">Password</label>
              <div className="input-shell">
                <span className="input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M7 10V8a5 5 0 0 1 10 0v2h.5A2.5 2.5 0 0 1 20 12.5v5A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-5A2.5 2.5 0 0 1 6.5 10H7Zm1.8 0h6.4V8a3.2 3.2 0 0 0-6.4 0v2Zm-2.3 1.8a.7.7 0 0 0-.7.7v5c0 .39.31.7.7.7h11c.39 0 .7-.31.7-.7v-5a.7.7 0 0 0-.7-.7h-11Z" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className={`password-strength strength-${passwordScore}`}>
                <div className="password-strength-track">
                  <span style={{ width: `${(passwordScore / 5) * 100}%` }} />
                </div>
                <span>{strengthLabel}</span>
              </div>
              <div className="password-checks" aria-label="Password requirements">
                {passwordChecks.map((check) => (
                  <span key={check.label} className={check.met ? 'is-met' : ''}>
                    {check.label}
                  </span>
                ))}
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className={`form-group ${errors.confirmPassword ? 'has-error' : ''} ${focusedField === 'confirmPassword' ? 'is-focused' : ''}`}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-shell">
                <span className="input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="m10.6 14.9 6.65-6.65 1.27 1.27-7.92 7.92-4.12-4.12 1.27-1.27 2.85 2.85Z" />
                  </svg>
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField('')}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>

            {globalError && <div className="error-message">{globalError}</div>}

            <button type="submit" className="auth-button register-button" disabled={loading}>
              {loading ? (
                <span className="button-content"><span className="button-spinner" />Creating Account...</span>
              ) : (
                <span className="button-content">Create Account</span>
              )}
            </button>
          </form>

          <Link to="/login" className="auth-button signin-link">
            Already have an account? Sign in
          </Link>
        </div>
      </div>

      {showAlert && (
        <Alert
          message={alertMessage}
          type={alertType}
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
}
