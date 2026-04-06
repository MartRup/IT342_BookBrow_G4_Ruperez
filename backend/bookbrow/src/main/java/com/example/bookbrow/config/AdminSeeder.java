package com.example.bookbrow.config;

import com.example.bookbrow.entity.User;
import com.example.bookbrow.factory.UserFactory;
import com.example.bookbrow.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Command line runner that seeds the initial default admin account if it does not exist.
 */
@Component
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserFactory userFactory;

    public AdminSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder, UserFactory userFactory) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userFactory = userFactory;
    }

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@bookbrow.com";
        String adminPassword = "password123";

        Optional<User> existingAdmin = userRepository.findByEmail(adminEmail);
        
        if (existingAdmin.isEmpty()) {
            // Factory Method Pattern: delegate user creation to UserFactory
            User admin = userFactory.createAdmin("System Administrator", adminEmail, adminPassword);
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
