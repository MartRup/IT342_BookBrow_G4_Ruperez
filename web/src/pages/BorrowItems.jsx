import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './BorrowItems.css';

export default function BorrowItems() {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [borrowingBookId, setBorrowingBookId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) { navigate('/login'); return; }
    setUser(userData);

    // Pre-fill search from query param (?search=...)
    const params = new URLSearchParams(location.search);
    const q = params.get('search') || '';
    setSearchQuery(q);
    fetchBooks(q);
  }, [navigate, location.search]);

  const fetchBooks = async (q = '') => {
    try {
      setLoading(true);
      const url = q
        ? `http://localhost:8080/api/books/search?query=${encodeURIComponent(q)}`
        : 'http://localhost:8080/api/books';
      const response = await axios.get(url);
      setBooks(response.data);
      setFilteredBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
      // Mock data
      const mock = [
        { id: 1, title: 'A Desolation Called Peace', author: 'Arkady Martine', coverUrl: null, status: 'Available' },
        { id: 2, title: 'Avengers: Secret Wars', author: 'Stanley and Jack Kirby', coverUrl: null, status: 'Available' },
        { id: 3, title: 'Harry Potter: The Chamber of Secrets', author: 'JK Rollings', coverUrl: null, status: 'Available' },
        { id: 4, title: 'I Love You Since 1892', author: 'Binibining Mia', coverUrl: null, status: 'Available' },
        { id: 5, title: 'Dragon Ball Super', author: 'Akira Toriyama', coverUrl: null, status: 'Available' },
        { id: 6, title: 'Jojo Bizzare Adventure: Stone Ocean', author: 'Hirokiko Araki', coverUrl: null, status: 'Available' },
      ];
      setBooks(mock);
      setFilteredBooks(mock);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = books;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((b) => (b.status || 'Available').toLowerCase() === statusFilter);
    }
    setFilteredBooks(result);
  }, [searchQuery, statusFilter, books]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleBorrow = async (bookId) => {
    try {
      setBorrowingBookId(bookId);
      const userData = JSON.parse(localStorage.getItem('user'));
      await axios.post('http://localhost:8080/api/borrow', {
        bookId,
        userEmail: userData?.email,
      });
      fetchBooks(searchQuery);
    } catch (error) {
      console.error('Error borrowing book:', error);
    } finally {
      setBorrowingBookId(null);
    }
  };

  if (loading) {
    return (
      <div className="bi-loading-screen">
        <div className="bi-spinner"></div>
        <p>Loading library...</p>
      </div>
    );
  }

  return (
    <div className="bi-wrapper">
      {/* ── NAVBAR ── */}
      <nav className="bi-nav">
        <div className="bi-nav-brand">
          <div className="bi-logo-circle">
            <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
            </svg>
          </div>
          <span className="bi-brand-name">BookBrow</span>
        </div>

        <div className="bi-nav-links">
          <a href="#" className="bi-nav-link" onClick={() => navigate('/dashboard')}>Home</a>
          <a href="#" className="bi-nav-link bi-nav-active" onClick={() => navigate('/borrow-items')}>Borrow Items</a>
          <a href="#" className="bi-nav-link" onClick={() => navigate('/my-books')}>My Books</a>
        </div>

        <div className="bi-nav-right">
          <div className="bi-user-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
          <div className="bi-user-info">
            <span className="bi-user-name">{user?.fullName || user?.name || 'user'}</span>
            <span className="bi-user-email">{user?.email || 'user@example.com'}</span>
          </div>
          <button className="bi-logout-btn" onClick={handleLogout}>
            Logout
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main className="bi-main">
        <div className="bi-page-header">
          <h1 className="bi-page-title">Browse Library</h1>
          <p className="bi-page-subtitle">Discover amazing books</p>
        </div>

        {/* Search + Filter */}
        <div className="bi-controls">
          <div className="bi-search-wrap">
            <svg className="bi-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              className="bi-search-input"
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="bi-filter-wrap">
            <button className="bi-filter-btn" onClick={() => setShowFilters(!showFilters)}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39A.998.998 0 0018.95 4H5.04a1 1 0 00-.79 1.61z"/>
              </svg>
              Filters
            </button>
            {showFilters && (
              <div className="bi-filter-dropdown">
                <label className={statusFilter === 'all' ? 'bi-filter-option active' : 'bi-filter-option'}>
                  <input type="radio" name="status" value="all" checked={statusFilter === 'all'} onChange={() => setStatusFilter('all')} />
                  All
                </label>
                <label className={statusFilter === 'available' ? 'bi-filter-option active' : 'bi-filter-option'}>
                  <input type="radio" name="status" value="available" checked={statusFilter === 'available'} onChange={() => setStatusFilter('available')} />
                  Available
                </label>
                <label className={statusFilter === 'borrowed' ? 'bi-filter-option active' : 'bi-filter-option'}>
                  <input type="radio" name="status" value="borrowed" checked={statusFilter === 'borrowed'} onChange={() => setStatusFilter('borrowed')} />
                  Borrowed
                </label>
              </div>
            )}
          </div>
        </div>

        <p className="bi-results-count">Showing {filteredBooks.length} Book{filteredBooks.length !== 1 ? 's' : ''}</p>

        {/* Books Grid */}
        <div className="bi-books-grid">
          {filteredBooks.length === 0 ? (
            <div className="bi-empty-state">
              <svg viewBox="0 0 24 24" fill="#ccc" width="64" height="64">
                <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h2v8l2.5-1.5L13 12V4h5v16z"/>
              </svg>
              <p>No books found</p>
            </div>
          ) : (
            filteredBooks.map((book) => (
              <div key={book.id} className="bi-book-card">
                <div className="bi-book-cover">
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div className="bi-cover-placeholder">
                      <svg viewBox="0 0 24 24" fill="#999" width="40" height="40">
                        <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h2v8l2.5-1.5L13 12V4h5v16z"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="bi-book-info">
                  <h3 className="bi-book-title">{book.title}</h3>
                  <p className="bi-book-author">{book.author}</p>
                  <span className={`bi-status-badge ${(book.status || 'available').toLowerCase()}`}>
                    {book.status || 'Available'}
                  </span>
                  <button
                    className="bi-borrow-btn"
                    onClick={() => handleBorrow(book.id)}
                    disabled={book.status?.toLowerCase() === 'borrowed' || borrowingBookId === book.id}
                  >
                    {borrowingBookId === book.id ? 'Borrowing...' : 'Borrow Now'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
