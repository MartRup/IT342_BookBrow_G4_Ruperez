package com.example.bookbrow.service;

import com.example.bookbrow.repository.BookRepository;
import com.example.bookbrow.repository.BorrowRecordRepository;
import com.example.bookbrow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Service for admin dashboard real-time statistics.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final BorrowRecordRepository borrowRecordRepository;

    /**
     * Get basic dashboard statistics
     */
    public Map<String, Object> getDashboardStats() {
        log.debug("Fetching dashboard statistics");
        
        long totalUsers = userRepository.count();
        long totalBooks = bookRepository.count();
        long activeLoans = borrowRecordRepository.countByReturnDateIsNull();
        long overdue = borrowRecordRepository.countOverdueBooks(LocalDateTime.now());

        Map<String, Object> stats = Map.of(
            "totalUsers", totalUsers,
            "totalBooks", totalBooks,
            "activeLoans", activeLoans,
            "overDue", overdue,
            "timestamp", LocalDateTime.now().toString()
        );

        log.info("Dashboard stats - Users: {}, Books: {}, Active Loans: {}, Overdue: {}", 
            totalUsers, totalBooks, activeLoans, overdue);
        
        return stats;
    }

    /**
     * Get detailed dashboard statistics with breakdowns
     */
    public Map<String, Object> getDetailedStats() {
        log.debug("Fetching detailed dashboard statistics");
        
        // Basic stats
        long totalUsers = userRepository.count();
        long totalBooks = bookRepository.count();
        long activeLoans = borrowRecordRepository.countByReturnDateIsNull();
        long overdue = borrowRecordRepository.countOverdueBooks(LocalDateTime.now());
        
        // Additional breakdowns
        long availableBooks = bookRepository.countByAvailableTrue();
        long borrowedBooks = bookRepository.countByAvailableFalse();
        long totalBorrows = borrowRecordRepository.count();
        long returnedBooks = borrowRecordRepository.countByReturnDateIsNotNull();

        Map<String, Object> stats = Map.of(
            "summary", Map.of(
                "totalUsers", totalUsers,
                "totalBooks", totalBooks,
                "activeLoans", activeLoans,
                "overDue", overdue
            ),
            "books", Map.of(
                "total", totalBooks,
                "available", availableBooks,
                "borrowed", borrowedBooks
            ),
            "borrows", Map.of(
                "total", totalBorrows,
                "active", activeLoans,
                "returned", returnedBooks,
                "overdue", overdue
            ),
            "timestamp", LocalDateTime.now().toString()
        );

        log.info("Detailed dashboard stats fetched successfully");
        
        return stats;
    }
}
