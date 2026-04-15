package com.example.bookbrow.factory;

import com.example.bookbrow.entity.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Factory class for creating User entities.
 * Handles default values and role assignment for different user types.
 */
@Component
public class UserFactory {

    private final PasswordEncoder passwordEncoder;

    public UserFactory(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Core factory method — creates a User entity with the specified role.
     * All common construction logic is centralized here.
     *
     * @param fullName    user's full name (will be trimmed)
     * @param email       user's email (will be lowercased and trimmed)
     * @param rawPassword raw password (will be BCrypt-encoded)
     * @param phone       optional phone number
     * @param role        the role to assign
     * @return a fully-constructed, unsaved User entity
     */
    public User createUser(String fullName, String email, String rawPassword,
                           String phone, User.UserRole role) {
        return User.builder()
                .fullName(fullName.trim())
                .email(email.toLowerCase().trim())
                .password(passwordEncoder.encode(rawPassword))
                .phone(phone != null ? phone.trim() : null)
                .role(role)
                .isActive(true)
                .build();
    }

    /**
     * Factory method for self-registration — always assigns USER (Member) role.
     */
    public User createMember(String fullName, String email, String rawPassword, String phone) {
        return createUser(fullName, email, rawPassword, phone, User.UserRole.USER);
    }

    /**
     * Factory method for admin-created librarian accounts.
     */
    public User createLibrarian(String fullName, String email, String rawPassword) {
        return createUser(fullName, email, rawPassword, null, User.UserRole.LIBRARIAN);
    }

    /**
     * Factory method for admin-created admin accounts.
     */
    public User createAdmin(String fullName, String email, String rawPassword) {
        return createUser(fullName, email, rawPassword, null, User.UserRole.ADMIN);
    }
}
