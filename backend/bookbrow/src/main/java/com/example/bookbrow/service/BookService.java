package com.example.bookbrow.service;

import com.example.bookbrow.dto.ApiResponse;
import com.example.bookbrow.dto.BookRequest;
import com.example.bookbrow.entity.Book;
import com.example.bookbrow.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;

    public ResponseEntity<?> getAllBooks(int page, int limit, String search, Boolean available) {
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());
        Page<Book> bookPage = bookRepository.findAllWithFilters(
                (search != null && !search.isBlank()) ? search : null,
                available,
                pageable
        );

        Map<String, Object> data = Map.of(
                "books", bookPage.getContent(),
                "pagination", Map.of(
                        "page", page,
                        "limit", limit,
                        "total", bookPage.getTotalElements(),
                        "pages", bookPage.getTotalPages()
                )
        );
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    public ResponseEntity<?> getBookById(Long id) {
        return bookRepository.findById(id)
                .<ResponseEntity<?>>map(book -> ResponseEntity.ok(ApiResponse.success(Map.of("book", book))))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("BOOK-001", "Book with given ID does not exist")));
    }

    public ResponseEntity<?> createBook(BookRequest request) {
        Book book = Book.builder()
                .title(request.getTitle())
                .author(request.getAuthor())
                .description(request.getDescription())
                .available(request.getAvailable() != null ? request.getAvailable() : true)
                .build();

        Book saved = bookRepository.save(book);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(Map.of("book", saved)));
    }

    public ResponseEntity<?> updateBook(Long id, BookRequest request) {
        return bookRepository.findById(id)
                .<ResponseEntity<?>>map(book -> {
                    if (request.getTitle() != null)       book.setTitle(request.getTitle());
                    if (request.getAuthor() != null)      book.setAuthor(request.getAuthor());
                    if (request.getDescription() != null) book.setDescription(request.getDescription());
                    if (request.getAvailable() != null)   book.setAvailable(request.getAvailable());
                    Book updated = bookRepository.save(book);
                    return ResponseEntity.ok(ApiResponse.success(Map.of("book", updated)));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("BOOK-001", "Book not found")));
    }

    public ResponseEntity<?> deleteBook(Long id) {
        if (!bookRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("BOOK-001", "Book not found"));
        }
        bookRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(Map.of("message", "Book deleted successfully")));
    }
}
