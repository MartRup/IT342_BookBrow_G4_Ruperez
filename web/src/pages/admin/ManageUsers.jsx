import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminNavbar from './AdminNavbar';
import './ManageUsers.css';

export default function ManageUsers() {
  const [user, setUser] = useState({});
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [roleForm, setRoleForm] = useState('USER');
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
    } catch (e) {
      console.error(e);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (u) => {
    setEditUser(u);
    setRoleForm(u.role || 'USER');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditUser(null);
  };

  const handleRoleChange = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    try {
      await axios.put(`/api/v1/users/${editUser.id}/role`, { role: roleForm });
      fetchUsers();
      closeModal();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { 
      await axios.delete(`/api/v1/users/${id}`); 
      fetchUsers(); 
    } catch (e) { console.error(e); }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (u.fullName || '').toLowerCase().includes(q) || 
           (u.email || '').toLowerCase().includes(q);
  });

  if (loading) return <div className="mu-loading"><div className="mu-spinner" /><p>Loading users...</p></div>;

  return (
    <div className="mu-page">
      <AdminNavbar />

      <main className="mu-content">
        <h1 className="mu-title">Members and User</h1>
        <p className="mu-sub">Manage Library Members and User</p>

        <div className="mu-search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" width="24" height="24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input 
            type="text" 
            placeholder="Search by member name, book title, or email..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>

        <div className="mu-table-container">
          <table className="mu-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Loans</th>
                <th>Status</th>
                <th className="mu-center-text">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="mu-empty">No users found</td></tr>
              ) : filtered.map((u, i) => (
                <tr key={u.id || i}>
                  <td>{u.fullName || '—'}</td>
                  <td>{u.email || '—'}</td>
                  <td>{u.role || 'USER'}</td>
                  <td>{u.activeLoans || 0}</td>
                  <td>{u.status || 'Active'}</td>
                  <td className="mu-actions-cell">
                    <button className="mu-icon-btn" onClick={() => openEdit(u)} title="Edit Role">
                      <svg viewBox="0 0 24 24" fill="#111" width="20" height="20">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                    </button>
                    <button className="mu-icon-btn mu-del-icon" onClick={() => handleDelete(u.id)} title="Delete">
                      <svg viewBox="0 0 24 24" fill="#a52a2a" width="20" height="20">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal for editing role */}
      {showModal && (
        <div className="mu-overlay" onClick={closeModal}>
          <div className="mu-modal" onClick={e => e.stopPropagation()}>
            <h2 className="mu-modal-title">Edit User Role</h2>
            <p className="mu-modal-sub">Change role for {editUser?.fullName || editUser?.email}</p>
            <form onSubmit={handleRoleChange} className="mu-form">
              <div className="mu-form-group">
                <label>Role</label>
                <select value={roleForm} onChange={e => setRoleForm(e.target.value)}>
                  <option value="USER">User</option>
                  <option value="LIBRARIAN">Librarian</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="mu-modal-actions">
                <button type="button" className="mu-cancel-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="mu-save-btn">Save Role</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
