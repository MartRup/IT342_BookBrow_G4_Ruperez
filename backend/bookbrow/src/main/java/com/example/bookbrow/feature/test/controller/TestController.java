package com.example.bookbrow.feature.test.controller;

import com.example.bookbrow.feature.books.entity.Book;
import com.example.bookbrow.feature.books.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/test")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TestController {

    private final BookRepository bookRepository;

    @GetMapping("/book-count")
    public ResponseEntity<String> getBookCount() {
        long count = bookRepository.count();
        return ResponseEntity.ok("Total books in database: " + count);
    }

    @PostMapping("/add-sample-books")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<Map<String, Object>> addSampleBooks() {
        List<Book> sampleBooks = Arrays.asList(
            createBook("The Great Gatsby", "F. Scott Fitzgerald", "9780743273565", "Classic"),
            createBook("To Kill a Mockingbird", "Harper Lee", "9780061120084", "Fiction"),
            createBook("1984", "George Orwell", "9780451524935", "Dystopian"),
            createBook("Pride and Prejudice", "Jane Austen", "9780141439518", "Romance"),
            createBook("The Catcher in the Rye", "J.D. Salinger", "9780316769174", "Fiction"),
            createBook("Harry Potter and the Sorcerer's Stone", "J.K. Rowling", "9780590353427", "Fantasy"),
            createBook("The Hobbit", "J.R.R. Tolkien", "9780547928227", "Fantasy"),
            createBook("Fahrenheit 451", "Ray Bradbury", "9781451673319", "Science Fiction"),
            createBook("Brave New World", "Aldous Huxley", "9780060850524", "Dystopian"),
            createBook("The Lord of the Rings", "J.R.R. Tolkien", "9780544003415", "Fantasy")
        );

        bookRepository.saveAll(sampleBooks);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Added " + sampleBooks.size() + " sample books");
        response.put("count", sampleBooks.size());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/clear-books")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> clearBooks() {
        long count = bookRepository.count();
        bookRepository.deleteAll();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Deleted " + count + " books");
        response.put("deletedCount", count);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/add-single-book")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<Map<String, Object>> addSingleBook(@RequestBody Map<String, String> request) {
        String title = request.getOrDefault("title", "Test Book");
        String author = request.getOrDefault("author", "Test Author");
        String isbn = request.getOrDefault("isbn", "9780000000000");
        String genre = request.getOrDefault("genre", "General");

        Book book = createBook(title, author, isbn, genre);
        bookRepository.save(book);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Book added successfully");
        response.put("book", book);
        return ResponseEntity.ok(response);
    }

    private Book createBook(String title, String author, String isbn, String genre) {
        Book book = new Book();
        book.setTitle(title);
        book.setAuthor(author);
        book.setIsbn(isbn);
        book.setGenre(genre);
        book.setAvailable(true);
        book.setDescription("A great book about " + title.toLowerCase());
        book.setCoverUrl("https://via.placeholder.com/150");
        return book;
    }
}
