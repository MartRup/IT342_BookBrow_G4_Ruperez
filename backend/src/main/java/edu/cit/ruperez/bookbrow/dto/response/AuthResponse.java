package edu.cit.ruperez.bookbrow.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {

    private boolean success;
    private UserDto data;
    private ErrorDto error;
    private String timestamp;

    @Data
    @Builder
    public static class UserDto {
        private UUID id;
        private String email;
        private String fullName;
        private String role;
        private String token;
    }

    @Data
    @Builder
    public static class ErrorDto {
        private String code;
        private String message;
    }

    public static AuthResponse success(UserDto user) {
        return AuthResponse.builder()
                .success(true)
                .data(user)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    public static AuthResponse error(String code, String message) {
        return AuthResponse.builder()
                .success(false)
                .error(ErrorDto.builder().code(code).message(message).build())
                .timestamp(LocalDateTime.now().toString())
                .build();
    }
}
