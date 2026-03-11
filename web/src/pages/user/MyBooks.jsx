import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MyBooks.css';

export default function MyBooks() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('current'); // 'current' | 'history'
  const [currentBorrows, setCurrentBorrows] = useState([]);
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [stats, setStats] = useState({ currentlyBorrowing: 0, totalBorrowed: 0, readingDays: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) { navigate('/login'); return; }
    setUser(userData);
    fetchMyBooks(userData);
  }, [navigate]);

  const fetchMyBooks = async (userData) => {
    try {
      setLoading(true);
      const [currentRes, historyRes, statsRes] = await Promise.all([
        axios.get(`http://localhost:8080/api/borrow/current?email=${userData.email}`),
        axios.get(`http://localhost:8080/api/borrow/history?email=${userData.email}`),
        axios.get(`http://localhost:8080/api/dashboard/stats/by-email?email=${userData.email}`),
      ]);
      setCurrentBorrows(currentRes.data);
      setBorrowHistory(historyRes.data);
      setStats({
        currentlyBorrowing: statsRes.data.booksBorrowed || 0,
        totalBorrowed: statsRes.data.totalBorrowed || (currentRes.data.length + historyRes.data.length),
        readingDays: statsRes.data.readingDays || 0,
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

  const handleReturn = async (borrowId) => {
    try {
      await axios.put(`http://localhost:8080/api/borrow/${borrowId}/return`);
      fetchMyBooks(user);
    } catch (error) {
      console.error('Error returning book:', error);
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
      {/* ── NAVBAR ── */}
      <nav className="mb-nav">
        <div className="mb-nav-brand">
          <div className="mb-logo-circle">
            <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
            </svg>
          </div>
          <span className="mb-brand-name">BookBrow</span>
        </div>

        <div className="mb-nav-links">
          <a href="#" className="mb-nav-link" onClick={() => navigate('/dashboard')}>Home</a>
          <a href="#" className="mb-nav-link" onClick={() => navigate('/borrow-items')}>Borrow Items</a>
          <a href="#" className="mb-nav-link mb-nav-active" onClick={() => navigate('/my-books')}>My Books</a>
        </div>

        <div className="mb-nav-right">
          <div className="mb-user-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
          <div className="mb-user-info">
            <span className="mb-user-name">{user?.fullName || user?.name || 'user'}</span>
            <span className="mb-user-email">{user?.email || 'user@example.com'}</span>
          </div>
          <button className="mb-logout-btn" onClick={handleLogout}>
            Logout
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
          </button>
        </div>
      </nav>

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
                  {record.book?.coverUrl ? (
                    <img src={record.book.coverUrl} alt={record.book?.title || 'Book'} />
                  ) : (
                    <div className="mb-thumb-placeholder"></div>
                  )}
                </div>

                {/* Book details */}
                <div className="mb-book-details">
                  {record.book ? (
                    <>
                      <h3 className="mb-book-title">{record.book.title}</h3>
                      <p className="mb-book-author">{record.book.author}</p>
                      {record.borrowDate && (
                        <p className="mb-borrow-date">
                          Borrowed: {new Date(record.borrowDate).toLocaleDateString()}
                        </p>
                      )}
                      {record.dueDate && (
                        <p className={`mb-due-date ${new Date(record.dueDate) < new Date() ? 'overdue' : ''}`}>
                          Due: {new Date(record.dueDate).toLocaleDateString()}
                        </p>
                      )}
                      {record.returnDate && (
                        <p className="mb-return-date">
                          Returned: {new Date(record.returnDate).toLocaleDateString()}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="mb-placeholder-lines">
                      <div className="mb-placeholder-line long"></div>
                      <div className="mb-placeholder-line short"></div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {activeTab === 'current' && record.book && (
                  <div className="mb-book-actions">
                    <button className="mb-return-btn" onClick={() => handleReturn(record.id)}>
                      Return
                    </button>
                  </div>
                )}
                {activeTab === 'current' && !record.book && (
                  <span className="mb-status-pill current">Borrowing</span>
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
