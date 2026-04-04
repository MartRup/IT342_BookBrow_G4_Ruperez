import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LibrarianNavbar from './LibrarianNavbar';
import './LibrarianDashboard.css';

export default function LibrarianDashboard() {
  const [user, setUser] = useState({});
  const [stats, setStats] = useState({ borrowed: 0, dueSoon: 0, returned: 0 });
  const [activities, setActivities] = useState([]);
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
        axios.get('/api/v1/borrow/pending') // Reusing pending as 'activities'
      ]);
      const data = statsRes.data?.data || statsRes.data || {};
      setStats({
        borrowed: data.borrowed || 0,
        dueSoon: data.dueSoon || 0, // Fallback if not available
        returned: data.returned || 0
      });
      setActivities(reqRes.data?.data || reqRes.data || []);
    } catch (e) {
      console.error('Error fetching librarian data:', e);
      // Fallback UI empty state
      setStats({ borrowed: 0, dueSoon: 0, returned: 0 });
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="ld-loading"><div className="ld-spinner" /><p>Loading...</p></div>;

  return (
    <div className="ld-page">
      <LibrarianNavbar />

      <main className="ld-content">
        <h1 className="ld-welcome-title">Welcome, {user.fullName || 'Librarian'}</h1>
        <p className="ld-welcome-sub">Here's what's happening with your library today.</p>

        <div className="ld-stats-container">
          <div className="ld-stat-card">
            <div className="ld-stat-value">{stats.borrowed}</div>
            <div className="ld-stat-label">Books Borrowed</div>
          </div>
          <div className="ld-stat-card">
            <div className="ld-stat-value">{stats.dueSoon}</div>
            <div className="ld-stat-label">Due Soon</div>
          </div>
          <div className="ld-stat-card">
            <div className="ld-stat-value">{stats.returned}</div>
            <div className="ld-stat-label">Returned</div>
          </div>
        </div>

        <div className="ld-recent-activity">
          <h2 className="ld-activity-title">Recent Activity</h2>
          
          <div className="ld-activity-list">
            {activities.length === 0 ? (
              <div className="ld-no-activity">No recent activities found.</div>
            ) : (
              activities.map((act) => {
                // Determine mock status style based on actual data
                const isOverdue = false; // Could check dates if they exist on act object
                
                return (
                  <div key={act.id} className="ld-activity-item">
                    <div className="ld-act-left">
                      <div className={`ld-act-icon ${isOverdue ? 'overdue' : 'active'}`}>
                        <svg viewBox="0 0 24 24" fill={isOverdue ? "red" : "#2e70ff"} width="20" height="20">
                          <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM10 9h8v2h-8zm0 3h4v2h-4zm0-6h8v2h-8z"/>
                        </svg>
                      </div>
                      <div className="ld-act-details">
                        <div className="ld-act-book">{act.bookTitle || act.book?.title || 'Unknown Book'}</div>
                        <div className="ld-act-user">{act.userFullName || act.userEmail || act.user?.email || 'Unknown User'}</div>
                      </div>
                    </div>
                    <div className={`ld-act-status ${isOverdue ? 'status-overdue' : 'status-active'}`}>
                      {isOverdue ? 'Overdue' : 'Pending/Active'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
