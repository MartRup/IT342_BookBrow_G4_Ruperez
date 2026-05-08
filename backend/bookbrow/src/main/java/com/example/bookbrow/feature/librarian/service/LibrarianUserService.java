package com.example.bookbrow.feature.librarian.service;

import com.example.bookbrow.feature.borrow.entity.BorrowRecord;
import com.example.bookbrow.feature.borrow.repository.BorrowRecordRepository;
import com.example.bookbrow.feature.librarian.dto.UpdateUserRequest;
import com.example.bookbrow.feature.librarian.dto.UserDetailsDto;
import com.example.bookbrow.feature.librarian.dto.UserListDto;
import com.example.bookbrow.feature.users.entity.User;
import com.example.bookbrow.feature.users.repository.UserRepository;
import com.example.bookbrow.shared.dto.ResponseBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class LibrarianUserService {

    private final UserRepository userRepository;
    private final BorrowRecordRepository borrowRecordRepository;

    public ResponseEntity<?> getAllUsers(int page, int limit, String search, String role) {
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());
        Page<User> userPage;

        if (search != null && !search.isBlank()) {
            userPage = userRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                    search, search, pageable);
        } else if (role != null && !role.isBlank()) {
            try {
                User.UserRole userRole = User.UserRole.valueOf(role.toUpperCase());
                userPage = userRepository.findByRole(userRole, pageable);
            } catch (IllegalArgumentException e) {
                return ResponseBuilder.badRequest("VALID-001", "Invalid role: " + role);
            }
        } else {
            userPage = userRepository.findAll(pageable);
        }

        List<UserListDto> users = userPage.getContent().stream()
                .map(UserListDto::from)
                .toList();

        Map<String, Object> data = Map.of(
                "users", users,
                "pagination", Map.of(
                        "page", page,
                        "limit", limit,
                        "total", userPage.getTotalElements(),
                        "pages", userPage.getTotalPages()
                )
        );

        return ResponseBuilder.ok(data);
    }

    public ResponseEntity<?> getUserDetails(Long userId) {
        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> {
                    Integer totalBorrowed = borrowRecordRepository.countByUser(user);
                    Integer activeLoans = borrowRecordRepository.countByUserAndStatus(
                            user, BorrowRecord.BorrowStatus.APPROVED);

                    UserDetailsDto dto = UserDetailsDto.from(user, totalBorrowed, activeLoans);
                    return ResponseBuilder.okWith("user", dto);
                })
                .orElse(ResponseBuilder.notFound("USER-001", "User not found"));
    }

    @Transactional
    public ResponseEntity<?> updateUser(Long userId, UpdateUserRequest request) {
        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> {
                    if (request.getFullName() != null) {
                        user.setFullName(request.getFullName());
                    }
                    if (request.getEmail() != null) {
                        // Check if email is already taken by another user
                        if (userRepository.existsByEmailAndIdNot(request.getEmail(), userId)) {
                            return ResponseBuilder.badRequest("USER-002", "Email already in use");
                        }
                        user.setEmail(request.getEmail());
                    }
                    if (request.getPhone() != null) {
                        user.setPhone(request.getPhone());
                    }
                    if (request.getAbout() != null) {
                        user.setAbout(request.getAbout());
                    }
                    if (request.getRole() != null) {
                        try {
                            User.UserRole userRole = User.UserRole.valueOf(request.getRole().toUpperCase());
                            user.setRole(userRole);
                        } catch (IllegalArgumentException e) {
                            return ResponseBuilder.badRequest("VALID-001", "Invalid role: " + request.getRole());
                        }
                    }
                    if (request.getIsActive() != null) {
                        user.setIsActive(request.getIsActive());
                    }

                    User updated = userRepository.save(user);
                    log.info("User {} updated by librarian", userId);

                    return ResponseBuilder.okWith("user", UserListDto.from(updated));
                })
                .orElse(ResponseBuilder.notFound("USER-001", "User not found"));
    }

    @Transactional
    public ResponseEntity<?> deactivateUser(Long userId) {
        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> {
                    if (user.getRole() == User.UserRole.ADMIN) {
                        return ResponseBuilder.badRequest("USER-003", "Cannot deactivate admin users");
                    }

                    user.setIsActive(false);
                    userRepository.save(user);
                    log.info("User {} deactivated by librarian", userId);

                    return ResponseBuilder.okWith("message", "User deactivated successfully");
                })
                .orElse(ResponseBuilder.notFound("USER-001", "User not found"));
    }

    @Transactional
    public ResponseEntity<?> activateUser(Long userId) {
        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> {
                    user.setIsActive(true);
                    userRepository.save(user);
                    log.info("User {} activated by librarian", userId);

                    return ResponseBuilder.okWith("message", "User activated successfully");
                })
                .orElse(ResponseBuilder.notFound("USER-001", "User not found"));
    }
}
