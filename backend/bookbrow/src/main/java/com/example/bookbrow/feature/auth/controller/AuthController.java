package com.example.bookbrow.feature.auth.controller;

import com.example.bookbrow.feature.auth.dto.AuthResponse;
import com.example.bookbrow.feature.auth.dto.LibrarianCreateRequest;
import com.example.bookbrow.feature.auth.dto.PrivilegedUserCreateRequest;
import com.example.bookbrow.feature.auth.dto.LoginRequest;
import com.example.bookbrow.feature.auth.dto.RegisterRequest;
import com.example.bookbrow.feature.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return response.isSuccess()
                ? ResponseEntity.status(HttpStatus.CREATED).body(response)
                : ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/librarian")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuthResponse> createLibrarian(@Valid @RequestBody LibrarianCreateRequest request) {
        AuthResponse response = authService.createLibrarian(request);
        return response.isSuccess()
                ? ResponseEntity.status(HttpStatus.CREATED).body(response)
                : ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/privileged")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuthResponse> createPrivilegedUser(@Valid @RequestBody PrivilegedUserCreateRequest request) {
        AuthResponse response = authService.createPrivilegedUser(request);
        return response.isSuccess()
                ? ResponseEntity.status(HttpStatus.CREATED).body(response)
                : ResponseEntity.badRequest().body(response);
    }

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
