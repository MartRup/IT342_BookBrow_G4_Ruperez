package com.example.bookbrow.shared.event;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Listener for borrowing-related events (Observer Pattern).
 */
@Slf4j
@Component
public class BorrowEventListener {

    @EventListener
    public void handleBookBorrowed(BookBorrowedEvent event) {
        log.info("[EVENT] Book borrowed — bookId={}, title='{}', userId={}, borrowDate={}",
                event.getBook().getId(),
                event.getBook().getTitle(),
                event.getUser().getId(),
                event.getBorrowRecord().getBorrowDate());
    }

    @EventListener
    public void handleBookReturned(BookReturnedEvent event) {
        log.info("[EVENT] Book returned — bookId={}, title='{}', processedBy={}, returnDate={}",
                event.getBook().getId(),
                event.getBook().getTitle(),
                event.getProcessedBy().getEmail(),
                event.getBorrowRecord().getReturnDate());
    }
}
