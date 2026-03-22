import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const dataStr = params.get('data');

    if (dataStr) {
      try {
        // URLSearchParams already decodes, so parse directly
        let userData;
        try {
          userData = JSON.parse(dataStr);
        } catch {
          // If URLSearchParams didn't decode fully, try manual decode
          userData = JSON.parse(decodeURIComponent(dataStr));
        }

        console.log('✅ OAuth2 user data received:', userData);

        localStorage.setItem('user', JSON.stringify(userData));
        if (userData.token) {
          localStorage.setItem('token', userData.token);
        }
        
        // Navigate to /home which triggers RoleRedirect in App.js
        navigate('/home', { replace: true });
      } catch (e) {
        console.error('Failed to parse user data from OAuth2 redirect', e);
        navigate('/login?error=true', { replace: true });
      }
    } else {
      console.error('No data parameter found in OAuth2 redirect');
      navigate('/login?error=true', { replace: true });
    }
  }, [navigate, location]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <h2>Logging you in... Please wait.</h2>
    </div>
  );
}

