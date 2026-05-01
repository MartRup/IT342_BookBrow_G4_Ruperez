package com.example.bookbrow.service;

import com.example.bookbrow.dto.BookRequest;
import com.example.bookbrow.dto.ResponseBuilder;
import com.example.bookbrow.entity.Book;
import com.example.bookbrow.repository.BookRepository;
import com.example.bookbrow.repository.BorrowRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * Service managing book catalog operations (CRUD).
 */
@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final BorrowRecordRepository borrowRecordRepository;

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

    public ResponseEntity<?> searchExternalBooks(String query) {
        try {
            // Add maxResults parameter to limit API calls
            String url = "https://www.googleapis.com/books/v1/volumes?q=" + 
                        java.net.URLEncoder.encode(query, "UTF-8") + 
                        "&maxResults=10";
            
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            
            // Set timeout to avoid hanging requests
            restTemplate.setRequestFactory(new org.springframework.http.client.SimpleClientHttpRequestFactory() {{
                setConnectTimeout(5000); // 5 seconds
                setReadTimeout(10000);   // 10 seconds
            }});
            
            java.util.Map<String, Object> response = restTemplate.getForObject(url, java.util.Map.class);
            
            // Log successful search
            System.out.println("✅ Google Books search successful for: " + query);
            
            return ResponseEntity.ok(response);
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            // Handle HTTP errors (429 = rate limit, 400 = bad request, etc.)
            if (e.getStatusCode().value() == 429) {
                System.err.println("❌ Google Books API rate limit exceeded");
                return ResponseBuilder.badRequest("GOOGLE-001", 
                    "Google Books API quota exceeded. Please wait a few minutes and try again.");
            }
            System.err.println("❌ Google Books API error: " + e.getStatusCode() + " - " + e.getMessage());
            return ResponseBuilder.badRequest("GOOGLE-001", 
                "Google Books API error: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("❌ Error fetching from Google Books API: " + e.getMessage());
            e.printStackTrace();
            return ResponseBuilder.badRequest("GOOGLE-001", 
                "Error fetching from Google Books API: " + e.getMessage());
        }
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
                .available(request.getAvailable() != null ? request.getAvailable() : true)
                .isbn(request.getIsbn())
                .genre(request.getGenre())
                .coverUrl(request.getCoverUrl())
                .build();

        Book saved = bookRepository.save(book);
        // Adapter Pattern: ResponseBuilder for CREATED status
        return ResponseBuilder.createdWith("book", saved);
    }

    public ResponseEntity<?> updateBook(Long id, BookRequest request) {
        return bookRepository.findById(id)
                .<ResponseEntity<?>>map(book -> {
                    if (request.getTitle() != null)       book.setTitle(request.getTitle());
                    if (request.getAuthor() != null)      book.setAuthor(request.getAuthor());
                    if (request.getDescription() != null) book.setDescription(request.getDescription());
                    if (request.getAvailable() != null)   book.setAvailable(request.getAvailable());
                    if (request.getIsbn() != null)        book.setIsbn(request.getIsbn());
                    if (request.getGenre() != null)       book.setGenre(request.getGenre());
                    if (request.getCoverUrl() != null)    book.setCoverUrl(request.getCoverUrl());
                    Book updated = bookRepository.save(book);
                    return ResponseBuilder.okWith("book", updated);
                })
                .orElse(ResponseBuilder.notFound("BOOK-001", "Book not found"));
    }

    @Transactional
    public ResponseEntity<?> deleteBook(Long id) {
        if (!bookRepository.existsById(id)) {
            return ResponseBuilder.notFound("BOOK-001", "Book not found");
        }
        // Delete all associated borrow records first to avoid FK constraint violation
        borrowRecordRepository.deleteByBookId(id);
        bookRepository.deleteById(id);
        return ResponseBuilder.okWith("message", "Book deleted successfully");
    }
}
