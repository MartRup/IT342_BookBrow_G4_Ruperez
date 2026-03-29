import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminNavbar from './AdminNavbar';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [user, setUser] = useState({});
  const [stats, setStats] = useState({ totalUsers: 0, totalBooks: 0, activeLoans: 0, overDue: 0 });
  const [logs, setLogs] = useState([]);
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
      const [statsRes, logsRes] = await Promise.all([
        axios.get('/api/v1/admin/stats'),
        axios.get('/api/v1/admin/logs') // Hypothetical endpoint for logs
      ]);
      const data = statsRes.data?.data || statsRes.data || {};
      setStats({
        totalUsers: data.totalUsers || 0,
        totalBooks: data.totalBooks || 0,
        activeLoans: data.activeLoans || data.totalBorrowed || 0,
        overDue: data.overDue || 0
      });
      setLogs(logsRes.data?.data || logsRes.data || []);
    } catch (e) {
      console.error('Error fetching admin data:', e);
      // Fallback
      setStats({ totalUsers: 0, totalBooks: 0, activeLoans: 0, overDue: 0 });
      setLogs([]); 
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="ad-loading"><div className="ad-spinner" /><p>Loading dashboard...</p></div>;

  return (
    <div className="ad-page">
      <AdminNavbar />

      <main className="ad-content">
        <h1 className="ad-welcome-title">System Dashboard</h1>
        <p className="ad-welcome-sub">Welcome back, {user.fullName || 'Admin'}. Here's your system overview.</p>

        <div className="ad-stats-container">
          <div className="ad-stat-card">
            <div className="ad-stat-value">{stats.totalUsers}</div>
            <div className="ad-stat-label">Total Users</div>
          </div>
          <div className="ad-stat-card">
            <div className="ad-stat-value">{stats.totalBooks}</div>
            <div className="ad-stat-label">Total Books</div>
          </div>
          <div className="ad-stat-card">
            <div className="ad-stat-value">{stats.activeLoans}</div>
            <div className="ad-stat-label">Active Loans</div>
          </div>
          <div className="ad-stat-card">
            <div className="ad-stat-value">{stats.overDue}</div>
            <div className="ad-stat-label">OverDue</div>
          </div>
        </div>

        <div className="ad-recent-logs">
          <h2 className="ad-logs-title">Recent System Logs</h2>
          
          <div className="ad-logs-list">
            {logs.length === 0 ? (
              <div className="ad-no-logs">No recent system logs available.</div>
            ) : (
              logs.map((log, index) => (
                <div key={log.id || index} className="ad-log-item">
                  <div className="ad-log-message">{log.message || 'System action performed'}</div>
                  <div className="ad-log-time">{log.timeAgo || 'Just now'}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
