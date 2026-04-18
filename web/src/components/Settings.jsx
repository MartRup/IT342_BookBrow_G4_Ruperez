import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';
import AdminNavbar from '../pages/admin/AdminNavbar';
import LibrarianNavbar from '../pages/librarian/LibrarianNavbar';
import UserNavbar from '../pages/user/UserNavbar';
import './Settings.css';

/* ───────── NAV CONFIG PER ROLE ───────── */
const NAV_CONFIG = {
  USER: {
    navClass: 'st-nav--user',
    roleBadge: null,
    links: [
      { label: 'Home',         path: '/dashboard' },
      { label: 'Borrow Items', path: '/borrow-items' },
      { label: 'My Books',     path: '/my-books' },
    ],
    settingsPath: '/settings',
  },
  LIBRARIAN: {
    navClass: 'st-nav--librarian',
    roleBadge: 'Librarian',
    links: [
      { label: 'Dashboard',      path: '/librarian/dashboard' },
      { label: 'Manage Books',   path: '/librarian/manage-books' },
      { label: 'Borrow Requests', path: '/librarian/borrow-requests' },
    ],
    settingsPath: '/librarian/settings',
  },
  ADMIN: {
    navClass: 'st-nav--admin',
    roleBadge: 'Admin',
    links: [
      { label: 'Dashboard',    path: '/admin/dashboard' },
      { label: 'Manage Users', path: '/admin/manage-users' },
    ],
    settingsPath: '/admin/settings',
  },
};

/* ───────── PASSWORD STRENGTH ───────── */
function getPasswordStrength(pw) {
  if (!pw) return { level: 0, label: '' };
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw))   score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { level: 1, label: 'Weak' };
  if (score === 2) return { level: 2, label: 'Fair' };
  if (score === 3) return { level: 3, label: 'Good' };
  return { level: 4, label: 'Strong' };
}
const strengthClass = ['', 'weak', 'fair', 'good', 'strong'];

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Personal info form
  const [firstName, setFirstName]   = useState('');
  const [lastName, setLastName]     = useState('');
  const [email, setEmail]           = useState('');
  const [phone, setPhone]           = useState('');
  const [about, setAbout]           = useState('');

  // Change password form
  const [currentPassword, setCurrentPassword]     = useState('');
  const [newPassword, setNewPassword]             = useState('');
  const [confirmPassword, setConfirmPassword]     = useState('');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) { navigate('/login'); return; }
    setUser(userData);

    // Pre-fill fields from stored user data
    const nameParts = (userData.fullName || userData.name || '').split(' ');
    setFirstName(nameParts[0] || '');
    setLastName(nameParts.slice(1).join(' ') || '');
    setEmail(userData.email || '');
    setPhone(userData.phone || '');
    setAbout(userData.about || '');
  }, [navigate]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const cfg = NAV_CONFIG[user?.role] || NAV_CONFIG.USER;

  /* ───────── HANDLERS ───────── */
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      // Save profile changes
      await ApiService.users.updateProfile({
        fullName,
        phone,
        about,
      });

      // Update localStorage
      const updated = { ...user, fullName, phone, about };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);

      showToast('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to update profile.';
      showToast(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }
    setSaving(true);
    try {
      // Update password
      await ApiService.users.changePassword({
        currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password changed successfully!');
    } catch (err) {
      console.error('Error changing password:', err);
      const errorMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to change password.';
      showToast(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Request account deletion
      await ApiService.users.deleteAccount();
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
    } catch (err) {
      console.error('Error deleting account:', err);
      showToast('Failed to delete account.', 'error');
      setShowDeleteModal(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const pwStrength = getPasswordStrength(newPassword);

  if (!user) {
    return (
      <div className="st-loading-screen">
        <div className="st-spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="st-wrapper">
      {/* ────────── NAVBAR ────────── */}
      {user.role === 'ADMIN' && <AdminNavbar />}
      {user.role === 'LIBRARIAN' && <LibrarianNavbar />}
      {(user.role === 'USER' || !user.role) && <UserNavbar />}

      {/* ────────── MAIN ────────── */}
      <main className="st-main">
        <div className="st-page-header">
          <h1 className="st-page-title">Settings</h1>
          <p className="st-page-subtitle">Manage your account preferences</p>
        </div>

        {/* Tab Bar */}
        <div className="st-tabs">
          <button
            className={`st-tab ${activeTab === 'personal' ? 'st-tab--active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            Personal Information
          </button>
          <button
            className={`st-tab ${activeTab === 'password' ? 'st-tab--active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            Change Password
          </button>
        </div>

        {/* ═══ PERSONAL INFORMATION ═══ */}
        {activeTab === 'personal' && (
          <form onSubmit={handleSaveProfile}>
            <div className="st-card">
              <h2 className="st-card-title">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                Personal Information
              </h2>

              {/* Avatar */}
              <div className="st-avatar-section">
                <div className="st-avatar">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                  </svg>
                </div>
                <div className="st-avatar-info">
                  <h3>{user.fullName || user.name || 'User'}</h3>
                  <p>{email}</p>
                  <span className={`st-avatar-role role-${(user.role || 'user').toLowerCase()}`}>
                    {user.role || 'USER'}
                  </span>
                </div>
              </div>

              {/* Name */}
              <div className="st-form-row">
                <div className="st-form-group">
                  <label htmlFor="st-firstName">First Name</label>
                  <input
                    id="st-firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                  />
                </div>
                <div className="st-form-group">
                  <label htmlFor="st-lastName">Last Name</label>
                  <input
                    id="st-lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="st-form-row st-form-row--full">
                <div className="st-form-group">
                  <label htmlFor="st-email">Email Address</label>
                  <input
                    id="st-email"
                    type="email"
                    value={email}
                    disabled
                    title="Email cannot be changed"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="st-form-row st-form-row--full">
                <div className="st-form-group">
                  <label htmlFor="st-phone">Phone Number</label>
                  <input
                    id="st-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number (optional)"
                  />
                </div>
              </div>

              {/* About */}
              <div className="st-form-row st-form-row--full">
                <div className="st-form-group">
                  <label htmlFor="st-about">About</label>
                  <textarea
                    id="st-about"
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="Tell us a bit about yourself..."
                  />
                </div>
              </div>

              <div className="st-btn-row">
                <button type="submit" className="st-btn st-btn--primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="st-btn st-btn--secondary"
                  onClick={() => {
                    const nameParts = (user.fullName || user.name || '').split(' ');
                    setFirstName(nameParts[0] || '');
                    setLastName(nameParts.slice(1).join(' ') || '');
                    setPhone(user.phone || '');
                    setAbout(user.about || '');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ═══ CHANGE PASSWORD ═══ */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword}>
            <div className="st-card">
              <h2 className="st-card-title">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/></svg>
                Change Password
              </h2>

              <div className="st-form-row st-form-row--full">
                <div className="st-form-group">
                  <label htmlFor="st-currentPw">Current Password</label>
                  <input
                    id="st-currentPw"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                </div>
              </div>

              <div className="st-form-row st-form-row--full">
                <div className="st-form-group">
                  <label htmlFor="st-newPw">New Password</label>
                  <input
                    id="st-newPw"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                  {newPassword && (
                    <>
                      <div className="st-password-strength">
                        {[1,2,3,4].map(i => (
                          <div
                            key={i}
                            className={`st-strength-bar ${i <= pwStrength.level ? `active ${strengthClass[pwStrength.level]}` : ''}`}
                          />
                        ))}
                      </div>
                      <span className={`st-strength-label ${strengthClass[pwStrength.level]}`}>
                        {pwStrength.label}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="st-form-row st-form-row--full">
                <div className="st-form-group">
                  <label htmlFor="st-confirmPw">Confirm New Password</label>
                  <input
                    id="st-confirmPw"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                  />
                </div>
              </div>

              <div className="st-btn-row">
                <button type="submit" className="st-btn st-btn--primary" disabled={saving}>
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ═══ DELETE ACCOUNT ═══ */}
        <div className="st-card st-danger-zone">
          <h2 className="st-card-title">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            Danger Zone
          </h2>
          <div className="st-danger-info">
            <div className="st-danger-text">
              <h4>Delete Account</h4>
              <p>Permanently remove your account and all data. This action cannot be undone.</p>
            </div>
            <button className="st-delete-btn" onClick={() => setShowDeleteModal(true)}>
              Delete
            </button>
          </div>
        </div>
      </main>

      {/* ───── Delete confirmation modal ───── */}
      {showDeleteModal && (
        <div className="st-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="st-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Account?</h3>
            <p>
              This will permanently delete your account, borrowing history, and all associated data.
              This action <strong>cannot be undone</strong>.
            </p>
            <div className="st-modal-actions">
              <button className="st-btn st-btn--secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="st-btn st-btn--primary" style={{ background: '#c62828' }} onClick={handleDeleteAccount}>
                Yes, Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───── Toast notification ───── */}
      {toast && (
        <div className={`st-toast st-toast--${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
