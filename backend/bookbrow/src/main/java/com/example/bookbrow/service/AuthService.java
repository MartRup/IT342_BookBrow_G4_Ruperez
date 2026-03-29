package com.example.bookbrow.service;

import com.example.bookbrow.dto.AuthResponse;
import com.example.bookbrow.dto.LibrarianCreateRequest;
import com.example.bookbrow.dto.PrivilegedUserCreateRequest;
import com.example.bookbrow.dto.LoginRequest;
import com.example.bookbrow.dto.RegisterRequest;
import com.example.bookbrow.entity.User;
import com.example.bookbrow.repository.UserRepository;
import com.example.bookbrow.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * AuthService – handles all registration and login flows.
 *
 * Role assignment rules enforced here:
 *  - Self-registration always assigns MEMBER (USER).
 *  - Only ADMIN may create LIBRARIAN accounts (via createLibrarian).
 *  - ADMIN accounts are never created through any API endpoint.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // ──────────────────────────────────────────────────────────────────
    // Case 1: User (Borrower) self-registration
    //  - Role is hard-coded to MEMBER; users cannot choose their role.
    // ──────────────────────────────────────────────────────────────────
    public AuthResponse register(RegisterRequest request) {

        // Required-field check
        if (isBlank(request.getFullName())) {
            return AuthResponse.error("AUTH-010", "Full name is required");
        }
        if (isBlank(request.getEmail())) {
            return AuthResponse.error("AUTH-011", "Email is required");
        }
        if (isBlank(request.getPassword())) {
            return AuthResponse.error("AUTH-012", "Password is required");
        }

        // Email format
        if (!isValidEmail(request.getEmail())) {
            return AuthResponse.error("AUTH-013", "Email format is invalid");
        }

        // Password strength – minimum 8 characters
        if (request.getPassword().length() < 8) {
            return AuthResponse.error("AUTH-003", "Password must be at least 8 characters");
        }

        // Passwords must match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return AuthResponse.error("AUTH-002", "Passwords do not match");
        }

        // Email uniqueness
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            return AuthResponse.error("AUTH-001", "Email is already registered");
        }

        // Build and save the user – role is always MEMBER (USER)
        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .role(User.UserRole.USER)   // ← MEMBER; never user-supplied
                .isActive(true)
                .build();

        User saved = userRepository.save(user);
        log.info("New borrower registered: {}", saved.getEmail());

        String token = jwtService.generateToken(saved);

        return AuthResponse.success(AuthResponse.UserData.builder()
                .id(saved.getId())
                .email(saved.getEmail())
                .fullName(saved.getFullName())
                .role(saved.getRole().name())
                .token(token)
                .message("Registration successful")
                .build());
    }

    // ──────────────────────────────────────────────────────────────────
    // Case 2: Admin creates a Librarian account
    //  - The calling controller already enforces @PreAuthorize("hasRole('ADMIN')")
    //  - Role is hard-coded to LIBRARIAN here.
    // ──────────────────────────────────────────────────────────────────
    public AuthResponse createLibrarian(LibrarianCreateRequest request) {

        // Required-field check
        if (isBlank(request.getFullName())) {
            return AuthResponse.error("AUTH-010", "Full name is required");
        }
        if (isBlank(request.getEmail())) {
            return AuthResponse.error("AUTH-011", "Email is required");
        }
        if (isBlank(request.getPassword())) {
            return AuthResponse.error("AUTH-012", "Password is required");
        }

        // Email format
        if (!isValidEmail(request.getEmail())) {
            return AuthResponse.error("AUTH-013", "Email format is invalid");
        }

        // Password strength
        if (request.getPassword().length() < 8) {
            return AuthResponse.error("AUTH-003", "Password must be at least 8 characters");
        }

        // Email uniqueness
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            return AuthResponse.error("AUTH-001", "Email is already registered");
        }

        // Build and save – role is always LIBRARIAN
        User librarian = User.builder()
                .fullName(request.getFullName().trim())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.UserRole.LIBRARIAN)  // ← always LIBRARIAN
                .isActive(true)
                .build();

        User saved = userRepository.save(librarian);
        log.info("Librarian account created by admin: {}", saved.getEmail());

        return AuthResponse.success(AuthResponse.UserData.builder()
                .id(saved.getId())
                .email(saved.getEmail())
                .fullName(saved.getFullName())
                .role(saved.getRole().name())
                .message("Librarian created successfully")
                .build());
    }

    // ──────────────────────────────────────────────────────────────────
    // Case 3: Admin creates a Privileged account (Admin or Librarian)
    // ──────────────────────────────────────────────────────────────────
    public AuthResponse createPrivilegedUser(PrivilegedUserCreateRequest request) {

        // Required-field check
        if (isBlank(request.getFullName())) {
            return AuthResponse.error("AUTH-010", "Full name is required");
        }
        if (isBlank(request.getEmail())) {
            return AuthResponse.error("AUTH-011", "Email is required");
        }
        if (isBlank(request.getPassword())) {
            return AuthResponse.error("AUTH-012", "Password is required");
        }
        if (isBlank(request.getRole())) {
            return AuthResponse.error("AUTH-014", "Role is required");
        }

        // Email format
        if (!isValidEmail(request.getEmail())) {
            return AuthResponse.error("AUTH-013", "Email format is invalid");
        }

        // Password strength
        if (request.getPassword().length() < 8) {
            return AuthResponse.error("AUTH-003", "Password must be at least 8 characters");
        }

        // Email uniqueness
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            return AuthResponse.error("AUTH-001", "Email is already registered");
        }

        // Validate Role (must be LIBRARIAN or ADMIN)
        User.UserRole designatedRole;
        try {
            designatedRole = User.UserRole.valueOf(request.getRole().toUpperCase());
            if (designatedRole == User.UserRole.USER) {
                return AuthResponse.error("AUTH-015", "Cannot create standard users via this endpoint");
            }
        } catch (IllegalArgumentException e) {
            return AuthResponse.error("AUTH-016", "Invalid role specified");
        }

        // Build and save
        User privUser = User.builder()
                .fullName(request.getFullName().trim())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(designatedRole)
                .isActive(true)
                .build();

        User saved = userRepository.save(privUser);
        log.info("Privileged account created by admin: {} with role: {}", saved.getEmail(), designatedRole);

        return AuthResponse.success(AuthResponse.UserData.builder()
                .id(saved.getId())
                .email(saved.getEmail())
                .fullName(saved.getFullName())
                .role(saved.getRole().name())
                .message(designatedRole + " account created successfully")
                .build());
    }

    // ──────────────────────────────────────────────────────────────────
    // Login
    // ──────────────────────────────────────────────────────────────────
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail().toLowerCase().trim(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            return AuthResponse.error("AUTH-101", "Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));

        if (!user.isEnabled()) {
            return AuthResponse.error("AUTH-102", "Account is deactivated");
        }

        String token = jwtService.generateToken(user);

        return AuthResponse.success(AuthResponse.UserData.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .token(token)
                .build());
    }

    // ──────────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────────
    private static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private static boolean isValidEmail(String email) {
        return email != null && email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    }
}
