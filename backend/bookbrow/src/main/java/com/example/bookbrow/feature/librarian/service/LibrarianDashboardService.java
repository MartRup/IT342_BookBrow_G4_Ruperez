package com.example.bookbrow.feature.librarian.service;

import com.example.bookbrow.feature.borrow.repository.BorrowRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class LibrarianDashboardService {

    private final BorrowRecordRepository borrowRecordRepository;

    public Map<String, Object> getLibrarianStats() {
        log.debug("Fetching librarian dashboard statistics");
        
        long borrowed = borrowRecordRepository.countByReturnDateIsNull();
        long returned = borrowRecordRepository.countByReturnDateIsNotNull();
        // dueSoon: Overdue + within next 3 days
        long dueSoon = borrowRecordRepository.countOverdueBooks(LocalDateTime.now().plusDays(3));

        Map<String, Object> stats = Map.of(
            "borrowed", borrowed,
            "dueSoon", dueSoon,
            "returned", returned,
            "timestamp", LocalDateTime.now().toString()
        );

        log.info("Librarian stats - Borrowed: {}, Due Soon: {}, Returned: {}", 
            borrowed, dueSoon, returned);
        
        return stats;
    }
}
