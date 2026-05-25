package com.example.bookbrow.feature.books.service;

import com.example.bookbrow.feature.books.dto.BookRequest;
import com.example.bookbrow.shared.dto.ResponseBuilder;
import com.example.bookbrow.feature.books.entity.Book;
import com.example.bookbrow.feature.books.repository.BookRepository;
import com.example.bookbrow.feature.borrow.repository.BorrowRecordRepository;
import com.example.bookbrow.feature.admin.service.SystemLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final SystemLogService systemLogService;

    @Value("${google.books.api.key:}")
    private String googleBooksApiKey;

    @Value("${google.books.api.cache.enabled:true}")
    private boolean cacheEnabled;

    @Value("${google.books.api.cache.ttl-minutes:60}")
    private int cacheTtlMinutes;

    // Simple in-memory cache for Google Books API responses
    private final Map<String, CachedResponse> searchCache = new ConcurrentHashMap<>();
    private LocalDateTime lastApiCall = null;
    private static final long MIN_API_CALL_INTERVAL_MS = 100; // Rate limiting: 100ms between calls

    private static class CachedResponse {
        final Object data;
        final LocalDateTime timestamp;

        CachedResponse(Object data) {
            this.data = data;
            this.timestamp = LocalDateTime.now();
        }

        boolean isExpired(int ttlMinutes) {
            return LocalDateTime.now().isAfter(timestamp.plusMinutes(ttlMinutes));
        }
    }

    private String getCurrentUserEmail() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() != null) {
                return auth.getName();
            }
        } catch (Exception e) {
            // Ignore
        }
        return "system";
    }

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
        return ResponseBuilder.ok(data);
    }

    public ResponseEntity<?> searchExternalBooks(String query) {
        // Check cache first
        if (cacheEnabled && searchCache.containsKey(query)) {
            CachedResponse cached = searchCache.get(query);
            if (!cached.isExpired(cacheTtlMinutes)) {
                System.out.println("✅ Returning cached Google Books result for: " + query);
                return ResponseEntity.ok(cached.data);
            } else {
                searchCache.remove(query);
            }
        }

        // Rate limiting
        if (lastApiCall != null) {
            long timeSinceLastCall = java.time.Duration.between(lastApiCall, LocalDateTime.now()).toMillis();
            if (timeSinceLastCall < MIN_API_CALL_INTERVAL_MS) {
                try {
                    Thread.sleep(MIN_API_CALL_INTERVAL_MS - timeSinceLastCall);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        }

        try {
            String url = "https://www.googleapis.com/books/v1/volumes?q=" + 
                        java.net.URLEncoder.encode(query, "UTF-8") + 
                        "&maxResults=10";
            
            // Add API key if configured
            if (googleBooksApiKey != null && !googleBooksApiKey.isBlank()) {
                url += "&key=" + googleBooksApiKey;
            }
            
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            
            restTemplate.setRequestFactory(new org.springframework.http.client.SimpleClientHttpRequestFactory() {{
                setConnectTimeout(5000); 
                setReadTimeout(10000);   
            }});
            
            lastApiCall = LocalDateTime.now();
            java.util.Map<String, Object> response = restTemplate.getForObject(url, java.util.Map.class);
            
            // Cache the response
            if (cacheEnabled && response != null) {
                searchCache.put(query, new CachedResponse(response));
            }
            
            System.out.println("✅ Google Books search successful for: " + query);
            
            return ResponseEntity.ok(response);
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            if (e.getStatusCode().value() == 429) {
                System.err.println("❌ Google Books API rate limit exceeded");
                return ResponseBuilder.badRequest("GOOGLE-001", 
                    "Google Books API quota exceeded. Please try again later or contact admin to add an API key.");
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
        
        String currentUser = getCurrentUserEmail();
        systemLogService.logBookCreated(saved.getTitle(), saved.getId(), currentUser, currentUser);
        
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
                    
                    String currentUser = getCurrentUserEmail();
                    systemLogService.logBookUpdated(updated.getTitle(), updated.getId(), currentUser, currentUser);
                    
                    return ResponseBuilder.okWith("book", updated);
                })
                .orElse(ResponseBuilder.notFound("BOOK-001", "Book not found"));
    }

    @Transactional
    public ResponseEntity<?> deleteBook(Long id) {
        if (!bookRepository.existsById(id)) {
            return ResponseBuilder.notFound("BOOK-001", "Book not found");
        }
        
        String bookTitle = bookRepository.findById(id).map(Book::getTitle).orElse("Unknown");
        
        borrowRecordRepository.deleteByBookId(id);
        bookRepository.deleteById(id);
        
        String currentUser = getCurrentUserEmail();
        systemLogService.logBookDeleted(bookTitle, id, currentUser, currentUser);
        
        return ResponseBuilder.okWith("message", "Book deleted successfully");
    }

    public ResponseEntity<?> getFeaturedBooks() {
        List<Book> popularBooks = bookRepository.findMostPopularAvailableBooks(PageRequest.of(0, 4));
        
        List<Long> popularBookIds = popularBooks.stream().map(Book::getId).toList();
        Pageable recentPageable = PageRequest.of(0, 8, Sort.by("createdAt").descending());
        Page<Book> recentBooksPage = bookRepository.findAllWithFilters(null, true, recentPageable);
        
        List<Book> recentBooks = recentBooksPage.getContent().stream()
                .filter(book -> !popularBookIds.contains(book.getId()))
                .limit(4)
                .toList();
        
        List<Book> featuredBooks = new ArrayList<>(popularBooks);
        featuredBooks.addAll(recentBooks);
        
        return ResponseBuilder.ok(featuredBooks);
    }

    public ResponseEntity<?> fetchAndUpdateCover(Long bookId) {
        return bookRepository.findById(bookId)
                .<ResponseEntity<?>>map(book -> {
                    try {
                        String coverUrl = fetchCoverFromGoogleBooks(book.getTitle(), book.getAuthor());
                        if (coverUrl != null) {
                            book.setCoverUrl(coverUrl);
                            bookRepository.save(book);
                            return ResponseBuilder.okWith("message", "Cover updated successfully");
                        } else {
                            return ResponseBuilder.badRequest("COVER-001", "No cover found for this book");
                        }
                    } catch (Exception e) {
                        return ResponseBuilder.badRequest("COVER-002", "Error fetching cover: " + e.getMessage());
                    }
                })
                .orElse(ResponseBuilder.notFound("BOOK-001", "Book not found"));
    }

    public ResponseEntity<?> fetchAndUpdateAllCovers() {
        List<Book> booksWithoutCovers = bookRepository.findAll().stream()
                .filter(book -> book.getCoverUrl() == null || book.getCoverUrl().isBlank())
                .toList();

        int updated = 0;
        int failed = 0;
        
        for (Book book : booksWithoutCovers) {
            try {
                String coverUrl = fetchCoverFromGoogleBooks(book.getTitle(), book.getAuthor());
                if (coverUrl != null) {
                    book.setCoverUrl(coverUrl);
                    bookRepository.save(book);
                    updated++;
                } else {
                    failed++;
                }
                // Rate limiting is now handled in fetchCoverFromGoogleBooks
            } catch (Exception e) {
                System.err.println("Error fetching cover for book " + book.getId() + ": " + e.getMessage());
                failed++;
            }
        }

        String message = String.format("Updated %d book covers. %d failed or not found.", updated, failed);
        return ResponseBuilder.okWith("message", message);
    }

    private String fetchCoverFromGoogleBooks(String title, String author) {
        String cacheKey = "cover:" + title + ":" + author;
        
        // Check cache first
        if (cacheEnabled && searchCache.containsKey(cacheKey)) {
            CachedResponse cached = searchCache.get(cacheKey);
            if (!cached.isExpired(cacheTtlMinutes)) {
                return (String) cached.data;
            } else {
                searchCache.remove(cacheKey);
            }
        }

        // Rate limiting
        if (lastApiCall != null) {
            long timeSinceLastCall = java.time.Duration.between(lastApiCall, LocalDateTime.now()).toMillis();
            if (timeSinceLastCall < MIN_API_CALL_INTERVAL_MS) {
                try {
                    Thread.sleep(MIN_API_CALL_INTERVAL_MS - timeSinceLastCall);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        }

        try {
            String query = title + " " + author;
            String url = "https://www.googleapis.com/books/v1/volumes?q=" +
                    java.net.URLEncoder.encode(query, "UTF-8") +
                    "&maxResults=1";

            // Add API key if configured
            if (googleBooksApiKey != null && !googleBooksApiKey.isBlank()) {
                url += "&key=" + googleBooksApiKey;
            }

            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            restTemplate.setRequestFactory(new org.springframework.http.client.SimpleClientHttpRequestFactory() {{
                setConnectTimeout(5000);
                setReadTimeout(10000);
            }});

            lastApiCall = LocalDateTime.now();
            java.util.Map<String, Object> response = restTemplate.getForObject(url, java.util.Map.class);
            
            if (response != null && response.containsKey("items")) {
                java.util.List<java.util.Map<String, Object>> items =
                        (java.util.List<java.util.Map<String, Object>>) response.get("items");
                if (!items.isEmpty()) {
                    java.util.Map<String, Object> volumeInfo =
                            (java.util.Map<String, Object>) items.get(0).get("volumeInfo");
                    if (volumeInfo != null && volumeInfo.containsKey("imageLinks")) {
                        java.util.Map<String, Object> imageLinks =
                                (java.util.Map<String, Object>) volumeInfo.get("imageLinks");
                        String coverUrl = null;
                        
                        // Prefer medium or large thumbnail
                        if (imageLinks.containsKey("medium")) {
                            coverUrl = (String) imageLinks.get("medium");
                        } else if (imageLinks.containsKey("large")) {
                            coverUrl = (String) imageLinks.get("large");
                        } else if (imageLinks.containsKey("thumbnail")) {
                            String thumb = (String) imageLinks.get("thumbnail");
                            // Upgrade thumbnail to higher quality by replacing zoom parameter
                            coverUrl = thumb.replace("zoom=1", "zoom=2");
                        }
                        
                        // Cache the result
                        if (cacheEnabled && coverUrl != null) {
                            searchCache.put(cacheKey, new CachedResponse(coverUrl));
                        }
                        
                        return coverUrl;
                    }
                }
            }
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            if (e.getStatusCode().value() == 429) {
                System.err.println("❌ Google Books API rate limit exceeded for cover fetch");
            } else {
                System.err.println("Error fetching cover from Google Books: " + e.getMessage());
            }
        } catch (Exception e) {
            System.err.println("Error fetching cover from Google Books: " + e.getMessage());
        }
        return null;
    }
}
