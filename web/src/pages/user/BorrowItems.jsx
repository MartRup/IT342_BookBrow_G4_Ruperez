import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ApiService from '../../services/ApiService';
import UserNavbar from './UserNavbar';
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
      // Fetch all books matching search query
      const response = await ApiService.books.getAll({ search: q || undefined });
      const booksData = response.data?.data?.books || response.data || [];
      setBooks(booksData);
      setFilteredBooks(booksData);
    } catch (error) {
      console.error('Error fetching books:', error);
      setBooks([]);
      setFilteredBooks([]);
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
      // Request to borrow book
      await ApiService.borrow.create(bookId);
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
      <UserNavbar />

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
