package com.example.bookbrow.config;

import com.example.bookbrow.entity.User;
import com.example.bookbrow.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@bookbrow.com";
        String adminPassword = "password123";

        Optional<User> existingAdmin = userRepository.findByEmail(adminEmail);
        
        if (existingAdmin.isEmpty()) {
            User admin = User.builder()
                .fullName("System Administrator")
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .role(User.UserRole.ADMIN)
                .isActive(true)
                .build();
            userRepository.save(admin);
            System.out.println("✅ DEFAULT ADMIN CREATED successfully.");
        } else {
            // Force-reset the password and active status just in case it was mangled by manual insertion
            User admin = existingAdmin.get();
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(User.UserRole.ADMIN);
            admin.setIsActive(true);
            userRepository.save(admin);
            System.out.println("✅ DEFAULT ADMIN UPDATED (Resynced BCrypt Password & Status).");
        }
        
        System.out.println("=========================================");
        System.out.println("ADMIN LOGIN DETAILS:");
        System.out.println("Username: " + adminEmail);
        System.out.println("Password: " + adminPassword);
        System.out.println("=========================================");
    }
}
