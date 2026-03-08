package com.example.bookbrow.service;

import com.example.bookbrow.dto.ApiResponse;
import com.example.bookbrow.entity.BorrowRecord;
import com.example.bookbrow.entity.User;
import com.example.bookbrow.repository.BookRepository;
import com.example.bookbrow.repository.BorrowRecordRepository;
import com.example.bookbrow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
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

    /** USER: borrow a book */
    @Transactional
    public ResponseEntity<?> borrowBook(Long bookId, Authentication auth) {
        User user = (User) auth.getPrincipal();

        return bookRepository.findById(bookId)
                .<ResponseEntity<?>>map(book -> {
                    if (!book.getAvailable()) {
                        return ResponseEntity.badRequest()
                                .body(ApiResponse.error("BOOK-002", "Book is not available for borrowing"));
                    }

                    book.setAvailable(false);
                    bookRepository.save(book);

                    BorrowRecord record = BorrowRecord.builder()
                            .user(user)
                            .book(book)
                            .borrowDate(LocalDateTime.now())
                            .build();

                    BorrowRecord saved = borrowRecordRepository.save(record);

                    return ResponseEntity.status(HttpStatus.CREATED)
                            .body(ApiResponse.success(Map.of("borrowRecord", Map.of(
                                    "id", saved.getId(),
                                    "bookId", book.getId(),
                                    "bookTitle", book.getTitle(),
                                    "userId", user.getId(),
                                    "borrowDate", saved.getBorrowDate()
                            ))));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("BOOK-001", "Book not found")));
    }

    /** USER: get own borrow records */
    public ResponseEntity<?> getUserBorrows(String status, Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<BorrowRecord> records;

        if ("returned".equalsIgnoreCase(status)) {
            records = borrowRecordRepository.findByUserAndReturnDateIsNotNull(user);
        } else if ("active".equalsIgnoreCase(status)) {
            records = borrowRecordRepository.findByUserAndReturnDateIsNull(user);
        } else {
            records = borrowRecordRepository.findByUser(user);
        }

        return ResponseEntity.ok(ApiResponse.success(Map.of("borrowRecords", records)));
    }

    /** LIBRARIAN/ADMIN: get all borrow records */
    public ResponseEntity<?> getAllBorrows(int page, int limit, String status) {
        var pageable = PageRequest.of(page - 1, limit);
        Page<BorrowRecord> recordPage;

        if ("returned".equalsIgnoreCase(status)) {
            recordPage = borrowRecordRepository.findByReturnDateIsNotNull(pageable);
        } else if ("active".equalsIgnoreCase(status)) {
            recordPage = borrowRecordRepository.findByReturnDateIsNull(pageable);
        } else {
            recordPage = borrowRecordRepository.findAll(pageable);
        }

        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "borrowRecords", recordPage.getContent(),
                "pagination", Map.of(
                        "page", page, "limit", limit,
                        "total", recordPage.getTotalElements(),
                        "pages", recordPage.getTotalPages()
                )
        )));
    }

    /** LIBRARIAN/ADMIN: process a return */
    @Transactional
    public ResponseEntity<?> returnBook(Long borrowId, Authentication auth) {
        User librarian = (User) auth.getPrincipal();

        return borrowRecordRepository.findById(borrowId)
                .<ResponseEntity<?>>map(record -> {
                    if (record.getReturnDate() != null) {
                        return ResponseEntity.badRequest()
                                .body(ApiResponse.error("BORROW-001", "This book has already been returned"));
                    }

                    record.setReturnDate(LocalDateTime.now());
                    record.setProcessedBy(librarian);
                    borrowRecordRepository.save(record);

                    record.getBook().setAvailable(true);
                    bookRepository.save(record.getBook());

                    return ResponseEntity.ok(ApiResponse.success(
                            Map.of("message", "Book returned successfully")));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("BORROW-002", "Borrow record not found")));
    }
}
