package com.example.bookbrow.feature.auth.service;

import com.example.bookbrow.feature.auth.dto.AuthResponse;
import com.example.bookbrow.feature.auth.dto.ForgotPasswordRequest;
import com.example.bookbrow.feature.auth.dto.LibrarianCreateRequest;
import com.example.bookbrow.feature.auth.dto.PrivilegedUserCreateRequest;
import com.example.bookbrow.feature.auth.dto.LoginRequest;
import com.example.bookbrow.feature.auth.dto.RegisterRequest;
import com.example.bookbrow.feature.auth.dto.ResetPasswordRequest;
import com.example.bookbrow.feature.users.entity.User;
import com.example.bookbrow.shared.factory.UserFactory;
import com.example.bookbrow.feature.users.repository.UserRepository;
import com.example.bookbrow.shared.security.JwtService;
import com.example.bookbrow.shared.validation.LibrarianCreationValidator;
import com.example.bookbrow.shared.validation.PrivilegedUserValidator;
import com.example.bookbrow.shared.validation.RegistrationValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

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
    private final PasswordEncoder passwordEncoder;

    private final UserFactory userFactory;

    private final RegistrationValidator registrationValidator;
    private final LibrarianCreationValidator librarianValidator;
    private final PrivilegedUserValidator privilegedValidator;

    public AuthResponse register(RegisterRequest request) {

        AuthResponse validationError = registrationValidator.validate(request);
        if (validationError != null) return validationError;

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

    public AuthResponse createLibrarian(LibrarianCreateRequest request) {

        AuthResponse validationError = librarianValidator.validate(request);
        if (validationError != null) return validationError;

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

    public AuthResponse createPrivilegedUser(PrivilegedUserCreateRequest request) {

        AuthResponse validationError = privilegedValidator.validate(request);
        if (validationError != null) return validationError;

        User.UserRole designatedRole = User.UserRole.valueOf(request.getRole().toUpperCase());

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

    public AuthResponse forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        return userRepository.findByEmail(email)
                .map(user -> {
                    String resetToken = UUID.randomUUID().toString();
                    user.setResetPasswordToken(resetToken);
                    user.setResetPasswordTokenExpiresAt(LocalDateTime.now().plusMinutes(30));
                    userRepository.save(user);

                    log.info("Password reset token created for {}", email);

                    return AuthResponse.success(AuthResponse.UserData.builder()
                            .email(email)
                            .resetToken(resetToken)
                            .message("Reset token generated. It expires in 30 minutes.")
                            .build());
                })
                .orElseGet(() -> AuthResponse.success(AuthResponse.UserData.builder()
                        .email(email)
                        .message("If an account exists for this email, a reset link will be available.")
                        .build()));
    }

    public AuthResponse resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetPasswordToken(request.getToken()).orElse(null);

        if (user == null) {
            return AuthResponse.error("AUTH-201", "Invalid or expired reset token");
        }

        LocalDateTime expiresAt = user.getResetPasswordTokenExpiresAt();
        if (expiresAt == null || expiresAt.isBefore(LocalDateTime.now())) {
            user.setResetPasswordToken(null);
            user.setResetPasswordTokenExpiresAt(null);
            userRepository.save(user);
            return AuthResponse.error("AUTH-202", "Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiresAt(null);
        userRepository.save(user);

        log.info("Password reset completed for {}", user.getEmail());

        return AuthResponse.success(AuthResponse.UserData.builder()
                .email(user.getEmail())
                .message("Password reset successful. You can now sign in.")
                .build());
    }
}
