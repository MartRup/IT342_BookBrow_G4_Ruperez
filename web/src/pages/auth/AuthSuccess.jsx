import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Decodes the payload of a JWT (base64url → JSON).
 * Does NOT verify the signature — that's the backend's job.
 */
function decodeJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export default function AuthSuccess() {
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => {
    console.log('[AuthSuccess] Component mounted, checking URL:', window.location.href);
    
    const params = new URLSearchParams(location.search);
    const token  = params.get('token');
    
    console.log('[AuthSuccess] Token from URL:', token);
    console.log('[AuthSuccess] All URL params:', Object.fromEntries(params.entries()));

    if (!token) {
      console.error('[AuthSuccess] No token in redirect URL');
      navigate('/login?error=true', { replace: true });
      return;
    }

    // Decode JWT payload to get user info (email, role, sub, etc.)
    const payload = decodeJwtPayload(token);
    if (!payload) {
      console.error('[AuthSuccess] Failed to decode JWT payload');
      navigate('/login?error=true', { replace: true });
      return;
    }

    console.log('✅ Google OAuth2 success — JWT payload:', payload);

    // Build a user object matching what the normal login flow stores
    const userData = {
      email:    payload.sub,          // 'sub' = email (set in JwtService)
      role:     payload.role || 'USER',
      fullName: payload.fullName || payload.name || '',
      token,
    };

    // Persist to localStorage (same keys used by the rest of the app)
    localStorage.setItem('token', token);
    localStorage.setItem('user',  JSON.stringify(userData));

    // /home → RoleRedirect in App.js → /dashboard for USER role
    navigate('/home', { replace: true });

  }, [navigate, location]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
      gap: '12px',
    }}>
      <div style={{
        width: '40px', height: '40px',
        border: '4px solid #4f46e5',
        borderTop: '4px solid transparent',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <h2 style={{ color: '#374151', fontFamily: 'Inter, sans-serif' }}>
        Logging you in… please wait
      </h2>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
