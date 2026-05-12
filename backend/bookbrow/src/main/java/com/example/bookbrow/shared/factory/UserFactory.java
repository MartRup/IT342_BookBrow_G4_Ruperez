package com.example.bookbrow.shared.factory;

import com.example.bookbrow.feature.users.entity.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Factory class for creating User entities (Factory Method Pattern).
 */
@Component
public class UserFactory {

    private final PasswordEncoder passwordEncoder;

    public UserFactory(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    public User createUser(String fullName, String email, String rawPassword,
                           String phone, User.UserRole role) {
        return User.builder()
                .fullName(fullName.trim())
                .email(email.toLowerCase().trim())
                .password(passwordEncoder.encode(rawPassword))
                .phone(phone != null ? phone.trim() : null)
                .role(role)
                .isActive(true)
                .build();
    }

    public User createMember(String fullName, String email, String rawPassword, String phone) {
        return createUser(fullName, email, rawPassword, phone, User.UserRole.USER);
    }

    public User createLibrarian(String fullName, String email, String rawPassword) {
        return createUser(fullName, email, rawPassword, null, User.UserRole.LIBRARIAN);
    }

    public User createAdmin(String fullName, String email, String rawPassword) {
        return createUser(fullName, email, rawPassword, null, User.UserRole.ADMIN);
    }
}
