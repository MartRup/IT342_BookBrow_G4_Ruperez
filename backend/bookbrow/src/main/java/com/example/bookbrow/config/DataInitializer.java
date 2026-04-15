package com.example.bookbrow.config;

import com.example.bookbrow.entity.Book;
import com.example.bookbrow.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final BookRepository bookRepository;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            log.info("Initializing book data...");
            
            // Check if books already exist
            if (bookRepository.count() > 0) {
                log.info("Books already exist in database. Skipping initialization.");
                return;
            }

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
            
            log.info("Successfully initialized {} sample books", sampleBooks.size());
            sampleBooks.forEach(book -> 
                log.info("Added book: {} by {} (Available: {})", 
                    book.getTitle(), book.getAuthor(), book.getAvailable())
            );
        };
    }
}
