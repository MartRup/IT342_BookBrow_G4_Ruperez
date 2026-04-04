import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AdminNavbar.css';

export default function AdminNavbar() {
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
    <nav className="adm-navbar">
      <div className="adm-nav-brand">
        <div className="adm-logo-circle">
          <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
          </svg>
        </div>
        <div className="adm-brand-text">
          <span className="adm-brand-name">BookBrow</span>
          <span className="adm-role-badge">Admin</span>
        </div>
      </div>
      
      <div className="adm-nav-links">
        <button 
          className={`adm-nav-link ${currentPath.includes('/dashboard') ? 'active' : ''}`} 
          onClick={() => navigate('/admin/dashboard')}
        >Dashboard</button>
        <button 
          className={`adm-nav-link ${currentPath.includes('/manage-books') ? 'active' : ''}`} 
          onClick={() => navigate('/admin/manage-books')}
        >Books</button>
        <button 
          className={`adm-nav-link ${currentPath.includes('/manage-users') ? 'active' : ''}`} 
          onClick={() => navigate('/admin/manage-users')}
        >User</button>
        <button 
          className={`adm-nav-link ${currentPath.includes('/borrowing-records') ? 'active' : ''}`} 
          onClick={() => navigate('/admin/borrowing-records')}
        >Borrowing Records</button>
      </div>

      <div className="adm-nav-right">
        <div className="adm-user-info" onClick={() => navigate('/admin/settings')} style={{ cursor: 'pointer' }} title="Settings">
          <div className="adm-user-icon">
            <svg viewBox="0 0 24 24" fill="#800000" width="36" height="36">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div className="adm-user-text">
            <span className="adm-username">{user.fullName || 'Admin'}</span>
            <span className="adm-email">{user.email || 'adm@example.com'}</span>
          </div>
        </div>
        <button className="adm-logout-btn" onClick={handleLogout}>
          Logout
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
        </button>
      </div>
    </nav>
  );
}
