package com.example.bookbrow.feature.users.controller;

import com.example.bookbrow.feature.users.entity.User;
import com.example.bookbrow.feature.users.repository.UserRepository;
import com.example.bookbrow.feature.users.service.UserService;
import com.example.bookbrow.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;

    /** GET /api/v1/users — ADMIN only */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "1")  int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false)    String role
    ) {
        var pageable = PageRequest.of(page - 1, limit);
        Page<User> userPage;

        if (role != null) {
            try {
                User.UserRole userRole = User.UserRole.valueOf(role.toUpperCase());
                userPage = userRepository.findByRole(userRole, pageable);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("VALID-001", "Invalid role: " + role));
            }
        } else {
            userPage = userRepository.findAll(pageable);
        }

        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "users", userPage.getContent(),
                "pagination", Map.of(
                        "page", page, "limit", limit,
                        "total", userPage.getTotalElements(),
                        "pages", userPage.getTotalPages()
                )
        )));
    }

    /** PUT /api/v1/users/{id}/role — ADMIN */
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String role = body.get("role");
        try {
            User.UserRole userRole = User.UserRole.valueOf(role.toUpperCase());
            User updated = userService.updateUser(id, null, null, userRole);
            if (updated == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("USER-001", "User not found"));
            }
            return ResponseEntity.ok(ApiResponse.success(Map.of("user", Map.of(
                    "id", updated.getId(),
                    "email", updated.getEmail(),
                    "role", updated.getRole().name()
            ))));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("VALID-001", "Invalid role: " + role));
        }
    }

    /** DELETE /api/v1/users/{id} — ADMIN */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("USER-001", "User not found"));
        }
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(Map.of("message", "User deleted successfully")));
    }

    /** PUT /api/v1/users/profile — Authenticated */
    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body, Principal principal) {
        String email = principal.getName();
        return userRepository.findByEmail(email).map(user -> {
            userService.updateProfile(
                user.getId(),
                body.get("fullName"),
                body.get("phone"),
                body.get("about")
            );
            return ResponseEntity.ok(ApiResponse.success(Map.of("message", "Profile updated successfully")));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("USER-001", "User not found")));
    }

    /** PUT /api/v1/users/password — Authenticated */
    @PutMapping("/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body, Principal principal) {
        String email = principal.getName();
        return userRepository.findByEmail(email).map(user -> {
            boolean success = userService.changePassword(
                user.getId(),
                body.get("currentPassword"),
                body.get("newPassword")
            );
            if (success) {
                return ResponseEntity.ok(ApiResponse.success(Map.of("message", "Password changed successfully")));
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error("AUTH-001", "Incorrect current password"));
            }
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("USER-001", "User not found")));
    }

    /** DELETE /api/v1/users/account — Authenticated (Self Delete) */
    @DeleteMapping("/account")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteAccount(Principal principal) {
        String email = principal.getName();
        return userRepository.findByEmail(email).map(user -> {
            userService.deleteUser(user.getId());
            return ResponseEntity.ok(ApiResponse.success(Map.of("message", "Account deleted successfully")));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("USER-001", "User not found")));
    }
}
