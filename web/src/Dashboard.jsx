import './Dashboard.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    booksBorrowed: 0,
    dueSoon: 0,
    returned: 0
  });
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage or context
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
      
      // Fetch user stats using email
      const statsResponse = await axios.get(`http://localhost:8080/api/dashboard/stats/by-email?email=${userData.email}`);
      setStats(statsResponse.data);
      
      // Fetch featured books
      const booksResponse = await axios.get('http://localhost:8080/api/books/featured');
      setFeaturedBooks(booksResponse.data);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use mock data for now
      setStats({ booksBorrowed: 0, dueSoon: 0, returned: 0 });
      setFeaturedBooks([
        {
          id: 1,
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          cover: "/img/book1.jpg",
          status: "Available"
        },
        {
          id: 2,
          title: "To Kill a Mockingbird",
          author: "Harper Lee",
          cover: "/img/book2.jpg",
          status: "Available"
        },
        {
          id: 3,
          title: "1984",
          author: "George Orwell",
          cover: "/img/book3.jpg",
          status: "Available"
        }
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
      await axios.post(`http://localhost:8080/api/books/${bookId}/borrow`);
      fetchDashboardData(user); // Refresh data
    } catch (error) {
      console.error('Error borrowing book:', error);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>BookBrow</h1>
        </div>
        
        <div className="navbar-links">
          <a href="#" className="nav-link active">Home</a>
          <a href="#" className="nav-link">Borrow Items</a>
          <a href="#" className="nav-link">My Books</a>
        </div>
        
        <div className="navbar-user">
          <div className="user-info">
            <span className="user-name">{user?.fullName || 'user'}</span>
            <span className="user-email">{user?.email || 'user@example.com'}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Search Bar */}
        <div className="search-section">
          <input
            type="text"
            className="search-bar"
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h2>Discover Your Next Great Read</h2>
            <p>Explore our vast collection of books and find your next adventure</p>
            <button className="explore-btn">Explore Book Collection</button>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{stats.booksBorrowed}</h3>
              <p>Books Borrowed</p>
            </div>
            <div className="stat-card">
              <h3>{stats.dueSoon}</h3>
              <p>Due Soon</p>
            </div>
            <div className="stat-card">
              <h3>{stats.returned}</h3>
              <p>Returned</p>
            </div>
          </div>
        </section>

        {/* Featured Books */}
        <section className="featured-books">
          <h2>Featured Books</h2>
          <div className="books-grid">
            {featuredBooks.map((book) => (
              <div key={book.id} className="book-card">
                <div className="book-cover">
                  <img 
                    src={book.cover || '/img/default-book.jpg'} 
                    alt={book.title}
                    onError={(e) => {
                      e.target.src = '/img/default-book.jpg';
                    }}
                  />
                </div>
                <div className="book-info">
                  <h3>{book.title}</h3>
                  <p className="author">{book.author}</p>
                  <span className={`status ${book.status?.toLowerCase()}`}>
                    {book.status || 'Available'}
                  </span>
                  <button 
                    className="borrow-btn"
                    onClick={() => handleBorrowBook(book.id)}
                    disabled={book.status !== 'Available'}
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
