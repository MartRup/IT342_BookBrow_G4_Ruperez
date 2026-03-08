package com.example.bookbrow.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "http://localhost:3000")
public class BookController {
    
    @GetMapping("/featured")
    public ResponseEntity<?> getFeaturedBooks() {
        try {
            // For now, return mock data
            List<Map<String, Object>> books = new ArrayList<>();
            
            Map<String, Object> book1 = new HashMap<>();
            book1.put("id", 1);
            book1.put("title", "The Great Gatsby");
            book1.put("author", "F. Scott Fitzgerald");
            book1.put("cover", "/img/book1.jpg");
            book1.put("status", "Available");
            books.add(book1);
            
            Map<String, Object> book2 = new HashMap<>();
            book2.put("id", 2);
            book2.put("title", "To Kill a Mockingbird");
            book2.put("author", "Harper Lee");
            book2.put("cover", "/img/book2.jpg");
            book2.put("status", "Available");
            books.add(book2);
            
            Map<String, Object> book3 = new HashMap<>();
            book3.put("id", 3);
            book3.put("title", "1984");
            book3.put("author", "George Orwell");
            book3.put("cover", "/img/book3.jpg");
            book3.put("status", "Available");
            books.add(book3);
            
            return ResponseEntity.ok(books);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch featured books"));
        }
    }
    
    @PostMapping("/{bookId}/borrow")
    public ResponseEntity<?> borrowBook(@PathVariable Long bookId) {
        try {
            // For now, just return success
            // In a real implementation, you would:
            // 1. Check if the book is available
            // 2. Create a borrowing record
            // 3. Update book status
            return ResponseEntity.ok(Map.of("message", "Book borrowed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to borrow book"));
        }
    }
}
