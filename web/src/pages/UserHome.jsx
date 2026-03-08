import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserHome.css';

export default function UserHome() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ booksBorrowed: 0, dueSoon: 0, returned: 0 });
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
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
      const statsResponse = await axios.get(
        `http://localhost:8080/api/dashboard/stats/by-email?email=${userData.email}`
      );
      setStats(statsResponse.data);

      const booksResponse = await axios.get('http://localhost:8080/api/books/featured');
      setFeaturedBooks(booksResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({ booksBorrowed: 0, dueSoon: 0, returned: 0 });
      setFeaturedBooks([
        { id: 1, title: 'Harry Potter', author: 'J.K Rowling', coverUrl: null, status: 'Available' },
        { id: 2, title: 'Sunrise of the Reaping', author: 'Suzanne Collins', coverUrl: null, status: 'Available' },
        { id: 3, title: 'A Desolation Called Peace', author: 'Arkady Martine', coverUrl: null, status: 'Available' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleBorrowBook = async (bookId) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      await axios.post(`http://localhost:8080/api/borrow`, {
        bookId,
        userEmail: userData?.email,
      });
      fetchDashboardData(user);
    } catch (error) {
      console.error('Error borrowing book:', error);
    }
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
      {/* ── NAVBAR ── */}
      <nav className="uh-nav">
        <div className="uh-nav-brand">
          <div className="uh-logo-circle">
            <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
            </svg>
          </div>
          <span className="uh-brand-name">BookBrow</span>
        </div>

        <div className="uh-nav-links">
          <a href="#" className="uh-nav-link uh-nav-active" onClick={() => navigate('/dashboard')}>Home</a>
          <a href="#" className="uh-nav-link" onClick={() => navigate('/borrow-items')}>Borrow Items</a>
          <a href="#" className="uh-nav-link" onClick={() => navigate('/my-books')}>My Books</a>
        </div>

        <div className="uh-nav-right">
          <div className="uh-user-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
          <div className="uh-user-info">
            <span className="uh-user-name">{user?.fullName || user?.name || 'user'}</span>
            <span className="uh-user-email">{user?.email || 'user@example.com'}</span>
          </div>
          <button className="uh-logout-btn" onClick={handleLogout}>
            Logout
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
          </button>
        </div>
      </nav>

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
          <h2 className="uh-featured-title">Featured Books</h2>
          <div className="uh-books-grid">
            {featuredBooks.map((book) => (
              <div key={book.id} className="uh-book-card">
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
                  <span className={`uh-book-status ${(book.status || 'available').toLowerCase()}`}>
                    {book.status || 'Available'}
                  </span>
                  <button
                    className="uh-borrow-btn"
                    onClick={() => handleBorrowBook(book.id)}
                    disabled={book.status?.toLowerCase() === 'borrowed'}
                  >
                    Borrow Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
