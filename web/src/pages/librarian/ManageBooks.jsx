import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/ApiService';
import LibrarianNavbar from './LibrarianNavbar';
import './ManageBooks.css';

const EMPTY_FORM = { title: '', author: '', isbn: '', genre: '', description: '', coverUrl: '', totalCopies: 1, availableCopies: 1 };

export default function ManageBooks() {
  const [user, setUser] = useState({});
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) { navigate('/login'); return; }
    if (userData.role !== 'LIBRARIAN') { navigate('/dashboard'); return; }
    setUser(userData);
    
    // Initialize theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    console.log('Theme initialized to:', savedTheme);
    
    fetchBooks();
  }, [navigate]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await ApiService.books.getAll({ limit: 200 });
      
      console.log('=== LIBRARIAN MANAGE BOOKS - API Response ===');
      console.log('Full response:', res);
      console.log('res.data:', res.data);
      console.log('res.data.data:', res.data?.data);
      console.log('res.data.data.books:', res.data?.data?.books);
      
      // Try multiple paths to extract books array
      let booksData = [];
      if (res.data?.data?.books && Array.isArray(res.data.data.books)) {
        booksData = res.data.data.books;
        console.log('✅ Found books at: res.data.data.books');
      } else if (res.data?.books && Array.isArray(res.data.books)) {
        booksData = res.data.books;
        console.log('✅ Found books at: res.data.books');
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        booksData = res.data.data;
        console.log('✅ Found books at: res.data.data');
      } else if (Array.isArray(res.data)) {
        booksData = res.data;
        console.log('✅ Found books at: res.data');
      }
      
      console.log('Extracted books array:', booksData);
      console.log('Number of books:', booksData.length);
      
      setBooks(booksData);
    } catch (e) {
      console.error('❌ Error fetching books:', e);
      console.error('Error details:', e.response?.data || e.message);
      setBooks([]);
    } finally { setLoading(false); }
  };

  const openAdd = () => { setEditBook(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (book) => { 
    setEditBook(book); 
    setForm({ 
      title: book.title, 
      author: book.author, 
      isbn: book.isbn || '', 
      genre: book.genre || '', 
      description: book.description || '', 
      coverUrl: book.coverUrl || '',
      totalCopies: book.totalCopies || 1,
      availableCopies: book.availableCopies || 1
    }); 
    setShowModal(true); 
  };
  const closeModal = () => { setShowModal(false); setEditBook(null); setForm(EMPTY_FORM); };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editBook) {
        await ApiService.books.update(editBook.id, form);
      } else {
        await ApiService.books.create(form);
      }
      closeModal();
      fetchBooks();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book?')) return;
    try { await ApiService.books.delete(id); fetchBooks(); }
    catch (e) { console.error(e); }
  };

  const filtered = books.filter(b =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase()) ||
    b.isbn?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="mb-loading"><div className="mb-spinner" /><p>Loading books...</p></div>;

  return (
    <div className="mb-page">
      <LibrarianNavbar />

      <main className="mb-content">
        <div className="mb-header">
          <div className="mb-header-content">
            <h1 className="mb-title">Books Management</h1>
            <p className="mb-sub">Manage Library inventory and book information</p>
          </div>
        </div>

        <div className="mb-action-bar">
          <div className="mb-search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input 
              type="text" 
              placeholder="Search Books by title or author..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <button className="mb-add-btn" onClick={openAdd}>
            <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Add Book
          </button>
        </div>

        <div className="mb-table-container">
          <table className="mb-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Category</th>
                <th>Total</th>
                <th>Available</th>
                <th className="mb-center-text">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="mb-empty">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                      </svg>
                      <h3>No books found</h3>
                      <p>There are currently no books in the library. Add your first book to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((b, i) => (
                <tr key={b.id || i}>
                  <td>{b.title}</td>
                  <td>{b.author}</td>
                  <td>{b.isbn || '—'}</td>
                  <td>{b.genre || '—'}</td>
                  <td>{b.totalCopies || 0}</td>
                  <td>{b.availableCopies || 0}</td>
                  <td className="mb-actions-cell">
                    <button className="mb-icon-btn" onClick={() => openEdit(b)} title="Edit">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                    </button>
                    <button className="mb-icon-btn mb-del-icon" onClick={() => handleDelete(b.id)} title="Delete">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mb-footer-text">
          Showing {filtered.length} of {books.length} books
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="mb-overlay" onClick={closeModal}>
          <div className="mb-modal" onClick={e => e.stopPropagation()}>
            <h2 className="mb-modal-title">{editBook ? 'Edit Book' : 'Add New Book'}</h2>
            <form onSubmit={handleSave} className="mb-form">
              {[
                { name: 'title',       label: 'Title',       required: true,  type: 'text' },
                { name: 'author',      label: 'Author',      required: true,  type: 'text' },
                { name: 'isbn',        label: 'ISBN',        required: false, type: 'text' },
                { name: 'genre',       label: 'Category',    required: false, type: 'text' },
                { name: 'totalCopies', label: 'Total Copies', required: false, type: 'number' },
                { name: 'availableCopies', label: 'Available Copies', required: false, type: 'number' },
                { name: 'coverUrl',    label: 'Cover URL',   required: false, type: 'text' },
              ].map(f => (
                <div key={f.name} className="mb-form-group">
                  <label>{f.label}</label>
                  <input type={f.type} value={form[f.name]} onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))} required={f.required} />
                </div>
              ))}
              <div className="mb-form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} />
              </div>
              <div className="mb-modal-actions">
                <button type="button" className="mb-cancel-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="mb-save-btn" disabled={saving}>{saving ? 'Saving...' : 'Save Book'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
