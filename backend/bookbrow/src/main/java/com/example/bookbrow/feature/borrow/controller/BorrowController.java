package com.example.bookbrow.feature.borrow.controller;

import com.example.bookbrow.feature.borrow.dto.BorrowRequest;
import com.example.bookbrow.feature.borrow.service.BorrowService;
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

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('LIBRARIAN','ADMIN')")
    public ResponseEntity<?> getAllBorrows(
            @RequestParam(defaultValue = "1")  int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false)    String status
    ) {
        return borrowService.getAllBorrows(page, limit, status);
    }

    @GetMapping("/user")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getUserBorrows(
            @RequestParam(required = false) String status,
            Authentication authentication
    ) {
        return borrowService.getUserBorrows(status, authentication);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> borrowBook(
            @RequestBody BorrowRequest request,
            Authentication authentication
    ) {
        return borrowService.borrowBook(request.getBookId(), authentication);
    }

    @PutMapping("/{id}/return")
    @PreAuthorize("hasAnyRole('USER','LIBRARIAN','ADMIN')")
    public ResponseEntity<?> returnBook(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return borrowService.returnBook(id, authentication);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('LIBRARIAN','ADMIN')")
    public ResponseEntity<?> approveBorrowRequest(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return borrowService.approveBorrowRequest(id, authentication);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('LIBRARIAN','ADMIN')")
    public ResponseEntity<?> rejectBorrowRequest(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return borrowService.rejectBorrowRequest(id, authentication);
    }
}
