package com.example.bookbrow.feature.books.controller;

import com.example.bookbrow.feature.books.dto.BookRequest;
import com.example.bookbrow.feature.books.service.BookService;
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

    @GetMapping("/search/external")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<?> searchExternalBooks(@RequestParam("q") String query) {
        return bookService.searchExternalBooks(query);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','LIBRARIAN','ADMIN')")
    public ResponseEntity<?> getBook(@PathVariable Long id) {
        return bookService.getBookById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<?> createBook(@RequestBody BookRequest request) {
        return bookService.createBook(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<?> updateBook(@PathVariable Long id, @RequestBody BookRequest request) {
        return bookService.updateBook(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN')")
    public ResponseEntity<?> deleteBook(@PathVariable Long id) {
        return bookService.deleteBook(id);
    }

    @GetMapping("/featured")
    @PreAuthorize("permitAll()")
    public ResponseEntity<?> getFeaturedBooks() {
        return bookService.getFeaturedBooks();
    }
}
