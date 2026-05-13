package com.example.bookbrow.feature.books.dto;

import lombok.Data;

@Data
public class BookRequest {
    private String title;
    private String author;
    private String description;
    private Boolean available;
    private String isbn;
    private String genre;
    private String coverUrl;
}
