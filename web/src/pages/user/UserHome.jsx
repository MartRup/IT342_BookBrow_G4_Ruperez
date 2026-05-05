import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/ApiService';
import UserNavbar from './UserNavbar';
import BookDetailsModal from '../../components/BookDetailsModal';
import './UserHome.css';

export default function UserHome() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ booksBorrowed: 0, dueSoon: 0, returned: 0 });
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [borrowingBookId, setBorrowingBookId] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
      fetchDashboardData(userData);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchDashboardData = async (userData) => {
    try {
      setLoading(true);
      
      // Fetch user's borrow statistics
      try {
        const borrowResponse = await ApiService.borrow.getUserBorrows();
        const borrowRecords = borrowResponse.data?.data?.borrowRecords ?? borrowResponse.data?.borrowRecords ?? [];
        
        // Calculate stats from borrow records
        const active = borrowRecords.filter(r => r.status === 'ACTIVE' || r.status === 'APPROVED').length;
        const dueSoon = borrowRecords.filter(r => {
          if (r.status !== 'ACTIVE' && r.status !== 'APPROVED') return false;
          if (!r.dueDate) return false;
          const daysLeft = Math.ceil((new Date(r.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
          return daysLeft <= 3 && daysLeft >= 0;
        }).length;
        const returned = borrowRecords.filter(r => r.status === 'RETURNED').length;
        
        setStats({ booksBorrowed: active, dueSoon, returned });
      } catch (error) {
        console.error('Error fetching borrow stats:', error);
        setStats({ booksBorrowed: 0, dueSoon: 0, returned: 0 });
      }

      // Fetch featured books
      try {
        const booksResponse = await ApiService.dashboard.getFeaturedBooks();
        const booksData = booksResponse.data?.data ?? booksResponse.data ?? [];
        
        // Add status field based on available field
        const booksWithStatus = Array.isArray(booksData) ? booksData.map(book => ({
          ...book,
          status: book.available ? 'Available' : 'Borrowed'
        })) : [];
        
        setFeaturedBooks(booksWithStatus);
      } catch (error) {
        console.error('Error fetching featured books:', error);
        setFeaturedBooks([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleBorrowBook = async (book) => {
    try {
      setBorrowingBookId(book.id);
      await ApiService.borrow.create(book.id);
      showToast('success', `Borrow request for "${book.title}" submitted! Waiting for librarian approval.`);
      setSelectedBook(null);
      fetchDashboardData(user);
    } catch (error) {
      const msg = error.response?.data?.error?.message || error.response?.data?.message || 'Failed to submit borrow request.';
      showToast('error', msg);
    } finally {
      setBorrowingBookId(null);
    }
  };

  const handleBookClick = (book) => {
    setSelectedBook(book);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/borrow-items?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  if (loading) {
    return (
      <div className="uh-loading-screen">
        <div className="uh-spinner"></div>
        <p>Loading your library...</p>
      </div>
    );
  }

  return (
    <div className="uh-wrapper">
      {/* ── Toast Notification ── */}
      {toast && (
        <div className={`uh-toast uh-toast-${toast.type}`}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          {toast.message}
        </div>
      )}

      {/* ── Book Details Modal ── */}
      {selectedBook && (
        <BookDetailsModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onBorrow={handleBorrowBook}
          borrowing={borrowingBookId === selectedBook.id}
        />
      )}

      {/* ── NAVBAR ── */}
      <UserNavbar />

      {/* ── MAIN ── */}
      <main className="uh-main">

        {/* Hero + Search */}
        <section className="uh-hero-section">
          <div className="uh-hero-text">
            <h1 className="uh-hero-title">
              Discover Your Next <span className="uh-hero-accent">Great Read</span>
            </h1>
            <p className="uh-hero-subtitle">
              Browse thousands of books, track your borrowing history, and join a community of readers.
            </p>
            <button className="uh-explore-btn" onClick={() => navigate('/borrow-items')}>
              Explore Book Collection
            </button>
          </div>

          <div className="uh-hero-right">
            <form className="uh-search-bar" onSubmit={handleSearch}>
              <svg className="uh-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <div className="uh-hero-icon-circle">
              <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" width="60" height="60">
                <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
              </svg>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="uh-stats-section">
          <div className="uh-stat-card">
            <span className="uh-stat-number">{stats.booksBorrowed}</span>
            <span className="uh-stat-label">Books Borrowed</span>
          </div>
          <div className="uh-stat-card">
            <span className="uh-stat-number">{stats.dueSoon}</span>
            <span className="uh-stat-label">Due Soon</span>
          </div>
          <div className="uh-stat-card">
            <span className="uh-stat-number">{stats.returned}</span>
            <span className="uh-stat-label">Returned</span>
          </div>
        </section>

        {/* Featured Books */}
        <section className="uh-featured-section">
          <div className="uh-featured-header">
            <h2 className="uh-featured-title">Featured Books</h2>
            <p className="uh-featured-subtitle">Popular picks and new arrivals</p>
          </div>
          
          {featuredBooks.length === 0 ? (
            <div className="uh-empty-state">
              <svg viewBox="0 0 24 24" fill="#ccc" width="64" height="64">
                <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h2v8l2.5-1.5L13 12V4h5v16z"/>
              </svg>
              <p>No featured books available at the moment</p>
            </div>
          ) : (
            <div className="uh-books-grid">
              {featuredBooks.map((book) => (
                <div key={book.id} className="uh-book-card" onClick={() => handleBookClick(book)}>
                  <div className="uh-book-cover">
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                    ) : null}
                    <div className="uh-book-cover-placeholder" style={{ display: book.coverUrl ? 'none' : 'flex' }}>
                      <svg viewBox="0 0 24 24" fill="#aaa" width="40" height="40">
                        <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h2v8l2.5-1.5L13 12V4h5v16z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="uh-book-info">
                    <h3 className="uh-book-title">{book.title}</h3>
                    <p className="uh-book-author">{book.author}</p>
                    {book.genre && <p className="uh-book-genre">{book.genre}</p>}
                    <span className={`uh-book-status ${(book.status || 'available').toLowerCase()}`}>
                      {book.status || 'Available'}
                    </span>
                    <button
                      className="uh-borrow-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBorrowBook(book);
                      }}
                      disabled={book.status?.toLowerCase() === 'borrowed' || borrowingBookId === book.id}
                    >
                      {borrowingBookId === book.id ? 'Requesting...' : 'Request to Borrow'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
