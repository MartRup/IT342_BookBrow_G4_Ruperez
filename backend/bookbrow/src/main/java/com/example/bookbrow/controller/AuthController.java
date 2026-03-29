package com.example.bookbrow.controller;

import com.example.bookbrow.dto.AuthResponse;
import com.example.bookbrow.dto.LibrarianCreateRequest;
import com.example.bookbrow.dto.LoginRequest;
import com.example.bookbrow.dto.RegisterRequest;
import com.example.bookbrow.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * AuthController – public auth endpoints.
 *
 * POST /api/v1/auth/register          → any visitor (returns MEMBER role)
 * POST /api/v1/auth/login             → any visitor
 * POST /api/v1/auth/librarian         → ADMIN only (creates LIBRARIAN)
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    /**
     * Case 1: Public self-registration.
     * Role is always forced to MEMBER by AuthService – users cannot choose it.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return response.isSuccess()
                ? ResponseEntity.status(HttpStatus.CREATED).body(response)
                : ResponseEntity.badRequest().body(response);
    }

    /**
     * Case 2: Admin creates a Librarian.
     * Secured by @PreAuthorize – only ADMIN JWT tokens are allowed.
     * Role is always forced to LIBRARIAN by AuthService.
     */
    @PostMapping("/librarian")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuthResponse> createLibrarian(@Valid @RequestBody LibrarianCreateRequest request) {
        AuthResponse response = authService.createLibrarian(request);
        return response.isSuccess()
                ? ResponseEntity.status(HttpStatus.CREATED).body(response)
                : ResponseEntity.badRequest().body(response);
    }

    /**
     * Standard login – returns JWT for any active user.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Backend is running on port 8080");
    }
}
