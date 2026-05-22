import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LibrarianNavbar from './LibrarianNavbar';
import './LibrarianUsers.css';

const PRESET_DAYS = [1, 3, 7, 14, 30];

export default function LibrarianUsers() {
  const [users, setUsers]               = useState([]);
  const [search, setSearch]             = useState('');
  const [loading, setLoading]           = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast]               = useState(null);

  // Suspend modal state
  const [suspendModal, setSuspendModal] = useState(null); // { userId, userName }
  const [suspendDays, setSuspendDays]   = useState(7);
  const [suspendReason, setSuspendReason] = useState('');

  // Detail drawer state
  const [detailUser, setDetailUser]     = useState(null);
  const [detailBorrows, setDetailBorrows] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const navigate = useNavigate();

  const authHeader = () => ({
    Authorization: `Bearer ${JSON.parse(localStorage.getItem('user'))?.token}`
  });

  /* ── Auth guard ── */
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) { navigate('/login'); return; }
    if (userData.role !== 'LIBRARIAN' && userData.role !== 'ADMIN') {
      navigate('/dashboard'); return;
    }
    fetchUsers();
  }, [navigate]);

  /* ── Fetch users ── */
  const fetchUsers = useCallback(async (q = '') => {
    try {
      setLoading(true);
      const res = await axios.get('/api/v1/librarian/users', {
        params: { limit: 100, search: q || undefined },
        headers: authHeader()
      });
      const data = res.data?.data?.users ?? res.data?.users ?? [];
      setUsers(data);
    } catch (e) {
      console.error('Error fetching users:', e);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Search debounce ── */
  useEffect(() => {
    const t = setTimeout(() => fetchUsers(search), 350);
    return () => clearTimeout(t);
  }, [search, fetchUsers]);

  /* ── Toast helper ── */
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Open detail drawer ── */
  const openDetail = async (user) => {
    setDetailUser(user);
    setDetailBorrows([]);
    setDetailLoading(true);
    try {
      const res = await axios.get('/api/v1/borrow/all', {
        params: { limit: 50 },
        headers: authHeader()
      });
      const all = res.data?.data?.borrowRecords ?? res.data?.borrowRecords ?? [];
      setDetailBorrows(all.filter(r => r.userId === user.id));
    } catch {
      setDetailBorrows([]);
    } finally {
      setDetailLoading(false);
    }
  };

  /* ── Suspend ── */
  const openSuspendModal = (user, e) => {
    e.stopPropagation();
    setSuspendModal({ userId: user.id, userName: user.fullName || user.email });
    setSuspendDays(7);
    setSuspendReason('');
  };

  const handleSuspend = async () => {
    if (!suspendModal) return;
    try {
      setActionLoading('suspend');
      await axios.put(
        `/api/v1/librarian/users/${suspendModal.userId}/suspend-borrowing`,
        { days: suspendDays, reason: suspendReason || 'Suspended by librarian' },
        { headers: authHeader() }
      );
      showToast('success', `${suspendModal.userName} suspended for ${suspendDays} day(s)`);
      setSuspendModal(null);
      fetchUsers(search);
      // Refresh detail drawer if open for same user
      if (detailUser?.id === suspendModal.userId) {
        const res = await axios.get(`/api/v1/librarian/users/${suspendModal.userId}`, { headers: authHeader() });
        setDetailUser(res.data?.data?.user ?? detailUser);
      }
    } catch (e) {
      showToast('error', e.response?.data?.error?.message || 'Failed to suspend user');
    } finally {
      setActionLoading(null);
    }
  };

  /* ── Unsuspend ── */
  const handleUnsuspend = async (userId, userName, e) => {
    e.stopPropagation();
    try {
      setActionLoading(`unsuspend-${userId}`);
      await axios.put(
        `/api/v1/librarian/users/${userId}/unsuspend-borrowing`,
        {},
        { headers: authHeader() }
      );
      showToast('success', `${userName}'s suspension lifted`);
      fetchUsers(search);
      if (detailUser?.id === userId) {
        setDetailUser(prev => ({ ...prev, isBorrowSuspended: false, borrowSuspendedUntil: null, suspensionReason: null }));
      }
    } catch (e) {
      showToast('error', e.response?.data?.error?.message || 'Failed to lift suspension');
    } finally {
      setActionLoading(null);
    }
  };

  /* ── Format countdown ── */
  const formatCountdown = (isoDate) => {
    if (!isoDate) return '';
    const diff = Math.max(0, Math.floor((new Date(isoDate) - Date.now()) / 1000));
    const d = Math.floor(diff / 86400);
    const h = Math.floor((diff % 86400) / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
    return parts.join(' ');
  };

  const filteredUsers = users.filter(u =>
    (u.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="lu-loading">
      <div className="lu-spinner" />
      <p>Loading users...</p>
    </div>
  );

  return (
    <div className="lu-page">
      {/* ── Toast ── */}
      {toast && (
        <div className={`lu-toast lu-toast-${toast.type}`}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          {toast.message}
        </div>
      )}

      {/* ── Suspend Modal ── */}
      {suspendModal && (
        <div className="lu-overlay" onClick={() => setSuspendModal(null)}>
          <div className="lu-modal" onClick={e => e.stopPropagation()}>
            <div className="lu-modal-header">
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <h3>Suspend Borrowing</h3>
            </div>
            <p className="lu-modal-sub">User: <strong>{suspendModal.userName}</strong></p>

            <label className="lu-modal-label">Duration</label>
            <div className="lu-preset-days">
              {PRESET_DAYS.map(d => (
                <button
                  key={d}
                  className={`lu-preset-btn ${suspendDays === d ? 'active' : ''}`}
                  onClick={() => setSuspendDays(d)}
                >
                  {d}d
                </button>
              ))}
              <input
                type="number"
                className="lu-days-input"
                min="1"
                max="365"
                value={suspendDays}
                onChange={e => setSuspendDays(Math.max(1, parseInt(e.target.value) || 1))}
                title="Custom days"
              />
            </div>

            <label className="lu-modal-label">Reason <span className="lu-optional">(optional)</span></label>
            <textarea
              className="lu-modal-textarea"
              rows="3"
              placeholder="e.g. Overdue books not returned, repeated violations..."
              value={suspendReason}
              onChange={e => setSuspendReason(e.target.value)}
            />

            <div className="lu-modal-footer">
              <button
                className="lu-btn-cancel"
                onClick={() => setSuspendModal(null)}
                disabled={actionLoading === 'suspend'}
              >
                Cancel
              </button>
              <button
                className="lu-btn-suspend"
                onClick={handleSuspend}
                disabled={actionLoading === 'suspend'}
              >
                {actionLoading === 'suspend'
                  ? 'Suspending...'
                  : `Suspend for ${suspendDays} day${suspendDays !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <LibrarianNavbar />

      <main className="lu-content">
        <div className="lu-header">
          <div>
            <h1 className="lu-title">User Management</h1>
            <p className="lu-sub">View borrowing status and manage user suspensions</p>
          </div>
        </div>

        {/* Search */}
        <div className="lu-search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="lu-table-wrap">
          <table className="lu-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Account</th>
                <th>Borrow Status</th>
                <th>Suspension</th>
                <th className="lu-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="lu-empty">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      <p>No users found</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.map(u => (
                <tr
                  key={u.id}
                  className={`lu-row ${u.isBorrowSuspended ? 'lu-row-suspended' : ''}`}
                  onClick={() => openDetail(u)}
                  title="Click to view borrow history"
                >
                  <td>
                    <div className="lu-user-cell">
                      <div className="lu-avatar">
                        {(u.fullName || u.email || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="lu-user-name">{u.fullName || '—'}</div>
                        <div className="lu-user-email">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`lu-role-badge lu-role-${(u.role || 'user').toLowerCase()}`}>
                      {u.role || 'USER'}
                    </span>
                  </td>
                  <td>
                    <span className={`lu-status-dot ${u.isActive ? 'active' : 'inactive'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {u.isBorrowSuspended ? (
                      <span className="lu-borrow-suspended">🚫 Suspended</span>
                    ) : (
                      <span className="lu-borrow-ok">✅ Allowed</span>
                    )}
                  </td>
                  <td>
                    {u.isBorrowSuspended && u.borrowSuspendedUntil ? (
                      <div className="lu-countdown">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
                          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
                        </svg>
                        {formatCountdown(u.borrowSuspendedUntil)} left
                      </div>
                    ) : (
                      <span className="lu-no-suspension">—</span>
                    )}
                  </td>
                  <td className="lu-center" onClick={e => e.stopPropagation()}>
                    {u.role === 'USER' && (
                      u.isBorrowSuspended ? (
                        <button
                          className="lu-btn-unsuspend"
                          onClick={e => handleUnsuspend(u.id, u.fullName || u.email, e)}
                          disabled={actionLoading === `unsuspend-${u.id}`}
                        >
                          {actionLoading === `unsuspend-${u.id}` ? '...' : 'Lift Suspension'}
                        </button>
                      ) : (
                        <button
                          className="lu-btn-suspend-sm"
                          onClick={e => openSuspendModal(u, e)}
                        >
                          Suspend
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* ── Detail Drawer ── */}
      {detailUser && (
        <div className="lu-drawer-overlay" onClick={() => setDetailUser(null)}>
          <div className="lu-drawer" onClick={e => e.stopPropagation()}>
            <button className="lu-drawer-close" onClick={() => setDetailUser(null)}>✕</button>

            <div className="lu-drawer-header">
              <div className="lu-drawer-avatar">
                {(detailUser.fullName || detailUser.email || '?')[0].toUpperCase()}
              </div>
              <div>
                <h2>{detailUser.fullName || '—'}</h2>
                <p>{detailUser.email}</p>
              </div>
            </div>

            {detailUser.isBorrowSuspended && (
              <div className="lu-drawer-suspended-banner">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <div>
                  <strong>Borrowing Suspended</strong>
                  {detailUser.borrowSuspendedUntil && (
                    <span> — {formatCountdown(detailUser.borrowSuspendedUntil)} remaining</span>
                  )}
                  {detailUser.suspensionReason && (
                    <p className="lu-drawer-reason">Reason: {detailUser.suspensionReason}</p>
                  )}
                </div>
              </div>
            )}

            <div className="lu-drawer-actions">
              {detailUser.role === 'USER' && (
                detailUser.isBorrowSuspended ? (
                  <button
                    className="lu-btn-unsuspend"
                    onClick={e => handleUnsuspend(detailUser.id, detailUser.fullName || detailUser.email, e)}
                    disabled={actionLoading === `unsuspend-${detailUser.id}`}
                  >
                    {actionLoading === `unsuspend-${detailUser.id}` ? 'Lifting...' : 'Lift Suspension'}
                  </button>
                ) : (
                  <button
                    className="lu-btn-suspend-sm"
                    onClick={e => openSuspendModal(detailUser, e)}
                  >
                    Suspend from Borrowing
                  </button>
                )
              )}
            </div>

            <h3 className="lu-drawer-section-title">Borrow History</h3>

            {detailLoading ? (
              <div className="lu-drawer-loading"><div className="lu-spinner-sm" /></div>
            ) : detailBorrows.length === 0 ? (
              <p className="lu-drawer-empty">No borrow records found for this user.</p>
            ) : (
              <div className="lu-borrow-list">
                {detailBorrows.map(r => (
                  <div key={r.id} className="lu-borrow-item">
                    <div className="lu-borrow-book">{r.bookTitle || '—'}</div>
                    <div className="lu-borrow-meta">
                      <span>{r.borrowDate ? new Date(r.borrowDate).toLocaleDateString() : '—'}</span>
                      {r.dueDate && <span> · Due {new Date(r.dueDate).toLocaleDateString()}</span>}
                    </div>
                    <span className={`lu-borrow-status lu-bs-${(r.status || 'unknown').toLowerCase()}`}>
                      {r.status || '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
