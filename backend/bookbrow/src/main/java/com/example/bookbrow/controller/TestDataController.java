package com.example.bookbrow.controller;

import com.example.bookbrow.dto.BookRequest;
import com.example.bookbrow.entity.Book;
import com.example.bookbrow.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/v1/test")
@RequiredArgsConstructor
@Slf4j
public class TestDataController {

    private final BookRepository bookRepository;

    @PostMapping("/add-sample-books")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> addSampleBooks() {
        log.info("Adding sample books for testing...");
        
        // Clear existing books first
        bookRepository.deleteAll();
        log.info("Cleared existing books");
        
        // Create sample books
        List<Book> sampleBooks = Arrays.asList(
            Book.builder()
                    .title("The Great Gatsby")
                    .author("F. Scott Fitzgerald")
                    .description("A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.")
                    .available(true)
                    .createdAt(LocalDateTime.now().minusDays(365))
                    .updatedAt(LocalDateTime.now().minusDays(30))
                    .build(),
            
            Book.builder()
                    .title("To Kill a Mockingbird")
                    .author("Harper Lee")
                    .description("A gripping tale of racial injustice and childhood innocence in the American South during the 1930s.")
                    .available(true)
                    .createdAt(LocalDateTime.now().minusDays(300))
                    .updatedAt(LocalDateTime.now().minusDays(60))
                    .build(),
            
            Book.builder()
                    .title("1984")
                    .author("George Orwell")
                    .description("A dystopian social science fiction novel and cautionary tale about totalitarianism.")
                    .available(true)
                    .createdAt(LocalDateTime.now().minusDays(240))
                    .updatedAt(LocalDateTime.now().minusDays(90))
                    .build(),
            
            Book.builder()
                    .title("Pride and Prejudice")
                    .author("Jane Austen")
                    .description("A romantic novel of manners set in Georgian England, exploring themes of love, reputation, and class.")
                    .available(true)
                    .createdAt(LocalDateTime.now().minusDays(180))
                    .updatedAt(LocalDateTime.now().minusDays(120))
                    .build(),
            
            Book.builder()
                    .title("The Catcher in the Rye")
                    .author("J.D. Salinger")
                    .description("A controversial coming-of-age story that has become an icon for teenage rebellion.")
                    .available(false) // This one is borrowed
                    .createdAt(LocalDateTime.now().minusDays(120))
                    .updatedAt(LocalDateTime.now().minusDays(45))
                    .build(),
            
            Book.builder()
                    .title("Harry Potter and the Sorcerer's Stone")
                    .author("J.K. Rowling")
                    .description("The first book in the beloved fantasy series about a young wizard's magical education.")
                    .available(true)
                    .createdAt(LocalDateTime.now().minusDays(90))
                    .updatedAt(LocalDateTime.now().minusDays(15))
                    .build(),
            
            Book.builder()
                    .title("The Lord of the Rings")
                    .author("J.R.R. Tolkien")
                    .description("An epic high-fantasy novel following the quest to destroy a powerful ring.")
                    .available(true)
                    .createdAt(LocalDateTime.now().minusDays(60))
                    .updatedAt(LocalDateTime.now().minusDays(5))
                    .build(),
            
            Book.builder()
                    .title("The Hobbit")
                    .author("J.R.R. Tolkien")
                    .description("A fantasy adventure about a hobbit's unexpected journey with dwarves and a dragon.")
                    .available(true)
                    .createdAt(LocalDateTime.now().minusDays(30))
                    .updatedAt(LocalDateTime.now().minusDays(1))
                    .build(),
            
            Book.builder()
                    .title("Brave New World")
                    .author("Aldous Huxley")
                    .description("A dystopian novel exploring themes of technology, society, and individual freedom.")
                    .available(false) // This one is also borrowed
                    .createdAt(LocalDateTime.now().minusDays(15))
                    .updatedAt(LocalDateTime.now().minusDays(3))
                    .build(),
            
            Book.builder()
                    .title("The Da Vinci Code")
                    .author("Dan Brown")
                    .description("A mystery thriller that follows a symbologist as he investigates a murder in the Louvre.")
                    .available(true)
                    .createdAt(LocalDateTime.now().minusDays(7))
                    .updatedAt(LocalDateTime.now().minusDays(2))
                    .build()
        );

        // Save all books
        bookRepository.saveAll(sampleBooks);
        
        log.info("Successfully added {} sample books", sampleBooks.size());
        sampleBooks.forEach(book -> 
            log.info("Added book: {} by {} (Available: {})", 
                book.getTitle(), book.getAuthor(), book.getAvailable())
        );
        
        return ResponseEntity.ok("Successfully added " + sampleBooks.size() + " sample books for testing");
    }

    @GetMapping("/book-count")
    public ResponseEntity<String> getBookCount() {
        long count = bookRepository.count();
        String message = String.format("Total books in database: %d", count);
        return ResponseEntity.ok(message);
    }

    @DeleteMapping("/clear-books")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> clearAllBooks() {
        long count = bookRepository.count();
        bookRepository.deleteAll();
        String message = String.format("Cleared %d books from database", count);
        log.info(message);
        return ResponseEntity.ok(message);
    }

    @PostMapping("/add-single-book")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Book> addSingleBook(@RequestBody BookRequest request) {
        Book book = Book.builder()
                .title(request.getTitle())
                .author(request.getAuthor())
                .description(request.getDescription())
                .available(request.getAvailable() != null ? request.getAvailable() : true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        Book savedBook = bookRepository.save(book);
        log.info("Added single book: {} by {}", savedBook.getTitle(), savedBook.getAuthor());
        
        return ResponseEntity.ok(savedBook);
    }
}
