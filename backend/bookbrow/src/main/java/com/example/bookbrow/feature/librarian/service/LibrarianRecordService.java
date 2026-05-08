package com.example.bookbrow.feature.librarian.service;

import com.example.bookbrow.feature.borrow.dto.BorrowRecordDto;
import com.example.bookbrow.feature.borrow.entity.BorrowRecord;
import com.example.bookbrow.feature.borrow.repository.BorrowRecordRepository;
import com.example.bookbrow.shared.dto.ResponseBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class LibrarianRecordService {

    private final BorrowRecordRepository borrowRecordRepository;

    public ResponseEntity<?> getAllRecords(int page, int limit, String status) {
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());
        Page<BorrowRecord> recordPage;

        if (status != null && !status.isBlank()) {
            switch (status.toLowerCase()) {
                case "active":
                    recordPage = borrowRecordRepository.findByStatus(BorrowRecord.BorrowStatus.APPROVED, pageable);
                    break;
                case "overdue":
                    recordPage = borrowRecordRepository.findOverdueRecords(pageable);
                    break;
                case "returned":
                    recordPage = borrowRecordRepository.findByStatus(BorrowRecord.BorrowStatus.RETURNED, pageable);
                    break;
                case "pending":
                    recordPage = borrowRecordRepository.findByStatus(BorrowRecord.BorrowStatus.PENDING, pageable);
                    break;
                case "rejected":
                    recordPage = borrowRecordRepository.findByStatus(BorrowRecord.BorrowStatus.REJECTED, pageable);
                    break;
                default:
                    recordPage = borrowRecordRepository.findAll(pageable);
            }
        } else {
            recordPage = borrowRecordRepository.findAll(pageable);
        }

        List<BorrowRecordDto> records = recordPage.getContent().stream()
                .map(BorrowRecordDto::from)
                .toList();

        Map<String, Object> data = Map.of(
                "records", records,
                "pagination", Map.of(
                        "page", page,
                        "limit", limit,
                        "total", recordPage.getTotalElements(),
                        "pages", recordPage.getTotalPages()
                )
        );

        return ResponseBuilder.ok(data);
    }

    public ResponseEntity<?> getRecordDetails(Long recordId) {
        return borrowRecordRepository.findById(recordId)
                .<ResponseEntity<?>>map(record -> {
                    BorrowRecordDto dto = BorrowRecordDto.from(record);
                    return ResponseBuilder.okWith("record", dto);
                })
                .orElse(ResponseBuilder.notFound("BORROW-002", "Borrow record not found"));
    }
}
