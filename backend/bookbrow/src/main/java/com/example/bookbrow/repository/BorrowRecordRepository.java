package com.example.bookbrow.repository;

import com.example.bookbrow.entity.BorrowRecord;
import com.example.bookbrow.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {

    // All records for a user (active or returned)
    List<BorrowRecord> findByUser(User user);

    // Active borrows for a user (returnDate IS NULL)
    List<BorrowRecord> findByUserAndReturnDateIsNull(User user);

    // Returned borrows for a user
    List<BorrowRecord> findByUserAndReturnDateIsNotNull(User user);

    // All active borrows (for librarian/admin)
    Page<BorrowRecord> findByReturnDateIsNull(Pageable pageable);

    // All returned borrows
    Page<BorrowRecord> findByReturnDateIsNotNull(Pageable pageable);

    // Count active borrows (returnDate IS NULL)
    long countByReturnDateIsNull();

    // Count returned borrows (returnDate IS NOT NULL)
    long countByReturnDateIsNotNull();

    // Count overdue books (dueDate < now AND returnDate IS NULL)
    @Query("SELECT COUNT(br) FROM BorrowRecord br WHERE br.dueDate < :now AND br.returnDate IS NULL")
    long countOverdueBooks(@Param("now") LocalDateTime now);

    // Count active borrows for a specific book
    @Query("SELECT COUNT(br) FROM BorrowRecord br WHERE br.book.id = :bookId AND br.returnDate IS NULL")
    long countActiveBorrowsByBookId(@Param("bookId") Long bookId);

    // Delete all borrow records for a specific book
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM BorrowRecord br WHERE br.book.id = :bookId")
    void deleteByBookId(@Param("bookId") Long bookId);

    // Check if user has a pending request for a book
    boolean existsByUserAndBookAndStatus(User user, com.example.bookbrow.entity.Book book, BorrowRecord.BorrowStatus status);

    // Find pending borrow requests
    Page<BorrowRecord> findByStatus(BorrowRecord.BorrowStatus status, Pageable pageable);

    // Find pending requests for a specific user
    List<BorrowRecord> findByUserAndStatus(User user, BorrowRecord.BorrowStatus status);
}
