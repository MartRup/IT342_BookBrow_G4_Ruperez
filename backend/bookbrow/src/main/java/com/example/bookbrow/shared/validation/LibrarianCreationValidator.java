package com.example.bookbrow.shared.validation;

import com.example.bookbrow.feature.auth.dto.AuthResponse;
import com.example.bookbrow.feature.auth.dto.LibrarianCreateRequest;
import com.example.bookbrow.feature.users.repository.UserRepository;
import org.springframework.stereotype.Component;

/**
 * Validator for admin-created librarian accounts.
 */
@Component
public class LibrarianCreationValidator extends BaseUserValidator
        implements ValidationStrategy<LibrarianCreateRequest> {

    public LibrarianCreationValidator(UserRepository userRepository) {
        super(userRepository);
    }

    @Override
    public AuthResponse validate(LibrarianCreateRequest request) {
        AuthResponse error;

        error = validateRequired(request.getFullName(), "AUTH-010", "Full name is required");
        if (error != null) return error;

        error = validateRequired(request.getEmail(), "AUTH-011", "Email is required");
        if (error != null) return error;

        error = validateRequired(request.getPassword(), "AUTH-012", "Password is required");
        if (error != null) return error;

        error = validateEmailFormat(request.getEmail());
        if (error != null) return error;

        error = validatePasswordStrength(request.getPassword());
        if (error != null) return error;

        error = validateEmailUniqueness(request.getEmail());
        if (error != null) return error;

        return null;
    }
}
