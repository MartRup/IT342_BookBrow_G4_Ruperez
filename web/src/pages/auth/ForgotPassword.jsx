import './ForgotPassword.css';

import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import Alert from '../../components/Alert';
import ApiService from '../../services/ApiService';
import { rateLimit, sanitizeInput, validateEmail, validatePassword } from '../../utils/validation';

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const initialToken = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [step, setStep] = useState(initialToken ? 'reset' : 'request');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const navigate = useNavigate();

  const passwordChecks = [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Uppercase', met: /[A-Z]/.test(password) },
    { label: 'Lowercase', met: /[a-z]/.test(password) },
    { label: 'Number', met: /\d/.test(password) },
    { label: 'Symbol', met: /[^A-Za-z0-9]/.test(password) },
  ];
  const passwordScore = passwordChecks.filter((check) => check.met).length;
  const strengthLabel = ['Empty', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][passwordScore];

  const handleRequestReset = async (event) => {
    event.preventDefault();
    setError('');

    const sanitizedEmail = validateEmail(email);
    if (!sanitizedEmail) {
      setError('Please enter a valid email address');
      return;
    }

    if (!rateLimit.isAllowed(`forgot:${sanitizedEmail}`, 3, 15 * 60 * 1000)) {
      setError('Too many reset attempts. Please try again in 15 minutes.');
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.auth.forgotPassword(sanitizedEmail);
      const token = response.data?.data?.resetToken;
      const message = response.data?.data?.message || 'Password reset request sent.';

      setAlertMessage(message);
      setShowAlert(true);

      if (token) {
        setResetToken(token);
        setStep('reset');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Unable to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError('');

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors.join(' '));
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!resetToken) {
      setError('Reset token is missing. Please request another password reset.');
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.auth.resetPassword(resetToken, password);
      const message = response.data?.data?.message || 'Password reset successful. You can now sign in.';
      setAlertMessage(message);
      setShowAlert(true);

      setTimeout(() => {
        navigate('/login', { state: { message } });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-ambient auth-ambient-one" />
      <div className="auth-ambient auth-ambient-two" />

      <div className="auth-shell forgot-shell">
        <aside className="auth-story-panel forgot-story-panel" aria-label="Password reset">
          <div className="shelf-preview">
            <div className="book-spine spine-red" />
            <div className="book-spine spine-gold" />
            <div className="book-spine spine-blue" />
            <div className="book-spine spine-green" />
            <div className="book-spine spine-plum" />
          </div>
          <p className="auth-kicker">Account Recovery</p>
          <h2>Return to your shelf with a fresh password.</h2>
          <div className="auth-story-stats" aria-label="Reset steps">
            <span><strong>1</strong> Verify your email</span>
            <span><strong>2</strong> Set a new password</span>
            <span><strong>30m</strong> Token expiry</span>
          </div>
        </aside>

        <div className="auth-card login-card">
          <div className="auth-brand-header">
            <div className="auth-logo-circle">
              <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3ZM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82Z" />
              </svg>
            </div>
            <span className="auth-brand-name">BookBrow</span>
          </div>

          <h1>{step === 'request' ? 'Forgot Password' : 'Create New Password'}</h1>
          <p className="auth-subtitle">
            {step === 'request'
              ? 'Enter your account email to generate a reset token.'
              : 'Choose a strong password for your account.'}
          </p>

          {step === 'request' ? (
            <form onSubmit={handleRequestReset} className="auth-form" noValidate>
              <div className={`form-group ${focusedField === 'email' ? 'is-focused' : ''}`}>
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
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(event) => setEmail(sanitizeInput(event.target.value))}
                    autoComplete="email"
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField('')}
                    required
                  />
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="auth-button signin-button" disabled={loading}>
                {loading ? (
                  <span className="button-content"><span className="button-spinner" />Sending...</span>
                ) : (
                  <span className="button-content">Continue</span>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="auth-form" noValidate>
              <input type="hidden" value={resetToken} readOnly />

              <div className={`form-group ${focusedField === 'password' ? 'is-focused' : ''}`}>
                <label htmlFor="password">New Password</label>
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
                    value={password}
                    onChange={(event) => setPassword(sanitizeInput(event.target.value))}
                    autoComplete="new-password"
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField('')}
                    required
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
              </div>

              <div className={`form-group ${focusedField === 'confirmPassword' ? 'is-focused' : ''}`}>
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
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(sanitizeInput(event.target.value))}
                    autoComplete="new-password"
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField('')}
                    required
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
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="auth-button signin-button" disabled={loading}>
                {loading ? (
                  <span className="button-content"><span className="button-spinner" />Resetting...</span>
                ) : (
                  <span className="button-content">Reset Password</span>
                )}
              </button>
            </form>
          )}

          <Link to="/login" className="auth-button register-link">
            Back to Sign In
          </Link>
        </div>
      </div>

      {showAlert && (
        <Alert
          message={alertMessage}
          type="success"
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
}
