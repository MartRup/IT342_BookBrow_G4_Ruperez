package com.example.bookbrow.validation;

import com.example.bookbrow.dto.AuthResponse;
import com.example.bookbrow.dto.PrivilegedUserCreateRequest;
import com.example.bookbrow.entity.User;
import com.example.bookbrow.repository.UserRepository;
import org.springframework.stereotype.Component;

/**
 * Validator for creating privileged accounts (Admin/Librarian).
 */
@Component
public class PrivilegedUserValidator extends BaseUserValidator
        implements ValidationStrategy<PrivilegedUserCreateRequest> {

    public PrivilegedUserValidator(UserRepository userRepository) {
        super(userRepository);
    }

    @Override
    public AuthResponse validate(PrivilegedUserCreateRequest request) {
        AuthResponse error;

        error = validateRequired(request.getFullName(), "AUTH-010", "Full name is required");
        if (error != null) return error;

        error = validateRequired(request.getEmail(), "AUTH-011", "Email is required");
        if (error != null) return error;

        error = validateRequired(request.getPassword(), "AUTH-012", "Password is required");
        if (error != null) return error;

        error = validateRequired(request.getRole(), "AUTH-014", "Role is required");
        if (error != null) return error;

        error = validateEmailFormat(request.getEmail());
        if (error != null) return error;

        error = validatePasswordStrength(request.getPassword());
        if (error != null) return error;

        error = validateEmailUniqueness(request.getEmail());
        if (error != null) return error;

        // Role-specific validation: must be LIBRARIAN or ADMIN
        try {
            User.UserRole role = User.UserRole.valueOf(request.getRole().toUpperCase());
            if (role == User.UserRole.USER) {
                return AuthResponse.error("AUTH-015", "Cannot create standard users via this endpoint");
            }
        } catch (IllegalArgumentException e) {
            return AuthResponse.error("AUTH-016", "Invalid role specified");
        }

        return null;
    }
}
