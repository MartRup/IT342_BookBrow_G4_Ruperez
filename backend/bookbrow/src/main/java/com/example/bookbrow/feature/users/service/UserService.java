package com.example.bookbrow.feature.users.service;

import com.example.bookbrow.feature.users.entity.User;
import com.example.bookbrow.feature.users.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User createUser(String fullName, String email, String password, User.UserRole role) {
        if (userRepository.existsByEmail(email)) {
            return null;
        }

        User user = User.builder()
                .fullName(fullName)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(role)
                .isActive(true)
                .build();

        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public boolean verifyPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    public User updateUser(Long id, String fullName, String email, User.UserRole role) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (fullName != null) user.setFullName(fullName);
            if (email != null)    user.setEmail(email);
            if (role != null)     user.setRole(role);
            return userRepository.save(user);
        }
        return null;
    }

    public User updateProfile(Long id, String fullName, String phone, String about) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (fullName != null) user.setFullName(fullName);
            if (phone != null)    user.setPhone(phone);
            if (about != null)    user.setAbout(about);
            return userRepository.save(user);
        }
        return null;
    }

    public boolean changePassword(Long id, String currentPassword, String newPassword) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (verifyPassword(currentPassword, user.getPassword())) {
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
                return true;
            }
        }
        return false;
    }

    public void deleteUser(Long id) {
        userRepository.findById(id).ifPresent(userRepository::delete);
    }
}
