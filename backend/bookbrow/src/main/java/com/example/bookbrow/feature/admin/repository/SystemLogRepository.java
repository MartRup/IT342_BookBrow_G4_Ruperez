package com.example.bookbrow.feature.admin.repository;

import com.example.bookbrow.feature.admin.entity.SystemLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SystemLogRepository extends JpaRepository<SystemLog, Long> {

    Page<SystemLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<SystemLog> findByEntityTypeOrderByCreatedAtDesc(String entityType, Pageable pageable);

    Page<SystemLog> findByActionTypeOrderByCreatedAtDesc(String actionType, Pageable pageable);

    Page<SystemLog> findByPerformedByOrderByCreatedAtDesc(String performedBy, Pageable pageable);

    List<SystemLog> findTop20ByOrderByCreatedAtDesc();
}
