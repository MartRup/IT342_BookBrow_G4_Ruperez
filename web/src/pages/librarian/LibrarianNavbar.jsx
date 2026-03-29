import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './LibrarianNavbar.css';

export default function LibrarianNavbar() {
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
      </div>

      <div className="lib-nav-right">
        <div className="lib-user-info">
          <div className="lib-user-icon">
            <svg viewBox="0 0 24 24" fill="#800000" width="36" height="36">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div className="lib-user-text">
            <span className="lib-username">librarian</span>
            <span className="lib-email">{user.email || 'libi@example.com'}</span>
          </div>
        </div>
        <button className="lib-logout-btn" onClick={handleLogout}>
          <span style={{ fontWeight: 600, color: '#800000' }}>Logout</span>
          <div className="lib-logout-icon">
            <svg viewBox="0 0 24 24" fill="white" width="18" height="18">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5z"/>
            </svg>
          </div>
        </button>
      </div>
    </nav>
  );
}
