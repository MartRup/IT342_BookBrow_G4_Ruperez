package edu.ruperez.bookbrow.feature.books

import retrofit2.Response
import retrofit2.http.*

/**
 * API service for books endpoints
 */
interface BooksApiService {
    
    @GET("books")
    suspend fun getAllBooks(
        @Header("Authorization") token: String,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("search") search: String? = null,
        @Query("available") available: Boolean? = null
    ): Response<ApiResponse<BooksResponse>>
    
    @GET("books/{id}")
    suspend fun getBook(
        @Header("Authorization") token: String,
        @Path("id") id: Long
    ): Response<ApiResponse<Book>>
    
    @POST("books")
    suspend fun createBook(
        @Header("Authorization") token: String,
        @Body request: BookRequest
    ): Response<ApiResponse<Book>>
    
    @PUT("books/{id}")
    suspend fun updateBook(
        @Header("Authorization") token: String,
        @Path("id") id: Long,
        @Body request: BookRequest
    ): Response<ApiResponse<Book>>
    
    @DELETE("books/{id}")
    suspend fun deleteBook(
        @Header("Authorization") token: String,
        @Path("id") id: Long
    ): Response<ApiResponse<Unit>>
}

data class ApiResponse<T>(
    val success: Boolean,
    val data: T?,
    val message: String?,
    val errorCode: String?
)

data class BooksResponse(
    val books: List<Book>,
    val currentPage: Int,
    val totalPages: Int,
    val totalBooks: Long
)

data class Book(
    val id: Long,
    val title: String,
    val author: String,
    val description: String?,
    val available: Boolean,
    val isbn: String?,
    val genre: String?,
    val coverUrl: String?,
    val createdAt: String,
    val updatedAt: String
)

data class BookRequest(
    val title: String,
    val author: String,
    val description: String?,
    val available: Boolean = true,
    val isbn: String?,
    val genre: String?,
    val coverUrl: String?
)
