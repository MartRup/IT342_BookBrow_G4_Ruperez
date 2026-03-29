import './Login.css';

import { useState, useEffect } from 'react';

import { useNavigate, Link, useLocation } from 'react-router-dom';

import { validateEmail, sanitizeInput, rateLimit } from '../../utils/validation';

import axios from 'axios';

import Alert from '../../components/Alert';



export default function Login() {

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  const [showAlert, setShowAlert] = useState(false);

  const [alertMessage, setAlertMessage] = useState('');

  const [alertType, setAlertType] = useState('success');

  const navigate = useNavigate();

  const location = useLocation();



  useEffect(() => {

    // Check if there's a message from registration

    if (location.state?.message) {

      setAlertMessage(location.state.message);

      setAlertType('success');

      setShowAlert(true);

      // Clear the location state to prevent showing the message again

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



    // Rate limiting check

    const clientIdentifier = email || 'anonymous';

    if (!rateLimit.isAllowed(clientIdentifier)) {

      setError('Too many login attempts. Please try again later.');

      setLoading(false);

      return;

    }



    // Input validation and sanitization

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

      const response = await axios.post('/api/v1/auth/login', {

        email: sanitizedEmail,

        password: sanitizedPassword,

      });



      if (!response.data.success) {

        setError(response.data.error?.message || 'Invalid email or password');

      } else {

        // Reset rate limit on successful login

        rateLimit.reset(clientIdentifier);

        

        // Store user data + token in localStorage

        const userData = response.data.data;

        localStorage.setItem('user', JSON.stringify(userData));

        if (userData.token) {

          localStorage.setItem('token', userData.token);

        }

        

        // Show success alert before navigating

        setAlertMessage('Successful login');

        setAlertType('success');

        setShowAlert(true);

        

        // Navigate to dashboard after a short delay

        setTimeout(() => {

          navigate('/home');

        }, 1500);

      }

    } catch (err) {

      setError('Error logging in. Please try again.');

      // Log error without exposing details in production

      console.error('Login error:', err instanceof Error ? err.message : 'Unknown error');

    } finally {

      setLoading(false);

    }

  };



  return (

    <div className="auth-container">

      <div className="auth-card login-card">

        <div className="auth-brand-header">
          <div className="auth-logo-circle">
            <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
            </svg>
          </div>
          <span className="auth-brand-name">BookBrow</span>
        </div>



        <h1>Welcome Back</h1>

        <p className="auth-subtitle">Sign in to access BookBrow</p>



        <form onSubmit={handleSubmit} className="auth-form">

          <div className="form-group">

            <label htmlFor="email">Email Address</label>

            <input

              type="email"

              id="email"

              name="email"

              placeholder="your.email@example.com"

              value={email}

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

              value={password}

              onChange={handleChange}

              required

              autoComplete="current-password"

            />

          </div>



          {error && <div className="error-message">{error}</div>}



          <button

            type="submit"

            className="auth-button signin-button"

            disabled={loading}

          >

            {loading ? 'Signing In...' : 'Sign In'}

          </button>

        </form>



        <div className="auth-separator">
          <span>OR</span>
        </div>

        <a href="http://localhost:8080/oauth2/authorization/google" className="auth-button google-button">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span style={{ marginLeft: '10px', lineHeight: '24px', position: 'relative', top: '1px' }}>Login with Google</span>
          </div>
        </a>

        <Link to="/register" className="auth-button register-link">
          Create New Account
        </Link>

        <Link to="/forgot-password" className="forgot-password-link">
          Forgot your password?
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

