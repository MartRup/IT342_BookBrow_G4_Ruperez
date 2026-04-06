package com.example.bookbrow.service;

import com.example.bookbrow.dto.AuthResponse;
import com.example.bookbrow.dto.LibrarianCreateRequest;
import com.example.bookbrow.dto.PrivilegedUserCreateRequest;
import com.example.bookbrow.dto.LoginRequest;
import com.example.bookbrow.dto.RegisterRequest;
import com.example.bookbrow.entity.User;
import com.example.bookbrow.factory.UserFactory;
import com.example.bookbrow.repository.UserRepository;
import com.example.bookbrow.security.JwtService;
import com.example.bookbrow.validation.LibrarianCreationValidator;
import com.example.bookbrow.validation.PrivilegedUserValidator;
import com.example.bookbrow.validation.RegistrationValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

/**
 * Service handling all registration, login, and account creation flows.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // ── Design Pattern: Factory Method ──
    private final UserFactory userFactory;

    // ── Design Pattern: Strategy ──
    private final RegistrationValidator registrationValidator;
    private final LibrarianCreationValidator librarianValidator;
    private final PrivilegedUserValidator privilegedValidator;

    // ──────────────────────────────────────────────────────────────────
    // Case 1: User (Borrower) self-registration
    // ──────────────────────────────────────────────────────────────────
    public AuthResponse register(RegisterRequest request) {

        // Strategy Pattern: delegate validation to RegistrationValidator
        AuthResponse validationError = registrationValidator.validate(request);
        if (validationError != null) return validationError;

        // Factory Method: delegate user creation to UserFactory
        User user = userFactory.createMember(
                request.getFullName(),
                request.getEmail(),
                request.getPassword(),
                request.getPhone()
        );

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
    // ──────────────────────────────────────────────────────────────────
    public AuthResponse createLibrarian(LibrarianCreateRequest request) {

        // Strategy Pattern: delegate validation to LibrarianCreationValidator
        AuthResponse validationError = librarianValidator.validate(request);
        if (validationError != null) return validationError;

        // Factory Method: delegate user creation to UserFactory
        User librarian = userFactory.createLibrarian(
                request.getFullName(),
                request.getEmail(),
                request.getPassword()
        );

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

        // Strategy Pattern: delegate validation to PrivilegedUserValidator
        AuthResponse validationError = privilegedValidator.validate(request);
        if (validationError != null) return validationError;

        User.UserRole designatedRole = User.UserRole.valueOf(request.getRole().toUpperCase());

        // Factory Method: delegate user creation to UserFactory
        User privUser = userFactory.createUser(
                request.getFullName(),
                request.getEmail(),
                request.getPassword(),
                null,
                designatedRole
        );

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
    // Login (unchanged — no duplication issue here)
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
}
