import './Register.css';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { validateEmail, validatePassword, validateName, validatePhone, sanitizeInput, rateLimit } from '../../utils/validation';
import axios from 'axios';
import Alert from '../../components/Alert';

/**
 * Register – Borrower (USER/MEMBER) self-registration.
 *
 * Role rules enforced here:
 *  - The role field is NOT shown to the user.
 *  - The backend always assigns MEMBER upon /api/v1/auth/register.
 *  - Librarian creation is an ADMIN-only action done from the admin dashboard.
 */
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
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: sanitizeInput(value) }));
    // Clear field-level error on edit
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

    // Phone is optional; if provided it must be valid
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');

    // Rate limiting – max 3 attempts per 15 minutes
    const clientIdentifier = formData.email || 'anonymous';
    if (!rateLimit.isAllowed(clientIdentifier, 3, 15 * 60 * 1000)) {
      setGlobalError('Too many registration attempts. Please try again in 15 minutes.');
      return;
    }

    // Field-level validation
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
        // NOTE: role is intentionally NOT sent – backend always assigns MEMBER
      });

      if (!response.data.success) {
        setGlobalError(response.data.error?.message || 'Error creating account');
      } else {
        rateLimit.reset(clientIdentifier);

        const msg =
          response.data.data?.message || 'Account created successfully! Please sign in.';
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
      <div className="auth-card register-card">
        <div className="auth-brand-header">
          <div className="auth-logo-circle">
            <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
            </svg>
          </div>
          <span className="auth-brand-name">BookBrow</span>
        </div>

        <h1>Join BookBrow!</h1>
        <p className="auth-subtitle">Create your account and start borrowing books</p>

        {/* Role info badge – informs user their role is fixed */}
        <div className="role-info-badge">
          <span>📚</span> You will be registered as a <strong>Borrower</strong>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Full Name */}
          <div className={`form-group ${errors.fullName ? 'has-error' : ''}`}>
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
              autoComplete="name"
            />
            {errors.fullName && <span className="field-error">{errors.fullName}</span>}
          </div>

          {/* Email */}
          <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          {/* Phone (optional) */}
          <div className={`form-group ${errors.phone ? 'has-error' : ''}`}>
            <label htmlFor="phone">
              Phone Number <span className="optional-label">(optional)</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="+63 912 345 6789"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
            />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>

          {/* Password */}
          <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className={`form-group ${errors.confirmPassword ? 'has-error' : ''}`}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <span className="field-error">{errors.confirmPassword}</span>
            )}
          </div>

          {globalError && <div className="error-message">{globalError}</div>}

          <button
            type="submit"
            className="auth-button register-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
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
