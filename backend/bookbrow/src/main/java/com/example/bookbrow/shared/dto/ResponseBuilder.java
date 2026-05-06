package com.example.bookbrow.shared.dto;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

/**
 * Utility class for constructing uniform HTTP responses.
 */
public final class ResponseBuilder {

    private ResponseBuilder() {
        // Utility class — prevent instantiation
    }

    // ── Success responses ────────────────────────────────────────────

    public static <T> ResponseEntity<ApiResponse<T>> ok(T data) {
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    public static <T> ResponseEntity<ApiResponse<T>> created(T data) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(data));
    }

    // ── Error responses ──────────────────────────────────────────────

    public static ResponseEntity<ApiResponse<?>> notFound(String code, String message) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(code, message));
    }

    public static ResponseEntity<ApiResponse<?>> badRequest(String code, String message) {
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(code, message));
    }

    public static ResponseEntity<ApiResponse<?>> forbidden(String code, String message) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(code, message));
    }

    public static ResponseEntity<ApiResponse<?>> unauthorized(String code, String message) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(code, message));
    }

    public static ResponseEntity<ApiResponse<?>> serverError(String code, String message) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(code, message));
    }

    // ── Convenience: wrap data into standard Map structure ───────────

    public static ResponseEntity<ApiResponse<Map<String, Object>>> okWith(String key, Object value) {
        return ok(Map.of(key, value));
    }

    public static ResponseEntity<ApiResponse<Map<String, Object>>> createdWith(String key, Object value) {
        return created(Map.of(key, value));
    }
}
