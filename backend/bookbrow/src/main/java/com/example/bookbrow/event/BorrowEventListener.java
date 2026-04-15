package com.example.bookbrow.event;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Listener for borrowing-related events.
 * Handles logging and other side-effects asynchronously.
 */
@Slf4j
@Component
public class BorrowEventListener {

    /**
     * Handles book borrowed events — logs the activity.
     * In a production system, this could also:
     *  - Send email notifications
     *  - Update analytics dashboards
     *  - Trigger due-date reminders
     */
    @EventListener
    public void handleBookBorrowed(BookBorrowedEvent event) {
        log.info("[EVENT] Book borrowed — bookId={}, title='{}', userId={}, borrowDate={}",
                event.getBook().getId(),
                event.getBook().getTitle(),
                event.getUser().getId(),
                event.getBorrowRecord().getBorrowDate());
    }

    /**
     * Handles book returned events — logs the activity.
     * In a production system, this could:
     *  - Notify waitlisted users
     *  - Calculate late fees
     *  - Update return statistics
     */
    @EventListener
    public void handleBookReturned(BookReturnedEvent event) {
        log.info("[EVENT] Book returned — bookId={}, title='{}', processedBy={}, returnDate={}",
                event.getBook().getId(),
                event.getBook().getTitle(),
                event.getProcessedBy().getEmail(),
                event.getBorrowRecord().getReturnDate());
    }
}
