package edu.ruperez.bookbrow.data.repository

import edu.ruperez.bookbrow.shared.RetrofitClient
import edu.ruperez.bookbrow.data.remote.model.BookRequest
import edu.ruperez.bookbrow.data.remote.model.BookResponse
import retrofit2.Response

/**
 * Repository for book-related operations
 */
class BookRepository {

    private val api = RetrofitClient.bookApiService

    suspend fun getAllBooks(
        token: String,
        page: Int = 1,
        limit: Int = 20,
        search: String? = null,
        available: Boolean? = null
    ): Response<BookResponse> {
        return api.getAllBooks("Bearer $token", page, limit, search, available)
    }

    suspend fun getBookById(token: String, bookId: Long): Response<BookResponse> {
        return api.getBookById("Bearer $token", bookId)
    }

    suspend fun createBook(token: String, request: BookRequest): Response<BookResponse> {
        return api.createBook("Bearer $token", request)
    }

    suspend fun updateBook(token: String, bookId: Long, request: BookRequest): Response<BookResponse> {
        return api.updateBook("Bearer $token", bookId, request)
    }

    suspend fun deleteBook(token: String, bookId: Long): Response<BookResponse> {
        return api.deleteBook("Bearer $token", bookId)
    }
}
