package com.example.bookbrow.controller;

import com.example.bookbrow.entity.User;
import com.example.bookbrow.service.DashboardService;
import com.example.bookbrow.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:3000")
public class DashboardController {
    
    @Autowired
    private DashboardService dashboardService;
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/stats")
    public ResponseEntity<?> getUserStats(@RequestParam Long userId) {
        try {
            Map<String, Object> stats = dashboardService.getUserStats(userId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch user stats"));
        }
    }
    
    @GetMapping("/stats/by-email")
    public ResponseEntity<?> getUserStatsByEmail(@RequestParam String email) {
        try {
            User user = userService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Map<String, Object> stats = dashboardService.getUserStats(user.getId());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch user stats"));
        }
    }
}
