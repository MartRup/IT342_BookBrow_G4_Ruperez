import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LibrarianNavbar from './LibrarianNavbar';
import './BorrowingRecords.css';

export default function BookBorrowTest() {
  const [books, setBooks] = useState([]);
  const [borrowMessage, setBorrowMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) { navigate('/login'); return; }
    if (userData.role !== 'LIBRARIAN') { navigate('/dashboard'); return; }
    fetchBooks();
  }, [navigate]);

  const fetchBooks = async () => {
    try {
      const res = await axios.get('/api/v1/books');
      const data = res.data?.data || res.data || [];
      setBooks(data);
    } catch (e) {
      console.error('Error fetching books:', e);
      setBooks([]);
    }
  };

  const handleBorrowBook = async (bookId) => {
    setLoading(true);
    setBorrowMessage('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/v1/borrow`, 
        { bookId: bookId },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data?.success) {
        setBorrowMessage(`Successfully borrowed book! Status: ${response.data.data?.status || 'PENDING'}`);
        // Refresh books to update availability
        fetchBooks();
      } else {
        setBorrowMessage(response.data?.error?.message || 'Failed to borrow book');
      }
    } catch (error) {
      console.error('Error borrowing book:', error);
      setBorrowMessage('Error borrowing book');
    } finally {
      setLoading(false);
    }
  };

  const availableBooks = books.filter(book => book.available);
  const borrowedBooks = books.filter(book => !book.available);

  return (
    <div className="br-page">
      <LibrarianNavbar />

      <main className="br-content">
        <div className="br-header">
          <h1 className="br-title">Book Borrow Test</h1>
          <p className="br-sub">Test book borrowing functionality and verify database integration</p>
        </div>

        <div className="br-stats-container">
          <div className="br-stat-card">
            <div className="br-icon-box">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
              </svg>
            </div>
            <div className="br-stat-info">
              <div className="br-stat-label">Available Books</div>
              <div className="br-stat-value">{availableBooks.length}</div>
            </div>
          </div>
          <div className="br-stat-card">
            <div className="br-icon-box">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 19h16v2H4v-2zm16-4H4v2h16v-2zm8-6H5C3.9 5 3 5.9 3 7v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
            <div className="br-stat-info">
              <div className="br-stat-label">Borrowed Books</div>
              <div className="br-stat-value">{borrowedBooks.length}</div>
            </div>
          </div>
        </div>

        {borrowMessage && (
          <div style={{
            padding: '15px',
            backgroundColor: borrowMessage.includes('Successfully') ? '#d4edda' : '#f8d7da',
            border: `1px solid ${borrowMessage.includes('Successfully') ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            {borrowMessage}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <h2>Available Books for Borrowing</h2>
          {availableBooks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h3>No available books</h3>
              <p>Add some books to the library first using the Book Management page!</p>
              <button 
                onClick={() => navigate('/librarian/manage-books')}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  marginTop: '20px'
                }}
              >
                Go to Book Management
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {availableBooks.map(book => (
                <div key={book.id} style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{book.title}</h3>
                  <p style={{ margin: '0 0 5px 0', color: '#666', fontStyle: 'italic' }}>{book.author}</p>
                  <p style={{ margin: '0 0 15px 0', color: '#888', fontSize: '14px' }}>{book.description?.substring(0, 100)}...</p>
                  <button 
                    onClick={() => handleBorrowBook(book.id)}
                    disabled={loading}
                    style={{
                      backgroundColor: loading ? '#6c757d' : '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '4px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      width: '100%'
                    }}
                  >
                    {loading ? 'Processing...' : 'Borrow This Book'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e9ecef', borderRadius: '8px' }}>
          <h2>How This Works:</h2>
          <ol style={{ lineHeight: '1.6' }}>
            <li><strong>Add Books:</strong> Go to Book Management to add books to the library</li>
            <li><strong>Books Appear Here:</strong> All available books are displayed above</li>
            <li><strong>Borrow Books:</strong> Click "Borrow This Book" to check out a book</li>
            <li><strong>Automatic Updates:</strong> Book availability updates automatically in the database</li>
            <li><strong>View Records:</strong> Go to Borrowing Records to see all borrowing history</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
