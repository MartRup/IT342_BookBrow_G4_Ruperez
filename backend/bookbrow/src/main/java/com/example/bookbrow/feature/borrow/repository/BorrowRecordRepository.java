package com.example.bookbrow.feature.borrow.repository;

import com.example.bookbrow.feature.borrow.entity.BorrowRecord;
import com.example.bookbrow.feature.books.entity.Book;
import com.example.bookbrow.feature.users.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {

    List<BorrowRecord> findByUser(User user);
    List<BorrowRecord> findByUserAndReturnDateIsNull(User user);
    List<BorrowRecord> findByUserAndReturnDateIsNotNull(User user);

    Page<BorrowRecord> findByReturnDateIsNull(Pageable pageable);
    Page<BorrowRecord> findByReturnDateIsNotNull(Pageable pageable);

    long countByReturnDateIsNull();
    long countByReturnDateIsNotNull();

    @Query("SELECT COUNT(br) FROM BorrowRecord br WHERE br.dueDate < :now AND br.returnDate IS NULL")
    long countOverdueBooks(@Param("now") LocalDateTime now);

    @Query("SELECT COUNT(br) FROM BorrowRecord br WHERE br.book.id = :bookId AND br.returnDate IS NULL")
    long countActiveBorrowsByBookId(@Param("bookId") Long bookId);

    @Modifying
    @Query("DELETE FROM BorrowRecord br WHERE br.book.id = :bookId")
    void deleteByBookId(@Param("bookId") Long bookId);

    boolean existsByUserAndBookAndStatus(User user, Book book, BorrowRecord.BorrowStatus status);

    Page<BorrowRecord> findByStatus(BorrowRecord.BorrowStatus status, Pageable pageable);

    List<BorrowRecord> findByUserAndStatus(User user, BorrowRecord.BorrowStatus status);

    Integer countByUser(User user);
    Integer countByUserAndStatus(User user, BorrowRecord.BorrowStatus status);

    @Query("SELECT br FROM BorrowRecord br WHERE br.dueDate < CURRENT_TIMESTAMP AND br.returnDate IS NULL")
    Page<BorrowRecord> findOverdueRecords(Pageable pageable);
}
