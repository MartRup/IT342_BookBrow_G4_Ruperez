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

        <div className="auth-icon">

          <svg

            xmlns="http://www.w3.org/2000/svg"

            viewBox="0 0 24 24"

            fill="currentColor"

          >

            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />

          </svg>

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



        <a 

          href="http://localhost:8080/oauth2/authorization/google" 

          className="auth-button google-button"

        >

          <img src="/img/google.png" alt="Google logo" className="google-icon" />

          Login with Google

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

