import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../../config';
import ApiService from '../../services/ApiService';
import AdminNavbar from './AdminNavbar';
import '../librarian/ManageBooks.css'; // Reusing librarian's CSS

const EMPTY_FORM = { title: '', author: '', isbn: '', genre: '', description: '', coverUrl: '', available: true };

export default function AdminManageBooks() {
  const [user, setUser] = useState({});
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [googleQuery, setGoogleQuery] = useState('');
  const [googleResults, setGoogleResults] = useState([]);
  const [searchingGoogle, setSearchingGoogle] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const [bookToDelete, setBookToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) { navigate('/login'); return; }
    if (userData.role !== 'ADMIN') { navigate('/dashboard'); return; }
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
      
      console.log('=== ADMIN MANAGE BOOKS - API Response ===');
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
      available: book.available !== false
    }); 
    setShowModal(true); 
  };
  const closeModal = () => { 
    setShowModal(false); 
    setEditBook(null); 
    setForm(EMPTY_FORM); 
    setGoogleQuery('');
    setGoogleResults([]);
  };

  const searchGoogleBooks = async () => {
    if (!googleQuery.trim()) return;
    setSearchingGoogle(true);
    setGoogleError('');
    setGoogleResults([]);
    try {
      console.log('🔍 Searching Google Books for:', googleQuery);
      // Use backend as proxy to avoid CORS issues
      const res = await fetch(getApiUrl(`/api/v1/books/search/external?q=${encodeURIComponent(googleQuery)}`), {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
        
      console.log('📡 Backend response status:', res.status);
        
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('❌ Backend error:', res.status, errorData);
          
        // Check for rate limit
        if (res.status === 429 || (errorData.error && errorData.error.code === 'GOOGLE-001')) {
          throw new Error(errorData.error?.message || 'Google Books API quota exceeded. Please wait a few minutes and try again.');
        }
          
        throw new Error(errorData.error?.message || `Backend error: ${res.status}`);
      }
        
      const data = await res.json();
      console.log('✅ Google Books response:', data);
        
      if (!data.items || data.items.length === 0) {
        setGoogleError('No results found for your search. Try a different term.');
        setGoogleResults([]);
      } else {
        console.log(`📚 Found ${data.items.length} book(s)`);
        setGoogleResults(data.items);
      }
    } catch (e) {
      console.error('❌ Google Books search failed:', e);
      if (e.message.includes('Failed to fetch') || e.name === 'TypeError') {
        setGoogleError('Cannot connect to backend. Please ensure the API URL is configured correctly.');
      } else {
        setGoogleError(e.message || 'Failed to search Google Books.');
      }
      setGoogleResults([]);
    } finally {
      setSearchingGoogle(false);
    }
  };

  const selectGoogleBook = (bookItem) => {
    const info = bookItem.volumeInfo;
    setForm(prev => ({
      ...prev,
      title: info.title || '',
      author: info.authors ? info.authors.join(', ') : '',
      isbn: info.industryIdentifiers ? info.industryIdentifiers.find(id => id.type === 'ISBN_13' || id.type === 'ISBN_10')?.identifier || '' : '',
      genre: info.categories ? info.categories[0] : '',
      description: info.description || '',
      coverUrl: info.imageLinks?.thumbnail?.replace('http:', 'https:') || ''
    }));
    setGoogleResults([]);
    setGoogleQuery('');
  };

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
      // Trigger dashboard refresh
      window.dispatchEvent(new CustomEvent('dashboardRefresh'));
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    setDeleteError('');
    try { 
      await ApiService.books.delete(id); 
      setBookToDelete(null);
      fetchBooks(); 
      // Trigger dashboard refresh
      window.dispatchEvent(new CustomEvent('dashboardRefresh'));
    }
    catch (e) { 
      console.error(e);
      setDeleteError('Failed to delete. ' + (e.response?.data?.message || 'Please try again.'));
    }
  };

  const filtered = books.filter(b =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase()) ||
    b.isbn?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="mb-loading"><div className="mb-spinner" /><p>Loading books...</p></div>;

  return (
    <div className="mb-page">
      <AdminNavbar />

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
                <th>Status</th>
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
                  <td>
                    <span style={{
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.85em', 
                      fontWeight: 'bold', 
                      backgroundColor: b.available ? '#d4edda' : '#f8d7da', 
                      color: b.available ? '#155724' : '#721c24'
                    }}>
                      {b.available ? 'Available' : 'Borrowed'}
                    </span>
                  </td>
                  <td className="mb-actions-cell">
                    <button className="mb-icon-btn" onClick={() => openEdit(b)} title="Edit">
                      <svg viewBox="0 0 24 24" fill="#111" width="20" height="20">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                    </button>
                    <button className="mb-icon-btn mb-del-icon" onClick={() => setBookToDelete(b)} title="Delete">
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
        
        <div className="mb-footer-text">
          Showing {filtered.length} of {books.length} books
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="mb-overlay" onClick={closeModal}>
          <div className="mb-modal" onClick={e => e.stopPropagation()}>
            <h2 className="mb-modal-title">{editBook ? 'Edit Book' : 'Add New Book'}</h2>
            
            {!editBook && (
              <div className="mb-google-search" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Search Google Books (e.g. ISBN or Title) to auto-fill..." 
                    value={googleQuery} 
                    onChange={e => setGoogleQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), searchGoogleBooks())}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-primary)' }}
                  />
                  <button type="button" onClick={searchGoogleBooks} disabled={searchingGoogle} className="mb-save-btn" style={{ padding: '0 20px' }}>
                    {searchingGoogle ? 'Searching...' : 'Search'}
                  </button>
                </div>
                {googleError && <div style={{ color: 'red', fontSize: '12px', marginBottom: '10px' }}>{googleError}</div>}
                {googleResults.length > 0 && (
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--card-bg)' }}>
                    {googleResults.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => selectGoogleBook(item)} 
                        style={{ padding: '10px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', gap: '15px', alignItems: 'center' }}
                        onMouseOver={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {item.volumeInfo?.imageLinks?.smallThumbnail ? (
                          <img src={item.volumeInfo.imageLinks.smallThumbnail} alt="cover" style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                        ) : (
                          <div style={{ width: '40px', height: '60px', background: 'var(--bg-secondary)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                          </div>
                        )}
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>{item.volumeInfo?.title}</strong><br/>
                          <small style={{ color: 'var(--text-secondary)' }}>{item.volumeInfo?.authors?.join(', ')}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSave} className="mb-form">
              {[
                { name: 'title',       label: 'Title',       required: true,  type: 'text' },
                { name: 'author',      label: 'Author',      required: true,  type: 'text' },
                { name: 'isbn',        label: 'ISBN',        required: false, type: 'text' },
                { name: 'genre',       label: 'Category',    required: false, type: 'text' },
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

      {bookToDelete && (
        <div className="mb-overlay" onClick={() => setBookToDelete(null)}>
          <div className="mb-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', padding: '30px' }}>
            <h2 className="mb-modal-title" style={{ textAlign: 'center', marginBottom: '20px' }}>Confirm Deletion</h2>
            <div className="mb-modal-body" style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
                Are you sure you want to delete <br />
                <strong style={{ color: 'var(--text-primary)', fontSize: '18px', display: 'inline-block', marginTop: '10px' }}>"{bookToDelete.title}"</strong>?
              </p>
              <p style={{ fontSize: '14px', color: '#dc3545', marginTop: '15px' }}>
                This action cannot be undone.
              </p>
              {deleteError && (
                <p style={{ fontSize: '14px', color: '#dc3545', marginTop: '10px', fontWeight: 'bold', background: '#fff5f5', padding: '10px', borderRadius: '8px' }}>
                  {deleteError}
                </p>
              )}
            </div>
            <div className="mb-modal-actions" style={{ justifyContent: 'center', marginTop: '30px', borderTop: 'none', paddingTop: '0' }}>
              <button className="mb-cancel-btn" onClick={() => setBookToDelete(null)}>Cancel</button>
              <button className="mb-save-btn" style={{ background: '#dc3545', boxShadow: 'none' }} onClick={() => handleDelete(bookToDelete.id)}>Delete Book</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
