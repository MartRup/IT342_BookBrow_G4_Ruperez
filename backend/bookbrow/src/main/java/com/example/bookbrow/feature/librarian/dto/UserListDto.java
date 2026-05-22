package com.example.bookbrow.feature.librarian.dto;

import com.example.bookbrow.feature.users.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserListDto {
    private Long id;
    private String fullName;
    private String email;
    private String role;
    private Boolean isActive;
    private Boolean isBorrowSuspended;
    private LocalDateTime borrowSuspendedUntil;
    private String suspensionReason;
    private Long suspensionRemainingSeconds;

    public static UserListDto from(User user) {
        return UserListDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .isActive(user.getIsActive())
                .isBorrowSuspended(user.isBorrowSuspended())
                .borrowSuspendedUntil(user.getBorrowSuspendedUntil())
                .suspensionReason(user.getSuspensionReason())
                .suspensionRemainingSeconds(user.getSuspensionRemainingSeconds())
                .build();
    }
}
