package edu.ruperez.bookbrow.data.remote.model

import com.google.gson.annotations.SerializedName

/**
 * Book entity matching backend Book model
 */
data class Book(
    @SerializedName("id") val id: Long,
    @SerializedName("title") val title: String,
    @SerializedName("author") val author: String,
    @SerializedName("description") val description: String?,
    @SerializedName("available") val available: Boolean,
    @SerializedName("isbn") val isbn: String?,
    @SerializedName("genre") val genre: String?,
    @SerializedName("coverUrl") val coverUrl: String?,
    @SerializedName("createdAt") val createdAt: String?
)

/**
 * Request body for creating/updating a book
 */
data class BookRequest(
    @SerializedName("title") val title: String,
    @SerializedName("author") val author: String,
    @SerializedName("description") val description: String?,
    @SerializedName("available") val available: Boolean = true,
    @SerializedName("isbn") val isbn: String?,
    @SerializedName("genre") val genre: String?,
    @SerializedName("coverUrl") val coverUrl: String?
)

/**
 * Response wrapper for book operations
 */
data class BookResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("data") val data: BookData?,
    @SerializedName("error") val error: ErrorData?,
    @SerializedName("timestamp") val timestamp: String?
) {
    data class BookData(
        @SerializedName("book") val book: Book?,
        @SerializedName("books") val books: List<Book>?,
        @SerializedName("message") val message: String?,
        @SerializedName("totalBooks") val totalBooks: Int?,
        @SerializedName("currentPage") val currentPage: Int?,
        @SerializedName("totalPages") val totalPages: Int?
    )

    data class ErrorData(
        @SerializedName("code") val code: String?,
        @SerializedName("message") val message: String?
    )
}
