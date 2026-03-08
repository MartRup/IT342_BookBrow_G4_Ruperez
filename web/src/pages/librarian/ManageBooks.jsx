import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ManageBooks.css';

const EMPTY_FORM = { title: '', author: '', isbn: '', genre: '', description: '', coverUrl: '' };

export default function ManageBooks() {
  const [user, setUser]         = useState(null);
  const [books, setBooks]       = useState([]);
  const [search, setSearch]     = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editBook, setEditBook]   = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) { navigate('/login'); return; }
    if (userData.role !== 'LIBRARIAN') { navigate('/dashboard'); return; }
    setUser(userData);
    fetchBooks();
  }, [navigate]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/v1/books');
      setBooks(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
      setBooks([]);
    } finally { setLoading(false); }
  };

  const openAdd  = ()     => { setEditBook(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (book) => { setEditBook(book); setForm({ title: book.title, author: book.author, isbn: book.isbn || '', genre: book.genre || '', description: book.description || '', coverUrl: book.coverUrl || '' }); setShowModal(true); };
  const closeModal = ()   => { setShowModal(false); setEditBook(null); setForm(EMPTY_FORM); };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editBook) {
        await axios.put(`/api/v1/books/${editBook.id}`, form);
      } else {
        await axios.post('/api/v1/books', form);
      }
      closeModal();
      fetchBooks();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book?')) return;
    try { await axios.delete(`/api/v1/books/${id}`); fetchBooks(); }
    catch (e) { console.error(e); }
  };

  const handleLogout = () => { localStorage.removeItem('user'); localStorage.removeItem('token'); navigate('/login'); };

  const filtered = books.filter(b =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="mb2-loading"><div className="mb2-spinner" /><p>Loading books...</p></div>;

  return (
    <div className="mb2-wrapper">
      <nav className="mb2-nav">
        <div className="mb2-nav-brand">
          <div className="mb2-logo-circle"><svg viewBox="0 0 24 24" fill="white"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg></div>
          <span className="mb2-brand-name">BookBrow</span>
          <span className="mb2-role-badge">Librarian</span>
        </div>
        <div className="mb2-nav-links">
          <a className="mb2-nav-link" onClick={() => navigate('/librarian/dashboard')}>Dashboard</a>
          <a className="mb2-nav-link mb2-nav-active" onClick={() => navigate('/librarian/manage-books')}>Manage Books</a>
          <a className="mb2-nav-link" onClick={() => navigate('/librarian/borrow-requests')}>Borrow Requests</a>
        </div>
        <div className="mb2-nav-right">
          <span className="mb2-username">{user?.fullName || 'Librarian'}</span>
          <button className="mb2-logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <main className="mb2-main">
        <div className="mb2-header-row">
          <div>
            <h1 className="mb2-title">Manage Books</h1>
            <p className="mb2-sub">Add, edit or remove books from the library</p>
          </div>
          <button className="mb2-add-btn" onClick={openAdd}>+ Add Book</button>
        </div>

        <div className="mb2-search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search by title or author..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="mb2-table-wrap">
          <table className="mb2-table">
            <thead><tr><th>Title</th><th>Author</th><th>ISBN</th><th>Genre</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="mb2-empty">No books found</td></tr>
              ) : filtered.map(b => (
                <tr key={b.id}>
                  <td className="mb2-book-title">{b.title}</td>
                  <td>{b.author}</td>
                  <td>{b.isbn || '—'}</td>
                  <td>{b.genre || '—'}</td>
                  <td><span className={`mb2-status ${(b.status || 'available').toLowerCase()}`}>{b.status || 'Available'}</span></td>
                  <td className="mb2-row-actions">
                    <button className="mb2-edit-btn" onClick={() => openEdit(b)}>Edit</button>
                    <button className="mb2-del-btn"  onClick={() => handleDelete(b.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="mb2-overlay" onClick={closeModal}>
          <div className="mb2-modal" onClick={e => e.stopPropagation()}>
            <h2 className="mb2-modal-title">{editBook ? 'Edit Book' : 'Add New Book'}</h2>
            <form onSubmit={handleSave} className="mb2-form">
              {[
                { name: 'title',       label: 'Title',       required: true },
                { name: 'author',      label: 'Author',      required: true },
                { name: 'isbn',        label: 'ISBN',        required: false },
                { name: 'genre',       label: 'Genre',       required: false },
                { name: 'coverUrl',    label: 'Cover URL',   required: false },
              ].map(f => (
                <div key={f.name} className="mb2-form-group">
                  <label>{f.label}</label>
                  <input type="text" value={form[f.name]} onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))} required={f.required} />
                </div>
              ))}
              <div className="mb2-form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} />
              </div>
              <div className="mb2-modal-actions">
                <button type="button" className="mb2-cancel-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="mb2-save-btn" disabled={saving}>{saving ? 'Saving...' : 'Save Book'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
