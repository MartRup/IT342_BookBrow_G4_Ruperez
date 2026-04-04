import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminNavbar from './AdminNavbar';
import './ManageUsers.css';

const EMPTY_ADD_FORM = { fullName: '', email: '', password: '', role: 'LIBRARIAN' };

export default function ManageUsers() {
  const [user, setUser] = useState({});
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Edit State
  const [editUser, setEditUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [roleForm, setRoleForm] = useState('USER');

  // Add State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_ADD_FORM);
  const [addingError, setAddingError] = useState('');
  const [adding, setAdding] = useState(false);

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

  // --- EDIT ROLE ---
  const openEdit = (u) => {
    setEditUser(u);
    setRoleForm(u.role || 'USER');
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditUser(null);
  };

  const handleRoleChange = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    try {
      await axios.put(`/api/v1/users/${editUser.id}/role`, { role: roleForm });
      fetchUsers();
      closeEditModal();
    } catch (e) { console.error(e); }
  };

  // --- DELETE ---
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { 
      await axios.delete(`/api/v1/users/${id}`); 
      fetchUsers(); 
    } catch (e) { console.error(e); }
  };

  // --- ADD PRIVILEGED USER ---
  const openAdd = () => {
    setAddForm(EMPTY_ADD_FORM);
    setAddingError('');
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setAddingError('');
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddingError('');
    setAdding(true);
    try {
      // POST the request exactly mapped to PrivilegedUserCreateRequest
      await axios.post('/api/v1/auth/privileged', addForm);
      fetchUsers();
      closeAddModal();
    } catch (err) {
      setAddingError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setAdding(false);
    }
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

        <div className="mu-action-wrap" style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
          <div className="mu-search-box" style={{ flex: 1, marginBottom: 0 }}>
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
          <button 
            onClick={openAdd}
            style={{
              padding: '0 25px', borderRadius: '12px', background: '#800000', color: 'white', 
              fontSize: '16px', fontWeight: 'bold', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}
          >
            <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Add Member
          </button>
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

      {/* MODAL: EDIT ROLE */}
      {showEditModal && (
        <div className="mu-overlay" onClick={closeEditModal}>
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
                <button type="button" className="mu-cancel-btn" onClick={closeEditModal}>Cancel</button>
                <button type="submit" className="mu-save-btn">Save Role</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PRIVILEGED USER */}
      {showAddModal && (
        <div className="mu-overlay" onClick={closeAddModal}>
          <div className="mu-modal" onClick={e => e.stopPropagation()}>
             <h2 className="mu-modal-title">Add Privileged User</h2>
             <p className="mu-modal-sub">Create a new Librarian or Admin account directly.</p>
             
             {addingError && <div style={{color: 'red', marginBottom: '15px'}}>{addingError}</div>}
             
             <form onSubmit={handleAddSubmit} className="mu-form">
               <div className="mu-form-group">
                 <label>Full Name</label>
                 <input 
                   type="text" 
                   value={addForm.fullName} 
                   onChange={e => setAddForm(p => ({...p, fullName: e.target.value}))} 
                   required 
                   style={{width: '100%', padding:'10px', borderRadius:'4px', border:'1px solid #ddd'}}
                 />
               </div>
               <div className="mu-form-group">
                 <label>Email Address</label>
                 <input 
                   type="email" 
                   value={addForm.email} 
                   onChange={e => setAddForm(p => ({...p, email: e.target.value}))} 
                   required 
                   style={{width: '100%', padding:'10px', borderRadius:'4px', border:'1px solid #ddd'}}
                 />
               </div>
               <div className="mu-form-group">
                 <label>Temporary Password (Min: 8)</label>
                 <input 
                   type="password" 
                   value={addForm.password} 
                   onChange={e => setAddForm(p => ({...p, password: e.target.value}))} 
                   required
                   minLength={8}
                   style={{width: '100%', padding:'10px', borderRadius:'4px', border:'1px solid #ddd'}}
                 />
               </div>
               <div className="mu-form-group">
                 <label>Assign Role</label>
                 <select 
                   value={addForm.role} 
                   onChange={e => setAddForm(p => ({...p, role: e.target.value}))}
                   style={{width: '100%', padding:'10px', borderRadius:'4px', border:'1px solid #ddd'}}
                 >
                   <option value="LIBRARIAN">Librarian</option>
                   <option value="ADMIN">Admin</option>
                 </select>
               </div>

               <div className="mu-modal-actions">
                 <button type="button" className="mu-cancel-btn" onClick={closeAddModal} disabled={adding}>Cancel</button>
                 <button type="submit" className="mu-save-btn" disabled={adding}>
                   {adding ? 'Creating...' : 'Create Account'}
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
