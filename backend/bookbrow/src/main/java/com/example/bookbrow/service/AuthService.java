package com.example.bookbrow.service;

import com.example.bookbrow.dto.AuthResponse;
import com.example.bookbrow.dto.LoginRequest;
import com.example.bookbrow.dto.RegisterRequest;
import com.example.bookbrow.entity.User;
import com.example.bookbrow.repository.UserRepository;
import com.example.bookbrow.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return AuthResponse.error("AUTH-001", "Email is already registered");
        }
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return AuthResponse.error("AUTH-002", "Passwords do not match");
        }
        if (request.getPassword().length() < 8) {
            return AuthResponse.error("AUTH-003", "Password must be at least 8 characters");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.UserRole.USER)
                .build();

        User saved = userRepository.save(user);
        String token = jwtService.generateToken(saved);

        return AuthResponse.success(AuthResponse.UserData.builder()
                .id(saved.getId())
                .email(saved.getEmail())
                .fullName(saved.getFullName())
                .role(saved.getRole().name())
                .token(token)
                .build());
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            return AuthResponse.error("AUTH-101", "Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();
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
