import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Login from './Login.jsx';
import Register from './Register.jsx';
import Dashboard from './Dashboard.jsx';
import HomeBooks from './HomeBooks.jsx';
import UserHome from './pages/UserHome.jsx';
import BorrowItems from './pages/BorrowItems.jsx';
import MyBooks from './pages/MyBooks.jsx';

function AppContent() {
  console.log('AppContent rendering...');
  
  // Check if user is authenticated
  const isAuthenticated = () => {
    const user = localStorage.getItem('user');
    return user !== null;
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/dashboard" 
        element={isAuthenticated() ? <UserHome /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/borrow-items" 
        element={isAuthenticated() ? <BorrowItems /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/my-books" 
        element={isAuthenticated() ? <MyBooks /> : <Navigate to="/login" />} 
      />
      <Route path="/home" element={<HomeBooks />} />
    </Routes>
  );
}

export default function App() {
  console.log('App component rendering...');
  
  return (
    <Router>
      <AuthProvider>
        <div style={{ minHeight: '100vh' }}>
          <AppContent />
        </div>
      </AuthProvider>
    </Router>
  );
}
