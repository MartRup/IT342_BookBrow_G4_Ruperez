import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LibrarianNavbar from './LibrarianNavbar';
import './BorrowingRecords.css';

export default function BorrowingRecords() {
  const [user, setUser] = useState({});
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, overdue: 0, returned: 0, pending: 0 });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All Records');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // Track which record is being processed
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }
  const [suspendModal, setSuspendModal] = useState(null); // { userId, userName }
  const [suspendDays, setSuspendDays] = useState(7);
  const [suspendReason, setSuspendReason] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) { navigate('/login'); return; }
    if (userData.role !== 'LIBRARIAN') { navigate('/dashboard'); return; }
    setUser(userData);
    fetchRecords();
  }, [navigate]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/v1/borrow/all', {
        headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user'))?.token}` }
      });
      const data = res.data?.data?.borrowRecords ?? res.data?.borrowRecords ?? [];
      setRecords(Array.isArray(data) ? data : []);

      let active = 0, overdue = 0, returned = 0, pending = 0;
      data.forEach(r => {
        if (r.status === 'RETURNED') returned++;
        else if (r.status === 'OVERDUE') overdue++;
        else if (r.status === 'PENDING') pending++;
        else if (r.status === 'ACTIVE') active++;
      });
      setStats({ total: data.length, active, overdue, returned, pending });
    } catch (e) {
      console.error('Error fetching borrowing records:', e);
      setRecords([]);
      setStats({ total: 0, active: 0, overdue: 0, returned: 0, pending: 0 });
    } finally { setLoading(false); }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleApprove = async (id) => {
    try {
      setActionLoading(id);
      await axios.put(`/api/v1/borrow/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user'))?.token}` }
      });
      showToast('success', 'Borrow request approved successfully!');
      fetchRecords();
    } catch (e) {
      console.error('Error approving request:', e);
      showToast('error', e.response?.data?.error?.message || 'Failed to approve request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoading(id);
      await axios.put(`/api/v1/borrow/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user'))?.token}` }
      });
      showToast('success', 'Borrow request rejected');
      fetchRecords();
    } catch (e) {
      console.error('Error rejecting request:', e);
      showToast('error', e.response?.data?.error?.message || 'Failed to reject request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkReturned = async (id) => {
    try {
      setActionLoading(id);
      await axios.put(`/api/v1/borrow/${id}/return`, {}, {
        headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user'))?.token}` }
      });
      showToast('success', 'Book marked as returned');
      fetchRecords();
    } catch (e) {
      console.error('Error marking returned:', e);
      showToast('error', e.response?.data?.error?.message || 'Failed to mark as returned');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspendUser = async () => {
    if (!suspendModal) return;
    
    try {
      setActionLoading('suspend');
      await axios.put(`/api/v1/librarian/users/${suspendModal.userId}/suspend-borrowing`, {
        days: suspendDays,
        reason: suspendReason || 'Suspended by librarian'
      }, {
        headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user'))?.token}` }
      });
      showToast('success', `User ${suspendModal.userName} suspended for ${suspendDays} days`);
      setSuspendModal(null);
      setSuspendDays(7);
      setSuspendReason('');
      fetchRecords();
    } catch (e) {
      console.error('Error suspending user:', e);
      showToast('error', e.response?.data?.error?.message || 'Failed to suspend user');
    } finally {
      setActionLoading(null);
    }
  };

  const getFilteredRecords = () => {
    return records.filter(r => {
      // Apply search string
      const q = search.toLowerCase();
      const matchSearch = (r.userEmail || '').toLowerCase().includes(q) || 
                          (r.userFullName || '').toLowerCase().includes(q) || 
                          (r.bookTitle || '').toLowerCase().includes(q);
                          
      if (!matchSearch) return false;
      
      // Apply pill filter
      if (filter === 'Pending') return r.status === 'PENDING';
      if (filter === 'Active') return r.status === 'ACTIVE';
      if (filter === 'Overdue') return r.status === 'OVERDUE';
      if (filter === 'Returned') return r.status === 'RETURNED';
      return true; // All Records
    });
  };

  const filtered = getFilteredRecords();

  if (loading) return <div className="br-loading"><div className="br-spinner" /><p>Loading records...</p></div>;

  return (
    <div className="br-page">
      {/* ── Toast Notification ── */}
      {toast && (
        <div className={`br-toast br-toast-${toast.type}`}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          {toast.message}
        </div>
      )}

      {/* ── Suspend User Modal ── */}
      {suspendModal && (
        <div className="br-modal-overlay" onClick={() => setSuspendModal(null)}>
          <div className="br-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Suspend User from Borrowing</h3>
            <p className="br-modal-user">User: <strong>{suspendModal.userName}</strong></p>
            
            <div className="br-modal-field">
              <label>Suspension Duration (days)</label>
              <input 
                type="number" 
                min="1" 
                max="365" 
                value={suspendDays} 
                onChange={(e) => setSuspendDays(parseInt(e.target.value) || 1)}
              />
            </div>
            
            <div className="br-modal-field">
              <label>Reason (optional)</label>
              <textarea 
                rows="3" 
                placeholder="Enter reason for suspension..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
              />
            </div>
            
            <div className="br-modal-actions">
              <button 
                className="br-modal-cancel" 
                onClick={() => setSuspendModal(null)}
                disabled={actionLoading === 'suspend'}
              >
                Cancel
              </button>
              <button 
                className="br-modal-confirm" 
                onClick={handleSuspendUser}
                disabled={actionLoading === 'suspend'}
              >
                {actionLoading === 'suspend' ? 'Suspending...' : `Suspend for ${suspendDays} days`}
              </button>
            </div>
          </div>
        </div>
      )}

      <LibrarianNavbar />

      <main className="br-content">
        <div className="br-header">
          <h1 className="br-title">Borrowing Records</h1>
          <p className="br-sub">Track all book borrowing and return activities</p>
        </div>

        <div className="br-stats-container">
          <div className="br-stat-card">
            <div className="br-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <div className="br-stat-info">
              <div className="br-stat-label">Total Records</div>
              <div className="br-stat-value">{stats.total}</div>
            </div>
          </div>
          <div className="br-stat-card">
            <div className="br-icon-box">
              <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            </div>
            <div className="br-stat-info">
              <div className="br-stat-label">Pending Approval</div>
              <div className="br-stat-value">{stats.pending}</div>
            </div>
          </div>
          <div className="br-stat-card">
            <div className="br-icon-box">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 19h16v2H4v-2zm16-4H4v2h16v-2zm-8-4H4v2h8v-2zm8-6H5C3.9 5 3 5.9 3 7v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z"/></svg>
            </div>
            <div className="br-stat-info">
              <div className="br-stat-label">Active Borrower</div>
              <div className="br-stat-value">{stats.active}</div>
            </div>
          </div>
          <div className="br-stat-card">
            <div className="br-icon-box">
              <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4.25 2.5"/></svg>
            </div>
            <div className="br-stat-info">
              <div className="br-stat-label">Overdue</div>
              <div className="br-stat-value">{stats.overdue}</div>
            </div>
          </div>
          <div className="br-stat-card">
            <div className="br-icon-box">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </div>
            <div className="br-stat-info">
              <div className="br-stat-label">Returned</div>
              <div className="br-stat-value">{stats.returned}</div>
            </div>
          </div>
        </div>

        <div className="br-search-filter-wrap">
          <div className="br-search-section">
            <div className="br-search-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input 
                type="text" 
                placeholder="Search by member name, book title, or email..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
          </div>
          <div className="br-filters">
            {['All Records', 'Pending', 'Active', 'Overdue', 'Returned'].map(f => (
              <button 
                key={f}
                className={`br-filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
                {f === 'Pending' && stats.pending > 0 && (
                  <span className="br-badge">{stats.pending}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="br-table-container">
          <table className="br-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Book</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Days</th>
                <th className="br-center-text">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="br-empty">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10 9 9 9 8 9"/>
                      </svg>
                      <h3>No borrowing records found</h3>
                      <p>There are currently no borrowing records matching your search criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((r, i) => (
                <tr key={r.id || i}>
                  <td>
                    <div className="br-member-cell">
                      <span>{r.userFullName || r.userEmail || '—'}</span>
                      {(r.status === 'OVERDUE' || r.status === 'ACTIVE') && (
                        <button 
                          className="br-suspend-btn-small"
                          onClick={() => setSuspendModal({ 
                            userId: r.userId, 
                            userName: r.userFullName || r.userEmail 
                          })}
                          title="Suspend user from borrowing"
                        >
                          🚫
                        </button>
                      )}
                    </div>
                  </td>
                  <td>{r.bookTitle || '—'}</td>
                  <td>{r.borrowDate ? new Date(r.borrowDate).toLocaleDateString() : '—'}</td>
                  <td>{r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '—'}</td>
                  <td>
                    <span className={`br-status-badge br-status-${(r.status || 'active').toLowerCase()}`}>
                      {r.status || 'Active'}
                    </span>
                  </td>
                  <td>{r.daysLeft || 0}</td>
                  <td className="br-actions-cell">
                    {r.status === 'PENDING' ? (
                      <div className="br-action-group">
                        <button 
                          className="br-approve-btn" 
                          onClick={() => handleApprove(r.id)}
                          disabled={actionLoading === r.id}
                        >
                          {actionLoading === r.id ? '...' : 'Approve'}
                        </button>
                        <button 
                          className="br-reject-btn" 
                          onClick={() => handleReject(r.id)}
                          disabled={actionLoading === r.id}
                        >
                          {actionLoading === r.id ? '...' : 'Reject'}
                        </button>
                      </div>
                    ) : r.status === 'ACTIVE' || r.status === 'OVERDUE' ? (
                      <button 
                        className="br-return-btn" 
                        onClick={() => handleMarkReturned(r.id)}
                        disabled={actionLoading === r.id}
                      >
                        {actionLoading === r.id ? 'Processing...' : 'Mark Returned'}
                      </button>
                    ) : (
                      <span className="br-no-action">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
