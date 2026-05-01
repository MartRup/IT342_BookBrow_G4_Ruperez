package com.example.bookbrow.repository;

import com.example.bookbrow.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    Page<Book> findAll(Pageable pageable);

    @Query("SELECT b FROM Book b WHERE " +
           "(:pattern IS NULL OR LOWER(b.title) LIKE :pattern OR LOWER(b.author) LIKE :pattern) " +
           "AND (:available IS NULL OR b.available = :available)")
    Page<Book> findAllWithFilters(
            @Param("pattern") String pattern,
            @Param("available") Boolean available,
            Pageable pageable
    );

    // Count available books
    long countByAvailableTrue();

    // Count borrowed books (not available)
    long countByAvailableFalse();
}
