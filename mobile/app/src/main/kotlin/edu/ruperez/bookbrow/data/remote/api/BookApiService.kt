package edu.ruperez.bookbrow.data.remote.api

import edu.ruperez.bookbrow.data.remote.model.BookRequest
import edu.ruperez.bookbrow.data.remote.model.BookResponse
import retrofit2.Response
import retrofit2.http.*

/**
 * Retrofit API interface for book-related endpoints
 */
interface BookApiService {

    /**
     * GET /api/v1/books
     * Fetch all books with optional filters
     */
    @GET("books")
    suspend fun getAllBooks(
        @Header("Authorization") token: String,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("search") search: String? = null,
        @Query("available") available: Boolean? = null
    ): Response<BookResponse>

    /**
     * GET /api/v1/books/{id}
     * Fetch a single book by ID
     */
    @GET("books/{id}")
    suspend fun getBookById(
        @Header("Authorization") token: String,
        @Path("id") bookId: Long
    ): Response<BookResponse>

    /**
     * POST /api/v1/books
     * Create a new book (ADMIN/LIBRARIAN only)
     */
    @POST("books")
    suspend fun createBook(
        @Header("Authorization") token: String,
        @Body request: BookRequest
    ): Response<BookResponse>

    /**
     * PUT /api/v1/books/{id}
     * Update an existing book (ADMIN/LIBRARIAN only)
     */
    @PUT("books/{id}")
    suspend fun updateBook(
        @Header("Authorization") token: String,
        @Path("id") bookId: Long,
        @Body request: BookRequest
    ): Response<BookResponse>

    /**
     * DELETE /api/v1/books/{id}
     * Delete a book (ADMIN/LIBRARIAN only)
     */
    @DELETE("books/{id}")
    suspend fun deleteBook(
        @Header("Authorization") token: String,
        @Path("id") bookId: Long
    ): Response<BookResponse>
}
