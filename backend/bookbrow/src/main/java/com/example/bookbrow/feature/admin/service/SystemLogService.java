package com.example.bookbrow.feature.admin.service;

import com.example.bookbrow.feature.admin.entity.SystemLog;
import com.example.bookbrow.feature.admin.repository.SystemLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemLogService {

    private final SystemLogRepository systemLogRepository;

    public void logAction(String actionType, String entityType, Long entityId, 
                         String description, String performedBy, String performedByName) {
        try {
            SystemLog systemLog = SystemLog.builder()
                    .actionType(actionType)
                    .entityType(entityType)
                    .entityId(entityId)
                    .description(description)
                    .performedBy(performedBy)
                    .performedByName(performedByName)
                    .build();

            systemLogRepository.save(systemLog);
            log.debug("System log created: {} - {} by {}", actionType, entityType, performedBy);
        } catch (Exception e) {
            log.error("Failed to create system log: {}", e.getMessage());
        }
    }

    public void logActionWithMetadata(String actionType, String entityType, Long entityId,
                                     String description, String performedBy, String performedByName,
                                     Map<String, Object> metadata) {
        try {
            String metadataJson = metadata != null ? metadata.toString() : null;
            
            SystemLog systemLog = SystemLog.builder()
                    .actionType(actionType)
                    .entityType(entityType)
                    .entityId(entityId)
                    .description(description)
                    .performedBy(performedBy)
                    .performedByName(performedByName)
                    .metadata(metadataJson)
                    .build();

            systemLogRepository.save(systemLog);
            log.debug("System log created with metadata: {} - {} by {}", actionType, entityType, performedBy);
        } catch (Exception e) {
            log.error("Failed to create system log with metadata: {}", e.getMessage());
        }
    }

    public List<Map<String, Object>> getRecentLogs(int limit) {
        List<SystemLog> logs = systemLogRepository.findTop20ByOrderByCreatedAtDesc();
        
        return logs.stream().map(logItem -> {
            Map<String, Object> logMap = new java.util.HashMap<>();
            logMap.put("id", logItem.getId());
            logMap.put("actionType", logItem.getActionType());
            logMap.put("entityType", logItem.getEntityType());
            logMap.put("description", logItem.getDescription());
            logMap.put("performedBy", logItem.getPerformedByName() != null ? logItem.getPerformedByName() : logItem.getPerformedBy());
            logMap.put("createdAt", logItem.getCreatedAt().toString());
            logMap.put("timeAgo", getTimeAgo(logItem.getCreatedAt()));
            return logMap;
        }).collect(java.util.stream.Collectors.toList());
    }

    public Page<Map<String, Object>> getLogs(int page, int limit) {
        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<SystemLog> logPage = systemLogRepository.findAllByOrderByCreatedAtDesc(pageable);

        return logPage.map(logItem -> Map.of(
            "id", logItem.getId(),
            "actionType", logItem.getActionType(),
            "entityType", logItem.getEntityType(),
            "entityId", logItem.getEntityId(),
            "description", logItem.getDescription(),
            "performedBy", logItem.getPerformedByName() != null ? logItem.getPerformedByName() : logItem.getPerformedBy(),
            "createdAt", logItem.getCreatedAt().toString()
        ));
    }

    private String getTimeAgo(java.time.LocalDateTime dateTime) {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.Duration duration = java.time.Duration.between(dateTime, now);

        long seconds = duration.getSeconds();
        if (seconds < 60) return "Just now";
        if (seconds < 3600) return (seconds / 60) + " minutes ago";
        if (seconds < 86400) return (seconds / 3600) + " hours ago";
        return (seconds / 86400) + " days ago";
    }

    public void logBookCreated(String bookTitle, Long bookId, String performedBy, String performedByName) {
        logAction("CREATE", "BOOK", bookId, 
                 "has added \"" + bookTitle + "\"", performedBy, performedByName);
    }

    public void logBookUpdated(String bookTitle, Long bookId, String performedBy, String performedByName) {
        logAction("UPDATE", "BOOK", bookId, 
                 "has updated \"" + bookTitle + "\"", performedBy, performedByName);
    }

    public void logBookDeleted(String bookTitle, Long bookId, String performedBy, String performedByName) {
        logAction("DELETE", "BOOK", bookId, 
                 "has deleted \"" + bookTitle + "\"", performedBy, performedByName);
    }

    public void logUserCreated(String userName, Long userId, String performedBy, String performedByName) {
        logAction("CREATE", "USER", userId, 
                 "Created user: " + userName, performedBy, performedByName);
    }

    public void logUserUpdated(String userName, Long userId, String performedBy, String performedByName) {
        logAction("UPDATE", "USER", userId, 
                 "Updated user: " + userName, performedBy, performedByName);
    }

    public void logUserDeleted(String userName, Long userId, String performedBy, String performedByName) {
        logAction("DELETE", "USER", userId, 
                 "Deleted user: " + userName, performedBy, performedByName);
    }

    public void logBookBorrowed(String bookTitle, Long bookId, String performedBy, String performedByName) {
        logAction("BORROW", "BOOK", bookId, 
                 "Borrowed book: " + bookTitle, performedBy, performedByName);
    }

    public void logBookReturned(String bookTitle, Long bookId, String performedBy, String performedByName) {
        logAction("RETURN", "BOOK", bookId, 
                 "Returned book: " + bookTitle, performedBy, performedByName);
    }
}
