package com.example.bookbrow.validation;

import com.example.bookbrow.dto.AuthResponse;
import com.example.bookbrow.repository.UserRepository;

/**
 * Base validator containing shared validation logic for user creation.
 */
public abstract class BaseUserValidator {

    protected final UserRepository userRepository;

    protected BaseUserValidator(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ── Shared validation steps ──────────────────────────────────────

    protected AuthResponse validateRequired(String fieldValue, String errorCode, String message) {
        if (isBlank(fieldValue)) {
            return AuthResponse.error(errorCode, message);
        }
        return null;
    }

    protected AuthResponse validateEmailFormat(String email) {
        if (!isValidEmail(email)) {
            return AuthResponse.error("AUTH-013", "Email format is invalid");
        }
        return null;
    }

    protected AuthResponse validateEmailUniqueness(String email) {
        if (userRepository.existsByEmail(email.toLowerCase())) {
            return AuthResponse.error("AUTH-001", "Email is already registered");
        }
        return null;
    }

    protected AuthResponse validatePasswordStrength(String password) {
        if (password.length() < 8) {
            return AuthResponse.error("AUTH-003", "Password must be at least 8 characters");
        }
        return null;
    }

    // ── Utility ──────────────────────────────────────────────────────

    protected static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private static boolean isValidEmail(String email) {
        return email != null && email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    }
}
