package com.example.bookbrow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BookRequest {
    private String title;
    private String author;
    private String description;
    private Boolean available;
    private String isbn;
    private String genre;
    private String coverUrl;
}
