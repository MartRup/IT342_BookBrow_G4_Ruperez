package com.example.bookbrow.feature.librarian.service;

import com.example.bookbrow.feature.borrow.dto.BorrowRecordDto;
import com.example.bookbrow.feature.borrow.entity.BorrowRecord;
import com.example.bookbrow.feature.borrow.repository.BorrowRecordRepository;
import com.example.bookbrow.feature.books.repository.BookRepository;
import com.example.bookbrow.feature.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LibrarianDashboardService {

    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public Map<String, Object> getLibrarianStats() {
        log.debug("Fetching librarian dashboard statistics");
        
        long totalUsers = userRepository.count();
        long totalBooks = bookRepository.count();
        long borrowed = borrowRecordRepository.countByStatus(BorrowRecord.BorrowStatus.APPROVED);
        long returned = borrowRecordRepository.countByReturnDateIsNotNull();
        // dueSoon: Overdue + within next 3 days
        long dueSoon = borrowRecordRepository.countOverdueBooks(LocalDateTime.now().plusDays(3));
        long overdue = borrowRecordRepository.countOverdueBooks(LocalDateTime.now());

        Map<String, Object> stats = Map.of(
            "totalUsers", totalUsers,
            "totalBooks", totalBooks,
            "borrowed", borrowed,
            "activeLoans", borrowed,
            "dueSoon", dueSoon,
            "overdue", overdue,
            "returned", returned,
            "timestamp", LocalDateTime.now().toString()
        );

        log.info("Librarian stats - Borrowed: {}, Due Soon: {}, Returned: {}", 
            borrowed, dueSoon, returned);
        
        return stats;
    }

    public List<BorrowRecordDto> getRecentActivities(int limit) {
        log.debug("Fetching recent borrow activities, limit: {}", limit);
        
        // Fetch recent borrow records ordered by creation date (most recent first)
        PageRequest pageRequest = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<BorrowRecord> recentRecords = borrowRecordRepository.findAll(pageRequest).getContent();
        
        List<BorrowRecordDto> activities = recentRecords.stream()
                .map(BorrowRecordDto::from)
                .collect(Collectors.toList());
        
        log.info("Retrieved {} recent activities", activities.size());
        
        return activities;
    }
}
