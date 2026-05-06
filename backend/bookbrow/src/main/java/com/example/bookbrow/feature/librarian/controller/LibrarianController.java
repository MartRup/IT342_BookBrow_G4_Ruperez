package com.example.bookbrow.feature.librarian.controller;

import com.example.bookbrow.shared.dto.ResponseBuilder;
import com.example.bookbrow.feature.librarian.service.LibrarianDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/librarian")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LibrarianController {

    private final LibrarianDashboardService librarianDashboardService;

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> getStats() {
        try {
            Map<String, Object> stats = librarianDashboardService.getLibrarianStats();
            return ResponseBuilder.ok(stats);
        } catch (Exception e) {
            return ResponseBuilder.serverError("LIBRARIAN-001", "Failed to fetch stats: " + e.getMessage());
        }
    }
}
