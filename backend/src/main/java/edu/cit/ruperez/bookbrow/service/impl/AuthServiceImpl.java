package edu.cit.ruperez.bookbrow.service.impl;

import edu.cit.ruperez.bookbrow.dto.request.LoginRequest;
import edu.cit.ruperez.bookbrow.dto.request.RegisterRequest;
import edu.cit.ruperez.bookbrow.dto.response.AuthResponse;
import edu.cit.ruperez.bookbrow.entity.UserProfile;
import edu.cit.ruperez.bookbrow.repository.UserProfileRepository;
import edu.cit.ruperez.bookbrow.security.JwtService;
import edu.cit.ruperez.bookbrow.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userProfileRepository.existsByEmail(request.getEmail())) {
            return AuthResponse.error("AUTH-001", "Email is already registered");
        }
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return AuthResponse.error("AUTH-002", "Passwords do not match");
        }

        var user = UserProfile.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserProfile.Role.USER)
                .build();

        var savedUser = userProfileRepository.save(user);
        var token = jwtService.generateToken(savedUser);

        return AuthResponse.success(AuthResponse.UserDto.builder()
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole().name())
                .token(token)
                .build());
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        var user = userProfileRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        var token = jwtService.generateToken(user);

        return AuthResponse.success(AuthResponse.UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .token(token)
                .build());
    }
}
