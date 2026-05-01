import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminNavbar from './AdminNavbar';
import './ManageUsers.css';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:8080';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor for debugging
axios.interceptors.request.use(
  (config) => {
    console.log('Making request:', config.method?.toUpperCase(), config.url, config.data);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axios.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

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
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

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
      
      // Handle the API response structure correctly
      let usersData = [];
      
      if (res.data?.success && res.data?.data?.users) {
        // New API response format: { success: true, data: { users: [...] } }
        usersData = res.data.data.users;
      } else if (res.data?.data?.users) {
        // Alternative format: { data: { users: [...] } }
        usersData = res.data.data.users;
      } else if (Array.isArray(res.data?.users)) {
        // Simple format: { users: [...] }
        usersData = res.data.users;
      } else if (Array.isArray(res.data)) {
        // Direct array format: [...]
        usersData = res.data;
      } else {
        console.warn('Unexpected API response format:', res.data);
        usersData = [];
      }
      
      // Transform user data to ensure consistent format
      const transformedUsers = usersData.map(user => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role || 'USER',
        status: user.status || 'Active',
        activeLoans: user.activeLoans || 0
      }));
      
      setUsers(transformedUsers);
      console.log('Users fetched successfully:', transformedUsers);
    } catch (e) {
      console.error('Error fetching users:', e);
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
      // Trigger dashboard refresh
      window.dispatchEvent(new CustomEvent('dashboardRefresh'));
    } catch (e) { console.error(e); }
  };

  // --- DELETE ---
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { 
      await axios.delete(`/api/v1/users/${id}`); 
      fetchUsers(); 
      // Trigger dashboard refresh
      window.dispatchEvent(new CustomEvent('dashboardRefresh'));
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
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    
    if (!addForm.fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (addForm.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    }
    
    if (!addForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addForm.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!addForm.password) {
      errors.password = 'Password is required';
    } else if (addForm.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', class: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    const strengthMap = {
      0: { text: '', class: '' },
      1: { text: 'Weak', class: 'password-strength-weak' },
      2: { text: 'Fair', class: 'password-strength-fair' },
      3: { text: 'Good', class: 'password-strength-good' },
      4: { text: 'Strong', class: 'password-strength-strong' },
      5: { text: 'Very Strong', class: 'password-strength-strong' }
    };
    
    return { strength: (strength / 5) * 100, ...strengthMap[strength] };
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setAddingError('');
    setAdding(true);
    try {
      // POST the request exactly mapped to PrivilegedUserCreateRequest
      const response = await axios.post('/api/v1/auth/privileged', addForm);
      
      // Show success message
      setShowSuccess(true);
      closeAddModal();
      
      // Refresh users list immediately for real-time reflection
      await fetchUsers();
      
      // Trigger dashboard refresh
      window.dispatchEvent(new CustomEvent('dashboardRefresh'));
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
      
      console.log('User created successfully:', response.data);
    } catch (err) {
      console.error('Error creating user:', err);
      
      // Better error handling with specific messages
      let errorMessage = 'Failed to create user.';
      
      if (err.response) {
        // Backend responded with error
        if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      } else if (err.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection.';
      } else {
        // Other error
        errorMessage = err.message || 'An unexpected error occurred.';
      }
      
      setAddingError(errorMessage);
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
        <div className="mu-header">
          <h1 className="mu-title">Members and User</h1>
          <p className="mu-sub">Manage Library Members and User</p>
        </div>

        <div className="mu-action-wrap">
          <div className="mu-search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            className="mu-add-member-btn"
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
                <tr>
                  <td colSpan={6}>
                    <div className="mu-empty">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      <h3>No users found</h3>
                      <p>Try adjusting your search criteria or add a new member to get started.</p>
                      <button onClick={openAdd} className="mu-add-member-btn">
                        <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
                          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                        Add First Member
                      </button>
                    </div>
                  </td>
                </tr>
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

      {/* Success Notification */}
      {showSuccess && (
        <div className="mu-success" style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 2000,
          minWidth: '300px',
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          Account created successfully!
        </div>
      )}

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
             <h2 className="mu-modal-title">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="#800000">
                 <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
               </svg>
               Add Privileged User
             </h2>
             <p className="mu-modal-sub">Create a new Librarian or Admin account directly.</p>
             
             {addingError && (
               <div className="mu-error">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                 </svg>
                 {addingError}
               </div>
             )}
             
             <form onSubmit={handleAddSubmit} className="mu-form">
               <div className="mu-form-group">
                 <label>Full Name</label>
                 <input 
                   type="text" 
                   value={addForm.fullName} 
                   onChange={e => {
                     setAddForm(p => ({...p, fullName: e.target.value}));
                     if (formErrors.fullName) {
                       setFormErrors(prev => ({...prev, fullName: ''}));
                     }
                   }}
                   className={formErrors.fullName ? 'error' : ''}
                   required 
                   placeholder="Enter full name"
                 />
                 {formErrors.fullName && (
                   <div style={{color: '#dc2626', fontSize: '12px', marginTop: '4px'}}>
                     {formErrors.fullName}
                   </div>
                 )}
               </div>
               <div className="mu-form-group">
                 <label>Email Address</label>
                 <input 
                   type="email" 
                   value={addForm.email} 
                   onChange={e => {
                     setAddForm(p => ({...p, email: e.target.value}));
                     if (formErrors.email) {
                       setFormErrors(prev => ({...prev, email: ''}));
                     }
                   }}
                   className={formErrors.email ? 'error' : ''}
                   required 
                   placeholder="user@example.com"
                 />
                 {formErrors.email && (
                   <div style={{color: '#dc2626', fontSize: '12px', marginTop: '4px'}}>
                     {formErrors.email}
                   </div>
                 )}
               </div>
               <div className="mu-form-group">
                 <label>Temporary Password (Min: 8)</label>
                 <div className="password-input-wrapper">
                   <input 
                     type={showPassword ? 'text' : 'password'}
                     value={addForm.password} 
                     onChange={e => {
                       setAddForm(p => ({...p, password: e.target.value}));
                       if (formErrors.password) {
                         setFormErrors(prev => ({...prev, password: ''}));
                       }
                     }}
                     className={formErrors.password ? 'error' : ''}
                     required
                     minLength={8}
                     placeholder="Enter temporary password"
                   />
                   <button
                     type="button"
                     className="password-toggle-btn"
                     onClick={() => setShowPassword(!showPassword)}
                   >
                     {showPassword ? (
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                         <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                         <line x1="1" y1="1" x2="23" y2="23"/>
                       </svg>
                     ) : (
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                         <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                         <circle cx="12" cy="12" r="3"/>
                       </svg>
                     )}
                   </button>
                 </div>
                 {formErrors.password && (
                   <div style={{color: '#dc2626', fontSize: '12px', marginTop: '4px'}}>
                     {formErrors.password}
                   </div>
                 )}
                 {addForm.password && (
                   <div>
                     <div className="password-strength">
                       <div 
                         className={`password-strength-bar ${getPasswordStrength(addForm.password).class}`}
                         style={{ width: `${getPasswordStrength(addForm.password).strength}%` }}
                       />
                     </div>
                     <div className={`password-strength-text ${getPasswordStrength(addForm.password).class}`}>
                       Password strength: {getPasswordStrength(addForm.password).text}
                     </div>
                   </div>
                 )}
               </div>
               <div className="mu-form-group">
                 <label>Assign Role</label>
                 <select 
                   value={addForm.role} 
                   onChange={e => setAddForm(p => ({...p, role: e.target.value}))}
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
