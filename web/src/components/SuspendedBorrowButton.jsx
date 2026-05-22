import React from 'react';
import './SuspendedBorrowButton.css';

/**
 * Drop-in replacement for the "Request to Borrow" button.
 *
 * Props:
 *   isSuspended      – boolean
 *   formattedTime    – e.g. "2d 3h 15m 4s"
 *   suspensionReason – string
 *   isBookBorrowed   – boolean (book already checked out)
 *   isBorrowing      – boolean (request in-flight)
 *   onClick          – handler for the normal borrow action
 *   className        – optional extra class for the button
 */
export default function SuspendedBorrowButton({
  isSuspended,
  formattedTime,
  suspensionReason,
  isBookBorrowed,
  isBorrowing,
  onClick,
  className = '',
}) {
  if (isSuspended) {
    return (
      <div className="sbb-suspended-wrap">
        <button className={`sbb-btn sbb-btn-suspended ${className}`} disabled>
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          Suspended
        </button>
        <div className="sbb-cooldown-badge">
          <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
          </svg>
          <span>{formattedTime}</span>
        </div>
        {suspensionReason && (
          <p className="sbb-reason">Reason: {suspensionReason}</p>
        )}
      </div>
    );
  }

  return (
    <button
      className={`sbb-btn sbb-btn-normal ${className}`}
      onClick={onClick}
      disabled={isBookBorrowed || isBorrowing}
    >
      {isBorrowing ? 'Requesting...' : 'Request to Borrow'}
    </button>
  );
}
