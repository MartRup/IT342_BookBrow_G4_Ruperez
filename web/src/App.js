import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';

// ── Auth ──────────────────────────────────────────────────
import Login       from './pages/auth/Login.jsx';
import Register    from './pages/auth/Register.jsx';
import AuthSuccess from './pages/auth/AuthSuccess.jsx';

// ── User ─────────────────────────────────────────────────
import UserHome    from './pages/user/UserHome.jsx';
import BorrowItems from './pages/user/BorrowItems.jsx';
import MyBooks     from './pages/user/MyBooks.jsx';

// ── Librarian ─────────────────────────────────────────────
import LibrarianDashboard from './pages/librarian/LibrarianDashboard.jsx';
import ManageBooks        from './pages/librarian/ManageBooks.jsx';
import BorrowingRecords   from './pages/librarian/BorrowingRecords.jsx';

// ── Admin ─────────────────────────────────────────────────
import AdminDashboard        from './pages/admin/AdminDashboard.jsx';
import ManageUsers           from './pages/admin/ManageUsers.jsx';
import AdminManageBooks      from './pages/admin/AdminManageBooks.jsx';
import AdminBorrowingRecords from './pages/admin/AdminBorrowingRecords.jsx';

// ── Shared ────────────────────────────────────────────────
import Settings from './components/Settings.jsx';

// ── Helpers ───────────────────────────────────────────────
const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user')); }
  catch { return null; }
};

/** Redirect to the right dashboard based on role */
function RoleRedirect() {
  const user = getUser();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'ADMIN')      return <Navigate to="/admin/dashboard" />;
  if (user.role === 'LIBRARIAN')  return <Navigate to="/librarian/dashboard" />;
  return <Navigate to="/dashboard" />;
}

/** Guard — only allow if authenticated AND role matches */
function ProtectedRoute({ element, allowedRoles }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <RoleRedirect />;
  return element;
}

function AppContent() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"             element={<Navigate to="/login" />} />
      <Route path="/login"        element={<Login />} />
      <Route path="/register"     element={<Register />} />
      {/* Google OAuth2 callback landing page */}
      <Route path="/auth/success" element={<AuthSuccess />} />

      {/* Auto-redirect after login */}
      <Route path="/home" element={<RoleRedirect />} />

      {/* ── User routes ── */}
      <Route path="/dashboard"    element={<ProtectedRoute element={<UserHome />}    allowedRoles={['USER']} />} />
      <Route path="/borrow-items" element={<ProtectedRoute element={<BorrowItems />} allowedRoles={['USER']} />} />
      <Route path="/my-books"     element={<ProtectedRoute element={<MyBooks />}     allowedRoles={['USER']} />} />
      <Route path="/settings"     element={<ProtectedRoute element={<Settings />}    allowedRoles={['USER']} />} />

      {/* ── Librarian routes ── */}
      <Route path="/librarian/dashboard"         element={<ProtectedRoute element={<LibrarianDashboard />} allowedRoles={['LIBRARIAN']} />} />
      <Route path="/librarian/manage-books"      element={<ProtectedRoute element={<ManageBooks />}        allowedRoles={['LIBRARIAN']} />} />
      <Route path="/librarian/borrowing-records" element={<ProtectedRoute element={<BorrowingRecords />}   allowedRoles={['LIBRARIAN']} />} />
      <Route path="/librarian/settings"          element={<ProtectedRoute element={<Settings />}           allowedRoles={['LIBRARIAN']} />} />

      {/* ── Admin routes ── */}
      <Route path="/admin/dashboard"         element={<ProtectedRoute element={<AdminDashboard />}   allowedRoles={['ADMIN']} />} />
      <Route path="/admin/manage-users"      element={<ProtectedRoute element={<ManageUsers />}      allowedRoles={['ADMIN']} />} />
      <Route path="/admin/manage-books"      element={<ProtectedRoute element={<AdminManageBooks />} allowedRoles={['ADMIN']} />} />
      <Route path="/admin/borrowing-records" element={<ProtectedRoute element={<AdminBorrowingRecords />} allowedRoles={['ADMIN']} />} />
      <Route path="/admin/settings"          element={<ProtectedRoute element={<Settings />}       allowedRoles={['ADMIN']} />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
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
