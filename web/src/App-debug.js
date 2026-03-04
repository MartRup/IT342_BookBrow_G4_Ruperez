import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login.jsx';
import Register from './Register.jsx';
import HomeBooks from './HomeBooks.jsx';

function App() {
  console.log('App component rendering...');
  
  return (
    <Router>
      <div style={{ padding: '20px' }}>
        <h1>BookBrow Debug Mode</h1>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<HomeBooks />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
