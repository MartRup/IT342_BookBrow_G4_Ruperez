import React from 'react';
import SuspendedBorrowButton from './SuspendedBorrowButton';
import './BookDetailsModal.css';

export default function BookDetailsModal({
  book,
  onClose,
  onBorrow,
  borrowing,
  isSuspended = false,
  formattedTime = '',
  suspensionReason = '',
}) {
  if (!book) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="bdm-backdrop" onClick={handleBackdropClick}>
      <div className="bdm-modal">
        <button className="bdm-close-btn" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="bdm-content">
          <div className="bdm-cover-section">
            {book.coverUrl ? (
              <img 
                src={book.coverUrl} 
                alt={book.title} 
                className="bdm-cover-image"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="bdm-cover-placeholder">
                <svg viewBox="0 0 24 24" fill="#999" width="64" height="64">
                  <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h2v8l2.5-1.5L13 12V4h5v16z"/>
                </svg>
              </div>
            )}
            
            <span className={`bdm-status-badge ${(book.status || 'available').toLowerCase()}`}>
              {book.status || 'Available'}
            </span>
          </div>

          <div className="bdm-details-section">
            <h2 className="bdm-title">{book.title}</h2>
            <p className="bdm-author">by {book.author}</p>

            <div className="bdm-meta">
              {book.genre && (
                <div className="bdm-meta-item">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span>{book.genre}</span>
                </div>
              )}
              {book.isbn && (
                <div className="bdm-meta-item">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                  </svg>
                  <span>ISBN: {book.isbn}</span>
                </div>
              )}
            </div>

            <div className="bdm-description">
              <h3>Description</h3>
              <p>{book.description || 'No description available for this book.'}</p>
            </div>

            <div className="bdm-actions">
              <button 
                className="bdm-btn bdm-btn-secondary" 
                onClick={onClose}
              >
                Close
              </button>
              <SuspendedBorrowButton
                isSuspended={isSuspended}
                formattedTime={formattedTime}
                suspensionReason={suspensionReason}
                isBookBorrowed={book.status?.toLowerCase() === 'borrowed'}
                isBorrowing={borrowing}
                onClick={() => onBorrow(book)}
                className="bdm-btn bdm-btn-primary"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
