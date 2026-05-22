import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './LibrarianNavbar.css';

export default function LibrarianNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const confirmLogout = () => {
    handleLogout();
    setShowLogoutConfirm(false);
  };

  const currentPath = location.pathname;

  return (
    <>
      <nav className="lib-navbar">
        <div className="lib-nav-brand">
          <div className="lib-logo-circle">
            <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
            </svg>
          </div>
          <div className="lib-brand-text">
            <span className="lib-brand-name">BookBrow</span>
            <span className="lib-role-badge">Librarian</span>
          </div>
        </div>
        
        <div className="lib-nav-links">
          <button 
            className={`lib-nav-link ${currentPath.includes('/dashboard') ? 'active' : ''}`} 
            onClick={() => navigate('/librarian/dashboard')}
          >Dashboard</button>
          <button 
            className={`lib-nav-link ${currentPath.includes('/manage-books') ? 'active' : ''}`} 
            onClick={() => navigate('/librarian/manage-books')}
          >Books</button>
          <button 
            className={`lib-nav-link ${currentPath.includes('/borrowing-records') ? 'active' : ''}`} 
            onClick={() => navigate('/librarian/borrowing-records')}
          >Borrowing Records</button>
          <button 
            className={`lib-nav-link ${currentPath.includes('/users') ? 'active' : ''}`} 
            onClick={() => navigate('/librarian/users')}
          >Users</button>
        </div>

        <div className="lib-nav-right">
          <button className="lib-theme-toggle" onClick={() => {
            const currentTheme = document.body.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.body.setAttribute('data-theme', newTheme);
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            console.log('Theme changed to:', newTheme);
          }} title="Toggle Dark Mode">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          </button>
          <div className="lib-user-info" onClick={() => navigate('/librarian/settings')} style={{ cursor: 'pointer' }} title="Settings">
            <div className="lib-user-icon">
              <svg viewBox="0 0 24 24" fill="#800000" width="36" height="36">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div className="lib-user-text">
              <span className="lib-username">{user.fullName || 'Librarian'}</span>
              <span className="lib-email">{user.email || 'libi@example.com'}</span>
            </div>
          </div>
          <button className="lib-logout-btn" onClick={() => setShowLogoutConfirm(true)}>
            Logout
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
          </button>
        </div>
      </nav>
      
      {/* Logout Confirmation Popup */}
      {showLogoutConfirm && (
        <div className="lib-logout-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="lib-logout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lib-logout-icon">
              <svg viewBox="0 0 24 24" fill="#dc3545" width="48" height="48">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout? You will need to login again to access your account.</p>
            <div className="lib-logout-actions">
              <button 
                className="lib-logout-cancel-btn" 
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="lib-logout-confirm-btn" 
                onClick={confirmLogout}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
