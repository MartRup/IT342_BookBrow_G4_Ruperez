package com.example.bookbrow.shared.validation;

import com.example.bookbrow.feature.auth.dto.AuthResponse;
import com.example.bookbrow.feature.auth.dto.RegisterRequest;
import com.example.bookbrow.feature.users.repository.UserRepository;
import org.springframework.stereotype.Component;

/**
 * Validator for user self-registration requests.
 */
@Component
public class RegistrationValidator extends BaseUserValidator
        implements ValidationStrategy<RegisterRequest> {

    public RegistrationValidator(UserRepository userRepository) {
        super(userRepository);
    }

    @Override
    public AuthResponse validate(RegisterRequest request) {
        AuthResponse error;

        // Required fields
        error = validateRequired(request.getFullName(), "AUTH-010", "Full name is required");
        if (error != null) return error;

        error = validateRequired(request.getEmail(), "AUTH-011", "Email is required");
        if (error != null) return error;

        error = validateRequired(request.getPassword(), "AUTH-012", "Password is required");
        if (error != null) return error;

        // Email format
        error = validateEmailFormat(request.getEmail());
        if (error != null) return error;

        // Password strength
        error = validatePasswordStrength(request.getPassword());
        if (error != null) return error;

        // Passwords must match (only for self-registration)
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return AuthResponse.error("AUTH-002", "Passwords do not match");
        }

        // Email uniqueness
        error = validateEmailUniqueness(request.getEmail());
        if (error != null) return error;

        return null; // All validations passed
    }
}
