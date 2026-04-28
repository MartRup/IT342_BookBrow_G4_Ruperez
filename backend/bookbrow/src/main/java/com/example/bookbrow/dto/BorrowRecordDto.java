package com.example.bookbrow.dto;

import com.example.bookbrow.entity.BorrowRecord;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * Flat DTO for borrow record responses.
 * Avoids exposing lazy-loaded entities and adds computed fields
 * (status, daysLeft) that the frontend needs.
 */
@Data
@Builder
public class BorrowRecordDto {

    private Long id;

    // Book info (flattened)
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private String bookCoverUrl;

    // User info (flattened)
    private Long userId;
    private String userEmail;
    private String userFullName;

    // Dates
    private LocalDateTime borrowDate;
    private LocalDateTime dueDate;
    private LocalDateTime returnDate;

    // Computed
    private String status;   // "ACTIVE" | "OVERDUE" | "RETURNED"
    private long daysLeft;   // positive = days remaining, negative = days overdue

    /** Factory method: map a BorrowRecord entity → BorrowRecordDto */
    public static BorrowRecordDto from(BorrowRecord record) {
        String status;
        long daysLeft = 0;

        if (record.getReturnDate() != null) {
            status = "RETURNED";
        } else {
            LocalDateTime due = record.getDueDate() != null
                    ? record.getDueDate()
                    : record.getBorrowDate().plusDays(14);
            daysLeft = ChronoUnit.DAYS.between(LocalDateTime.now(), due);
            status = daysLeft < 0 ? "OVERDUE" : "ACTIVE";
        }

        return BorrowRecordDto.builder()
                .id(record.getId())
                .bookId(record.getBook() != null ? record.getBook().getId() : null)
                .bookTitle(record.getBook() != null ? record.getBook().getTitle() : null)
                .bookAuthor(record.getBook() != null ? record.getBook().getAuthor() : null)
                .bookCoverUrl(record.getBook() != null ? record.getBook().getCoverUrl() : null)
                .userId(record.getUser() != null ? record.getUser().getId() : null)
                .userEmail(record.getUser() != null ? record.getUser().getEmail() : null)
                .userFullName(record.getUser() != null ? record.getUser().getFullName() : null)
                .borrowDate(record.getBorrowDate())
                .dueDate(record.getDueDate())
                .returnDate(record.getReturnDate())
                .status(status)
                .daysLeft(daysLeft)
                .build();
    }
}
