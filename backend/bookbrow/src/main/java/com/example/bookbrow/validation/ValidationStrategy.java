package com.example.bookbrow.validation;

import com.example.bookbrow.dto.AuthResponse;

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
