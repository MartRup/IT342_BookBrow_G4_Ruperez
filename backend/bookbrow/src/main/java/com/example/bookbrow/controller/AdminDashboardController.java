package com.example.bookbrow.controller;

import com.example.bookbrow.dto.ResponseBuilder;
import com.example.bookbrow.service.AdminDashboardService;
import com.example.bookbrow.service.SystemLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for admin dashboard real-time statistics.
 */
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;
    private final SystemLogService systemLogService;

    /**
     * GET /api/v1/admin/stats - Get real-time dashboard statistics
     * Requires ADMIN role
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getDashboardStats() {
        try {
            Map<String, Object> stats = adminDashboardService.getDashboardStats();
            return ResponseBuilder.ok(stats);
        } catch (Exception e) {
            return ResponseBuilder.serverError("DASHBOARD-001", 
                "Failed to fetch dashboard statistics: " + e.getMessage());
        }
    }

    /**
     * GET /api/v1/admin/stats/detailed - Get detailed statistics with breakdowns
     * Requires ADMIN role
     */
    @GetMapping("/stats/detailed")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getDetailedStats() {
        try {
            Map<String, Object> stats = adminDashboardService.getDetailedStats();
            return ResponseBuilder.ok(stats);
        } catch (Exception e) {
            return ResponseBuilder.serverError("DASHBOARD-002", 
                "Failed to fetch detailed statistics: " + e.getMessage());
        }
    }

    /**
     * GET /api/v1/admin/logs - Get recent system logs
     * Requires ADMIN role
     */
    @GetMapping("/logs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getRecentLogs() {
        try {
            List<Map<String, Object>> logs = systemLogService.getRecentLogs(20);
            return ResponseBuilder.ok(logs);
        } catch (Exception e) {
            return ResponseBuilder.serverError("LOGS-001", 
                "Failed to fetch system logs: " + e.getMessage());
        }
    }
}
