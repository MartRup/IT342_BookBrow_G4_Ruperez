package com.example.bookbrow.feature.borrow.service;

import com.example.bookbrow.feature.borrow.dto.BorrowRecordDto;
import com.example.bookbrow.shared.dto.ResponseBuilder;
import com.example.bookbrow.feature.borrow.entity.BorrowRecord;
import com.example.bookbrow.feature.users.entity.User;
import com.example.bookbrow.shared.event.BookBorrowedEvent;
import com.example.bookbrow.shared.event.BookReturnedEvent;
import com.example.bookbrow.feature.books.repository.BookRepository;
import com.example.bookbrow.feature.borrow.repository.BorrowRecordRepository;
import com.example.bookbrow.feature.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BorrowService {

    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public ResponseEntity<?> borrowBook(Long bookId, Authentication auth) {
        User user = (User) auth.getPrincipal();

        // Check if user is suspended from borrowing
        if (user.isBorrowSuspended()) {
            long remainingSeconds = user.getSuspensionRemainingSeconds();
            return ResponseBuilder.badRequest("BORROW-008", 
                String.format("You are suspended from borrowing books. Suspension ends in %d seconds. Reason: %s", 
                    remainingSeconds, user.getSuspensionReason() != null ? user.getSuspensionReason() : "No reason provided"));
        }

        return bookRepository.findById(bookId)
                .<ResponseEntity<?>>map(book -> {
                    if (!book.getAvailable()) {
                        return ResponseBuilder.badRequest("BOOK-002", "Book is not available for borrowing");
                    }

                    boolean hasPendingRequest = borrowRecordRepository
                            .existsByUserAndBookAndStatus(user, book, BorrowRecord.BorrowStatus.PENDING);
                    
                    if (hasPendingRequest) {
                        return ResponseBuilder.badRequest("BORROW-004", "You already have a pending request for this book");
                    }

                    BorrowRecord record = BorrowRecord.builder()
                            .user(user)
                            .book(book)
                            .borrowDate(LocalDateTime.now())
                            .status(BorrowRecord.BorrowStatus.PENDING)
                            .build();

                    BorrowRecord saved = borrowRecordRepository.save(record);

                    return ResponseBuilder.created(Map.of("borrowRecord", Map.of(
                            "id", saved.getId(),
                            "bookId", book.getId(),
                            "bookTitle", book.getTitle(),
                            "userId", user.getId(),
                            "borrowDate", saved.getBorrowDate(),
                            "status", saved.getStatus().toString()
                    )));
                })
                .orElse(ResponseBuilder.notFound("BOOK-001", "Book not found"));
    }

    public ResponseEntity<?> getUserBorrows(String status, Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<BorrowRecord> records;

        if ("returned".equalsIgnoreCase(status)) {
            records = borrowRecordRepository.findByUserAndStatus(user, BorrowRecord.BorrowStatus.RETURNED);
        } else if ("active".equalsIgnoreCase(status)) {
            records = borrowRecordRepository.findByUserAndStatus(user, BorrowRecord.BorrowStatus.APPROVED);
        } else if ("pending".equalsIgnoreCase(status)) {
            records = borrowRecordRepository.findByUserAndStatus(user, BorrowRecord.BorrowStatus.PENDING);
        } else if ("rejected".equalsIgnoreCase(status)) {
            records = borrowRecordRepository.findByUserAndStatus(user, BorrowRecord.BorrowStatus.REJECTED);
        } else {
            records = borrowRecordRepository.findByUser(user);
        }

        List<BorrowRecordDto> dtos = records.stream().map(BorrowRecordDto::from).toList();
        return ResponseBuilder.ok(Map.of("borrowRecords", dtos));
    }

    public ResponseEntity<?> getAllBorrows(int page, int limit, String status) {
        var pageable = PageRequest.of(page - 1, limit);
        Page<BorrowRecord> recordPage;

        if ("returned".equalsIgnoreCase(status)) {
            recordPage = borrowRecordRepository.findByStatus(BorrowRecord.BorrowStatus.RETURNED, pageable);
        } else if ("active".equalsIgnoreCase(status)) {
            recordPage = borrowRecordRepository.findByStatus(BorrowRecord.BorrowStatus.APPROVED, pageable);
        } else if ("pending".equalsIgnoreCase(status)) {
            recordPage = borrowRecordRepository.findByStatus(BorrowRecord.BorrowStatus.PENDING, pageable);
        } else if ("rejected".equalsIgnoreCase(status)) {
            recordPage = borrowRecordRepository.findByStatus(BorrowRecord.BorrowStatus.REJECTED, pageable);
        } else {
            recordPage = borrowRecordRepository.findAll(pageable);
        }

        List<BorrowRecordDto> dtos = recordPage.getContent().stream().map(BorrowRecordDto::from).toList();
        return ResponseBuilder.ok(Map.of(
                "borrowRecords", dtos,
                "pagination", Map.of(
                        "page", page, "limit", limit,
                        "total", recordPage.getTotalElements(),
                        "pages", recordPage.getTotalPages()
                )
        ));
    }

    @Transactional
    public ResponseEntity<?> returnBook(Long borrowId, Authentication auth) {
        User caller = (User) auth.getPrincipal();

        return borrowRecordRepository.findById(borrowId)
                .<ResponseEntity<?>>map(record -> {
                    if (caller.getRole() == User.UserRole.USER
                            && !record.getUser().getId().equals(caller.getId())) {
                        return ResponseBuilder.badRequest("BORROW-003", "You can only return your own borrowed books");
                    }

                    if (record.getReturnDate() != null) {
                        return ResponseBuilder.badRequest("BORROW-001", "This book has already been returned");
                    }

                    if (record.getStatus() != BorrowRecord.BorrowStatus.APPROVED) {
                        return ResponseBuilder.badRequest("BORROW-005", "Only approved borrow records can be returned");
                    }

                    record.setReturnDate(LocalDateTime.now());
                    record.setStatus(BorrowRecord.BorrowStatus.RETURNED);
                    if (caller.getRole() != User.UserRole.USER) {
                        record.setProcessedBy(caller);
                    }
                    borrowRecordRepository.save(record);

                    record.getBook().setAvailable(true);
                    bookRepository.save(record.getBook());

                    eventPublisher.publishEvent(
                            new BookReturnedEvent(this, record, caller, record.getBook()));

                    return ResponseBuilder.ok(Map.of("message", "Book returned successfully"));
                })
                .orElse(ResponseBuilder.notFound("BORROW-002", "Borrow record not found"));
    }

    @Transactional
    public ResponseEntity<?> approveBorrowRequest(Long borrowId, Authentication auth) {
        User librarian = (User) auth.getPrincipal();

        return borrowRecordRepository.findById(borrowId)
                .<ResponseEntity<?>>map(record -> {
                    if (record.getStatus() != BorrowRecord.BorrowStatus.PENDING) {
                        return ResponseBuilder.badRequest("BORROW-006", "Only pending requests can be approved");
                    }

                    if (!record.getBook().getAvailable()) {
                        return ResponseBuilder.badRequest("BOOK-002", "Book is no longer available");
                    }

                    record.setStatus(BorrowRecord.BorrowStatus.APPROVED);
                    record.setProcessedBy(librarian);
                    borrowRecordRepository.save(record);

                    record.getBook().setAvailable(false);
                    bookRepository.save(record.getBook());

                    eventPublisher.publishEvent(
                            new BookBorrowedEvent(this, record, record.getUser(), record.getBook()));

                    return ResponseBuilder.ok(Map.of(
                            "message", "Borrow request approved successfully",
                            "borrowRecord", Map.of(
                                    "id", record.getId(),
                                    "status", record.getStatus().toString(),
                                    "approvedBy", librarian.getEmail()
                            )
                    ));
                })
                .orElse(ResponseBuilder.notFound("BORROW-002", "Borrow record not found"));
    }

    @Transactional
    public ResponseEntity<?> rejectBorrowRequest(Long borrowId, Authentication auth) {
        User librarian = (User) auth.getPrincipal();

        return borrowRecordRepository.findById(borrowId)
                .<ResponseEntity<?>>map(record -> {
                    if (record.getStatus() != BorrowRecord.BorrowStatus.PENDING) {
                        return ResponseBuilder.badRequest("BORROW-007", "Only pending requests can be rejected");
                    }

                    record.setStatus(BorrowRecord.BorrowStatus.REJECTED);
                    record.setProcessedBy(librarian);
                    borrowRecordRepository.save(record);

                    return ResponseBuilder.ok(Map.of(
                            "message", "Borrow request rejected",
                            "borrowRecord", Map.of(
                                    "id", record.getId(),
                                    "status", record.getStatus().toString(),
                                    "rejectedBy", librarian.getEmail()
                            )
                    ));
                })
                .orElse(ResponseBuilder.notFound("BORROW-002", "Borrow record not found"));
    }
}
