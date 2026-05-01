package com.example.bookbrow.repository;

import com.example.bookbrow.entity.SystemLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for system logs.
 */
@Repository
public interface SystemLogRepository extends JpaRepository<SystemLog, Long> {

    // Get recent logs (latest first)
    Page<SystemLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // Get logs by entity type
    Page<SystemLog> findByEntityTypeOrderByCreatedAtDesc(String entityType, Pageable pageable);

    // Get logs by action type
    Page<SystemLog> findByActionTypeOrderByCreatedAtDesc(String actionType, Pageable pageable);

    // Get logs by user
    Page<SystemLog> findByPerformedByOrderByCreatedAtDesc(String performedBy, Pageable pageable);

    // Get most recent logs (for dashboard)
    List<SystemLog> findTop20ByOrderByCreatedAtDesc();
}
