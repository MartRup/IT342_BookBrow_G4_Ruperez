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
public class UserDetailsDto {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String about;
    private String role;
    private Boolean isActive;
    private LocalDateTime joinedDate;
    private Integer booksBorrowed;
    private Integer activeLoans;

    public static UserDetailsDto from(User user, Integer booksBorrowed, Integer activeLoans) {
        return UserDetailsDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .about(user.getAbout())
                .role(user.getRole().name())
                .isActive(user.getIsActive())
                .joinedDate(user.getCreatedAt())
                .booksBorrowed(booksBorrowed)
                .activeLoans(activeLoans)
                .build();
    }
}
