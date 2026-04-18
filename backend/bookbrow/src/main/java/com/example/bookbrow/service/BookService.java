package com.example.bookbrow.service;

import com.example.bookbrow.dto.BookRequest;
import com.example.bookbrow.dto.ResponseBuilder;
import com.example.bookbrow.entity.Book;
import com.example.bookbrow.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Service managing book catalog operations (CRUD).
 */
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
        // Adapter Pattern: ResponseBuilder for consistent response construction
        return ResponseBuilder.ok(data);
    }

    public ResponseEntity<?> getBookById(Long id) {
        return bookRepository.findById(id)
                .<ResponseEntity<?>>map(book ->
                        ResponseBuilder.okWith("book", book))
                .orElse(ResponseBuilder.notFound("BOOK-001", "Book with given ID does not exist"));
    }

    public ResponseEntity<?> createBook(BookRequest request) {
        Book book = Book.builder()
                .title(request.getTitle())
                .author(request.getAuthor())
                .description(request.getDescription())
                .isbn(request.getIsbn())
                .genre(request.getGenre())
                .coverUrl(request.getCoverUrl())
                .totalCopies(request.getTotalCopies() != null ? request.getTotalCopies() : 1)
                .availableCopies(request.getAvailableCopies() != null ? request.getAvailableCopies() : 1)
                .available(request.getAvailable() != null ? request.getAvailable() : true)
                .build();

        Book saved = bookRepository.save(book);
        // Adapter Pattern: ResponseBuilder for CREATED status
        return ResponseBuilder.createdWith("book", saved);
    }

    public ResponseEntity<?> updateBook(Long id, BookRequest request) {
        return bookRepository.findById(id)
                .<ResponseEntity<?>>map(book -> {
                    if (request.getTitle() != null)          book.setTitle(request.getTitle());
                    if (request.getAuthor() != null)         book.setAuthor(request.getAuthor());
                    if (request.getDescription() != null)    book.setDescription(request.getDescription());
                    if (request.getAvailable() != null)      book.setAvailable(request.getAvailable());
                    if (request.getIsbn() != null)           book.setIsbn(request.getIsbn());
                    if (request.getGenre() != null)          book.setGenre(request.getGenre());
                    if (request.getCoverUrl() != null)       book.setCoverUrl(request.getCoverUrl());
                    if (request.getTotalCopies() != null)    book.setTotalCopies(request.getTotalCopies());
                    if (request.getAvailableCopies() != null) book.setAvailableCopies(request.getAvailableCopies());
                    Book updated = bookRepository.save(book);
                    return ResponseBuilder.okWith("book", updated);
                })
                .orElse(ResponseBuilder.notFound("BOOK-001", "Book not found"));
    }

    public ResponseEntity<?> deleteBook(Long id) {
        if (!bookRepository.existsById(id)) {
            return ResponseBuilder.notFound("BOOK-001", "Book not found");
        }
        bookRepository.deleteById(id);
        return ResponseBuilder.okWith("message", "Book deleted successfully");
    }
}
