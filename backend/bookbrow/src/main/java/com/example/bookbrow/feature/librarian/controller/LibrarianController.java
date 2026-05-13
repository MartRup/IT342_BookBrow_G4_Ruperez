package com.example.bookbrow.feature.librarian.controller;

import com.example.bookbrow.feature.librarian.dto.UpdateUserRequest;
import com.example.bookbrow.shared.dto.ResponseBuilder;
import com.example.bookbrow.feature.librarian.service.LibrarianDashboardService;
import com.example.bookbrow.feature.librarian.service.LibrarianRecordService;
import com.example.bookbrow.feature.librarian.service.LibrarianUserService;
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
    private final LibrarianUserService librarianUserService;
    private final LibrarianRecordService librarianRecordService;

    // ═══════════════════════════════════════════════════════════════
    // Dashboard
    // ═══════════════════════════════════════════════════════════════

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

    // ═══════════════════════════════════════════════════════════════
    // User Management
    // ═══════════════════════════════════════════════════════════════

    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "1")  int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false)    String search,
            @RequestParam(required = false)    String role
    ) {
        return librarianUserService.getAllUsers(page, limit, search, role);
    }

    @GetMapping("/users/{id}")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> getUserDetails(@PathVariable Long id) {
        return librarianUserService.getUserDetails(id);
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request
    ) {
        return librarianUserService.updateUser(id, request);
    }

    @PutMapping("/users/{id}/deactivate")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> deactivateUser(@PathVariable Long id) {
        return librarianUserService.deactivateUser(id);
    }

    @PutMapping("/users/{id}/activate")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> activateUser(@PathVariable Long id) {
        return librarianUserService.activateUser(id);
    }

    // ═══════════════════════════════════════════════════════════════
    // Record Management
    // ═══════════════════════════════════════════════════════════════

    @GetMapping("/records")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> getAllRecords(
            @RequestParam(defaultValue = "1")  int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false)    String status
    ) {
        return librarianRecordService.getAllRecords(page, limit, status);
    }

    @GetMapping("/records/{id}")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> getRecordDetails(@PathVariable Long id) {
        return librarianRecordService.getRecordDetails(id);
    }
}
