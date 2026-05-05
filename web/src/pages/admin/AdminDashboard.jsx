import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminNavbar from './AdminNavbar';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [user, setUser] = useState({});
  const [stats, setStats] = useState({ totalUsers: 0, totalBooks: 0, activeLoans: 0, overDue: 0 });
  const [previousStats, setPreviousStats] = useState({ totalUsers: 0, totalBooks: 0, activeLoans: 0, overDue: 0 });
  const [changedStats, setChangedStats] = useState(new Set());
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) { navigate('/login'); return; }
    if (userData.role !== 'ADMIN') { navigate('/dashboard'); return; }
    setUser(userData);
    fetchData();

    // Listen for custom refresh events from other pages
    const handleRefreshEvent = () => {
      console.log('Dashboard refresh triggered by data change');
      fetchData(true);
    };

    window.addEventListener('dashboardRefresh', handleRefreshEvent);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('dashboardRefresh', handleRefreshEvent);
    };
  }, [navigate]);

  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);

      // Store previous stats for comparison
      setPreviousStats(prev => ({ ...stats }));

      // Fetch stats and logs separately to avoid one failing the other
      try {
        const statsRes = await axios.get('/api/v1/admin/stats');
        const statsData = statsRes.data?.data || statsRes.data || {};
        const newStats = {
          totalUsers: statsData.totalUsers || 0,
          totalBooks: statsData.totalBooks || 0,
          activeLoans: statsData.activeLoans || 0,
          overDue: statsData.overDue || 0
        };

        // Detect which stats changed
        const changed = new Set();
        Object.keys(newStats).forEach(key => {
          if (newStats[key] !== stats[key]) {
            changed.add(key);
          }
        });

        setStats(newStats);
        setChangedStats(changed);
      } catch (statsError) {
        console.error('Error fetching stats:', statsError);
        if (!silent) {
          setStats({ totalUsers: 0, totalBooks: 0, activeLoans: 0, overDue: 0 });
        }
      }

      // Fetch logs separately - don't let it fail the stats
      try {
        const logsRes = await axios.get('/api/v1/admin/logs');
        const logsData = logsRes.data?.data || logsRes.data || [];
        setLogs(logsData);
      } catch (logsError) {
        console.error('Error fetching logs:', logsError);
        setLogs([]);
      }

      setLastUpdated(new Date());

      // Clear change indicators after 2 seconds
      setTimeout(() => {
        setChangedStats(new Set());
      }, 2000);

    } catch (e) {
      console.error('Error fetching admin data:', e);
      if (!silent) {
        // Only show fallback on initial load
        setStats({ totalUsers: 0, totalBooks: 0, activeLoans: 0, overDue: 0 });
        setLogs([]);
      }
    } finally {
      if (!silent) setLoading(false);
      else setIsRefreshing(false);
    }
  }, [stats]);

  // Manual refresh function
  const handleManualRefresh = () => {
    fetchData(false);
  };

  if (loading) return <div className="ad-loading"><div className="ad-spinner" /><p>Loading dashboard...</p></div>;

  return (
    <div className="ad-page">
      <AdminNavbar />

      <main className="ad-content">
        <div className="ad-header">
          <div>
            <h1 className="ad-welcome-title">System Dashboard</h1>
            <p className="ad-welcome-sub">Welcome back, {user.fullName || 'Admin'}. Here's your system overview.</p>
          </div>
          <button 
            className="ad-refresh-btn" 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            title="Refresh data"
          >
            <svg className={isRefreshing ? 'spinning' : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="ad-stats-container">
          <div className={`ad-stat-card ${changedStats.has('totalUsers') ? 'stat-changed' : ''}`}>
            <div className="ad-stat-value">{stats.totalUsers}</div>
            <div className="ad-stat-label">Total Users</div>
            {changedStats.has('totalUsers') && <div className="stat-change-indicator">Updated</div>}
          </div>
          <div className={`ad-stat-card ${changedStats.has('totalBooks') ? 'stat-changed' : ''}`}>
            <div className="ad-stat-value">{stats.totalBooks}</div>
            <div className="ad-stat-label">Total Books</div>
            {changedStats.has('totalBooks') && <div className="stat-change-indicator">Updated</div>}
          </div>
          <div className={`ad-stat-card ${changedStats.has('activeLoans') ? 'stat-changed' : ''}`}>
            <div className="ad-stat-value">{stats.activeLoans}</div>
            <div className="ad-stat-label">Active Loans</div>
            {changedStats.has('activeLoans') && <div className="stat-change-indicator">Updated</div>}
          </div>
          <div className={`ad-stat-card ${changedStats.has('overDue') ? 'stat-changed' : ''}`}>
            <div className="ad-stat-value">{stats.overDue}</div>
            <div className="ad-stat-label">OverDue</div>
            {changedStats.has('overDue') && <div className="stat-change-indicator">Updated</div>}
          </div>
        </div>

        {lastUpdated && (
          <div className="ad-last-updated">
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            <span className="ad-auto-refresh-note">Updates when data changes</span>
          </div>
        )}

        <div className="ad-recent-logs">
          <h2 className="ad-logs-title">Recent System Logs</h2>
          
          <div className="ad-logs-list">
            {logs.length === 0 ? (
              <div className="ad-no-logs">No recent system logs available.</div>
            ) : (
              logs.map((log, index) => (
                <div key={log.id || index} className="ad-log-item">
                  <div className="ad-log-message">
                    <strong>{log.performedBy || 'System'}</strong> - {log.description || 'System action performed'}
                  </div>
                  <div className="ad-log-time">{log.timeAgo || log.createdAt || 'Just now'}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
