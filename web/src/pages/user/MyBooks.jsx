import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/ApiService';
import UserNavbar from './UserNavbar';
import './MyBooks.css';

export default function MyBooks() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('current'); // 'current' | 'history'
  const [currentBorrows, setCurrentBorrows] = useState([]);
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [stats, setStats] = useState({ currentlyBorrowing: 0, totalBorrowed: 0, readingDays: 0 });
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) { navigate('/login'); return; }
    setUser(userData);
    fetchMyBooks();
  }, [navigate]);

  const fetchMyBooks = async () => {
    try {
      setLoading(true);
      // Fetch all user borrow records from the correct endpoint
      const res = await ApiService.borrow.getUserBorrows();
      const allRecords = res.data?.data?.borrowRecords ?? res.data?.borrowRecords ?? [];

      const current = allRecords.filter(r => r.status !== 'RETURNED');
      const history = allRecords.filter(r => r.status === 'RETURNED');

      setCurrentBorrows(current);
      setBorrowHistory(history);
      setStats({
        currentlyBorrowing: current.length,
        totalBorrowed: allRecords.length,
        readingDays: 0,
      });
    } catch (error) {
      console.error('Error fetching my books:', error);
      setCurrentBorrows([]);
      setBorrowHistory([]);
      setStats({ currentlyBorrowing: 0, totalBorrowed: 0, readingDays: 0 });
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleReturn = async (borrowId, bookTitle) => {
    try {
      setReturningId(borrowId);
      await ApiService.borrow.returnBook(borrowId);
      showToast('success', `"${bookTitle}" returned successfully!`);
      fetchMyBooks();
    } catch (error) {
      const msg = error.response?.data?.error?.message || error.response?.data?.message || 'Failed to return book.';
      showToast('error', msg);
    } finally {
      setReturningId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const displayList = activeTab === 'current' ? currentBorrows : borrowHistory;

  if (loading) {
    return (
      <div className="mb-loading-screen">
        <div className="mb-spinner"></div>
        <p>Loading your books...</p>
      </div>
    );
  }

  return (
    <div className="mb-wrapper">
      {/* ── Toast ── */}
      {toast && (
        <div className={`mb-toast mb-toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* ── NAVBAR ── */}
      <UserNavbar />

      {/* ── MAIN ── */}
      <main className="mb-main">
        <h1 className="mb-page-title">My Books</h1>

        {/* Tabs */}
        <div className="mb-tabs">
          <button
            className={`mb-tab ${activeTab === 'current' ? 'mb-tab-active' : ''}`}
            onClick={() => setActiveTab('current')}
          >
            Currently Borrowing
          </button>
          <button
            className={`mb-tab ${activeTab === 'history' ? 'mb-tab-active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Borrow History
          </button>
        </div>

        {/* Book List */}
        <div className="mb-book-list">
          {displayList.length === 0 ? (
            <div className="mb-empty-state">
              <svg viewBox="0 0 24 24" fill="#ccc" width="64" height="64">
                <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h2v8l2.5-1.5L13 12V4h5v16z"/>
              </svg>
              <p>{activeTab === 'current' ? 'No books currently borrowed' : 'No borrow history yet'}</p>
              {activeTab === 'current' && (
                <button className="mb-browse-btn" onClick={() => navigate('/borrow-items')}>
                  Browse Library
                </button>
              )}
            </div>
          ) : (
              displayList.map((record) => (
                <div key={record.id} className="mb-book-row">
                  {/* Cover thumbnail */}
                  <div className="mb-book-thumb">
                    {record.bookCoverUrl ? (
                      <img src={record.bookCoverUrl} alt={record.bookTitle || 'Book'} />
                    ) : (
                      <div className="mb-thumb-placeholder"></div>
                    )}
                  </div>

                  {/* Book details */}
                  <div className="mb-book-details">
                    <h3 className="mb-book-title">{record.bookTitle || '—'}</h3>
                    <p className="mb-book-author">{record.bookAuthor || ''}</p>
                    {record.borrowDate && (
                      <p className="mb-borrow-date">
                        Borrowed: {new Date(record.borrowDate).toLocaleDateString()}
                      </p>
                    )}
                    {record.dueDate && record.status !== 'RETURNED' && (
                      <p className={`mb-due-date ${record.status === 'OVERDUE' ? 'overdue' : ''}`}>
                        Due: {new Date(record.dueDate).toLocaleDateString()}
                        {record.status === 'OVERDUE' && ' ⚠️ Overdue'}
                      </p>
                    )}
                    {record.returnDate && (
                      <p className="mb-return-date">
                        Returned: {new Date(record.returnDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                {/* Actions */}
                {activeTab === 'current' && (
                  <div className="mb-book-actions">
                    <button
                      className="mb-return-btn"
                      onClick={() => handleReturn(record.id, record.bookTitle)}
                      disabled={returningId === record.id}
                    >
                      {returningId === record.id ? 'Returning...' : 'Return'}
                    </button>
                    <span className={`mb-status-pill ${(record.status || 'active').toLowerCase()}`}>
                      {record.status === 'OVERDUE' ? '⚠️ Overdue' : record.status === 'ACTIVE' ? 'Borrowing' : record.status}
                    </span>
                  </div>
                )}
                {activeTab === 'history' && (
                  <span className="mb-status-pill returned">Returned</span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Stats bar (visible on both tabs) */}
        <div className="mb-stats-bar">
          <div className="mb-stat-box">
            <span className="mb-stat-num">{stats.currentlyBorrowing}</span>
            <span className="mb-stat-lbl">Currently Borrowing</span>
          </div>
          <div className="mb-stat-box">
            <span className="mb-stat-num">{stats.totalBorrowed}</span>
            <span className="mb-stat-lbl">Total Borrowed</span>
          </div>
          <div className="mb-stat-box">
            <span className="mb-stat-num">{stats.readingDays}</span>
            <span className="mb-stat-lbl">Reading Days</span>
          </div>
        </div>
      </main>
    </div>
  );
}
