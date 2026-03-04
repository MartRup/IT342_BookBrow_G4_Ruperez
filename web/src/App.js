import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login.jsx';
import Register from './Register.jsx';
import HomeBooks from './HomeBooks.jsx';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<HomeBooks />} />
      </Routes>
    </Router>
  );
}
