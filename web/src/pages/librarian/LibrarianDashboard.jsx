import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LibrarianDashboard.css';

export default function LibrarianDashboard() {
  const [user, setUser]       = useState(null);
  const [stats, setStats]     = useState({ totalBooks: 0, borrowed: 0, returned: 0, pendingRequests: 0 });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) { navigate('/login'); return; }
    if (userData.role !== 'LIBRARIAN') { navigate('/dashboard'); return; }
    setUser(userData);
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, reqRes] = await Promise.all([
        axios.get('/api/v1/librarian/stats'),
        axios.get('/api/v1/borrow/pending'),
      ]);
      setStats(statsRes.data?.data || statsRes.data || {});
      setRequests(reqRes.data?.data || reqRes.data || []);
    } catch (e) {
      console.error('Error fetching librarian data:', e);
      setStats({ totalBooks: 0, borrowed: 0, returned: 0, pendingRequests: 0 });
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`/api/v1/borrow/${id}/approve`);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`/api/v1/borrow/${id}/reject`);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div className="ld-loading"><div className="ld-spinner" /><p>Loading...</p></div>;

  return (
    <div className="ld-wrapper">
      {/* NAV */}
      <nav className="ld-nav">
        <div className="ld-nav-brand">
          <div className="ld-logo-circle">
            <svg viewBox="0 0 24 24" fill="white"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>
          </div>
          <span className="ld-brand-name">BookBrow</span>
          <span className="ld-role-badge">Librarian</span>
        </div>
        <div className="ld-nav-links">
          <a className="ld-nav-link ld-nav-active" onClick={() => navigate('/librarian/dashboard')}>Dashboard</a>
          <a className="ld-nav-link" onClick={() => navigate('/librarian/manage-books')}>Manage Books</a>
          <a className="ld-nav-link" onClick={() => navigate('/librarian/borrow-requests')}>Borrow Requests</a>
        </div>
        <div className="ld-nav-right">
          <span className="ld-username">{user?.fullName || 'Librarian'}</span>
          <button className="ld-logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* MAIN */}
      <main className="ld-main">
        <h1 className="ld-page-title">Dashboard</h1>
        <p className="ld-page-sub">Welcome back, {user?.fullName || 'Librarian'}!</p>

        {/* Stats */}
        <div className="ld-stats-grid">
          {[
            { label: 'Total Books',       value: stats.totalBooks      ?? 0, color: '#7a0027' },
            { label: 'Currently Borrowed', value: stats.borrowed        ?? 0, color: '#c8703a' },
            { label: 'Returned',           value: stats.returned        ?? 0, color: '#2e7d32' },
            { label: 'Pending Requests',  value: stats.pendingRequests ?? 0, color: '#1565c0' },
          ].map(s => (
            <div key={s.label} className="ld-stat-card">
              <span className="ld-stat-num" style={{ color: s.color }}>{s.value}</span>
              <span className="ld-stat-lbl">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Pending Requests */}
        <div className="ld-section">
          <h2 className="ld-section-title">Pending Borrow Requests</h2>
          {requests.length === 0 ? (
            <div className="ld-empty">No pending requests</div>
          ) : (
            <div className="ld-table-wrap">
              <table className="ld-table">
                <thead>
                  <tr>
                    <th>User</th><th>Book</th><th>Requested</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r.id}>
                      <td>{r.userEmail || r.user?.email || '—'}</td>
                      <td>{r.bookTitle || r.book?.title || '—'}</td>
                      <td>{r.borrowDate ? new Date(r.borrowDate).toLocaleDateString() : '—'}</td>
                      <td className="ld-actions">
                        <button className="ld-approve-btn" onClick={() => handleApprove(r.id)}>Approve</button>
                        <button className="ld-reject-btn"  onClick={() => handleReject(r.id)}>Reject</button>
                      </td>
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
