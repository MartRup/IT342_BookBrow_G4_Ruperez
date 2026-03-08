import './Register.css';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { validateEmail, validatePassword, validateName, validateRole, sanitizeInput, rateLimit } from './utils/validation';
import axios from 'axios';
import Alert from './components/Alert';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);
    
    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Rate limiting check
    const clientIdentifier = formData.email || 'anonymous';
    if (!rateLimit.isAllowed(clientIdentifier, 3, 15 * 60 * 1000)) {
      setError('Too many registration attempts. Please try again later.');
      return;
    }

    // Input validation and sanitization
    const sanitizedEmail = validateEmail(formData.email);
    const sanitizedName = validateName(formData.fullName);
    const sanitizedRole = validateRole(formData.role);
    
    if (!sanitizedEmail) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (!sanitizedName) {
      setError('Please enter a valid name (letters, spaces, hyphens, and apostrophes only)');
      return;
    }

    // Password validation
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors.join(' '));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/v1/auth/register', {
        fullName: sanitizedName,
        email: sanitizedEmail,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (!response.data.success) {
        setError(response.data.error?.message || 'Error creating account');
      } else {
        // Reset rate limit on successful registration
        rateLimit.reset(clientIdentifier);
        
        // Show success alert before navigating
        setAlertMessage('Account created successfully! Please sign in.');
        setAlertType('success');
        setShowAlert(true);
        
        // Navigate to login after a short delay
        setTimeout(() => {
          navigate('/login', { state: { message: 'Account created successfully! Please sign in.' } });
        }, 2000);
      }
    } catch (err) {
      setError('Error creating account. Please try again.');
      console.error('Registration error:', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
          </svg>
        </div>

        <h1>Join BookBrow!</h1>
        <p className="auth-subtitle">
          Create your account and start borrowing books
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="role">Select a role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="USER">Borrower</option>
              <option value="LIBRARIAN">Librarian</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              placeholder="Enter your Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email address (john@example.com)"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm you password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="auth-button register-button"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <Link to="/login" className="auth-button signin-link">
          Already have an account? Sign in
        </Link>
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
