package com.example.bookbrow.feature.librarian.dto;

import com.example.bookbrow.feature.users.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    public static UserListDto from(User user) {
        return UserListDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .isActive(user.getIsActive())
                .build();
    }
}
