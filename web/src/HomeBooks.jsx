import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function HomeBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch books from backend when component mounts
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      // Replace with your actual backend URL
      const response = await axios.get('http://localhost:8080/api/books');
      setBooks(response.data);
      setError(null);
    } catch (err) {
      setError('Error fetching books. Make sure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>📚 BookBrow</h1>
        <p>Discover your next favorite book</p>
      </header>

      <main className="main-content">
        {loading && <p className="loading">Loading books...</p>}
        {error && <p className="error">{error}</p>}
        
        {!loading && !error && books.length === 0 && (
          <p className="no-books">No books available yet. Start adding books!</p>
        )}

        <div className="books-grid">
          {books.map((book) => (
            <div key={book.id} className="book-card">
              <h3>{book.title}</h3>
              <p className="author">{book.author}</p>
              <p className="description">{book.description}</p>
            </div>
          ))}
        </div>

        <button onClick={fetchBooks} className="refresh-btn">
          🔄 Refresh Books
        </button>
      </main>

      <footer className="App-footer">
        <p>&copy; 2026 BookBrow. All rights reserved.</p>
      </footer>
    </div>
  );
}
