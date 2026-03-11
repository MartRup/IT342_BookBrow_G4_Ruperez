import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ManageUsers.css';

export default function ManageUsers() {
  const [user, setUser]   = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch]   = useState('');
  const [roleFilter, setRole] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) { navigate('/login'); return; }
    if (userData.role !== 'ADMIN') { navigate('/dashboard'); return; }
    setUser(userData);
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/v1/users');
      setUsers(res.data?.data?.users || res.data?.users || res.data || []);
    } catch (e) { console.error(e); setUsers([]); }
    finally { setLoading(false); }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await axios.put(`/api/v1/users/${id}/role`, { role: newRole });
      fetchUsers();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { await axios.delete(`/api/v1/users/${id}`); fetchUsers(); }
    catch (e) { console.error(e); }
  };

  const handleLogout = () => { localStorage.removeItem('user'); localStorage.removeItem('token'); navigate('/login'); };

  const filtered = users.filter(u => {
    const matchSearch = u.fullName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role?.toLowerCase() === roleFilter;
    return matchSearch && matchRole;
  });

  if (loading) return <div className="mu-loading"><div className="mu-spinner" /><p>Loading users...</p></div>;

  return (
    <div className="mu-wrapper">
      <nav className="mu-nav">
        <div className="mu-nav-brand">
          <div className="mu-logo-circle"><svg viewBox="0 0 24 24" fill="white"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg></div>
          <span className="mu-brand-name">BookBrow</span>
          <span className="mu-role-badge">Admin</span>
        </div>
        <div className="mu-nav-links">
          <a className="mu-nav-link" onClick={() => navigate('/admin/dashboard')}>Dashboard</a>
          <a className="mu-nav-link mu-nav-active" onClick={() => navigate('/admin/manage-users')}>Manage Users</a>
        </div>
        <div className="mu-nav-right">
          <span className="mu-username">{user?.fullName || 'Admin'}</span>
          <button className="mu-logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <main className="mu-main">
        <h1 className="mu-title">Manage Users</h1>
        <p className="mu-sub">View, edit roles, and delete users</p>

        <div className="mu-controls">
          <div className="mu-search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="mu-role-filter" value={roleFilter} onChange={e => setRole(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="librarian">Librarian</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="mu-table-wrap">
          <table className="mu-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="mu-empty">No users found</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id}>
                  <td>{u.fullName || '—'}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      className="mu-role-select"
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                    >
                      <option value="USER">User</option>
                      <option value="LIBRARIAN">Librarian</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td>
                    <button className="mu-del-btn" onClick={() => handleDelete(u.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
