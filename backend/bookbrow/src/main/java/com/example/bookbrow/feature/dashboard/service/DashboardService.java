package com.example.bookbrow.feature.dashboard.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {
    
    public Map<String, Object> getUserStats(Long userId) {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("booksBorrowed", 0);
        stats.put("dueSoon", 0);
        stats.put("returned", 0);
        
        return stats;
    }
}
