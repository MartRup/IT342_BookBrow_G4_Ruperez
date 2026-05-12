package com.example.bookbrow.feature.admin.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "system_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "action_type", nullable = false)
    private String actionType; // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.

    @Column(name = "entity_type", nullable = false)
    private String entityType; // BOOK, USER, BORROW, etc.

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "description", nullable = false, length = 500)
    private String description;

    @Column(name = "performed_by", nullable = false)
    private String performedBy; // User email

    @Column(name = "performed_by_name")
    private String performedByName; // User full name

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "metadata", length = 2000)
    private String metadata; // JSON string for additional data

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
