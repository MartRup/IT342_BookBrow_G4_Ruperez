import React, { useState, useEffect } from 'react';
import ApiService from '../../services/ApiService';

export default function TestData() {
  const [bookCount, setBookCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    description: '',
    available: true
  });

  useEffect(() => {
    fetchBookCount();
  }, []);

  const fetchBookCount = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/test/book-count');
      const data = await response.text();
      setBookCount(data);
    } catch (error) {
      console.error('Error fetching book count:', error);
      setMessage('Error fetching book count');
    }
  };

  const addSampleBooks = async () => {
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/v1/test/add-sample-books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.text();
        setMessage(data);
        fetchBookCount(); // Refresh count
      } else {
        setMessage('Failed to add sample books');
      }
    } catch (error) {
      console.error('Error adding sample books:', error);
      setMessage('Error adding sample books');
    } finally {
      setLoading(false);
    }
  };

  const clearBooks = async () => {
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/v1/test/clear-books', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.text();
        setMessage(data);
        setBookCount(0); // Reset count
      } else {
        setMessage('Failed to clear books');
      }
    } catch (error) {
      console.error('Error clearing books:', error);
      setMessage('Error clearing books');
    } finally {
      setLoading(false);
    }
  };

  const addSingleBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/v1/test/add-single-book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newBook)
      });
      
      if (response.ok) {
        const book = await response.json();
        setMessage(`Successfully added book: ${book.title}`);
        setNewBook({ title: '', author: '', description: '', available: true });
        fetchBookCount(); // Refresh count
      } else {
        setMessage('Failed to add book');
      }
    } catch (error) {
      console.error('Error adding book:', error);
      setMessage('Error adding book');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewBook(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Book Management Test Tools</h1>
      
      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h2>Database Status</h2>
        <p><strong>Current Book Count:</strong> {bookCount}</p>
      </div>

      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#e9ecef', borderRadius: '8px' }}>
        <h2>Sample Data Operations</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={addSampleBooks}
            disabled={loading}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginRight: '10px',
              fontSize: '16px'
            }}
          >
            {loading ? 'Processing...' : 'Add Sample Books'}
          </button>
          
          <button 
            onClick={clearBooks}
            disabled={loading}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {loading ? 'Processing...' : 'Clear All Books'}
          </button>
        </div>

        <p style={{ fontSize: '14px', color: '#666' }}>
          <strong>Add Sample Books:</strong> Adds 10 sample books including classics and popular titles.<br/>
          <strong>Clear All Books:</strong> Removes all books from the database.
        </p>
      </div>

      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#d4edda', borderRadius: '8px' }}>
        <h2>Add Single Book</h2>
        <form onSubmit={addSingleBook}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Title:
            </label>
            <input
              type="text"
              name="title"
              value={newBook.title}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Author:
            </label>
            <input
              type="text"
              name="author"
              value={newBook.author}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Description:
            </label>
            <textarea
              name="description"
              value={newBook.description}
              onChange={handleInputChange}
              rows="4"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
              <input
                type="checkbox"
                name="available"
                checked={newBook.available}
                onChange={handleInputChange}
                style={{ marginRight: '8px' }}
              />
              Available for borrowing
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {loading ? 'Adding...' : 'Add Book'}
          </button>
        </form>
      </div>

      {message && (
        <div style={{
          padding: '15px',
          backgroundColor: message.includes('Successfully') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${message.includes('Successfully') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {message}
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
        <h2>Usage Instructions</h2>
        <ol style={{ lineHeight: '1.6' }}>
          <li><strong>Add Sample Books:</strong> Click to add 10 pre-configured books including classics like "The Great Gatsby", "1984", etc.</li>
          <li><strong>Clear All Books:</strong> Removes all books from the database (useful for testing).</li>
          <li><strong>Add Single Book:</strong> Create a custom book with specific title, author, and description.</li>
          <li><strong>Book Count:</strong> Shows current number of books in database.</li>
        </ol>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '15px' }}>
          <strong>Note:</strong> These tools are for testing purposes only. Use them to populate the database 
          with sample data for testing the book management interface.
        </p>
      </div>
    </div>
  );
}
