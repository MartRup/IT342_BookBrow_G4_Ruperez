import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [user, setUser]   = useState(null);
  const [stats, setStats] = useState({ totalUsers: 0, totalBooks: 0, totalBorrowed: 0, totalLibrarians: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) { navigate('/login'); return; }
    if (userData.role !== 'ADMIN') { navigate('/dashboard'); return; }
    setUser(userData);
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        axios.get('/api/v1/admin/stats'),
        axios.get('/api/v1/users?limit=5'),
      ]);
      setStats(statsRes.data?.data || statsRes.data || {});
      setRecentUsers(usersRes.data?.data?.users || usersRes.data?.users || []);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  const handleLogout = () => { localStorage.removeItem('user'); localStorage.removeItem('token'); navigate('/login'); };

  if (loading) return <div className="ad-loading"><div className="ad-spinner" /><p>Loading...</p></div>;

  return (
    <div className="ad-wrapper">
      <nav className="ad-nav">
        <div className="ad-nav-brand">
          <div className="ad-logo-circle"><svg viewBox="0 0 24 24" fill="white"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg></div>
          <span className="ad-brand-name">BookBrow</span>
          <span className="ad-role-badge">Admin</span>
        </div>
        <div className="ad-nav-links">
          <a className="ad-nav-link ad-nav-active" onClick={() => navigate('/admin/dashboard')}>Dashboard</a>
          <a className="ad-nav-link" onClick={() => navigate('/admin/manage-users')}>Manage Users</a>
        </div>
        <div className="ad-nav-right">
          <span className="ad-username">{user?.fullName || 'Admin'}</span>
          <button className="ad-logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <main className="ad-main">
        <h1 className="ad-title">Admin Dashboard</h1>
        <p className="ad-sub">System overview and management</p>

        <div className="ad-stats-grid">
          {[
            { label: 'Total Users',      value: stats.totalUsers      ?? 0, icon: '👤', color: '#7a0027' },
            { label: 'Total Books',      value: stats.totalBooks      ?? 0, icon: '📚', color: '#c8703a' },
            { label: 'Total Borrowed',   value: stats.totalBorrowed   ?? 0, icon: '📖', color: '#1565c0' },
            { label: 'Total Librarians', value: stats.totalLibrarians ?? 0, icon: '🏛️', color: '#2e7d32' },
          ].map(s => (
            <div key={s.label} className="ad-stat-card">
              <span className="ad-stat-icon">{s.icon}</span>
              <span className="ad-stat-num" style={{ color: s.color }}>{s.value}</span>
              <span className="ad-stat-lbl">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="ad-section">
          <div className="ad-section-header">
            <h2 className="ad-section-title">Recent Users</h2>
            <button className="ad-view-all" onClick={() => navigate('/admin/manage-users')}>View All</button>
          </div>
          {recentUsers.length === 0 ? (
            <div className="ad-empty">No users found</div>
          ) : (
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
                <tbody>
                  {recentUsers.map(u => (
                    <tr key={u.id}>
                      <td>{u.fullName || '—'}</td>
                      <td>{u.email}</td>
                      <td><span className={`ad-role-pill ${u.role?.toLowerCase()}`}>{u.role}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
