package com.example.bookbrow.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {

    private boolean success;
    private UserData data;
    private ErrorData error;
    private String timestamp;

    @Data
    @Builder
    public static class UserData {
        private Long id;
        private String email;
        private String fullName;
        private String role;
        private String token;
        private String message;   // e.g. "Registration successful"
    }

    @Data
    @Builder
    public static class ErrorData {
        private String code;
        private String message;
    }

    public static AuthResponse success(UserData data) {
        return AuthResponse.builder()
                .success(true)
                .data(data)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    public static AuthResponse error(String code, String message) {
        return AuthResponse.builder()
                .success(false)
                .error(ErrorData.builder().code(code).message(message).build())
                .timestamp(LocalDateTime.now().toString())
                .build();
    }
}
