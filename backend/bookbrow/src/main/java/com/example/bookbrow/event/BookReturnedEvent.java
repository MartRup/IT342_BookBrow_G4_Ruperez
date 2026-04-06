package com.example.bookbrow.event;

import com.example.bookbrow.entity.Book;
import com.example.bookbrow.entity.BorrowRecord;
import com.example.bookbrow.entity.User;
import org.springframework.context.ApplicationEvent;

/**
 * Event published when a book is returned to the library.
 */
public class BookReturnedEvent extends ApplicationEvent {

    private final BorrowRecord borrowRecord;
    private final User processedBy;
    private final Book book;

    public BookReturnedEvent(Object source, BorrowRecord borrowRecord, User processedBy, Book book) {
        super(source);
        this.borrowRecord = borrowRecord;
        this.processedBy = processedBy;
        this.book = book;
    }

    public BorrowRecord getBorrowRecord() {
        return borrowRecord;
    }

    public User getProcessedBy() {
        return processedBy;
    }

    public Book getBook() {
        return book;
    }
}
