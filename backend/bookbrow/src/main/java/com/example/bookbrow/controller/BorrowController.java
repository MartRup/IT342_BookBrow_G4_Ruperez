package com.example.bookbrow.controller;

import com.example.bookbrow.dto.BorrowRequest;
import com.example.bookbrow.service.BorrowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/borrow")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BorrowController {

    private final BorrowService borrowService;

    /** GET /api/v1/borrow/all — LIBRARIAN, ADMIN */
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('LIBRARIAN','ADMIN')")
    public ResponseEntity<?> getAllBorrows(
            @RequestParam(defaultValue = "1")  int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false)    String status
    ) {
        return borrowService.getAllBorrows(page, limit, status);
    }

    /** GET /api/v1/borrow/user — USER (own records) */
    @GetMapping("/user")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getUserBorrows(
            @RequestParam(required = false) String status,
            Authentication authentication
    ) {
        return borrowService.getUserBorrows(status, authentication);
    }

    /** POST /api/v1/borrow — USER borrows a book */
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> borrowBook(
            @RequestBody BorrowRequest request,
            Authentication authentication
    ) {
        return borrowService.borrowBook(request.getBookId(), authentication);
    }

    /** PUT /api/v1/borrow/{id}/return — USER (own records), LIBRARIAN, ADMIN */
    @PutMapping("/{id}/return")
    @PreAuthorize("hasAnyRole('USER','LIBRARIAN','ADMIN')")
    public ResponseEntity<?> returnBook(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return borrowService.returnBook(id, authentication);
    }
}
