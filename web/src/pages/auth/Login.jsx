import './Login.css';

import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import Alert from '../../components/Alert';
import ApiService from '../../services/ApiService';
import { rateLimit, sanitizeInput, validateEmail } from '../../utils/validation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setAlertMessage(location.state.message);
      setAlertType('success');
      setShowAlert(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);

    if (name === 'email') {
      setEmail(sanitizedValue);
    } else if (name === 'password') {
      setPassword(sanitizedValue);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const clientIdentifier = email || 'anonymous';
    if (!rateLimit.isAllowed(clientIdentifier)) {
      setError('Too many login attempts. Please try again later.');
      setLoading(false);
      return;
    }

    const sanitizedEmail = validateEmail(email);
    const sanitizedPassword = sanitizeInput(password);

    if (!sanitizedEmail) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!sanitizedPassword || sanitizedPassword.length < 1) {
      setError('Please enter your password');
      setLoading(false);
      return;
    }

    try {
      const response = await ApiService.auth.login(sanitizedEmail, sanitizedPassword);

      if (!response.data.success) {
        setError(response.data.error?.message || 'Invalid email or password');
      } else {
        rateLimit.reset(clientIdentifier);

        const userData = response.data.data;
        localStorage.setItem('user', JSON.stringify(userData));
        if (userData.token) {
          localStorage.setItem('token', userData.token);
        }

        setAlertMessage('Successful login');
        setAlertType('success');
        setShowAlert(true);

        setTimeout(() => {
          navigate('/home');
        }, 1500);
      }
    } catch (err) {
      setError('Error logging in. Please try again.');
      console.error('Login error:', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-ambient auth-ambient-one" />
      <div className="auth-ambient auth-ambient-two" />

      <div className="auth-shell">
        <aside className="auth-story-panel" aria-label="BookBrow welcome">
          <div className="shelf-preview">
            <div className="book-spine spine-red" />
            <div className="book-spine spine-gold" />
            <div className="book-spine spine-blue" />
            <div className="book-spine spine-green" />
            <div className="book-spine spine-plum" />
          </div>
          <p className="auth-kicker">Digital Library Access</p>
          <h2>Pick up where your reading journey paused.</h2>
          <div className="auth-story-stats" aria-label="Library highlights">
            <span><strong>24/7</strong> catalog access</span>
            <span><strong>Fast</strong> borrowing flow</span>
            <span><strong>Secure</strong> account entry</span>
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

          <h1>Welcome Back</h1>
          <p className="auth-subtitle">Sign in to access BookBrow</p>

          <form onSubmit={handleSubmit} className="auth-form">
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
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                />
              </div>
            </div>

            <div className={`form-group ${focusedField === 'password' ? 'is-focused' : ''}`}>
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
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
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="auth-button signin-button" disabled={loading}>
              {loading ? (
                <span className="button-content"><span className="button-spinner" />Signing In...</span>
              ) : (
                <span className="button-content">Sign In <span aria-hidden="true">-&gt;</span></span>
              )}
            </button>
          </form>

          <div className="auth-separator">
            <span>OR</span>
          </div>

          <a href="http://localhost:8080/oauth2/authorization/google" className="auth-button google-button">
            <div className="google-button-content">
              <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Login with Google</span>
            </div>
          </a>

          <Link to="/register" className="auth-button register-link">
            Create New Account
          </Link>

          <Link to="/forgot-password" className="forgot-password-link">
            Forgot your password?
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
