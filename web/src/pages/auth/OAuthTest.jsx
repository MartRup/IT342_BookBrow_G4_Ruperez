import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function OAuthTest() {
  const [configStatus, setConfigStatus] = useState('loading');
  const [oauthStatus, setOauthStatus] = useState(null);

  useEffect(() => {
    // Test if backend is running
    fetch('http://localhost:8080/api/v1/oauth/config-check')
      .then(response => response.json())
      .then(data => {
        console.log('Config check result:', data);
        setConfigStatus('success');
      })
      .catch(error => {
        console.error('Config check failed:', error);
        setConfigStatus('error');
      });

    // Test OAuth status (will fail if not authenticated)
    fetch('http://localhost:8080/api/v1/oauth/test', {
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        console.log('OAuth status:', data);
        setOauthStatus(data);
      })
      .catch(error => {
        console.log('OAuth status (expected to fail):', error);
        setOauthStatus({ error: 'Not authenticated (expected)' });
      });
  }, []);

  const handleOAuthLogin = () => {
    console.log('Initiating OAuth login...');
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>OAuth2 Debugging Tool</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>Backend Configuration Status</h2>
        <div style={{
          padding: '10px',
          backgroundColor: configStatus === 'success' ? '#d4edda' : configStatus === 'error' ? '#f8d7da' : '#fff3cd',
          border: `1px solid ${configStatus === 'success' ? '#c3e6cb' : configStatus === 'error' ? '#f5c6cb' : '#ffeaa7'}`,
          borderRadius: '4px'
        }}>
          Status: {configStatus}
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>OAuth Authentication Status</h2>
        <pre style={{
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '4px',
          overflow: 'auto',
          maxHeight: '200px'
        }}>
          {JSON.stringify(oauthStatus, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Test OAuth Login</h2>
        <button 
          onClick={handleOAuthLogin}
          style={{
            backgroundColor: '#4285f4',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Test Google OAuth Login
        </button>
        <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          This will redirect you to Google for authentication
        </p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Manual OAuth URLs</h2>
        <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '4px' }}>
          <p><strong>Authorization URL:</strong></p>
          <code style={{ wordBreak: 'break-all' }}>
            http://localhost:8080/oauth2/authorization/google
          </code>
          <p style={{ marginTop: '10px' }}><strong>Redirect URI:</strong></p>
          <code style={{ wordBreak: 'break-all' }}>
            http://localhost:8080/login/oauth2/code/google
          </code>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Environment Variables Check</h2>
        <p>Check if these are set in your backend .env file:</p>
        <ul>
          <li>GOOGLE_CLIENT_ID</li>
          <li>GOOGLE_CLIENT_SECRET</li>
          <li>GOOGLE_REDIRECT_URI</li>
        </ul>
        <p>Current values (from backend):</p>
        <ul>
          <li>Client ID: 479851263262-srhurugk43nu8ljq8q9j3d4hrad6ql2m.apps.googleusercontent.com</li>
          <li>Redirect URI: http://localhost:8080/login/oauth2/code/google</li>
        </ul>
      </div>

      <div>
        <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>
          &larr; Back to Login
        </Link>
      </div>
    </div>
  );
}
