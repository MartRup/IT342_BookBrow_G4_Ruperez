package com.example.bookbrow.event;

import com.example.bookbrow.entity.Book;
import com.example.bookbrow.entity.BorrowRecord;
import com.example.bookbrow.entity.User;
import org.springframework.context.ApplicationEvent;

/**
 * Event published when a user borrows a book.
 * Contains all relevant context about the borrowing transaction.
 */
public class BookBorrowedEvent extends ApplicationEvent {

    private final BorrowRecord borrowRecord;
    private final User user;
    private final Book book;

    public BookBorrowedEvent(Object source, BorrowRecord borrowRecord, User user, Book book) {
        super(source);
        this.borrowRecord = borrowRecord;
        this.user = user;
        this.book = book;
    }

    public BorrowRecord getBorrowRecord() {
        return borrowRecord;
    }

    public User getUser() {
        return user;
    }

    public Book getBook() {
        return book;
    }
}
