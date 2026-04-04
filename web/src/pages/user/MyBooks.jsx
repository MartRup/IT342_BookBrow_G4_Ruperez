import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserNavbar from './UserNavbar';
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
