package com.example.bookbrow.controller;

import com.example.bookbrow.dto.BookRequest;
import com.example.bookbrow.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/books")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookController {

    private final BookService bookService;

    /** GET /api/v1/books?page=1&limit=20&search=keyword&available=true */
    @GetMapping
    @PreAuthorize("hasAnyRole('USER','LIBRARIAN','ADMIN')")
    public ResponseEntity<?> getAllBooks(
            @RequestParam(defaultValue = "1")   int page,
            @RequestParam(defaultValue = "20")  int limit,
            @RequestParam(required = false)     String search,
            @RequestParam(required = false)     Boolean available
    ) {
        return bookService.getAllBooks(page, limit, search, available);
    }

    /** GET /api/v1/books/{id} */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','LIBRARIAN','ADMIN')")
    public ResponseEntity<?> getBook(@PathVariable Long id) {
        return bookService.getBookById(id);
    }

    /** POST /api/v1/books — ADMIN or LIBRARIAN */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<?> createBook(@RequestBody BookRequest request) {
        return bookService.createBook(request);
    }

    /** PUT /api/v1/books/{id} — ADMIN or LIBRARIAN */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<?> updateBook(@PathVariable Long id, @RequestBody BookRequest request) {
        return bookService.updateBook(id, request);
    }

    /** DELETE /api/v1/books/{id} — ADMIN or LIBRARIAN */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<?> deleteBook(@PathVariable Long id) {
        return bookService.deleteBook(id);
    }
}
