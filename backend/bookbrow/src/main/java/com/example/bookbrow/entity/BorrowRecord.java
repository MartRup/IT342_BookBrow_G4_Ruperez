package com.example.bookbrow.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "borrow_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BorrowRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(name = "borrow_date", nullable = false)
    private LocalDateTime borrowDate;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "return_date")
    private LocalDateTime returnDate;

    // Librarian/Admin who processed the return
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private User processedBy;

    // Status: PENDING, APPROVED, RETURNED, REJECTED
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private BorrowStatus status = BorrowStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum BorrowStatus {
        PENDING,    // User requested, waiting for librarian approval
        APPROVED,   // Librarian approved, book is borrowed
        RETURNED,   // Book has been returned
        REJECTED    // Librarian rejected the request
    }

    @PrePersist
    protected void onCreate() {
        if (borrowDate == null) borrowDate = LocalDateTime.now();
        if (dueDate == null)   dueDate = borrowDate.plusDays(14);
        if (status == null)    status = BorrowStatus.PENDING;
    }

    public boolean isActive() {
        return status == BorrowStatus.APPROVED && returnDate == null;
    }
}
