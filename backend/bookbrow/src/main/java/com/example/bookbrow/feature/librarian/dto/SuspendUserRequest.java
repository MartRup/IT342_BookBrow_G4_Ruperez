package com.example.bookbrow.feature.librarian.dto;

import lombok.Data;

@Data
public class SuspendUserRequest {
    private Integer days;
    private String reason;
}
