package com.example.bookbrow.shared.validation;

import com.example.bookbrow.feature.auth.dto.AuthResponse;

/**
 * Common interface for user validation rules.
 *
 * @param <T> the request DTO type to validate
 */
public interface ValidationStrategy<T> {

    /**
     * Validates the given request.
     *
     * @param request the DTO to validate
     * @return null if validation passes; an AuthResponse error if validation fails
     */
    AuthResponse validate(T request);
}
