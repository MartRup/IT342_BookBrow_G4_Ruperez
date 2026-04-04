import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './UserNavbar.css';

export default function UserNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const currentPath = location.pathname;

  return (
    <nav className="usr-navbar">
      <div className="usr-nav-brand">
        <div className="usr-logo-circle">
          <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
          </svg>
        </div>
        <div className="usr-brand-text">
          <span className="usr-brand-name">BookBrow</span>
          <span className="usr-role-badge">Member</span>
        </div>
      </div>
      
      <div className="usr-nav-links">
        <button 
          className={`usr-nav-link ${currentPath === '/dashboard' || currentPath === '/home' ? 'active' : ''}`} 
          onClick={() => navigate('/dashboard')}
        >Home</button>
        <button 
          className={`usr-nav-link ${currentPath.includes('/borrow-items') ? 'active' : ''}`} 
          onClick={() => navigate('/borrow-items')}
        >Borrow Items</button>
        <button 
          className={`usr-nav-link ${currentPath.includes('/my-books') ? 'active' : ''}`} 
          onClick={() => navigate('/my-books')}
        >My Books</button>
      </div>

      <div className="usr-nav-right">
        <div className="usr-user-info">
          <div className="usr-user-icon">
            <svg viewBox="0 0 24 24" fill="#800000" width="36" height="36">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div className="usr-user-text">
            <span className="usr-username">{user?.fullName || user?.name || 'Member'}</span>
            <span className="usr-email">{user?.email || 'user@example.com'}</span>
          </div>
        </div>
        <button className="usr-logout-btn" onClick={handleLogout}>
          Logout
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
        </button>
      </div>
    </nav>
  );
}
